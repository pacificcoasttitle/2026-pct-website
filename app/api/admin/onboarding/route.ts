/**
 * GET /api/admin/onboarding
 *
 * Admin overview of all onboarding records (rep name + X/N progress).
 */
import { NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/auth/guards'
import { getOnboardingList } from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireApiRole('onboarding')
  if ('error' in auth) return auth.error
  const list = await getOnboardingList()
  return NextResponse.json({ onboarding: list }, { status: 200 })
}
