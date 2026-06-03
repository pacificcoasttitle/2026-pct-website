/**
 * GET /api/admin/onboarding
 *
 * Admin overview of all onboarding records (rep name + X/N progress).
 */
import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getOnboardingList } from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const list = await getOnboardingList()
  return NextResponse.json({ onboarding: list }, { status: 200 })
}
