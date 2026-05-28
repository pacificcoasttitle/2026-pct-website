/**
 * Marketing recurrence expander (Stage H4).
 *
 * A PURE, dependency-free module. Given a recurring item's rule (anchor
 * date + pattern + optional end) and a [from, to] window, it returns the
 * ISO date strings (YYYY-MM-DD) on which the item occurs in that window.
 *
 * ONE expander, two callers:
 *   - lib/admin-db.ts        → calendar + table occurrence expansion
 *   - lib/marketing-recap-data.ts → the Monday recap's "next week" window
 *
 * DATE ARITHMETIC RULE (same as the calendar component, G/G+1/G+2/G+3):
 * always use calendar-parts arithmetic — new Date(y, m-1, d), getDate(),
 * etc. NEVER new Date('YYYY-MM-DD') (it parses as UTC midnight and shifts
 * the day in negative-offset timezones like PT).
 *
 * No I/O, no side effects — fully testable in isolation.
 */

// Canonical recurrence types live here (the pure module with no DB deps).
// lib/admin-db.ts re-exports them so callers can import from either place.
export type RecurrencePattern =
  | 'none' | 'weekly' | 'biweekly' | 'monthly_day' | 'monthly_weekday'

export const RECURRENCE_PATTERNS: readonly RecurrencePattern[] = [
  'none', 'weekly', 'biweekly', 'monthly_day', 'monthly_weekday',
] as const

const WEEKDAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
]
const ORDINALS = ['', '1st', '2nd', '3rd', '4th', '5th']

function pad2(n: number): string { return n < 10 ? `0${n}` : String(n) }

/** YYYY-MM-DD for a calendar Date (reads local parts, never UTC). */
function isoOf(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

/** Parse YYYY-MM-DD into a local calendar Date (no UTC shift). */
function dateOf(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Is `iso` within [fromISO, toISO]? Lexicographic compare is valid for
 *  zero-padded YYYY-MM-DD. */
function inWindow(iso: string, fromISO: string, toISO: string): boolean {
  return iso >= fromISO && iso <= toISO
}

/** 1-based ordinal of `weekday` within its month for a given date.
 *  e.g. the 2nd Tuesday → 2. */
function nthWeekdayOfMonth(d: Date): number {
  return Math.floor((d.getDate() - 1) / 7) + 1
}

/**
 * Date of the Nth `weekday` (0=Sun..6=Sat) in (year, month0). Returns null
 * when that Nth weekday doesn't exist in the month (e.g. a 5th Friday).
 */
function nthWeekdayDate(year: number, month0: number, weekday: number, nth: number): Date | null {
  const first = new Date(year, month0, 1)
  const firstWeekday = first.getDay()
  let offset = weekday - firstWeekday
  if (offset < 0) offset += 7
  const day = 1 + offset + (nth - 1) * 7
  const candidate = new Date(year, month0, day)
  // If day overflowed into the next month, getMonth() differs → invalid.
  if (candidate.getMonth() !== month0) return null
  return candidate
}

export interface ExpandArgs {
  anchorISO: string                  // the item's scheduled_date
  pattern: RecurrencePattern
  untilISO: string | null            // recurrence_until (inclusive) or null
  fromISO: string                    // window start (inclusive)
  toISO: string                      // window end (inclusive)
}

/**
 * Expand a recurrence rule to the ISO dates it generates within
 * [fromISO, toISO]. Occurrences are generated FORWARD from the anchor
 * (the anchor itself is the first occurrence, included if it lands in the
 * window). Honors untilISO as an inclusive upper bound.
 *
 * Unknown patterns fall back to 'none' behavior (defensive — never throws).
 */
export function expandRecurrenceInWindow(args: ExpandArgs): string[] {
  const { anchorISO, pattern, untilISO, fromISO, toISO } = args

  // Effective upper bound = min(window end, recurrence_until).
  const hardEndISO = untilISO && untilISO < toISO ? untilISO : toISO

  // 'none' (and the defensive fallback): the single anchor date, if it's
  // in the window. recurrence_until does not apply to a one-off.
  if (pattern === 'none') {
    return inWindow(anchorISO, fromISO, toISO) ? [anchorISO] : []
  }
  if (
    pattern !== 'weekly' &&
    pattern !== 'biweekly' &&
    pattern !== 'monthly_day' &&
    pattern !== 'monthly_weekday'
  ) {
    // eslint-disable-next-line no-console
    console.warn(`[marketing-recurrence] unknown pattern "${pattern}" — falling back to one-off`)
    return inWindow(anchorISO, fromISO, toISO) ? [anchorISO] : []
  }

  // If the window ends before the anchor, no forward occurrence can land.
  if (toISO < anchorISO) return []

  const anchor = dateOf(anchorISO)
  const out: string[] = []

  if (pattern === 'weekly' || pattern === 'biweekly') {
    const step = pattern === 'weekly' ? 7 : 14
    const cursor = new Date(anchor)
    // Advance forward (k>=0 only) until we reach the window start.
    while (isoOf(cursor) < fromISO) {
      cursor.setDate(cursor.getDate() + step)
    }
    while (true) {
      const iso = isoOf(cursor)
      if (iso > hardEndISO) break
      out.push(iso)
      cursor.setDate(cursor.getDate() + step)
    }
    return out
  }

  // Monthly patterns: iterate month-by-month from the anchor's month
  // forward until we pass the hard end.
  const dayOfMonth = anchor.getDate()
  const weekday    = anchor.getDay()
  const nth        = nthWeekdayOfMonth(anchor)

  let year   = anchor.getFullYear()
  let month0 = anchor.getMonth()
  const endDate = dateOf(hardEndISO)
  const endYM = endDate.getFullYear() * 12 + endDate.getMonth()

  while (year * 12 + month0 <= endYM) {
    let candidate: Date | null = null
    if (pattern === 'monthly_day') {
      const c = new Date(year, month0, dayOfMonth)
      // Skip months where the day-of-month doesn't exist (rollover).
      candidate = c.getDate() === dayOfMonth && c.getMonth() === month0 ? c : null
    } else {
      // monthly_weekday
      candidate = nthWeekdayDate(year, month0, weekday, nth)
    }
    if (candidate) {
      const iso = isoOf(candidate)
      // Forward-only (>= anchor) and within window + hard end.
      if (iso >= anchorISO && inWindow(iso, fromISO, hardEndISO)) {
        out.push(iso)
      }
    }
    month0 += 1
    if (month0 > 11) { month0 = 0; year += 1 }
  }
  return out
}

/**
 * Human-readable description of a recurrence rule, derived from the
 * anchor date (the rule carries no explicit day field — the anchor's
 * weekday / day-of-month defines it). Used by the edit UI and the table.
 */
export function describeRecurrence(pattern: RecurrencePattern, anchorISO: string): string {
  if (pattern === 'none') return 'Does not repeat'
  const d = dateOf(anchorISO)
  const weekdayName = WEEKDAY_NAMES[d.getDay()]
  switch (pattern) {
    case 'weekly':
      return `Every week on ${weekdayName}`
    case 'biweekly':
      return `Every other week on ${weekdayName}`
    case 'monthly_day': {
      const day = d.getDate()
      const suffix =
        day % 10 === 1 && day !== 11 ? 'st' :
        day % 10 === 2 && day !== 12 ? 'nd' :
        day % 10 === 3 && day !== 13 ? 'rd' : 'th'
      return `Monthly on the ${day}${suffix}`
    }
    case 'monthly_weekday': {
      const nth = nthWeekdayOfMonth(d)
      return `${ORDINALS[nth] ?? `${nth}th`} ${weekdayName} of each month`
    }
    default:
      return 'Does not repeat'
  }
}

/** Short label for the table's Recurrence column. */
export function recurrenceShortLabel(pattern: RecurrencePattern, anchorISO: string): string {
  switch (pattern) {
    case 'none':            return '—'
    case 'weekly':          return 'Weekly'
    case 'biweekly':        return 'Bi-weekly'
    case 'monthly_day':     return describeRecurrence('monthly_day', anchorISO).replace('Monthly on the ', 'Monthly · ')
    case 'monthly_weekday': return describeRecurrence('monthly_weekday', anchorISO).replace(' of each month', '')
    default:                return '—'
  }
}
