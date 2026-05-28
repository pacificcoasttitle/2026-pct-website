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
  ChevronLeft, ChevronRight, Loader2, CalendarDays, Table as TableIcon, Info, Plus,
} from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

/* ─── Create form (mirrors B2's UpcomingManager FormState) ───── */
// Bounds and field names match B2 + the server Zod schema in
// app/api/admin/marketing/recap/upcoming/route.ts. Do not invent
// new fields or different bounds here — the server validates again.
interface CreateForm {
  title:               string
  lane:                Lane
  description:         string
  asset_count_planned: string  // string in the input; coerced to number/null at submit
  notes:               string
}

function emptyCreateForm(): CreateForm {
  return {
    title:               '',
    lane:                'other',
    description:         '',
    asset_count_planned: '',
    notes:               '',
  }
}

/** Long-form date for the create-Dialog header. Built from parts, not
 *  from new Date('YYYY-MM-DD'), so no UTC shift. */
function longDateLabel(iso: string): string {
  const [y, mo, d] = iso.split('-').map(Number)
  return new Date(y, mo - 1, d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

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

  /* ── Create-form state (G+1 click-to-create) ──────────────── */
  // Field set mirrors B2's UpcomingManager exactly so the same Zod
  // bounds apply on the server. `scheduled_date` is NOT in this form
  // state because it's fixed by the cell click and shown read-only.
  const [createDateISO, setCreateDateISO] = useState<string | null>(null)
  const [createForm,    setCreateForm]    = useState<CreateForm>(emptyCreateForm())
  const [creating,      setCreating]      = useState(false)
  const [createError,   setCreateError]   = useState('')

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

  /* ── Create-form open/submit (G+1) ─────────────────────── */

  function openCreate(iso: string) {
    setCreateForm(emptyCreateForm())
    setCreateError('')
    setCreateDateISO(iso)
  }

  function closeCreate() {
    if (creating) return
    setCreateDateISO(null)
    setCreateForm(emptyCreateForm())
    setCreateError('')
  }

  async function submitCreate() {
    if (!createDateISO) return
    // Client-side mirror of the server Zod bounds. The server is the
    // authoritative validator; this is just for immediate feedback.
    const title = createForm.title.trim()
    if (!title)              { setCreateError('Title is required.'); return }
    if (title.length > 200)  { setCreateError('Title must be 200 characters or fewer.'); return }
    if (createForm.description.length > 1000) {
      setCreateError('Description must be 1000 characters or fewer.'); return
    }
    if (createForm.notes.length > 2000) {
      setCreateError('Notes must be 2000 characters or fewer.'); return
    }
    let assetCount: number | null = null
    if (createForm.asset_count_planned.trim() !== '') {
      const n = Number(createForm.asset_count_planned)
      if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0 || n > 9999) {
        setCreateError('Assets planned must be a whole number from 0 to 9999.'); return
      }
      assetCount = n
    }

    setCreating(true)
    setCreateError('')
    try {
      const res = await fetch('/api/admin/marketing/recap/upcoming', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduled_date:      createDateISO,
          title,
          lane:                createForm.lane,
          description:         createForm.description.trim() || null,
          asset_count_planned: assetCount,
          notes:               createForm.notes.trim() || null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const detailMsg = Array.isArray(data?.details) && data.details.length > 0
          ? `${data.error || 'Invalid request'}: ${data.details.join('; ')}`
          : (data?.error || `Create failed (${res.status})`)
        throw new Error(detailMsg)
      }
      setCreateDateISO(null)
      setCreateForm(emptyCreateForm())
      // Refresh current month so the new chip appears immediately.
      await fetchMonth(year, month)
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Create failed')
    } finally {
      setCreating(false)
    }
  }

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
              // The cell is a `div` (not a `<button>`) because it
              // contains nested interactive children (item chips and
              // the "+N more" indicator) with their own click intents.
              // Nesting `<button>` inside `<button>` is invalid HTML.
              //
              // Click disambiguation:
              //   - Click anywhere on the cell BACKGROUND (date number,
              //     empty space, the +Add hint)  → opens the CREATE
              //     dialog with this cell's date pre-filled (G+1).
              //   - Click an item CHIP             → opens the
              //     read-only day-detail dialog (existing G behavior;
              //     stopPropagation prevents the create handler).
              //   - Click "+N more"                → opens the day-detail
              //     dialog (stopPropagation).
              <div
                key={cell.iso}
                role="button"
                tabIndex={0}
                onClick={() => openCreate(cell.iso)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openCreate(cell.iso)
                  }
                }}
                className={`group relative cursor-pointer text-left border-t border-l border-gray-100 first:border-l-0 [&:nth-child(7n+1)]:border-l-0 min-h-[96px] p-1.5 flex flex-col gap-1 transition-colors hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${baseBg} ${ring}`}
                aria-label={`${cell.iso} — ${cellItems.length} item${cellItems.length === 1 ? '' : 's'}. Click to add an item.`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[12px] font-semibold leading-none ${dateNumColor}`}>
                    {cell.date.getDate()}
                  </span>
                  {isToday ? (
                    <span className="text-[9px] font-bold uppercase tracking-wide text-[#f26b2b]">
                      Today
                    </span>
                  ) : (
                    // Subtle hover affordance signalling the cell is
                    // clickable to add. Hidden until cell hover; small
                    // and uncluttered so it doesn't compete with chips.
                    <span
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-semibold uppercase tracking-wide text-[#f26b2b] inline-flex items-center gap-0.5"
                      aria-hidden="true"
                    >
                      <Plus className="w-2.5 h-2.5" /> Add
                    </span>
                  )}
                </div>

                {/* Items: render up to 3 chips, then "+N more". Each
                    child is a real <button> with stopPropagation so the
                    cell's create handler doesn't also fire. */}
                <div className="flex flex-col gap-1 overflow-hidden">
                  {cellItems.slice(0, 3).map((it) => (
                    <button
                      key={it.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenDayISO(cell.iso)
                      }}
                      className={`text-left text-[10px] leading-tight rounded px-1.5 py-0.5 truncate ${laneStyle(it.lane).chip} ${muted ? 'opacity-60' : ''} hover:brightness-95 focus:outline-none focus:ring-1 focus:ring-[#f26b2b]/40`}
                      title={it.title}
                      aria-label={`Open ${it.title}`}
                    >
                      {it.title}
                    </button>
                  ))}
                  {cellItems.length > 3 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenDayISO(cell.iso)
                      }}
                      className="text-left text-[10px] font-medium text-gray-500 hover:text-[#03374f] px-1.5 focus:outline-none focus:underline"
                      aria-label={`Show all ${cellItems.length} items on this day`}
                    >
                      +{cellItems.length - 3} more
                    </button>
                  )}
                </div>
              </div>
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
              To edit or delete items, use the{' '}
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

      {/* Create-item dialog (G+1 click-to-create).
          Separate from the day-detail Dialog above; both can be opened
          independently for the same day. scheduled_date is fixed by
          the cell click and shown read-only at the top — the click
          chose the date, so we don't expose a date editor here.
          Field set + bounds mirror B2's UpcomingManager exactly. */}
      <Dialog
        open={createDateISO !== null}
        onOpenChange={(open) => { if (!open) closeCreate() }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#03374f]">
              <Plus className="w-5 h-5 text-[#f26b2b]" />
              Add upcoming item
            </DialogTitle>
            <DialogDescription>
              {createDateISO
                ? `Adding item for ${longDateLabel(createDateISO)}.`
                : ''}
            </DialogDescription>
          </DialogHeader>

          {createError && (
            <InlineAlert kind="error" message={createError} onClose={() => setCreateError('')} />
          )}

          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="cal-create-title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cal-create-title"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                placeholder="e.g. May farming campaign"
                maxLength={200}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cal-create-lane">Lane</Label>
              <select
                id="cal-create-lane"
                value={createForm.lane}
                onChange={(e) => setCreateForm({ ...createForm, lane: e.target.value as Lane })}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus:border-[#f26b2b] focus:ring-2 focus:ring-[#f26b2b]/15"
              >
                {(Object.keys(LANE_STYLES) as Lane[]).map((lane) => (
                  <option key={lane} value={lane}>{LANE_STYLES[lane].label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cal-create-description">Description</Label>
              <Textarea
                id="cal-create-description"
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Short recap-facing description"
                rows={3}
                maxLength={1000}
              />
              <p className="text-[11px] text-gray-400">
                {createForm.description.length}/1000
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cal-create-assets">Assets planned</Label>
              <Input
                id="cal-create-assets"
                type="number"
                min={0}
                max={9999}
                step={1}
                value={createForm.asset_count_planned}
                onChange={(e) => setCreateForm({ ...createForm, asset_count_planned: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cal-create-notes">Internal notes</Label>
              <Textarea
                id="cal-create-notes"
                value={createForm.notes}
                onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                placeholder="Internal-only production notes"
                rows={3}
                maxLength={2000}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeCreate} disabled={creating}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitCreate}
              disabled={creating || !createForm.title.trim()}
              className="bg-[#f26b2b] hover:bg-[#d8551b] text-white"
            >
              {creating && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              Create Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
