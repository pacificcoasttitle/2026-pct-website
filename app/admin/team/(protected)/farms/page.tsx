/**
 * /admin/team/farms — Farm request management
 */
import { getAllFarmRequests } from '@/lib/admin-db'
import FarmRequestsClient from '@/components/admin/FarmRequestsClient'
import { requirePageRole } from '@/lib/auth/guards'

export const metadata = { title: 'Farm Requests | PCT Team Admin' }
export const revalidate = 0

export default async function FarmsPage() {
  await requirePageRole('farms')
  const requests = await getAllFarmRequests()
  return <FarmRequestsClient initial={requests} />
}
