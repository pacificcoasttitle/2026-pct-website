/**
 * /admin/team/asset-delivery — Asset Delivery hub landing.
 *
 * Server component. Fetches the 20 most recent batches and hands off to
 * the client hub. The (protected) segment already enforces auth; we don't
 * re-check here.
 */
import Link from 'next/link'
import { ArrowLeft, Paperclip } from 'lucide-react'
import { getAllAssetDeliveryBatches } from '@/lib/admin-db'
import { AssetDeliveryHub } from '@/components/admin/asset-delivery/AssetDeliveryHub'

export const metadata = { title: 'Asset Delivery | PCT Team Admin' }
export const dynamic  = 'force-dynamic'

export default async function AssetDeliveryHubPage() {
  let batches: Awaited<ReturnType<typeof getAllAssetDeliveryBatches>> = []
  try {
    batches = await getAllAssetDeliveryBatches({ limit: 20 })
  } catch (err) {
    // DB down — render the empty state rather than 500-ing the page.
    console.warn('[asset-delivery-hub] failed to load batches:', err)
  }

  // Serialize Date columns to ISO strings before sending to the client.
  const initialBatches = batches.map((b) => ({
    ...b,
    sent_at:    b.sent_at    ? new Date(b.sent_at).toISOString()    : null,
    created_at: new Date(b.created_at).toISOString(),
    updated_at: new Date(b.updated_at).toISOString(),
  }))

  return (
    <div className="space-y-5 pt-2 lg:pt-0 max-w-5xl">
      <header className="space-y-2">
        <Link
          href="/admin/team/marketing"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#f26b2b]"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Marketing
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#03374f]">
          <Paperclip className="w-6 h-6 text-[#f26b2b]" />
          Asset Delivery
        </h1>
        <p className="text-gray-500 text-sm">
          Send personalized marketing pieces to your sales team as email attachments.
        </p>
      </header>

      <AssetDeliveryHub initialBatches={initialBatches} />
    </div>
  )
}
