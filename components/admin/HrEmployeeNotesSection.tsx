"use client"

/**
 * HrEmployeeNotesSection — per-employee accomplishment notes.
 *
 * ⚠️ Visibility is SERVER-ENFORCED by the API (getEmployeeNotes): HR/
 * top_level receive all notes with author attribution; an allowlisted
 * manager receives ONLY their own. This component just renders what the
 * gated GET returns — it does NOT filter or trust anything client-side,
 * and it never sends an author/type (the server sets both).
 *
 * The parent only mounts this for authorized users (canView). `canWrite`
 * toggles the "Add accomplishment" form. accomplishment-only: there is NO
 * reprimand/other type control anywhere.
 */

import { useCallback, useEffect, useState } from 'react'

const NAVY = '#03374f'
const ORANGE = '#f26b2b'

interface EmployeeNote {
  id:             number
  author_user_id: number
  author_name:    string | null
  note_type:      string
  body:           string
  category:       string | null
  occurred_on:    string | null
  created_at:     string
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function fmtDate(value: string | null): string {
  if (!value) return ''
  // occurred_on is a plain YYYY-MM-DD; render without TZ shifting.
  const [y, m, dd] = value.split('-').map(Number)
  if (!y || !m || !dd) return value
  return new Date(y, m - 1, dd).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

export default function HrEmployeeNotesSection({
  employeeId,
  canWrite,
  showsAllAuthors,
}: {
  employeeId: number
  canWrite: boolean
  /** HR/top_level see all authors; an allowlisted manager sees only their own. */
  showsAllAuthors: boolean
}) {
  const [notes, setNotes] = useState<EmployeeNote[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [body, setBody] = useState('')
  const [category, setCategory] = useState('')
  const [occurredOn, setOccurredOn] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoadError(null)
      const res = await fetch(`/api/admin/hr/employees/${employeeId}/notes`, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })
      if (!res.ok) {
        setLoadError('Could not load notes.')
        return
      }
      const data = await res.json().catch(() => null)
      setNotes((data?.notes ?? []) as EmployeeNote[])
    } catch {
      setLoadError('Could not load notes.')
    } finally {
      setLoading(false)
    }
  }, [employeeId])

  useEffect(() => { void load() }, [load])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return
    const trimmed = body.trim()
    if (!trimmed) { setFormError('Please enter an accomplishment.'); return }
    setSaving(true)
    setFormError(null)
    try {
      const res = await fetch(`/api/admin/hr/employees/${employeeId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: trimmed,
          category: category.trim() || null,
          occurred_on: occurredOn || null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setFormError(data?.error || 'Could not save the note.')
        return
      }
      setBody('')
      setCategory('')
      setOccurredOn('')
      await load()
    } catch {
      setFormError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold" style={{ color: NAVY }}>Accomplishments</h2>
        <span className="text-xs text-gray-400">
          {showsAllAuthors ? 'All authors' : 'Your notes only'}
        </span>
      </div>

      {canWrite && (
        <form onSubmit={submit} className="mt-4 space-y-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <div>
            <label htmlFor="note-body" className="block text-xs font-medium text-gray-600">
              Add accomplishment
            </label>
            <textarea
              id="note-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              maxLength={4000}
              placeholder="What did they do well?"
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#f26b2b] focus:ring-2 focus:ring-[#f26b2b]/20"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="note-category" className="block text-xs font-medium text-gray-600">
                Category <span className="text-gray-400">(optional)</span>
              </label>
              <input
                id="note-category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                maxLength={100}
                placeholder="e.g. Teamwork"
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#f26b2b] focus:ring-2 focus:ring-[#f26b2b]/20"
              />
            </div>
            <div>
              <label htmlFor="note-date" className="block text-xs font-medium text-gray-600">
                Date <span className="text-gray-400">(optional)</span>
              </label>
              <input
                id="note-date"
                type="date"
                value={occurredOn}
                onChange={(e) => setOccurredOn(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#f26b2b] focus:ring-2 focus:ring-[#f26b2b]/20"
              />
            </div>
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50"
              style={{ backgroundColor: ORANGE }}
            >
              {saving ? 'Saving…' : 'Add accomplishment'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-4">
        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : loadError ? (
          <p className="text-sm text-red-600">{loadError}</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-gray-400">No accomplishments recorded yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notes.map((n) => (
              <li key={n.id} className="py-3">
                <p className="whitespace-pre-wrap text-sm text-gray-800">{n.body}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                  {showsAllAuthors && (
                    <span>By {n.author_name || `User #${n.author_user_id}`}</span>
                  )}
                  {n.category && (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-500">{n.category}</span>
                  )}
                  {n.occurred_on && <span>{fmtDate(n.occurred_on)}</span>}
                  <span className="text-gray-300">Added {fmtDateTime(n.created_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
