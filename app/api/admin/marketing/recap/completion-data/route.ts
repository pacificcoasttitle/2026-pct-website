/**
 * GET /api/admin/marketing/recap/completion-data?from={ISO}&to={ISO}
 *
 * Stage I2 data endpoint for the calendar's completion card. Serves the
 * two item sets the card needs in ONE round-trip:
 *
 *   range_items    — active items in [from, to] WITH recurrence expanded
 *                    (one row per occurrence). Feeds the four tile counts
 *                    via computeCompletionReport (I1).
 *   slippage_items — overdue planned items: status='planned' AND
 *                    scheduled_date < today PT AND recurrence_pattern
 *                    ='none'. Global (no date range).
 *
 * SLIPPAGE RESTRICTION: Slippage detection currently considers
 * NON-RECURRING planned items only. A recurring rule's anchor date being
 * in the past does not mean "an occurrence is overdue" — each occurrence
 * is its own concern, and we don't expand historical occurrences here.
 * Recurring occurrence slippage is a future polish (would require
 * expanding past windows). For now: non-recurring planned past items.
 *
 * DATE RULE (established G → I1): ISO string comparison only. PT-anchored
 * "today" via Intl en-CA / America/Los_Angeles. Never new Date('YYYY-MM-
 * DD') (UTC-midnight trap in negative-offset zones).
 *
 * Read-only. Same requireApiRole('marketing') gate as the other recap routes.
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireApiRole } from '@/lib/auth/guards'
import { getUpcomingItems } from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const QuerySchema = z.object({
  from: z.string().regex(DATE_RE, 'from must use YYYY-MM-DD format'),
  to:   z.string().regex(DATE_RE, 'to must use YYYY-MM-DD format'),
})

/** PT-anchored today as YYYY-MM-DD (en-CA yields that shape). */
function pacificTodayISO(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year:     'numeric',
    month:    '2-digit',
    day:      '2-digit',
  }).format(new Date())
}

export async function GET(req: NextRequest) {
  const auth = await requireApiRole('marketing')
  if ('error' in auth) return auth.error

  const parsed = QuerySchema.safeParse({
    from: req.nextUrl.searchParams.get('from'),
    to:   req.nextUrl.searchParams.get('to'),
  })
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:   'Invalid request',
        details: parsed.error.issues.map((i) => `${i.path.join('.') || 'query'}: ${i.message}`),
      },
      { status: 400 },
    )
  }
  const { from, to } = parsed.data

  try {
    const todayISO = pacificTodayISO()

    // 1. In-range items, recurrence expanded → tile counts.
    // 2. All active items (anchors only, no expansion) → slippage source.
    const [range_items, allActive] = await Promise.all([
      getUpcomingItems({ fromDate: from, toDate: to, activeOnly: true, expandRecurring: true }),
      getUpcomingItems({ activeOnly: true }),
    ])

    // Slippage: non-recurring planned items whose date has passed (PT).
    const slippage_items = allActive.filter(
      (i) =>
        i.status === 'planned' &&
        i.scheduled_date < todayISO &&
        (i.recurrence_pattern == null || i.recurrence_pattern === 'none'),
    )

    return NextResponse.json({ range_items, slippage_items })
  } catch (err) {
    console.error('[recap-completion-data] fetch failed:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
