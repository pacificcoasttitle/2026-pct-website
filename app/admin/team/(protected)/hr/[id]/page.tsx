/**
 * /admin/team/hr/[id] — HR employee detail / edit
 *
 * Server component, gated 'hr-tools' (also inherited from the hr/
 * segment layout). Fetches one canonical hr_employees row and renders
 * the core HR fields + the edit form (client) which edits ONLY
 * hr_employees core fields via the 2d PATCH.
 *
 * Fully decoupled from marketing/signature: the page surfaces NO vcard /
 * staff facet panels or cross-links — HR stays HR.
 */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react'
import { getHrEmployeeById, getAllHrEmployees } from '@/lib/admin-db'
import { requirePageRole } from '@/lib/auth/guards'
import HrEmployeeEditForm from '@/components/admin/HrEmployeeEditForm'

export const metadata = { title: 'Employee Detail | PCT Team Admin' }
export const dynamic = 'force-dynamic'

export default async function HrEmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requirePageRole('hr-tools')

  const { id } = await params
  const idNum = Number(id)
  if (!Number.isInteger(idNum) || idNum <= 0) notFound()

  const employee = await getHrEmployeeById(idNum)
  if (!employee) notFound()

  // Canonical dropdown options from the roster (same source as Add).
  const roster = await getAllHrEmployees()
  const departments = [
    ...new Set(roster.map((e) => e.department?.trim()).filter((d): d is string => !!d)),
  ].sort()
  const offices = [
    ...new Set(roster.map((e) => e.office?.trim()).filter((o): o is string => !!o)),
  ].sort()

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-2 lg:pt-0">
      {/* Header */}
      <div>
        <Link
          href="/admin/team/hr"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#f26b2b] transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Back to roster
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-[#03374f]">
            {employee.first_name} {employee.last_name}
          </h1>
          {employee.active ? (
            <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full font-medium">
              Active
            </span>
          ) : (
            <span className="text-[10px] bg-red-50 text-red-400 border border-red-100 px-2 py-0.5 rounded-full font-medium">
              Inactive
            </span>
          )}
          {employee.needs_dedup_review && (
            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-700 border border-amber-300 px-2 py-0.5 rounded-full font-medium">
              <AlertTriangle className="w-2.5 h-2.5" /> review
            </span>
          )}
        </div>
        {employee.title && <p className="text-gray-500 text-sm mt-1">{employee.title}</p>}
      </div>

      {/* Dedup note (HR context) */}
      {employee.needs_dedup_review && employee.dedup_review_note && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{employee.dedup_review_note}</span>
        </div>
      )}

      {/* Edit form (core fields only) */}
      <HrEmployeeEditForm
        employee={{
          id:              employee.id,
          first_name:      employee.first_name,
          last_name:       employee.last_name,
          full_legal_name: employee.full_legal_name,
          title:           employee.title,
          department:      employee.department,
          office:          employee.office,
          email:           employee.email,
          mobile:          employee.mobile,
          office_phone:    employee.office_phone,
          active:          employee.active,
          birthday:        employee.birthday,
          start_date:      employee.start_date,
          photo_url:       employee.photo_url,
        }}
        departments={departments}
        offices={offices}
      />
    </div>
  )
}
