"use client"

import React, { useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Mail,
  Phone,
  Search,
  User,
} from 'lucide-react'

interface AssessmentRow {
  id: number
  respondent_name: string
  respondent_email: string
  respondent_phone: string | null
  rep_id: string | null
  rep_name: string | null
  source_channel: string
  capability_score: number
  avg_confidence_score: number
  submitted_at: string
}

function ScoreBadge({ score, max = 100, label }: { score: number; max?: number; label: string }) {
  const pct = max === 100 ? score : (score / max) * 100
  const color =
    pct >= 70 ? 'bg-emerald-100 text-emerald-700' :
    pct >= 40 ? 'bg-amber-100  text-amber-700'   :
                'bg-red-100    text-red-700'

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>
      {label}: {max === 100 ? `${Number(score).toFixed(1)}%` : `${Number(score).toFixed(2)} / ${max}`}
    </span>
  )
}

function CapabilityBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, Number(score)))
  const color = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-gray-600 w-10 text-right">{pct.toFixed(0)}%</span>
    </div>
  )
}

function ExpandedRow({ row }: { row: AssessmentRow }) {
  return (
    <tr>
      <td colSpan={6} className="bg-[#f8f6f3] px-5 py-4 border-b border-gray-100">
        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl">
          {/* Contact info */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Contact</p>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User className="w-3.5 h-3.5 text-gray-400" />
              {row.respondent_name}
            </div>
            <a href={`mailto:${row.respondent_email}`}
              className="flex items-center gap-2 text-sm text-[#f26b2b] hover:underline">
              <Mail className="w-3.5 h-3.5" />
              {row.respondent_email}
            </a>
            {row.respondent_phone && (
              <a href={`tel:${row.respondent_phone}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:underline">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {row.respondent_phone}
              </a>
            )}
          </div>

          {/* Scores */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Scores</p>
            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-gray-500 mb-1">Capability</p>
                <CapabilityBar score={Number(row.capability_score)} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-0.5">Avg Confidence</p>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star}
                      className={`w-3 h-3 rounded-full ${Number(row.avg_confidence_score) >= star ? 'bg-[#f26b2b]' : 'bg-gray-200'}`}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">{Number(row.avg_confidence_score).toFixed(2)} / 5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="space-y-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Details</p>
            <p className="text-sm text-gray-600">
              Rep: <span className="font-medium text-[#03374f]">{row.rep_name || '—'}</span>
            </p>
            {row.rep_id && (
              <p className="text-xs text-gray-400 font-mono">{row.rep_id}</p>
            )}
            <p className="text-xs text-gray-500">
              Source: <span className="font-medium">{row.source_channel || '—'}</span>
            </p>
            <p className="text-xs text-gray-400">
              {new Date(row.submitted_at).toLocaleString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
                hour: 'numeric', minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </td>
    </tr>
  )
}

type SortKey = 'submitted_at' | 'capability_score' | 'avg_confidence_score'

export function AssessmentsClient({ rows }: { rows: AssessmentRow[] }) {
  const [query, setQuery]         = useState('')
  const [sortKey, setSortKey]     = useState<SortKey>('submitted_at')
  const [sortAsc, setSortAsc]     = useState(false)
  const [expanded, setExpanded]   = useState<Set<number>>(new Set())

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((a) => !a)
    else { setSortKey(key); setSortAsc(false) }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = q
      ? rows.filter((r) =>
          [r.respondent_name, r.respondent_email, r.rep_name || '', r.rep_id || '']
            .join(' ').toLowerCase().includes(q)
        )
      : [...rows]

    list.sort((a, b) => {
      let va: number | string = a[sortKey] as number | string
      let vb: number | string = b[sortKey] as number | string
      if (sortKey === 'submitted_at') {
        va = new Date(a.submitted_at).getTime()
        vb = new Date(b.submitted_at).getTime()
      }
      const res = va < vb ? -1 : va > vb ? 1 : 0
      return sortAsc ? res : -res
    })
    return list
  }, [rows, query, sortKey, sortAsc])

  const avgCap  = rows.length ? rows.reduce((s, r) => s + Number(r.capability_score), 0)  / rows.length : 0
  const avgConf = rows.length ? rows.reduce((s, r) => s + Number(r.avg_confidence_score), 0) / rows.length : 0
  const highScorers = rows.filter((r) => Number(r.capability_score) >= 70).length

  function SortBtn({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k
    return (
      <button type="button" onClick={() => toggleSort(k)}
        className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wide ${active ? 'text-[#03374f]' : 'text-gray-400 hover:text-gray-600'}`}>
        {label}
        <ChevronDown className={`w-3 h-3 transition-transform ${active && sortAsc ? 'rotate-180' : ''}`} />
      </button>
    )
  }

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Submissions', value: rows.length, sub: `${filtered.length} shown` },
          { label: 'Avg Capability',    value: `${avgCap.toFixed(1)}%`,   sub: 'across all respondents' },
          { label: 'High Scorers (≥70%)', value: highScorers,               sub: `${((highScorers / (rows.length || 1)) * 100).toFixed(0)}% of total` },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-2xl font-bold text-[#03374f]">{s.value}</p>
            <p className="text-xs font-semibold text-gray-600 mt-0.5">{s.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Avg confidence indicator */}
      {rows.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
          <ClipboardCheck className="w-5 h-5 text-[#f26b2b] flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-500 mb-1">Average Confidence Score</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star}
                  className={`h-2 flex-1 rounded-full ${avgConf >= star ? 'bg-[#f26b2b]' : avgConf >= star - 0.5 ? 'bg-[#f26b2b]/40' : 'bg-gray-200'}`}
                />
              ))}
              <span className="text-sm font-bold text-[#03374f] w-16 text-right">{avgConf.toFixed(2)} / 5</span>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, or rep…"
              className="w-full h-9 pl-9 pr-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm focus:outline-none focus:bg-white"
            />
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            Sort:
            <SortBtn label="Date" k="submitted_at" />
            <SortBtn label="Capability" k="capability_score" />
            <SortBtn label="Confidence" k="avg_confidence_score" />
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <ClipboardCheck className="w-10 h-10 mx-auto mb-4 opacity-30" />
            <p className="text-sm font-medium">No assessment submissions yet.</p>
            <p className="text-xs mt-1">
              Share your assessment link:{' '}
              <a href="/assessment" target="_blank" className="text-[#f26b2b] hover:underline">/assessment</a>
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="w-8 px-4 py-3"></th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500">Respondent</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500">Rep</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500">Capability</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500">Confidence</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <React.Fragment key={r.id}>
                  <tr
                    className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => toggleExpand(r.id)}
                  >
                    <td className="px-4 py-3 text-gray-400">
                      {expanded.has(r.id)
                        ? <ChevronDown className="w-4 h-4" />
                        : <ChevronRight className="w-4 h-4" />
                      }
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#03374f]">{r.respondent_name}</p>
                      <p className="text-xs text-gray-400">{r.respondent_email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.rep_name || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <CapabilityBar score={Number(r.capability_score)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <div key={s}
                            className={`w-2.5 h-2.5 rounded-full ${Number(r.avg_confidence_score) >= s ? 'bg-[#f26b2b]' : 'bg-gray-200'}`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1.5">{Number(r.avg_confidence_score).toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 text-right whitespace-nowrap">
                      {new Date(r.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                  {expanded.has(r.id) && <ExpandedRow row={r} />}
                </React.Fragment>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                    No results match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
