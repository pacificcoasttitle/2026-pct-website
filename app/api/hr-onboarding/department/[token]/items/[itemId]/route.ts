/**
 * PATCH /api/hr-onboarding/department/[token]/items/[itemId]
 *
 * Public department checklist completion path. Auth is ONLY the
 * department token. The request body never supplies onboarding_id or
 * category; both are derived from the resolved token.
 */
import { NextResponse } from 'next/server'
import { resolveDepartmentToken } from '@/lib/hr-onboarding-token'
import {
  setHrDepartmentChecklistItemStatus,
  getHrDepartmentCategoryProgress,
} from '@/lib/admin-db'
import { maybeNotifyDepartmentComplete } from '@/lib/hr-department-complete-notify'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const VALID = ['pending', 'in_progress', 'complete'] as const

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string; itemId: string }> },
) {
  const { token, itemId: itemRaw } = await params
  const resolved = await resolveDepartmentToken(token)
  if (!resolved) {
    return NextResponse.json({ error: 'Invalid or expired link.' }, { status: 404 })
  }

  const itemId = Number(itemRaw)
  if (!Number.isInteger(itemId) || itemId <= 0) {
    return NextResponse.json({ error: 'Invalid item id.' }, { status: 400 })
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

  const item = await setHrDepartmentChecklistItemStatus(
    resolved.onboarding_id,
    resolved.category,
    itemId,
    status as (typeof VALID)[number],
  )
  if (!item) {
    return NextResponse.json(
      { error: 'Checklist item not found for this department link.' },
      { status: 404 },
    )
  }

  // Recompute this department's progress (category-scoped). When the last
  // item flips complete, notify HR ONCE (non-blocking; the notify-once gate
  // + rollback live in maybeNotifyDepartmentComplete). all_done drives the
  // dept "you're done" screen.
  const progress = await getHrDepartmentCategoryProgress(
    resolved.onboarding_id,
    resolved.category,
  )
  if (progress.allDone) {
    // Fire-and-await, but it's fully error-swallowing internally so a send
    // failure can never fail this completion.
    await maybeNotifyDepartmentComplete(resolved.onboarding_id, resolved.category)
  }

  return NextResponse.json({
    ok: true,
    item,
    all_done: progress.allDone,
    progress: { total: progress.total, complete: progress.complete },
  })
}
