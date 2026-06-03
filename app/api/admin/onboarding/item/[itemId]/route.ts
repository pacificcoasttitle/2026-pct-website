/**
 * PATCH /api/admin/onboarding/item/[itemId]  { status }
 *
 * Update one checklist item's status (pending | in_progress | complete).
 * Rolls the parent record's status up to 'complete' when all items are
 * complete, else 'in_progress'. Admin only.
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import {
  isAuthenticated,
  verifyAdminToken,
  ADMIN_COOKIE,
} from '@/lib/admin-auth'
import { setOnboardingItemStatus } from '@/lib/admin-db'

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

const BodySchema = z.object({
  status: z.enum(['pending', 'in_progress', 'complete']),
}).strict()

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const adminEmail = await getActorEmail()

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
