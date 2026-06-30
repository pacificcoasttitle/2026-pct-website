/**
 * POST /api/admin/hr/onboarding/[id]/kickoff
 *
 * HR-triggered department orchestration kickoff. Gated requireApiRole
 * ('hr-tools'). Sends one email per department WITH checklist items,
 * skips empty departments, and records sent tracking.
 */
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireApiRole } from '@/lib/auth/guards'
import {
  HrDepartmentKickoffError,
  kickOffHrDepartments,
} from '@/lib/hr-department-kickoff'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole('hr-tools')
  if ('error' in auth) return auth.error

  const { id: idRaw } = await params
  const id = Number(idRaw)
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid onboarding id.' }, { status: 400 })
  }

  try {
    const summary = await kickOffHrDepartments({
      onboardingId: id,
      actor:        auth.session.username || 'unknown',
    })
    revalidatePath(`/admin/team/hr/onboarding/${id}`)
    return NextResponse.json({
      ...summary,
      // Do not echo raw token URLs from the admin API; HR sees send state,
      // and departments receive links via email.
      sent: summary.sent.map(({ department_url: _url, ...row }) => row),
    })
  } catch (err) {
    if (err instanceof HrDepartmentKickoffError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    const message = err instanceof Error ? err.message : 'Department kickoff failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
