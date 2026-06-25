/**
 * PATCH /api/admin/hr/onboarding/[id]/items/[itemId]
 *
 * Manually set ONE checklist item's status (HR tick). Gated
 * requireApiRole('hr-tools') — same gate as the rest of HR.
 *
 * ⚠️ Touches ONLY hr_onboarding_items (status + completed_at/completed_by).
 * NEVER payload / hr_employees / vcard / staff / the finalize/sync paths.
 * The item must belong to the given onboarding (scoping guard in the
 * UPDATE WHERE). Body: { status: 'pending' | 'in_progress' | 'complete' }.
 */
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireApiRole } from '@/lib/auth/guards'
import { setHrOnboardingItemStatus } from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VALID = ['pending', 'in_progress', 'complete'] as const

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const auth = await requireApiRole('hr-tools')
  if ('error' in auth) return auth.error

  const actor = auth.session.username || 'unknown'
  const { id: idRaw, itemId: itemRaw } = await params
  const onboardingId = parseInt(idRaw, 10)
  const itemId = parseInt(itemRaw, 10)
  if (!Number.isFinite(onboardingId) || onboardingId <= 0 ||
      !Number.isFinite(itemId) || itemId <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const status = String(body.status || '')
  if (!VALID.includes(status as (typeof VALID)[number])) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID.join(', ')}` },
      { status: 400 },
    )
  }

  const updated = await setHrOnboardingItemStatus(
    onboardingId,
    itemId,
    status as (typeof VALID)[number],
    actor,
  )
  if (!updated) {
    return NextResponse.json(
      { error: 'Checklist item not found for this onboarding.' },
      { status: 404 },
    )
  }

  revalidatePath(`/admin/team/hr/onboarding/${onboardingId}`)
  return NextResponse.json({ ok: true, item: updated })
}
