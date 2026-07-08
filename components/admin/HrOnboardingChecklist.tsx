'use client'

/**
 * HR onboarding checklist panel (v1 — manual).
 *
 * Shows the hr_onboarding_items grouped by category with a per-item
 * mark-complete / mark-pending control and an overall progress count.
 * Manual only — HR ticks items by hand. Hits the gated PATCH route
 * (/api/admin/hr/onboarding/[id]/items/[itemId]) which touches ONLY
 * hr_onboarding_items.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Circle, RefreshCw } from 'lucide-react'

const NAVY = '#03374f'

const CATEGORY_ORDER = ['administrative', 'marketing', 'customer-service', 'it'] as const
const CATEGORY_LABELS: Record<string, string> = {
  'administrative':   'Administrative',
  'marketing':        'Marketing',
  'customer-service': 'Customer Service',
  'it':               'IT',
}

export interface ChecklistItem {
  id:           number
  item_key:     string
  label:        string
  category:     string
  status:       string
  completed_at: string | null
  completed_by: string | null
}

export default function HrOnboardingChecklist({
  onboardingId,
  items: initialItems,
}: {
  onboardingId: number
  items: ChecklistItem[]
}) {
  const router = useRouter()
  const [items, setItems] = useState<ChecklistItem[]>(initialItems)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Track an in-progress HR toggle so a focus-refetch never clobbers it.
  const busyIdRef = useRef<number | null>(null)
  busyIdRef.current = busyId

  const total = items.length
  const complete = items.filter((i) => i.status === 'complete').length

  // Refetch current items from the server (truth) and merge in. Department
  // completions are written from a SEPARATE session, so the open HR page
  // can be stale; refetching on focus picks them up. Skipped while an HR
  // toggle is mid-flight so we don't overwrite an optimistic local change.
  const refetch = useCallback(async () => {
    if (busyIdRef.current !== null) return
    try {
      setRefreshing(true)
      const res = await fetch(`/api/admin/hr/onboarding/${onboardingId}/items`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })
      if (!res.ok) return
      const data = await res.json().catch(() => null)
      if (!data?.items || busyIdRef.current !== null) return
      setItems(data.items as ChecklistItem[])
    } catch {
      // Silent — focus-refetch is a freshness convenience, not critical.
    } finally {
      setRefreshing(false)
    }
  }, [onboardingId])

  // Refetch on window focus / tab becoming visible. Lightweight — event
  // driven, NOT polling.
  useEffect(() => {
    const onFocus = () => { void refetch() }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void refetch()
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [refetch])

  async function toggle(item: ChecklistItem) {
    const next = item.status === 'complete' ? 'pending' : 'complete'
    setBusyId(item.id)
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/hr/onboarding/${onboardingId}/items/${item.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: next }),
        },
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'Failed to update item.')
        return
      }
      const updated = data.item as ChecklistItem
      setItems((prev) => prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)))
      router.refresh()
    } catch {
      setError('Network error — please try again.')
    } finally {
      setBusyId(null)
    }
  }

  const byCategory = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: items.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0)

  // Any uncategorized leftovers (defensive).
  const known = new Set(CATEGORY_ORDER as readonly string[])
  const other = items.filter((i) => !known.has(i.category))
  if (other.length > 0) byCategory.push({ category: 'other', label: 'Other', items: other } as never)

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: NAVY }}>
            Onboarding Checklist
          </h2>
          <p className="text-sm text-gray-500">
            Manual checklist — mark items as you complete them.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={refreshing || busyId !== null}
            title="Refresh from server"
            aria-label="Refresh checklist"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition hover:text-[#03374f] hover:border-gray-300 disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: NAVY }}>
              {complete}/{total}
            </div>
            <div className="text-xs text-gray-500">complete</div>
          </div>
        </div>
      </div>

      {total > 0 && (
        <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${total ? (complete / total) * 100 : 0}%`, backgroundColor: NAVY }}
          />
        </div>
      )}

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {byCategory.map((group) => (
          <div key={group.category}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              {group.label}
            </h3>
            <ul className="divide-y divide-gray-100 rounded-md border border-gray-100">
              {group.items.map((item) => {
                const done = item.status === 'complete'
                return (
                  <li key={item.id} className="flex items-center gap-3 px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => toggle(item)}
                      disabled={busyId === item.id}
                      aria-pressed={done}
                      aria-label={done ? `Mark "${item.label}" pending` : `Mark "${item.label}" complete`}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition disabled:opacity-50"
                      style={
                        done
                          ? { backgroundColor: NAVY, borderColor: NAVY, color: '#fff' }
                          : { borderColor: '#cbd5e1', color: '#cbd5e1' }
                      }
                    >
                      {done ? <Check size={14} /> : <Circle size={10} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm ${done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                        {item.label}
                      </div>
                      {done && item.completed_by && (
                        <div className="text-xs text-gray-400">
                          Completed by {item.completed_by}
                          {item.completed_at ? ` · ${new Date(item.completed_at).toLocaleDateString()}` : ''}
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
