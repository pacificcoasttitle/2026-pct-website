/**
 * /admin/team/sms — SMS marketing overview
 */
import Link from 'next/link'
import { MessageSquare, ExternalLink, CheckCircle, XCircle } from 'lucide-react'
import { getSmsEmployees } from '@/lib/admin-db'
import { CopyButton } from '@/components/admin/CopyButton'

export const metadata = { title: 'SMS | PCT Team Admin' }
export const revalidate = 60

export default async function SmsPage() {
  const employees = await getSmsEmployees()
  const active    = employees.filter((e) => e.active)
  const totalOptIns = employees.reduce((sum, e) => sum + e.sms_opt_ins, 0)

  return (
    <div className="max-w-5xl mx-auto space-y-8 pt-2 lg:pt-0">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#03374f]">SMS Marketing</h1>
        <p className="text-gray-500 text-sm mt-1">
          Agents text a rep&apos;s personal code to your Twilio number and receive their contact info instantly.
        </p>
      </div>

      {/* Setup callout */}
      <div className="bg-[#03374f] rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-start">
        <div className="w-10 h-10 rounded-xl bg-[#f26b2b]/20 flex items-center justify-center flex-shrink-0">
          <MessageSquare className="w-5 h-5 text-[#f26b2b]" />
        </div>
        <div className="flex-1 space-y-1">
          <h2 className="font-bold text-white">Twilio Webhook Setup</h2>
          <p className="text-white/60 text-sm">
            In your Twilio console, set your phone number&apos;s incoming SMS webhook to:
          </p>
          <code className="block mt-2 bg-white/10 text-[#f26b2b] px-4 py-2 rounded-lg text-sm font-mono">
            https://www.pct.com/api/sms
          </code>
          <p className="text-white/40 text-xs mt-2">
            HTTP Method: POST &nbsp;·&nbsp; An agent texts any rep&apos;s SMS code → receives profile link + contact info automatically.
          </p>
        </div>
        <a
          href="https://console.twilio.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl transition-colors flex-shrink-0"
        >
          Twilio Console <ExternalLink className="w-3.5 h-3.5" />
        </a>
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
