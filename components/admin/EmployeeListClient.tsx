"use client"

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Search,
  Globe,
  Eye,
  Pencil,
  ChevronRight,
  Users,
} from 'lucide-react'

interface EmployeeRow {
  id:             number
  slug:           string
  name:           string
  title:          string | null
  email:          string | null
  mobile:         string | null
  active:         boolean
  website_active: boolean
  featured:       boolean
  view_count:     number
  office_name:    string | null
  dept_name:      string | null
  dept_color:     string | null
  photo_url:      string
}

export default function EmployeeListClient({ employees }: { employees: EmployeeRow[] }) {
  const [query,      setQuery]      = useState('')
  const [deptFilter, setDeptFilter] = useState('all')
  const [showActive, setShowActive] = useState<'all' | 'active' | 'inactive'>('active')

  const depts = useMemo(() => {
    const names = [...new Set(employees.map((e) => e.dept_name).filter(Boolean))] as string[]
    return names.sort()
  }, [employees])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return employees.filter((e) => {
      if (showActive === 'active'   && !e.active) return false
      if (showActive === 'inactive' &&  e.active) return false
      if (deptFilter !== 'all' && e.dept_name !== deptFilter) return false
      if (q && !e.name.toLowerCase().includes(q) &&
               !e.email?.toLowerCase().includes(q) &&
               !e.title?.toLowerCase().includes(q)) return false
      return true
    })
  }, [employees, query, deptFilter, showActive])

  return (
    <div className="max-w-5xl mx-auto space-y-6 pt-2 lg:pt-0">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#03374f]">Employees</h1>
          <p className="text-gray-500 text-sm mt-1">{filtered.length} of {employees.length} shown</p>
        </div>
      </div>

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
              <Link
                key={emp.id}
                href={`/admin/employees/${emp.slug}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/80 transition-colors group"
              >
                {/* Photo */}
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                  <Image
                    src={emp.photo_url}
                    alt={emp.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Name + title */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#03374f] group-hover:text-[#f26b2b] transition-colors truncate">
                    {emp.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{emp.title ?? '—'}</p>
                </div>

                {/* Dept badge */}
                {emp.dept_name && (
                  <span
                    className="hidden sm:inline-flex text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white flex-shrink-0"
                    style={{ backgroundColor: (emp.dept_color ?? '#888') + 'cc' }}
                  >
                    {emp.dept_name}
                  </span>
                )}

                {/* Office */}
                <span className="hidden md:block text-xs text-gray-400 flex-shrink-0 w-32 truncate">
                  {emp.office_name ?? '—'}
                </span>

                {/* Status badges */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!emp.active && (
                    <span className="text-[10px] bg-red-50 text-red-400 border border-red-100 px-2 py-0.5 rounded-full font-medium">
                      Inactive
                    </span>
                  )}
                  {emp.website_active && (
                    <span className="text-[10px] bg-[#f26b2b]/10 text-[#f26b2b] border border-[#f26b2b]/20 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5" /> Live
                    </span>
                  )}
                  {emp.view_count > 0 && (
                    <span className="hidden lg:flex items-center gap-1 text-[10px] text-gray-400">
                      <Eye className="w-3 h-3" />
                      {emp.view_count}
                    </span>
                  )}
                </div>

                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#f26b2b] transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
