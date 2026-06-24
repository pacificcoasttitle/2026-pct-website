/**
 * POST /api/admin/hr/onboarding/[id]/request-changes
 *
 * HR sends a submitted onboarding back to the employee (status →
 * 'in_progress') so they can edit again; the invite can then be re-sent
 * via the existing /send route. Gated requireApiRole('hr-tools').
 *
 * ⚠️ Writes ONLY hr_onboarding (status). Does not touch hr_employees/
 * vcard/staff. Only acts on a 'submitted' record (else 409).
 */
import { NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/auth/guards'
import { getHrOnboardingById, requestHrOnboardingChanges } from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole('hr-tools')
  if ('error' in auth) return auth.error

  const actor = auth.session.username || 'unknown'
  const { id: idRaw } = await params
  const id = parseInt(idRaw, 10)
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid onboarding id' }, { status: 400 })
  }

  const current = await getHrOnboardingById(id)
  if (!current) {
    return NextResponse.json({ error: 'Onboarding not found' }, { status: 404 })
  }
  if (current.status !== 'submitted') {
    return NextResponse.json(
      { error: `Only a submitted onboarding can be sent back (current status: ${current.status}).` },
      { status: 409 },
    )
  }

  const updated = await requestHrOnboardingChanges(id, actor)
  return NextResponse.json({ ok: true, status: updated?.status ?? 'in_progress' })
}
