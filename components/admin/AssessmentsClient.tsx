"use client"

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'

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

export function AssessmentsClient({ rows }: { rows: AssessmentRow[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) =>
      [r.respondent_name, r.respondent_email, r.rep_name || '', r.rep_id || ''].join(' ').toLowerCase().includes(q)
    )
  }, [rows, query])

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by respondent, email, or rep..."
          className="w-full h-11 pl-10 pr-4 bg-white border border-gray-200 rounded-xl text-sm"
        />
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500">Date</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500">Respondent</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500">Rep</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 text-right">Capability</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 text-right">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-gray-100">
                <td className="px-4 py-3 text-gray-500">{new Date(r.submitted_at).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-[#03374f]">{r.respondent_name}</p>
                  <p className="text-xs text-gray-400">{r.respondent_email}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  <p>{r.rep_name || '—'}</p>
                  <p className="text-xs text-gray-400 font-mono">{r.rep_id || ''}</p>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-[#03374f]">{Number(r.capability_score).toFixed(1)}%</td>
                <td className="px-4 py-3 text-right text-gray-600">{Number(r.avg_confidence_score).toFixed(2)} / 5</td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No assessments found.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

