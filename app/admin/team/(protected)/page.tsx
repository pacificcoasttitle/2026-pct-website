/**
 * /admin/team — Team Dashboard
 */
import Link from 'next/link'
import {
  Users,
  Globe,
  Building2,
  Eye,
  ClipboardList,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { getDashboardStats } from '@/lib/admin-db'

export const metadata = { title: 'Dashboard | PCT Team Admin' }
export const revalidate = 60

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <div className="max-w-5xl mx-auto space-y-8 pt-2 lg:pt-0">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#03374f]">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Pacific Coast Title — Team Admin Overview</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label:  'Total Employees',
            value:  stats.totalEmployees,
            icon:   Users,
            color:  'bg-[#03374f]/8 text-[#03374f]',
          },
          {
            label:  'Active',
            value:  stats.activeEmployees,
            icon:   Users,
            color:  'bg-green-50 text-green-600',
          },
          {
            label:  'Website Pages Live',
            value:  stats.websiteActive,
            icon:   Globe,
            color:  'bg-[#f26b2b]/10 text-[#f26b2b]',
          },
          {
            label:  'Farm Requests',
            value:  stats.farmRequests,
            icon:   ClipboardList,
            color:  stats.farmRequests > 0 ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400',
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

      {/* ── Two-column: By Office + By Dept ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* By Office */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-[#f26b2b]" />
            <h2 className="font-semibold text-[#03374f] text-sm">Employees by Office</h2>
          </div>
          <div className="space-y-3">
            {stats.byOffice.map((o) => (
              <div key={o.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 truncate">{o.name}</span>
                <span className="text-sm font-bold text-[#03374f] ml-3 flex-shrink-0">{o.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Department */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-[#f26b2b]" />
            <h2 className="font-semibold text-[#03374f] text-sm">Employees by Department</h2>
          </div>
          <div className="space-y-3">
            {stats.byDept.map((d) => (
              <div key={d.name} className="flex items-center gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-sm text-gray-600 flex-1 truncate">{d.name}</span>
                <span className="text-sm font-bold text-[#03374f]">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top Viewed ── */}
      {stats.topViewed.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#f26b2b]" />
              <h2 className="font-semibold text-[#03374f] text-sm">Most Viewed Profiles</h2>
            </div>
            <Link
              href="/admin/team/employees"
              className="text-xs text-[#f26b2b] hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.topViewed.map((e, i) => (
              <div key={e.slug} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <span className="text-xs font-bold text-gray-300 w-4 text-right flex-shrink-0">
                  {i + 1}
                </span>
                <Link
                  href={`/admin/team/employees/${e.slug}`}
                  className="flex-1 text-sm font-medium text-[#03374f] hover:text-[#f26b2b] transition-colors truncate"
                >
                  {e.name}
                </Link>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0">
                  <Eye className="w-3.5 h-3.5" />
                  {e.views.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div className="bg-[#03374f] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white">Manage Your Team</h3>
          <p className="text-white/50 text-sm mt-0.5">Edit profiles, toggle pages live, update photos.</p>
        </div>
        <Link
          href="/admin/team/employees"
          className="flex-shrink-0 inline-flex items-center gap-2 bg-[#f26b2b] hover:bg-[#e05d1e] text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm shadow"
        >
          <Users className="w-4 h-4" />
          Employee List
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  )
}
