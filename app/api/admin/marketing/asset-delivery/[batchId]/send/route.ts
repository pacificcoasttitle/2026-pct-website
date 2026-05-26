/**
 * /api/admin/marketing/asset-delivery/[batchId]/send
 *
 * POST — fan out the batch's uploaded assets as personalized emails:
 *   1. Group files by rep
 *   2. For each rep (concurrency = 2):
 *      a. Generate AI intro paragraph
 *      b. Download attachments from R2
 *      c. Render template with rep + campaign context
 *      d. Send via SendGrid with MIME attachments
 *      e. Record per-rep status in asset_delivery_sends
 *   3. Update batch status based on aggregate results
 *
 * Per-rep failures are isolated. A SendGrid error for one rep does not
 * block the rest of the batch. Final response always 200 (with `failed`
 * count) unless something catastrophic happens before fan-out.
 *
 * Optional body { test_recipient_email } sends to a single rep only and
 * skips the batch-status update — used by the UI's "Send Test" button.
 */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import sgMail from '@sendgrid/mail'
import {
  isAuthenticated,
  verifyAdminToken,
  ADMIN_COOKIE,
} from '@/lib/admin-auth'
import {
  getPool,
  getAssetDeliveryBatchById,
  getFilesByBatchId,
  getDefaultAssetDeliveryTemplate,
  updateAssetDeliveryBatch,
  createAssetDeliverySend,
  updateAssetDeliverySend,
  type AssetDeliveryFile,
} from '@/lib/admin-db'
import { downloadFromR2 } from '@/lib/r2-upload'
import {
  ASSET_DELIVERY_INTRO_SYSTEM_PROMPT,
  buildIntroUserMessage,
  stripHtmlTags,
} from '@/lib/marketing-ai'
import {
  ASSET_DELIVERY_DEFAULTS,
  renderAssetDeliveryHtml,
  renderAssetPreviewCard,
  iconTypeForMime,
} from '@/lib/email-templates/asset-delivery'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes for large batches

/* ─── Constants ────────────────────────────────────────────────── */

const CONCURRENCY     = 2
const MAX_TOTAL_BYTES = 20 * 1024 * 1024 // SendGrid practical cap (~22 MB base64 expansion)
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const BodySchema = z
  .object({
    test_recipient_email: z.string().trim().email().optional(),
  })
  .partial()

/* ─── SendGrid (lazy init, mirrors lib/fincen-email.ts) ────────── */

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

/* ─── Auth helper ──────────────────────────────────────────────── */

async function getActorEmail(): Promise<string> {
  try {
    const jar   = await cookies()
    const token = jar.get(ADMIN_COOKIE)?.value
    if (!token) return 'unknown'
    const session = await verifyAdminToken(token)
    return session?.username || 'unknown'
  } catch {
    return 'unknown'
  }
}

/* ─── Rep lookup ───────────────────────────────────────────────── */

interface RepInfo {
  id:         number | null
  first_name: string
  last_name:  string
  email:      string
  full_name:  string
}

async function lookupRepByEmail(email: string): Promise<RepInfo | null> {
  const db  = getPool()
  const res = await db.query(
    `SELECT id, first_name, last_name, email
       FROM vcard_employees
      WHERE LOWER(email) = LOWER($1)
        AND active = true
      LIMIT 1`,
    [email],
  )
  const row = res.rows[0]
  if (!row) return null
  const first = String(row.first_name || '').trim()
  const last  = String(row.last_name  || '').trim()
  return {
    id:         row.id ?? null,
    first_name: first,
    last_name:  last,
    email:      String(row.email),
    full_name:  `${first} ${last}`.trim() || String(row.email),
  }
}

/* ─── AI intro ─────────────────────────────────────────────────── *
 * System prompt + user-message builder come from @/lib/marketing-ai so
 * the preview endpoint and this send path stay byte-identical.       */

async function generateIntroForRep(
  apiKey:              string,
  rep:                 RepInfo,
  campaignName:        string,
  campaignDescription: string | null,
  files:               AssetDeliveryFile[],
): Promise<string> {
  const userMessage = buildIntroUserMessage({
    rep_first_name:       rep.first_name,
    rep_full_name:        rep.full_name,
    campaign_name:        campaignName,
    campaign_description: campaignDescription,
    asset_summary:        files.map((f) => ({
      format: f.format,
      type:   f.mime_type || 'file',
    })),
  })

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model:       'gpt-4o-mini',
      messages: [
        { role: 'system', content: ASSET_DELIVERY_INTRO_SYSTEM_PROMPT },
        { role: 'user',   content: userMessage },
      ],
      temperature: 0.7,
      max_tokens:  200,
    }),
  })

  if (!res.ok) {
    throw new Error(`OpenAI intro generation failed: ${res.status}`)
  }
  interface OpenAIResponse {
    choices?: Array<{ message?: { content?: string } }>
  }
  const data       = (await res.json().catch(() => null)) as OpenAIResponse | null
  const rawContent = data?.choices?.[0]?.message?.content
  if (typeof rawContent !== 'string' || rawContent.trim() === '') {
    throw new Error('OpenAI intro generation returned no content')
  }

  let intro = stripHtmlTags(rawContent)
  // Trim wrapping quotes the model sometimes adds.
  if (/^["'“‘«].+["'”’»]$/.test(intro)) intro = intro.slice(1, -1).trim()
  intro = intro.replace(/\s+/g, ' ').trim()
  return intro
}

/* ─── Concurrency limiter (worker-pool, no deps) ───────────────── */

async function runWithConcurrency<T, R>(
  items:       T[],
  concurrency: number,
  worker:      (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0
  const runners: Promise<void>[] = []
  const workerCount = Math.max(1, Math.min(concurrency, items.length))
  for (let w = 0; w < workerCount; w++) {
    runners.push(
      (async () => {
        while (true) {
          const idx = cursor++
          if (idx >= items.length) return
          results[idx] = await worker(items[idx], idx)
        }
      })(),
    )
  }
  await Promise.all(runners)
  return results
}

/* ─── Per-rep send ─────────────────────────────────────────────── */

interface SendOutcome {
  rep_email: string
  status:    'sent' | 'failed' | 'skipped'
  error?:    string
}

interface SendContext {
  batchId:             string
  campaignName:        string
  campaignDescription: string | null
  emailSubject:        string
  htmlTemplate:        string
  openaiKey:           string | null
  sg:                  typeof sgMail
  isTest:              boolean
}

/**
 * Substitute the wizard's supported subject-line merge tags. Run per-rep
 * (not per-batch) so {{rep_first_name}} / {{rep_full_name}} resolve to
 * the actual recipient. Email header encoding is handled by SendGrid;
 * we don't escape here.
 */
function personalizeSubject(
  template:     string,
  rep:          RepInfo,
  campaignName: string,
): string {
  return template
    .replace(/\{\{rep_first_name\}\}/g, rep.first_name || '')
    .replace(/\{\{rep_full_name\}\}/g, rep.full_name  || '')
    .replace(/\{\{campaign_name\}\}/g, campaignName    || '')
}

async function sendOneRep(
  rep:   RepInfo,
  files: AssetDeliveryFile[],
  ctx:   SendContext,
): Promise<SendOutcome> {
  const totalBytes = files.reduce((acc, f) => acc + (f.file_size_bytes || 0), 0)

  // Always create the send row first so even early failures get tracked.
  // is_test propagates to the audit row so BatchDetail tiles can filter
  // out preview/test sends.
  const sendRow = await createAssetDeliverySend({
    batch_id:               ctx.batchId,
    rep_id:                 rep.id,
    rep_email:              rep.email,
    rep_name:               rep.full_name,
    send_status:            'sending',
    attachment_count:       files.length,
    attachment_total_bytes: totalBytes,
    is_test:                ctx.isTest,
  })

  if (totalBytes > MAX_TOTAL_BYTES) {
    const msg = `Total attachment size ${(totalBytes / (1024 * 1024)).toFixed(1)} MB exceeds 20 MB cap`
    console.warn(`[asset-delivery-send] ${rep.email}: ${msg}`)
    await updateAssetDeliverySend(sendRow.id, {
      send_status:   'failed',
      error_message: msg,
    })
    return { rep_email: rep.email, status: 'failed', error: msg }
  }

  try {
    /* 1. AI intro. */
    let intro = ''
    if (ctx.openaiKey) {
      try {
        intro = await generateIntroForRep(
          ctx.openaiKey,
          rep,
          ctx.campaignName,
          ctx.campaignDescription,
          files,
        )
      } catch (introErr) {
        // Soft-fall to a plain default so the send still succeeds.
        console.warn(`[asset-delivery-send] intro generation failed for ${rep.email}:`, introErr)
        intro = `Your personalized assets are attached and ready to share with your clients.`
      }
    } else {
      intro = `Your personalized assets are attached and ready to share with your clients.`
    }

    /* 2. Download attachments. */
    const attachmentBuffers = await Promise.all(
      files.map(async (f) => ({
        file:   f,
        buffer: await downloadFromR2(f.r2_key),
      })),
    )

    /* 3. Render the email body. */
    const cardsHtml = files
      .map((f) =>
        renderAssetPreviewCard({
          title:    f.original_filename,
          iconType: iconTypeForMime(f.mime_type),
        }),
      )
      .join('\n')

    const html = renderAssetDeliveryHtml(ctx.htmlTemplate, {
      rep_first_name:      rep.first_name || rep.full_name.split(' ')[0] || 'there',
      campaign_name:       ctx.campaignName,
      ai_intro_paragraph:  intro,
      asset_preview_cards: cardsHtml,
      use_case_1:          ASSET_DELIVERY_DEFAULTS.use_case_1,
      use_case_2:          ASSET_DELIVERY_DEFAULTS.use_case_2,
      use_case_3:          ASSET_DELIVERY_DEFAULTS.use_case_3,
      use_case_4:          ASSET_DELIVERY_DEFAULTS.use_case_4,
      questions_callout:   ASSET_DELIVERY_DEFAULTS.questions_callout,
    })

    /* 4. SendGrid. */
    const attachments = attachmentBuffers.map(({ file, buffer }) => ({
      content:     buffer.toString('base64'),
      filename:    file.original_filename,
      type:        file.mime_type || 'application/octet-stream',
      disposition: 'attachment' as const,
    }))

    const personalizedSubject = personalizeSubject(
      ctx.emailSubject,
      rep,
      ctx.campaignName,
    )

    const sgResponse = await ctx.sg.send({
      to:      rep.email,
      from:    { email: 'marketing@pct.com', name: 'PCT Marketing' },
      subject: personalizedSubject,
      html,
      attachments,
      customArgs: {
        batch_id:  ctx.batchId,
        rep_email: rep.email,
      },
    })

    // SendGrid returns [response, body]; the message id lives in headers.
    const headers = sgResponse?.[0]?.headers as Record<string, string | string[]> | undefined
    const rawId   = headers?.['x-message-id']
    const messageId = Array.isArray(rawId) ? rawId[0] : rawId || null

    await updateAssetDeliverySend(sendRow.id, {
      send_status:         'sent',
      sent_at:             new Date(),
      sendgrid_message_id: messageId,
      ai_generated_intro:  intro,
    })

    return { rep_email: rep.email, status: 'sent' }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[asset-delivery-send] failed for ${rep.email}:`, msg)
    try {
      await updateAssetDeliverySend(sendRow.id, {
        send_status:   'failed',
        error_message: msg.slice(0, 500),
      })
    } catch (dbErr) {
      console.error(`[asset-delivery-send] could not record failure for ${rep.email}:`, dbErr)
    }
    return { rep_email: rep.email, status: 'failed', error: msg }
  }
}

/* ─── Route ────────────────────────────────────────────────────── */

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> },
) {
  const startedAt = Date.now()

  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const adminEmail = await getActorEmail()

  const { batchId } = await params
  if (!UUID_RE.test(batchId)) {
    return NextResponse.json({ error: 'Invalid batchId (must be a UUID)' }, { status: 400 })
  }

  /* Body parse (optional). */
  let testRecipient: string | undefined
  try {
    const text = await req.text()
    if (text.trim()) {
      const parsed = BodySchema.safeParse(JSON.parse(text))
      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Invalid request', details: parsed.error.flatten() },
          { status: 400 },
        )
      }
      testRecipient = parsed.data.test_recipient_email?.toLowerCase()
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const isTest = !!testRecipient

  /* Batch + status guard.
   *
   * Real sends use an atomic conditional UPDATE to flip the status to
   * 'sending'. Two admins clicking Send simultaneously: the UPDATE that
   * lands first wins, the other gets rowCount === 0 and a 409.
   *
   * Test sends never claim the batch — they're side-effect-free with
   * respect to lifecycle — but they refuse to run while a real send is
   * in flight, to avoid SMTP noise / double-sending the test recipient. */
  let batch
  if (isTest) {
    batch = await getAssetDeliveryBatchById(batchId)
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }
    if (batch.status === 'sending') {
      return NextResponse.json(
        { error: 'Cannot run test while batch is sending' },
        { status: 409 },
      )
    }
  } else {
    const db = getPool()
    const claim = await db.query(
      `UPDATE asset_delivery_batches
          SET status     = 'sending',
              updated_at = NOW(),
              updated_by = $1
        WHERE batch_id = $2::uuid
          AND status NOT IN ('sending', 'sent')
        RETURNING *`,
      [adminEmail, batchId],
    )
    if (claim.rowCount === 0) {
      const existing = await getAssetDeliveryBatchById(batchId)
      if (!existing) {
        return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
      }
      if (existing.status === 'sent') {
        return NextResponse.json(
          { error: 'Batch already sent. Create a new batch or use a resend flow.' },
          { status: 400 },
        )
      }
      if (existing.status === 'sending') {
        return NextResponse.json(
          { error: 'Another send is already in progress for this batch.' },
          { status: 409 },
        )
      }
      // Shouldn't reach here, but be explicit.
      return NextResponse.json(
        { error: 'Could not claim batch for send' },
        { status: 500 },
      )
    }
    batch = claim.rows[0]
  }

  /* Files. */
  const allFiles = await getFilesByBatchId(batchId)
  if (allFiles.length === 0) {
    return NextResponse.json({ error: 'No files in this batch' }, { status: 400 })
  }

  /* SendGrid config. */
  const sg = getSg()
  if (!sg) {
    return NextResponse.json(
      { error: 'Email service not configured. Add SENDGRID_API_KEY to environment.' },
      { status: 503 },
    )
  }

  /* Template. */
  const template = await getDefaultAssetDeliveryTemplate()
  if (!template) {
    return NextResponse.json(
      { error: 'No default asset-delivery email template found. Seed one before sending.' },
      { status: 500 },
    )
  }

  /* Group by rep_email (lower-cased). */
  const filesByRep = new Map<string, AssetDeliveryFile[]>()
  for (const f of allFiles) {
    const key = f.rep_email.toLowerCase()
    const bucket = filesByRep.get(key)
    if (bucket) bucket.push(f)
    else filesByRep.set(key, [f])
  }

  /* Test-mode filtering. */
  let recipientEmails: string[]
  if (isTest) {
    if (!filesByRep.has(testRecipient!)) {
      return NextResponse.json(
        { error: `test_recipient_email '${testRecipient}' has no files in this batch` },
        { status: 400 },
      )
    }
    recipientEmails = [testRecipient!]
  } else {
    recipientEmails = Array.from(filesByRep.keys())
  }

  /* Resolve reps from vcard_employees. Unknown emails are tracked as
     failures so the operator sees them in the response. */
  interface ResolvedRep {
    rep:   RepInfo
    files: AssetDeliveryFile[]
  }
  const resolved: ResolvedRep[] = []
  const upfrontFailures: SendOutcome[] = []

  for (const email of recipientEmails) {
    const rep = await lookupRepByEmail(email)
    if (!rep) {
      // Record as a failed send row anyway, for audit visibility.
      try {
        const row = await createAssetDeliverySend({
          batch_id:               batchId,
          rep_id:                 null,
          rep_email:              email,
          rep_name:               email,
          send_status:            'failed',
          attachment_count:       filesByRep.get(email)?.length ?? 0,
          attachment_total_bytes: (filesByRep.get(email) ?? []).reduce(
            (a, f) => a + (f.file_size_bytes || 0), 0,
          ),
          is_test:                isTest,
        })
        await updateAssetDeliverySend(row.id, {
          error_message: `No active vcard_employees record matches ${email}`,
        })
      } catch (dbErr) {
        console.warn('[asset-delivery-send] could not record unknown-rep failure:', dbErr)
      }
      upfrontFailures.push({
        rep_email: email,
        status:    'failed',
        error:     `No active rep matches ${email}`,
      })
      continue
    }
    resolved.push({ rep, files: filesByRep.get(email)! })
  }

  /* Batch is already claimed (real send) or untouched (test send). Fan
     out at concurrency = 2. */
  const ctx: SendContext = {
    batchId,
    campaignName:        batch.campaign_name,
    campaignDescription: batch.description || null,
    emailSubject:        batch.email_subject,
    htmlTemplate:        template.html_template,
    openaiKey:           process.env.OPENAI_API_KEY || null,
    sg,
    isTest,
  }

  const fanResults = await runWithConcurrency(resolved, CONCURRENCY, (r) =>
    sendOneRep(r.rep, r.files, ctx),
  )

  const allOutcomes = [...upfrontFailures, ...fanResults]
  const sentCount   = allOutcomes.filter((o) => o.status === 'sent').length
  const failedCount = allOutcomes.filter((o) => o.status === 'failed').length

  /* Finalize batch status (skip for test sends). */
  if (!isTest) {
    try {
      const finalStatus =
        sentCount === 0 ? 'failed' : 'sent' // partial success counts as 'sent'
      await updateAssetDeliveryBatch(
        batchId,
        {
          status:  finalStatus,
          sent_at: new Date(),
        },
        adminEmail,
      )
    } catch (err) {
      console.error('[asset-delivery-send] final batch status update failed:', err)
    }
  }

  const durationMs = Date.now() - startedAt
  console.log(
    `[asset-delivery-send] admin=${adminEmail} batch=${batchId} total=${allOutcomes.length} sent=${sentCount} failed=${failedCount}${isTest ? ' (test)' : ''} duration_ms=${durationMs}`,
  )

  return NextResponse.json({
    batch_id:         batchId,
    total_recipients: allOutcomes.length,
    sent:             sentCount,
    failed:           failedCount,
    errors: allOutcomes
      .filter((o) => o.status === 'failed')
      .map((o) => ({ rep_email: o.rep_email, error: o.error || 'Unknown error' })),
    duration_ms:      durationMs,
    test_mode:        isTest,
  })
}
