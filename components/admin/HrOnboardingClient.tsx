"use client"

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
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
  onboarding_type: string  // 'sales_rep' | 'employee' — inherited by the onboarding
}

const TYPE_LABEL: Record<string, string> = {
  sales_rep: 'Sales Rep',
  employee:  'Regular Employee',
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
  initialEmployeeId = '',
}: {
  onboardings: OnboardingRow[]
  employees:   EmployeeOption[]
  initialEmployeeId?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status')
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

  const [pickedEmployee, setPickedEmployee] = useState(initialEmployeeId)

  // Personal-email modal (shown at send). The new hire's PCT email isn't
  // live until IT provisions it during onboarding, so the invite goes to a
  // PERSONAL address entered here — that address becomes the recipient.
  const [modalOpen, setModalOpen] = useState(false)
  const [personalEmail, setPersonalEmail] = useState('')

  const sortedEmployees = useMemo(
    () => [...employees].sort((a, b) => a.name.localeCompare(b.name)),
    [employees],
  )

  const selectedEmployee = useMemo(
    () => sortedEmployees.find((e) => String(e.id) === String(pickedEmployee)) || null,
    [sortedEmployees, pickedEmployee],
  )

  // Create the onboarding for the selected employee (type INHERITED from
  // the employee record), then immediately send the invite to the entered
  // personal email. The single HR flow.
  async function createAndSend(hrEmployeeId: number, recipientEmail: string) {
    setError(null)
    setOk(null)
    setBusy(true)
    try {
      const createRes = await fetch('/api/admin/hr/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hr_employee_id: hrEmployeeId }),
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
      const sendRes = await fetch(`/api/admin/hr/onboarding/${id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_email: recipientEmail }),
      })
      const sent = await sendRes.json().catch(() => ({}))
      if (!sendRes.ok) {
        setError(sent?.error || 'Onboarding created, but the invite failed to send.')
        return
      }
      setOk(`Invite sent to ${sent?.sent_to || recipientEmail}.`)
      setPickedEmployee('')
      setModalOpen(false)
      setPersonalEmail('')
      router.refresh()
    } catch {
      setError('Network error — please try again.')
    } finally {
      setBusy(false)
    }
  }

  // Step 1: open the personal-email modal for the picked employee.
  function handleOpenSendModal() {
    if (!pickedEmployee) {
      setError('Pick an employee to invite.')
      return
    }
    setError(null)
    setPersonalEmail('')
    setModalOpen(true)
  }

  // Step 2: validate the personal email, then create + send.
  function handleConfirmSend() {
    const email = personalEmail.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid personal email address.')
      return
    }
    createAndSend(Number(pickedEmployee), email)
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

      {/* Initiate — single path: pick an existing employee → send invite.
          Type is inherited from the employee (set on Add Employee). */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
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
            onClick={handleOpenSendModal}
            disabled={busy}
            className="h-10 px-5 inline-flex items-center gap-2 rounded-xl bg-[#f26b2b] text-white text-sm font-semibold hover:bg-[#d85c1f] transition-colors disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send invite
          </button>
        </div>

        {/* Inherited onboarding type — read-only, from the selected employee. */}
        {selectedEmployee && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-semibold">Onboarding type:</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium border border-gray-200 bg-gray-50 text-gray-600">
              {TYPE_LABEL[selectedEmployee.onboarding_type] || 'Sales Rep'}
            </span>
            <span className="text-gray-400">— inherited from the employee record; drives the checklist.</span>
          </div>
        )}
      </div>

      {/* Personal-email modal (at send). The invite goes to THIS address. */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => !busy && setModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-xl p-6 space-y-4">
            <div className="flex items-start gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#03374f]/8 text-[#03374f] flex items-center justify-center flex-shrink-0">
                <Mail className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#03374f]">Send onboarding invite</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedEmployee?.name ? `For ${selectedEmployee.name}. ` : ''}
                  Their PCT email isn&apos;t live yet (IT provisions it during onboarding),
                  so the invite goes to a personal email.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Personal email *</label>
              <input
                type="email"
                autoFocus
                className={INPUT}
                value={personalEmail}
                placeholder="name@gmail.com"
                onChange={(e) => setPersonalEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmSend() }}
              />
              <p className="text-xs text-gray-400 mt-1.5">
                The invite link is sent to this address — not the employee&apos;s PCT email.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={busy}
                className="h-10 px-4 inline-flex items-center rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSend}
                disabled={busy}
                className="h-10 px-5 inline-flex items-center gap-2 rounded-xl bg-[#f26b2b] text-white text-sm font-semibold hover:bg-[#d85c1f] transition-colors disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send invite
              </button>
            </div>
          </div>
        </div>
      )}

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
