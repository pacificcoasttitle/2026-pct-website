"use client"

import { useMemo, useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'

const NAVY = '#03374f'
const ORANGE = '#f26b2b'

interface QuarterPreset {
  year:    number
  quarter: number
  start:   string
  end:     string
  label:   string
}

interface NoteRow {
  id:          number
  body:        string
  category:    string | null
  date:        string
  author_name: string | null
}

interface EmployeeGroup {
  employee_id:   number
  employee_name: string
  notes:         NoteRow[]
  note_count:    number
  authors:       string[]
}

interface Coverage {
  total_notes:          number
  employees_with_notes: number
  notes_per_author:     Array<{ author_name: string; count: number }>
  notes_per_employee:   Array<{ employee_id: number; employee_name: string; count: number }>
  window:               QuarterPreset
}

interface AiEmployee {
  employee_id:     number
  employee_name:   string
  note_count:      number
  authors:         string[]
  summary:         string
  themes:          string[]
  source_note_ids: number[]
}

interface DigestResponse {
  ok:        boolean
  coverage:  Coverage
  employees: EmployeeGroup[]
  ai:        { employees: AiEmployee[]; caveats: string[] } | null
  aiError:   string | null
  empty:     boolean
}

function quarterKey(q: QuarterPreset): string {
  return `${q.year}-Q${q.quarter}`
}

export default function HrAccomplishmentsDigestClient({
  quarters,
  defaultQuarter,
}: {
  quarters:       QuarterPreset[]
  defaultQuarter: QuarterPreset
}) {
  const [selectedKey, setSelectedKey] = useState(quarterKey(defaultQuarter))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [digest, setDigest] = useState<DigestResponse | null>(null)

  const selected = useMemo(
    () => quarters.find((q) => quarterKey(q) === selectedKey) ?? defaultQuarter,
    [quarters, selectedKey, defaultQuarter],
  )

  const aiByEmployee = useMemo(() => {
    const map = new Map<number, AiEmployee>()
    for (const row of digest?.ai?.employees ?? []) {
      map.set(row.employee_id, row)
    }
    return map
  }, [digest?.ai])

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/hr/accomplishments-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: selected.year, quarter: selected.quarter }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'Could not generate digest.')
        setDigest(null)
        return
      }
      setDigest(data as DigestResponse)
    } catch {
      setError('Network error. Please try again.')
      setDigest(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Summaries organize the logged notes; recognition decisions are yours.
      </p>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="min-w-[200px] flex-1">
          <label htmlFor="quarter-select" className="block text-xs font-medium text-gray-600">
            Quarter
          </label>
          <select
            id="quarter-select"
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#f26b2b] focus:ring-2 focus:ring-[#f26b2b]/20"
          >
            {quarters.map((q) => (
              <option key={quarterKey(q)} value={quarterKey(q)}>{q.label}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => void generate()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50"
          style={{ backgroundColor: ORANGE }}
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
          ) : (
            <><Sparkles className="h-4 w-4" /> Generate digest</>
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {digest && (
        <>
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Coverage</h2>
            <p className="mt-1 text-xs text-gray-400">{digest.coverage.window.label}</p>
            <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <dt className="text-xs text-gray-500">Total notes</dt>
                <dd className="text-xl font-bold" style={{ color: NAVY }}>{digest.coverage.total_notes}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Employees with notes</dt>
                <dd className="text-xl font-bold" style={{ color: NAVY }}>{digest.coverage.employees_with_notes}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Authors</dt>
                <dd className="text-xl font-bold" style={{ color: NAVY }}>{digest.coverage.notes_per_author.length}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Window</dt>
                <dd className="text-sm font-medium text-gray-700">
                  {digest.coverage.window.start} → {digest.coverage.window.end}
                </dd>
              </div>
            </dl>
            {digest.coverage.notes_per_author.length > 0 && (
              <div className="mt-4 text-xs text-gray-500">
                Notes per author:{' '}
                {digest.coverage.notes_per_author.map((a) => `${a.author_name} (${a.count})`).join(', ')}
              </div>
            )}
          </section>

          {digest.empty ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400 shadow-sm">
              No accomplishment notes logged for this quarter yet.
            </div>
          ) : (
            <>
              {digest.aiError && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {digest.aiError}
                </div>
              )}
              {digest.ai?.caveats?.map((c) => (
                <p key={c} className="text-xs text-gray-500 italic">{c}</p>
              ))}
              <div className="space-y-4">
                {digest.employees.map((emp) => {
                  const aiRow = aiByEmployee.get(emp.employee_id)
                  return (
                    <article
                      key={emp.employee_id}
                      className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                    >
                      <header className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="text-lg font-semibold" style={{ color: NAVY }}>{emp.employee_name}</h3>
                        <span className="text-xs text-gray-400">
                          {emp.note_count} note{emp.note_count === 1 ? '' : 's'}
                          {emp.authors.length > 0 && ` · ${emp.authors.join(', ')}`}
                        </span>
                      </header>

                      {aiRow?.summary && (
                        <div className="mt-3 rounded-xl bg-gray-50 px-4 py-3">
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Digest summary</p>
                          <p className="mt-1 text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">{aiRow.summary}</p>
                          {aiRow.themes.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {aiRow.themes.map((t) => (
                                <span key={t} className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-600 border border-gray-200">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <ul className="mt-4 divide-y divide-gray-100 border-t border-gray-100">
                        {emp.notes.map((n) => (
                          <li key={n.id} className="py-3">
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{n.body}</p>
                            <p className="mt-1 text-xs text-gray-400">
                              {n.date}
                              {n.author_name && ` · ${n.author_name}`}
                              {n.category && ` · ${n.category}`}
                              {' · note #'}{n.id}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </article>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
