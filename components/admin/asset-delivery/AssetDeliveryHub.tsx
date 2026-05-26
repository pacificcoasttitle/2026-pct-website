'use client'

/**
 * AssetDeliveryHub — Asset Delivery landing surface.
 *
 * Shows a "+ New Campaign" CTA and a list of recent batches. Batches are
 * seeded server-side and refreshed client-side after the user returns from
 * the wizard (the page is force-dynamic, so a Link round-trip is enough).
 *
 * Status display strategy:
 *   draft    — gray pill, "Continue editing →" link
 *   ready    — gray pill, same continue link
 *   sending  — blue pill, view detail
 *   sent     — emerald pill, view detail
 *   failed   — red pill, view detail
 *   archived — gray pill, view detail
 */
import Link from 'next/link'
import {
  Plus, Paperclip, ChevronRight, Files, Users, HardDrive, Inbox,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  StatusPill, formatDate, formatTime,
} from '@/components/admin/marketing/shared'
import type { AssetDeliveryBatchStatus } from '@/lib/admin-db'

interface BatchListItem {
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

interface Props {
  initialBatches: BatchListItem[]
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

export function AssetDeliveryHub({ initialBatches }: Props) {
  const batches = initialBatches

  return (
    <div className="space-y-6">
      {/* ── Primary CTA ─────────────────────────────────────────── */}
      <div>
        <Link href="/admin/team/marketing/asset-delivery/new">
          <Button className="bg-[#f26b2b] hover:bg-[#d8551b] text-white">
            <Plus className="w-4 h-4 mr-1.5" /> New Campaign
          </Button>
        </Link>
      </div>

      {/* ── Recent campaigns list ──────────────────────────────── */}
      <Card className="overflow-hidden p-0 gap-0">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-[#f26b2b]" />
            <h2 className="font-semibold text-[#03374f] text-sm">
              Recent Campaigns
            </h2>
          </div>
          <span className="text-xs text-gray-400">
            {batches.length} {batches.length === 1 ? 'batch' : 'batches'}
          </span>
        </div>

        {batches.length === 0 ? (
          <div className="px-6 py-14 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-[#03374f] mb-1">No campaigns yet</p>
            <p className="text-xs text-gray-500 mb-5 max-w-xs">
              Click <span className="font-semibold">+ New Campaign</span> above to upload personalized files and send them to your sales team.
            </p>
            <Link href="/admin/team/marketing/asset-delivery/new">
              <Button size="sm" className="bg-[#f26b2b] hover:bg-[#d8551b] text-white">
                <Plus className="w-3.5 h-3.5 mr-1" /> New Campaign
              </Button>
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {batches.map((b) => {
              const isDraft   = b.status === 'draft' || b.status === 'ready'
              const dateLabel = b.sent_at
                ? `Sent ${formatDate(b.sent_at)} at ${formatTime(b.sent_at)}`
                : `Created ${formatDate(b.created_at)}`
              const detailHref = isDraft
                ? `/admin/team/marketing/asset-delivery/new?batchId=${b.batch_id}`
                : `/admin/team/marketing/asset-delivery/${b.batch_id}`
              const linkLabel = isDraft ? 'Continue editing' : 'View detail'
              return (
                <li key={b.batch_id} className="px-5 py-4 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-[#03374f] text-sm truncate">
                          {b.campaign_name}
                        </h3>
                        <StatusPill status={pillStatus(b.status)} />
                        {b.lane && (
                          <span className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">
                            {b.lane}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span>{dateLabel}</span>
                        <span className="inline-flex items-center gap-1">
                          <Users className="w-3 h-3" /> {b.total_recipients} {b.total_recipients === 1 ? 'rep' : 'reps'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Files className="w-3 h-3" /> {b.total_files} {b.total_files === 1 ? 'file' : 'files'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <HardDrive className="w-3 h-3" /> {formatBytes(b.total_bytes)}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={detailHref}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#f26b2b] hover:underline whitespace-nowrap"
                    >
                      {linkLabel} <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </div>
  )
}
