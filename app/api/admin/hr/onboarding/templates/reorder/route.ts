/**
 * PATCH /api/admin/hr/onboarding/templates/reorder
 *
 * Transactional bulk reorder for checklist templates. Gated
 * requireApiRole('hr-tools'). Updates sort_order on template rows only.
 */
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireApiRole } from '@/lib/auth/guards'
import {
  HrChecklistTemplateError,
  reorderChecklistTemplateItems,
} from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function jsonError(err: unknown) {
  if (err instanceof HrChecklistTemplateError) {
    return NextResponse.json({ error: err.message }, { status: err.status })
  }
  const message = err instanceof Error ? err.message : 'Template reorder failed.'
  return NextResponse.json({ error: message }, { status: 500 })
}

export async function PATCH(request: Request) {
  const auth = await requireApiRole('hr-tools')
  if ('error' in auth) return auth.error

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const orderedIds = Array.isArray(body.orderedIds)
    ? body.orderedIds.map((id) => Number(id))
    : []

  try {
    const templates = await reorderChecklistTemplateItems(
      String(body.onboarding_type || body.type || ''),
      orderedIds,
      auth.session.username,
    )
    revalidatePath('/admin/team/hr/onboarding/templates')
    return NextResponse.json({ ok: true, templates })
  } catch (err) {
    return jsonError(err)
  }
}
