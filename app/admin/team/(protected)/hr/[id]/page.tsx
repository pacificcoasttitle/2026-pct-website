/**
 * /admin/team/hr/[id] — HR employee detail / edit
 *
 * Server component, gated 'hr-tools' (also inherited from the hr/
 * segment layout). Fetches one canonical hr_employees row + LIGHT,
 * READ-ONLY summaries of the linked marketing (vcard) + signature
 * (staff) facets. The edit form (client) edits ONLY hr_employees core
 * fields via the 2d PATCH. The facet panels are display-only and
 * deep-link to the pages that OWN those facets:
 *   - marketing → /admin/team/employees/[slug]
 *   - signature → /admin/team/signatures/[staffId]
 * (both verified against the real routes).
 */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Megaphone,
  PenLine,
  ExternalLink,
  AlertTriangle,
  CircleSlash,
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

  const result = await getHrEmployeeById(idNum)
  if (!result) notFound()

  const { employee, facets } = result

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
        }}
        departments={departments}
        offices={offices}
      />

      {/* Linked facets — READ-ONLY presence + deep-link */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Marketing (vCard) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Megaphone className="w-4 h-4 text-[#f26b2b]" />
            <h2 className="font-semibold text-[#03374f] text-sm">Marketing page</h2>
          </div>
          {facets.vcard ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Linked vCard: <span className="font-medium text-[#03374f]">{facets.vcard.name}</span>
                {!facets.vcard.active && <span className="text-gray-400"> (inactive)</span>}
              </p>
              {facets.vcard.slug ? (
                <Link
                  href={`/admin/team/employees/${facets.vcard.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#f26b2b] hover:underline"
                >
                  Edit marketing profile <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <p className="text-xs text-gray-400">Linked, but no slug on the vCard record.</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400 inline-flex items-center gap-1.5">
              <CircleSlash className="w-3.5 h-3.5" /> No marketing page
            </p>
          )}
        </div>

        {/* Signature (staff) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <PenLine className="w-4 h-4 text-[#f26b2b]" />
            <h2 className="font-semibold text-[#03374f] text-sm">Email signature</h2>
          </div>
          {facets.staff ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Linked staff record: <span className="font-medium text-[#03374f]">{facets.staff.name}</span>
                {!facets.staff.active && <span className="text-gray-400"> (inactive)</span>}
              </p>
              <p className="text-xs text-gray-400">
                Signature template: {facets.staff.has_signature_template ? 'attached' : 'none yet'}
              </p>
              <Link
                href={`/admin/team/signatures/${facets.staff.id}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#f26b2b] hover:underline"
              >
                Open in Signature Center <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <p className="text-sm text-gray-400 inline-flex items-center gap-1.5">
              <CircleSlash className="w-3.5 h-3.5" /> No signature record
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
