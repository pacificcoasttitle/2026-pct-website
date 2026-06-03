// ============================================================
// Marketing — shared Mailchimp + merge-tag helpers
// ============================================================
// Used by:
//   - app/api/admin/marketing/studio/route.ts          (single-rep, legacy)
//   - app/api/admin/marketing/campaigns/batch/route.ts (multi-rep, new)
//
// Keeping the helpers here so the batch endpoint doesn't have to
// duplicate the merge-tag and HTTP-call logic that already lives
// in the studio route. Behaviour-preserving: the studio route now
// re-exports the same logic.

export interface MergeTagRep {
  name:      string
  title:     string | null
  email:     string | null
  phone:     string | null
  photo_url: string | null
}

/**
 * Replace {{rep_*}} merge tags with real rep data.
 *
 * Token names MUST match what the shipped templates actually use:
 * lowercase, and the photo token is {{rep_photo_url}} (not {{rep_photo}}).
 * The `i` flag makes the match case-resilient so a template author using
 * {{REP_NAME}} also resolves — but the photo token NAME still has to be
 * right (case-insensitivity does not fix rep_photo vs rep_photo_url).
 */
export function replaceMergeTags(html: string, rep: MergeTagRep): string {
  return html
    .replace(/\{\{rep_name\}\}/gi,      rep.name      || '')
    .replace(/\{\{rep_title\}\}/gi,     rep.title     || '')
    .replace(/\{\{rep_email\}\}/gi,     rep.email     || '')
    .replace(/\{\{rep_phone\}\}/gi,     rep.phone     || '')
    .replace(/\{\{rep_photo_url\}\}/gi, rep.photo_url || '')
}

/**
 * Resolve the {{HERO_IMAGE}} merge tag.
 *
 * When a hero URL is supplied, substitute it directly. When it's
 * missing/empty, strip the entire <img> tag that contains the merge
 * tag so the email doesn't render a clearly broken image. We use a
 * non-greedy match so multiple <img>s in the same document are
 * handled independently.
 */
export function resolveHeroImage(html: string, heroImageUrl: string | null | undefined): string {
  const url = (heroImageUrl ?? '').trim()
  if (url) {
    return html.replace(/\{\{HERO_IMAGE\}\}/g, url)
  }
  // Strip the <img …{{HERO_IMAGE}}…> wrapper if present, then any
  // remaining bare {{HERO_IMAGE}} occurrences (e.g. inside <a href>).
  return html
    .replace(/<img\b[^>]*\{\{HERO_IMAGE\}\}[^>]*\/?>/gi, '')
    .replace(/\{\{HERO_IMAGE\}\}/g, '')
}

/** Mailchimp expects HTTP Basic with username "any". */
export function mailchimpAuthHeader(apiKey: string): string {
  return `Basic ${Buffer.from(`any:${apiKey}`).toString('base64')}`
}

export interface CreateMailchimpCampaignInput {
  apiKey:       string
  server:       string  // e.g. "us17"
  audienceId:   string
  subject:      string
  preheader?:   string
  campaignName: string
  fromName:     string
  replyTo:      string
  html:         string
}

export interface CreateMailchimpCampaignResult {
  campaignId: string
  webId:      string
  editUrl:    string | null
}

/**
 * Create a Mailchimp campaign and set its HTML content.
 * Throws on any non-2xx response with a useful message.
 */
export async function createMailchimpCampaign(
  input: CreateMailchimpCampaignInput,
): Promise<CreateMailchimpCampaignResult> {
  const { apiKey, server, audienceId, subject, preheader, campaignName, fromName, replyTo, html } = input
  const auth = mailchimpAuthHeader(apiKey)
  const base = `https://${server}.api.mailchimp.com/3.0`

  // 1. Create the campaign shell.
  const createRes = await fetch(`${base}/campaigns`, {
    method:  'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type:       'regular',
      recipients: { list_id: audienceId },
      settings: {
        subject_line: subject,
        preview_text: preheader || undefined,
        title:        campaignName,
        from_name:    fromName,
        reply_to:     replyTo,
      },
      tracking: { opens: true, html_clicks: true, text_clicks: true },
    }),
  })
  const createData = await createRes.json().catch(() => ({}))
  if (!createRes.ok) {
    const detail = (createData as { detail?: string; title?: string }).detail
      || (createData as { detail?: string; title?: string }).title
      || `HTTP ${createRes.status}`
    throw new Error(`Mailchimp campaign create failed: ${detail}`)
  }
  const campaignId = String((createData as { id?: string }).id ?? '')
  const webId      = String((createData as { web_id?: string | number }).web_id ?? '')
  if (!campaignId) throw new Error('Mailchimp campaign create returned no id')

  // 2. PUT the HTML content.
  const contentRes = await fetch(`${base}/campaigns/${campaignId}/content`, {
    method:  'PUT',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ html }),
  })
  if (!contentRes.ok) {
    const errData = await contentRes.json().catch(() => ({}))
    const detail  = (errData as { detail?: string; title?: string }).detail
      || (errData as { detail?: string; title?: string }).title
      || `HTTP ${contentRes.status}`
    throw new Error(`Mailchimp set-content failed: ${detail}`)
  }

  return {
    campaignId,
    webId,
    editUrl: webId ? `https://${server}.admin.mailchimp.com/campaigns/edit?id=${webId}` : null,
  }
}

// ───── Per-campaign report reader (GET /reports/{campaign_id}) ─────
//
// Thin reader for Mailchimp's report endpoint, which is keyed by the
// MAILCHIMP campaign id. The report exists iff Mailchimp actually sent
// the campaign — independent of our LOCAL status (which can go stale).
// So callers TRUST this reader: a non-null return means "sent, here are
// the numbers"; null means "no report / not sent yet → skip this rep".

export interface CampaignReport {
  campaignId:   string
  campaignTitle: string
  subjectLine:  string
  sendTime:     string          // ISO; empty/absent → treated as "no report"
  emailsSent:   number
  opensTotal:   number
  uniqueOpens:  number
  openRate:     number          // fraction 0..1 (Mailchimp's open_rate)
  clicksTotal:  number
  uniqueClicks: number
  clickRate:    number          // fraction 0..1
  bounces:      number          // hard + soft
  unsubscribed: number
}

/**
 * Fetch + shape one campaign's Mailchimp report. Returns null on a 404,
 * any non-2xx, a network/parse error, OR an unsent/empty report (no
 * send_time) — so a single missing report never throws and never aborts
 * a batch-wide send. The caller skips that rep on null.
 *
 * Field paths mapped from Mailchimp's GET /3.0/reports/{campaign_id}:
 *   emails_sent, send_time, opens.{opens_total,unique_opens,open_rate},
 *   clicks.{clicks_total,unique_clicks,click_rate},
 *   bounces.{hard_bounces,soft_bounces}, unsubscribed,
 *   campaign_title, subject_line.
 */
export async function getCampaignReport(campaignId: string): Promise<CampaignReport | null> {
  const apiKey = process.env.MAILCHIMP_API_KEY
  const server = process.env.MAILCHIMP_SERVER
  if (!apiKey || !server || !campaignId) return null

  try {
    const res = await fetch(
      `https://${server}.api.mailchimp.com/3.0/reports/${encodeURIComponent(campaignId)}`,
      { headers: { Authorization: mailchimpAuthHeader(apiKey) } },
    )
    if (!res.ok) {
      // 404 = no report (campaign not sent / doesn't exist). Any other
      // non-2xx is logged and treated as "no report" so the batch send
      // continues for the other reps.
      if (res.status !== 404) {
        console.warn(`[getCampaignReport] ${campaignId} → HTTP ${res.status}`)
      }
      return null
    }
    const d = (await res.json().catch(() => null)) as Record<string, unknown> | null
    if (!d) return null

    const sendTime = String(d.send_time ?? '')
    // No send_time → the campaign hasn't actually sent yet; skip it.
    if (!sendTime) return null

    const opens   = (d.opens   ?? {}) as Record<string, unknown>
    const clicks  = (d.clicks  ?? {}) as Record<string, unknown>
    const bounces = (d.bounces ?? {}) as Record<string, unknown>
    const num = (v: unknown) => {
      const n = Number(v)
      return Number.isFinite(n) ? n : 0
    }

    return {
      campaignId,
      campaignTitle: String(d.campaign_title ?? ''),
      subjectLine:   String(d.subject_line ?? ''),
      sendTime,
      emailsSent:    num(d.emails_sent),
      opensTotal:    num(opens.opens_total),
      uniqueOpens:   num(opens.unique_opens),
      openRate:      num(opens.open_rate),
      clicksTotal:   num(clicks.clicks_total),
      uniqueClicks:  num(clicks.unique_clicks),
      clickRate:     num(clicks.click_rate),
      bounces:       num(bounces.hard_bounces) + num(bounces.soft_bounces),
      unsubscribed:  num(d.unsubscribed),
    }
  } catch (err) {
    console.warn(`[getCampaignReport] ${campaignId} fetch failed`, {
      error: err instanceof Error ? err.message : String(err),
    })
    return null
  }
}
