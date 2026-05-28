/**
 * /admin/team/marketing-recap/[draftId] — Recap draft detail.
 *
 * Server component. Loads the draft (404 if not found) and the send
 * history (best-effort — if the sends query fails we still render
 * the page without history). Auth is enforced by the (protected)
 * route segment.
 */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import {
  getRecapDraftByDraftId,
  getRecapSendsByDraftId,
  type RecapSend,
} from '@/lib/admin-db'
import { RecapDetail } from '@/components/admin/marketing-recap/RecapDetail'

export const dynamic = 'force-dynamic'

export default async function RecapDetailPage({
  params,
}: {
  params: Promise<{ draftId: string }>
}) {
  const { draftId } = await params

  const draft = await getRecapDraftByDraftId(draftId)
  if (!draft) notFound()

  let sends: RecapSend[] = []
  try {
    sends = await getRecapSendsByDraftId(draftId)
  } catch (err) {
    console.warn('[recap-detail] failed to load sends', err)
  }

  return (
    <div className="min-h-screen bg-[#f0ede9]">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link
          href="/admin/team/marketing-recap"
          className="inline-flex items-center text-sm text-gray-600 hover:text-[#03374f] mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Marketing Recap
        </Link>

        <RecapDetail initialDraft={draft} initialSends={sends} />
      </div>
    </div>
  )
}
