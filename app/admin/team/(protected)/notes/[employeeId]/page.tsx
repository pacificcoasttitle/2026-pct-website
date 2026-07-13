/**
 * /admin/team/notes/[employeeId] — one employee's notes surface.
 *
 * ⚠️ DATA DISCIPLINE: fetches ONLY:
 *   - getMinimalEmployeeIdentity() — id + name + active (NOT full HR record)
 *   - HrEmployeeNotesSection → existing scoped notes API (manager-private/
 *     HR-all + allowlist authoring)
 * Never getHrEmployeeById, documents, or full roster.
 *
 * Gate: requirePageRole('notes').
 */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { requirePageRole, getAdminSession } from '@/lib/auth/guards'
import {
  canViewAllNotes,
  canWriteNotes,
  getMinimalEmployeeIdentity,
} from '@/lib/hr-employee-notes'
import HrEmployeeNotesSection from '@/components/admin/HrEmployeeNotesSection'

export const metadata = { title: 'Employee Notes | PCT Team Admin' }
export const dynamic = 'force-dynamic'

export default async function NotesEmployeePage({
  params,
}: {
  params: Promise<{ employeeId: string }>
}) {
  await requirePageRole('notes')

  const { employeeId: idStr } = await params
  const employeeId = Number(idStr)
  if (!Number.isInteger(employeeId) || employeeId <= 0) notFound()

  const employee = await getMinimalEmployeeIdentity(employeeId)
  if (!employee || !employee.active) notFound()

  const session = await getAdminSession()
  const showsAllAuthors = session ? canViewAllNotes(session) : false
  const canWrite = session ? await canWriteNotes(session) : false

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-2 lg:pt-0">
      <div>
        <Link
          href="/admin/team/notes"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#f26b2b] transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> All employees
        </Link>
        <h1 className="text-2xl font-bold text-[#03374f]">
          {employee.first_name} {employee.last_name}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Accomplishment notes</p>
      </div>

      <HrEmployeeNotesSection
        employeeId={employee.id}
        canWrite={canWrite}
        showsAllAuthors={showsAllAuthors}
      />
    </div>
  )
}
