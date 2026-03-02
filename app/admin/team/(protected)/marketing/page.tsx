/**
 * /admin/team/marketing — Email marketing overview (Mailchimp)
 */
import Link from 'next/link'
import { Mail, ExternalLink, AlertCircle } from 'lucide-react'
import { getAllEmployeesAdmin } from '@/lib/admin-db'
import { MarketingStudioClient } from '@/components/admin/MarketingStudioClient'

export const metadata = { title: 'Email Marketing | PCT Team Admin' }
export const revalidate = 300

// Fetch Mailchimp stats server-side for a single audience
async function fetchAudienceStats(audienceId: string) {
  const apiKey = process.env.MAILCHIMP_API_KEY
  const server = process.env.MAILCHIMP_SERVER
  if (!apiKey || !server) return null

  try {
    const res = await fetch(
      `https://${server}.api.mailchimp.com/3.0/lists/${audienceId}?fields=id,name,stats`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        next:    { revalidate: 300 },
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    return {
      member_count:   data.stats?.member_count   ?? 0,
      open_rate:      data.stats?.open_rate       ?? 0,
      click_rate:     data.stats?.click_rate      ?? 0,
      campaign_count: data.stats?.campaign_count  ?? 0,
    }
  } catch {
    return null
  }
}

export default async function MarketingPage() {
  const employees = await getAllEmployeesAdmin()
  const mailchimpServer = process.env.MAILCHIMP_SERVER || 'us1'

  // Only reps with a Mailchimp audience ID
  const withMc = employees.filter((e) => e.mailchimp_audience_id)

  // Fetch stats in parallel (cap to 10 concurrent)
  const statsMap: Record<string, Awaited<ReturnType<typeof fetchAudienceStats>>> = {}
  await Promise.all(
    withMc.map(async (e) => {
      statsMap[e.slug] = await fetchAudienceStats(e.mailchimp_audience_id!)
    })
  )

  const totalSubscribers = withMc.reduce((sum, e) => {
    return sum + (statsMap[e.slug]?.member_count ?? 0)
  }, 0)

  const configured    = process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_SERVER
  const noAudienceReps = employees.filter((e) => !e.mailchimp_audience_id && e.active && e.website_active)
  const audienceOptions = withMc.map((e) => ({
    slug: e.slug,
    name: e.name,
    audienceId: e.mailchimp_audience_id!,
  }))

  return (
    <div className="max-w-5xl mx-auto space-y-8 pt-2 lg:pt-0">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#03374f]">Email Marketing</h1>
        <p className="text-gray-500 text-sm mt-1">
          Mailchimp audience stats for each rep. Subscribers come from their profile page sign-up form.
        </p>
      </div>

      {/* Mailchimp not configured warning */}
      {!configured && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">Mailchimp not configured</p>
            <p className="text-amber-700 text-sm mt-1">
              Add <code className="bg-amber-100 px-1 rounded">MAILCHIMP_API_KEY</code> and{' '}
              <code className="bg-amber-100 px-1 rounded">MAILCHIMP_SERVER</code> to your Vercel environment variables to see live subscriber counts.
            </p>
          </div>
        </div>
      )}

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Reps with Audience',    value: withMc.length },
          { label: 'Total Subscribers',     value: totalSubscribers.toLocaleString() },
          { label: 'Reps Needing Setup',    value: noAudienceReps.length },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="text-2xl font-bold text-[#03374f]">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Rep audience cards */}
      {withMc.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#f26b2b]" />
            <h2 className="font-semibold text-[#03374f] text-sm">Rep Audiences</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500">Rep</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 text-right">Subscribers</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 text-right">Open Rate</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 text-right">Click Rate</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 text-right">Campaigns</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {withMc.map((e) => {
                const st = statsMap[e.slug]
                return (
                  <tr key={e.id} className="border-t border-gray-50 hover:bg-gray-50/40 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-medium text-[#03374f]">{e.name}</div>
                      <div className="text-xs text-gray-400 font-mono">{e.mailchimp_audience_id}</div>
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-[#03374f]">
                      {st ? st.member_count.toLocaleString() : '—'}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-600">
                      {st ? `${(st.open_rate * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-600">
                      {st ? `${(st.click_rate * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-600">
                      {st?.campaign_count ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/team/employees/${e.slug}`}
                          className="text-xs text-[#f26b2b] hover:underline"
                        >
                          Edit
                        </Link>
                        <a
                          href={`https://${mailchimpServer}.admin.mailchimp.com/lists/members/?id=${e.mailchimp_audience_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                        >
                          Mailchimp <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <MarketingStudioClient audiences={audienceOptions} />

      {/* Reps needing setup */}
      {noAudienceReps.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <h2 className="font-semibold text-[#03374f] text-sm">Live Pages Without Mailchimp</h2>
            <span className="text-xs text-gray-400">(website is active but no audience ID set)</span>
          </div>
          <div className="divide-y divide-gray-50">
            {noAudienceReps.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50/40">
                <div>
                  <span className="font-medium text-[#03374f] text-sm">{e.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{e.title}</span>
                </div>
                <Link
                  href={`/admin/team/employees/${e.slug}`}
                  className="text-xs text-[#f26b2b] hover:underline"
                >
                  Add Audience ID →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
