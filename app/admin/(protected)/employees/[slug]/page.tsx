/**
 * /admin/employees/[slug] — Edit employee profile
 */
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getEmployeeAdminBySlug, getOfficesAndDepts } from '@/lib/admin-db'
import { resolvePhotoUrl } from '@/types/employee'
import EmployeeEditForm from '@/components/admin/EmployeeEditForm'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const emp = await getEmployeeAdminBySlug(slug)
  return { title: emp ? `Edit ${emp.name} | PCT Admin` : 'Not Found | PCT Admin' }
}

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug }             = await params
  const [emp, { offices, depts }] = await Promise.all([
    getEmployeeAdminBySlug(slug),
    getOfficesAndDepts(),
  ])

  if (!emp) notFound()

  const photo = resolvePhotoUrl({ first_name: emp.first_name, photo_url: emp.photo_url })

  return (
    <EmployeeEditForm
      employee={{ ...emp, photo_url: photo }}
      offices={offices}
      depts={depts}
    />
  )
}
