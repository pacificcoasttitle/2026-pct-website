// ============================================================
// POST /api/admin/marketing/campaigns/batch
// Create one Mailchimp campaign per rep, grouped under a single batch_id.
// Supports three post-content actions: 'draft' | 'schedule' | 'send'.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { cookies } from 'next/headers'
import {
  isAuthenticated,
  verifyAdminToken,
  ADMIN_COOKIE,
} from '@/lib/admin-auth'
import {
  createEmailCampaignLog,
  getEmployeeAdminBySlug,
  getEmailTemplates,
} from '@/lib/admin-db'
import {
  createMailchimpCampaign,
  replaceMergeTags,
  resolveHeroImage,
} from '@/lib/marketing-mailchimp'
import {
  computeScheduleTime,
  toMailchimpScheduleString,
  scheduleCampaign,
  sendCampaignNow,
} from '@/lib/mailchimp-schedule'

export const runtime = 'nodejs'

const CONCURRENCY = 5
const SCHEDULE_DELAY_MINUTES = 30

type Action = 'draft' | 'schedule' | 'send'

async function getActorUsername(): Promise<string | null> {
  try {
    const jar   = await cookies()
    const token = jar.get(ADMIN_COOKIE)?.value
    if (!token) return null
    const session = await verifyAdminToken(token)
    return session?.username || null
  } catch {
    return null
  }
}

interface BatchRequestBody {
  templateId?:         number | string
  repSlugs?:           unknown
  subject?:            string
  preheader?:          string
  heroImageUrl?:       string
  campaignNamePrefix?: string
  fromName?:           string
  replyToMode?:        'global' | 'rep'
  replyToGlobal?:      string
  action?:             Action
}

interface CampaignResult {
  repSlug:     string
  repName:     string | null
  success:     boolean
  status:      'draft' | 'scheduled' | 'sent' | 'failed' | 'skipped'
  campaignId?: string
  webId?:      string
  editUrl?:    string | null
  audienceId?: string | null
  error?:      string
}

/** Run async tasks with a soft concurrency limit, preserving order. */
async function runWithConcurrency<TIn, TOut>(
  items: TIn[],
  limit: number,
  worker: (item: TIn, index: number) => Promise<TOut>,
): Promise<TOut[]> {
  const results: TOut[] = new Array(items.length)
  let cursor = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const idx = cursor++
      results[idx] = await worker(items[idx], idx)
    }
  })
  await Promise.all(runners)
  return results
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Mailchimp config ────────────────────────────────────────────
  const apiKey = process.env.MAILCHIMP_API_KEY
  const server = process.env.MAILCHIMP_SERVER
  if (!apiKey || !server) {
    return NextResponse.json({ error: 'Mailchimp not configured' }, { status: 500 })
  }

  // ── Parse + validate body ───────────────────────────────────────
  let body: BatchRequestBody
  try {
    body = (await req.json()) as BatchRequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const templateIdNum = Number(body.templateId)
  if (!Number.isFinite(templateIdNum) || templateIdNum <= 0) {
    return NextResponse.json({ error: 'templateId is required' }, { status: 400 })
  }

  const repSlugs = Array.isArray(body.repSlugs)
    ? body.repSlugs.map((s) => String(s ?? '').trim()).filter(Boolean)
    : []
  if (repSlugs.length === 0) {
    return NextResponse.json({ error: 'repSlugs must be a non-empty array' }, { status: 400 })
  }

  const action: Action = body.action === 'schedule' || body.action === 'send'
    ? body.action
    : 'draft'

  const subject       = String(body.subject ?? '').trim()
  const preheader     = String(body.preheader ?? '').trim()
  const heroImageUrl  = String(body.heroImageUrl ?? '').trim()
  // The `fromName` body field now carries the BRAND SUFFIX (not the full
  // from-name). Per-rep from-name is composed in the loop as
  // "{rep.name} | {brandSuffix}". Body key kept as `fromName` to avoid a
  // wider wire rename; only its meaning changed.
  const brandSuffix   = String(body.fromName ?? 'Pacific Coast Title').trim()
  const replyToMode   = body.replyToMode === 'rep' ? 'rep' : 'global'
  const replyToGlobal = String(body.replyToGlobal ?? '').trim()
  const namePrefix    = String(body.campaignNamePrefix ?? '').trim()

  if (!subject) {
    return NextResponse.json({ error: 'subject is required' }, { status: 400 })
  }
  if (!namePrefix) {
    return NextResponse.json({ error: 'campaignNamePrefix is required' }, { status: 400 })
  }
  if (replyToMode === 'global' && !replyToGlobal) {
    return NextResponse.json(
      { error: "replyToGlobal is required when replyToMode = 'global'" },
      { status: 400 },
    )
  }

  // ── Resolve template once ───────────────────────────────────────
  const templates = await getEmailTemplates()
  const template  = templates.find((t) => t.id === templateIdNum)
  if (!template) {
    return NextResponse.json({ error: `Template ${templateIdNum} not found` }, { status: 404 })
  }

  // ── Dedupe slugs (preserve first-seen order) ───────────────────
  const uniqueSlugs = Array.from(new Set(repSlugs))

  const batchId  = randomUUID()
  const actor    = await getActorUsername()
  const scheduleTime = action === 'schedule' ? computeScheduleTime(SCHEDULE_DELAY_MINUTES) : null
  const scheduleIso  = scheduleTime ? toMailchimpScheduleString(scheduleTime) : null

  // ── Per-rep worker ─────────────────────────────────────────────
  const campaigns: CampaignResult[] = await runWithConcurrency(uniqueSlugs, CONCURRENCY, async (slug) => {
    const result: CampaignResult = {
      repSlug: slug,
      repName: null,
      success: false,
      status:  'failed',
    }
    try {
      const rep = await getEmployeeAdminBySlug(slug)
      if (!rep) {
        result.status = 'skipped'
        result.error  = 'Rep not found'
        console.warn(`[batch ${batchId}] rep ${slug}: not found`)
        return result
      }
      result.repName = rep.name

      const audienceId = (rep.mailchimp_audience_id ?? '').trim()
      result.audienceId = audienceId || null
      if (!audienceId) {
        result.status = 'skipped'
        result.error  = 'Rep has no mailchimp_audience_id'
        console.warn(`[batch ${batchId}] rep ${slug}: no audience id`)
        return result
      }

      const replyTo = replyToMode === 'rep'
        ? (rep.email?.trim() || replyToGlobal)
        : replyToGlobal

      // Per-rep from-name: "{rep.name} | {brandSuffix}". Falls back to the
      // suffix alone when a rep has no name, and to 'Pacific Coast Title'
      // if both are empty — never blank.
      const repName = (rep.name || '').trim()
      const perRepFromName = repName
        ? (brandSuffix ? `${repName} | ${brandSuffix}` : repName)
        : (brandSuffix || 'Pacific Coast Title')

      // Apply merge tags + hero image.
      let html = template.html_content
      html = replaceMergeTags(html, rep)
      html = resolveHeroImage(html, heroImageUrl)

      const campaignName = `${namePrefix} — ${rep.name}`

      console.info(`[batch ${batchId}] rep ${slug}: creating Mailchimp campaign`)
      const created = await createMailchimpCampaign({
        apiKey,
        server,
        audienceId,
        subject,
        preheader,
        campaignName,
        fromName: perRepFromName,
        replyTo,
        html,
      })

      // Post-content action.
      let logStatus: 'draft' | 'scheduled' | 'sent' = 'draft'
      if (action === 'schedule' && scheduleTime) {
        console.info(`[batch ${batchId}] rep ${slug}: scheduling for ${scheduleIso}`)
        await scheduleCampaign(created.campaignId, scheduleTime)
        logStatus = 'scheduled'
      } else if (action === 'send') {
        console.info(`[batch ${batchId}] rep ${slug}: sending now`)
        await sendCampaignNow(created.campaignId)
        logStatus = 'sent'
      }

      // Per-rep DB log — wrapped so a log failure doesn't lose
      // the Mailchimp campaign id from the response.
      try {
        await createEmailCampaignLog({
          name:                  campaignName,
          subject,
          audience_id:           audienceId,
          template_id:           template.id,
          mailchimp_campaign_id: created.campaignId,
          mailchimp_web_id:      created.webId || null,
          status:                logStatus,
          scheduled_at:          scheduleIso,
          notes:                 `Batch ${batchId}${actor ? ` by ${actor}` : ''}`,
          batch_id:              batchId,
          rep_slug:              slug,
          reply_to_mode:         replyToMode,
        })
      } catch (logErr) {
        console.error(`[batch ${batchId}] rep ${slug}: DB log failed:`, logErr)
      }

      result.success    = true
      result.status     = logStatus
      result.campaignId = created.campaignId
      result.webId      = created.webId
      result.editUrl    = created.editUrl
      return result
    } catch (err) {
      result.success = false
      result.status  = 'failed'
      result.error   = err instanceof Error ? err.message : String(err)
      console.error(`[batch ${batchId}] rep ${slug}: failed:`, err)
      return result
    }
  })

  const successful = campaigns.filter((c) => c.success).length
  const failed     = campaigns.length - successful

  return NextResponse.json({
    batchId,
    scheduleTime: scheduleIso,
    total:        campaigns.length,
    successful,
    failed,
    campaigns,
  })
}
