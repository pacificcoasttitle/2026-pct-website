/**
 * /admin/team/signatures/[staffId]/edit — edit a staff_members row.
 *
 * Server component. Fetches the staff row + available office locations,
 * hands them to the form client. Auth enforced by the (protected) route
 * group layout.
 */
import { notFound } from 'next/navigation'
import {
  getStaffMemberById,
  getAllOfficeLocations,
  type OfficeLocation,
} from '@/lib/admin-db'
import { StaffEditClient } from '@/components/admin/signatures/StaffEditClient'

export const metadata = { title: 'Edit Staff Member | PCT Team Admin' }
export const dynamic  = 'force-dynamic'

export default async function StaffEditPage({
  params,
}: {
  params: Promise<{ staffId: string }>
}) {
  const { staffId } = await params
  const id = parseInt(staffId, 10)
  if (!Number.isFinite(id) || id <= 0) notFound()

  const staff = await getStaffMemberById(id)
  if (!staff) notFound()

  let offices: OfficeLocation[] = []
  try { offices = await getAllOfficeLocations() }
  catch { /* db hiccup — form still usable, office dropdown will be empty */ }

  return <StaffEditClient staff={staff} offices={offices} />
}
