'use client'

/**
 * RecapDetail — the per-draft preview + send UI.
 *
 * Four sections:
 *   A. Header (subject, status badge, generated timestamp, sent meta)
 *   B. Email preview in a sandboxed iframe (srcDoc + sandbox="" — no
 *      scripts, no forms, no navigation; defense-in-depth even though
 *      the Mustache template HTML-escapes user-provided strings)
 *   C. Recipient resolution preview (collapsed by default — combines
 *      the static recipients table with the dynamic Sales Managers
 *      list, deduped client-side to mirror D1's server logic)
 *   D. Action bar: "Send Test to Me" + "Send Recap" (with AlertDialog
 *      confirmation)
 *   E. Send history (test + real, split into two sections)
 *
 * All mutations call existing API routes — this component owns zero
 * email infrastructure.
 *
 * Brand: PCT navy #03374f, orange #f26b2b. No #003d79 anywhere.
 */

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Mail, Send, Eye, Users, Loader2, ChevronDown, ChevronUp,
  CheckCircle2, AlertCircle, ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { InlineAlert } from '@/components/admin/marketing/shared'
import { StatusBadge } from './DraftsList'
import type {
  RecapDraft, RecapSend, RecapRecipient, ActiveSalesManager,
  RecapSendStatus,
} from '@/lib/admin-db'

interface Props {
  initialDraft: RecapDraft
  initialSends: RecapSend[]
}

/* ─── Helpers ────────────────────────────────────────────────── */

function formatAbsolutePT(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const date = d.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    timeZone: 'America/Los_Angeles',
  })
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
    timeZone: 'America/Los_Angeles',
  })
  return `${date} at ${time} PT`
}

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const diffMs   = Date.now() - d.getTime()
  const diffMin  = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay  = Math.floor(diffHour / 24)
  if (diffMin < 1)   return 'just now'
  if (diffMin < 60)  return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay  < 7)  return `${diffDay}d ago`
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function truncate(s: string | null | undefined, n = 100): string {
  if (!s) return ''
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

const SEND_STATUS_STYLE: Record<RecapSendStatus, string> = {
  pending: 'bg-gray-100 text-gray-700 border border-gray-200',
  sent:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  failed:  'bg-red-50 text-red-700 border border-red-200',
}

function SendStatusBadge({ status }: { status: RecapSendStatus }) {
  const cls = SEND_STATUS_STYLE[status] ?? SEND_STATUS_STYLE.pending
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${cls}`}>
      {status}
    </span>
  )
}

/* ─── Recipient preview row type (combined view) ─────────────── */

interface ResolvedRecipient {
  email:  string
  name:   string
  role:   string
  source: 'recipients_table' | 'sales_manager_flag'
}

/* ─── Component ──────────────────────────────────────────────── */

export function RecapDetail({ initialDraft, initialSends }: Props) {
  const router = useRouter()

  const draft = initialDraft
  const sends = initialSends

  const [error, setError] = useState('')
  const [info,  setInfo]  = useState('')

  // Test-send state
  const [sendingTest, setSendingTest] = useState(false)

  // Real-send state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sendingReal, setSendingReal] = useState(false)

  // Recipients preview
  const [recipOpen,    setRecipOpen]    = useState(false)
  const [recipLoading, setRecipLoading] = useState(false)
  const [recipError,   setRecipError]   = useState('')
  const [resolved,     setResolved]     = useState<ResolvedRecipient[] | null>(null)

  /* ── Send history split (test vs real) ─────────────────────── */
  const { testSends, realSends } = useMemo(() => {
    const t: RecapSend[] = []
    const r: RecapSend[] = []
    for (const s of sends) (s.is_test ? t : r).push(s)
    // Newest first within each section (created_at DESC).
    const byCreated = (a: RecapSend, b: RecapSend) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    return { testSends: t.sort(byCreated), realSends: r.sort(byCreated) }
  }, [sends])

  /* ── Lazy-load recipient resolution preview ─────────────────── */
  async function loadResolvedRecipients() {
    setRecipLoading(true)
    setRecipError('')
    try {
      const [recipRes, smRes] = await Promise.all([
        fetch('/api/admin/marketing/recap/recipients'),
        fetch('/api/admin/marketing/recap/sales-managers'),
      ])
      const recipData = await recipRes.json().catch(() => ({}))
      const smData    = await smRes.json().catch(() => ({}))
      if (!recipRes.ok) throw new Error(recipData?.error || 'Failed to load recipients')
      if (!smRes.ok)    throw new Error(smData?.error    || 'Failed to load sales managers')

      const recipients: RecapRecipient[]      = recipData.recipients     || []
      const salesMgrs: ActiveSalesManager[]   = smData.sales_managers    || []

      // Dedup by lower(email). Static recipients take precedence over
      // sales-manager flag (mirrors D1's server resolver).
      const byEmail = new Map<string, ResolvedRecipient>()
      for (const r of recipients) {
        if (!r.active) continue
        byEmail.set(r.email.toLowerCase(), {
          email:  r.email,
          name:   r.name,
          role:   r.role,
          source: 'recipients_table',
        })
      }
      for (const m of salesMgrs) {
        const key = m.email.toLowerCase()
        if (byEmail.has(key)) continue
        byEmail.set(key, {
          email:  m.email,
          name:   `${m.first_name} ${m.last_name}`.trim() || m.email,
          role:   'Sales Manager',
          source: 'sales_manager_flag',
        })
      }
      const merged = Array.from(byEmail.values()).sort((a, b) => a.name.localeCompare(b.name))
      setResolved(merged)
    } catch (e) {
      setRecipError(e instanceof Error ? e.message : 'Failed to load recipients')
    } finally {
      setRecipLoading(false)
    }
  }

  function toggleRecipients() {
    const next = !recipOpen
    setRecipOpen(next)
    if (next && resolved === null && !recipLoading) {
      loadResolvedRecipients()
    }
  }

  /* ── Send Test to Me ───────────────────────────────────────── */
  async function sendTest() {
    setSendingTest(true)
    setError(''); setInfo('')
    try {
      const res = await fetch(`/api/admin/marketing/recap/${draft.draft_id}/send`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_test: true }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || `Send failed (${res.status})`)
      setInfo('Test email sent. Check your inbox.')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Test send failed')
    } finally {
      setSendingTest(false)
    }
  }

  /* ── Send Recap (real) ─────────────────────────────────────── */
  async function sendReal() {
    setSendingReal(true)
    setError(''); setInfo('')
    try {
      const res = await fetch(`/api/admin/marketing/recap/${draft.draft_id}/send`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        // No body — server defaults is_test=false.
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 409) {
        // Surface the race-protection message clearly without going red.
        setError('')
        setInfo('')
        setConfirmOpen(false)
        setRecipError('') // safety
        setError('') // will set amber-style "info" below
        // Use an info-kind InlineAlert. Spec says amber; closest in our
        // InlineAlert kinds is 'info' (blue). 'error' (red) is reserved
        // for true failures, so 'info' is the better semantic match.
        setInfo(data?.error || 'Another send is already in progress for this draft.')
        return
      }
      if (!res.ok) throw new Error(data?.error || `Send failed (${res.status})`)

      setConfirmOpen(false)
      const ok      = typeof data?.successful_sends === 'number' ? data.successful_sends : 0
      const failed  = typeof data?.failed_sends     === 'number' ? data.failed_sends     : 0
      const total   = typeof data?.recipient_count  === 'number' ? data.recipient_count  : ok + failed
      const summary = failed > 0
        ? `Sent to ${ok} of ${total} recipients (${failed} failed). marketing@pct.com was CC'd.`
        : `Sent to ${ok} of ${total} recipients. marketing@pct.com was CC'd.`
      setInfo(summary)
      router.refresh()
    } catch (e) {
      setConfirmOpen(false)
      setError(e instanceof Error ? e.message : 'Send failed')
    } finally {
      setSendingReal(false)
    }
  }

  const isDraftStatus = draft.status === 'draft'
  const recipientCountForConfirm = resolved?.length ?? null

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="space-y-5">
      {/* ── A. Header ───────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-start gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-[#03374f] flex-1 min-w-0 break-words">
            {draft.subject}
          </h1>
          <div className="pt-1.5">
            <StatusBadge status={draft.status} />
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Generated {formatAbsolutePT(draft.created_at)}
        </div>
        {draft.status === 'sent' && (
          <div className="text-xs text-emerald-700 font-medium">
            Sent to {draft.recipient_count} recipient{draft.recipient_count === 1 ? '' : 's'} on {formatAbsolutePT(draft.sent_at)}
          </div>
        )}
        {draft.status === 'failed' && (
          <div className="text-xs text-red-700 font-medium">
            Send failed {draft.sent_at ? `on ${formatAbsolutePT(draft.sent_at)}` : ''}
            {draft.error_summary ? ` — ${draft.error_summary}` : ''}
          </div>
        )}
        {draft.status === 'sending' && (
          <div className="text-xs text-[#c4541d] font-medium">
            A send is currently in progress for this draft.
          </div>
        )}
      </div>

      {error && <InlineAlert kind="error"   message={error} onClose={() => setError('')} />}
      {info  && <InlineAlert kind="success" message={info}  onClose={() => setInfo('')} />}

      {/* ── B. Preview iframe (sandboxed) ──────────────────── */}
      <Card className="overflow-hidden p-0 gap-0">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Eye className="w-4 h-4 text-[#f26b2b]" />
          <div className="flex-1">
            <h2 className="font-semibold text-[#03374f] text-sm">Email Preview</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              How the email will appear in recipients&apos; inboxes.
            </p>
          </div>
        </div>
        <div className="p-4 bg-gray-50">
          {/*
            sandbox="" with NO allow- flags = no scripts, no forms, no
            top-level navigation, no popups. srcDoc renders the HTML as
            a document without a network request. The Mustache template
            already HTML-escapes user-provided strings, but the sandbox
            is defense-in-depth against template injection regressions.
          */}
          <iframe
            title="Recap email preview"
            sandbox=""
            srcDoc={draft.html_content}
            className="w-full border border-gray-200 rounded-lg bg-white"
            style={{ height: '800px' }}
          />
        </div>
      </Card>

      {/* ── C. Recipients preview ──────────────────────────── */}
      <Card className="overflow-hidden p-0 gap-0">
        <button
          type="button"
          onClick={toggleRecipients}
          className="w-full px-5 py-4 border-b border-gray-100 flex items-center gap-2 hover:bg-gray-50/60 transition-colors"
        >
          <Users className="w-4 h-4 text-[#f26b2b]" />
          <div className="flex-1 text-left">
            <h2 className="font-semibold text-[#03374f] text-sm">Recipients</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {resolved
                ? `${resolved.length} recipient${resolved.length === 1 ? '' : 's'} (excluding CC)`
                : 'Click to preview who will receive this recap.'}
            </p>
          </div>
          {recipOpen
            ? <ChevronUp   className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {recipOpen && (
          <div>
            {recipLoading && (
              <div className="px-5 py-10 flex items-center justify-center text-gray-500 text-sm">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading recipients…
              </div>
            )}

            {recipError && !recipLoading && (
              <div className="px-5 py-3">
                <InlineAlert kind="error" message={recipError} onClose={() => setRecipError('')} />
              </div>
            )}

            {resolved && !recipLoading && resolved.length === 0 && (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-gray-500 mb-1">No recipients configured.</p>
                <p className="text-xs text-gray-400">
                  Add static recipients or flag employees as Sales Managers before sending.
                </p>
              </div>
            )}

            {resolved && !recipLoading && resolved.length > 0 && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-5 py-2.5 text-xs font-semibold text-gray-500">Name</th>
                        <th className="px-3 py-2.5 text-xs font-semibold text-gray-500">Email</th>
                        <th className="px-3 py-2.5 text-xs font-semibold text-gray-500">Role</th>
                        <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 text-right">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resolved.map((r) => (
                        <tr key={r.email} className="border-t border-gray-50">
                          <td className="px-5 py-2.5 font-medium text-[#03374f]">{r.name}</td>
                          <td className="px-3 py-2.5 font-mono text-[12px]">{r.email}</td>
                          <td className="px-3 py-2.5 text-gray-600">{r.role}</td>
                          <td className="px-3 py-2.5 text-right">
                            {r.source === 'recipients_table' ? (
                              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                Recipients table
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-[#03374f]/10 text-[#03374f] border border-[#03374f]/20">
                                <ShieldCheck className="w-3 h-3" /> Sales Manager
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 bg-amber-50/40 border-t border-amber-100 text-[11px] text-amber-800 flex items-start gap-2">
                  <Mail className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>
                    <span className="font-semibold">marketing@pct.com</span> receives a CC copy of every send.
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </Card>

      {/* ── D. Actions ─────────────────────────────────────── */}
      <Card className="p-5">
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            type="button"
            variant="outline"
            onClick={sendTest}
            disabled={sendingTest || sendingReal}
            className="border-gray-300 text-[#03374f]"
          >
            {sendingTest && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
            <Mail className="w-4 h-4 mr-1.5" />
            Send Test to Me
          </Button>

          {isDraftStatus ? (
            <Button
              type="button"
              onClick={() => { setError(''); setInfo(''); setConfirmOpen(true) }}
              disabled={sendingReal || sendingTest}
              className="bg-[#f26b2b] hover:bg-[#d8551b] text-white"
            >
              <Send className="w-4 h-4 mr-1.5" />
              Send Recap
            </Button>
          ) : (
            <div className="text-xs text-gray-500 flex items-center gap-1.5">
              {draft.status === 'sent'    && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
              {draft.status === 'failed'  && <AlertCircle  className="w-4 h-4 text-red-700" />}
              {draft.status === 'sending' && <Loader2      className="w-4 h-4 animate-spin text-[#c4541d]" />}
              <span>
                {draft.status === 'sent'    && `Already sent on ${formatAbsolutePT(draft.sent_at)}.`}
                {draft.status === 'failed'  && `Send failed${draft.sent_at ? ` on ${formatAbsolutePT(draft.sent_at)}` : ''}. Generate a new draft to retry.`}
                {draft.status === 'sending' && 'Send in progress — refresh in a moment to see the result.'}
              </span>
            </div>
          )}

          <div className="flex-1" />
          <p className="text-[11px] text-gray-400 max-w-xs text-right">
            Test sends use the same template and pipeline; only the recipient differs.
          </p>
        </div>
      </Card>

      {/* ── E. Send history ────────────────────────────────── */}
      {sends.length > 0 && (
        <Card className="overflow-hidden p-0 gap-0">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Send className="w-4 h-4 text-[#f26b2b]" />
            <h2 className="font-semibold text-[#03374f] text-sm">Send History</h2>
          </div>

          {testSends.length > 0 && (
            <SendsTable
              title="Test Sends"
              muted
              rows={testSends}
            />
          )}

          {realSends.length > 0 && (
            <SendsTable
              title="Recipients"
              muted={false}
              rows={realSends}
            />
          )}
        </Card>
      )}

      {/* ── Send-Recap confirmation dialog ─────────────────── */}
      <AlertDialog open={confirmOpen} onOpenChange={(open) => { if (!sendingReal) setConfirmOpen(open) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send this recap?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  This will send the Weekly Marketing Recap to {recipientCountForConfirm !== null
                    ? <span className="font-semibold">{recipientCountForConfirm} recipient{recipientCountForConfirm === 1 ? '' : 's'}</span>
                    : 'the configured leadership recipients'}.
                </p>
                <p>
                  <span className="font-semibold">marketing@pct.com</span> will receive a CC copy.
                </p>
                <p>
                  This action cannot be undone. To resend after this, you&apos;ll need to generate a new draft.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={sendingReal}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); sendReal() }}
              disabled={sendingReal}
              className="bg-[#f26b2b] hover:bg-[#d8551b] text-white"
            >
              {sendingReal && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {sendingReal ? 'Sending…' : 'Send Recap'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/* ─── Sends sub-table ────────────────────────────────────────── */

function SendsTable({
  title, muted, rows,
}: {
  title: string
  muted: boolean
  rows:  RecapSend[]
}) {
  return (
    <div className={muted ? 'bg-gray-50/40' : ''}>
      <div className="px-5 py-2.5 border-b border-gray-100 flex items-center justify-between">
        <h3 className={`text-xs font-semibold uppercase tracking-wide ${muted ? 'text-gray-400' : 'text-[#03374f]'}`}>
          {title}
        </h3>
        <span className="text-[10px] text-gray-400">
          {rows.length} {rows.length === 1 ? 'send' : 'sends'}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/60 text-left">
              <th className="px-5 py-2 text-[11px] font-semibold text-gray-500">Name</th>
              <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">Email</th>
              <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">Source</th>
              <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">Status</th>
              <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">Sent At</th>
              <th className="px-3 py-2 text-[11px] font-semibold text-gray-500">Error</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-t border-gray-50">
                <td className={`px-5 py-2 font-medium ${muted ? 'text-gray-500' : 'text-[#03374f]'}`}>
                  {s.recipient_name}
                  {s.is_cc && (
                    <span className="ml-1.5 inline-flex items-center rounded-full px-1.5 py-0 text-[9px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                      CC
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-[11px] text-gray-600">{s.recipient_email}</td>
                <td className="px-3 py-2 text-[11px] text-gray-500">
                  {s.recipient_source === 'recipients_table' ? 'Recipients table' : 'Sales Manager flag'}
                </td>
                <td className="px-3 py-2">
                  <SendStatusBadge status={s.send_status} />
                </td>
                <td className="px-3 py-2 text-[11px] text-gray-500" title={s.sent_at ?? ''}>
                  {s.sent_at ? relativeTime(s.sent_at) : '—'}
                </td>
                <td className="px-3 py-2 text-[11px] text-red-700 max-w-[260px]" title={s.error_message ?? ''}>
                  {truncate(s.error_message, 100) || ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
