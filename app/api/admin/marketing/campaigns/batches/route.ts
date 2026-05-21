// ============================================================
// GET /api/admin/marketing/campaigns/batches?limit=50&offset=0
// List recent multi-rep campaign batches with per-status counts.
// Optionally appends older single-campaign rows (batch_id IS NULL) as
// individual entries on the first page so the UI history is complete.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getEmailCampaignBatches } from '@/lib/admin-db'

export const runtime = 'nodejs'

function parseIntParam(value: string | null, fallback: number, min: number, max: number): number {
  if (value == null) return fallback
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(Math.floor(n), max))
}

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const url    = new URL(req.url)
  const limit  = parseIntParam(url.searchParams.get('limit'),  50, 1, 200)
  const offset = parseIntParam(url.searchParams.get('offset'),  0, 0, 100_000)

  const { batches, hasMore } = await getEmailCampaignBatches({
    limit,
    offset,
    includeNonBatch: true,
  })

  return NextResponse.json({ batches, hasMore })
}
