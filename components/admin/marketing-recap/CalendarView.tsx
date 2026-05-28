'use client'

/**
 * CalendarView — 6-week month grid of marketing_upcoming.
 *
 * Full CRUD surface for upcoming items (except drag-to-reschedule,
 * which is Stage G+3). The Phase B2 table view (UpcomingManager)
 * remains a second editing surface over the same data; both views
 * call the same API endpoints with identical request shapes.
 *
 *   Stage G    — read-only display + click-to-view day detail
 *   Stage G+1  — click empty cell background to CREATE
 *   Stage G+2  — Edit + soft-Delete each item from the day-detail
 *                Dialog (THIS stage)
 *
 * Click intents on a day cell:
 *   - Cell background / date number / +Add hint  → CREATE Dialog
 *   - Item chip                                  → day-detail Dialog
 *                                                  (which now offers
 *                                                  per-item Edit /
 *                                                  Delete)
 *   - "+N more"                                  → day-detail Dialog
 *
 * Data: reuses GET / POST / PATCH / DELETE /api/admin/marketing/recap/
 * upcoming(/[id]) — no new API routes were created at any stage.
 *
 * Mutation pattern (create/edit/delete):
 *   1. Apply OPTIMISTIC update to local items state (with snapshot).
 *   2. Fire mutation; on failure, roll back + InlineAlert.
 *   3. On mutation success, close the form/dialog.
 *   4. Run a reconciliation fetchMonth() in a SEPARATE try/catch so a
 *      refresh failure cannot masquerade as a mutation failure. (Bug
 *      from G+1 fixed across all three mutation paths in G+2.)
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
  ChevronLeft, ChevronRight, Loader2, CalendarDays, Table as TableIcon,
  Info, Plus, Pencil, Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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

/* ─── Item form (shared by create + edit) ────────────────────── */
// Bounds and field names match B2 + the server Zod schema in
// app/api/admin/marketing/recap/upcoming/route.ts. Do not invent
// new fields or different bounds here — the server validates again.
//
// `scheduled_date` is in the form state because EDIT lets users
// reschedule the item to a different day via the form (drag is G+3).
// In the CREATE flow the cell click fixes the date and the form's
// date field is shown read-only.
interface ItemForm {
  scheduled_date:      string  // YYYY-MM-DD
  title:               string
  lane:                Lane
  description:         string
  asset_count_planned: string  // string in the input; coerced to number/null at submit
  notes:               string
}

function emptyItemForm(scheduledISO: string): ItemForm {
  return {
    scheduled_date:      scheduledISO,
    title:               '',
    lane:                'other',
    description:         '',
    asset_count_planned: '',
    notes:               '',
  }
}

function itemToForm(item: UpcomingItem): ItemForm {
  const lane: Lane = (item.lane in LANE_STYLES ? item.lane : 'other') as Lane
  return {
    scheduled_date:      item.scheduled_date,
    title:               item.title,
    lane,
    description:         item.description ?? '',
    asset_count_planned: item.asset_count_planned == null
      ? ''
      : String(item.asset_count_planned),
    notes:               item.notes ?? '',
  }
}

/**
 * Validate an ItemForm against the same Zod bounds the server enforces.
 * Returns an error message or null. Pure function, no side effects.
 */
function validateItemForm(form: ItemForm, opts: { requireDate?: boolean } = {}): string | null {
  if (opts.requireDate !== false) {
    if (!form.scheduled_date || !/^\d{4}-\d{2}-\d{2}$/.test(form.scheduled_date)) {
      return 'Scheduled date must be YYYY-MM-DD.'
    }
  }
  const title = form.title.trim()
  if (!title)             return 'Title is required.'
  if (title.length > 200) return 'Title must be 200 characters or fewer.'
  if (form.description.length > 1000) return 'Description must be 1000 characters or fewer.'
  if (form.notes.length > 2000)       return 'Notes must be 2000 characters or fewer.'
  if (form.asset_count_planned.trim() !== '') {
    const n = Number(form.asset_count_planned)
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0 || n > 9999) {
      return 'Assets planned must be a whole number from 0 to 9999.'
    }
  }
  return null
}

/**
 * Build the API payload from an ItemForm. Used for both POST and PATCH
 * (PATCH ignores fields it doesn't recognise, but the server's Zod
 * .optional() makes the full-shape submit safe — this matches B2,
 * whose buildPayload() sends the same set on both create and edit).
 */
function buildItemPayload(form: ItemForm): Record<string, unknown> {
  const assets = form.asset_count_planned.trim() === ''
    ? null
    : Number(form.asset_count_planned)
  return {
    scheduled_date:      form.scheduled_date,
    title:               form.title.trim(),
    lane:                form.lane,
    description:         form.description.trim() || null,
    asset_count_planned: assets,
    notes:               form.notes.trim() || null,
  }
}

/**
 * Unpack a server error response into a single user-facing string.
 * Mirrors G+1's inline unpacking; promoted to a helper so create, edit,
 * and delete share consistent error wording.
 */
function unpackApiError(data: unknown, status: number, fallback: string): string {
  if (data && typeof data === 'object') {
    const d = data as { error?: unknown; details?: unknown }
    const err = typeof d.error === 'string' ? d.error : null
    const details = Array.isArray(d.details)
      ? d.details.filter((x) => typeof x === 'string') as string[]
      : null
    if (err && details && details.length > 0) return `${err}: ${details.join('; ')}`
    if (err) return err
  }
  return `${fallback} (${status})`
}

/** Long-form date for Dialog headers. Built from parts, not from
 *  new Date('YYYY-MM-DD'), so no UTC shift. */
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
  // `scheduled_date` lives in createForm but is shown read-only in the
  // create Dialog — the cell click chose it. (Edit reuses the same
  // ItemForm shape with an editable date field.)
  const [createDateISO, setCreateDateISO] = useState<string | null>(null)
  const [createForm,    setCreateForm]    = useState<ItemForm>(emptyItemForm(''))
  const [creating,      setCreating]      = useState(false)
  const [createError,   setCreateError]   = useState('')

  /* ── Edit-form state (G+2) ─────────────────────────────────── */
  const [editingItem,  setEditingItem]  = useState<UpcomingItem | null>(null)
  const [editForm,     setEditForm]     = useState<ItemForm>(emptyItemForm(''))
  const [editSaving,   setEditSaving]   = useState(false)
  const [editError,    setEditError]    = useState('')

  /* ── Delete confirmation state (G+2) ──────────────────────── */
  const [confirmDelete, setConfirmDelete] = useState<UpcomingItem | null>(null)
  const [deleting,      setDeleting]      = useState(false)
  // Day-detail level "operation error" surface — for errors that occur
  // after the per-item form/dialog has closed (e.g. a delete from the
  // confirm dialog). Renders inside the day-detail Dialog header.
  const [dayOpError,    setDayOpError]    = useState('')

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

  /**
   * Run fetchMonth() as POST-MUTATION RECONCILIATION.
   *
   * Wrapped in its own try/catch and a `console.warn` on failure so a
   * refresh hiccup does NOT bubble up to the mutation handler and read
   * as a mutation failure. With optimistic updates already applied,
   * the user's view is correct even if reconciliation later fails —
   * the next month-nav or page reload will pick up authoritative state.
   *
   * Fixes the G+1 masquerade bug; reused by create / edit / delete.
   */
  async function reconcileAfterMutation() {
    try {
      await fetchMonth(year, month)
    } catch (err) {
      console.warn(
        '[calendar] post-mutation refresh failed; view may be stale until next nav',
        err,
      )
    }
  }

  /* ── Create-form open/submit (G+1, refactored in G+2) ────── */

  function openCreate(iso: string) {
    setCreateForm(emptyItemForm(iso))
    setCreateError('')
    setCreateDateISO(iso)
  }

  function closeCreate() {
    if (creating) return
    setCreateDateISO(null)
    setCreateForm(emptyItemForm(''))
    setCreateError('')
  }

  async function submitCreate() {
    if (!createDateISO) return
    const validationErr = validateItemForm(createForm)
    if (validationErr) { setCreateError(validationErr); return }

    setCreating(true)
    setCreateError('')

    // ── 1. Mutation ──────────────────────────────────────────
    let createdItem: UpcomingItem | null = null
    try {
      const res = await fetch('/api/admin/marketing/recap/upcoming', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(buildItemPayload(createForm)),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(unpackApiError(data, res.status, 'Create failed'))
      createdItem = (data && typeof data === 'object' && 'item' in data)
        ? (data as { item: UpcomingItem }).item
        : null
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Create failed')
      setCreating(false)
      return
    }

    // ── 2. Mutation confirmed — apply optimistically, close form ─
    if (createdItem) setItems((prev) => [...prev, createdItem as UpcomingItem])
    setCreateDateISO(null)
    setCreateForm(emptyItemForm(''))
    setCreating(false)

    // ── 3. Reconcile (failure here is NOT a mutation failure) ──
    await reconcileAfterMutation()
  }

  /* ── Edit-form open/submit (G+2) ─────────────────────────── */

  function openEdit(item: UpcomingItem) {
    setEditForm(itemToForm(item))
    setEditError('')
    setEditingItem(item)
  }

  function closeEdit() {
    if (editSaving) return
    setEditingItem(null)
    setEditForm(emptyItemForm(''))
    setEditError('')
  }

  async function submitEdit() {
    if (!editingItem) return
    const validationErr = validateItemForm(editForm)
    if (validationErr) { setEditError(validationErr); return }

    const target = editingItem
    const payload = buildItemPayload(editForm)

    setEditSaving(true)
    setEditError('')

    // Optimistic update + snapshot for rollback.
    const snapshot = items
    const optimistic: UpcomingItem = {
      ...target,
      scheduled_date:      editForm.scheduled_date,
      title:               editForm.title.trim(),
      lane:                editForm.lane,
      description:         editForm.description.trim() || null,
      asset_count_planned: editForm.asset_count_planned.trim() === ''
        ? null
        : Number(editForm.asset_count_planned),
      notes:               editForm.notes.trim() || null,
    }
    setItems((prev) => prev.map((x) => (x.id === target.id ? optimistic : x)))

    // ── 1. Mutation ──────────────────────────────────────────
    let serverItem: UpcomingItem | null = null
    try {
      const res = await fetch(`/api/admin/marketing/recap/upcoming/${target.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(unpackApiError(data, res.status, 'Save failed'))
      serverItem = (data && typeof data === 'object' && 'item' in data)
        ? (data as { item: UpcomingItem }).item
        : null
    } catch (e) {
      // Roll back optimistic update.
      setItems(snapshot)
      setEditError(e instanceof Error ? e.message : 'Save failed')
      setEditSaving(false)
      return
    }

    // ── 2. Mutation confirmed — reconcile with server truth, close ─
    if (serverItem) {
      setItems((prev) => prev.map((x) => (x.id === target.id ? serverItem as UpcomingItem : x)))
    }
    setEditingItem(null)
    setEditForm(emptyItemForm(''))
    setEditSaving(false)

    // ── 3. Reconcile (failure here is NOT a mutation failure) ──
    await reconcileAfterMutation()
  }

  /* ── Soft-delete (G+2) ───────────────────────────────────── */

  async function confirmSoftDelete() {
    if (!confirmDelete) return
    const target = confirmDelete

    setDeleting(true)
    setDayOpError('')

    // Optimistic removal + snapshot for rollback.
    const snapshot = items
    setItems((prev) => prev.filter((x) => x.id !== target.id))

    // ── 1. Mutation ──────────────────────────────────────────
    try {
      const res = await fetch(`/api/admin/marketing/recap/upcoming/${target.id}`, {
        method: 'DELETE',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(unpackApiError(data, res.status, 'Delete failed'))
    } catch (e) {
      // Roll back optimistic removal.
      setItems(snapshot)
      setDayOpError(e instanceof Error ? e.message : 'Delete failed')
      setDeleting(false)
      // Keep the confirm dialog open so the user sees their item is
      // still there and can retry or cancel.
      return
    }

    // ── 2. Mutation confirmed — close confirm dialog ────────
    setConfirmDelete(null)
    setDeleting(false)

    // ── 3. Reconcile (failure here is NOT a mutation failure) ──
    // Calendar fetches activeOnly=true, so the soft-deleted item is
    // already gone from the optimistic state and will stay gone after
    // reconciliation. Belt-and-suspenders.
    await reconcileAfterMutation()
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

      {/* Day-detail dialog.
          Display list of the day's items with per-item Edit and
          Delete affordances (G+2). The detail Dialog itself remains
          a "display" surface — edits open a separate edit Dialog, and
          deletes open a confirmation AlertDialog. */}
      <Dialog
        open={openDayISO !== null}
        onOpenChange={(open) => {
          if (!open) {
            setOpenDayISO(null)
            setDayOpError('')
          }
        }}
      >
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

          {dayOpError && (
            <InlineAlert
              kind="error"
              message={dayOpError}
              onClose={() => setDayOpError('')}
            />
          )}

          {dayItems.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-sm text-gray-500 mb-3">Nothing scheduled for this day.</p>
              <Button
                type="button"
                onClick={() => {
                  if (openDayISO) {
                    const iso = openDayISO
                    setOpenDayISO(null)
                    openCreate(iso)
                  }
                }}
                className="bg-[#f26b2b] hover:bg-[#d8551b] text-white"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add an item
              </Button>
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
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.badge}`}>
                          {style.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setDayOpError('')
                            openEdit(it)
                          }}
                          className="p-1.5 rounded-md text-gray-400 hover:text-[#03374f] hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-[#f26b2b]/40"
                          title="Edit"
                          aria-label={`Edit ${it.title}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDayOpError('')
                            setConfirmDelete(it)
                          }}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-1 focus:ring-red-500/40"
                          title="Deactivate (soft delete)"
                          aria-label={`Deactivate ${it.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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

          <div className="mt-2 pt-3 border-t border-gray-100 flex items-center justify-between gap-2 flex-wrap">
            <span className="inline-flex items-start gap-2 text-[11px] text-gray-500">
              <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
              <span>
                The full spreadsheet is available in the{' '}
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
            </span>
            {dayItems.length > 0 && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  if (openDayISO) {
                    const iso = openDayISO
                    setOpenDayISO(null)
                    openCreate(iso)
                  }
                }}
                className="border-gray-200 text-[#03374f]"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add another
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit-item dialog (G+2).
          Same field set as the create form, but `scheduled_date` is
          EDITABLE here — the user can reschedule the item to a
          different day via the form (drag-to-reschedule is G+3).
          Optimistic update with rollback on PATCH failure. */}
      <Dialog
        open={editingItem !== null}
        onOpenChange={(open) => { if (!open) closeEdit() }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#03374f]">
              <Pencil className="w-5 h-5 text-[#f26b2b]" />
              Edit upcoming item
            </DialogTitle>
            <DialogDescription>
              {editingItem ? `Editing "${editingItem.title}".` : ''}
            </DialogDescription>
          </DialogHeader>

          {editError && (
            <InlineAlert kind="error" message={editError} onClose={() => setEditError('')} />
          )}

          <div className="space-y-3 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="cal-edit-date">
                Scheduled date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cal-edit-date"
                type="date"
                value={editForm.scheduled_date}
                onChange={(e) => setEditForm({ ...editForm, scheduled_date: e.target.value })}
                required
              />
              <p className="text-[11px] text-gray-400">
                Changing the date moves this item to a different day on the calendar.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cal-edit-title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cal-edit-title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="e.g. May farming campaign"
                maxLength={200}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cal-edit-lane">Lane</Label>
              <select
                id="cal-edit-lane"
                value={editForm.lane}
                onChange={(e) => setEditForm({ ...editForm, lane: e.target.value as Lane })}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus:border-[#f26b2b] focus:ring-2 focus:ring-[#f26b2b]/15"
              >
                {(Object.keys(LANE_STYLES) as Lane[]).map((lane) => (
                  <option key={lane} value={lane}>{LANE_STYLES[lane].label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cal-edit-description">Description</Label>
              <Textarea
                id="cal-edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Short recap-facing description"
                rows={3}
                maxLength={1000}
              />
              <p className="text-[11px] text-gray-400">
                {editForm.description.length}/1000
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cal-edit-assets">Assets planned</Label>
              <Input
                id="cal-edit-assets"
                type="number"
                min={0}
                max={9999}
                step={1}
                value={editForm.asset_count_planned}
                onChange={(e) => setEditForm({ ...editForm, asset_count_planned: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cal-edit-notes">Internal notes</Label>
              <Textarea
                id="cal-edit-notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Internal-only production notes"
                rows={3}
                maxLength={2000}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeEdit} disabled={editSaving}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submitEdit}
              disabled={editSaving || !editForm.title.trim() || !editForm.scheduled_date}
              className="bg-[#f26b2b] hover:bg-[#d8551b] text-white"
            >
              {editSaving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Soft-delete confirmation (G+2).
          DELETE /upcoming/[id] is a soft delete: it sets active=false.
          The item is hidden from the Weekly Recap but the record is
          preserved and can be reactivated from the Table view. */}
      <AlertDialog
        open={confirmDelete !== null}
        onOpenChange={(open) => { if (!open && !deleting) setConfirmDelete(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove &quot;{confirmDelete?.title}&quot;{confirmDelete ? ` from ${longDateLabel(confirmDelete.scheduled_date)}` : ''}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This deactivates the item (soft delete) — it will be hidden from the Weekly Marketing Recap and the calendar, but the record is preserved and can be reactivated from the Table view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); confirmSoftDelete() }}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
