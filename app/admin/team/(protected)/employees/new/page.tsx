/**
 * /admin/team/employees/new — Create a new employee
 *
 * Captures the minimum required to create a row, then redirects to the
 * full edit form for photo, bio, Mailchimp, etc.
 */
import { getOfficesAndDepts } from '@/lib/admin-db'
import EmployeeNewForm from '@/components/admin/EmployeeNewForm'

export const metadata = { title: 'Add Employee | PCT Team Admin' }

export default async function NewEmployeePage() {
  const { offices, depts } = await getOfficesAndDepts()
  return <EmployeeNewForm offices={offices} depts={depts} />
}
