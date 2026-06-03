/**
 * GET /api/admin/onboarding/[repId]
 *
 * One rep's onboarding record + checklist items. 404 if none started.
 */
import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getOnboarding } from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ repId: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { repId } = await params
  const repIdNum = Number(repId)
  if (!Number.isInteger(repIdNum) || repIdNum <= 0) {
    return NextResponse.json({ error: 'Invalid repId' }, { status: 400 })
  }

  const result = await getOnboarding(repIdNum)
  if (!result) {
    return NextResponse.json({ error: 'No onboarding started for this rep' }, { status: 404 })
  }
  return NextResponse.json(result, { status: 200 })
}
