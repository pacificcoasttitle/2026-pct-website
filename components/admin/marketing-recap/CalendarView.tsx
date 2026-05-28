'use client'

/**
 * CalendarView — read-only 6-week month grid of marketing_upcoming.
 *
 * READ-ONLY by design. No create/edit/delete/drag anywhere. The
 * Phase B2 table view (UpcomingManager) is the editing surface; this
 * component only DISPLAYS the same data visually. The day-detail
 * Dialog opened by clicking a cell is also read-only and links out to
 * the table view for any mutation.
 *
 * Data: re-uses GET /api/admin/marketing/recap/upcoming for month
 * navigation. No new API route was created.
 *
 * PT date handling:
 *   - "Today" and the initial current month are PT-anchored (computed
 *     server-side and passed in via props; the Today button recomputes
 *     client-side using the same Intl.DateTimeFormat pattern).
 *   - Item-to-cell placement is pure ISO-date string comparison
 *     (scheduled_date is a YYYY-MM-DD string from the DB). No
 *     timezone math needed for placement.
 *   - All cell dates are built via new Date(y, m-1, d) and formatted
 *     by reading getFullYear/getMonth/getDate — never via
 *     new Date('YYYY-MM-DD') (which would UTC-shift the day).
 *
 * Lane palette matches B2's LANE_OPTIONS in UpcomingManager.tsx for
 * visual consistency between the two views.
 *
 * Brand: PCT navy #03374f, orange #f26b2b. Zero #003d79 (avoids the
 * drift still present in UpcomingManager.tsx).
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ChevronLeft, ChevronRight, Loader2, CalendarDays, Table as TableIcon, Info,
} from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { InlineAlert } from '@/components/admin/marketing/shared'
import type { UpcomingItem } from '@/lib/admin-db'

/* ─── Lane palette (mirrors B2's LANE_OPTIONS) ───────────────── */

type Lane = 'marketing-piece' | 'social' | 'weekly-email' | 'other'

interface LaneStyle {
  label:  string
  chip:   string  // bg + text + border classes for the day-cell chip
  badge:  string  // larger badge for the day-detail dialog
}

const LANE_STYLES: Record<Lane, LaneStyle> = {
  'marketing-piece': {
    label: 'Marketing Piece',
    chip:  'bg-orange-50 text-orange-700 border border-orange-100',
    badge: 'bg-orange-50 text-orange-700 border border-orange-100',
  },
  'social': {
    label: 'Social',
    chip:  'bg-sky-50 text-sky-700 border border-sky-100',
    badge: 'bg-sky-50 text-sky-700 border border-sky-100',
  },
  'weekly-email': {
    label: 'Weekly Email',
    chip:  'bg-violet-50 text-violet-700 border border-violet-100',
    badge: 'bg-violet-50 text-violet-700 border border-violet-100',
  },
  'other': {
    label: 'Other',
    chip:  'bg-slate-50 text-slate-600 border border-slate-100',
    badge: 'bg-slate-50 text-slate-600 border border-slate-100',
  },
}

function laneStyle(lane: string): LaneStyle {
  return LANE_STYLES[(lane as Lane)] ?? LANE_STYLES.other
}

/* ─── Date helpers (calendar-component arithmetic, never UTC) ─── */

function pad2(n: number): string { return n < 10 ? `0${n}` : String(n) }
function formatISODate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function todayPT(): { year: number; month: number; day: number; iso: string } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year:     'numeric',
    month:    '2-digit',
    day:      '2-digit',
  }).formatToParts(new Date())
  const year  = Number(parts.find((p) => p.type === 'year')!.value)
  const month = Number(parts.find((p) => p.type === 'month')!.value)
  const day   = Number(parts.find((p) => p.type === 'day')!.value)
  return { year, month, day, iso: `${year}-${pad2(month)}-${pad2(day)}` }
}

/** Visible 6-week (42-cell) grid range — Sunday-start US calendar. */
function buildGrid(year: number, month1to12: number) {
  const first    = new Date(year, month1to12 - 1, 1)
  const fromGrid = new Date(first); fromGrid.setDate(first.getDate() - first.getDay())
  const last     = new Date(year, month1to12, 0)
  const toGrid   = new Date(last);  toGrid.setDate(last.getDate() + (6 - last.getDay()))

  const cells: Array<{ date: Date; iso: string; inMonth: boolean }> = []
  // Always render 42 cells (6 weeks) for a stable grid height.
  // visibleRange may produce 35 cells when the month fits in 5 weeks;
  // we pad to 42 by extending into the trailing week.
  const cursor = new Date(fromGrid)
  for (let i = 0; i < 42; i++) {
    cells.push({
      date:    new Date(cursor),
      iso:     formatISODate(cursor),
      inMonth: cursor.getFullYear() === year && cursor.getMonth() === month1to12 - 1,
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  return {
    cells,
    fromISO: formatISODate(fromGrid),
    toISO:   formatISODate(cells[cells.length - 1].date),
  }
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/* ─── Props ──────────────────────────────────────────────────── */

interface Props {
  initialYear:  number
  initialMonth: number              // 1-12
  initialItems: UpcomingItem[]
  initialError?: string
}

/* ─── Component ──────────────────────────────────────────────── */

export function CalendarView({
  initialYear, initialMonth, initialItems, initialError = '',
}: Props) {
  const [year,  setYear]  = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const [items, setItems] = useState<UpcomingItem[]>(initialItems)
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(initialError)

  const [openDayISO, setOpenDayISO] = useState<string | null>(null)

  // PT today recomputed on every render — cheap, and keeps the "Today"
  // highlight correct if the page sits open across midnight PT.
  const today = useMemo(() => todayPT(), [])

  const grid = useMemo(() => buildGrid(year, month), [year, month])

  // Bucket items by scheduled_date for O(1) cell lookup. Ordered by
  // (scheduled_date ASC, id ASC) coming out of the DB — preserve that
  // ordering so chips render top-down in the order they were scheduled.
  const itemsByDate = useMemo(() => {
    const m = new Map<string, UpcomingItem[]>()
    for (const it of items) {
      const list = m.get(it.scheduled_date)
      if (list) list.push(it)
      else m.set(it.scheduled_date, [it])
    }
    return m
  }, [items])

  /* ── Month navigation ───────────────────────────────────── */

  const fetchMonth = useCallback(async (y: number, m: number) => {
    setLoading(true)
    setFetchError('')
    try {
      const { fromISO, toISO } = buildGrid(y, m)
      const res = await fetch(
        `/api/admin/marketing/recap/upcoming?from=${fromISO}&to=${toISO}`,
        { cache: 'no-store' },
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || `Failed to load (${res.status})`)
      setItems(Array.isArray(data.items) ? data.items : [])
    } catch (e) {
      setItems([])
      setFetchError(e instanceof Error ? e.message : 'Failed to load items')
    } finally {
      setLoading(false)
    }
  }, [])

  // Skip the very first fetch — server already seeded `initialItems`
  // for the initial (year, month). Only refetch on subsequent changes.
  const [didMount, setDidMount] = useState(false)
  useEffect(() => {
    if (!didMount) {
      setDidMount(true)
      return
    }
    fetchMonth(year, month)
  }, [year, month, didMount, fetchMonth])

  function shiftMonth(delta: number) {
    let m = month + delta
    let y = year
    while (m < 1)  { m += 12; y -= 1 }
    while (m > 12) { m -= 12; y += 1 }
    setMonth(m)
    setYear(y)
  }

  function goToday() {
    const t = todayPT()
    setMonth(t.month)
    setYear(t.year)
  }

  const isCurrentPTMonth = year === today.year && month === today.month

  /* ── Open day dialog ────────────────────────────────────── */
  const dayItems = openDayISO ? (itemsByDate.get(openDayISO) ?? []) : []
  const openDayLabel = useMemo(() => {
    if (!openDayISO) return ''
    const [y, mo, d] = openDayISO.split('-').map(Number)
    const date = new Date(y, mo - 1, d)
    return date.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    })
  }, [openDayISO])

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="space-y-4">
      {/* Month navigation bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-[#03374f] min-w-[10rem]">
            {MONTH_NAMES[month - 1]} {year}
          </h2>
          {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => shiftMonth(-1)}
            disabled={loading}
            aria-label="Previous month"
            className="border-gray-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={goToday}
            disabled={loading || isCurrentPTMonth}
            className="border-gray-200 text-[#03374f]"
          >
            Today
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => shiftMonth(1)}
            disabled={loading}
            aria-label="Next month"
            className="border-gray-200"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {fetchError && (
        <InlineAlert
          kind="error"
          message={fetchError}
          onClose={() => setFetchError('')}
        />
      )}

      {/* Calendar grid */}
      <Card className="p-0 overflow-hidden gap-0">
        {/* Weekday header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
          {WEEKDAY_HEADERS.map((w) => (
            <div
              key={w}
              className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 text-center"
            >
              {w}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 grid-rows-6 min-w-[700px]">
          {grid.cells.map((cell) => {
            const cellItems = itemsByDate.get(cell.iso) ?? []
            const isToday   = cell.iso === today.iso
            const isPast    = cell.iso < today.iso
            const muted     = !cell.inMonth

            const baseBg =
              muted   ? 'bg-gray-50/60' :
              isToday ? 'bg-[#f26b2b]/5' :
              isPast  ? 'bg-white' :
                        'bg-white'

            const dateNumColor =
              muted ? 'text-gray-300' :
              isPast && !isToday ? 'text-gray-400' :
              'text-[#03374f]'

            const ring = isToday ? 'ring-2 ring-inset ring-[#f26b2b]/50' : ''

            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() => setOpenDayISO(cell.iso)}
                className={`text-left border-t border-l border-gray-100 first:border-l-0 [&:nth-child(7n+1)]:border-l-0 min-h-[96px] p-1.5 flex flex-col gap-1 transition-colors hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${baseBg} ${ring}`}
                aria-label={`${cell.iso} — ${cellItems.length} item${cellItems.length === 1 ? '' : 's'}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[12px] font-semibold leading-none ${dateNumColor}`}
                  >
                    {cell.date.getDate()}
                  </span>
                  {isToday && (
                    <span className="text-[9px] font-bold uppercase tracking-wide text-[#f26b2b]">
                      Today
                    </span>
                  )}
                </div>

                {/* Items: render up to 3 chips, then "+N more" */}
                <div className="flex flex-col gap-1 overflow-hidden">
                  {cellItems.slice(0, 3).map((it) => (
                    <span
                      key={it.id}
                      className={`text-[10px] leading-tight rounded px-1.5 py-0.5 truncate ${laneStyle(it.lane).chip} ${muted ? 'opacity-60' : ''}`}
                      title={it.title}
                    >
                      {it.title}
                    </span>
                  ))}
                  {cellItems.length > 3 && (
                    <span className="text-[10px] font-medium text-gray-500 px-1.5">
                      +{cellItems.length - 3} more
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-gray-500">
        <span className="font-semibold text-gray-400 uppercase tracking-wide text-[10px]">Lanes:</span>
        {(Object.keys(LANE_STYLES) as Lane[]).map((lane) => (
          <span key={lane} className="inline-flex items-center gap-1.5">
            <span className={`inline-block w-3 h-3 rounded-sm ${LANE_STYLES[lane].chip}`} />
            {LANE_STYLES[lane].label}
          </span>
        ))}
      </div>

      {/* Day-detail dialog (read-only) */}
      <Dialog open={openDayISO !== null} onOpenChange={(open) => { if (!open) setOpenDayISO(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#03374f]">
              <CalendarDays className="w-5 h-5 text-[#f26b2b]" />
              {openDayLabel}
            </DialogTitle>
            <DialogDescription>
              {dayItems.length === 0
                ? 'No items scheduled.'
                : `${dayItems.length} item${dayItems.length === 1 ? '' : 's'} scheduled.`}
            </DialogDescription>
          </DialogHeader>

          {dayItems.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-sm text-gray-500 mb-3">Nothing scheduled for this day.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {dayItems.map((it) => {
                const style = laneStyle(it.lane)
                return (
                  <div
                    key={it.id}
                    className="rounded-md border border-gray-100 p-3 bg-white"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="font-semibold text-[#03374f] text-sm flex-1 min-w-0 break-words">
                        {it.title}
                      </div>
                      <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.badge}`}>
                        {style.label}
                      </span>
                    </div>
                    {it.description && (
                      <p className="text-[12px] text-gray-600 mt-1.5 leading-relaxed whitespace-pre-wrap">
                        {it.description}
                      </p>
                    )}
                    {typeof it.asset_count_planned === 'number' && it.asset_count_planned > 0 && (
                      <div className="text-[11px] text-gray-500 mt-1.5">
                        {it.asset_count_planned} asset{it.asset_count_planned === 1 ? '' : 's'} planned
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-2 pt-3 border-t border-gray-100 flex items-start gap-2 text-[11px] text-gray-500">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
            <span>
              To add or edit items, use the{' '}
              <Link
                href="/admin/team/marketing-recap/upcoming"
                className="inline-flex items-center gap-1 font-semibold text-[#03374f] hover:text-[#f26b2b]"
                onClick={() => setOpenDayISO(null)}
              >
                <TableIcon className="w-3 h-3" />
                Table view
              </Link>
              .
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
