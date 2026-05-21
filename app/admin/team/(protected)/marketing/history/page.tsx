/**
 * /admin/team/marketing/history — All campaign batches.
 */
import Link from 'next/link'
import { ArrowLeft, History } from 'lucide-react'
import { HistoryList } from '@/components/admin/marketing/HistoryList'

export const metadata = { title: 'Campaign History | PCT Team Admin' }
export const dynamic  = 'force-dynamic'

export default function HistoryPage() {
  return (
    <div className="space-y-6 pt-2 lg:pt-0 max-w-5xl">
      <header className="space-y-2">
        <Link href="/admin/team/marketing"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#f26b2b]">
          <ArrowLeft className="w-3 h-3" /> Back to Marketing
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#03374f]">
          <History className="w-6 h-6 text-[#f26b2b]" />
          Campaign History
        </h1>
      </header>
      <HistoryList />
    </div>
  )
}
