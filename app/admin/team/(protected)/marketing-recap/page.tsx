/**
 * /admin/team/marketing-recap — Marketing Recap hub landing.
 *
 * Server component. Phase B1 only renders navigation cards (Recipients,
 * Upcoming) plus an empty Recent Drafts placeholder; Phase D fills the
 * drafts list with real data.
 *
 * The (protected) segment already enforces auth; no re-check here.
 */
import Link from 'next/link'
import { ArrowLeft, Newspaper, Users, CalendarClock, ChevronRight, Inbox } from 'lucide-react'
import { Card } from '@/components/ui/card'

export const metadata = { title: 'Marketing Recap | PCT Team Admin' }
export const dynamic  = 'force-dynamic'

export default async function MarketingRecapHubPage() {
  return (
    <div className="space-y-5 pt-2 lg:pt-0 max-w-5xl">
      <header className="space-y-2">
        <Link
          href="/admin/team"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#f26b2b]"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Dashboard
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#03374f]">
          <Newspaper className="w-6 h-6 text-[#f26b2b]" />
          Marketing Recap
        </h1>
        <p className="text-gray-500 text-sm">
          Weekly recap of marketing activity.
        </p>
      </header>

      {/* ── Setup cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NavCard
          href="/admin/team/marketing-recap/recipients"
          icon={<Users className="w-6 h-6" />}
          title="Recipients"
          desc="Manage who receives the weekly recap email."
        />
        <NavCard
          href="/admin/team/marketing-recap/upcoming"
          icon={<CalendarClock className="w-6 h-6" />}
          title="Upcoming"
          desc="Manage the spreadsheet of upcoming marketing items."
        />
      </div>

      {/* ── Recent drafts (Phase D placeholder) ─────────────────── */}
      <Card className="overflow-hidden p-0 gap-0">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-[#f26b2b]" />
            <h2 className="font-semibold text-[#03374f] text-sm">Recent Drafts</h2>
          </div>
          <span className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">
            Phase D
          </span>
        </div>
        <div className="px-6 py-14 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Inbox className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-[#03374f] mb-1">No drafts yet</p>
          <p className="text-xs text-gray-500 max-w-md">
            Once Phase D ships, weekly recap drafts will appear here for review before sending. For now, set up your Recipients and Upcoming items so the first draft has something to work with.
          </p>
        </div>
      </Card>
    </div>
  )
}

function NavCard({
  href, icon, title, desc,
}: {
  href: string
  icon: React.ReactNode
  title: string
  desc:  string
}) {
  return (
    <Link href={href} className="group block">
      <Card className="p-5 h-full transition-all hover:shadow-md hover:-translate-y-0.5">
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-3 bg-[#03374f]/5 text-[#03374f]">
          {icon}
        </div>
        <h3 className="font-semibold text-[#03374f]">{title}</h3>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
        <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#03374f] group-hover:gap-2 transition-all">
          Open <ChevronRight className="w-3 h-3" />
        </div>
      </Card>
    </Link>
  )
}
