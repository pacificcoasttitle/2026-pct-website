'use client'

/**
 * OnboardingChecklist — per-rep checklist (admin only).
 *
 * Items grouped by category. Each item has a 3-way status control
 * (pending → in progress → complete). Updates are optimistic and
 * reconciled against the PATCH response (which returns the refreshed
 * record + items, including the rolled-up parent status). Mirrors the
 * calendar toggle's optimistic-update + reconcile spirit.
 *
 * Brand: PCT navy #03374f, orange #f26b2b.
 */

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Circle, Clock, Loader2 } from 'lucide-react'
import type {
  OnboardingWithItems,
  OnboardingItem,
  OnboardingItemStatus,
  OnboardingCategory,
} from '@/lib/admin-db'

const CATEGORY_ORDER: OnboardingCategory[] = ['administrative', 'marketing', 'customer-service']
const CATEGORY_LABEL: Record<OnboardingCategory, string> = {
  'administrative':   'Administrative',
  'marketing':        'Marketing',
  'customer-service': 'Customer Service',
}

const NEXT_STATUS: Record<OnboardingItemStatus, OnboardingItemStatus> = {
  pending:     'in_progress',
  in_progress: 'complete',
  complete:    'pending',
}

function fmtDate(iso: string | null): string {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      timeZone: 'America/Los_Angeles',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

export function OnboardingChecklist({
  repId,
  repName,
  initial,
}: {
  repId:   number
  repName: string
  initial: OnboardingWithItems
}) {
  const [items,  setItems]  = useState<OnboardingItem[]>(initial.items)
  const [status, setStatus] = useState(initial.onboarding.status)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error,  setError]  = useState('')

  const total    = items.length
  const complete = useMemo(() => items.filter((i) => i.status === 'complete').length, [items])

  const grouped = useMemo(() => {
    const map = new Map<OnboardingCategory, OnboardingItem[]>()
    for (const c of CATEGORY_ORDER) map.set(c, [])
    for (const it of [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))) {
      const arr = map.get(it.category) ?? []
      arr.push(it)
      map.set(it.category, arr)
    }
    return map
  }, [items])

  async function cycle(item: OnboardingItem) {
    if (busyId !== null) return
    const next = NEXT_STATUS[item.status]
    setBusyId(item.id); setError('')

    const prevItems  = items
    const prevStatus = status
    // Optimistic update.
    setItems((cur) => cur.map((i) => (i.id === item.id ? { ...i, status: next } : i)))

    try {
      const res = await fetch(`/api/admin/onboarding/item/${item.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: next }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to update item')
      // Reconcile against authoritative server state.
      const fresh = data as OnboardingWithItems
      setItems(fresh.items)
      setStatus(fresh.onboarding.status)
    } catch (e) {
      setItems(prevItems)
      setStatus(prevStatus)
      setError(e instanceof Error ? e.message : 'Failed to update item')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-5 pt-2 lg:pt-0 max-w-3xl">
      <header className="space-y-2">
        <Link href="/admin/team/onboarding" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#f26b2b]">
          <ArrowLeft className="w-3 h-3" /> All onboarding
        </Link>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-[#03374f]">{repName}</h1>
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
            status === 'complete'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-[#f26b2b]/15 text-[#c4541d] border border-[#f26b2b]/30'
          }`}>
            {status.replace('_', ' ')}
          </span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 max-w-sm rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-[#f26b2b] transition-all"
              style={{ width: `${total > 0 ? Math.round((complete / total) * 100) : 0}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-[#03374f]">{complete} / {total} complete</span>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      {CATEGORY_ORDER.map((cat) => {
        const list = grouped.get(cat) ?? []
        if (list.length === 0) return null
        return (
          <section key={cat} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-[#03374f] text-white text-xs font-bold uppercase tracking-wider">
              {CATEGORY_LABEL[cat]}
            </div>
            <ul className="divide-y divide-gray-50">
              {list.map((item) => {
                const isBusy = busyId === item.id
                return (
                  <li key={item.id} className="flex items-center gap-3 px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => cycle(item)}
                      disabled={busyId !== null}
                      title="Click to advance: pending → in progress → complete"
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-60 ${
                        item.status === 'complete'
                          ? 'bg-emerald-500 text-white'
                          : item.status === 'in_progress'
                            ? 'bg-[#f26b2b] text-white'
                            : 'border-2 border-gray-300 text-gray-300 hover:border-[#f26b2b] hover:text-[#f26b2b]'
                      }`}
                    >
                      {isBusy
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : item.status === 'complete'
                          ? <Check className="w-4 h-4" />
                          : item.status === 'in_progress'
                            ? <Clock className="w-3.5 h-3.5" />
                            : <Circle className="w-3 h-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${item.status === 'complete' ? 'text-gray-400 line-through' : 'text-[#03374f]'}`}>
                        {item.label}
                      </p>
                      {item.status === 'complete' && (item.completed_by || item.completed_at) && (
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {item.completed_by ? `by ${item.completed_by}` : ''}
                          {item.completed_by && item.completed_at ? ' · ' : ''}
                          {item.completed_at ? fmtDate(item.completed_at) : ''}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 capitalize flex-shrink-0">
                      {item.status.replace('_', ' ')}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
