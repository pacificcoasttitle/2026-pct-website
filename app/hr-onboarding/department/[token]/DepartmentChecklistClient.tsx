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
  label,
  initialItems,
  initialNote,
  locked,
}: {
  token:        string
  label:        string
  initialItems: DepartmentItem[]
  initialNote:  string
  locked:       boolean
}) {
  const [items, setItems] = useState(initialItems)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Notes-to-HR state (Part G). Save on blur when the value changed.
  const [note, setNote] = useState(initialNote)
  const [savedNote, setSavedNote] = useState(initialNote)
  const [noteSaving, setNoteSaving] = useState(false)
  const [noteStatus, setNoteStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  // Persist the note if it changed since the last successful save. Returns
  // true if the note is now in sync with the server (either it was already
  // saved, or this call saved it). Used both by the blur handler and — to
  // close the note-vs-complete race — synchronously before completing the
  // department's LAST item.
  async function flushNote(): Promise<boolean> {
    if (note === savedNote) return true
    setNoteSaving(true)
    setNoteStatus('idle')
    try {
      const res = await fetch(`/api/hr-onboarding/department/${token}/note`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setNoteStatus('error')
        return false
      }
      setSavedNote(note)
      setNoteStatus('saved')
      return true
    } catch {
      setNoteStatus('error')
      return false
    } finally {
      setNoteSaving(false)
    }
  }

  async function saveNote() {
    await flushNote()
  }

  async function toggle(item: DepartmentItem) {
    const next = item.status === 'complete' ? 'pending' : 'complete'

    // ⚠️ Note-vs-complete race: completing the LAST pending item triggers the
    // "department done" email (maybeNotifyDepartmentComplete), which includes
    // the department note. If HR typed a note and clicked complete before the
    // blur-save landed, the email could fire without it. Flush the note FIRST
    // when this toggle completes the final item. Notes are optional, so a
    // flush failure does NOT block completion — it just means the (unsaved)
    // note may not make the email, which is the same as no note.
    if (next === 'complete') {
      const remaining = items.filter(
        (row) => row.id !== item.id && row.status !== 'complete',
      ).length
      if (remaining === 0) {
        await flushNote()
      }
    }

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
  const completeCount = items.filter((row) => row.status === 'complete').length
  const allDone = completeCount === items.length

  return (
    <div className="space-y-4">
      {/* Live progress counter — derived from client `items` state so it
          updates as items are toggled (previously server-rendered/stale). */}
      <div className="rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-foreground">{label}</div>
            <div className="text-xs text-muted-foreground">Task-only department checklist</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: NAVY }}>{completeCount}/{items.length}</div>
            <div className="text-xs text-muted-foreground">complete</div>
          </div>
        </div>
      </div>

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
            You&apos;re all done — HR will be notified
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

      {/* Notes back to HR — token-gated save (save on blur). */}
      <div className="rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
        <label htmlFor="dept-note" className="text-sm font-semibold text-foreground">
          Notes for HR
        </label>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Optional — e.g. what you completed, or anything HR should know.
        </p>
        <textarea
          id="dept-note"
          value={note}
          onChange={(e) => { setNote(e.target.value); setNoteStatus('idle') }}
          onBlur={saveNote}
          disabled={locked || noteSaving}
          rows={4}
          maxLength={2000}
          placeholder="Notes for HR…"
          className="mt-2 w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/25 disabled:opacity-60"
        />
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{note.length}/2000</span>
          <span className="text-xs">
            {noteSaving ? (
              <span className="text-muted-foreground">Saving…</span>
            ) : noteStatus === 'saved' ? (
              <span className="text-[var(--success)]">Saved</span>
            ) : noteStatus === 'error' ? (
              <span className="text-red-600">Couldn&apos;t save — try again</span>
            ) : null}
          </span>
        </div>
      </div>

      {locked && (
        <p className="text-center text-xs text-muted-foreground">
          This checklist is not editable because the onboarding is not ready for department work.
        </p>
      )}
    </div>
  )
}
