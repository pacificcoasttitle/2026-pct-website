'use client'

/**
 * CompletionCard (Stage I2) — plan-vs-actual at the top of the calendar
 * page. Surfaces the I1 completion data layer as a small reporting card.
 *
 *   - Four mini stat tiles: Completion Rate (orange, large anchor),
 *     Planned (navy), Shipped (green), Cancelled (muted gray).
 *   - An inline-expandable slippage indicator below the tiles, shown
 *     ONLY when there are overdue planned items. Each row routes its
 *     [Open] button to the calendar's EXISTING edit Dialog via
 *     onOpenItem — no new mutation path.
 *
 * Read-only. The card fetches { range_items, slippage_items } from the
 * I2 endpoint in one round-trip, then computes the report client-side
 * with computeCompletionReport (I1).
 *
 * Lifecycle: re-fetches whenever (year, month) changes (the page mirrors
 * the calendar's current month) or refreshSignal bumps (the page
 * increments it after every successful calendar mutation).
 *
 * Null-data (empty production) is a first-class state: tiles show 0 / —,
 * slippage block suppressed, a muted "nothing scheduled yet" note. No
 * NaN%, no crash, no fake data.
 *
 * DATE RULE: ISO string comparison only; PT-anchored. Never
 * new Date('YYYY-MM-DD') for comparison.
 */

import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from '@/components/ui/card'
import { InlineAlert } from '@/components/admin/marketing/shared'
import { computeCompletionReport, type CompletionReport } from '@/lib/marketing-completion'
import { laneStyle } from '@/components/admin/marketing-recap/CalendarView'
import type { UpcomingItem } from '@/lib/admin-db'

interface Props {
  year:          number       // current PT year of the calendar
  month:         number       // current PT month (1-12)
  refreshSignal: number       // bumps when the calendar mutates → re-fetch
  onOpenItem:    (item: UpcomingItem) => void  // slippage row → edit Dialog
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function pad2(n: number): string { return n < 10 ? `0${n}` : String(n) }

/** PT-anchored today as YYYY-MM-DD — for "days overdue" math. */
function pacificTodayISO(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year:     'numeric',
    month:    '2-digit',
    day:      '2-digit',
  }).format(new Date())
}

/**
 * Whole days between two YYYY-MM-DD strings (a - b), via UTC math on the
 * parsed parts. We build the Dates with Date.UTC from explicit parts (not
 * new Date('YYYY-MM-DD')) so both sides are UTC-anchored and the
 * subtraction is a clean day delta with no TZ skew.
 */
function daysBetween(aISO: string, bISO: string): number {
  const [ay, am, ad] = aISO.split('-').map(Number)
  const [by, bm, bd] = bISO.split('-').map(Number)
  const aUTC = Date.UTC(ay, am - 1, ad)
  const bUTC = Date.UTC(by, bm - 1, bd)
  return Math.round((aUTC - bUTC) / 86_400_000)
}

export function CompletionCard({ year, month, refreshSignal, onOpenItem }: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [report, setReport]   = useState<CompletionReport | null>(null)
  const [expanded, setExpanded] = useState(false)

  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    // Month bounds (first → last calendar day). Build via parts, not
    // new Date('YYYY-MM-DD'). Date(year, month, 0) = last day of `month`.
    const fromISO = `${year}-${pad2(month)}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const toISO   = `${year}-${pad2(month)}-${pad2(lastDay)}`

    try {
      const res = await fetch(
        `/api/admin/marketing/recap/completion-data?from=${fromISO}&to=${toISO}`,
        { cache: 'no-store' },
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const detail = Array.isArray(data?.details) ? `: ${data.details.join('; ')}` : ''
        throw new Error((data?.error || `Failed to load (${res.status})`) + detail)
      }
      const rangeItems: UpcomingItem[]    = Array.isArray(data.range_items) ? data.range_items : []
      const slippageItems: UpcomingItem[] = Array.isArray(data.slippage_items) ? data.slippage_items : []

      const computed = computeCompletionReport({
        items:          rangeItems,
        slippage_items: slippageItems,
        fromISO,
        toISO,
      })
      setReport(computed)
    } catch (e) {
      setReport(null)
      setError(e instanceof Error ? e.message : 'Failed to load completion data')
    } finally {
      setLoading(false)
    }
  }, [year, month])

  // Re-fetch on month change AND on every mutation signal bump.
  useEffect(() => {
    load()
  }, [load, refreshSignal])

  // Collapse the slippage list whenever the dataset reloads, so a stale
  // expanded state never lingers over a different month's data.
  useEffect(() => {
    setExpanded(false)
  }, [year, month, refreshSignal])

  const todayISO = pacificTodayISO()

  // Slippage sorted most-overdue first (addresses I1's union-order note —
  // sort in the UI, where display order matters).
  const slippageSorted = report
    ? [...report.slippage].sort(
        (a, b) => daysBetween(todayISO, a.scheduled_date) - daysBetween(todayISO, b.scheduled_date),
      ).reverse()
    : []

  const allZero =
    !!report &&
    report.planned_count === 0 &&
    report.shipped_count === 0 &&
    report.cancelled_count === 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#03374f]">This month at a glance</CardTitle>
        <CardDescription>{monthLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 py-6">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading completion data…
          </div>
        ) : error ? (
          <InlineAlert kind="error" message={error} onClose={() => setError(null)} />
        ) : report ? (
          <div className="space-y-4">
            {/* Stat tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile
                value={report.completion_rate === null ? '—' : `${Math.round(report.completion_rate * 100)}%`}
                label="completion rate"
                valueClass="text-[#f26b2b]"
                emphasis
              />
              <StatTile
                value={report.planned_count}
                label="planned"
                valueClass="text-[#03374f]"
              />
              <StatTile
                value={report.shipped_count}
                label="shipped"
                valueClass="text-emerald-600"
              />
              <StatTile
                value={report.cancelled_count}
                label="cancelled"
                valueClass="text-slate-500"
              />
            </div>

            {/* Slippage — suppressed entirely when there's nothing overdue */}
            {slippageSorted.length > 0 && (
              <div className="rounded-lg border border-red-100 bg-red-50/60 overflow-hidden">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setExpanded((v) => !v)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:bg-red-50"
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">
                    {slippageSorted.length} overdue planned item{slippageSorted.length !== 1 ? 's' : ''}
                  </span>
                  {expanded
                    ? <ChevronUp className="w-4 h-4 flex-shrink-0" />
                    : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
                </button>

                {expanded && (
                  <ul className="divide-y divide-red-100 border-t border-red-100">
                    {slippageSorted.map((item) => {
                      const overdue = daysBetween(todayISO, item.scheduled_date)
                      const ls = laneStyle(item.lane)
                      return (
                        <li
                          key={item.id}
                          className="flex items-center gap-2 px-3 py-2 bg-white/70"
                        >
                          <span
                            className="flex-1 min-w-0 truncate text-sm text-[#03374f] font-medium"
                            title={item.title}
                          >
                            {item.title}
                          </span>
                          <span className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${ls.badge}`}>
                            {ls.label}
                          </span>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {overdue} day{overdue !== 1 ? 's' : ''} overdue
                          </span>
                          <button
                            type="button"
                            onClick={() => onOpenItem(item)}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold text-[#03374f] bg-white border border-gray-200 hover:border-[#03374f]/30 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#f26b2b]/40"
                          >
                            Open
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )}

            {/* Empty-production hint — only when literally nothing this month */}
            {allZero && (
              <p className="text-xs text-gray-400">
                No items scheduled this month yet.
              </p>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function StatTile({
  value, label, valueClass, emphasis = false,
}: {
  value: string | number
  label: string
  valueClass: string
  emphasis?: boolean
}) {
  return (
    <div className="flex flex-col rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-3">
      <span className={`font-bold leading-none ${emphasis ? 'text-4xl' : 'text-3xl'} ${valueClass}`}>
        {value}
      </span>
      <span className="mt-1.5 text-[10px] uppercase tracking-wider text-gray-500">
        {label}
      </span>
    </div>
  )
}
