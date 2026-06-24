/**
 * /admin/team/hr/new — Add HR employee
 *
 * Server component: gated 'hr-tools' (also inherited from the hr/
 * segment layout). Derives the canonical department/office option lists
 * from the existing roster so the form's dropdowns stay in sync without
 * a separate lookup table. The form itself (client) POSTs to
 * /api/admin/hr/employees, which writes ONLY the hr_employees row.
 */
import { getAllHrEmployees } from '@/lib/admin-db'
import { requirePageRole } from '@/lib/auth/guards'
import HrEmployeeNewForm from '@/components/admin/HrEmployeeNewForm'

export const metadata = { title: 'Add Employee | PCT Team Admin' }

export default async function HrNewEmployeePage() {
  await requirePageRole('hr-tools')

  const employees = await getAllHrEmployees()
  const departments = [
    ...new Set(employees.map((e) => e.department?.trim()).filter((d): d is string => !!d)),
  ].sort()
  const offices = [
    ...new Set(employees.map((e) => e.office?.trim()).filter((o): o is string => !!o)),
  ].sort()

  return <HrEmployeeNewForm departments={departments} offices={offices} />
}
