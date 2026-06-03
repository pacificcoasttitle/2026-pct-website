/**
 * POST /api/admin/marketing/rep-recap/[draftId]/cancel
 *
 * Marks a rep "Week Ahead" draft 'cancelled' so it can never be sent
 * (the send route's claim predicate refuses 'cancelled'). Only a draft
 * in a still-cancelable state ('draft' or 'failed') can be cancelled —
 * a 'sent' or in-flight 'sending' draft cannot, and a conditional
 * UPDATE enforces that atomically.
 *
 * AUTH: Admin session required (same guard as the send route).
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  isAuthenticated,
  verifyAdminToken,
  ADMIN_COOKIE,
} from '@/lib/admin-auth'
import { getPool, getRepRecapDraftByDraftId } from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ draftId: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const adminEmail  = await getActorEmail()
  const { draftId } = await params

  const draft = await getRepRecapDraftByDraftId(draftId)
  if (!draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
  }

  // Conditional cancel: only 'draft' or 'failed' can be cancelled.
  const db  = getPool()
  const res = await db.query(
    `UPDATE marketing_rep_recap_drafts
        SET status     = 'cancelled',
            updated_at = NOW(),
            updated_by = $1
      WHERE draft_id   = $2
        AND status IN ('draft', 'failed')
      RETURNING draft_id, status`,
    [adminEmail, draftId],
  )
  if (res.rowCount === 0) {
    return NextResponse.json(
      {
        error:  'Draft cannot be cancelled (already sent, sending, or cancelled).',
        status: draft.status,
      },
      { status: 409 },
    )
  }

  console.log(`[rep-recap-cancel] admin=${adminEmail} draft=${draftId} → cancelled`)
  return NextResponse.json({ draft_id: draftId, status: 'cancelled' }, { status: 200 })
}
