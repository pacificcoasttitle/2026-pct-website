'use client'

/**
 * OnboardingWelcomeAction — admin "Send welcome email" / "Resend link"
 * button on the per-rep onboarding view (Phase 2e).
 *
 * Confirm dialog warns that resend invalidates any prior link. On
 * success shows a toast-style message; displays "link sent {date}" when
 * welcome_sent_at is tracked.
 *
 * Brand: PCT navy #03374f, orange #f26b2b.
 */

import { useState } from 'react'
import { Mail, Loader2 } from 'lucide-react'

function fmtDate(iso: string | null): string {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      timeZone: 'America/Los_Angeles',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}

export function OnboardingWelcomeAction({
  repId,
  repEmail,
  initialWelcomeSentAt,
}: {
  repId:                number
  repEmail:             string | null
  initialWelcomeSentAt: string | null
}) {
  const [welcomeSentAt, setWelcomeSentAt] = useState(initialWelcomeSentAt)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg]   = useState('')
  const [err, setErr]   = useState('')

  const hasSent = !!welcomeSentAt
  const label   = hasSent ? 'Resend link' : 'Send welcome email'
  const email   = repEmail?.trim() || ''

  async function send() {
    if (!email) {
      setErr('This rep has no email address on file.')
      return
    }

    const confirmed = window.confirm(
      `This generates a new onboarding link and invalidates any previous one.\n\nSend to ${email}?`,
    )
    if (!confirmed) return

    setBusy(true)
    setErr('')
    setMsg('')

    try {
      const res = await fetch(`/api/admin/onboarding/${repId}/send-welcome`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to send welcome email')

      if (data.welcome_sent_at) setWelcomeSentAt(data.welcome_sent_at)
      setMsg(`Welcome email sent to ${data.sent_to || email}`)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to send welcome email')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <button
        type="button"
        onClick={send}
        disabled={busy || !email}
        className="inline-flex items-center gap-2 rounded-xl bg-[#f26b2b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e05a1a] disabled:opacity-60 transition-colors"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
        {busy ? 'Sending…' : label}
      </button>

      {welcomeSentAt && (
        <span className="text-xs text-gray-500">
          Link sent {fmtDate(welcomeSentAt)}
        </span>
      )}

      {msg && (
        <span className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
          {msg}
        </span>
      )}

      {err && (
        <span className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
          {err}
        </span>
      )}
    </div>
  )
}
