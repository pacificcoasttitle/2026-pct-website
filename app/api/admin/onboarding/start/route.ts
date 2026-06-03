/**
 * POST /api/admin/onboarding/start  { repId }
 *
 * Idempotently starts onboarding for a rep (creates the record + seeds
 * the fixed checklist items, or returns the existing record). Admin
 * only. The explicit creation path — onboarding is NOT auto-created on
 * employee creation.
 */
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import {
  isAuthenticated,
  verifyAdminToken,
  ADMIN_COOKIE,
} from '@/lib/admin-auth'
import { startOnboarding, getEmployeeAdminById } from '@/lib/admin-db'

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

const BodySchema = z.object({ repId: z.coerce.number().int().positive() }).strict()

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const adminEmail = await getActorEmail()

  let repId: number
  try {
    const parsed = BodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'repId is required' }, { status: 400 })
    }
    repId = parsed.data.repId
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const employee = await getEmployeeAdminById(repId)
  if (!employee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
  }

  const result = await startOnboarding(repId, employee.slug, adminEmail)
  return NextResponse.json(result, { status: 200 })
}
