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
 *                Dialog
 *   Stage G+3  — DRAG a chip onto another day cell to reschedule
 *                (this stage). Closes Stage G+.
 *
 * Click intents on a day cell:
 *   - Cell background / date number / +Add hint  → CREATE Dialog
 *   - Item chip                                  → day-detail Dialog
 *                                                  (which offers
 *                                                  per-item Edit /
 *                                                  Delete)
 *   - "+N more"                                  → day-detail Dialog
 *
 * Drag intent:
 *   - Drag a chip and drop it on another day cell → PATCH the item's
 *     scheduled_date. Native HTML5 drag-and-drop, desktop-first.
 *     Same-day drops and drag-cancel are silent no-ops. Adjacent-month
 *     drops are allowed and trigger a "Moved to {date}" acknowledgment
 *     with a jump-to-month link, since the chip leaves the visible
 *     grid after the move. Touch (iOS) is not supported — accepted
 *     limitation; keyboard / mobile users have form-based reschedule
 *     via the edit Dialog's date field.
 *
 * Data: reuses GET / POST / PATCH / DELETE /api/admin/marketing/recap/
 * upcoming(/[id]) — no new API routes were created at any stage.
 *
 * Mutation pattern (create/edit/delete/drag-reschedule):
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
  Info, Plus, Pencil, Trash2, Clock, Check, Ban, User, Package, RotateCw,
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
import { BatchPicker } from '@/components/admin/marketing-recap/BatchPicker'
import {
  describeRecurrence,
  RECURRENCE_PATTERNS,
  type RecurrencePattern,
} from '@/lib/marketing-recurrence'
import type { UpcomingItem, UpcomingStatus } from '@/lib/admin-db'

/* ─── Recurrence options (H4) ─────────────────────────────────── */

const RECURRENCE_OPTIONS: Array<{ value: RecurrencePattern; label: string }> = [
  { value: 'none',            label: 'Does not repeat' },
  { value: 'weekly',          label: 'Weekly' },
  { value: 'biweekly',        label: 'Bi-weekly' },
  { value: 'monthly_day',     label: 'Monthly (day of month)' },
  { value: 'monthly_weekday', label: 'Monthly (Nth weekday)' },
]

function isRecurrencePattern(v: string): v is RecurrencePattern {
  return (RECURRENCE_PATTERNS as readonly string[]).includes(v)
}

function coerceRecurrence(v: string | null | undefined): RecurrencePattern {
  return v && isRecurrencePattern(v) ? v : 'none'
}

/* ─── Lane palette (mirrors B2's LANE_OPTIONS) ───────────────── */

type Lane = 'marketing-piece' | 'social' | 'weekly-email' | 'other'

export interface LaneStyle {
  label:  string
  chip:   string  // bg + text + border classes for the day-cell chip
  badge:  string  // larger badge for the day-detail dialog
}

export const LANE_STYLES: Record<Lane, LaneStyle> = {
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

export function laneStyle(lane: string): LaneStyle {
  return LANE_STYLES[(lane as Lane)] ?? LANE_STYLES.other
}

/* ─── Status options (H1 — manual only) ───────────────────────── */

const STATUS_OPTIONS: Array<{ value: UpcomingStatus; label: string }> = [
  { value: 'planned',   label: 'Planned'   },
  { value: 'shipped',   label: 'Shipped'   },
  { value: 'cancelled', label: 'Cancelled' },
]

function isUpcomingStatus(value: string): value is UpcomingStatus {
  return value === 'planned' || value === 'shipped' || value === 'cancelled'
}

function coerceStatus(value: string | null | undefined): UpcomingStatus {
  return value && isUpcomingStatus(value) ? value : 'planned'
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
  status:              UpcomingStatus
  owner:               string  // free-text; empty string → null at submit
  asset_delivery_batch_id: number | null  // H3 link; null = unlinked
  recurrence_pattern:  RecurrencePattern   // H4
  recurrence_until:    string              // YYYY-MM-DD or '' (no end)
  description:         string
  asset_count_planned: string  // string in the input; coerced to number/null at submit
  notes:               string
}

function emptyItemForm(scheduledISO: string): ItemForm {
  return {
    scheduled_date:      scheduledISO,
    title:               '',
    lane:                'other',
    status:              'planned',
    owner:               '',
    asset_delivery_batch_id: null,
    recurrence_pattern:  'none',
    recurrence_until:    '',
    description:         '',
    asset_count_planned: '',
    notes:               '',
  }
}

function itemToForm(item: UpcomingItem): ItemForm {
  const lane: Lane = (item.lane in LANE_STYLES ? item.lane : 'other') as Lane
  const isRecurring = coerceRecurrence(item.recurrence_pattern) !== 'none'
  return {
    // H4 follow-up: for recurring items the form's anchor must come from
    // anchor_date, never the (possibly occurrence) scheduled_date — else
    // editing a non-anchor occurrence would PATCH the anchor forward.
    scheduled_date:      isRecurring
                           ? (item.anchor_date ?? item.scheduled_date)
                           : item.scheduled_date,
    title:               item.title,
    lane,
    status:              coerceStatus(item.status),
    owner:               item.owner ?? '',
    asset_delivery_batch_id: item.asset_delivery_batch_id ?? null,
    recurrence_pattern:  coerceRecurrence(item.recurrence_pattern),
    recurrence_until:    item.recurrence_until ?? '',
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
  if (form.recurrence_until !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(form.recurrence_until)) {
    return 'Recur-until date must be YYYY-MM-DD.'
  }
  if (form.owner.trim().length > 100) return 'Owner must be 100 characters or fewer.'
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
// Builds the always-sent base fields. status and asset_delivery_batch_id
// are deliberately EXCLUDED here and added conditionally by the caller:
// they participate in the H3 auto-flip, so they follow the H2 partial-
// PATCH discipline (only send when changed) — otherwise re-sending an
// unchanged status would block the server-side auto-flip, and re-sending
// an unchanged link would spuriously re-flip status on unrelated edits.
function buildItemPayload(form: ItemForm): Record<string, unknown> {
  const assets = form.asset_count_planned.trim() === ''
    ? null
    : Number(form.asset_count_planned)
  return {
    scheduled_date:      form.scheduled_date,
    title:               form.title.trim(),
    lane:                form.lane,
    owner:               form.owner.trim() || null,
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
  /* ── I2 coordination (optional — calendar works standalone too) ──
   * The completion card lives as a sibling on the page and must agree
   * with the calendar on the current month + re-fetch when data
   * mutates. Rather than lift the calendar's year/month state up (a
   * large refactor of its internal nav), we keep the state here and
   * emit changes via callbacks. The page mirrors them into the state
   * it feeds the card. */
  onMonthChange?: (year: number, month: number) => void
  onMutated?: () => void
  // When set (by the card's slippage [Open] button), the calendar opens
  // its existing edit Dialog for that item, then calls
  // onEditRequestConsumed so the page can clear the trigger. Routes the
  // card to the SAME edit pipeline — no duplicate dialog, no new
  // mutation path.
  editRequest?: UpcomingItem | null
  onEditRequestConsumed?: () => void
}

/* ─── Component ──────────────────────────────────────────────── */

export function CalendarView({
  initialYear, initialMonth, initialItems, initialError = '',
  onMonthChange, onMutated, editRequest, onEditRequestConsumed,
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

  /* ── Drag-to-reschedule state (G+3) ──────────────────────── */
  // `draggingItemId` styles the source chip during the drag.
  // `dragOverCellISO` styles the prospective drop target.
  // `dragError` and `moveAck` surface grid-level feedback above the
  // month grid (errors and "moved to {date}" acknowledgments — the
  // grid has no Dialog to host an InlineAlert during a drag).
  const [draggingItemId,  setDraggingItemId]  = useState<number | null>(null)
  const [dragOverCellISO, setDragOverCellISO] = useState<string | null>(null)
  const [dragError,       setDragError]       = useState('')
  const [moveAck,         setMoveAck]         = useState<
    { message: string; jumpTo: { year: number; month: number } | null } | null
  >(null)

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
        `/api/admin/marketing/recap/upcoming?from=${fromISO}&to=${toISO}&expand=true`,
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

  // I2: keep the page (and thus the completion card) in sync with the
  // calendar's current month. Fires on mount too, which conveniently
  // seeds the page with the initial month.
  useEffect(() => {
    onMonthChange?.(year, month)
  }, [year, month, onMonthChange])

  // I2: the completion card's slippage [Open] button sets editRequest on
  // the page; the calendar reacts by opening its EXISTING edit Dialog
  // for that item, then signals consumption so the trigger clears (and a
  // future identical request can re-fire).
  useEffect(() => {
    if (!editRequest) return
    openEdit(editRequest)
    onEditRequestConsumed?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editRequest])

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
    // I2: notify the page that data changed BEFORE the refetch. Every
    // successful mutation (create / edit / delete / drag / recurrence)
    // funnels through here, so this single call is the shared "data may
    // have changed" signal that tells the completion card to re-fetch.
    // Fired before fetchMonth so a refresh hiccup can't suppress it.
    onMutated?.()
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
      // Calendar create has no status control — omit status so the
      // server defaults to 'planned', or auto-flips to 'shipped' when a
      // batch link is set here. Always send the link (null = unlinked).
      const createPayload = {
        ...buildItemPayload(createForm),
        asset_delivery_batch_id: createForm.asset_delivery_batch_id,
        recurrence_pattern: createForm.recurrence_pattern,
        recurrence_until: createForm.recurrence_until || null,
      }
      const res = await fetch('/api/admin/marketing/recap/upcoming', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(createPayload),
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

  /**
   * Shared PATCH helper for edit + drag-reschedule.
   *
   * Applies the optimistic update FIRST (so the UI reflects the change
   * immediately), then fires PATCH, rolls back on failure, reconciles
   * with the server-returned item on success, and runs the masquerade-
   * safe reconcile fetch.
   *
   * Used by:
   *   - submitEdit (G+2): full field update from the edit form
   *   - dropReschedule (G+3): scheduled_date-only update from a drag
   *
   * Both callers go through this identical code path so the two
   * editing surfaces cannot diverge in their PATCH behavior.
   */
  async function patchItemFields(
    target:       UpcomingItem,
    // Object: replace every row with this id (non-recurring — one chip).
    // Mapper: apply per-row (recurring — preserve each occurrence's date).
    optimistic:   UpcomingItem | ((existing: UpcomingItem) => UpcomingItem),
    body:         Record<string, unknown>,
    errorFallback = 'Save failed',
    opts:         { reconcileServerItem?: boolean } = {},
  ): Promise<{ ok: true; serverItem: UpcomingItem | null } | { ok: false; error: string }> {
    const applyFn = typeof optimistic === 'function'
      ? optimistic
      : () => optimistic
    const snapshot = items
    setItems((prev) => prev.map((x) => (x.id === target.id ? applyFn(x) : x)))

    // ── Phase 1: mutation ─────────────────────────────────────
    let serverItem: UpcomingItem | null = null
    try {
      const res = await fetch(`/api/admin/marketing/recap/upcoming/${target.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(unpackApiError(data, res.status, errorFallback))
      serverItem = (data && typeof data === 'object' && 'item' in data)
        ? (data as { item: UpcomingItem }).item
        : null
    } catch (e) {
      // Roll back optimistic update.
      setItems(snapshot)
      return { ok: false, error: e instanceof Error ? e.message : errorFallback }
    }

    // ── Phase 2: mutation confirmed — reconcile with server row ─
    // For recurring items the server returns the anchor row (one date),
    // which would collapse all occurrence chips to one day. Skip the
    // single-row replace in that case (reconcileServerItem=false) and let
    // the Phase-3 refetch re-expand occurrences correctly.
    if (serverItem && (opts.reconcileServerItem ?? true)) {
      const s = serverItem
      setItems((prev) => prev.map((x) => (x.id === s.id ? s : x)))
    }

    // ── Phase 3: belt-and-suspenders reconciliation (refresh
    //            failure NOT reported as a mutation failure) ──
    await reconcileAfterMutation()

    return { ok: true, serverItem }
  }

  async function submitEdit() {
    if (!editingItem) return
    const validationErr = validateItemForm(editForm)
    if (validationErr) { setEditError(validationErr); return }

    const target = editingItem

    // status + link follow the partial-PATCH discipline: include only
    // when changed. Sending an unchanged status would block the server
    // auto-flip; sending an unchanged link would spuriously re-flip.
    const statusChanged = editForm.status !== coerceStatus(target.status)
    const linkChanged =
      editForm.asset_delivery_batch_id !== (target.asset_delivery_batch_id ?? null)
    const patternChanged =
      editForm.recurrence_pattern !== coerceRecurrence(target.recurrence_pattern)
    const untilChanged =
      (editForm.recurrence_until || null) !== (target.recurrence_until ?? null)
    // Local prediction of the server's auto-flip so the optimistic chip
    // matches (the server is authoritative; patchItemFields reconciles
    // with the returned row regardless).
    const willAutoFlip =
      linkChanged && editForm.asset_delivery_batch_id != null && !statusChanged
    const optimisticStatus: UpcomingStatus = willAutoFlip ? 'shipped' : editForm.status

    const isRecurring = editForm.recurrence_pattern !== 'none'

    // Common field changes applied to a row (used by both the object and
    // the per-occurrence mapper forms of the optimistic update).
    const applyEdits = (base: UpcomingItem): UpcomingItem => ({
      ...base,
      title:               editForm.title.trim(),
      lane:                editForm.lane,
      status:              optimisticStatus,
      owner:               editForm.owner.trim() || null,
      asset_delivery_batch_id: editForm.asset_delivery_batch_id,
      recurrence_pattern:  editForm.recurrence_pattern,
      recurrence_until:    editForm.recurrence_until || null,
      description:         editForm.description.trim() || null,
      asset_count_planned: editForm.asset_count_planned.trim() === ''
        ? null
        : Number(editForm.asset_count_planned),
      notes:               editForm.notes.trim() || null,
    })

    const editPayload: Record<string, unknown> = buildItemPayload(editForm)
    if (statusChanged) editPayload.status = editForm.status
    if (linkChanged) editPayload.asset_delivery_batch_id = editForm.asset_delivery_batch_id
    if (patternChanged) editPayload.recurrence_pattern = editForm.recurrence_pattern
    if (untilChanged) editPayload.recurrence_until = editForm.recurrence_until || null

    setEditSaving(true)
    setEditError('')

    // Recurring: a single edit touches many occurrence chips that share
    // this id — map each, preserving its own scheduled_date, and let the
    // refetch reconcile (server returns just the anchor row). Non-
    // recurring: one chip, so replace it wholesale with the new date.
    const result = isRecurring
      ? await patchItemFields(
          target,
          (x) => applyEdits(x),               // keep each occurrence's date
          editPayload,
          'Save failed',
          { reconcileServerItem: false },
        )
      : await patchItemFields(
          target,
          { ...applyEdits(target), scheduled_date: editForm.scheduled_date },
          editPayload,
          'Save failed',
        )

    if (!result.ok) {
      setEditError(result.error)
      setEditSaving(false)
      return
    }

    setEditingItem(null)
    setEditForm(emptyItemForm(''))
    setEditSaving(false)
  }

  /* ── Drag-to-reschedule (G+3) ────────────────────────────── */

  /**
   * Returns true if a YYYY-MM-DD string falls inside the currently
   * displayed month. Used to decide whether to show the "Moved to…"
   * acknowledgment (only needed when the chip leaves the visible grid
   * — for same-month drops the user just sees the chip move).
   */
  function isInVisibleMonth(iso: string): boolean {
    const [y, mo] = iso.split('-').map(Number)
    return y === year && mo === month
  }

  /** Year+month components of an ISO date — used to jump-navigate. */
  function ymOf(iso: string): { year: number; month: number } {
    const [y, mo] = iso.split('-').map(Number)
    return { year: y, month: mo }
  }

  /** "May 2026" — for the acknowledgment "Go to {month}" link copy. */
  function monthYearLabel(iso: string): string {
    const { year: y, month: mo } = ymOf(iso)
    return `${MONTH_NAMES[mo - 1]} ${y}`
  }

  async function dropReschedule(item: UpcomingItem, newDateISO: string) {
    // Same-day drop = silent no-op. Already guarded at the drop-handler
    // call site, but kept here as belt-and-suspenders.
    if (newDateISO === item.scheduled_date) return

    setDragError('')
    setMoveAck(null)

    const optimistic: UpcomingItem = { ...item, scheduled_date: newDateISO }
    const result = await patchItemFields(
      item,
      optimistic,
      { scheduled_date: newDateISO },
      'Reschedule failed',
    )

    if (!result.ok) {
      setDragError(result.error)
      return
    }

    // Out-of-month acknowledgment: the chip is now invisible in the
    // current view, so tell the user where it went and offer to jump.
    if (!isInVisibleMonth(newDateISO)) {
      setMoveAck({
        message: `Moved "${item.title}" to ${longDateLabel(newDateISO)}.`,
        jumpTo:  ymOf(newDateISO),
      })
    }
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

      {/* Grid-level drag feedback (G+3). Grid-level errors for grid-
          level actions — the drag happens directly on the grid, with
          no Dialog to host an InlineAlert. */}
      {dragError && (
        <InlineAlert
          kind="error"
          message={dragError}
          onClose={() => setDragError('')}
        />
      )}

      {moveAck && (
        // Custom inline alert (matches InlineAlert styling) because we
        // need to embed a clickable "Go to {month}" jump-link, which
        // the plain-text InlineAlert message prop can't render.
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl text-sm border bg-blue-50 border-blue-100 text-blue-700">
          <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="flex-1">
            {moveAck.message}
            {moveAck.jumpTo && (
              <>
                {' '}
                <button
                  type="button"
                  onClick={() => {
                    if (!moveAck.jumpTo) return
                    setYear(moveAck.jumpTo.year)
                    setMonth(moveAck.jumpTo.month)
                    setMoveAck(null)
                  }}
                  className="underline font-semibold hover:text-blue-900 focus:outline-none"
                >
                  Go to {monthYearLabel(`${moveAck.jumpTo.year}-${String(moveAck.jumpTo.month).padStart(2, '0')}-01`)}
                </button>
              </>
            )}
          </span>
          <button
            type="button"
            onClick={() => setMoveAck(null)}
            className="text-current/60 hover:text-current text-xs"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
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

            const isDropTarget = dragOverCellISO === cell.iso
            const dropRing = isDropTarget
              ? 'ring-2 ring-inset ring-[#f26b2b] bg-[#f26b2b]/10'
              : ''

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
              //
              // Drag (G+3): every cell is a drop target. onDragOver
              // and onDragEnter MUST preventDefault — without it,
              // onDrop never fires (HTML5 quirk: default is reject).
              // onDragLeave is guarded against the child-traversal
              // flicker by checking relatedTarget containment.
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
                onDragOver={(e) => {
                  if (draggingItemId === null) return
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'move'
                  if (dragOverCellISO !== cell.iso) setDragOverCellISO(cell.iso)
                }}
                onDragEnter={(e) => {
                  if (draggingItemId === null) return
                  e.preventDefault()
                  setDragOverCellISO(cell.iso)
                }}
                onDragLeave={(e) => {
                  // dragleave fires when entering a child element too.
                  // Guard: only clear highlight when truly leaving the
                  // cell (relatedTarget is NOT a descendant).
                  const next = e.relatedTarget as Node | null
                  if (next && e.currentTarget.contains(next)) return
                  if (dragOverCellISO === cell.iso) setDragOverCellISO(null)
                }}
                onDrop={(e) => {
                  if (draggingItemId === null) return
                  e.preventDefault()
                  setDragOverCellISO(null)
                  let payload: { id?: number; fromISO?: string } = {}
                  try {
                    const raw = e.dataTransfer.getData('text/plain')
                    if (raw) payload = JSON.parse(raw)
                  } catch { /* ignore malformed payload */ }
                  if (typeof payload.id !== 'number' || typeof payload.fromISO !== 'string') return
                  // Same-day drop = silent no-op (locked decision #3).
                  if (payload.fromISO === cell.iso) return
                  const dragged = items.find((x) => x.id === payload.id)
                  if (!dragged) return
                  // Fire the reschedule. Note we intentionally don't
                  // await — the drop handler completes synchronously
                  // so the browser releases the drag state; the patch
                  // runs in the background with its own optimistic UI.
                  void dropReschedule(dragged, cell.iso)
                }}
                className={`group relative cursor-pointer text-left border-t border-l border-gray-100 first:border-l-0 [&:nth-child(7n+1)]:border-l-0 min-h-[96px] p-1.5 flex flex-col gap-1 transition-colors hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${baseBg} ${ring} ${dropRing}`}
                aria-label={`${cell.iso} — ${cellItems.length} item${cellItems.length === 1 ? '' : 's'}. Click to add an item, or drop a chip here to reschedule.`}
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
                    cell's create handler doesn't also fire.
                    Chips are draggable (G+3): onDragStart writes the
                    payload, onDragEnd ALWAYS clears drag state — that's
                    the catch-all for drag-cancel (Escape, drop outside
                    grid) because onDrop doesn't fire on cancel. */}
                <div className="flex flex-col gap-1 overflow-hidden">
                  {cellItems.slice(0, 3).map((it) => {
                    const isDragging = draggingItemId === it.id
                    // Status visual treatment (H1):
                    //   planned   → baseline chip styling (no extra)
                    //   shipped   → small Check icon prefix
                    //   cancelled → line-through title + reduced opacity
                    // Lane color stays the same in all three cases.
                    const status        = coerceStatus(it.status)
                    const isShipped     = status === 'shipped'
                    const isCancelled   = status === 'cancelled'
                    const statusOpacity = isCancelled ? 'opacity-60' : ''
                    const titleClass    = isCancelled ? 'line-through' : ''
                    // H4: recurring chips show a RotateCw prefix and are
                    // NOT draggable (recurring items move via editing the
                    // rule, not via gesture — locked decision #6).
                    const isRecurring   = coerceRecurrence(it.recurrence_pattern) !== 'none'
                    const dragHint      = isRecurring ? 'click to view' : 'click to view, drag to reschedule'
                    const statusAria    =
                      isShipped   ? `${it.title} (shipped) — ${dragHint}`
                    : isCancelled ? `${it.title} (cancelled) — ${dragHint}`
                                  : `${it.title} — ${dragHint}`
                    const cursorClass   = isRecurring
                      ? 'cursor-pointer'
                      : 'cursor-grab active:cursor-grabbing'
                    return (
                      <button
                        key={it.id}
                        type="button"
                        draggable={!isRecurring}
                        onDragStart={(e) => {
                          if (isRecurring) { e.preventDefault(); return }
                          e.stopPropagation()
                          e.dataTransfer.effectAllowed = 'move'
                          e.dataTransfer.setData(
                            'text/plain',
                            JSON.stringify({ id: it.id, fromISO: cell.iso }),
                          )
                          setDraggingItemId(it.id)
                          // Hide any stale grid-level alerts so they
                          // don't visually conflict with the in-flight
                          // drag.
                          setDragError('')
                          setMoveAck(null)
                        }}
                        onDragEnd={(e) => {
                          e.stopPropagation()
                          // ALWAYS clear drag state — this is the only
                          // cleanup that runs on drag-cancel (Escape,
                          // drop outside grid). onDrop does NOT fire on
                          // cancel.
                          setDraggingItemId(null)
                          setDragOverCellISO(null)
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenDayISO(cell.iso)
                        }}
                        className={`text-left text-[10px] leading-tight rounded px-1.5 py-0.5 truncate ${laneStyle(it.lane).chip} ${muted ? 'opacity-60' : ''} ${statusOpacity} ${isDragging ? 'opacity-40' : ''} hover:brightness-95 focus:outline-none focus:ring-1 focus:ring-[#f26b2b]/40 ${cursorClass} inline-flex items-center gap-0.5`}
                        title={statusAria}
                        aria-label={`Open ${it.title}${isShipped ? ', shipped' : ''}${isCancelled ? ', cancelled' : ''}${isRecurring ? ', recurring' : ''}`}
                      >
                        {isRecurring && (
                          <RotateCw className="w-2.5 h-2.5 flex-shrink-0" aria-hidden="true" />
                        )}
                        {isShipped && (
                          <Check className="w-2.5 h-2.5 flex-shrink-0" aria-hidden="true" />
                        )}
                        <span className={`truncate ${titleClass}`}>{it.title}</span>
                      </button>
                    )
                  })}
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
                const style    = laneStyle(it.lane)
                const status   = coerceStatus(it.status)
                const cancelled = status === 'cancelled'
                const shipped   = status === 'shipped'
                return (
                  <div
                    key={it.id}
                    className={`rounded-md border border-gray-100 p-3 bg-white ${cancelled ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className={`font-semibold text-[#03374f] text-sm flex-1 min-w-0 break-words ${cancelled ? 'line-through' : ''}`}>
                        {it.title}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {shipped && (
                          <span className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-green-50 text-green-700 border border-green-100">
                            <Check className="w-2.5 h-2.5" />
                            Shipped
                          </span>
                        )}
                        {cancelled && (
                          <span className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                            <Ban className="w-2.5 h-2.5" />
                            Cancelled
                          </span>
                        )}
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
                    {it.owner && it.owner.trim() !== '' && (
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1.5">
                        <User className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                        <span className="break-words">{it.owner}</span>
                      </div>
                    )}
                    {it.asset_delivery_batch_label && (
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1.5">
                        <Package className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                        <span className="break-words">Linked: {it.asset_delivery_batch_label}</span>
                      </div>
                    )}
                    {coerceRecurrence(it.recurrence_pattern) !== 'none' && (
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1.5">
                        <RotateCw className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                        <span className="break-words">
                          {describeRecurrence(coerceRecurrence(it.recurrence_pattern), it.scheduled_date)}
                        </span>
                      </div>
                    )}
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

          {/* H4: recurring-item notice — edit-the-rule model affects all
              occurrences. */}
          {editForm.recurrence_pattern !== 'none' && (
            <InlineAlert
              kind="info"
              message={`Recurring item: ${describeRecurrence(editForm.recurrence_pattern, editForm.scheduled_date)}. Changes affect all occurrences.`}
            />
          )}

          <div className="space-y-3 py-1">
            {/* H4: the scheduled_date input only renders for non-recurring
                items. For recurring items the rule defines the dates, so
                we show a read-only anchor + rule description instead. */}
            {editForm.recurrence_pattern === 'none' ? (
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
            ) : (
              <div className="space-y-1.5">
                <Label>Recurrence anchor</Label>
                <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-[#03374f]">
                  {longDateLabel(editForm.scheduled_date)}
                  <span className="text-gray-500"> → {describeRecurrence(editForm.recurrence_pattern, editForm.scheduled_date)}</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  The rule is anchored to this date&apos;s weekday / day-of-month. To change the anchor, set recurrence to &quot;Does not repeat&quot;, save, then re-create the rule from the desired date.
                </p>
              </div>
            )}

            {/* H4: recurrence rule select */}
            <div className="space-y-1.5">
              <Label htmlFor="cal-edit-recurrence">Recurrence</Label>
              <select
                id="cal-edit-recurrence"
                value={editForm.recurrence_pattern}
                onChange={(e) =>
                  setEditForm({ ...editForm, recurrence_pattern: coerceRecurrence(e.target.value) })
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus:border-[#f26b2b] focus:ring-2 focus:ring-[#f26b2b]/15"
              >
                {RECURRENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {editForm.recurrence_pattern !== 'none' && (
              <div className="space-y-1.5">
                <Label htmlFor="cal-edit-recur-until">Recur until (optional)</Label>
                <Input
                  id="cal-edit-recur-until"
                  type="date"
                  value={editForm.recurrence_until}
                  onChange={(e) => setEditForm({ ...editForm, recurrence_until: e.target.value })}
                />
                <p className="text-[11px] text-gray-400">
                  Leave blank for no end date.
                </p>
              </div>
            )}

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

            {/* Status select (H1 — manual only). H3 will auto-derive
                'shipped' from an asset-link; this manual select stays
                as the authoritative override. */}
            <div className="space-y-1.5">
              <Label htmlFor="cal-edit-status">Status</Label>
              <select
                id="cal-edit-status"
                value={editForm.status}
                onChange={(e) =>
                  setEditForm({ ...editForm, status: coerceStatus(e.target.value) })
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus:border-[#f26b2b] focus:ring-2 focus:ring-[#f26b2b]/15"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400">
                Cancelled items stay visible on the calendar (with a line-through). To hide an item entirely, deactivate it instead.
              </p>
            </div>

            {/* Owner (H2 — free-text). After status: what / what state /
                who's responsible. No autocomplete or suggestions. */}
            <div className="space-y-1.5">
              <Label htmlFor="cal-edit-owner">Owner (optional)</Label>
              <Input
                id="cal-edit-owner"
                type="text"
                maxLength={100}
                value={editForm.owner}
                onChange={(e) => setEditForm({ ...editForm, owner: e.target.value })}
                placeholder="e.g. Jerry, Marketing Team"
              />
              <p className="text-[11px] text-gray-400">
                Free-text. Typos create separate entries — pick a consistent format.
              </p>
            </div>

            {/* Asset link (H3). Linking a batch auto-flips status to
                'shipped' server-side. Unlinking leaves status as-is. */}
            <BatchPicker
              value={editForm.asset_delivery_batch_id}
              onChange={(batchId) =>
                setEditForm({ ...editForm, asset_delivery_batch_id: batchId })
              }
            />

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
              {confirmDelete && coerceRecurrence(confirmDelete.recurrence_pattern) !== 'none'
                ? `Remove the recurring item "${confirmDelete.title}"? This will remove all occurrences.`
                : `Remove "${confirmDelete?.title}"${confirmDelete ? ` from ${longDateLabel(confirmDelete.scheduled_date)}` : ''}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete && coerceRecurrence(confirmDelete.recurrence_pattern) !== 'none'
                ? 'This deactivates the recurrence rule (soft delete), removing every occurrence from the Weekly Marketing Recap and the calendar. The record is preserved and can be reactivated from the Table view.'
                : 'This deactivates the item (soft delete) — it will be hidden from the Weekly Marketing Recap and the calendar, but the record is preserved and can be reactivated from the Table view.'}
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

            {/* Owner (H2 — free-text). Admins may want to set the
                responsible party at create time. No autocomplete. */}
            <div className="space-y-1.5">
              <Label htmlFor="cal-create-owner">Owner (optional)</Label>
              <Input
                id="cal-create-owner"
                type="text"
                maxLength={100}
                value={createForm.owner}
                onChange={(e) => setCreateForm({ ...createForm, owner: e.target.value })}
                placeholder="e.g. Jerry, Marketing Team"
              />
              <p className="text-[11px] text-gray-400">
                Free-text. Typos create separate entries — pick a consistent format.
              </p>
            </div>

            {/* Asset link (H3). Linking a batch on create records a
                backdated item that already shipped — auto-flips status. */}
            <BatchPicker
              value={createForm.asset_delivery_batch_id}
              onChange={(batchId) =>
                setCreateForm({ ...createForm, asset_delivery_batch_id: batchId })
              }
            />

            {/* H4: recurrence. ASYMMETRY vs. edit — the scheduled_date
                (chosen by the cell click) stays as the anchor here even
                for recurring patterns; it is only hidden in the EDIT
                dialog where the anchor already exists. */}
            <div className="space-y-1.5">
              <Label htmlFor="cal-create-recurrence">Recurrence</Label>
              <select
                id="cal-create-recurrence"
                value={createForm.recurrence_pattern}
                onChange={(e) =>
                  setCreateForm({ ...createForm, recurrence_pattern: coerceRecurrence(e.target.value) })
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus:border-[#f26b2b] focus:ring-2 focus:ring-[#f26b2b]/15"
              >
                {RECURRENCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {createForm.recurrence_pattern !== 'none' && createDateISO && (
                <p className="text-[11px] text-gray-400">
                  {describeRecurrence(createForm.recurrence_pattern, createDateISO)} — anchored to {longDateLabel(createDateISO)}.
                </p>
              )}
            </div>

            {createForm.recurrence_pattern !== 'none' && (
              <div className="space-y-1.5">
                <Label htmlFor="cal-create-recur-until">Recur until (optional)</Label>
                <Input
                  id="cal-create-recur-until"
                  type="date"
                  value={createForm.recurrence_until}
                  onChange={(e) => setCreateForm({ ...createForm, recurrence_until: e.target.value })}
                />
                <p className="text-[11px] text-gray-400">
                  Leave blank for no end date.
                </p>
              </div>
            )}

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
