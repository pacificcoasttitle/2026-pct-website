'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2, Inbox } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  StatusPill, formatDate, formatTime, InlineAlert,
} from './shared'

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

type StatusFilter = 'all' | 'scheduled' | 'sent' | 'draft' | 'cancelled'
type RangeFilter  = '7' | '30' | '90' | 'all'

const PAGE_SIZE = 20

export function HistoryList() {
  const [batches, setBatches] = useState<BatchSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [range,  setRange]  = useState<RangeFilter>('30')

  async function load(offset: number, append: boolean) {
    if (append) setLoadingMore(true); else setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/marketing/campaigns/batches?limit=${PAGE_SIZE}&offset=${offset}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setBatches((prev) => append ? [...prev, ...data.batches] : data.batches)
      setHasMore(!!data.hasMore)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false); setLoadingMore(false)
    }
  }

  useEffect(() => { load(0, false) }, [])

  /* ── Client-side filters ───────────────────────────────── */
  const now = Date.now()
  const cutoff = range === 'all' ? 0 : now - Number(range) * 24 * 60 * 60 * 1000

  const filtered = batches.filter((b) => {
    if (range !== 'all') {
      const t = new Date(b.created_at).getTime()
      if (Number.isFinite(t) && t < cutoff) return false
    }
    if (status === 'all') return true
    if (status === 'scheduled') return b.scheduled > 0
    if (status === 'sent')      return b.sent      > 0
    if (status === 'draft')     return b.drafts    > 0
    if (status === 'cancelled') return b.cancelled > 0
    return true
  })

  const batchEntries  = filtered.filter((b) => b.batch_id)
  const legacyEntries = filtered.filter((b) => !b.batch_id)

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Status:</span>
          <Select value={status} onValueChange={(v: StatusFilter) => setStatus(v)}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Range:</span>
          <Select value={range} onValueChange={(v: RangeFilter) => setRange(v)}>
            <SelectTrigger className="w-40 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && <InlineAlert kind="error" message={error} onClose={() => setError('')} />}

      {/* Batches */}
      <section className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">Batches</h2>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl bg-gray-200" />)}
          </div>
        ) : batchEntries.length === 0 ? (
          <Card className="py-12 flex flex-col items-center text-gray-400">
            <Inbox className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No batches match these filters.</p>
          </Card>
        ) : (
          <Card className="p-0 gap-0 overflow-hidden">
            <ul className="divide-y divide-gray-50">
              {batchEntries.map((b) => <BatchRow key={b.batch_id!} batch={b} />)}
            </ul>
          </Card>
        )}
      </section>

      {/* Legacy non-batch entries */}
      {legacyEntries.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Individual Campaigns (legacy)
          </h2>
          <Card className="p-0 gap-0 overflow-hidden">
            <ul className="divide-y divide-gray-50">
              {legacyEntries.map((b) => (
                <li key={b.created_at + b.first_campaign_name} className="px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-gray-400">{formatDate(b.created_at)}</p>
                      <p className="font-medium text-[#03374f]">{b.first_campaign_name}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {b.sent      > 0 && <StatusPill status="sent" size="xs" />}
                      {b.scheduled > 0 && <StatusPill status="scheduled" size="xs" />}
                      {b.drafts    > 0 && <StatusPill status="draft" size="xs" />}
                      {b.cancelled > 0 && <StatusPill status="cancelled" size="xs" />}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => load(batches.length, true)} disabled={loadingMore}>
            {loadingMore
              ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Loading…</>
              : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  )
}

function BatchRow({ batch }: { batch: BatchSummary }) {
  const href = `/admin/team/marketing/history/${batch.batch_id}`
  return (
    <li className="px-5 py-4 hover:bg-gray-50/60 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link href={href} className="min-w-0 block flex-1">
          <p className="text-xs text-gray-400">{formatDate(batch.created_at)}</p>
          <p className="font-semibold text-[#03374f] truncate">{batch.first_campaign_name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {batch.total} {batch.total === 1 ? 'campaign' : 'campaigns'}
            {batch.scheduled > 0 && batch.next_send_time && (
              <> · Next send: {formatTime(batch.next_send_time)}</>
            )}
          </p>
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          {batch.sent      > 0 && <StatusPill status="sent" size="xs" />}
          {batch.scheduled > 0 && <StatusPill status="scheduled" size="xs" />}
          {batch.drafts    > 0 && <StatusPill status="draft" size="xs" />}
          {batch.cancelled > 0 && <StatusPill status="cancelled" size="xs" />}
          <Link href={href}>
            <Button variant="outline" size="sm">View details</Button>
          </Link>
        </div>
      </div>
    </li>
  )
}
