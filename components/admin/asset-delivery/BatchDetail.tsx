'use client'

/**
 * BatchDetail — Asset Delivery batch detail view.
 *
 * Shows summary + per-rep send status. Failed rows can be expanded to see
 * the error message. The page is server-hydrated so this component does no
 * loading itself; it only refetches when an action (e.g. delete) needs to
 * navigate away.
 *
 * For draft batches, the primary CTA is "Continue editing" → wizard.
 * For sent batches, no actions other than (optional) navigate back.
 */
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Paperclip, ChevronDown, ChevronRight, AlertCircle, CheckCircle2,
  Loader2, Mail, Trash2, Users, Files, HardDrive, ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  StatusPill, formatDate, formatTime, InlineAlert,
} from '@/components/admin/marketing/shared'
import type { AssetDeliveryBatchStatus, AssetDeliverySendStatus } from '@/lib/admin-db'

interface BatchData {
  id:               number
  batch_id:         string
  campaign_slug:    string
  campaign_name:    string
  lane:             string | null
  email_subject:    string
  status:           AssetDeliveryBatchStatus
  total_recipients: number
  total_files:      number
  total_bytes:      number
  sent_at:          string | null
  created_at:       string
  updated_at:       string
  created_by:       string | null
  updated_by:       string | null
}

interface BatchFile {
  id:                number
  batch_id:          string
  rep_email:         string
  format:            string
  original_filename: string
  r2_url:            string
  file_size_bytes:   number
  mime_type:         string | null
  uploaded_at:       string
}

interface BatchSend {
  id:                     number
  batch_id:               string
  rep_id:                 number | null
  rep_email:              string
  rep_name:               string
  send_status:            AssetDeliverySendStatus
  attachment_count:       number
  attachment_total_bytes: number
  sendgrid_message_id:    string | null
  sent_at:                string | null
  error_message:          string | null
  created_at:             string
  updated_at:             string
}

interface Props {
  initialBatch: BatchData
  initialFiles: BatchFile[]
  initialSends: BatchSend[]
}

function formatBytes(n: number): string {
  if (!n) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let v = n
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(v >= 100 || i === 0 ? 0 : 1)} ${units[i]}`
}

function pillStatus(s: AssetDeliveryBatchStatus): 'draft' | 'scheduled' | 'sent' | 'failed' | 'cancelled' | 'skipped' {
  switch (s) {
    case 'draft':    return 'draft'
    case 'ready':    return 'draft'
    case 'sending':  return 'scheduled'
    case 'sent':     return 'sent'
    case 'failed':   return 'failed'
    case 'archived': return 'cancelled'
    default:         return 'draft'
  }
}

function sendPillStatus(s: AssetDeliverySendStatus): 'draft' | 'scheduled' | 'sent' | 'failed' | 'skipped' {
  switch (s) {
    case 'pending': return 'draft'
    case 'sending': return 'scheduled'
    case 'sent':    return 'sent'
    case 'failed':  return 'failed'
    case 'skipped': return 'skipped'
    default:        return 'draft'
  }
}

export function BatchDetail({ initialBatch, initialFiles, initialSends }: Props) {
  const router = useRouter()
  const batch  = initialBatch
  const files  = initialFiles
  const sends  = initialSends

  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  /* ── Derived counts ──────────────────────────────────────── */
  const counts = useMemo(() => {
    const sent    = sends.filter((s) => s.send_status === 'sent').length
    const failed  = sends.filter((s) => s.send_status === 'failed').length
    const pending = sends.filter((s) => s.send_status === 'pending' || s.send_status === 'sending').length
    const skipped = sends.filter((s) => s.send_status === 'skipped').length
    return { sent, failed, pending, skipped, total: sends.length }
  }, [sends])

  const isDraft = batch.status === 'draft' || batch.status === 'ready'

  async function deleteBatch() {
    setConfirmDelete(false)
    setDeleting(true)
    setError('')
    try {
      const res = await fetch(
        `/api/admin/marketing/asset-delivery/batches/${batch.batch_id}`,
        { method: 'DELETE' },
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      router.push('/admin/team/marketing/asset-delivery')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header strip */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-2 text-2xl font-bold text-[#03374f]">
              <Paperclip className="w-6 h-6 text-[#f26b2b]" />
              {batch.campaign_name}
            </h1>
            <div className="mt-2 flex items-center gap-2 flex-wrap text-xs text-gray-500">
              <StatusPill status={pillStatus(batch.status)} />
              {batch.lane && (
                <span className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">
                  {batch.lane}
                </span>
              )}
              <span>·</span>
              <span className="font-mono">{batch.campaign_slug}</span>
              <span>·</span>
              <span>
                {batch.sent_at
                  ? <>Sent {formatDate(batch.sent_at)} at {formatTime(batch.sent_at)}</>
                  : <>Created {formatDate(batch.created_at)}</>}
              </span>
              {batch.created_by && (
                <>
                  <span>·</span>
                  <span>by {batch.created_by}</span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <span className="font-semibold">Subject:</span> {batch.email_subject}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isDraft && (
              <Link href={`/admin/team/marketing/asset-delivery/new?batchId=${batch.batch_id}`}>
                <Button className="bg-[#f26b2b] hover:bg-[#d8551b] text-white">
                  Continue editing
                </Button>
              </Link>
            )}
            {isDraft && (
              <Button variant="outline" onClick={() => setConfirmDelete(true)} disabled={deleting}>
                <Trash2 className="w-4 h-4 mr-1.5" /> Delete
              </Button>
            )}
          </div>
        </div>
      </Card>

      {error && <InlineAlert kind="error" message={error} onClose={() => setError('')} />}

      {/* Summary tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryTile icon={<Users  className="w-4 h-4" />} label="Total Reps"    value={String(batch.total_recipients || sends.length)} />
        <SummaryTile icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />} label="Sent"           value={String(counts.sent)} />
        <SummaryTile icon={<AlertCircle  className="w-4 h-4 text-red-600" />}     label="Failed"         value={String(counts.failed)} accent={counts.failed > 0 ? 'red' : undefined} />
        <SummaryTile icon={<Files  className="w-4 h-4" />} label="Total Files"   value={String(batch.total_files)} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
        <SummaryTile icon={<HardDrive className="w-4 h-4" />} label="Total Size" value={formatBytes(batch.total_bytes)} />
        <SummaryTile
          icon={counts.failed === 0 && counts.sent > 0
            ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            : counts.failed > 0
              ? <AlertCircle className="w-4 h-4 text-red-600" />
              : <Loader2 className="w-4 h-4 text-gray-400" />}
          label="Overall Status"
          value={
            counts.total === 0 ? 'No sends'
            : counts.failed === 0 && counts.sent === counts.total ? 'All sent successfully'
            : counts.failed > 0 && counts.sent > 0 ? `Partial (${counts.sent}/${counts.total} sent)`
            : counts.failed === counts.total ? 'All failed'
            : 'In progress'
          }
        />
      </div>

      {/* Per-rep send table */}
      <Card className="p-0 overflow-hidden gap-0">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#f26b2b]" />
            <h2 className="font-semibold text-[#03374f] text-sm">Per-rep status</h2>
          </div>
          <span className="text-xs text-gray-400">{sends.length} {sends.length === 1 ? 'recipient' : 'recipients'}</span>
        </div>
        {sends.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">
            This batch hasn&apos;t been sent yet — no per-rep records.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-2.5 text-xs font-semibold text-gray-500 w-6"></th>
                  <th className="px-5 py-2.5 text-xs font-semibold text-gray-500">Rep</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500">Status</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 text-right">Files</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 text-right">Size</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500">Sent At</th>
                </tr>
              </thead>
              <tbody>
                {sends.map((s) => {
                  const expanded = expandedRow === s.id
                  const repFiles = files.filter(
                    (f) => f.rep_email.toLowerCase() === s.rep_email.toLowerCase(),
                  )
                  return (
                    <FragmentRows
                      key={s.id}
                      send={s}
                      files={repFiles}
                      expanded={expanded}
                      onToggle={() => setExpandedRow(expanded ? null : s.id)}
                    />
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this draft batch?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the batch metadata. Uploaded files remain in R2 storage and will need to be cleaned up by an admin sweep job.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep batch</AlertDialogCancel>
            <AlertDialogAction onClick={deleteBatch} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/* ─── Sub-components ─────────────────────────────────────────── */

function SummaryTile({
  icon, label, value, accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  accent?: 'red' | 'green'
}) {
  return (
    <Card className={`p-4 ${
      accent === 'red'   ? 'border-red-100 bg-red-50/30' :
      accent === 'green' ? 'border-emerald-100 bg-emerald-50/30' : ''
    }`}>
      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">{icon}{label}</div>
      <div className="text-lg font-semibold text-[#03374f]">{value}</div>
    </Card>
  )
}

function FragmentRows({
  send, files, expanded, onToggle,
}: {
  send: BatchSend
  files: BatchFile[]
  expanded: boolean
  onToggle: () => void
}) {
  const canExpand = send.send_status === 'failed' || files.length > 0
  return (
    <>
      <tr className="border-t border-gray-50 hover:bg-gray-50/40">
        <td className="px-5 py-2.5 align-middle">
          {canExpand ? (
            <button onClick={onToggle} className="text-gray-400 hover:text-[#03374f]">
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : null}
        </td>
        <td className="px-5 py-2.5">
          <div className="font-medium text-[#03374f]">{send.rep_name}</div>
          <div className="text-[11px] text-gray-400 font-mono">{send.rep_email}</div>
        </td>
        <td className="px-3 py-2.5">
          <StatusPill status={sendPillStatus(send.send_status)} />
        </td>
        <td className="px-3 py-2.5 text-right text-gray-700">{send.attachment_count}</td>
        <td className="px-3 py-2.5 text-right text-gray-700">{formatBytes(send.attachment_total_bytes)}</td>
        <td className="px-3 py-2.5 text-gray-600">
          {send.sent_at ? <>{formatDate(send.sent_at)} {formatTime(send.sent_at)}</> : '—'}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50/60 border-t border-gray-100">
          <td></td>
          <td colSpan={5} className="px-5 py-3 text-xs">
            {send.error_message && (
              <div className="mb-3">
                <div className="font-semibold text-red-700 mb-1">Error</div>
                <div className="font-mono text-red-600 bg-red-50 border border-red-100 rounded p-2 text-[11px] whitespace-pre-wrap break-words">
                  {send.error_message}
                </div>
              </div>
            )}
            {files.length > 0 && (
              <div>
                <div className="font-semibold text-[#03374f] mb-1">Attachments ({files.length})</div>
                <ul className="space-y-0.5">
                  {files.map((f) => (
                    <li key={f.id} className="flex items-center justify-between gap-3">
                      <a
                        href={f.r2_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[11px] text-[#f26b2b] hover:underline inline-flex items-center gap-1 truncate"
                      >
                        {f.original_filename}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                      <span className="text-[11px] text-gray-400 flex-shrink-0">
                        {f.format} · {formatBytes(f.file_size_bytes)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {send.sendgrid_message_id && (
              <div className="mt-3 text-[11px] text-gray-400">
                SendGrid msg id: <span className="font-mono">{send.sendgrid_message_id}</span>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}
