/**
 * /admin/team/marketing-recap/calendar — read-only month grid view of
 * marketing_upcoming.
 *
 * Server component. Computes the current month in Pacific time, then
 * fetches the visible grid range (first-week-Sunday through
 * last-week-Saturday) so cells from adjacent months can still display
 * their items if any. The client component handles month navigation
 * by re-fetching via the existing GET /api/admin/marketing/recap/upcoming
 * endpoint — this page only seeds the initial render.
 *
 * This view is READ-ONLY. The Phase B2 table view (UpcomingManager)
 * remains the editing surface; the cross-link in the header sends
 * admins there for create/edit/delete.
 *
 * (protected) segment enforces auth — no re-check here.
 */
import Link from 'next/link'
import { ArrowLeft, CalendarDays, Table as TableIcon } from 'lucide-react'
import { getUpcomingItems, type UpcomingItem } from '@/lib/admin-db'
import { CalendarWithCompletion } from '@/components/admin/marketing-recap/CalendarWithCompletion'

export const dynamic  = 'force-dynamic'
export const metadata = { title: 'Marketing Calendar | PCT' }

/* ─── PT-anchored "today" (YYYY-MM-DD calendar string) ───────── */
// Mirrors the recap's thisMondayPT/toPacificISODate pattern: read
// calendar parts from Intl in America/Los_Angeles. Avoids the
// new Date('YYYY-MM-DD') UTC-midnight trap.
function todayPT(): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year:     'numeric',
    month:    '2-digit',
    day:      '2-digit',
  }).formatToParts(new Date())
  return {
    year:  Number(parts.find((p) => p.type === 'year')!.value),
    month: Number(parts.find((p) => p.type === 'month')!.value),
    day:   Number(parts.find((p) => p.type === 'day')!.value),
  }
}

/* ─── Date helpers — build calendar dates from parts, format to ISO ─ */
// Constructing via new Date(y, m-1, d) yields a Date in the local TZ,
// but we only ever read its calendar components back out — never use
// .toISOString() on these (would UTC-shift). format() below uses
// getFullYear/getMonth/getDate, all local.
function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}
function formatISODate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

/**
 * Returns the YYYY-MM-DD strings bounding the visible 6-week month grid.
 * Sunday-start (US calendar convention).
 */
function visibleRange(year: number, month1to12: number): { fromISO: string; toISO: string } {
  // First day of the month.
  const first = new Date(year, month1to12 - 1, 1)
  // Sunday on or before that day.
  const fromGrid = new Date(first)
  fromGrid.setDate(first.getDate() - first.getDay()) // getDay: 0=Sun
  // Last day of the month.
  const last = new Date(year, month1to12, 0) // day 0 of next month = last day of this month
  // Saturday on or after that day.
  const toGrid = new Date(last)
  toGrid.setDate(last.getDate() + (6 - last.getDay()))
  return { fromISO: formatISODate(fromGrid), toISO: formatISODate(toGrid) }
}

export default async function MarketingCalendarPage() {
  const { year, month } = todayPT()
  const { fromISO, toISO } = visibleRange(year, month)

  let initialItems: UpcomingItem[] = []
  let loadError = ''
  try {
    initialItems = await getUpcomingItems({
      fromDate:   fromISO,
      toDate:     toISO,
      activeOnly: true,
    })
  } catch (err) {
    console.warn('[marketing-calendar] failed to load initial items', err)
    loadError = 'Could not load this month\u2019s items. Try refreshing the page.'
  }

  return (
    <div className="space-y-5 pt-2 lg:pt-0 max-w-7xl">
      <header className="space-y-2">
        <Link
          href="/admin/team/marketing-recap"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#f26b2b]"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Marketing Recap
        </Link>
        <div className="flex items-start gap-3 flex-wrap justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-[#03374f]">
              <CalendarDays className="w-6 h-6 text-[#f26b2b]" />
              Marketing Calendar
            </h1>
            <p className="text-gray-500 text-sm max-w-2xl mt-1">
              Read-only month view of upcoming marketing items. To add or edit items, use the Table view.
            </p>
          </div>
          <Link
            href="/admin/team/marketing-recap/upcoming"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-[#03374f] bg-white border border-gray-200 hover:border-[#03374f]/30 hover:bg-gray-50"
          >
            <TableIcon className="w-3.5 h-3.5" />
            Table view
          </Link>
        </div>
      </header>

      {/* I2: the completion card renders above the month grid inside this
          client island, which coordinates month sync + refresh-on-mutation
          + slippage→edit-Dialog routing. */}
      <CalendarWithCompletion
        initialYear={year}
        initialMonth={month}
        initialItems={initialItems}
        initialError={loadError}
      />
    </div>
  )
}
