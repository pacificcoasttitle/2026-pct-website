/**
 * /admin/team/signatures/[staffId] — staff member detail (read-only).
 *
 * Server component. Resolves the staff_members row + their office, hands
 * everything to the client component which fetches the signature preview
 * separately. Auth enforced by the (protected) route-group layout.
 */
import { notFound } from 'next/navigation'
import {
  getStaffMemberById,
  getOfficeLocationBySlug,
  type OfficeLocation,
} from '@/lib/admin-db'
import { StaffDetailClient } from '@/components/admin/signatures/StaffDetailClient'

export const metadata = { title: 'Staff Detail | PCT Team Admin' }
export const dynamic  = 'force-dynamic'

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ staffId: string }>
}) {
  const { staffId } = await params
  const id = parseInt(staffId, 10)
  if (!Number.isFinite(id) || id <= 0) notFound()

  const staff = await getStaffMemberById(id)
  if (!staff) notFound()

  let office: OfficeLocation | null = null
  if (staff.office_location) {
    try { office = await getOfficeLocationBySlug(staff.office_location) }
    catch { /* db hiccup — page still renders */ }
  }

  return <StaffDetailClient staff={staff} office={office} />
}
