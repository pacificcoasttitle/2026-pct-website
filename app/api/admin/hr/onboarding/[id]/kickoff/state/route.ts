/**
 * GET /api/admin/hr/onboarding/[id]/kickoff/state
 *
 * Lightweight authenticated read of the department kickoff state for one
 * onboarding. Gated requireApiRole('hr-tools') — same gate as the rest of
 * HR. Used by HrOnboardingReviewClient for refetch-on-focus so department
 * notes / completions written from a SEPARATE (token-gated department)
 * session show up without a manual refresh.
 *
 * ⚠️ Read-only. Returns the same shape the review page renders
 * (category, item_count, sent_to, sent_at, sent_by, department_note).
 */
import { NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/auth/guards'
import { getHrDepartmentKickoffState } from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole('hr-tools')
  if ('error' in auth) return auth.error

  const { id } = await params
  const onboardingId = parseInt(id, 10)
  if (!Number.isFinite(onboardingId) || onboardingId <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const departmentKickoff = await getHrDepartmentKickoffState(onboardingId)
  return NextResponse.json({ ok: true, departmentKickoff })
}
