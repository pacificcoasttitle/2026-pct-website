// ============================================================
// POST /api/admin/marketing/campaigns/preview-to-reps
// SendGrid side-channel: email the prepared campaign piece to all
// active, emailable sales reps with a fixed heads-up banner on top.
//
// This is NOT Mailchimp. It reuses the exact render path the Mailchimp
// batch route uses (replaceMergeTags + resolveHeroImage from
// lib/marketing-mailchimp.ts) minus the Mailchimp push, and the
// asset-delivery SendGrid shape (marketing@pct.com sender, getSg lazy
// init, concurrency pool) minus attachments.
//
// Fire-and-report: no DB table, no tracking record, no persisted
// campaign. Returns { sent, skipped_no_email, failed, failures }.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'
import { requireApiRole } from '@/lib/auth/guards'
import {
  getEmailTemplates,
  getPreviewRecipientReps,
} from '@/lib/admin-db'
import {
  replaceMergeTags,
  resolveHeroImage,
  type MergeTagRep,
} from '@/lib/marketing-mailchimp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

const CONCURRENCY = 5

/* ─── Generic sample rep block (Decision 3) ─────────────────────── *
 * Everyone gets the SAME rendered HTML with a readable sample block —
 * the preview shows "the piece going out", not a personalized copy.
 * photo_url is empty; the empty rep-photo <img> is stripped below so it
 * doesn't render a broken image (mirrors resolveHeroImage's behavior). */
const SAMPLE_REP: MergeTagRep = {
  first_name: 'Your',
  name:      'Your Name',
  title:     'Sales Representative',
  email:     'you@pct.com',
  phone:     '(866) 724-1050',
  mobile:    '(562) 555-0123',
  photo_url: '',
  slug:      'your-name',
}

/* ─── Heads-up banner (Part 4) ──────────────────────────────────── */
const HEADS_UP_BANNER = `<div style="background:#03374f;color:#ffffff;padding:16px 24px;font-family:Arial,sans-serif;font-size:15px;line-height:1.5;">
  <strong>Heads up — this is going out to clients today:</strong>
  <div style="font-size:13px;opacity:0.85;margin-top:4px;">This is a preview for the sales team. The version below is the campaign scheduled to send to clients.</div>
</div>`

/* ─── SendGrid (lazy init, mirrors asset-delivery send route) ───── */
let sgInitialized = false
function getSg(): typeof sgMail | null {
  const key = process.env.SENDGRID_API_KEY
  if (!key) return null
  if (!sgInitialized) {
    sgMail.setApiKey(key)
    sgInitialized = true
  }
  return sgMail
}

/* ─── Concurrency limiter (worker-pool, mirrors batch route) ────── */
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

interface PreviewRequestBody {
  templateId?:   number | string
  subject?:      string
  heroImageUrl?: string | null
}

export async function POST(req: NextRequest) {
  const auth = await requireApiRole('marketing')
  if ('error' in auth) return auth.error

  /* Parse + validate body. */
  let body: PreviewRequestBody
  try {
    body = (await req.json()) as PreviewRequestBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const templateIdNum = Number(body.templateId)
  if (!Number.isFinite(templateIdNum) || templateIdNum <= 0) {
    return NextResponse.json({ error: 'templateId is required' }, { status: 400 })
  }
  const subject = String(body.subject ?? '').trim()
  if (!subject) {
    return NextResponse.json({ error: 'subject is required' }, { status: 400 })
  }
  const heroImageUrl = body.heroImageUrl ? String(body.heroImageUrl).trim() : ''

  /* SendGrid config. */
  const sg = getSg()
  if (!sg) {
    return NextResponse.json(
      { error: 'Email service not configured. Add SENDGRID_API_KEY to environment.' },
      { status: 503 },
    )
  }

  /* Resolve template (same resolution the batch route uses). */
  const templates = await getEmailTemplates()
  const template  = templates.find((t) => t.id === templateIdNum)
  if (!template) {
    return NextResponse.json({ error: `Template ${templateIdNum} not found` }, { status: 404 })
  }

  /* Render the body — EXACT transforms from the batch route, with the
     generic sample rep block. This is a GENERIC preview (no real rep),
     so the rep-photo <img> is stripped first — otherwise replaceMergeTags
     now resolves the sample to the R2 <Firstname>.png fallback, which
     for the placeholder name would be a broken image. The real per-rep
     send (batch route) always renders the rep's resolved photo. The
     Mailchimp footer tags (*|UNSUB|*) are left as-is per Decision 2. */
  let html = template.html_content
  html = html.replace(/<img\b[^>]*\{\{rep_photo_url\}\}[^>]*\/?>/gi, '')
  html = replaceMergeTags(html, SAMPLE_REP)
  html = resolveHeroImage(html, heroImageUrl)

  /* Prepend the heads-up banner. */
  const finalHtml = `${HEADS_UP_BANNER}\n${html}`

  /* Recipients (active, emailable reps — mirrors the Sales Reps page). */
  const { recipients, skippedNoEmail } = await getPreviewRecipientReps()
  if (recipients.length === 0) {
    return NextResponse.json({
      sent:             0,
      skipped_no_email: skippedNoEmail,
      failed:           0,
      failures:         [],
    })
  }

  const fullSubject = `Heads up — going out today: ${subject}`

  /* Fan out one email per rep. Per-rep failures are isolated. */
  interface Outcome {
    email:   string
    ok:      boolean
    error?:  string
  }
  const outcomes: Outcome[] = await runWithConcurrency(recipients, CONCURRENCY, async (rep) => {
    try {
      await sg.send({
        to:      rep.email,
        from:    { email: 'marketing@pct.com', name: 'PCT Marketing' },
        subject: fullSubject,
        html:    finalHtml,
      })
      return { email: rep.email, ok: true }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[preview-to-reps] send failed for ${rep.email}:`, msg)
      return { email: rep.email, ok: false, error: msg.slice(0, 500) }
    }
  })

  const sent     = outcomes.filter((o) => o.ok).length
  const failures = outcomes
    .filter((o) => !o.ok)
    .map((o) => ({ email: o.email, error: o.error || 'Unknown error' }))

  console.log(
    `[preview-to-reps] template=${templateIdNum} recipients=${recipients.length} sent=${sent} failed=${failures.length} skipped_no_email=${skippedNoEmail}`,
  )

  return NextResponse.json({
    sent,
    skipped_no_email: skippedNoEmail,
    failed:           failures.length,
    failures,
  })
}
