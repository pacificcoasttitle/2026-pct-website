/**
 * /admin/team/sms — SMS marketing overview
 */
import Link from 'next/link'
import { MessageSquare, ExternalLink, CheckCircle, XCircle } from 'lucide-react'
import { getSmsEmployees } from '@/lib/admin-db'
import { CopyButton } from '@/components/admin/CopyButton'
import { SmsStudioSender } from '@/components/admin/SmsStudioSender'
import { SmsServiceBadge } from '@/components/admin/SmsServiceBadge'

export const metadata = { title: 'SMS | PCT Team Admin' }
export const dynamic = 'force-dynamic'

export default async function SmsPage() {
  const employees = await getSmsEmployees()
  const active    = employees.filter((e) => e.active)
  const totalOptIns = employees.reduce((sum, e) => sum + e.sms_opt_ins, 0)

  return (
    <div className="space-y-6 pt-2 lg:pt-0">

      {/* Header row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#03374f]">SMS Command Center</h1>
          <p className="text-gray-500 text-sm mt-1">
            Send MMS campaigns, manage rep codes, and monitor SMS activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SmsServiceBadge />
          <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-[#03374f] text-white text-xs font-semibold rounded-xl hover:bg-[#03374f]/90 transition-colors flex-shrink-0">
            Twilio Console <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Reps with SMS Code', value: employees.length },
          { label: 'Active Reps',        value: active.length },
          { label: 'Total Opt-ins',      value: totalOptIns },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="text-2xl font-bold text-[#03374f]">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Studio — full width */}
      <SmsStudioSender repCount={employees.length} />

      {/* Webhook setup — collapsible info */}
      <details className="bg-[#03374f] rounded-2xl overflow-hidden">
        <summary className="px-6 py-4 flex items-center gap-3 cursor-pointer select-none text-white font-semibold text-sm">
          <MessageSquare className="w-4 h-4 text-[#f26b2b]" />
          Twilio Webhook Setup
          <span className="text-white/40 text-xs font-normal ml-1">— click to expand</span>
        </summary>
        <div className="px-6 pb-5 space-y-2">
          <p className="text-white/60 text-sm">
            In your Twilio console, set your phone number&apos;s incoming SMS webhook to:
          </p>
          <code className="block bg-white/10 text-[#f26b2b] px-4 py-2 rounded-lg text-sm font-mono">
            https://www.pct.com/api/sms
          </code>
          <p className="text-white/40 text-xs">
            HTTP Method: POST &nbsp;·&nbsp; An agent texts any rep&apos;s SMS code → receives their contact info automatically.
          </p>
        </div>
      </details>

      {/* Rep table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#f26b2b]" />
          <h2 className="font-semibold text-[#03374f] text-sm">Rep SMS Codes</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-5 py-3 text-xs font-semibold text-gray-500">Rep</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500">SMS Code</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 text-center">Status</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 text-center">Opt-ins</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500">Last Activity</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} className="border-t border-gray-50 hover:bg-gray-50/40 transition-colors">
                <td className="px-5 py-3">
                  <div className="font-medium text-[#03374f]">{e.name}</div>
                  {e.email && <div className="text-xs text-gray-400">{e.email}</div>}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <code className="bg-[#f8f6f3] border border-gray-200 text-[#03374f] px-3 py-1 rounded-lg font-mono text-xs font-bold tracking-widest">
                      {e.sms_code}
                    </code>
                    <CopyButton text={e.sms_code} />
                  </div>
                </td>
                <td className="px-5 py-3 text-center">
                  {e.active
                    ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                    : <XCircle    className="w-4 h-4 text-gray-300 mx-auto" />
                  }
                </td>
                <td className="px-5 py-3 text-center font-bold text-[#03374f]">
                  {e.sms_opt_ins}
                </td>
                <td className="px-5 py-3 text-xs text-gray-400">
                  {e.last_sms_at
                    ? new Date(e.last_sms_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—'
                  }
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/team/employees/${e.slug}`}
                    className="text-xs text-[#f26b2b] hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 text-center pb-4">
        To update a rep&apos;s SMS code, go to their employee edit page.
      </p>
    </div>
  )
}
