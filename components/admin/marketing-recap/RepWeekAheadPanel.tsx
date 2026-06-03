'use client'

/**
 * RepWeekAheadPanel — review + send surface for the rep "Week Ahead"
 * draft (Phase 2). Lives on the Marketing Recap hub ALONGSIDE the
 * manager recap drafts, but is clearly labeled "Rep Week-Ahead" so the
 * ~20-rep audience is never confused with the manager recap.
 *
 * Mirrors the manager RecapDetail patterns:
 *   - sandboxed iframe preview (srcDoc + sandbox="")
 *   - shadcn AlertDialog confirm-before-send
 *   - InlineAlert feedback, Loader2 spinner
 *   - router.refresh() after a mutation so the status pill is never
 *     stale (the server component re-fetches the draft)
 *
 * Send hits the active-rep roster via the Phase 1 route
 *   POST /api/admin/marketing/rep-recap/[draftId]/send
 * 'failed' drafts stay re-sendable (the route's claim predicate allows
 * retry from 'failed'); 'cancelled' drafts can never send.
 *
 * Brand: PCT navy #03374f, orange #f26b2b only.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users, Send, Eye, Loader2, CheckCircle2, AlertCircle, Ban, CalendarClock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { InlineAlert } from '@/components/admin/marketing/shared'
import type { RepRecapDraft, RepRecapDraftStatus } from '@/lib/admin-db'

interface Props {
  initialDraft: RepRecapDraft | null
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

// The week_start_date/week_end_date columns anchor the NEXT week (the
// forward-looking window). Format them as a friendly range label.
function weekAheadLabel(d: RepRecapDraft): string {
  const fmt = (iso: string) => {
    const [y, m, day] = iso.split('-').map(Number)
    if (!y || !m || !day) return iso
    return new Date(y, m - 1, day).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric',
    })
  }
  const year = d.week_end_date.split('-')[0]
  return `${fmt(d.week_start_date)} to ${fmt(d.week_end_date)}, ${year}`
}

/* ─── Status badge (rep statuses incl. 'cancelled') ──────────── */

const STATUS_STYLE: Record<RepRecapDraftStatus, string> = {
  draft:     'bg-gray-100 text-gray-700 border border-gray-200',
  sending:   'bg-[#f26b2b]/15 text-[#c4541d] border border-[#f26b2b]/30',
  sent:      'bg-emerald-50 text-emerald-700 border border-emerald-200',
  failed:    'bg-red-50 text-red-700 border border-red-200',
  cancelled: 'bg-gray-100 text-gray-500 border border-gray-200',
}

function RepStatusBadge({ status }: { status: RepRecapDraftStatus }) {
  const cls = STATUS_STYLE[status] ?? STATUS_STYLE.draft
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${cls}`}>
      {status}
    </span>
  )
}

/* ─── Component ──────────────────────────────────────────────── */

export function RepWeekAheadPanel({ initialDraft }: Props) {
  const router = useRouter()
  const draft  = initialDraft

  const [error, setError] = useState('')
  const [info,  setInfo]  = useState('')

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sending,     setSending]     = useState(false)

  const [cancelOpen,  setCancelOpen]  = useState(false)
  const [cancelling,  setCancelling]  = useState(false)

  /* ── Section shell (always shows the labeled header) ───────── */
  const sectionHeader = (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <h2 className="flex items-center gap-2 font-semibold text-[#03374f] text-base">
        <Users className="w-4 h-4 text-[#f26b2b]" />
        Rep Week-Ahead
      </h2>
      {draft && <RepStatusBadge status={draft.status} />}
    </div>
  )

  if (!draft) {
    return (
      <div className="space-y-3">
        {sectionHeader}
        <Card className="px-6 py-10 flex flex-col items-center text-center bg-[#f0ede9]/40">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <CalendarClock className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-[#03374f] mb-1">No week-ahead draft yet</p>
          <p className="text-xs text-gray-500 max-w-md">
            The Monday cron creates the rep &quot;what&apos;s coming this week&quot; draft automatically. It will appear here for review before sending to the sales team.
          </p>
        </Card>
      </div>
    )
  }

  // Sendable = 'draft' or 'failed' (retry-from-failed is intended).
  const canSend   = draft.status === 'draft' || draft.status === 'failed'
  // Cancelable = 'draft' or 'failed' (can't cancel sent/sending/cancelled).
  const canCancel = draft.status === 'draft' || draft.status === 'failed'

  /* ── Send to reps ──────────────────────────────────────────── */
  async function sendToReps() {
    setSending(true)
    setError(''); setInfo('')
    try {
      const res = await fetch(`/api/admin/marketing/rep-recap/${draft!.draft_id}/send`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 409) {
        setConfirmOpen(false)
        setInfo(data?.error || 'Draft is not in a sendable state right now.')
        return
      }
      if (!res.ok) throw new Error(data?.error || `Send failed (${res.status})`)

      setConfirmOpen(false)
      const ok      = typeof data?.successful_sends === 'number' ? data.successful_sends : 0
      const failed  = typeof data?.failed_sends     === 'number' ? data.failed_sends     : 0
      const skipped = typeof data?.skipped_no_email === 'number' ? data.skipped_no_email : 0
      const total   = typeof data?.recipient_count  === 'number' ? data.recipient_count  : ok + failed
      let summary = `Sent to ${ok} of ${total} active rep${total === 1 ? '' : 's'}.`
      if (failed > 0)  summary += ` ${failed} failed.`
      if (skipped > 0) summary += ` ${skipped} skipped (no email).`
      setInfo(summary)
      router.refresh()
    } catch (e) {
      setConfirmOpen(false)
      setError(e instanceof Error ? e.message : 'Send failed')
    } finally {
      setSending(false)
    }
  }

  /* ── Cancel draft ──────────────────────────────────────────── */
  async function cancelDraft() {
    setCancelling(true)
    setError(''); setInfo('')
    try {
      const res = await fetch(`/api/admin/marketing/rep-recap/${draft!.draft_id}/cancel`, {
        method: 'POST',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || `Cancel failed (${res.status})`)
      setCancelOpen(false)
      setInfo('Draft cancelled. It will not be sent.')
      router.refresh()
    } catch (e) {
      setCancelOpen(false)
      setError(e instanceof Error ? e.message : 'Cancel failed')
    } finally {
      setCancelling(false)
    }
  }

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="space-y-3">
      {sectionHeader}

      <Card className="overflow-hidden p-0 gap-0 border-[#f26b2b]/30">
        {/* Meta header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-start gap-3 flex-wrap">
            <h3 className="text-base font-bold text-[#03374f] flex-1 min-w-0 break-words">
              {draft.subject}
            </h3>
          </div>
          <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5 text-[#f26b2b]" />
            Covers {weekAheadLabel(draft)}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            Created {formatAbsolutePT(draft.created_at)}
          </div>
          {draft.status === 'sent' && (
            <div className="text-xs text-emerald-700 font-medium mt-1">
              Sent to {draft.successful_sends} of {draft.recipient_count} rep{draft.recipient_count === 1 ? '' : 's'}
              {draft.failed_sends > 0 ? ` (${draft.failed_sends} failed)` : ''} on {formatAbsolutePT(draft.sent_at)}
            </div>
          )}
          {draft.status === 'failed' && (
            <div className="text-xs text-red-700 font-medium mt-1">
              Last send failed{draft.sent_at ? ` on ${formatAbsolutePT(draft.sent_at)}` : ''}
              {draft.error_summary ? ` — ${draft.error_summary}` : ''}. You can retry below.
            </div>
          )}
          {draft.status === 'sending' && (
            <div className="text-xs text-[#c4541d] font-medium mt-1">
              A send is currently in progress — refresh in a moment to see the result.
            </div>
          )}
          {draft.status === 'cancelled' && (
            <div className="text-xs text-gray-500 font-medium mt-1">
              This draft was cancelled and will not be sent.
            </div>
          )}
        </div>

        {/* Feedback */}
        {(error || info) && (
          <div className="px-5 pt-4 space-y-2">
            {error && <InlineAlert kind="error"   message={error} onClose={() => setError('')} />}
            {info  && <InlineAlert kind="success" message={info}  onClose={() => setInfo('')} />}
          </div>
        )}

        {/* Preview */}
        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-[#f26b2b]" />
            <span className="text-sm font-semibold text-[#03374f]">Email Preview</span>
            <span className="text-xs text-gray-400">— how reps will see it</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <iframe
              title="Rep week-ahead email preview"
              sandbox=""
              srcDoc={draft.html_content}
              className="w-full border border-gray-200 rounded-lg bg-white"
              style={{ height: '640px' }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-3 flex-wrap">
          {canSend ? (
            <Button
              type="button"
              onClick={() => { setError(''); setInfo(''); setConfirmOpen(true) }}
              disabled={sending || cancelling}
              className="bg-[#f26b2b] hover:bg-[#d8551b] text-white"
            >
              <Send className="w-4 h-4 mr-1.5" />
              {draft.status === 'failed' ? 'Retry send to all active reps' : 'Send to all active reps'}
            </Button>
          ) : (
            <div className="text-xs text-gray-500 flex items-center gap-1.5">
              {draft.status === 'sent'      && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
              {draft.status === 'sending'   && <Loader2 className="w-4 h-4 animate-spin text-[#c4541d]" />}
              {draft.status === 'cancelled' && <Ban className="w-4 h-4 text-gray-400" />}
              <span>
                {draft.status === 'sent'      && `Already sent on ${formatAbsolutePT(draft.sent_at)}.`}
                {draft.status === 'sending'   && 'Send in progress.'}
                {draft.status === 'cancelled' && 'This draft was cancelled.'}
              </span>
            </div>
          )}

          {canCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={() => { setError(''); setInfo(''); setCancelOpen(true) }}
              disabled={sending || cancelling}
              className="border-gray-300 text-gray-600"
            >
              <Ban className="w-4 h-4 mr-1.5" />
              Cancel draft
            </Button>
          )}

          <div className="flex-1" />
          <p className="text-[11px] text-gray-400 max-w-xs text-right flex items-center gap-1 justify-end">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            Goes to the full active sales-rep roster.
          </p>
        </div>
      </Card>

      {/* Send confirmation */}
      <AlertDialog open={confirmOpen} onOpenChange={(open) => { if (!sending) setConfirmOpen(open) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send this week-ahead email to all active reps?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  This sends the <span className="font-semibold">Rep Week-Ahead</span> email to
                  {' '}<span className="font-semibold">all active sales reps</span> (one email per rep).
                  A single record copy also goes to marketing@pct.com.
                </p>
                <p className="text-xs text-gray-500">
                  This is the rep audience — not the manager recap. Covers {weekAheadLabel(draft)}.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={sending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); sendToReps() }}
              disabled={sending}
              className="bg-[#f26b2b] hover:bg-[#d8551b] text-white"
            >
              {sending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {sending ? 'Sending…' : 'Send to reps'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel confirmation */}
      <AlertDialog open={cancelOpen} onOpenChange={(open) => { if (!cancelling) setCancelOpen(open) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this draft?</AlertDialogTitle>
            <AlertDialogDescription>
              The week-ahead draft will be marked cancelled and can no longer be sent. The next Monday cron will create a fresh draft.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep draft</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); cancelDraft() }}
              disabled={cancelling}
              className="bg-gray-700 hover:bg-gray-800 text-white"
            >
              {cancelling && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {cancelling ? 'Cancelling…' : 'Cancel draft'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
