/**
 * /admin/team/asset-delivery/new — Asset Delivery campaign wizard.
 *
 * Server component. Loads the active rep roster (used for filename → rep
 * matching and the upload grid) and hands off to the client wizard.
 *
 * Accepts ?batchId=<uuid> to resume editing a draft batch from the hub
 * "Continue editing" link. The client wizard fetches the batch payload
 * via /api/admin/marketing/asset-delivery/batches/[batchId].
 */
import Link from 'next/link'
import { ArrowLeft, Paperclip } from 'lucide-react'
import { getAllEmployeesAdmin } from '@/lib/admin-db'
import { CampaignCreator } from '@/components/admin/asset-delivery/CampaignCreator'
import type { RepRoster } from '@/components/admin/asset-delivery/CampaignCreator'
import { cookies } from 'next/headers'
import { verifyAdminToken, ADMIN_COOKIE } from '@/lib/admin-auth'

export const metadata = { title: 'New Asset Delivery Campaign | PCT Team Admin' }
export const dynamic  = 'force-dynamic'

async function getAdminEmail(): Promise<string> {
  try {
    const jar   = await cookies()
    const token = jar.get(ADMIN_COOKIE)?.value
    if (!token) return ''
    const session = await verifyAdminToken(token)
    return session?.username || ''
  } catch {
    return ''
  }
}

export default async function NewAssetDeliveryCampaignPage() {
  let employees: Awaited<ReturnType<typeof getAllEmployeesAdmin>> = []
  try {
    employees = await getAllEmployeesAdmin()
  } catch (err) {
    console.warn('[asset-delivery-new] failed to load employees:', err)
  }

  const reps: RepRoster[] = employees
    .filter((e) => e.active && e.email)
    .map((e) => ({
      id:          e.id,
      slug:        e.slug,
      name:        e.name,
      first_name:  e.first_name,
      last_name:   e.last_name,
      email:       String(e.email),
      email_prefix: String(e.email).split('@')[0].toLowerCase(),
      title:       e.title,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const adminEmail = await getAdminEmail()

  return (
    <div className="space-y-5 pt-2 lg:pt-0">
      <header className="space-y-2">
        <Link
          href="/admin/team/asset-delivery"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#f26b2b]"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Asset Delivery
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#03374f]">
          <Paperclip className="w-6 h-6 text-[#f26b2b]" />
          New Campaign
        </h1>
      </header>

      <CampaignCreator reps={reps} adminEmail={adminEmail} />
    </div>
  )
}
