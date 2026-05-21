/**
 * /admin/team/marketing — Email Marketing Hub.
 *
 * Top-level landing for the marketing area. Three primary CTA cards link
 * out to Templates, Campaign Wizard, and History. Recent batches are
 * loaded client-side via /api/admin/marketing/campaigns/batches. Audience
 * and "needs setup" lists are collapsed by default.
 */
import Link from 'next/link'
import {
  Mail, FileText, Send, History, AlertCircle, ChevronRight,
  ExternalLink, ChevronDown, Users,
} from 'lucide-react'
import { getAllEmployeesAdmin } from '@/lib/admin-db'
import {
  Collapsible, CollapsibleTrigger, CollapsibleContent,
} from '@/components/ui/collapsible'
import { Card } from '@/components/ui/card'
import { RecentBatches } from '@/components/admin/marketing/RecentBatches'

export const metadata = { title: 'Email Marketing | PCT Team Admin' }
export const dynamic = 'force-dynamic'

async function fetchAudienceMemberCount(audienceId: string): Promise<number> {
  const apiKey = process.env.MAILCHIMP_API_KEY
  const server = process.env.MAILCHIMP_SERVER
  if (!apiKey || !server) return 0
  try {
    const res = await fetch(
      `https://${server}.api.mailchimp.com/3.0/lists/${audienceId}?fields=stats`,
      {
        headers: { Authorization: `Basic ${Buffer.from(`any:${apiKey}`).toString('base64')}` },
        next:    { revalidate: 300 },
      },
    )
    if (!res.ok) return 0
    const data = await res.json()
    return data.stats?.member_count ?? 0
  } catch { return 0 }
}

export default async function MarketingHubPage() {
  let employees: Awaited<ReturnType<typeof getAllEmployeesAdmin>> = []
  try { employees = await getAllEmployeesAdmin() } catch { /* db offline */ }

  const mailchimpServer  = process.env.MAILCHIMP_SERVER || 'us17'
  const withMc           = employees.filter((e) => e.mailchimp_audience_id)
  const noAudienceReps   = employees.filter((e) => !e.mailchimp_audience_id && e.active && e.website_active)
  const configured       = !!(process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_SERVER)

  // Sum subscribers across audiences (server-side, cached 5min upstream).
  const counts = await Promise.all(withMc.map((e) => fetchAudienceMemberCount(e.mailchimp_audience_id!)))
  const totalSubscribers = counts.reduce((a, b) => a + b, 0)
  const subsByAudience: Record<string, number> = {}
  withMc.forEach((e, i) => { subsByAudience[e.mailchimp_audience_id!] = counts[i] })

  return (
    <div className="space-y-6 pt-2 lg:pt-0 max-w-6xl">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-[#03374f]">
            <Mail className="w-6 h-6 text-[#f26b2b]" />
            Email Marketing
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {withMc.length} {withMc.length === 1 ? 'audience' : 'audiences'} · {totalSubscribers.toLocaleString()} subscribers
          </p>
        </div>
        {!configured && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-xs text-amber-700">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            Add <code className="bg-amber-100 px-1 rounded font-mono">MAILCHIMP_API_KEY</code> to enable live stats.
          </div>
        )}
      </header>

      {/* ── Primary CTA cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NavCard
          href="/admin/team/marketing/templates"
          icon={<FileText className="w-6 h-6" />}
          title="Manage Templates"
          desc="Edit default templates and create custom designs."
        />
        <NavCard
          href="/admin/team/marketing/campaigns/new"
          icon={<Send className="w-6 h-6" />}
          title="Create Campaign"
          desc="Send a template to one or many reps at once."
          accent
        />
        <NavCard
          href="/admin/team/marketing/history"
          icon={<History className="w-6 h-6" />}
          title="Campaign History"
          desc="Review past batches and per-rep status."
        />
      </div>

      {/* ── Recent batches ─────────────────────────────────────── */}
      <Card className="overflow-hidden p-0 gap-0">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#f26b2b]" />
            <h2 className="font-semibold text-[#03374f] text-sm">Recent Batches</h2>
          </div>
          <Link href="/admin/team/marketing/history"
                className="text-xs text-[#f26b2b] hover:underline inline-flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <RecentBatches limit={5} />
      </Card>

      {/* ── Collapsed: Rep Audiences ───────────────────────────── */}
      {withMc.length > 0 && (
        <Collapsible>
          <Card className="overflow-hidden p-0 gap-0">
            <CollapsibleTrigger className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50/60 transition-colors text-left group">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#f26b2b]" />
                <h2 className="font-semibold text-[#03374f] text-sm">
                  Rep Audiences ({withMc.length})
                </h2>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 group-data-[state=open]:rotate-180 transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <table className="w-full text-sm border-t border-gray-50">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-5 py-2.5 text-xs font-semibold text-gray-500">Rep</th>
                    <th className="px-5 py-2.5 text-xs font-semibold text-gray-500 text-right">Subscribers</th>
                    <th className="px-5 py-2.5 text-xs font-semibold text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withMc.map((e) => (
                    <tr key={e.id} className="border-t border-gray-50 hover:bg-gray-50/40">
                      <td className="px-5 py-2.5">
                        <div className="font-medium text-[#03374f]">{e.name}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{e.mailchimp_audience_id}</div>
                      </td>
                      <td className="px-5 py-2.5 text-right font-semibold text-[#03374f]">
                        {(subsByAudience[e.mailchimp_audience_id!] || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link href={`/admin/team/employees/${e.slug}`}
                                className="text-xs text-[#f26b2b] hover:underline">Edit rep</Link>
                          <a href={`https://${mailchimpServer}.admin.mailchimp.com/lists/members/?id=${e.mailchimp_audience_id}`}
                             target="_blank" rel="noopener noreferrer"
                             className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
                            Mailchimp <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* ── Collapsed: Live Pages Without Mailchimp ───────────── */}
      {noAudienceReps.length > 0 && (
        <Collapsible>
          <Card className="overflow-hidden p-0 gap-0">
            <CollapsibleTrigger className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50/60 transition-colors text-left group">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <h2 className="font-semibold text-[#03374f] text-sm">
                  Live Pages Without Mailchimp ({noAudienceReps.length})
                </h2>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 group-data-[state=open]:rotate-180 transition-transform" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="divide-y divide-gray-50 border-t border-gray-50">
                {noAudienceReps.map((e) => (
                  <div key={e.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/40">
                    <div>
                      <span className="font-medium text-[#03374f] text-sm">{e.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{e.title}</span>
                    </div>
                    <Link href={`/admin/team/employees/${e.slug}`}
                          className="text-xs text-[#f26b2b] hover:underline">
                      Add audience ID →
                    </Link>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  )
}

function NavCard({
  href, icon, title, desc, accent,
}: {
  href: string
  icon: React.ReactNode
  title: string
  desc:  string
  accent?: boolean
}) {
  return (
    <Link href={href} className="group block">
      <Card className={`p-5 h-full transition-all hover:shadow-md hover:-translate-y-0.5 ${
        accent ? 'border-[#f26b2b]/40 bg-gradient-to-br from-[#f26b2b]/5 to-transparent' : ''
      }`}>
        <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl mb-3 ${
          accent ? 'bg-[#f26b2b] text-white' : 'bg-[#03374f]/5 text-[#03374f]'
        }`}>
          {icon}
        </div>
        <h3 className="font-semibold text-[#03374f]">{title}</h3>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
        <div className={`mt-4 inline-flex items-center gap-1 text-xs font-semibold ${
          accent ? 'text-[#f26b2b]' : 'text-[#03374f]'
        } group-hover:gap-2 transition-all`}>
          Go <ChevronRight className="w-3 h-3" />
        </div>
      </Card>
    </Link>
  )
}
