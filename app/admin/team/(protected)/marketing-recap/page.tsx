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
import { ArrowLeft, Newspaper, Users, CalendarClock, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { getRecapDrafts, getRepRecapDrafts, type RecapDraft, type RepRecapDraft } from '@/lib/admin-db'
import { DraftsList } from '@/components/admin/marketing-recap/DraftsList'
import { RepWeekAheadPanel } from '@/components/admin/marketing-recap/RepWeekAheadPanel'

export const metadata = { title: 'Marketing Recap | PCT Team Admin' }
export const dynamic  = 'force-dynamic'

export default async function MarketingRecapHubPage() {
  // Server-fetch the most recent drafts so the page lands with data already
  // present. The client component refreshes on its own after mutations
  // (generate / send), but the first paint comes from this snapshot.
  let initialDrafts: RecapDraft[] = []
  let listError = ''
  try {
    initialDrafts = await getRecapDrafts({ limit: 20 })
  } catch (err) {
    console.warn('[marketing-recap-hub] failed to load drafts', err)
    listError = 'Could not load drafts. Try refreshing the page.'
  }

  // Latest rep "week ahead" draft (Phase 2). Independent of the manager
  // drafts above — a fetch failure here must not break the manager list.
  let latestRepDraft: RepRecapDraft | null = null
  try {
    const repDrafts = await getRepRecapDrafts({ limit: 1 })
    latestRepDraft = repDrafts[0] ?? null
  } catch (err) {
    console.warn('[marketing-recap-hub] failed to load rep draft', err)
  }

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

      {/* ── Manager Recap drafts ────────────────────────────────── */}
      <DraftsList initialDrafts={initialDrafts} initialError={listError} />

      {/* ── Rep Week-Ahead draft (separate audience: ~all reps) ───── */}
      <div className="pt-2 border-t border-gray-200" />
      <RepWeekAheadPanel initialDraft={latestRepDraft} />
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
