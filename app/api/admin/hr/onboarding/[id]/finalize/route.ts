/**
 * POST /api/admin/hr/onboarding/[id]/finalize
 *
 * ⚠️ THE CANONICAL WRITE (4e). HR approves a SUBMITTED onboarding and
 * commits the reviewed staged payload into hr_employees — the ONLY place
 * staged onboarding data crosses into the canonical roster.
 *
 * Gated requireApiRole('hr-tools'). The heavy lifting (status guard,
 * payload→hr_employees mapping, create-new vs update-shell, link, status
 * flip) is done atomically in finalizeHrOnboarding() — a single DB
 * transaction (all-or-nothing). This route only authenticates, parses
 * the id, and maps errors to clean HTTP statuses.
 *
 * ⚠️ Writes only hr_employees + hr_onboarding — never vcard/staff.
 */
import { NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/auth/guards'
import { finalizeHrOnboarding, HrOnboardingFinalizeError } from '@/lib/admin-db'

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

  try {
    const { onboarding, employeeId } = await finalizeHrOnboarding(id, actor)
    return NextResponse.json({
      ok: true,
      employee_id: employeeId,
      onboarding: { id: onboarding.id, status: onboarding.status, finalized_at: onboarding.finalized_at },
    })
  } catch (err) {
    if (err instanceof HrOnboardingFinalizeError) {
      // Friendly, expected failures (guard / validation / email-dup).
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('[hr-finalize] unexpected error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Could not finalize this onboarding.' }, { status: 500 })
  }
}
