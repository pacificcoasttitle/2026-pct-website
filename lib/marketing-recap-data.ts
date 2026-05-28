/**
 * Marketing Recap Data Shaper
 *
 * Pure function that produces MarketingRecapContext from the database.
 * Called by:
 *   - app/api/admin/marketing/recap/generate-draft/route.ts (Phase C3)
 *   - app/api/cron/marketing-recap/route.ts (Phase E)
 *
 * Consumes data from:
 *   - asset_delivery_batches + asset_delivery_sends (last week's activity)
 *   - marketing_upcoming (next week's planned items)
 *
 * Returns the frozen contract shape from types/marketing-recap.ts.
 *
 * CRITICAL: All date boundaries are Pacific-time anchored. The cron
 * fires at 16:00 UTC Monday, but "last week" means Mon 00:00 PT to
 * Sun 23:59 PT. PT-anchored ISO dates are computed in JS and passed
 * as parameters to SQL.
 */

import { getPool, getUpcomingItems } from '@/lib/admin-db'
import type {
  MarketingRecapContext,
  RecapBatchSummary,
  RecapUpcomingItem,
  RecapNumbers,
} from '@/types/marketing-recap'

// ───── Lane label mapping ─────
// Maps DB slugs (marketing_upcoming.lane / asset_delivery_batches.lane)
// to display-friendly labels for the email.

const LANE_LABELS: Record<string, string> = {
  'marketing-piece': 'Marketing Piece',
  'social':          'Social',
  'weekly-email':    'Weekly Email',
  'other':           'Other',
}

function laneLabel(slug: string | null | undefined): string {
  if (!slug) return 'Other'
  return LANE_LABELS[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')
}

// ───── Pacific-time date utilities ─────
// Computes calendar-day boundaries in America/Los_Angeles regardless of
// the server's TZ (Vercel = UTC). We never use UTC arithmetic for "week"
// boundaries because the operator's notion of "last week" is PT-relative.

/**
 * Returns the ISO date string (YYYY-MM-DD) for a given Date in PT.
 */
function toPacificISODate(d: Date): string {
  // Intl.DateTimeFormat with PT timezone gives us the PT calendar day
  // regardless of input. en-CA locale conveniently returns YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year:     'numeric',
    month:    '2-digit',
    day:      '2-digit',
  }).format(d)
}

/**
 * Given a Monday in PT, returns ISO dates for the previous week
 * (Mon to Sun, 7 days, ending the day before the input Monday).
 */
function lastWeekBoundsPT(mondayPT: Date): { start: string; end: string } {
  const start = new Date(mondayPT)
  start.setDate(start.getDate() - 7)
  const end = new Date(mondayPT)
  end.setDate(end.getDate() - 1)
  return {
    start: toPacificISODate(start),
    end:   toPacificISODate(end),
  }
}

/**
 * Given a Monday in PT, returns ISO dates for the next week
 * (Mon to Sun, 7 days, starting on the input Monday).
 */
function nextWeekBoundsPT(mondayPT: Date): { start: string; end: string } {
  const start = mondayPT
  const end   = new Date(mondayPT)
  end.setDate(end.getDate() + 6)
  return {
    start: toPacificISODate(start),
    end:   toPacificISODate(end),
  }
}

/**
 * Builds a human-readable week range label for the email header.
 * Example: "May 19 to May 25, 2026"
 */
function weekRangeLabel(startISO: string, endISO: string): string {
  // Parse component-wise to avoid UTC drift on bare YYYY-MM-DD parsing.
  const [sy, sm, sd] = startISO.split('-').map(Number)
  const [ey, em, ed] = endISO.split('-').map(Number)
  const startDate = new Date(sy, sm - 1, sd)
  const endDate   = new Date(ey, em - 1, ed)
  const monthDay  = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' })
  const startLabel = monthDay.format(startDate)
  const endLabel   = monthDay.format(endDate)
  return `${startLabel} to ${endLabel}, ${ey}`
}

/**
 * Builds a short date display for batch/item rows.
 * Example: "Wed, May 21"
 */
function shortDateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
  }).format(date)
}

/**
 * Builds the subject line for the recap email.
 * Example: "Marketing Weekly — Week of May 19, 2026"
 */
function buildSubject(lastWeekStartISO: string): string {
  const [y, m, d] = lastWeekStartISO.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const label = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day:   'numeric',
    year:  'numeric',
  }).format(date)
  return `Marketing Weekly — Week of ${label}`
}

// ───── Main data shaper function ─────

/**
 * Builds the MarketingRecapContext for a given recap week.
 *
 * @param mondayPT - The Monday (in Pacific time) of the recap WEEK.
 *                   "Last week" = the 7 days BEFORE this Monday.
 *                   "Next week" = this Monday plus 6 days.
 *
 * Typical usage:
 *   - Cron fires Monday 16:00 UTC = ~Monday 8 AM PT
 *   - mondayPT = today (the Monday that just started in PT)
 *   - Last week = previous Mon-Sun
 *   - Next week = today through this coming Sunday
 */
export async function buildMarketingRecapContext(
  mondayPT: Date,
): Promise<MarketingRecapContext> {
  const last = lastWeekBoundsPT(mondayPT)
  const next = nextWeekBoundsPT(mondayPT)

  const db = getPool()

  // ───── Query 1: Asset Delivery batches sent last week ─────
  // Joins with sends to compute success/failure counts per batch.
  // Excludes is_test sends from all aggregates.
  // ::int casts prevent BIGINT-as-string issues.

  const batchesResult = await db.query(
    `
    SELECT
      b.batch_id,
      b.campaign_name,
      b.lane,
      b.sent_at,
      b.total_recipients,
      b.total_files,
      b.total_bytes,
      b.description,
      COUNT(*) FILTER (
        WHERE s.send_status = 'sent' AND s.is_test = false
      )::int AS successful_sends,
      COUNT(*) FILTER (
        WHERE s.send_status = 'failed' AND s.is_test = false
      )::int AS failed_sends,
      COUNT(*) FILTER (
        WHERE s.is_test = false
      )::int AS real_sends_total
    FROM asset_delivery_batches b
    LEFT JOIN asset_delivery_sends s ON s.batch_id = b.batch_id
    WHERE b.sent_at >= $1::date
      AND b.sent_at < ($2::date + INTERVAL '1 day')
      AND b.status = 'sent'
    GROUP BY b.batch_id, b.campaign_name, b.lane, b.sent_at,
             b.total_recipients, b.total_files, b.total_bytes, b.description
    ORDER BY b.sent_at DESC
    `,
    [last.start, last.end],
  )

  const batches_sent: RecapBatchSummary[] = batchesResult.rows.map((row) => {
    const successful_sends = Number(row.successful_sends) || 0
    const failed_sends     = Number(row.failed_sends)     || 0
    const sentDate         = toPacificISODate(new Date(row.sent_at))

    return {
      campaign_name:    String(row.campaign_name ?? ''),
      lane_label:       laneLabel(row.lane),
      sent_date:        sentDate,
      sent_date_label:  shortDateLabel(sentDate),
      rep_count:        Number(row.total_recipients) || 0,
      file_count:       Number(row.total_files)      || 0,
      successful_sends,
      failed_sends,
      has_failures:     failed_sends > 0,
      description:      String(row.description ?? ''),
    }
  })

  // ───── Query 2: Upcoming items scheduled next week ─────
  // H4: delegated to getUpcomingItems({ expandRecurring: true }) — the
  // single source of truth shared with the calendar/table. It returns
  // non-recurring items in the window PLUS recurring items expanded to
  // one row per occurrence in [next.start, next.end] (active only).
  //
  // Path chosen (vs. inline SQL): calling the helper means the recurrence
  // expander has exactly one caller-facing entry point, and the helper's
  // ensureMarketingRecapTables() guarantees the recurrence columns exist
  // on the cron path. BACKWARD-COMPAT INVARIANT: with no recurring items
  // (production state on the first Monday post-deploy), the helper's
  // recurring query returns nothing and its non-recurring query returns
  // the same rows in the same (scheduled_date, id) order as the prior
  // inline SQL — so this maps to a byte-identical upcoming_items array.
  const upcomingRows = await getUpcomingItems({
    fromDate:        next.start,
    toDate:          next.end,
    activeOnly:      true,
    expandRecurring: true,
  })

  // J1: drop cancelled items from the email. getUpcomingItems'
  // activeOnly filter is the active/inactive flag, NOT the status field
  // — a cancelled item is still "active" (it exists, just won't ship).
  // Filtering here (before the map) means the template never sees a
  // cancelled item, so it needs no cancelled-handling branch. Planned
  // and shipped pass through; the row→item map narrows status to those.
  // BACKWARD-COMPAT: with zero items (current production), this filter
  // is a no-op and upcoming_items stays the same empty array as pre-J1.
  const visibleRows = upcomingRows.filter((row) => row.status !== 'cancelled')

  const upcoming_items: RecapUpcomingItem[] = visibleRows.map((row) => {
    const assetCount = Number(row.asset_count_planned) || 0
    const scheduled  = String(row.scheduled_date).slice(0, 10)
    const isShipped  = row.status === 'shipped'

    return {
      scheduled_date:       scheduled,
      scheduled_date_label: shortDateLabel(scheduled),
      title:                String(row.title ?? ''),
      lane_label:           laneLabel(row.lane),
      description:          String(row.description ?? ''),
      asset_count_planned:  assetCount,
      has_asset_count:      assetCount > 0,
      // Narrowed to 'planned' | 'shipped' (cancelled already filtered).
      status:               isShipped ? 'shipped' : 'planned',
      is_shipped:           isShipped,
    }
  })

  // ───── Compute aggregate "By The Numbers" ─────

  // Sum of total_bytes across batches, coerced to Number from BIGINT string.
  const totalBytes = batchesResult.rows.reduce((acc, row) => {
    return acc + (Number(row.total_bytes) || 0)
  }, 0)

  const totalPayloadMB = Math.round((totalBytes / (1024 * 1024)) * 10) / 10

  const unique_reps_reached = await (async () => {
    if (batches_sent.length === 0) return 0
    // Count distinct rep_emails across all batches' non-test sends in the window.
    const r = await db.query(
      `
      SELECT COUNT(DISTINCT s.rep_email)::int AS unique_reps
      FROM asset_delivery_sends s
      JOIN asset_delivery_batches b ON b.batch_id = s.batch_id
      WHERE b.sent_at >= $1::date
        AND b.sent_at < ($2::date + INTERVAL '1 day')
        AND b.status = 'sent'
        AND s.is_test = false
        AND s.send_status = 'sent'
      `,
      [last.start, last.end],
    )
    return Number(r.rows[0]?.unique_reps) || 0
  })()

  const numbers: RecapNumbers = {
    campaigns_sent:         batches_sent.length,
    unique_reps_reached,
    total_files:            batches_sent.reduce((acc, b) => acc + b.file_count,       0),
    total_payload_mb:       totalPayloadMB,
    total_successful_sends: batches_sent.reduce((acc, b) => acc + b.successful_sends, 0),
    total_failed_sends:     batches_sent.reduce((acc, b) => acc + b.failed_sends,     0),
  }

  // ───── Assemble the context ─────

  const context: MarketingRecapContext = {
    subject:            buildSubject(last.start),
    week_range_label:   weekRangeLabel(last.start, last.end),
    last_week_start:    last.start,
    last_week_end:      last.end,
    next_week_start:    next.start,
    next_week_end:      next.end,
    batches_sent,
    has_batches_sent:   batches_sent.length > 0,
    upcoming_items,
    has_upcoming_items: upcoming_items.length > 0,
    numbers,
  }

  return context
}
