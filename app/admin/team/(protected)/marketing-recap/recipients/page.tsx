/**
 * /admin/team/marketing-recap/recipients — Recipients management page.
 *
 * Server component. Fetches the recipients list (including inactive so
 * admins can see soft-deleted rows) and hands off to the client manager.
 *
 * The Sales Managers panel inside the client component is fetched
 * separately via /api/admin/marketing/recap/sales-managers so the two
 * sources stay clearly demarcated. We pass an `initialSalesManagers`
 * snapshot to avoid an initial empty-state flicker.
 */
import Link from 'next/link'
import { ArrowLeft, Users } from 'lucide-react'
import {
  getRecapRecipients,
  getActiveSalesManagers,
  type RecapRecipient,
  type ActiveSalesManager,
} from '@/lib/admin-db'
import { RecipientsManager } from '@/components/admin/marketing-recap/RecipientsManager'

export const metadata = { title: 'Recipients | Marketing Recap | PCT' }
export const dynamic  = 'force-dynamic'

export default async function RecipientsPage() {
  let recipients: RecapRecipient[] = []
  let salesManagers: ActiveSalesManager[] = []

  try {
    recipients = await getRecapRecipients(false) // include inactive
  } catch (err) {
    console.warn('[recap-recipients] failed to load recipients:', err)
  }

  try {
    salesManagers = await getActiveSalesManagers()
  } catch (err) {
    console.warn('[recap-recipients] failed to load sales managers:', err)
  }

  return (
    <div className="space-y-5 pt-2 lg:pt-0 max-w-4xl">
      <header className="space-y-2">
        <Link
          href="/admin/team/marketing-recap"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#f26b2b]"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Marketing Recap
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#03374f]">
          <Users className="w-6 h-6 text-[#f26b2b]" />
          Recipients
        </h1>
        <p className="text-gray-500 text-sm">
          Manage who receives the weekly recap email. Sales managers are added dynamically via the toggle on each employee&apos;s profile.
        </p>
      </header>

      <RecipientsManager
        initialRecipients={recipients}
        initialSalesManagers={salesManagers}
      />
    </div>
  )
}
