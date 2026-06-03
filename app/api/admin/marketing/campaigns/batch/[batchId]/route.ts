// ============================================================
// GET /api/admin/marketing/campaigns/batch/[batchId]
// Return batch metadata + per-rep campaign rows.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getBatchCampaigns, updateCampaignStatus } from '@/lib/admin-db'
import { getCampaignReport } from '@/lib/marketing-mailchimp'

export const runtime = 'nodejs'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Reconcile concurrency cap (matches send-stats / preview-to-reps).
const RECONCILE_CONCURRENCY = 5

async function runWithConcurrency<TIn, TOut>(
  items:  TIn[],
  limit:  number,
  worker: (item: TIn, index: number) => Promise<TOut>,
): Promise<TOut[]> {
  const results: TOut[] = new Array(items.length)
  let cursor = 0
  const workerCount = Math.max(1, Math.min(limit, items.length))
  const runners = Array.from({ length: workerCount }, async () => {
    while (cursor < items.length) {
      const idx = cursor++
      results[idx] = await worker(items[idx], idx)
    }
  })
  await Promise.all(runners)
  return results
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ batchId: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { batchId } = await ctx.params
  if (!batchId || !UUID_RE.test(batchId)) {
    return NextResponse.json({ error: 'Invalid batchId' }, { status: 400 })
  }

  const rows = await getBatchCampaigns(batchId)
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
  }

  // ── Self-heal stale 'scheduled' rows ─────────────────────────────
  // Mailchimp doesn't push status back to us, so a scheduled campaign
  // that has actually sent stays 'scheduled' locally forever. On view,
  // reconcile candidate rows against the Mailchimp report (the oracle
  // for "did it send?"). Candidates are EXACTLY: status='scheduled' AND
  // scheduled_at in the past AND a non-null mailchimp_campaign_id —
  // nothing else hits Mailchimp. Concurrency-capped at 5, per-row
  // failure-isolated, and self-extinguishing (a healed row is no longer
  // a candidate). The in-memory rows are mutated so counts below (and
  // the response) reflect reality without a re-fetch.
  const now = Date.now()
  const candidates = rows.filter(
    (r) =>
      r.status === 'scheduled' &&
      !!r.mailchimp_campaign_id &&
      !!r.scheduled_at &&
      new Date(r.scheduled_at).getTime() < now,
  )
  if (candidates.length > 0) {
    await runWithConcurrency(candidates, RECONCILE_CONCURRENCY, async (row) => {
      try {
        const report = await getCampaignReport(row.mailchimp_campaign_id as string)
        if (!report) return // unsent / no report yet → leave 'scheduled'
        const sentAtIso = new Date(report.sendTime).toISOString()
        // Idempotent: the status='scheduled' guard makes a concurrent
        // view that already healed this row a harmless no-op.
        await updateCampaignStatus(row.id, 'sent', {
          sentAt:          sentAtIso,
          onlyIfScheduled: true,
        })
        row.status = 'sent' // reflect in the response + counts below
      } catch (err) {
        // One bad report must never abort the reconcile or the route.
        console.warn('[batch-detail] reconcile skipped a row', {
          campaign_id: row.mailchimp_campaign_id,
          error:       err instanceof Error ? err.message : String(err),
        })
      }
    })
  }

  const server = process.env.MAILCHIMP_SERVER
  const editUrl = (webId: string | null) =>
    webId && server ? `https://${server}.admin.mailchimp.com/campaigns/edit?id=${webId}` : null

  const counts = {
    total:     rows.length,
    drafts:    rows.filter((r) => r.status === 'draft').length,
    scheduled: rows.filter((r) => r.status === 'scheduled').length,
    sent:      rows.filter((r) => r.status === 'sent').length,
    cancelled: rows.filter((r) => r.status === 'cancelled').length,
  }

  const scheduledTimes = rows
    .filter((r) => r.scheduled_at)
    .map((r) => r.scheduled_at as string)
    .sort()

  // First-name as batch label (matches the history endpoint's logic).
  const firstCampaignName = rows[0]?.name ?? 'Untitled batch'

  return NextResponse.json({
    batch: {
      batch_id:            batchId,
      first_campaign_name: firstCampaignName,
      created_at:          rows[0]?.created_at ?? null,
      next_send_time:      scheduledTimes[0] ?? null,
      reply_to_mode:       rows[0]?.reply_to_mode ?? null,
      ...counts,
    },
    campaigns: rows.map((r) => ({
      id:                    r.id,
      rep_slug:              r.rep_slug,
      rep_name:              r.rep_name,
      name:                  r.name,
      subject:               r.subject,
      audience_id:           r.audience_id,
      template_id:           r.template_id,
      mailchimp_campaign_id: r.mailchimp_campaign_id,
      mailchimp_web_id:      r.mailchimp_web_id,
      edit_url:              editUrl(r.mailchimp_web_id),
      status:                r.status,
      scheduled_at:          r.scheduled_at,
      created_at:            r.created_at,
    })),
  })
}
