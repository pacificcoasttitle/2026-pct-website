'use client'

/**
 * DraftsList — Marketing Recap hub's "Recent Drafts" panel.
 *
 * Two responsibilities:
 *
 *   1. Render a table of recent drafts (week range / subject / status /
 *      generated time / recipient count / view link). Newest first.
 *
 *   2. "Generate Draft Now" CTA → AlertDialog confirmation → POST to
 *      /api/admin/marketing/recap/generate-draft → on success, navigate
 *      to the new draft's detail page.
 *
 * Mirrors RecipientsManager conventions:
 *   - InlineAlert from @/components/admin/marketing/shared for feedback
 *   - shadcn AlertDialog for confirm-before-act
 *   - Loader2 spinner on async confirm
 *   - Brand navy #03374f / orange #f26b2b only (no #003d79)
 *
 * The StatusBadge below is local to recap UI because the shared
 * StatusPill in components/admin/marketing/shared.tsx doesn't include
 * a 'sending' variant, and the recap product spec mandates four
 * specific colors (draft gray, sending orange, sent green, failed red).
 */

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Newspaper, Plus, Loader2, Inbox, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { InlineAlert } from '@/components/admin/marketing/shared'
import type { RecapDraft, RecapDraftStatus } from '@/lib/admin-db'

interface Props {
  initialDrafts: RecapDraft[]
  initialError?: string
}

/* ─── Helpers ────────────────────────────────────────────────── */

// Pulls week_range_label out of context_json defensively. The DB column
// is JSONB and typed as `unknown` at the lib boundary, so we narrow at
// the call site rather than trusting a cast.
function getWeekRangeLabel(d: RecapDraft): string {
  const ctx = d.context_json
  if (ctx && typeof ctx === 'object' && 'week_range_label' in ctx) {
    const label = (ctx as { week_range_label?: unknown }).week_range_label
    if (typeof label === 'string' && label.trim().length > 0) return label
  }
  return `${d.week_start_date} to ${d.week_end_date}`
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

/* ─── StatusBadge (local — see header comment) ───────────────── */

const STATUS_STYLE: Record<RecapDraftStatus, string> = {
  draft:   'bg-gray-100 text-gray-700 border border-gray-200',
  sending: 'bg-[#f26b2b]/15 text-[#c4541d] border border-[#f26b2b]/30',
  sent:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  failed:  'bg-red-50 text-red-700 border border-red-200',
}

export function StatusBadge({ status }: { status: RecapDraftStatus }) {
  const cls = STATUS_STYLE[status] ?? STATUS_STYLE.draft
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${cls}`}
    >
      {status}
    </span>
  )
}

/* ─── Main component ─────────────────────────────────────────── */

export function DraftsList({ initialDrafts, initialError = '' }: Props) {
  const router = useRouter()

  const [drafts] = useState<RecapDraft[]>(initialDrafts)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [generating,  setGenerating]  = useState(false)
  const [error,       setError]       = useState('')
  const [info,        setInfo]        = useState('')
  const [listError]                   = useState(initialError)

  const sorted = useMemo(() => drafts, [drafts]) // server already orders newest first

  async function generateDraft() {
    setGenerating(true)
    setError(''); setInfo('')
    try {
      const res = await fetch('/api/admin/marketing/recap/generate-draft', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        // No body — server computes thisMondayPT.
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || `Generate failed (${res.status})`)
      }
      if (!data?.draft_id) {
        throw new Error('Generated draft but server did not return a draft_id.')
      }
      setConfirmOpen(false)
      setInfo('Draft generated. Redirecting…')
      router.push(`/admin/team/marketing-recap/${data.draft_id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate draft')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Header + CTA */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-[#03374f] text-base">
          <Newspaper className="w-4 h-4 text-[#f26b2b]" />
          Recent Drafts
        </h2>
        <Button
          onClick={() => { setError(''); setInfo(''); setConfirmOpen(true) }}
          className="bg-[#f26b2b] hover:bg-[#d8551b] text-white"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Generate Draft Now
        </Button>
      </div>

      {error    && <InlineAlert kind="error"   message={error}     onClose={() => setError('')} />}
      {info     && <InlineAlert kind="success" message={info}      onClose={() => setInfo('')} />}
      {listError && <InlineAlert kind="info"   message={listError} />}

      <Card className="overflow-hidden p-0 gap-0">
        {sorted.length === 0 ? (
          <div className="px-6 py-14 flex flex-col items-center text-center bg-[#f0ede9]/40">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-[#03374f] mb-1">No drafts yet</p>
            <p className="text-xs text-gray-500 max-w-md">
              Click <span className="font-semibold">Generate Draft Now</span> to create one. The recap pulls last week&apos;s activity and this week&apos;s upcoming items.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-2.5 text-xs font-semibold text-gray-500">Week</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500">Subject</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500">Status</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500">Generated</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500">Recipients</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((d) => (
                  <tr key={d.draft_id} className="border-t border-gray-50 hover:bg-gray-50/60">
                    <td className="px-5 py-2.5 font-medium text-[#03374f] whitespace-nowrap">
                      {getWeekRangeLabel(d)}
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 max-w-[260px] truncate" title={d.subject}>
                      {d.subject}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={d.status} />
                    </td>
                    <td
                      className="px-3 py-2.5 text-gray-500 text-[12px] whitespace-nowrap"
                      title={d.created_at}
                    >
                      {relativeTime(d.created_at)}
                    </td>
                    <td className="px-3 py-2.5 text-gray-700">
                      {d.status === 'draft' ? '—' : (d.recipient_count ?? '—')}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Link
                        href={`/admin/team/marketing-recap/${d.draft_id}`}
                        className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#03374f] hover:text-[#f26b2b]"
                      >
                        View <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Generate-Draft confirmation */}
      <AlertDialog open={confirmOpen} onOpenChange={(open) => { if (!generating) setConfirmOpen(open) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate a new draft?</AlertDialogTitle>
            <AlertDialogDescription>
              This will query last week&apos;s asset-delivery activity and next week&apos;s upcoming items, then create a new draft you can preview before sending.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={generating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); generateDraft() }}
              disabled={generating}
              className="bg-[#f26b2b] hover:bg-[#d8551b] text-white"
            >
              {generating && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {generating ? 'Generating…' : 'Generate Draft'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
