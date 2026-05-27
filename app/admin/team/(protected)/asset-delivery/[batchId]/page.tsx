/**
 * /admin/team/asset-delivery/[batchId] — Batch detail.
 *
 * Server component. Loads the batch + files + sends and hands off to the
 * client detail view. (protected) segment handles auth. We don't refetch
 * client-side on mount because the page is force-dynamic and the data is
 * read-only — only the "Delete batch" action triggers a route change.
 */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import {
  getAssetDeliveryBatchById,
  getFilesByBatchId,
  getSendsByBatchId,
  getPool,
} from '@/lib/admin-db'
import { BatchDetail } from '@/components/admin/asset-delivery/BatchDetail'

export const metadata = { title: 'Asset Delivery Batch | PCT Team Admin' }
export const dynamic  = 'force-dynamic'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default async function AssetDeliveryBatchPage({
  params,
}: {
  params: Promise<{ batchId: string }>
}) {
  const { batchId } = await params
  if (!UUID_RE.test(batchId)) notFound()

  const batch = await getAssetDeliveryBatchById(batchId)
  if (!batch) notFound()

  const [files, sends] = await Promise.all([
    getFilesByBatchId(batchId),
    getSendsByBatchId(batchId),
  ])

  // Date → ISO for the client.
  const initialBatch = {
    ...batch,
    sent_at:    batch.sent_at    ? new Date(batch.sent_at).toISOString()    : null,
    created_at: new Date(batch.created_at).toISOString(),
    updated_at: new Date(batch.updated_at).toISOString(),
  }
  const initialFiles = files.map((f) => ({
    ...f,
    uploaded_at: new Date(f.uploaded_at).toISOString(),
  }))
  const initialSends = sends.map((s) => ({
    ...s,
    sent_at:    s.sent_at    ? new Date(s.sent_at).toISOString()    : null,
    created_at: new Date(s.created_at).toISOString(),
    updated_at: new Date(s.updated_at).toISOString(),
  }))

  // Build an email → sms_code map for display. JOIN against the live
  // vcard_employees table rather than denormalizing sms_code onto
  // asset_delivery_files: rep_email stays the canonical storage
  // column, and codes can shift over time without rewriting history.
  let repCodeByEmail: Record<string, string> = {}
  const distinctEmails = Array.from(
    new Set(
      [
        ...files.map((f) => f.rep_email),
        ...sends.map((s) => s.rep_email),
      ]
        .filter((e): e is string => typeof e === 'string' && e.length > 0)
        .map((e) => e.toLowerCase()),
    ),
  )
  if (distinctEmails.length > 0) {
    try {
      const res = await getPool().query<{ email: string; sms_code: string | null }>(
        `SELECT LOWER(email) AS email, sms_code
         FROM vcard_employees
         WHERE LOWER(email) = ANY($1::text[])`,
        [distinctEmails],
      )
      for (const row of res.rows) {
        if (row.sms_code) {
          repCodeByEmail[row.email] = row.sms_code.toUpperCase()
        }
      }
    } catch (err) {
      console.warn('[asset-delivery-detail] rep code lookup failed (continuing):', err)
    }
  }

  return (
    <div className="space-y-5 pt-2 lg:pt-0 max-w-5xl">
      <header className="space-y-2">
        <Link
          href="/admin/team/asset-delivery"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#f26b2b]"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Asset Delivery
        </Link>
      </header>

      <BatchDetail
        initialBatch={initialBatch}
        initialFiles={initialFiles}
        initialSends={initialSends}
        repCodeByEmail={repCodeByEmail}
      />
    </div>
  )
}
