/**
 * POST /api/admin/marketing/campaigns/[batchId]/send-stats-sample
 *
 * Sends a SAMPLE of the per-rep stats email to a typed-in address,
 * using the FIRST rep in the batch that has a real Mailchimp report —
 * so Jerry can eyeball the real numbers/layout before blasting all
 * reps with the sibling send-stats route.
 *
 * 100% reuse of the stats pieces: getBatchCampaigns, getCampaignReport,
 * getEmployeeAdminBySlug, renderCampaignStats, and the same
 * pct()/dateLabel()/todayLabel() helpers + context assembly as the real
 * send-stats route. The ONLY differences: stop at the first sendable
 * rep, prefix the subject "[SAMPLE] ", prepend a one-line sample
 * banner, and send a single email to the typed address.
 *
 * AUTH: Admin session required (same guard as send-stats).
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'
import sgMail from '@sendgrid/mail'
import { isAuthenticated } from '@/lib/admin-auth'
import { getBatchCampaigns, getEmployeeAdminBySlug } from '@/lib/admin-db'
import { getCampaignReport } from '@/lib/marketing-mailchimp'
import {
  renderCampaignStats,
  type CampaignStatsContext,
} from '@/lib/email-templates/campaign-stats'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ───── SendGrid lazy-init (matches send-stats) ─────

let sgInitialized = false

function getSg(): typeof sgMail | null {
  const apiKey = process.env.SENDGRID_API_KEY
  if (!apiKey) {
    console.error('[send-stats-sample] SENDGRID_API_KEY not set')
    return null
  }
  if (!sgInitialized) {
    sgMail.setApiKey(apiKey)
    sgInitialized = true
  }
  return sgMail
}

// ───── Formatting helpers (identical to send-stats) ─────

function pct(fraction: number): string {
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

const FROM = { email: 'marketing@pct.com', name: 'PCT Marketing' }

// One-line sample banner prepended to the rendered HTML.
const SAMPLE_BANNER =
  `<div style="background:#03374f;color:#ffffff;padding:12px 24px;` +
  `font-family:Arial,sans-serif;font-size:13px;line-height:1.5;">` +
  `<strong>SAMPLE</strong> — this is a preview of the per-rep stats email, ` +
  `shown with one rep's real numbers. Reps each receive their own.</div>`

const BodySchema = z.object({ email: z.string() }).strict()
// Basic email shape (mirrors the lightweight validation used elsewhere).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(
  request: Request,
  { params }: { params: Promise<{ batchId: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { batchId } = await params

  // Parse + validate the typed email (server-side).
  let email: string
  try {
    const parsed = BodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 })
    }
    email = parsed.data.email.trim()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 })
  }

  let campaigns
  try {
    campaigns = await getBatchCampaigns(batchId)
  } catch (err) {
    console.error('[send-stats-sample] failed to load batch', {
      batch_id: batchId,
      error:    err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json({ error: 'Failed to load batch' }, { status: 500 })
  }
  if (campaigns.length === 0) {
    return NextResponse.json({ error: 'Batch not found or empty' }, { status: 404 })
  }

  // Find the FIRST rep (rows are ordered created_at ASC, id ASC) with a
  // non-null campaign id AND a non-null report. Same skip logic as
  // send-stats, but stop at the first sendable one. A single report
  // fetch error just skips that rep and the loop continues.
  let target: { context: CampaignStatsContext; repLabel: string } | null = null
  const asOf = todayLabel()

  for (const c of campaigns) {
    if (!c.mailchimp_campaign_id) continue
    let report
    try {
      report = await getCampaignReport(c.mailchimp_campaign_id)
    } catch (err) {
      console.warn('[send-stats-sample] report fetch threw (skipping rep)', {
        campaign_id: c.mailchimp_campaign_id,
        error:       err instanceof Error ? err.message : String(err),
      })
      report = null
    }
    if (!report) continue

    const employee     = c.rep_slug ? await getEmployeeAdminBySlug(c.rep_slug) : null
    const firstName    = (employee?.first_name || '').trim()
      || (c.rep_name || '').trim().split(' ')[0]
      || 'there'
    const campaignName = (c.name || report.campaignTitle || c.subject || 'your campaign').trim()
    const repLabel     = (c.rep_name || c.rep_slug || firstName).trim()

    target = {
      repLabel,
      context: {
        subject:         `[SAMPLE] Your campaign results: ${campaignName}`,
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
      },
    }
    break
  }

  if (!target) {
    // Clear "nothing to sample yet" signal — not a silent fail or 500.
    return NextResponse.json(
      { sent: 0, reason: 'no_sendable_stats' },
      { status: 200 },
    )
  }

  const sg = getSg()
  if (!sg) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
  }

  try {
    const html = SAMPLE_BANNER + renderCampaignStats(target.context)
    await sg.send({
      to:      email,
      from:    FROM,
      subject: target.context.subject,
      html,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[send-stats-sample] send failed for ${email}:`, msg)
    return NextResponse.json({ error: `Send failed: ${msg.slice(0, 300)}` }, { status: 500 })
  }

  console.log(`[send-stats-sample] batch=${batchId} → ${email} (rep=${target.repLabel})`)
  return NextResponse.json(
    { sent: 1, sampled_rep: target.repLabel },
    { status: 200 },
  )
}
