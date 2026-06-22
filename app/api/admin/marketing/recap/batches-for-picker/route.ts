import { NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/auth/guards'
import { listBatchesForPicker } from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Feeds the H3 asset-link BatchPicker: all batches, most-recent first.
// No filters (admin discretion — show every batch regardless of status).
export async function GET() {
  const auth = await requireApiRole('marketing')
  if ('error' in auth) return auth.error

  try {
    const batches = await listBatchesForPicker()
    return NextResponse.json({ batches })
  } catch (err) {
    console.error('[recap-batches-for-picker] list failed:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
