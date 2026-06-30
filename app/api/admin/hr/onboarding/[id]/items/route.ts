/**
 * GET /api/admin/hr/onboarding/[id]/items
 *
 * Lightweight authenticated read of the checklist items for one
 * onboarding. Gated requireApiRole('hr-tools') — same gate as the rest of
 * HR. Used by HrOnboardingChecklist for refetch-on-focus so department
 * completions written from a SEPARATE session show up without a manual
 * refresh.
 *
 * ⚠️ Read-only. Returns the same shape the checklist renders (id,
 * item_key, label, category, status, completed_at, completed_by).
 */
import { NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/auth/guards'
import { getHrOnboardingItems } from '@/lib/admin-db'

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

  const items = await getHrOnboardingItems(onboardingId)
  return NextResponse.json({
    ok: true,
    items: items.map((i) => ({
      id: i.id,
      item_key: i.item_key,
      label: i.label,
      category: i.category,
      status: i.status,
      completed_at: i.completed_at,
      completed_by: i.completed_by,
    })),
  })
}
