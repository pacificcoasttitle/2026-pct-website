'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ExternalLink, Loader2, RefreshCw, AlertCircle, BarChart3, Mail } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  StatusPill, formatDate, formatTime, InlineAlert,
} from './shared'

interface BatchMeta {
  batch_id:            string
  first_campaign_name: string
  created_at:          string | null
  next_send_time:      string | null
  reply_to_mode:       string | null
  total:               number
  drafts:              number
  scheduled:           number
  sent:                number
  cancelled:           number
}

interface CampaignRow {
  id:                    number
  rep_slug:              string | null
  rep_name:              string | null
  name:                  string
  subject:               string
  audience_id:           string | null
  template_id:           number | null
  mailchimp_campaign_id: string | null
  mailchimp_web_id:      string | null
  edit_url:              string | null
  status:                string
  scheduled_at:          string | null
  created_at:            string
}

export function BatchDetail({ batchId }: { batchId: string }) {
  const [batch, setBatch] = useState<BatchMeta | null>(null)
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [info,  setInfo]  = useState('')

  const [confirmCancel, setConfirmCancel] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  const [confirmStats, setConfirmStats] = useState(false)
  const [sendingStats, setSendingStats] = useState(false)

  const [sampleOpen, setSampleOpen] = useState(false)
  const [sampleEmail, setSampleEmail] = useState('')
  const [sendingSample, setSendingSample] = useState(false)

  async function load() {
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/admin/marketing/campaigns/batch/${batchId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load')
      setBatch(data.batch)
      setCampaigns(data.campaigns)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally { setLoading(false) }
  }

  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [batchId])

  async function cancelBatch() {
    setCancelling(true); setError(''); setInfo('')
    try {
      const res = await fetch(`/api/admin/marketing/campaigns/batch/${batchId}/cancel`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Cancel failed')
      setInfo(`${data.cancelled} cancelled · ${data.failed} failed · ${data.skipped} already settled.`)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cancel failed')
    } finally {
      setCancelling(false); setConfirmCancel(false)
    }
  }

  async function sendStats() {
    setSendingStats(true); setError(''); setInfo('')
    try {
      const res = await fetch(`/api/admin/marketing/campaigns/${batchId}/send-stats`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Send stats failed')
      const sent    = data.sent    ?? 0
      const failed  = data.failed  ?? 0
      const skipped = data.skipped ?? 0
      let summary = `Stats sent to ${sent} rep${sent === 1 ? '' : 's'}.`
      if (failed > 0) summary += ` ${failed} failed.`
      if (skipped > 0) {
        const reasons: string[] = []
        if (data.skipped_no_report      > 0) reasons.push(`${data.skipped_no_report} no report yet`)
        if (data.skipped_no_campaign_id > 0) reasons.push(`${data.skipped_no_campaign_id} never pushed`)
        if (data.skipped_no_email       > 0) reasons.push(`${data.skipped_no_email} no email`)
        summary += ` ${skipped} skipped${reasons.length ? ` (${reasons.join(', ')})` : ''}.`
      }
      setInfo(summary)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send stats failed')
    } finally {
      setSendingStats(false); setConfirmStats(false)
    }
  }

  const sampleEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sampleEmail.trim())

  async function sendSample() {
    setSendingSample(true); setError(''); setInfo('')
    try {
      const res = await fetch(`/api/admin/marketing/campaigns/${batchId}/send-stats-sample`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: sampleEmail.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Sample send failed')
      if (data.reason === 'no_sendable_stats' || data.sent === 0) {
        setInfo('No sent campaign with stats yet — nothing to sample.')
      } else {
        const rep = data.sampled_rep ? ` (using ${data.sampled_rep}'s stats)` : ''
        setInfo(`Sample sent to ${sampleEmail.trim()}${rep}.`)
      }
      setSampleOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sample send failed')
    } finally {
      setSendingSample(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full rounded-xl bg-gray-200" />
        <Skeleton className="h-64 w-full rounded-xl bg-gray-200" />
      </div>
    )
  }
  if (!batch) {
    return (
      <Card className="p-8 text-center space-y-2">
        <AlertCircle className="w-8 h-8 mx-auto text-amber-500" />
        <p className="text-sm text-gray-600">{error || 'Batch not found.'}</p>
        <Link href="/admin/team/marketing/history" className="text-sm text-[#f26b2b] hover:underline">← Back to history</Link>
      </Card>
    )
  }

  const hasScheduled = batch.scheduled > 0
  const hasSent      = batch.sent > 0

  return (
    <div className="space-y-5">
      {error && <InlineAlert kind="error"   message={error} onClose={() => setError('')} />}
      {info  && <InlineAlert kind="success" message={info}  onClose={() => setInfo('')} />}

      {/* Summary */}
      <Card className="p-5 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-gray-400">{formatDate(batch.created_at)}</p>
            <h2 className="text-lg font-bold text-[#03374f]">{batch.first_campaign_name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {batch.total} {batch.total === 1 ? 'campaign' : 'campaigns'} · Reply-to: {batch.reply_to_mode || 'unknown'}
            </p>
            {hasScheduled && batch.next_send_time && (
              <p className="text-xs text-blue-700 mt-1">
                Next send: {formatTime(batch.next_send_time)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
            </Button>
            {hasSent && (
              <Button variant="outline" size="sm"
                      onClick={() => { setError(''); setInfo(''); setConfirmStats(true) }}
                      disabled={sendingStats}
                      className="text-[#03374f] border-[#f26b2b]/40 hover:bg-[#f26b2b]/10">
                {sendingStats
                  ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Sending…</>
                  : <><BarChart3 className="w-3.5 h-3.5 mr-1" /> Send stats to reps</>}
              </Button>
            )}
            {hasSent && (
              <Button variant="outline" size="sm"
                      onClick={() => { setError(''); setInfo(''); setSampleOpen(true) }}
                      disabled={sendingSample}
                      className="text-[#03374f] border-gray-300 hover:bg-gray-50">
                {sendingSample
                  ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Sending…</>
                  : <><Mail className="w-3.5 h-3.5 mr-1" /> Send sample…</>}
              </Button>
            )}
            {hasScheduled && (
              <Button variant="outline" size="sm"
                      onClick={() => setConfirmCancel(true)} disabled={cancelling}
                      className="text-red-600 border-red-200 hover:bg-red-50">
                {cancelling
                  ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Cancelling…</>
                  : 'Cancel batch'}
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {batch.sent      > 0 && <StatusPill status="sent" /> }
          {batch.scheduled > 0 && <StatusPill status="scheduled" /> }
          {batch.drafts    > 0 && <StatusPill status="draft" /> }
          {batch.cancelled > 0 && <StatusPill status="cancelled" /> }
        </div>
      </Card>

      {/* Per-rep table */}
      <Card className="p-0 gap-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-[#03374f]">Campaigns ({campaigns.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-2.5 text-xs font-semibold text-gray-500">Rep</th>
                <th className="px-5 py-2.5 text-xs font-semibold text-gray-500">Campaign</th>
                <th className="px-5 py-2.5 text-xs font-semibold text-gray-500">Status</th>
                <th className="px-5 py-2.5 text-xs font-semibold text-gray-500">Scheduled</th>
                <th className="px-5 py-2.5 text-xs font-semibold text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-t border-gray-50 hover:bg-gray-50/40">
                  <td className="px-5 py-3">
                    <p className="font-medium text-[#03374f]">{c.rep_name || c.rep_slug || '—'}</p>
                    {c.audience_id && (
                      <p className="text-[11px] text-gray-400 font-mono">{c.audience_id}</p>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-[#03374f] truncate max-w-[260px]">{c.name}</p>
                    <p className="text-[11px] text-gray-400 truncate max-w-[260px]">{c.subject}</p>
                  </td>
                  <td className="px-5 py-3"><StatusPill status={c.status} size="xs" /></td>
                  <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {c.scheduled_at ? `${formatDate(c.scheduled_at)} ${formatTime(c.scheduled_at)}` : '—'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {c.edit_url ? (
                      <a href={c.edit_url} target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-1 text-xs text-[#f26b2b] hover:underline whitespace-nowrap">
                        Open in Mailchimp <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AlertDialog open={sampleOpen} onOpenChange={(open) => { if (!sendingSample) setSampleOpen(open) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send a sample stats email</AlertDialogTitle>
            <AlertDialogDescription>
              Sends a sample to one address using the first rep&apos;s real numbers, so you can eyeball it before sending to all reps. Subject is prefixed &ldquo;[SAMPLE]&rdquo;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5 py-1">
            <Label htmlFor="sample-email" className="text-xs text-gray-500">Send sample to</Label>
            <Input
              id="sample-email"
              type="email"
              placeholder="you@pct.com"
              value={sampleEmail}
              onChange={(e) => setSampleEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={sendingSample}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); sendSample() }}
              disabled={sendingSample || !sampleEmailValid}
              className="bg-[#f26b2b] hover:bg-[#d8551b] text-white">
              {sendingSample && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {sendingSample ? 'Sending…' : 'Send sample'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmStats} onOpenChange={(open) => { if (!sendingStats) setConfirmStats(open) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send each rep their campaign stats?</AlertDialogTitle>
            <AlertDialogDescription>
              Each rep with a sent campaign in this batch gets an email with their own campaign&apos;s performance (opens, clicks, bounces, unsubscribes). Stats are an early snapshot &ldquo;as of today&rdquo; and keep updating for a few days after send. Reps with no report yet are skipped.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={sendingStats}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); sendStats() }}
              disabled={sendingStats}
              className="bg-[#f26b2b] hover:bg-[#d8551b] text-white">
              {sendingStats && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {sendingStats ? 'Sending…' : 'Send stats to reps'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel {batch.scheduled} scheduled {batch.scheduled === 1 ? 'campaign' : 'campaigns'}?</AlertDialogTitle>
            <AlertDialogDescription>
              Scheduled campaigns in this batch will be unscheduled in Mailchimp and marked cancelled. Already-sent campaigns are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep them</AlertDialogCancel>
            <AlertDialogAction onClick={cancelBatch} className="bg-red-600 hover:bg-red-700 text-white">
              Cancel batch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
