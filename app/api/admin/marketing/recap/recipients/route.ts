/**
 * /api/admin/marketing/recap/recipients
 *
 * GET  — list recipients.
 *        Query params: ?include_inactive=true to include soft-deleted rows.
 *
 * POST — create a new recipient (default active=true).
 *        Body: { email, name, role, notes? }
 *
 * Soft-delete + per-row PATCH live in [id]/route.ts.
 *
 * Auth and response shapes mirror the asset-delivery routes for
 * consistency across the admin API surface.
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireApiRole } from '@/lib/auth/guards'
import {
  getRecapRecipients,
  createRecapRecipient,
} from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const CreateBodySchema = z.object({
  email: z.string().trim().toLowerCase().min(3).max(254).regex(EMAIL_RE, 'Invalid email'),
  name:  z.string().trim().min(1).max(120),
  role:  z.string().trim().min(1).max(80),
  notes: z.string().trim().max(2000).optional().nullable(),
})

/* ─── GET ──────────────────────────────────────────────────────── */

export async function GET(req: NextRequest) {
  const auth = await requireApiRole('marketing')
  if ('error' in auth) return auth.error

  const includeInactive = req.nextUrl.searchParams.get('include_inactive') === 'true'

  try {
    const recipients = await getRecapRecipients(!includeInactive)
    return NextResponse.json({ recipients })
  } catch (err) {
    console.error('[recap-recipients] list failed:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

/* ─── POST ─────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  const auth = await requireApiRole('marketing')
  if ('error' in auth) return auth.error
  const adminEmail = auth.session.username || 'unknown'

  let body: z.infer<typeof CreateBodySchema>
  try {
    const raw = await req.json()
    body = CreateBodySchema.parse(raw)
  } catch (err) {
    const issues = err instanceof z.ZodError
      ? err.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`)
      : ['Invalid JSON body']
    return NextResponse.json({ error: 'Invalid request', details: issues }, { status: 400 })
  }

  try {
    const recipient = await createRecapRecipient({
      email:      body.email,
      name:       body.name,
      role:       body.role,
      notes:      body.notes ?? null,
      created_by: adminEmail,
    })

    console.log(
      `[recap-recipients] admin=${adminEmail} created recipient id=${recipient.id} email=${recipient.email}`,
    )

    return NextResponse.json({ recipient })
  } catch (err) {
    // Partial unique index on LOWER(email) WHERE active=true surfaces as
    // a Postgres 23505 unique_violation. Translate to 409 so the UI can
    // show a useful message.
    const code = (err as { code?: string } | null)?.code
    if (code === '23505') {
      return NextResponse.json(
        { error: 'An active recipient with that email already exists.' },
        { status: 409 },
      )
    }
    console.error('[recap-recipients] create failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Database error' },
      { status: 500 },
    )
  }
}
