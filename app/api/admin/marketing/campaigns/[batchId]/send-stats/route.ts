/**
 * POST /api/admin/marketing/campaigns/[batchId]/send-stats
 *
 * Manual "Send stats to reps" action for a SENT batch. For each rep
 * campaign in the batch, emails that rep THEIR OWN campaign's Mailchimp
 * performance (opens, unique opens, open rate, clicks, click rate,
 * bounces, unsubscribes), framed as "stats as of {today}".
 *
 * CRITICAL — trust the report, NOT local status: the per-rep report is
 * keyed by the Mailchimp campaign id and exists iff Mailchimp actually
 * sent it. So we DON'T gate on local status='sent' (which can go
 * stale); we fetch getCampaignReport and skip any rep whose report is
 * missing/unsent. A single rep's missing report or fetch error never
 * aborts the batch — that rep is skipped and counted.
 *
 * Recipients are per-rep (each rep gets only their own numbers).
 * Sends via SendGrid (one `to:` per rep, concurrency 5). One optional
 * batch-level record copy to marketing@pct.com.
 *
 * AUTH: Admin session required (same guard as the other campaign routes).
 */
import { NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'
import { requireApiRole } from '@/lib/auth/guards'
import { getBatchCampaigns, getEmployeeAdminBySlug } from '@/lib/admin-db'
import { getCampaignReport } from '@/lib/marketing-mailchimp'
import {
  renderCampaignStats,
  type CampaignStatsContext,
} from '@/lib/email-templates/campaign-stats'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ───── SendGrid lazy-init ─────

let sgInitialized = false

function getSg(): typeof sgMail | null {
  const apiKey = process.env.SENDGRID_API_KEY
  if (!apiKey) {
    console.error('[send-stats] SENDGRID_API_KEY not set')
    return null
  }
  if (!sgInitialized) {
    sgMail.setApiKey(apiKey)
    sgInitialized = true
  }
  return sgMail
}

// ───── Concurrency worker pool (matches preview-to-reps) ─────

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

// ───── Formatting helpers ─────

function pct(fraction: number): string {
  // Mailchimp open_rate/click_rate are fractions (0..1).
  return `${(fraction * 100).toFixed(1)}%`
}

function dateLabel(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    timeZone: 'America/Los_Angeles',
  })
}

function todayLabel(): string {
  return new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    timeZone: 'America/Los_Angeles',
  })
}

const CONCURRENCY = 5
const FROM        = { email: 'marketing@pct.com', name: 'PCT Marketing' }
const RECORD_CC   = 'marketing@pct.com'

interface SendTarget {
  email:        string
  context:      CampaignStatsContext
}

interface Outcome {
  email: string
  ok:    boolean
  error?: string
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ batchId: string }> },
) {
  const auth = await requireApiRole('marketing')
  if ('error' in auth) return auth.error
  const { batchId } = await params

  let campaigns
  try {
    campaigns = await getBatchCampaigns(batchId)
  } catch (err) {
    console.error('[send-stats] failed to load batch campaigns', {
      batch_id: batchId,
      error:    err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: 'Failed to load batch' }, { status: 500 })
  }
  if (campaigns.length === 0) {
    return NextResponse.json({ error: 'Batch not found or empty' }, { status: 404 })
  }

  const asOf = todayLabel()

  // Resolve each rep's report + email. Skips (with reasons) are counted
  // and never abort the batch. Reports are TRUSTED over local status.
  let skipped_no_campaign_id = 0
  let skipped_no_report      = 0
  let skipped_no_email       = 0

  const targets: SendTarget[] = []

  for (const c of campaigns) {
    if (!c.mailchimp_campaign_id) {
      skipped_no_campaign_id++
      continue
    }

    let report
    try {
      report = await getCampaignReport(c.mailchimp_campaign_id)
    } catch (err) {
      // getCampaignReport already swallows errors → null, but guard
      // here too so nothing can abort the loop.
      console.warn('[send-stats] report fetch threw (skipping rep)', {
        campaign_id: c.mailchimp_campaign_id,
        error:       err instanceof Error ? err.message : String(err),
      })
      report = null
    }
    if (!report) {
      skipped_no_report++
      continue
    }

    if (!c.rep_slug) {
      skipped_no_email++
      continue
    }
    const employee = await getEmployeeAdminBySlug(c.rep_slug)
    const email    = (employee?.email || '').trim()
    if (!email) {
      skipped_no_email++
      continue
    }

    const firstName = (employee?.first_name || '').trim()
      || (c.rep_name || '').trim().split(' ')[0]
      || 'there'
    const campaignName = (c.name || report.campaignTitle || c.subject || 'your campaign').trim()

    const context: CampaignStatsContext = {
      subject:         `Your campaign results: ${campaignName}`,
      rep_first_name:  firstName,
      campaign_name:   campaignName,
      sent_date_label: dateLabel(report.sendTime),
      as_of_label:     asOf,
      opens_total:     String(report.opensTotal),
      unique_opens:    String(report.uniqueOpens),
      open_rate:       pct(report.openRate),
      clicks_total:    String(report.clicksTotal),
      click_rate:      pct(report.clickRate),
      bounces:         String(report.bounces),
      unsubscribes:    String(report.unsubscribed),
    }
    targets.push({ email, context })
  }

  const skipped = skipped_no_campaign_id + skipped_no_report + skipped_no_email

  if (targets.length === 0) {
    return NextResponse.json(
      {
        batch_id: batchId,
        sent:     0,
        failed:   0,
        skipped,
        skipped_no_campaign_id,
        skipped_no_report,
        skipped_no_email,
        failures: [],
      },
      { status: 200 },
    )
  }

  const sg = getSg()
  if (!sg) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
  }

  const outcomes: Outcome[] = await runWithConcurrency(targets, CONCURRENCY, async (t) => {
    try {
      await sg.send({
        to:      t.email,
        from:    FROM,
        subject: t.context.subject,
        html:    renderCampaignStats(t.context),
      })
      return { email: t.email, ok: true }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[send-stats] send failed for ${t.email}:`, msg)
      return { email: t.email, ok: false, error: msg.slice(0, 500) }
    }
  })

  const sent     = outcomes.filter((o) => o.ok).length
  const failed   = outcomes.length - sent
  const failures = outcomes
    .filter((o) => !o.ok)
    .map((o) => ({ email: o.email, error: o.error || 'Unknown error' }))

  // Optional single batch-level record copy to marketing (not per-rep).
  // Best-effort; only when at least one stats email went out.
  if (sent > 0) {
    try {
      const first = targets[0]
      await sg.send({
        to:      RECORD_CC,
        from:    FROM,
        subject: `[Rep stats copy] Batch ${batchId} — ${sent} rep(s)`,
        html:    renderCampaignStats(first.context),
      })
    } catch (err) {
      console.error('[send-stats] record copy to marketing failed', {
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  console.log(
    `[send-stats] batch=${batchId} sent=${sent} failed=${failed} ` +
      `skipped=${skipped} (no_campaign_id=${skipped_no_campaign_id} ` +
      `no_report=${skipped_no_report} no_email=${skipped_no_email})`,
  )

  return NextResponse.json(
    {
      batch_id: batchId,
      sent,
      failed,
      skipped,
      skipped_no_campaign_id,
      skipped_no_report,
      skipped_no_email,
      failures,
    },
    { status: 200 },
  )
}
