/**
 * POST /api/admin/marketing/recap/[draftId]/send
 *
 * Sends a Marketing Recap draft to its recipients.
 *
 * Recipients:
 *   1. marketing_recap_recipients (active rows) — Rudy + Brandon + any
 *      custom additions
 *   2. vcard_employees WHERE active=true AND sales_manager=true —
 *      Anthony, Jorge, Neil
 *   3. CC marketing@pct.com (hardcoded — visibility for marketing team)
 *
 * Deduplication: if a recipient appears in both sets, dedup by
 * lower(email). The recipients-table role label wins over the generic
 * 'Sales Manager' label.
 *
 * Race protection: conditional UPDATE flips status draft → sending
 * atomically. Two concurrent send requests: the first claims, the
 * second gets 409. Mirrors the asset-delivery send pattern.
 *
 * Per-recipient sends use SendGrid with each recipient's own 'to'
 * address (not BCC, not a shared inbox). CC marketing@pct.com appears
 * on every send.
 *
 * Status flow: draft → sending → sent (or failed).
 *   - 'sent' if any sends succeeded
 *   - 'failed' if all sends failed
 *   - Partial failures don't roll back successful sends; per-send
 *     status is tracked in marketing_recap_sends
 *
 * INPUT (optional body):
 *   { is_test?: boolean }   if true, send only to actor email;
 *                            marks all rows is_test=true; does NOT
 *                            flip draft status (the real send can
 *                            happen later)
 *
 * OUTPUT (200):
 *   {
 *     draft_id:         string,
 *     status:           'sent' | 'failed' | 'draft' (test only),
 *     recipient_count:  number,
 *     successful_sends: number,
 *     failed_sends:     number,
 *     is_test:          boolean,
 *   }
 *
 * ERRORS:
 *   401 — not authenticated
 *   404 — draft not found
 *   409 — draft already 'sending' or 'sent' (race protection)
 *   500 — unexpected failure during pipeline (rare; per-send failures
 *         are tracked, not surfaced as 500)
 *
 * AUTH: Admin session required.
 */
import { NextResponse } from 'next/server'
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
  getRecapDraftByDraftId,
  updateRecapDraftStatus,
  getRecapRecipients,
  getActiveSalesManagers,
  createRecapSend,
  updateRecapSendStatus,
  type RecapRecipientSource,
} from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ───── Local getActorEmail helper (matches recipients/route.ts) ─────

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

// ───── SendGrid lazy-init (matches asset-delivery + fincen-email pattern) ─────

let sgInitialized = false

function getSg(): typeof sgMail | null {
  const apiKey = process.env.SENDGRID_API_KEY
  if (!apiKey) {
    console.error('[recap-send] SENDGRID_API_KEY not set')
    return null
  }
  if (!sgInitialized) {
    sgMail.setApiKey(apiKey)
    sgInitialized = true
  }
  return sgMail
}

// ───── Body schema ─────

const SendBodySchema = z
  .object({
    is_test: z.boolean().optional(),
  })
  .strict()

// ───── Resolved recipient shape ─────

interface ResolvedRecipient {
  email:  string
  name:   string
  role:   string
  source: RecapRecipientSource
}

async function resolveRecipients(
  isTest:      boolean,
  actorEmail:  string,
): Promise<ResolvedRecipient[]> {
  // Test mode: only the actor receives the email.
  if (isTest) {
    return [
      {
        email:  actorEmail.toLowerCase(),
        name:   actorEmail,
        role:   'Test Recipient',
        source: 'recipients_table',
      },
    ]
  }

  // Real send: union of recipients table + active sales managers,
  // deduped by lower(email). Table entries win on duplicates so the
  // operator-curated role label takes precedence over generic
  // "Sales Manager".
  const [tableRecipients, salesManagers] = await Promise.all([
    getRecapRecipients(true),
    getActiveSalesManagers(),
  ])

  const byEmail = new Map<string, ResolvedRecipient>()

  for (const r of tableRecipients) {
    const key = r.email.toLowerCase()
    byEmail.set(key, {
      email:  key,
      name:   r.name,
      role:   r.role,
      source: 'recipients_table',
    })
  }

  for (const sm of salesManagers) {
    if (!sm.email) continue
    const key = sm.email.toLowerCase()
    if (byEmail.has(key)) continue
    byEmail.set(key, {
      email:  key,
      name:   `${sm.first_name} ${sm.last_name}`,
      role:   'Sales Manager',
      source: 'sales_manager_flag',
    })
  }

  return Array.from(byEmail.values())
}

// ───── POST handler ─────

export async function POST(
  request: Request,
  { params }: { params: Promise<{ draftId: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const adminEmail = await getActorEmail()
  const { draftId } = await params

  // Optional body parse.
  let isTest = false
  try {
    const text = await request.text()
    if (text && text.trim().length > 0) {
      const parsed = JSON.parse(text)
      const result = SendBodySchema.safeParse(parsed)
      if (!result.success) {
        return NextResponse.json(
          { error: 'Invalid body', details: result.error.flatten() },
          { status: 400 },
        )
      }
      isTest = result.data.is_test === true
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Fetch the draft up front so we can return 404 cleanly + use its
  // current status in the 409 messaging.
  const draft = await getRecapDraftByDraftId(draftId)
  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
  }

  // Real sends: claim the draft with a conditional UPDATE so concurrent
  // requests can't both fan out. Test sends do NOT flip status — they
  // leave the draft as 'draft' so the real send can run later.
  if (!isTest) {
    const db    = getPool()
    const claim = await db.query(
      `UPDATE marketing_recap_drafts
          SET status     = 'sending',
              updated_at = NOW(),
              updated_by = $1
        WHERE draft_id   = $2
          AND status NOT IN ('sending', 'sent')
        RETURNING draft_id, status`,
      [adminEmail, draftId],
    )
    if (claim.rowCount === 0) {
      if (draft.status === 'sent') {
        return NextResponse.json(
          { error: 'Draft already sent. Generate a new draft to resend.' },
          { status: 409 },
        )
      }
      if (draft.status === 'sending') {
        return NextResponse.json(
          { error: 'Another send is already in progress for this draft.' },
          { status: 409 },
        )
      }
      return NextResponse.json(
        { error: 'Could not claim draft for send' },
        { status: 500 },
      )
    }
  }

  // Resolve recipients (after the claim so failures release the claim
  // via a 'failed' status update).
  const recipients = await resolveRecipients(isTest, adminEmail)
  if (recipients.length === 0) {
    if (!isTest) {
      await updateRecapDraftStatus(draftId, 'failed', {
        error_summary: 'No recipients configured',
        updated_by:    adminEmail,
      })
    }
    return NextResponse.json(
      { error: 'No recipients configured' },
      { status: 400 },
    )
  }

  const sg = getSg()
  if (!sg) {
    if (!isTest) {
      await updateRecapDraftStatus(draftId, 'failed', {
        error_summary: 'SendGrid not configured',
        updated_by:    adminEmail,
      })
    }
    return NextResponse.json(
      { error: 'Email service not configured' },
      { status: 500 },
    )
  }

  const CC_EMAIL = 'marketing@pct.com'
  const FROM     = { email: 'marketing@pct.com', name: 'PCT Marketing' }

  // Per-recipient send loop. Track row inserted BEFORE the SendGrid
  // call so we never have an orphan email without an audit row.
  let successful_sends = 0
  let failed_sends     = 0

  for (const r of recipients) {
    let sendRowId: number | null = null
    try {
      const sendRow = await createRecapSend({
        draft_id:         draftId,
        recipient_email:  r.email,
        recipient_name:   r.name,
        recipient_role:   r.role,
        recipient_source: r.source,
        is_cc:            false,
        is_test:          isTest,
      })
      sendRowId = sendRow.id
    } catch (err) {
      console.error('[recap-send] failed to create send row', {
        admin:      adminEmail,
        draft_id:   draftId,
        recipient:  r.email,
        error:      err instanceof Error ? err.message : String(err),
      })
      failed_sends++
      continue
    }

    try {
      const sgResponse = await sg.send({
        to:      r.email,
        cc:      CC_EMAIL,
        from:    FROM,
        subject: draft.subject,
        html:    draft.html_content,
      })

      // SendGrid returns [response, body]; the message id is in headers.
      const headers   = sgResponse?.[0]?.headers as Record<string, string | string[]> | undefined
      const rawId     = headers?.['x-message-id']
      const messageId = Array.isArray(rawId) ? rawId[0] : rawId || undefined

      await updateRecapSendStatus(sendRowId, 'sent', {
        ...(messageId ? { sendgrid_message_id: messageId } : {}),
        sent_at: new Date().toISOString(),
      })
      successful_sends++
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.error('[recap-send] sendgrid failure', {
        admin:     adminEmail,
        draft_id:  draftId,
        recipient: r.email,
        error:     errorMessage,
      })
      try {
        await updateRecapSendStatus(sendRowId, 'failed', {
          error_message: errorMessage.slice(0, 500),
        })
      } catch (updateErr) {
        console.error('[recap-send] failed to record send failure', {
          admin:     adminEmail,
          draft_id:  draftId,
          recipient: r.email,
          error:     updateErr instanceof Error ? updateErr.message : String(updateErr),
        })
      }
      failed_sends++
    }
  }

  // Final draft status update (real sends only). 'sent' if any
  // succeeded; 'failed' only if every send failed. Test sends keep
  // the draft as 'draft' so a real send can run later.
  const realFinalStatus: 'sent' | 'failed' =
    successful_sends === 0 && failed_sends > 0 ? 'failed' : 'sent'
  const finalStatus: 'draft' | 'sent' | 'failed' = isTest ? 'draft' : realFinalStatus

  if (!isTest) {
    await updateRecapDraftStatus(draftId, realFinalStatus, {
      recipient_count:  recipients.length,
      successful_sends,
      failed_sends,
      sent_at:          new Date().toISOString(),
      updated_by:       adminEmail,
    })
  }

  console.log(
    `[recap-send] admin=${adminEmail} draft=${draftId} ` +
      `is_test=${isTest} recipients=${recipients.length} ` +
      `successful=${successful_sends} failed=${failed_sends} status=${finalStatus}`,
  )

  return NextResponse.json(
    {
      draft_id:         draftId,
      status:           finalStatus,
      recipient_count:  recipients.length,
      successful_sends,
      failed_sends,
      is_test:          isTest,
    },
    { status: 200 },
  )
}
