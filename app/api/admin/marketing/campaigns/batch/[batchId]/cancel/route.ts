// ============================================================
// POST /api/admin/marketing/campaigns/batch/[batchId]/cancel
// Cancel every still-'scheduled' campaign in a batch (Mailchimp unschedule
// + flip our DB status to 'cancelled'). Idempotent: campaigns already
// 'sent', 'draft', or 'cancelled' are left alone.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/auth/guards'
import {
  getBatchCampaigns,
  updateCampaignStatus,
} from '@/lib/admin-db'
import { unscheduleCampaign } from '@/lib/mailchimp-schedule'

export const runtime = 'nodejs'

interface CancelResult {
  campaignId:           number               // our DB id
  mailchimp_campaign_id: string | null
  rep_slug:             string | null
  prior_status:         string
  status:               'cancelled' | 'skipped' | 'failed'
  error?:               string
}

// UUID v4 sanity check — Mailchimp errors are uglier than ours if we pass garbage.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ batchId: string }> },
) {
  const auth = await requireApiRole('marketing')
  if ('error' in auth) return auth.error

  const { batchId } = await ctx.params
  if (!batchId || !UUID_RE.test(batchId)) {
    return NextResponse.json({ error: 'Invalid batchId' }, { status: 400 })
  }

  const campaigns = await getBatchCampaigns(batchId)
  if (campaigns.length === 0) {
    return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
  }

  const results: CancelResult[] = []

  for (const c of campaigns) {
    const base: CancelResult = {
      campaignId:            c.id,
      mailchimp_campaign_id: c.mailchimp_campaign_id,
      rep_slug:              c.rep_slug,
      prior_status:          c.status,
      status:                'skipped',
    }

    if (c.status !== 'scheduled') {
      results.push(base)
      continue
    }
    if (!c.mailchimp_campaign_id) {
      results.push({ ...base, status: 'failed', error: 'Missing mailchimp_campaign_id' })
      continue
    }

    try {
      await unscheduleCampaign(c.mailchimp_campaign_id)
      await updateCampaignStatus(c.id, 'cancelled')
      results.push({ ...base, status: 'cancelled' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      // If Mailchimp says the campaign isn't scheduled anymore (race with the
      // 30-min window), trust their state and reflect cancelled in our DB so
      // the UI stops showing it as scheduled. Otherwise report the failure.
      if (/not.*scheduled|cannot.*unschedule/i.test(msg)) {
        try { await updateCampaignStatus(c.id, 'cancelled') } catch { /* ignore */ }
        results.push({ ...base, status: 'cancelled', error: msg })
      } else {
        console.error(`[batch ${batchId}] cancel failed for campaign ${c.id}:`, err)
        results.push({ ...base, status: 'failed', error: msg })
      }
    }
  }

  const cancelled = results.filter((r) => r.status === 'cancelled').length
  const failed    = results.filter((r) => r.status === 'failed').length
  const skipped   = results.filter((r) => r.status === 'skipped').length

  return NextResponse.json({
    batchId,
    cancelled,
    failed,
    skipped,
    total: results.length,
    results,
  })
}
