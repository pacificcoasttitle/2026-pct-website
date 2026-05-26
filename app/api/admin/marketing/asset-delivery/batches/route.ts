/**
 * /api/admin/marketing/asset-delivery/batches
 *
 * GET  — list recent batches for the Asset Delivery hub.
 *        Query params: ?status=draft|ready|sending|sent|failed|archived
 *                      ?limit=N (default 20, max 200)
 *
 * POST — create a new draft batch and return the generated batch_id.
 *        Body: { campaign_name, campaign_slug, lane?, email_subject, description? }
 *        The wizard immediately transitions to Step 2 (upload) using the
 *        returned batch_id, so this must succeed fast and never partially
 *        write.
 *
 * Note: `description` is accepted but not persisted — the schema doesn't
 * have a description column today. The wizard keeps the description in
 * local state and passes it to the AI intro endpoint at preview time.
 */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import {
  isAuthenticated,
  verifyAdminToken,
  ADMIN_COOKIE,
} from '@/lib/admin-auth'
import {
  createAssetDeliveryBatch,
  getAllAssetDeliveryBatches,
  type AssetDeliveryBatchStatus,
} from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SLUG_RE   = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const VALID_STATUSES = new Set<AssetDeliveryBatchStatus>([
  'draft', 'ready', 'sending', 'sent', 'failed', 'archived',
])

const CreateBodySchema = z.object({
  campaign_name: z.string().trim().min(2).max(200),
  campaign_slug: z.string().trim().min(2).max(120).regex(
    SLUG_RE,
    'Slug must be lowercase letters, numbers, and hyphens only',
  ),
  lane:          z.string().trim().max(60).optional().nullable(),
  email_subject: z.string().trim().min(2).max(300),
  description:   z.string().trim().max(2000).optional().nullable(),
})

async function getActorEmail(): Promise<string> {
  try {
    const jar   = await cookies()
    const token = jar.get(ADMIN_COOKIE)?.value
    if (!token) return 'unknown'
    const session = await verifyAdminToken(token)
    return session?.username || 'unknown'
  } catch {
    return 'unknown'
  }
}

/* ─── GET ──────────────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const statusRaw = req.nextUrl.searchParams.get('status') || ''
  const limitRaw  = req.nextUrl.searchParams.get('limit')  || ''

  const status: AssetDeliveryBatchStatus | undefined =
    VALID_STATUSES.has(statusRaw as AssetDeliveryBatchStatus)
      ? (statusRaw as AssetDeliveryBatchStatus)
      : undefined

  const parsedLimit = parseInt(limitRaw, 10)
  const limit       = Number.isFinite(parsedLimit) && parsedLimit > 0
    ? Math.min(parsedLimit, 200)
    : 20

  try {
    const batches = await getAllAssetDeliveryBatches({ status, limit })
    return NextResponse.json({ batches })
  } catch (err) {
    console.error('[asset-batches] list failed:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

/* ─── POST ─────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const adminEmail = await getActorEmail()

  let body: z.infer<typeof CreateBodySchema>
  try {
    const raw = await req.json()
    body = CreateBodySchema.parse(raw)
  } catch (err) {
    const issues = err instanceof z.ZodError
      ? err.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`)
      : ['Invalid JSON body']
    return NextResponse.json({ error: 'Invalid request', details: issues }, { status: 400 })
  }

  try {
    const batch = await createAssetDeliveryBatch(
      {
        campaign_slug: body.campaign_slug,
        campaign_name: body.campaign_name,
        lane:          body.lane ?? null,
        email_subject: body.email_subject,
        status:        'draft',
      },
      adminEmail,
    )

    console.log(
      `[asset-batches] admin=${adminEmail} created batch=${batch.batch_id} slug=${batch.campaign_slug}`,
    )

    return NextResponse.json({ batch })
  } catch (err) {
    console.error('[asset-batches] create failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Database error' },
      { status: 500 },
    )
  }
}
