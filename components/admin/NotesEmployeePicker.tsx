"use client"

/**
 * Client-side search filter for the notes employee picker.
 * Receives the server-fetched minimal list (id + name only) as props —
 * no client fetch, no widened query.
 */
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Search } from 'lucide-react'

export interface NotesPickerEmployee {
  id:         number
  first_name: string
  last_name:  string
}

function matchesQuery(emp: NotesPickerEmployee, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const first = emp.first_name.toLowerCase()
  const last = emp.last_name.toLowerCase()
  const full = `${first} ${last}`
  return first.includes(q) || last.includes(q) || full.includes(q)
}

export default function NotesEmployeePicker({
  employees,
}: {
  employees: NotesPickerEmployee[]
}) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () => employees.filter((emp) => matchesQuery(emp, query)),
    [employees, query],
  )

  const trimmed = query.trim()

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name…"
          aria-label="Search employees by name"
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-[#03374f] outline-none transition placeholder:text-gray-400 focus:border-[#f26b2b] focus:ring-2 focus:ring-[#f26b2b]/20"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-400 shadow-sm">
          {trimmed
            ? <>No employees match &lsquo;{trimmed}&rsquo;.</>
            : 'No active employees found.'}
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {filtered.map((emp) => (
            <li key={emp.id}>
              <Link
                href={`/admin/team/notes/${emp.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 text-sm transition hover:bg-gray-50"
              >
                <span className="font-medium text-[#03374f]">
                  {emp.first_name} {emp.last_name}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-gray-300" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
