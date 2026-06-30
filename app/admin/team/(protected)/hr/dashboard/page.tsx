/**
 * /admin/team/hr/dashboard — HR overview
 *
 * At-a-glance headcount + breakdowns from hr_employees. Server
 * component, read-only SQL aggregates (no row-loading/JS counting), no
 * external calls. Gated 'hr-tools' (the hr/ segment layout already
 * gates the section; re-asserted here so the page is self-gating).
 *
 * Deliberately NO birthday/anniversary widgets — those fields are NULL
 * until Phase 3 collects them (don't fake empty data). The "recent
 * additions" figure is caveated: right after the 3b backfill every row
 * was created the same day, so it's ~the whole roster until organic
 * adds/edits accrue.
 */
import Link from 'next/link'
import {
  Users,
  Building2,
  Briefcase,
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  ClipboardList,
  Inbox,
} from 'lucide-react'
import { getHrDashboardStats, getHrOnboardingPipelineStats } from '@/lib/admin-db'
import { requirePageRole } from '@/lib/auth/guards'

export const metadata = { title: 'HR Dashboard | PCT Team Admin' }
export const revalidate = 60

export default async function HrDashboardPage() {
  await requirePageRole('hr-tools')

  const [stats, pipeline] = await Promise.all([
    getHrDashboardStats(),
    getHrOnboardingPipelineStats(),
  ])
  const maxDept = Math.max(1, ...stats.byDepartment.map((d) => d.count))
  const maxOffice = Math.max(1, ...stats.byOffice.map((o) => o.count))

  return (
    <div className="max-w-5xl mx-auto space-y-8 pt-2 lg:pt-0">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#03374f]">HR Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Pacific Coast Title — Headcount &amp; breakdowns</p>
        </div>
        <Link
          href="/admin/team/hr"
          className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 text-[#03374f] text-sm font-semibold hover:border-[#f26b2b]/40 hover:text-[#f26b2b] transition-colors flex-shrink-0"
        >
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">View Roster</span>
          <span className="sm:hidden">Roster</span>
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Headcount', value: stats.total,    icon: Users,    color: 'bg-[#03374f]/8 text-[#03374f]' },
          { label: 'Active',          value: stats.active,   icon: Users,    color: 'bg-green-50 text-green-600' },
          { label: 'Inactive',        value: stats.inactive, icon: Users,    color: stats.inactive > 0 ? 'bg-gray-100 text-gray-500' : 'bg-gray-50 text-gray-400' },
          {
            label: 'Need Review',
            value: stats.needsDedupReview,
            icon:  AlertTriangle,
            color: stats.needsDedupReview > 0 ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400',
          },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-4.5 h-4.5" />
            </div>
            <div className="text-2xl font-bold text-[#03374f]">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Dedup-review call-to-action (actionable) ── */}
      {stats.needsDedupReview > 0 && (
        <Link
          href="/admin/team/hr?dedup=1"
          className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 hover:border-amber-300 transition-colors group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">
              {stats.needsDedupReview} {stats.needsDedupReview === 1 ? 'employee needs' : 'employees need'} dedup review
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Possible duplicate people across email addresses. Review them on the roster — merge tooling is coming.
            </p>
          </div>
          <span className="text-xs font-semibold text-amber-700 inline-flex items-center gap-1 flex-shrink-0 group-hover:gap-2 transition-all">
            Review <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      )}

      {/* ── Onboarding pipeline (status visibility, 4f) ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[#f26b2b]" />
            <h2 className="font-semibold text-[#03374f] text-sm">Onboarding pipeline</h2>
          </div>
          <Link
            href="/admin/team/hr/onboarding"
            className="text-xs font-semibold text-gray-500 inline-flex items-center gap-1 hover:text-[#f26b2b] transition-colors"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {[
            { label: 'Invited',     value: pipeline.invited },
            { label: 'In progress', value: pipeline.inProgress },
            { label: 'Submitted',   value: pipeline.submitted, highlight: true },
            { label: 'Finalized',   value: pipeline.finalized },
            { label: 'Cancelled',   value: pipeline.cancelled },
          ].map((s) => (
            <div
              key={s.label}
              className={`rounded-xl border p-3 text-center ${
                s.highlight && s.value > 0
                  ? 'border-[#f26b2b]/30 bg-[#f26b2b]/5'
                  : 'border-gray-100 bg-gray-50/60'
              }`}
            >
              <div className={`text-xl font-bold ${s.highlight && s.value > 0 ? 'text-[#f26b2b]' : 'text-[#03374f]'}`}>
                {s.value}
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* "N awaiting review" actionable CTA → submitted queue */}
        {pipeline.submitted > 0 && (
          <Link
            href="/admin/team/hr/onboarding?status=submitted"
            className="mt-4 flex items-center gap-3 rounded-xl border border-[#f26b2b]/30 bg-[#f26b2b]/5 px-4 py-3 hover:border-[#f26b2b]/50 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#f26b2b]/15 text-[#f26b2b] flex items-center justify-center flex-shrink-0">
              <Inbox className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#03374f]">
                {pipeline.submitted} {pipeline.submitted === 1 ? 'onboarding is' : 'onboardings are'} awaiting review
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                A new hire submitted their packet — review &amp; finalize to add them to the roster.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#f26b2b] inline-flex items-center gap-1 flex-shrink-0 group-hover:gap-2 transition-all">
              Review <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        )}
      </div>

      {/* ── Two-column: By Department + By Office ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* By Department */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-[#f26b2b]" />
            <h2 className="font-semibold text-[#03374f] text-sm">Headcount by Department</h2>
          </div>
          <div className="space-y-2.5">
            {stats.byDepartment.map((d) => (
              <div key={d.department}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 truncate">{d.department}</span>
                  <span className="text-sm font-bold text-[#03374f] ml-3 flex-shrink-0">{d.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#03374f]/70"
                    style={{ width: `${(d.count / maxDept) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Office */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-[#f26b2b]" />
            <h2 className="font-semibold text-[#03374f] text-sm">Headcount by Office</h2>
          </div>
          <div className="space-y-2.5">
            {stats.byOffice.map((o) => (
              <div key={o.office}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600 truncate">{o.office}</span>
                  <span className="text-sm font-bold text-[#03374f] ml-3 flex-shrink-0">{o.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#f26b2b]/70"
                    style={{ width: `${(o.count / maxOffice) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent-additions caveat ── */}
      {stats.recentAdditions > 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <CalendarClock className="w-4 h-4 text-gray-400" />
            <h2 className="font-semibold text-gray-500 text-sm">Recent additions</h2>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Note: {stats.recentAdditions} of {stats.total} rows were created in the last 30 days —
            expected right after the initial roster backfill (every row was created the same day),
            so this isn&apos;t a meaningful &ldquo;new hires&rdquo; signal yet.
          </p>
        </div>
      )}
    </div>
  )
}
