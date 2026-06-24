"use client"

import { useState, useMemo } from 'react'
import { Search, Users, AlertTriangle } from 'lucide-react'

interface HrRosterRow {
  id:                 number
  name:               string
  title:              string | null
  email:              string
  department:         string | null
  office:             string | null
  active:             boolean
  needs_dedup_review: boolean
}

export default function HrRosterClient({ employees }: { employees: HrRosterRow[] }) {
  const [query,      setQuery]      = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [showActive, setShowActive] = useState<'all' | 'active' | 'inactive'>('active')

  const depts = useMemo(() => {
    const names = [...new Set(employees.map((e) => e.department).filter(Boolean))] as string[]
    return names.sort()
  }, [employees])

  const flaggedCount = useMemo(
    () => employees.filter((e) => e.needs_dedup_review).length,
    [employees],
  )

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return employees.filter((e) => {
      if (showActive === 'active'   && !e.active) return false
      if (showActive === 'inactive' &&  e.active) return false
      if (deptFilter !== 'all' && e.department !== deptFilter) return false
      if (q && !e.name.toLowerCase().includes(q) &&
               !e.email.toLowerCase().includes(q) &&
               !e.title?.toLowerCase().includes(q)) return false
      return true
    })
  }, [employees, query, deptFilter, showActive])

  return (
    <div className="max-w-5xl mx-auto space-y-6 pt-2 lg:pt-0">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#03374f]">HR Roster</h1>
          <p className="text-gray-500 text-sm mt-1">
            Showing {filtered.length} of {employees.length}
          </p>
        </div>
      </div>

      {/* Dedup review notice — surfaces the flagged rows so HR can spot
          the same-person-different-email pairs (merge tooling comes later). */}
      {flaggedCount > 0 && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            <strong>{flaggedCount}</strong>{' '}
            {flaggedCount === 1 ? 'row is' : 'rows are'} flagged for dedup review
            (possible duplicate people across email addresses). Look for the{' '}
            <span className="inline-flex items-center gap-1 align-middle text-[10px] bg-amber-100 text-amber-700 border border-amber-300 px-1.5 py-0.5 rounded-full font-medium">
              <AlertTriangle className="w-2.5 h-2.5" /> review
            </span>{' '}
            badge. Merge tooling is coming — no action needed yet.
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, title…"
            className="w-full h-9 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#03374f]/15 focus:border-[#03374f]/40"
          />
        </div>

        {/* Department */}
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="h-9 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#03374f]/15"
        >
          <option value="all">All Departments</option>
          {depts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        {/* Status toggle */}
        <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
          {(['all', 'active', 'inactive'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setShowActive(s)}
              className={`px-3 h-9 text-xs font-medium capitalize transition-all ${
                showActive === s
                  ? 'bg-[#03374f] text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No employees match your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((emp) => (
              <div
                key={emp.id}
                className="flex items-center gap-4 px-5 py-3.5"
              >
                {/* Name + title */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#03374f] truncate flex items-center gap-2">
                    {emp.name}
                    {emp.needs_dedup_review && (
                      <span
                        title="Possible duplicate — flagged for HR review"
                        className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 border border-amber-300 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
                      >
                        <AlertTriangle className="w-2.5 h-2.5" /> review
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{emp.title ?? '—'}</p>
                </div>

                {/* Department */}
                <span className="hidden sm:block text-xs text-gray-500 flex-shrink-0 w-32 truncate">
                  {emp.department ?? '—'}
                </span>

                {/* Office */}
                <span className="hidden md:block text-xs text-gray-400 flex-shrink-0 w-36 truncate">
                  {emp.office ?? '—'}
                </span>

                {/* Active status badge */}
                <div className="flex items-center flex-shrink-0">
                  {emp.active ? (
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] bg-red-50 text-red-400 border border-red-100 px-2 py-0.5 rounded-full font-medium">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
