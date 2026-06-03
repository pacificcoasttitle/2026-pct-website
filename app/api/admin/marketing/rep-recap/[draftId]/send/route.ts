/**
 * POST /api/admin/marketing/rep-recap/[draftId]/send
 *
 * Sends a rep "Week Ahead" draft to the active-rep roster.
 *
 * SEPARATE from the manager recap send route
 * (app/api/admin/marketing/recap/[draftId]/send/route.ts) — it has its
 * own draft table (marketing_rep_recap_drafts) and recipient source so
 * the working manager flow is never touched.
 *
 * Recipients: getPreviewRecipientReps() — active employees with a
 * non-empty email (blank-email reps are skipped and counted). Org-wide
 * content (the calendar has no rep association).
 *
 * Send: SendGrid via getSg(), one `to:` per rep, fanned out with a
 * concurrency worker pool (limit 5) like the preview-to-reps route.
 * A SINGLE batch-level copy is sent to marketing@pct.com for record
 * (NOT a per-rep cc — that would be one copy per rep).
 *
 * Race protection: a conditional UPDATE flips status draft → sending
 * atomically; a second concurrent request gets 409. Mirrors the
 * manager send route.
 *
 * Status flow: draft → sending → sent (any success) | failed (all fail).
 *
 * AUTH: Admin session required (same pct_admin cookie as the manager
 * send route).
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import sgMail from '@sendgrid/mail'
import {
  isAuthenticated,
  verifyAdminToken,
  ADMIN_COOKIE,
} from '@/lib/admin-auth'
import {
  getPool,
  getPreviewRecipientReps,
  getRepRecapDraftByDraftId,
  updateRepRecapDraftStatus,
} from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ───── Local getActorEmail helper (matches the manager send route) ─────

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

// ───── SendGrid lazy-init (matches the manager send route) ─────

let sgInitialized = false

function getSg(): typeof sgMail | null {
  const apiKey = process.env.SENDGRID_API_KEY
  if (!apiKey) {
    console.error('[rep-recap-send] SENDGRID_API_KEY not set')
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

interface Outcome {
  email: string
  ok:    boolean
  error?: string
}

const CONCURRENCY = 5
const FROM        = { email: 'marketing@pct.com', name: 'PCT Marketing' }
const RECORD_CC   = 'marketing@pct.com'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ draftId: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const adminEmail  = await getActorEmail()
  const { draftId } = await params

  // Fetch up front for a clean 404 + current-status messaging on 409.
  const draft = await getRepRecapDraftByDraftId(draftId)
  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
  }

  // Claim the draft with a conditional UPDATE so concurrent requests
  // can't both fan out. Claimable statuses are ONLY 'draft' and
  // 'failed' (retry-from-failed is intended). 'cancelled' stays dead
  // (a cancelled draft must never send), and 'sending'/'sent' are
  // already-in-flight / done.
  const db    = getPool()
  const claim = await db.query(
    `UPDATE marketing_rep_recap_drafts
        SET status     = 'sending',
            updated_at = NOW(),
            updated_by = $1
      WHERE draft_id   = $2
        AND status IN ('draft', 'failed')
      RETURNING draft_id`,
    [adminEmail, draftId],
  )
  if (claim.rowCount === 0) {
    return NextResponse.json(
      {
        error:
          'Draft is not in a sendable state (cancelled, already sending, or already sent).',
        status: draft.status,
      },
      { status: 409 },
    )
  }

  // ── Post-claim pipeline ─────────────────────────────────────────
  // The draft is now 'sending'. EVERYTHING below must be wrapped so no
  // throw can strand the row in 'sending' (which the claim predicate
  // would then block from retry — bricked). On any unexpected throw we
  // best-effort mark the draft 'failed' (guarded) so it stays
  // re-claimable, then surface a 500.
  try {
    // Resolve the active-rep roster.
    const { recipients, skippedNoEmail } = await getPreviewRecipientReps()
    if (recipients.length === 0) {
      await updateRepRecapDraftStatus(draftId, 'failed', {
        error_summary: 'No emailable reps in the roster',
        updated_by:    adminEmail,
      })
      return NextResponse.json(
        { error: 'No emailable reps in the roster', skipped_no_email: skippedNoEmail },
        { status: 400 },
      )
    }

    const sg = getSg()
    if (!sg) {
      await updateRepRecapDraftStatus(draftId, 'failed', {
        error_summary: 'SendGrid not configured',
        updated_by:    adminEmail,
      })
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 },
      )
    }

    // Per-rep fan-out (no per-rep cc — see the batch-level record copy below).
    const outcomes: Outcome[] = await runWithConcurrency(recipients, CONCURRENCY, async (rep) => {
      try {
        await sg.send({
          to:      rep.email,
          from:    FROM,
          subject: draft.subject,
          html:    draft.html_content,
        })
        return { email: rep.email, ok: true }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`[rep-recap-send] send failed for ${rep.email}:`, msg)
        return { email: rep.email, ok: false, error: msg.slice(0, 500) }
      }
    })

    const successful_sends = outcomes.filter((o) => o.ok).length
    const failed_sends     = outcomes.length - successful_sends
    const failures = outcomes
      .filter((o) => !o.ok)
      .map((o) => ({ email: o.email, error: o.error || 'Unknown error' }))

    // Single batch-level record copy to marketing (NOT a per-rep cc).
    // Best-effort: a failure here doesn't change the rep send outcome.
    try {
      await sg.send({
        to:      RECORD_CC,
        from:    FROM,
        subject: `[Rep copy] ${draft.subject}`,
        html:    draft.html_content,
      })
    } catch (err) {
      console.error('[rep-recap-send] record copy to marketing failed', {
        error: err instanceof Error ? err.message : String(err),
      })
    }

    // All-failed (every recipient errored, no throw) → 'failed';
    // partial success (at least one delivered) → 'sent'.
    const finalStatus: 'sent' | 'failed' =
      successful_sends === 0 && failed_sends > 0 ? 'failed' : 'sent'

    await updateRepRecapDraftStatus(draftId, finalStatus, {
      recipient_count:  recipients.length,
      successful_sends,
      failed_sends,
      sent_at:          new Date().toISOString(),
      updated_by:       adminEmail,
    })

    console.log(
      `[rep-recap-send] admin=${adminEmail} draft=${draftId} ` +
        `recipients=${recipients.length} successful=${successful_sends} ` +
        `failed=${failed_sends} skipped_no_email=${skippedNoEmail} status=${finalStatus}`,
    )

    return NextResponse.json(
      {
        draft_id:         draftId,
        status:           finalStatus,
        recipient_count:  recipients.length,
        successful_sends,
        failed_sends,
        skipped_no_email: skippedNoEmail,
        failures,
      },
      { status: 200 },
    )
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    console.error('[rep-recap-send] post-claim failure', {
      admin:    adminEmail,
      draft_id: draftId,
      error:    errorMessage,
    })
    // Best-effort: release the 'sending' claim by marking 'failed' so
    // the draft is never stuck and stays re-claimable. Guarded so a
    // failed status-write can't mask the original error.
    try {
      await updateRepRecapDraftStatus(draftId, 'failed', {
        error_summary: errorMessage.slice(0, 500),
        updated_by:    adminEmail,
      })
    } catch (updateErr) {
      console.error('[rep-recap-send] failed to mark draft failed after post-claim error', {
        draft_id: draftId,
        error:    updateErr instanceof Error ? updateErr.message : String(updateErr),
      })
    }
    return NextResponse.json(
      { error: 'Send failed', detail: errorMessage.slice(0, 500) },
      { status: 500 },
    )
  }
}
