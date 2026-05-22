'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Loader2, Inbox } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatTime, StatusPill } from './shared'

interface BatchSummary {
  batch_id:            string | null
  first_campaign_name: string
  created_at:          string
  total:               number
  drafts:              number
  scheduled:           number
  sent:                number
  cancelled:           number
  next_send_time:      string | null
}

export function RecentBatches({ limit = 5 }: { limit?: number }) {
  const [items, setItems] = useState<BatchSummary[] | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/marketing/campaigns/batches?limit=${limit}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load')
        if (!cancelled) setItems(data.batches || [])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      }
    })()
    return () => { cancelled = true }
  }, [limit])

  if (error) {
    return <p className="text-xs text-red-600">{error}</p>
  }
  if (items === null) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl bg-gray-200" />
        ))}
      </div>
    )
  }
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
        <Inbox className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">No campaign batches yet.</p>
        <Link href="/admin/team/marketing/campaigns/new"
              className="mt-2 text-xs text-[#f26b2b] hover:underline">
          Create your first batch →
        </Link>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-50">
      {items.map((b) => {
        const subtitle = batchSubtitle(b)
        const href = b.batch_id
          ? `/admin/team/marketing/history/${b.batch_id}`
          : '/admin/team/marketing/history'
        return (
          <Link key={(b.batch_id ?? 'legacy') + b.created_at} href={href}
                className="block px-5 py-4 hover:bg-gray-50/60 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-gray-400">{formatDate(b.created_at)}</p>
                <p className="font-semibold text-[#03374f] truncate">{b.first_campaign_name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 justify-end">
                {b.sent       > 0 && <StatusPill status="sent" size="xs" />}
                {b.scheduled  > 0 && <StatusPill status="scheduled" size="xs" />}
                {b.drafts     > 0 && <StatusPill status="draft" size="xs" />}
                {b.cancelled  > 0 && <StatusPill status="cancelled" size="xs" />}
              </div>
            </div>
            {b.scheduled > 0 && b.next_send_time && (
              <p className="text-[11px] text-blue-600 mt-1.5 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Next send: {formatTime(b.next_send_time)}
              </p>
            )}
          </Link>
        )
      })}
    </div>
  )
}

function batchSubtitle(b: BatchSummary): string {
  const parts: string[] = []
  parts.push(`${b.total} ${b.total === 1 ? 'campaign' : 'campaigns'}`)
  const status: string[] = []
  if (b.sent)      status.push(`${b.sent} sent`)
  if (b.scheduled) status.push(`${b.scheduled} scheduled`)
  if (b.drafts)    status.push(`${b.drafts} draft`)
  if (b.cancelled) status.push(`${b.cancelled} cancelled`)
  if (status.length) parts.push(status.join(' · '))
  return parts.join(' · ')
}

/** Compact "Open in Mailchimp" link for batches with a webId — currently unused
 *  by the hub list (we link to our detail page), but exported for reuse. */
export function MailchimpLink({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
       className="inline-flex items-center gap-1 text-xs text-[#f26b2b] hover:underline">
      Open in Mailchimp <ExternalLink className="w-3 h-3" />
    </a>
  )
}
