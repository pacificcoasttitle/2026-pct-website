/**
 * /admin/team/onboarding — New-rep onboarding overview.
 *
 * Server component. Lists every started onboarding with the rep's name,
 * progress (X / N complete), status pill, and a link into their
 * checklist. Auth is enforced by the (protected) route segment.
 */
import Link from 'next/link'
import { ArrowLeft, ClipboardCheck, ChevronRight, Inbox } from 'lucide-react'
import {
  getOnboardingList,
  ONBOARDING_ITEM_COUNT,
  type OnboardingListRow,
  type OnboardingStatus,
} from '@/lib/admin-db'

export const metadata = { title: 'Onboarding | PCT Team Admin' }
export const dynamic  = 'force-dynamic'

const STATUS_STYLE: Record<OnboardingStatus, string> = {
  not_started: 'bg-gray-100 text-gray-600 border border-gray-200',
  in_progress: 'bg-[#f26b2b]/15 text-[#c4541d] border border-[#f26b2b]/30',
  complete:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
}

function StatusPill({ status }: { status: OnboardingStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${STATUS_STYLE[status] ?? STATUS_STYLE.not_started}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

export default async function OnboardingOverviewPage() {
  let rows: OnboardingListRow[] = []
  let listError = ''
  try {
    rows = await getOnboardingList()
  } catch (err) {
    console.warn('[onboarding-overview] failed to load', err)
    listError = 'Could not load onboarding records. Try refreshing.'
  }

  return (
    <div className="space-y-5 pt-2 lg:pt-0 max-w-5xl">
      <header className="space-y-2">
        <Link href="/admin/team" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#f26b2b]">
          <ArrowLeft className="w-3 h-3" /> Back to Dashboard
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#03374f]">
          <ClipboardCheck className="w-6 h-6 text-[#f26b2b]" />
          New-Rep Onboarding
        </h1>
        <p className="text-gray-500 text-sm">
          Track each new rep&apos;s checklist. Start onboarding from an employee&apos;s profile page.
        </p>
      </header>

      {listError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {listError}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {rows.length === 0 ? (
          <div className="px-6 py-14 flex flex-col items-center text-center bg-[#f0ede9]/40">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-[#03374f] mb-1">No onboarding started yet</p>
            <p className="text-xs text-gray-500 max-w-md">
              Open an employee&apos;s profile and click <span className="font-semibold">Start onboarding</span> to begin their checklist.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {rows.map((r) => {
              const total = r.total_items || ONBOARDING_ITEM_COUNT
              const pct   = total > 0 ? Math.round((r.complete_items / total) * 100) : 0
              return (
                <Link
                  key={r.id}
                  href={`/admin/team/onboarding/${r.rep_id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/80 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#03374f] group-hover:text-[#f26b2b] transition-colors truncate">
                      {r.rep_name || r.rep_slug || `Rep #${r.rep_id}`}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 w-40 max-w-[40vw] rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full bg-[#f26b2b]" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">
                        {r.complete_items} / {total} complete
                      </span>
                    </div>
                  </div>
                  <StatusPill status={r.status} />
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#f26b2b] transition-colors flex-shrink-0" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
