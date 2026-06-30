"use client"

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  UserPlus,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle,
  Mail,
  ClipboardList,
  Eye,
  XCircle,
  Clock,
} from 'lucide-react'

interface OnboardingRow {
  id:               number
  name:             string
  invited_email:    string | null
  status:           string
  invited_at:       string | null
  created_at:       string
  token_expires_at: string | null
  checklist:        { total: number; complete: number } | null
}

// An invite is "expired" when its token window has passed AND it's still
// in a pre-submission state (a submitted/finalized/cancelled row isn't
// waiting on the link anymore). Display-only — resend is the remedy.
function isExpired(o: OnboardingRow): boolean {
  if (!o.token_expires_at) return false
  if (!['invited', 'in_progress'].includes(o.status)) return false
  const t = new Date(o.token_expires_at).getTime()
  return Number.isFinite(t) && t <= Date.now()
}
interface EmployeeOption {
  id:    number
  name:  string
  email: string | null
}

const STATUS_STYLE: Record<string, string> = {
  draft:      'bg-gray-100 text-gray-500 border-gray-200',
  invited:    'bg-[#f26b2b]/10 text-[#f26b2b] border-[#f26b2b]/20',
  in_progress:'bg-blue-50 text-blue-600 border-blue-100',
  submitted:  'bg-amber-50 text-amber-600 border-amber-200',
  finalized:  'bg-emerald-50 text-emerald-600 border-emerald-100',
  cancelled:  'bg-red-50 text-red-400 border-red-100',
}

const INPUT =
  "w-full h-10 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#03374f]/15 focus:border-[#03374f]/40 transition-all"

function fmtDate(s: string | null): string {
  if (!s) return '—'
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString()
}

export default function HrOnboardingClient({
  onboardings,
  employees,
}: {
  onboardings: OnboardingRow[]
  employees:   EmployeeOption[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status')
  const [tab, setTab] = useState<'existing' | 'new'>('existing')
  const [busy, setBusy] = useState(false)
  const [resendingId, setResendingId] = useState<number | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  // Optional status filter (e.g. ?status=submitted from the dashboard CTA).
  const visibleOnboardings = useMemo(
    () => (statusFilter ? onboardings.filter((o) => o.status === statusFilter) : onboardings),
    [onboardings, statusFilter],
  )

  const [pickedEmployee, setPickedEmployee] = useState('')
  const [shell, setShell] = useState({ first_name: '', last_name: '', invited_email: '' })
  // HR-selected onboarding type — shared across both tabs. Defaults to
  // 'sales_rep' (the current implicit default → least surprise). Drives
  // which checklist the new onboarding seeds.
  const [onboardingType, setOnboardingType] = useState<'sales_rep' | 'employee'>('sales_rep')

  const sortedEmployees = useMemo(
    () => [...employees].sort((a, b) => a.name.localeCompare(b.name)),
    [employees],
  )

  // Create then immediately send (the common HR flow).
  async function createAndSend(payload: Record<string, unknown>) {
    setError(null)
    setOk(null)
    setBusy(true)
    try {
      const createRes = await fetch('/api/admin/hr/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const created = await createRes.json().catch(() => ({}))
      if (!createRes.ok) {
        setError(created?.error || 'Failed to create onboarding.')
        return
      }
      const id = created?.onboarding?.id
      if (!id) {
        setError('Onboarding created but no id returned.')
        return
      }
      const sendRes = await fetch(`/api/admin/hr/onboarding/${id}/send`, { method: 'POST' })
      const sent = await sendRes.json().catch(() => ({}))
      if (!sendRes.ok) {
        setError(sent?.error || 'Onboarding created, but the invite failed to send.')
        return
      }
      setOk(`Invite sent to ${sent?.sent_to || 'the employee'}.`)
      setPickedEmployee('')
      setShell({ first_name: '', last_name: '', invited_email: '' })
      router.refresh()
    } catch {
      setError('Network error — please try again.')
    } finally {
      setBusy(false)
    }
  }

  function handleInviteExisting() {
    if (!pickedEmployee) {
      setError('Pick an employee to invite.')
      return
    }
    createAndSend({ hr_employee_id: Number(pickedEmployee), onboarding_type: onboardingType })
  }

  function handleStartNew() {
    if (!shell.first_name.trim() || !shell.last_name.trim()) {
      setError('First and last name are required.')
      return
    }
    if (!shell.invited_email.trim()) {
      setError('Email is required.')
      return
    }
    createAndSend({ ...shell, onboarding_type: onboardingType })
  }

  async function handleResend(id: number) {
    setError(null)
    setOk(null)
    setResendingId(id)
    try {
      const res = await fetch(`/api/admin/hr/onboarding/${id}/send`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'Failed to resend invite.')
        return
      }
      setOk(`Invite re-sent to ${data?.sent_to || 'the employee'} (the previous link is now invalid).`)
      router.refresh()
    } catch {
      setError('Network error — please try again.')
    } finally {
      setResendingId(null)
    }
  }

  async function handleCancel(id: number) {
    if (!confirm('Cancel this onboarding? The employee’s link will stop working. (A finalized onboarding can’t be cancelled.)')) return
    setError(null)
    setOk(null)
    setCancellingId(id)
    try {
      const res = await fetch(`/api/admin/hr/onboarding/${id}/cancel`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'Failed to cancel onboarding.')
        return
      }
      setOk('Onboarding cancelled — the invite link no longer works.')
      router.refresh()
    } catch {
      setError('Network error — please try again.')
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-2 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#03374f]">Onboarding</h1>
          <p className="text-gray-500 text-sm mt-1">
            Invite an employee to complete their onboarding. They receive a secure link by email.
          </p>
        </div>
        <Link
          href="/admin/team/hr/onboarding/templates"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold text-[#03374f] shadow-sm transition-colors hover:border-[#f26b2b]/40 hover:text-[#f26b2b]"
        >
          <ClipboardList className="h-3.5 w-3.5" />
          Manage Checklists
        </Link>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {ok && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{ok}</span>
        </div>
      )}

      {/* Initiate */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-gray-50 w-fit">
          {(['existing', 'new'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setError(null); setOk(null) }}
              className={`px-4 h-9 text-sm font-medium transition-all ${
                tab === t ? 'bg-[#03374f] text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'existing' ? 'Invite existing employee' : 'Start new onboarding'}
            </button>
          ))}
        </div>

        {/* Onboarding type — shared across both tabs; drives the checklist. */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Onboarding type</label>
          <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-gray-50 w-fit">
            {([['sales_rep', 'Sales Rep'], ['employee', 'Regular Employee']] as const).map(([val, lbl]) => (
              <button
                key={val}
                type="button"
                onClick={() => setOnboardingType(val)}
                className={`px-4 h-9 text-sm font-medium transition-all ${
                  onboardingType === val ? 'bg-[#03374f] text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {tab === 'existing' ? (
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Employee</label>
              <select
                value={pickedEmployee}
                onChange={(e) => setPickedEmployee(e.target.value)}
                className={INPUT}
              >
                <option value="">Select an employee…</option>
                {sortedEmployees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}{e.email ? ` — ${e.email}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleInviteExisting}
              disabled={busy}
              className="h-10 px-5 inline-flex items-center gap-2 rounded-xl bg-[#f26b2b] text-white text-sm font-semibold hover:bg-[#d85c1f] transition-colors disabled:opacity-50"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send invite
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className={INPUT} placeholder="First name" value={shell.first_name} onChange={(e) => setShell((s) => ({ ...s, first_name: e.target.value }))} />
              <input className={INPUT} placeholder="Last name" value={shell.last_name} onChange={(e) => setShell((s) => ({ ...s, last_name: e.target.value }))} />
            </div>
            <input className={INPUT} type="email" placeholder="Email" value={shell.invited_email} onChange={(e) => setShell((s) => ({ ...s, invited_email: e.target.value }))} />
            <button
              type="button"
              onClick={handleStartNew}
              disabled={busy}
              className="h-10 px-5 inline-flex items-center gap-2 rounded-xl bg-[#f26b2b] text-white text-sm font-semibold hover:bg-[#d85c1f] transition-colors disabled:opacity-50"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Create &amp; send invite
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-[#f26b2b]" />
          <h2 className="font-semibold text-[#03374f] text-sm">Onboardings ({visibleOnboardings.length})</h2>
          {statusFilter && (
            <Link
              href="/admin/team/hr/onboarding"
              className="ml-auto text-xs font-medium text-gray-500 inline-flex items-center gap-1 hover:text-[#f26b2b] transition-colors"
            >
              Filtered: {statusFilter.replace('_', ' ')} · clear
            </Link>
          )}
        </div>
        {visibleOnboardings.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {statusFilter ? `No onboardings with status “${statusFilter.replace('_', ' ')}”.` : 'No onboardings yet. Invite an employee above.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {visibleOnboardings.map((o) => (
              <div key={o.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#03374f] truncate">{o.name}</p>
                  <p className="text-xs text-gray-400 truncate">{o.invited_email ?? '—'}</p>
                </div>

                <span className="hidden sm:block text-xs text-gray-400 flex-shrink-0 w-28 truncate">
                  Invited {fmtDate(o.invited_at)}
                </span>

                {o.checklist && o.checklist.total > 0 && (
                  <span
                    title={`${o.checklist.complete} of ${o.checklist.total} checklist items complete`}
                    className="hidden md:inline-flex text-[10px] px-2 py-0.5 rounded-full font-medium border border-gray-200 bg-gray-50 text-gray-500 flex-shrink-0"
                  >
                    {o.checklist.complete}/{o.checklist.total}
                  </span>
                )}

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium border capitalize flex-shrink-0 ${
                    STATUS_STYLE[o.status] ?? 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}
                >
                  {o.status.replace('_', ' ')}
                </span>

                {isExpired(o) && (
                  <span
                    title="The invite link's 14-day window has passed — resend to issue a fresh link."
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium border border-red-100 bg-red-50 text-red-400 inline-flex items-center gap-1 flex-shrink-0"
                  >
                    <Clock className="w-3 h-3" />
                    Expired
                  </span>
                )}

                <Link
                  href={`/admin/team/hr/onboarding/${o.id}`}
                  title="Review onboarding"
                  className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:border-[#f26b2b]/40 hover:text-[#f26b2b] transition-colors flex-shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Review
                </Link>

                <button
                  type="button"
                  onClick={() => handleResend(o.id)}
                  disabled={resendingId === o.id || o.status === 'finalized' || o.status === 'cancelled'}
                  title="Resend invite (invalidates the previous link)"
                  className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:border-[#f26b2b]/40 hover:text-[#f26b2b] transition-colors disabled:opacity-40 flex-shrink-0"
                >
                  {resendingId === o.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Resend
                </button>

                {o.status !== 'finalized' && o.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => handleCancel(o.id)}
                    disabled={cancellingId === o.id}
                    title="Cancel onboarding (the invite link stops working)"
                    className="h-8 px-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 text-gray-400 text-xs font-medium hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    {cancellingId === o.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
