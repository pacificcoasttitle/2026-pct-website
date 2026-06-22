import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireApiRole } from '@/lib/auth/guards'
import {
  OWNER_MAX,
  RECURRENCE_PATTERNS,
  createUpcomingItem,
  getUpcomingItems,
} from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
export const LANES    = ['marketing-piece', 'social', 'weekly-email', 'other'] as const
const STATUSES = ['planned', 'shipped', 'cancelled'] as const

export const CreateBodySchema = z.object({
  scheduled_date:       z.string().regex(DATE_RE, 'Use YYYY-MM-DD format'),
  title:                z.string().trim().min(1).max(200),
  lane:                 z.enum(LANES).optional().default('other'),
  description:          z.string().trim().max(1000).optional().nullable(),
  asset_count_planned:  z.coerce.number().int().min(0).max(9999).optional().nullable(),
  notes:                z.string().trim().max(2000).optional().nullable(),
  status:               z.enum(STATUSES).optional().default('planned'),
  owner:                z.string().max(OWNER_MAX).optional().nullable()
                          .transform((v) => {
                            // Preserve undefined (key absent) so it can't
                            // clobber; normalize null/empty/whitespace → null.
                            if (v === undefined) return undefined
                            if (v == null) return null
                            const t = v.trim()
                            return t === '' ? null : t
                          }),
  asset_delivery_batch_id: z.number().int().positive().optional().nullable(),
  recurrence_pattern:   z.enum(RECURRENCE_PATTERNS).optional().default('none'),
  recurrence_until:     z.string().regex(DATE_RE, 'Use YYYY-MM-DD format').optional().nullable(),
})

function parseDateParam(value: string | null, label: string) {
  if (!value) return undefined
  if (!DATE_RE.test(value)) {
    throw new Error(`${label} must use YYYY-MM-DD format`)
  }
  return value
}

export async function GET(req: NextRequest) {
  const auth = await requireApiRole('marketing')
  if ('error' in auth) return auth.error

  let fromDate: string | undefined
  let toDate: string | undefined
  try {
    fromDate = parseDateParam(req.nextUrl.searchParams.get('from'), 'from')
    toDate = parseDateParam(req.nextUrl.searchParams.get('to'), 'to')
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid date range' },
      { status: 400 },
    )
  }

  const includeInactive = req.nextUrl.searchParams.get('include_inactive') === 'true'
  // H4: the calendar passes expand=true to receive recurring occurrences
  // expanded across the window. The table omits it (rules, one row each).
  const expandRecurring = req.nextUrl.searchParams.get('expand') === 'true'

  try {
    const items = await getUpcomingItems({
      fromDate,
      toDate,
      activeOnly: !includeInactive,
      expandRecurring,
    })
    return NextResponse.json({ items })
  } catch (err) {
    console.error('[recap-upcoming] list failed:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireApiRole('marketing')
  if ('error' in auth) return auth.error
  const adminEmail = auth.session.username || 'unknown'

  let body: z.infer<typeof CreateBodySchema>
  // Track whether the client actually sent a status. The schema applies
  // .default('planned'), so body.status is always defined — but the H3
  // create auto-flip needs to know if status was EXPLICITLY provided
  // (explicit intent wins; absence lets a batch link derive 'shipped').
  let statusWasExplicit = false
  try {
    const raw = await req.json()
    statusWasExplicit =
      raw != null && typeof raw === 'object' && 'status' in raw &&
      (raw as Record<string, unknown>).status != null
    body = CreateBodySchema.parse(raw)
  } catch (err) {
    const details = err instanceof z.ZodError
      ? err.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`)
      : ['Invalid JSON body']
    return NextResponse.json({ error: 'Invalid request', details }, { status: 400 })
  }

  try {
    const item = await createUpcomingItem({
      scheduled_date:       body.scheduled_date,
      title:                body.title,
      lane:                 body.lane,
      description:          body.description ?? null,
      asset_count_planned:  body.asset_count_planned ?? null,
      notes:                body.notes ?? null,
      // Pass status only when the client explicitly sent it; otherwise
      // leave undefined so createUpcomingItem's auto-flip can derive
      // 'shipped' from a batch link (falling back to 'planned').
      status:               statusWasExplicit ? body.status : undefined,
      owner:                body.owner ?? null,
      asset_delivery_batch_id: body.asset_delivery_batch_id ?? null,
      recurrence_pattern:   body.recurrence_pattern,
      recurrence_until:     body.recurrence_until ?? null,
      created_by:           adminEmail,
    })

    console.log(`[recap-upcoming] admin=${adminEmail} created item=${item.id}`)
    return NextResponse.json({ item })
  } catch (err) {
    console.error('[recap-upcoming] create failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Database error' },
      { status: 500 },
    )
  }
}
