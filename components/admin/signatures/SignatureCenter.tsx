'use client'

/**
 * Signature Center — staff roster + CTAs.
 *
 * Lists all staff_members rows with search + office filter. Provides the
 * primary entry points to the CSV importer and (future) single-employee
 * form. Empty state nudges users toward CSV upload.
 */
import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Upload, UserPlus, Search, Users, Mail, Phone, Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { SignaturePreviewModal } from '@/components/admin/signatures/SignaturePreviewModal'
import type { StaffMember, OfficeLocation } from '@/lib/admin-db'

interface Props {
  staff:   StaffMember[]
  offices: OfficeLocation[]
}

export function SignatureCenter({ staff, offices }: Props) {
  const [search,     setSearch]     = useState('')
  const [officeSlug, setOfficeSlug] = useState<string>('all')
  const [modalStaff, setModalStaff] = useState<StaffMember | null>(null)

  const officeBySlug = useMemo(() => {
    const m = new Map<string, OfficeLocation>()
    offices.forEach((o) => m.set(o.slug, o))
    return m
  }, [offices])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return staff.filter((s) => {
      if (officeSlug !== 'all' && (s.office_location || '') !== officeSlug) return false
      if (!q) return true
      const hay = `${s.first_name} ${s.last_name} ${s.email} ${s.title} ${s.department || ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [staff, search, officeSlug])

  const activeCount   = staff.filter((s) => s.active).length
  const inactiveCount = staff.length - activeCount

  /* ── Empty state ─────────────────────────────────────────────── */
  if (staff.length === 0) {
    return (
      <Card className="p-10 text-center space-y-4 border-dashed">
        <div className="mx-auto w-14 h-14 rounded-full bg-[#f26b2b]/10 flex items-center justify-center">
          <Users className="w-7 h-7 text-[#f26b2b]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#03374f]">No staff yet</h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload your staff roster to get started.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <Link href="/admin/team/signatures/import">
            <Button className="bg-[#f26b2b] hover:bg-[#d85a20] text-white">
              <Upload className="w-4 h-4 mr-2" />
              Upload Staff CSV
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  /* ── Populated state ─────────────────────────────────────────── */
  return (
    <div className="space-y-5">
      {/* Overview + CTAs */}
      <Card className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#f26b2b]" />
              <span className="font-semibold text-[#03374f]">Staff Overview</span>
            </div>
            <span className="text-gray-500">
              Total: <span className="font-medium text-[#03374f]">{staff.length}</span>
              {' · '}
              Active: <span className="font-medium text-green-700">{activeCount}</span>
              {' · '}
              Inactive: <span className="font-medium text-gray-600">{inactiveCount}</span>
            </span>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/team/signatures/import">
              <Button className="bg-[#f26b2b] hover:bg-[#d85a20] text-white">
                <Upload className="w-4 h-4 mr-2" />
                Upload Staff CSV
              </Button>
            </Link>
            <Button variant="outline" disabled title="Coming soon">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Single Employee
            </Button>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, title, department…"
            className="pl-9"
          />
        </div>
        <Select value={officeSlug} onValueChange={setOfficeSlug}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="All Offices" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Offices</SelectItem>
            {offices.map((o) => (
              <SelectItem key={o.slug} value={o.slug}>{o.display_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-sm text-gray-500">
          No staff match the current filters.
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="divide-y divide-gray-100">
            {filtered.map((s) => {
              const office = s.office_location ? officeBySlug.get(s.office_location) : null
              return (
                <div key={s.id}
                     className="px-5 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 hover:bg-gray-50">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#03374f] truncate">
                        {s.last_name}, {s.first_name}
                      </span>
                      {!s.active && (
                        <span className="text-[10px] uppercase tracking-wide bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          Inactive
                        </span>
                      )}
                      {s.part_time && (
                        <span className="text-[10px] uppercase tracking-wide bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                          Part time
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <span className="truncate">{s.title}</span>
                      <span className="inline-flex items-center gap-1">
                        <Mail className="w-3 h-3" /> {s.email}
                      </span>
                      {s.office_direct && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {s.office_direct}
                        </span>
                      )}
                      {office && (
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {office.display_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Link href={`/admin/team/signatures/${s.id}`}>
                      <Button size="sm" variant="outline">View</Button>
                    </Link>
                    <Link href={`/admin/team/signatures/${s.id}/edit`}>
                      <Button size="sm" variant="outline">Edit</Button>
                    </Link>
                    <Button size="sm"
                            onClick={() => setModalStaff(s)}
                            className="bg-[#03374f] hover:bg-[#022838] text-white">
                      Generate Signature
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <SignaturePreviewModal
        open={modalStaff !== null}
        staffId={modalStaff?.id ?? null}
        staffName={modalStaff ? `${modalStaff.first_name} ${modalStaff.last_name}` : ''}
        staffEmail={modalStaff?.email ?? ''}
        onClose={() => setModalStaff(null)}
      />
    </div>
  )
}
