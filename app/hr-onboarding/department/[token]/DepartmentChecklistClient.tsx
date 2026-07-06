"use client"

import { useState } from 'react'
import { Check, Circle, Loader2, CheckCircle2 } from 'lucide-react'

interface DepartmentItem {
  id:           number
  item_key:     string
  label:        string
  category:     string
  status:       string
  sort_order:   number
  completed_at: string | null
  completed_by: string | null
}

const NAVY = '#03374f'

function formatDate(value: string | null): string {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString()
}

export default function DepartmentChecklistClient({
  token,
  initialItems,
  locked,
}: {
  token:        string
  initialItems: DepartmentItem[]
  locked:       boolean
}) {
  const [items, setItems] = useState(initialItems)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function toggle(item: DepartmentItem) {
    const next = item.status === 'complete' ? 'pending' : 'complete'
    setBusyId(item.id)
    setError(null)
    try {
      const res = await fetch(`/api/hr-onboarding/department/${token}/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'Failed to update item.')
        return
      }
      const updated = data.item as DepartmentItem
      setItems((prev) => prev.map((row) => (row.id === updated.id ? { ...row, ...updated } : row)))
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setBusyId(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-sm">
        No checklist items are assigned to this department for this onboarding.
      </div>
    )
  }

  // DB-backed done-state: every item complete. Reflects the current DB
  // truth on load and updates live after each toggle. Reopening the link
  // later while still all-complete shows the done screen again.
  const allDone = items.every((row) => row.status === 'complete')

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {allDone && (
        <div className="rounded-2xl border border-[var(--success)]/40 bg-[var(--success)]/5 p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-full bg-[var(--success)]/15">
            <CheckCircle2 className="size-8 text-[var(--success)]" aria-hidden="true" />
          </div>
          <h2 className="text-balance text-lg font-semibold" style={{ color: NAVY }}>
            You&apos;re all done — HR has been notified
          </h2>
          <p className="mx-auto mt-1.5 max-w-[440px] text-pretty text-sm text-muted-foreground">
            Every task for your department is complete. There&apos;s nothing more to do here.
            You can still review the tasks below, and this page will keep showing your progress.
          </p>
        </div>
      )}

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {items.map((item) => {
          const done = item.status === 'complete'
          const when = formatDate(item.completed_at)
          return (
            <li key={item.id} className="flex gap-3 px-4 py-4 sm:px-5">
              <button
                type="button"
                onClick={() => toggle(item)}
                disabled={locked || busyId === item.id}
                aria-pressed={done}
                aria-label={done ? `Mark "${item.label}" pending` : `Mark "${item.label}" complete`}
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition disabled:opacity-50"
                style={
                  done
                    ? { backgroundColor: NAVY, borderColor: NAVY, color: '#fff' }
                    : { borderColor: '#cbd5e1', color: '#94a3b8' }
                }
              >
                {busyId === item.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : done ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </button>

              <div className="min-w-0 flex-1">
                <div className={`text-sm font-medium ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {item.label}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {done ? (when ? `Completed ${when}` : 'Complete') : 'Pending'}
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {locked && (
        <p className="text-center text-xs text-muted-foreground">
          This checklist is not editable because the onboarding is not ready for department work.
        </p>
      )}
    </div>
  )
}
