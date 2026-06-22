/**
 * /api/admin/marketing/asset-delivery/batches/[batchId]
 *
 * GET    — full batch payload: batch row + uploaded files + per-rep send rows.
 *          Used by the wizard (Step 2 file grid, Step 3 preview) and by the
 *          batch detail page.
 *
 * DELETE — remove a draft batch (and its files via CASCADE) before it has
 *          been sent. Sent batches cannot be deleted via this endpoint.
 */
import { NextRequest, NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/auth/guards'
import {
  getAssetDeliveryBatchById,
  getFilesByBatchId,
  getSendsByBatchId,
  deleteAssetDeliveryBatch,
} from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/* ─── GET ──────────────────────────────────────────────────────── */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> },
) {
  const auth = await requireApiRole('asset-delivery')
  if ('error' in auth) return auth.error

  const { batchId } = await params
  if (!UUID_RE.test(batchId)) {
    return NextResponse.json({ error: 'Invalid batchId (must be a UUID)' }, { status: 400 })
  }

  try {
    const batch = await getAssetDeliveryBatchById(batchId)
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
    }
    const [files, sends] = await Promise.all([
      getFilesByBatchId(batchId),
      getSendsByBatchId(batchId),
    ])
    return NextResponse.json({ batch, files, sends })
  } catch (err) {
    console.error('[asset-batch] get failed:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

/* ─── DELETE ───────────────────────────────────────────────────── */

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ batchId: string }> },
) {
  const auth = await requireApiRole('asset-delivery')
  if ('error' in auth) return auth.error
  const adminEmail = auth.session.username || 'unknown'

  const { batchId } = await params
  if (!UUID_RE.test(batchId)) {
    return NextResponse.json({ error: 'Invalid batchId (must be a UUID)' }, { status: 400 })
  }

  const batch = await getAssetDeliveryBatchById(batchId)
  if (!batch) {
    return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
  }
  if (batch.status === 'sent' || batch.status === 'sending') {
    return NextResponse.json(
      { error: `Cannot delete a batch that's already ${batch.status}` },
      { status: 400 },
    )
  }

  // NOTE: the per-file route handles R2 cleanup. Deleting a batch via the
  // CASCADE drop will orphan R2 objects under asset-delivery/<batchId>/.
  // The intended cleanup path is for the operator to delete files
  // individually before deleting the batch, or for a periodic sweep job.
  // Surfacing this here so callers don't expect storage GC.
  try {
    const ok = await deleteAssetDeliveryBatch(batchId)
    console.log(
      `[asset-batch] admin=${adminEmail} deleted batch=${batchId} ok=${ok}`,
    )
    return NextResponse.json({ deleted: ok, batch_id: batchId })
  } catch (err) {
    console.error('[asset-batch] delete failed:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
