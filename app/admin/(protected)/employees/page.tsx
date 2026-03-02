/**
 * /admin/employees — Employee list
 */
import Link from 'next/link'
import { getAllEmployeesAdmin } from '@/lib/admin-db'
import { resolvePhotoUrl } from '@/types/employee'
import EmployeeListClient from '@/components/admin/EmployeeListClient'

export const metadata = { title: 'Employees | PCT Admin' }
export const revalidate = 60

export default async function EmployeesPage() {
  const employees = await getAllEmployeesAdmin()

  // Serialize for the client component
  const data = employees.map((e) => ({
    id:             e.id,
    slug:           e.slug,
    name:           e.name,
    title:          e.title,
    email:          e.email,
    mobile:         e.mobile,
    active:         e.active,
    website_active: e.website_active,
    featured:       e.featured,
    view_count:     e.view_count,
    office_name:    e.office_name,
    dept_name:      e.dept_name,
    dept_color:     e.dept_color,
    photo_url:      resolvePhotoUrl({ first_name: e.first_name, photo_url: e.photo_url }),
  }))

  return <EmployeeListClient employees={data} />
}
