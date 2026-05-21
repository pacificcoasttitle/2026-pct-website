/**
 * /admin/team/marketing/history/[batchId] — batch detail.
 */
import Link from 'next/link'
import { ArrowLeft, History } from 'lucide-react'
import { BatchDetail } from '@/components/admin/marketing/BatchDetail'

export const metadata = { title: 'Batch Detail | PCT Team Admin' }
export const dynamic  = 'force-dynamic'

export default async function BatchDetailPage({
  params,
}: {
  params: Promise<{ batchId: string }>
}) {
  const { batchId } = await params

  return (
    <div className="space-y-5 pt-2 lg:pt-0 max-w-5xl">
      <header className="space-y-2">
        <Link href="/admin/team/marketing/history"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#f26b2b]">
          <ArrowLeft className="w-3 h-3" /> Back to history
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#03374f]">
          <History className="w-6 h-6 text-[#f26b2b]" />
          Batch Detail
        </h1>
        <p className="text-[11px] text-gray-400 font-mono">{batchId}</p>
      </header>

      <BatchDetail batchId={batchId} />
    </div>
  )
}
