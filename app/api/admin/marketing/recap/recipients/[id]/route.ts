/**
 * /api/admin/marketing/recap/recipients/[id]
 *
 * PATCH  — update a recipient. Whitelisted fields only.
 *          Body: any of { email?, name?, role?, notes?, active? }
 *
 * DELETE — soft-delete (flip active=false). Hard delete is intentionally
 *          unavailable from the API.
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireApiRole } from '@/lib/auth/guards'
import {
  getRecapRecipientById,
  updateRecapRecipient,
  deleteRecapRecipient,
} from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const PatchBodySchema = z.object({
  email:  z.string().trim().toLowerCase().min(3).max(254).regex(EMAIL_RE, 'Invalid email').optional(),
  name:   z.string().trim().min(1).max(120).optional(),
  role:   z.string().trim().min(1).max(80).optional(),
  notes:  z.string().trim().max(2000).nullable().optional(),
  active: z.boolean().optional(),
})

function parseId(raw: string): number | null {
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

/* ─── PATCH ────────────────────────────────────────────────────── */

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole('marketing')
  if ('error' in auth) return auth.error
  const adminEmail = auth.session.username || 'unknown'

  const { id: idRaw } = await params
  const id = parseId(idRaw)
  if (id === null) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  let body: z.infer<typeof PatchBodySchema>
  try {
    const raw = await req.json()
    body = PatchBodySchema.parse(raw)
  } catch (err) {
    const issues = err instanceof z.ZodError
      ? err.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`)
      : ['Invalid JSON body']
    return NextResponse.json({ error: 'Invalid request', details: issues }, { status: 400 })
  }

  const existing = await getRecapRecipientById(id)
  if (!existing) {
    return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
  }

  try {
    const recipient = await updateRecapRecipient(id, {
      ...body,
      updated_by: adminEmail,
    })
    console.log(
      `[recap-recipients] admin=${adminEmail} updated id=${id} fields=${Object.keys(body).join(',') || '<none>'}`,
    )
    return NextResponse.json({ recipient })
  } catch (err) {
    const code = (err as { code?: string } | null)?.code
    if (code === '23505') {
      return NextResponse.json(
        { error: 'Another active recipient already uses that email.' },
        { status: 409 },
      )
    }
    console.error('[recap-recipients] update failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Database error' },
      { status: 500 },
    )
  }
}

/* ─── DELETE (soft) ────────────────────────────────────────────── */

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole('marketing')
  if ('error' in auth) return auth.error
  const adminEmail = auth.session.username || 'unknown'

  const { id: idRaw } = await params
  const id = parseId(idRaw)
  if (id === null) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const existing = await getRecapRecipientById(id)
  if (!existing) {
    return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
  }

  try {
    await deleteRecapRecipient(id, adminEmail)
    console.log(`[recap-recipients] admin=${adminEmail} soft-deleted id=${id}`)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[recap-recipients] delete failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Database error' },
      { status: 500 },
    )
  }
}
