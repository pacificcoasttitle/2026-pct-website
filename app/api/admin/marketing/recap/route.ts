/**
 * GET /api/admin/marketing/recap
 *
 * Lists Weekly Marketing Recap drafts for the admin UI hub.
 *
 * Query params:
 *   limit — number of rows to return (default 20, min 1, max 100).
 *
 * Response (200):
 *   { drafts: RecapDraft[] }
 *
 * Ordering: newest first by week_start_date DESC, id DESC (per
 * getRecapDrafts in lib/admin-db.ts).
 *
 * Auth: Admin session required. Returns 401 otherwise.
 */
import { NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/auth/guards'
import { getRecapDrafts } from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const auth = await requireApiRole('marketing')
  if ('error' in auth) return auth.error

  const url = new URL(request.url)
  const limit = Math.min(
    Math.max(parseInt(url.searchParams.get('limit') ?? '20', 10) || 20, 1),
    100,
  )

  try {
    const drafts = await getRecapDrafts({ limit })
    return NextResponse.json({ drafts })
  } catch (err) {
    console.error('[recap-drafts-list] failed', {
      error: err instanceof Error ? err.message : String(err),
    })
    return NextResponse.json(
      { error: 'Failed to load drafts' },
      { status: 500 },
    )
  }
}
