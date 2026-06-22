/**
 * PATCH /api/admin/onboarding/item/[itemId]  { status }
 *
 * Update one checklist item's status (pending | in_progress | complete).
 * Rolls the parent record's status up to 'complete' when all items are
 * complete, else 'in_progress'. Admin only.
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireApiRole } from '@/lib/auth/guards'
import { setOnboardingItemStatus } from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BodySchema = z.object({
  status: z.enum(['pending', 'in_progress', 'complete']),
}).strict()

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const auth = await requireApiRole('onboarding')
  if ('error' in auth) return auth.error
  const adminEmail = auth.session.username || 'unknown'

  const { itemId } = await params
  const itemIdNum = Number(itemId)
  if (!Number.isInteger(itemIdNum) || itemIdNum <= 0) {
    return NextResponse.json({ error: 'Invalid itemId' }, { status: 400 })
  }

  let status: 'pending' | 'in_progress' | 'complete'
  try {
    const parsed = BodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'status must be pending | in_progress | complete' }, { status: 400 })
    }
    status = parsed.data.status
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const result = await setOnboardingItemStatus(itemIdNum, status, adminEmail)
  if (!result) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 })
  }
  return NextResponse.json(result, { status: 200 })
}
