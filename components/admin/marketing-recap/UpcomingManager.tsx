'use client'

import { useMemo, useState } from 'react'
import { Edit2, Filter, Loader2, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { UpcomingItem } from '@/lib/admin-db'

type Lane = 'marketing-piece' | 'social' | 'weekly-email' | 'other'
type LaneFilter = Lane | 'all'

interface Props {
  initialItems: UpcomingItem[]
  initialFromDate: string
  initialToDate: string
}

interface FormState {
  scheduled_date: string
  title: string
  lane: Lane
  description: string
  asset_count_planned: string
  notes: string
}

const LANE_OPTIONS: Array<{ value: Lane; label: string; className: string }> = [
  {
    value: 'marketing-piece',
    label: 'Marketing Piece',
    className: 'bg-orange-50 text-orange-700 border-orange-100',
  },
  {
    value: 'social',
    label: 'Social',
    className: 'bg-sky-50 text-sky-700 border-sky-100',
  },
  {
    value: 'weekly-email',
    label: 'Weekly Email',
    className: 'bg-violet-50 text-violet-700 border-violet-100',
  },
  {
    value: 'other',
    label: 'Other',
    className: 'bg-slate-50 text-slate-600 border-slate-100',
  },
]

function todayDateString() {
  return new Date().toISOString().slice(0, 10)
}

function emptyForm(): FormState {
  return {
    scheduled_date: todayDateString(),
    title: '',
    lane: 'other',
    description: '',
    asset_count_planned: '',
    notes: '',
  }
}

function formFromItem(item: UpcomingItem): FormState {
  return {
    scheduled_date: item.scheduled_date,
    title: item.title,
    lane: (LANE_OPTIONS.some((lane) => lane.value === item.lane)
      ? item.lane
      : 'other') as Lane,
    description: item.description ?? '',
    asset_count_planned: item.asset_count_planned == null ? '' : String(item.asset_count_planned),
    notes: item.notes ?? '',
  }
}

function laneLabel(value: string) {
  return LANE_OPTIONS.find((lane) => lane.value === value)?.label ?? 'Other'
}

function laneClassName(value: string) {
  return LANE_OPTIONS.find((lane) => lane.value === value)?.className ?? LANE_OPTIONS[3].className
}

function formatDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

function truncateText(value: string | null, maxLength = 96) {
  if (!value) return '—'
  return value.length > maxLength ? `${value.slice(0, maxLength).trim()}...` : value
}

export function UpcomingManager({ initialItems, initialFromDate, initialToDate }: Props) {
  const [items, setItems] = useState(initialItems)
  const [laneFilter, setLaneFilter] = useState<LaneFilter>('all')
  const [fromDate, setFromDate] = useState(initialFromDate)
  const [toDate, setToDate] = useState(initialToDate)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<UpcomingItem | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const today = todayDateString()

  const visibleItems = useMemo(() => {
    return [...items]
      .filter((item) => laneFilter === 'all' || item.lane === laneFilter)
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date) || a.id - b.id)
  }, [items, laneFilter])

  async function refreshItems() {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        from: fromDate,
        to: toDate,
        include_inactive: 'true',
      })
      const res = await fetch(`/api/admin/marketing/recap/upcoming?${params.toString()}`)
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Could not load upcoming items')
      }
      setItems(data.items || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load upcoming items')
    } finally {
      setLoading(false)
    }
  }

  function openCreateDialog() {
    setEditingItem(null)
    setForm(emptyForm())
    setError(null)
    setDialogOpen(true)
  }

  function openEditDialog(item: UpcomingItem) {
    setEditingItem(item)
    setForm(formFromItem(item))
    setError(null)
    setDialogOpen(true)
  }

  function updateForm<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function buildPayload() {
    return {
      scheduled_date: form.scheduled_date,
      title: form.title.trim(),
      lane: form.lane,
      description: form.description.trim() || null,
      asset_count_planned: form.asset_count_planned === ''
        ? null
        : Number(form.asset_count_planned),
      notes: form.notes.trim() || null,
    }
  }

  async function saveItem() {
    setSaving(true)
    setError(null)
    try {
      const payload = buildPayload()
      const res = await fetch(
        editingItem
          ? `/api/admin/marketing/recap/upcoming/${editingItem.id}`
          : '/api/admin/marketing/recap/upcoming',
        {
          method: editingItem ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Could not save upcoming item')
      }

      setDialogOpen(false)
      setEditingItem(null)
      await refreshItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save upcoming item')
    } finally {
      setSaving(false)
    }
  }

  async function setItemActive(item: UpcomingItem, active: boolean) {
    setError(null)
    try {
      const res = await fetch(`/api/admin/marketing/recap/upcoming/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Could not update active status')
      }
      setItems((current) => current.map((row) => (row.id === item.id ? data.item : row)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update active status')
    }
  }

  async function deactivateItem(item: UpcomingItem) {
    if (!window.confirm(`Deactivate "${item.title}"? It will be hidden from the Weekly Recap.`)) {
      return
    }
    setError(null)
    try {
      const res = await fetch(`/api/admin/marketing/recap/upcoming/${item.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Could not deactivate item')
      }
      setItems((current) => current.map((row) => (
        row.id === item.id ? { ...row, active: false } : row
      )))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not deactivate item')
    }
  }

  const activeCount = items.filter((item) => item.active).length

  return (
    <div className="space-y-4">
      <Card className="p-5 border-gray-100 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#003d79]">
              <Filter className="w-4 h-4 text-[#f26b2b]" />
              Live Spreadsheet
            </div>
            <p className="text-xs text-gray-500 mt-1 max-w-xl">
              Edit inline or use Add to create new entries. Inactive items are hidden from the Weekly Recap.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="lane-filter" className="text-xs text-gray-500">Lane</Label>
              <select
                id="lane-filter"
                value={laneFilter}
                onChange={(event) => setLaneFilter(event.target.value as LaneFilter)}
                className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm text-[#003d79] shadow-xs outline-none focus:border-[#f26b2b] focus:ring-2 focus:ring-[#f26b2b]/15"
              >
                <option value="all">All</option>
                {LANE_OPTIONS.map((lane) => (
                  <option key={lane.value} value={lane.value}>{lane.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="from-date" className="text-xs text-gray-500">From</Label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="to-date" className="text-xs text-gray-500">To</Label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="h-9"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={refreshItems}
              disabled={loading}
              className="h-9"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-1.5" />
              )}
              Refresh
            </Button>

            <Button
              type="button"
              onClick={openCreateDialog}
              className="h-9 bg-[#f26b2b] hover:bg-[#d8551b] text-white"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Item
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <div className="rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card className="overflow-hidden p-0 gap-0 border-gray-100 shadow-sm">
        <div className="flex flex-col gap-1 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#003d79]">Upcoming Schedule</h2>
            <p className="text-xs text-gray-500">
              Showing {visibleItems.length} rows across the selected date range.
            </p>
          </div>
          <span className="text-xs text-gray-400">
            {activeCount} active / {items.length} total
          </span>
        </div>

        {visibleItems.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-[#003d79]">No upcoming items found</p>
            <p className="text-xs text-gray-500 mt-1">
              Adjust the filters or add the first item for this recap window.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                <TableHead className="px-4 text-xs uppercase tracking-wide text-gray-500">Date</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-gray-500">Title</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-gray-500">Lane</TableHead>
                <TableHead className="min-w-[260px] text-xs uppercase tracking-wide text-gray-500">Description</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-gray-500">Assets Planned</TableHead>
                <TableHead className="text-xs uppercase tracking-wide text-gray-500">Active</TableHead>
                <TableHead className="pr-4 text-right text-xs uppercase tracking-wide text-gray-500">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleItems.map((item) => {
                const isPast = item.scheduled_date < today
                const isToday = item.scheduled_date === today

                return (
                  <TableRow
                    key={item.id}
                    className={cn(
                      'border-gray-100',
                      isPast && 'bg-gray-50/50 text-gray-400 hover:bg-gray-50',
                      isToday && 'bg-orange-50/60 hover:bg-orange-50',
                      !item.active && 'opacity-60',
                    )}
                  >
                    <TableCell className="px-4 font-medium">
                      <div className={cn(isPast ? 'text-gray-400' : 'text-[#003d79]')}>
                        {formatDate(item.scheduled_date)}
                      </div>
                      {isToday && (
                        <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[#f26b2b]">
                          Today
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[260px]">
                      <div className="font-semibold text-[#003d79] truncate">{item.title}</div>
                      {!item.active && (
                        <div className="text-[10px] uppercase tracking-wide text-gray-400">Inactive</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        'inline-flex rounded-full border px-2 py-0.5 text-xs font-medium',
                        laneClassName(item.lane),
                      )}
                      >
                        {laneLabel(item.lane)}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-normal text-sm text-gray-500">
                      {truncateText(item.description)}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {item.asset_count_planned ?? '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.active}
                          onCheckedChange={(active) => setItemActive(item, active)}
                          className="data-[state=checked]:bg-[#f26b2b]"
                          aria-label={`Set ${item.title} active status`}
                        />
                        <span className="text-xs text-gray-500">
                          {item.active ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={!item.active}
                          onClick={() => deactivateItem(item)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Deactivate
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#003d79]">
              {editingItem ? 'Edit Upcoming Item' : 'Add Upcoming Item'}
            </DialogTitle>
            <DialogDescription>
              Notes are internal only and will not appear in the weekly recap email.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="scheduled-date">Scheduled date</Label>
              <Input
                id="scheduled-date"
                type="date"
                required
                value={form.scheduled_date}
                onChange={(event) => updateForm('scheduled_date', event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lane">Lane</Label>
              <select
                id="lane"
                value={form.lane}
                onChange={(event) => updateForm('lane', event.target.value as Lane)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus:border-[#f26b2b] focus:ring-2 focus:ring-[#f26b2b]/15"
              >
                {LANE_OPTIONS.map((lane) => (
                  <option key={lane.value} value={lane.value}>{lane.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                required
                maxLength={200}
                value={form.title}
                onChange={(event) => updateForm('title', event.target.value)}
                placeholder="e.g. May farming campaign"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                maxLength={1000}
                value={form.description}
                onChange={(event) => updateForm('description', event.target.value)}
                placeholder="Short recap-facing description"
                rows={3}
              />
              <p className="text-[11px] text-gray-400">{form.description.length}/1000</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="assets-planned">Assets planned</Label>
              <Input
                id="assets-planned"
                type="number"
                min={0}
                max={9999}
                step={1}
                value={form.asset_count_planned}
                onChange={(event) => updateForm('asset_count_planned', event.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="notes">Internal notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(event) => updateForm('notes', event.target.value)}
                placeholder="Internal-only production notes"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={saveItem}
              disabled={saving || !form.scheduled_date || !form.title.trim()}
              className="bg-[#f26b2b] hover:bg-[#d8551b] text-white"
            >
              {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {editingItem ? 'Save Changes' : 'Create Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
