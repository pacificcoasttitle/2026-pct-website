/**
 * /admin/team/notes — dedicated notes landing (minimal employee picker).
 *
 * ⚠️ DATA DISCIPLINE: fetches ONLY getMinimalEmployeeDirectoryForNotes()
 * (id + first/last name, active filter). Never getHrEmployeeById, never
 * documents, never the full roster, never email/phone/title/dept.
 *
 * Gate: requirePageRole('notes') — notes_author's home; top_level/manager
 * via 'all'.
 */
import { requirePageRole } from '@/lib/auth/guards'
import { getMinimalEmployeeDirectoryForNotes } from '@/lib/hr-employee-notes'
import NotesEmployeePicker from '@/components/admin/NotesEmployeePicker'

export const metadata = { title: 'Employee Notes | PCT Team Admin' }
export const dynamic = 'force-dynamic'

export default async function NotesLandingPage() {
  await requirePageRole('notes')

  const employees = await getMinimalEmployeeDirectoryForNotes()

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-2 lg:pt-0">
      <div>
        <h1 className="text-2xl font-bold text-[#03374f]">Employee Notes</h1>
        <p className="text-gray-500 text-sm mt-1">
          Log accomplishments for recognition. Select an employee to view or add notes.
        </p>
      </div>

      {employees.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-400 shadow-sm">
          No active employees found.
        </div>
      ) : (
        <NotesEmployeePicker employees={employees} />
      )}
    </div>
  )
}
