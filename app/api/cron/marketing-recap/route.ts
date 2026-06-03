/**
 * GET /api/cron/marketing-recap
 *
 * Vercel cron entrypoint. Fires Monday mornings (see vercel.json:
 * "0 16 * * 1" = Monday 16:00 UTC = 8am PST / 9am PDT).
 *
 * Auto-generates a Weekly Marketing Recap DRAFT for the current week.
 * Does NOT send — Phase 1 design (Option Z) has the cron create the
 * draft and an admin review + send manually from the UI.
 *
 * Composes the same Phase C pieces as the manual generate-draft route:
 *   1. buildMarketingRecapContext(thisMondayPT) — data shaper (C2)
 *   2. renderMarketingRecap(template, context) — Mustache render (C1)
 *   3. createRecapDraft(...) — persist to marketing_recap_drafts (Phase A)
 *
 * AUTH: verifyCronAuth (Bearer CRON_SECRET) — NOT admin cookie.
 *
 * Vercel sends GET requests for crons, so this is a GET handler.
 */

import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'

import { verifyCronAuth } from '@/lib/cron-auth'
import { createRecapDraft, createRepRecapDraft } from '@/lib/admin-db'
import { buildMarketingRecapContext } from '@/lib/marketing-recap-data'
import {
  MARKETING_RECAP_TEMPLATE,
  renderMarketingRecap,
} from '@/lib/email-templates/marketing-recap'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ───── PT-anchored "this Monday" (mirrors C3's thisMondayPT) ─────

function thisMondayPT(): Date {
  const now = new Date()
  const ptParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year:     'numeric',
    month:    '2-digit',
    day:      '2-digit',
    weekday:  'short',
  }).formatToParts(now)

  const year    = Number(ptParts.find((p) => p.type === 'year')!.value)
  const month   = Number(ptParts.find((p) => p.type === 'month')!.value)
  const day     = Number(ptParts.find((p) => p.type === 'day')!.value)
  const weekday = ptParts.find((p) => p.type === 'weekday')!.value

  const daysSinceMonday: Record<string, number> = {
    Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6,
  }
  const offset = daysSinceMonday[weekday] ?? 0

  return new Date(year, month - 1, day - offset, 12, 0, 0)
}

// ───── GET handler (Vercel cron entrypoint) ─────

export async function GET(request: Request) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const mondayPT = thisMondayPT()

    // Same composition as the manual C3 route — reuses the frozen
    // pieces directly rather than self-fetching (the manual route is
    // admin-cookie-gated, which the cron can't satisfy).
    const context     = await buildMarketingRecapContext(mondayPT)
    const htmlContent = renderMarketingRecap(MARKETING_RECAP_TEMPLATE, context)
    const draftId     = randomUUID()

    const draft = await createRecapDraft({
      draft_id:        draftId,
      week_start_date: context.last_week_start,
      week_end_date:   context.last_week_end,
      subject:         context.subject,
      html_content:    htmlContent,
      context_json:    context,
      created_by:      'cron@pct.com',
    })

    console.log(
      `[cron-recap] generated draft_id=${draftId} ` +
        `week=${context.last_week_start}..${context.last_week_end} ` +
        `batches=${context.batches_sent.length} ` +
        `upcoming=${context.upcoming_items.length} ` +
        `html_bytes=${htmlContent.length}`,
    )

    // ── Additive rep "Week Ahead" draft (Phase 1) ─────────────────
    // Reuses the SAME forward-looking context the manager draft was
    // built from. Independently guarded: a failure here must NOT break
    // the manager draft (already created above), so it's wrapped in its
    // own try/catch and only logged.
    let repDraftId: string | null = null
    try {
      const repDraft = await createRepRecapDraft(context, { created_by: 'cron@pct.com' })
      repDraftId = repDraft.draft_id
      console.log(
        `[cron-recap] generated rep draft_id=${repDraftId} ` +
          `week_ahead=${context.next_week_start}..${context.next_week_end} ` +
          `upcoming=${context.upcoming_items.length}`,
      )
    } catch (repErr) {
      console.error('[cron-recap] rep draft generation failed (manager draft unaffected)', {
        error: repErr instanceof Error ? repErr.message : String(repErr),
      })
    }

    return NextResponse.json(
      {
        ok:               true,
        draft_id:         draft.draft_id,
        status:           draft.status,
        subject:          draft.subject,
        rep_draft_id:     repDraftId,
        week_range_label: context.week_range_label,
        generated_at:     new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (err) {
    console.error('[cron-recap] failed', {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json(
      { ok: false, error: 'Failed to generate recap draft' },
      { status: 500 },
    )
  }
}
