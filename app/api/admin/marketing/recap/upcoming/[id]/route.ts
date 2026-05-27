import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import {
  ADMIN_COOKIE,
  isAuthenticated,
  verifyAdminToken,
} from '@/lib/admin-auth'
import {
  deleteUpcomingItem,
  getUpcomingItemById,
  updateUpcomingItem,
} from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const LANES = ['marketing-piece', 'social', 'weekly-email', 'other'] as const

const UpdateBodySchema = z.object({
  scheduled_date:       z.string().regex(DATE_RE, 'Use YYYY-MM-DD format').optional(),
  title:                z.string().trim().min(1).max(200).optional(),
  lane:                 z.enum(LANES).optional(),
  description:          z.string().trim().max(1000).optional().nullable(),
  asset_count_planned:  z.coerce.number().int().min(0).max(9999).optional().nullable(),
  notes:                z.string().trim().max(2000).optional().nullable(),
  active:               z.boolean().optional(),
}).refine((body) => Object.keys(body).length > 0, {
  message: 'At least one field is required',
})

async function getActorEmail(): Promise<string> {
  try {
    const jar = await cookies()
    const token = jar.get(ADMIN_COOKIE)?.value
    if (!token) return 'unknown'
    const session = await verifyAdminToken(token)
    return session?.username || 'unknown'
  } catch {
    return 'unknown'
  }
}

async function parseId(params: Promise<{ id: string }>) {
  const { id } = await params
  const itemId = parseInt(id, 10)
  if (!Number.isFinite(itemId) || itemId <= 0) {
    return null
  }
  return itemId
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const adminEmail = await getActorEmail()

  const itemId = await parseId(params)
  if (!itemId) {
    return NextResponse.json({ error: 'Invalid item id' }, { status: 400 })
  }

  let body: z.infer<typeof UpdateBodySchema>
  try {
    const raw = await req.json()
    body = UpdateBodySchema.parse(raw)
  } catch (err) {
    const details = err instanceof z.ZodError
      ? err.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`)
      : ['Invalid JSON body']
    return NextResponse.json({ error: 'Invalid request', details }, { status: 400 })
  }

  try {
    const existing = await getUpcomingItemById(itemId)
    if (!existing) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    const item = await updateUpcomingItem(itemId, {
      ...body,
      updated_by: adminEmail,
    })

    console.log(`[recap-upcoming] admin=${adminEmail} updated item=${itemId}`)
    return NextResponse.json({ item })
  } catch (err) {
    console.error('[recap-upcoming] update failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Database error' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const adminEmail = await getActorEmail()

  const itemId = await parseId(params)
  if (!itemId) {
    return NextResponse.json({ error: 'Invalid item id' }, { status: 400 })
  }

  try {
    const existing = await getUpcomingItemById(itemId)
    if (!existing) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    await deleteUpcomingItem(itemId, adminEmail)
    console.log(`[recap-upcoming] admin=${adminEmail} deactivated item=${itemId}`)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[recap-upcoming] delete failed:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
