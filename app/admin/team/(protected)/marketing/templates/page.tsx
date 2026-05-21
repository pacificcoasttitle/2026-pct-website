/**
 * /admin/team/marketing/templates — list of all email templates.
 */
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import { TemplatesManager } from '@/components/admin/marketing/TemplatesManager'

export const metadata = { title: 'Email Templates | PCT Team Admin' }
export const dynamic  = 'force-dynamic'

export default function TemplatesPage() {
  return (
    <div className="space-y-6 pt-2 lg:pt-0 max-w-5xl">
      <header className="space-y-2">
        <Link href="/admin/team/marketing"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#f26b2b]">
          <ArrowLeft className="w-3 h-3" /> Back to Marketing
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#03374f]">
          <FileText className="w-6 h-6 text-[#f26b2b]" />
          Email Templates
        </h1>
        <p className="text-sm text-gray-500">
          Edit default templates or create your own. Use any template to launch a campaign.
        </p>
      </header>

      <TemplatesManager />
    </div>
  )
}
