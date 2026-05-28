'use client'

/**
 * BatchPicker — shared asset-link combobox (Stage H3).
 *
 * Used by both editing surfaces (CalendarView + UpcomingManager) to
 * link a marketing_upcoming item to the asset_delivery_batch that
 * fulfilled it. Purely a CONTROLLED input: it never fires the PATCH
 * itself — the parent form sends the chosen batch_id (or null) on
 * submit. The auto-flip to status='shipped' happens server-side in the
 * updateUpcomingItem / createUpcomingItem helpers.
 *
 * Behavior:
 *   - On mount: fetch all batches (most-recent first) once, cache them.
 *   - value !== null → show the linked batch's label + an "Unlink"
 *     button (onChange(null)).
 *   - value === null → "Link a batch..." button that opens an inline
 *     picker panel with a text filter + scrollable list.
 *   - Shows ALL batches regardless of status (admin discretion — no
 *     "not shipped yet" warnings, no status filter).
 *
 * Brand: PCT navy #03374f, orange #f26b2b. Zero #003d79.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link2, Loader2, Package, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { InlineAlert } from '@/components/admin/marketing/shared'
import type { BatchPickerRow } from '@/lib/admin-db'

interface Props {
  value: number | null
  onChange: (batchId: number | null) => void
  label?: string
}

function formatBatchDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function BatchPicker({ value, onChange, label = 'Linked batch (optional)' }: Props) {
  const [batches, setBatches] = useState<BatchPickerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [picking, setPicking] = useState(false)
  const [filter, setFilter] = useState('')
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/admin/marketing/recap/batches-for-picker', {
          cache: 'no-store',
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data?.error || `Failed to load batches (${res.status})`)
        if (!cancelled) setBatches(Array.isArray(data.batches) ? data.batches : [])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load batches')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Collapse the picker panel on outside click.
  useEffect(() => {
    if (!picking) return
    function onDocClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPicking(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [picking])

  const selected = useMemo(
    () => (value == null ? null : batches.find((b) => b.id === value) ?? null),
    [value, batches],
  )

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return batches
    return batches.filter((b) => b.label.toLowerCase().includes(q))
  }, [batches, filter])

  function choose(id: number) {
    onChange(id)
    setPicking(false)
    setFilter('')
  }

  return (
    <div className="space-y-1.5" ref={panelRef}>
      <Label>{label}</Label>

      {error && (
        <InlineAlert kind="error" message={error} onClose={() => setError('')} />
      )}

      {/* Linked state: show the batch + Unlink */}
      {value != null ? (
        <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
          <Package className="w-4 h-4 flex-shrink-0 text-[#f26b2b]" />
          <span className="flex-1 min-w-0 truncate text-sm text-[#03374f]">
            {selected ? selected.label : `Batch #${value}`}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => { onChange(null); setPicking(false) }}
            className="h-7 px-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Unlink
          </Button>
        </div>
      ) : !picking ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => setPicking(true)}
          disabled={loading}
          className="w-full justify-start border-gray-200 text-[#03374f] font-normal"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin text-gray-400" />
          ) : (
            <Link2 className="w-4 h-4 mr-2 text-[#f26b2b]" />
          )}
          Link a batch...
        </Button>
      ) : (
        // Picker mode: inline panel with text filter + scrollable list.
        <div className="rounded-md border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 px-2.5 py-2">
            <Search className="w-4 h-4 flex-shrink-0 text-gray-400" />
            <Input
              autoFocus
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter batches..."
              className="h-8 border-0 px-0 shadow-none focus-visible:ring-0"
            />
            <button
              type="button"
              onClick={() => { setPicking(false); setFilter('') }}
              className="text-xs text-gray-400 hover:text-[#03374f] px-1"
              aria-label="Cancel"
            >
              Cancel
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto py-1">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading batches...
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-400">
                No batches match.
              </div>
            ) : (
              filtered.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => choose(b.id)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                >
                  <Package className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                  <span className="flex-1 min-w-0 truncate text-[#03374f]">{b.label}</span>
                  <span className="flex-shrink-0 text-[11px] text-gray-400">
                    {formatBatchDate(b.created_at)}
                    {b.status ? ` • ${b.status}` : ''}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
