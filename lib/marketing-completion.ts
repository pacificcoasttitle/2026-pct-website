/**
 * Marketing completion report (Stage I1).
 *
 * A PURE, dependency-free data layer that answers "are we shipping what
 * we plan?" for a date range. No I/O — the caller pre-fetches rows (via
 * getUpcomingItems) and passes them in. Same architectural shape as the
 * recap shaper and the H4 expander: one pure function, testable in
 * isolation, consumed by one or more callers (I2 builds the UI card).
 *
 * DATE RULE (established G → H4): ISO string comparison only. NEVER
 * new Date('YYYY-MM-DD') — that parses as UTC midnight and shifts the
 * day in negative-offset timezones like PT. Zero-padded YYYY-MM-DD
 * strings compare lexicographically, which is what we use throughout.
 *
 * "Today" is PT-anchored (Intl 'en-CA' / America/Los_Angeles), matching
 * the recap shaper. PT semantics are non-negotiable for this project.
 */

import type { UpcomingItem } from './admin-db'

export interface CompletionReportLaneBreakdown {
  lane: string
  planned: number
  shipped: number
  cancelled: number
}

export interface CompletionReport {
  range: { fromISO: string; toISO: string }
  planned_count: number
  shipped_count: number
  cancelled_count: number
  /** shipped / (planned + shipped); cancelled excluded. null when 0. */
  completion_rate: number | null
  /** Overdue planned items (status='planned' AND date < today PT).
   *  GLOBAL scope — not range-scoped (see module/Part 2 reasoning). */
  slippage: UpcomingItem[]
  by_lane: CompletionReportLaneBreakdown[]
}

type KnownStatus = 'planned' | 'shipped' | 'cancelled'

/** PT-anchored today as YYYY-MM-DD (en-CA conveniently yields that). */
function pacificTodayISO(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year:     'numeric',
    month:    '2-digit',
    day:      '2-digit',
  }).format(new Date())
}

/**
 * Normalize a row's status to a known bucket. Defensive: unknown values
 * are logged and treated as 'planned' — the most conservative choice,
 * since it counts toward the plan but never inflates the shipped
 * numerator of the completion rate.
 */
function coerceStatus(raw: unknown): KnownStatus {
  if (raw === 'planned' || raw === 'shipped' || raw === 'cancelled') return raw
  // eslint-disable-next-line no-console
  console.warn(`[marketing-completion] unknown status "${String(raw)}" — treating as 'planned'`)
  return 'planned'
}

export function computeCompletionReport(args: {
  items: UpcomingItem[]
  slippage_items?: UpcomingItem[]
  fromISO: string
  toISO: string
  todayISO?: string
}): CompletionReport {
  const { items, fromISO, toISO } = args
  const todayISO = args.todayISO ?? pacificTodayISO()

  let planned_count   = 0
  let shipped_count   = 0
  let cancelled_count = 0

  const laneMap = new Map<string, CompletionReportLaneBreakdown>()
  const laneBucket = (lane: string): CompletionReportLaneBreakdown => {
    let entry = laneMap.get(lane)
    if (!entry) {
      entry = { lane, planned: 0, shipped: 0, cancelled: 0 }
      laneMap.set(lane, entry)
    }
    return entry
  }

  // ── Counts pass: only rows whose date falls in [fromISO, toISO] ──
  for (const item of items) {
    if (item.scheduled_date < fromISO || item.scheduled_date > toISO) continue
    const status = coerceStatus(item.status)
    const lane = laneBucket(item.lane || 'other')
    if (status === 'shipped') {
      shipped_count++
      lane.shipped++
    } else if (status === 'cancelled') {
      cancelled_count++
      lane.cancelled++
    } else {
      planned_count++
      lane.planned++
    }
  }

  // ── Slippage pass: GLOBAL (not range-scoped). Decision (ii) — run on
  // the union of items + slippage_items, deduped by id, so an overdue
  // item present in either source is caught (more forgiving, fewer
  // surprises). An item is slipping when it's still 'planned' and its
  // date is strictly before today PT. ──
  const seen = new Set<number>()
  const slippage: UpcomingItem[] = []
  for (const item of [...items, ...(args.slippage_items ?? [])]) {
    if (seen.has(item.id)) continue
    seen.add(item.id)
    if (coerceStatus(item.status) === 'planned' && item.scheduled_date < todayISO) {
      slippage.push(item)
    }
  }

  // ── Completion rate: cancelled excluded from the denominator ──
  const denominator = planned_count + shipped_count
  const completion_rate = denominator === 0 ? null : shipped_count / denominator

  // ── Lane breakdown: drop all-zero lanes (insertion order preserved) ──
  const by_lane = [...laneMap.values()].filter(
    (l) => l.planned !== 0 || l.shipped !== 0 || l.cancelled !== 0,
  )

  return {
    range: { fromISO, toISO },
    planned_count,
    shipped_count,
    cancelled_count,
    completion_rate,
    slippage,
    by_lane,
  }
}
