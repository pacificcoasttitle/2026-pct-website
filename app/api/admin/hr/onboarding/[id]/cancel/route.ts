/**
 * POST /api/admin/hr/onboarding/[id]/cancel
 *
 * Cancel an onboarding (4f). Gated requireApiRole('hr-tools').
 *
 * ⚠️ Guard: a FINALIZED onboarding cannot be cancelled (the canonical
 * write already happened) → 409. Writes ONLY hr_onboarding.status —
 * never hr_employees/vcard/staff. A cancelled invite's public link then
 * dead-links (4c already treats 'cancelled' as locked).
 */
import { NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/auth/guards'
import { getHrOnboardingById, cancelHrOnboarding } from '@/lib/admin-db'

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
  if (current.status === 'finalized') {
    return NextResponse.json(
      { error: 'A finalized onboarding cannot be cancelled.' },
      { status: 409 },
    )
  }
  if (current.status === 'cancelled') {
    return NextResponse.json({ ok: true, status: 'cancelled' })
  }

  const updated = await cancelHrOnboarding(id, actor)
  if (!updated) {
    // Lost the race (finalized between read + write).
    return NextResponse.json(
      { error: 'This onboarding can no longer be cancelled.' },
      { status: 409 },
    )
  }
  return NextResponse.json({ ok: true, status: updated.status })
}
