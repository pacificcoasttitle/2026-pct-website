/**
 * POST /api/admin/marketing/recap/generate-draft
 *
 * Generates a Weekly Marketing Recap draft for the current week.
 *
 * Composes Phase C:
 *   1. buildMarketingRecapContext(thisMondayPT) — data shaper (C2)
 *   2. renderMarketingRecap(template, context) — Mustache render (C1)
 *   3. createRecapDraft(...) — persist to marketing_recap_drafts (Phase A)
 *
 * The draft is created in 'draft' status. Phase D's send route will
 * flip it to 'sending' → 'sent' (or 'failed').
 *
 * INPUT (optional body):
 *   { mondayPT?: string }   ISO date YYYY-MM-DD overriding the default
 *                            (used for testing / manual catch-up runs).
 *                            If absent, server computes today's Monday
 *                            in Pacific time.
 *
 * OUTPUT (201):
 *   {
 *     draft_id:           string,   // UUID
 *     status:             'draft',
 *     subject:            string,   // pre-rendered email subject
 *     week_range_label:   string,   // human-readable for UI display
 *     last_week_start:    string,   // ISO
 *     last_week_end:      string,   // ISO
 *     next_week_start:    string,   // ISO
 *     next_week_end:      string,   // ISO
 *     has_batches_sent:   boolean,
 *     has_upcoming_items: boolean,
 *     html_bytes:         number,
 *   }
 *
 * AUTH: Admin session required. Returns 401 otherwise.
 */
import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { requireApiRole } from '@/lib/auth/guards'
import { createRecapDraft } from '@/lib/admin-db'
import { buildMarketingRecapContext } from '@/lib/marketing-recap-data'
import {
  MARKETING_RECAP_TEMPLATE,
  renderMarketingRecap,
} from '@/lib/email-templates/marketing-recap'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ───── Request body schema ─────

const GenerateBodySchema = z
  .object({
    mondayPT: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'mondayPT must be YYYY-MM-DD')
      .optional(),
  })
  .strict()

// ───── PT-anchored "today's Monday" computation ─────
// Default behavior: if no mondayPT provided, compute the Monday of
// the current Pacific week. The recap is operator-relative; "this
// Monday" means the Monday of the week we're currently in (PT).

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
  // weekday is 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
  const daysSinceMonday: Record<string, number> = {
    Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6,
  }
  const offset = daysSinceMonday[weekday] ?? 0
  // Construct a local Date for the PT-anchored Monday calendar day.
  // Time component is irrelevant — toPacificISODate (inside the data
  // shaper) only reads calendar components.
  return new Date(year, month - 1, day - offset, 12, 0, 0)
}

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0)
}

// ───── POST handler ─────

export async function POST(request: Request) {
  const auth = await requireApiRole('marketing')
  if ('error' in auth) return auth.error
  const adminEmail = auth.session.username || 'unknown'

  // Optional body parse. Empty body → use server default.
  let mondayPT: Date
  try {
    const text = await request.text()
    if (text && text.trim().length > 0) {
      const parsed = JSON.parse(text)
      const result = GenerateBodySchema.safeParse(parsed)
      if (!result.success) {
        return NextResponse.json(
          { error: 'Invalid body', details: result.error.flatten() },
          { status: 400 },
        )
      }
      mondayPT = result.data.mondayPT
        ? parseISODate(result.data.mondayPT)
        : thisMondayPT()
    } else {
      mondayPT = thisMondayPT()
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  // Compose: context → render → persist.
  try {
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
      created_by:      adminEmail,
    })

    console.log(
      `[recap-generate-draft] admin=${adminEmail} created draft_id=${draftId} ` +
        `week=${context.last_week_start}..${context.last_week_end} ` +
        `batches=${context.batches_sent.length} ` +
        `upcoming=${context.upcoming_items.length} ` +
        `html_bytes=${htmlContent.length}`,
    )

    return NextResponse.json(
      {
        draft_id:           draft.draft_id,
        status:             draft.status,
        subject:            draft.subject,
        week_range_label:   context.week_range_label,
        last_week_start:    context.last_week_start,
        last_week_end:      context.last_week_end,
        next_week_start:    context.next_week_start,
        next_week_end:      context.next_week_end,
        has_batches_sent:   context.has_batches_sent,
        has_upcoming_items: context.has_upcoming_items,
        html_bytes:         htmlContent.length,
      },
      { status: 201 },
    )
  } catch (err) {
    console.error('[recap-generate-draft] failed', {
      admin: adminEmail,
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json(
      { error: 'Failed to generate draft' },
      { status: 500 },
    )
  }
}
