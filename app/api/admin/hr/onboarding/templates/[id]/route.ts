/**
 * PATCH/DELETE /api/admin/hr/onboarding/templates/[id]
 *
 * Gated requireApiRole('hr-tools'). Mutates template rows only:
 * hr_onboarding_item_templates, never stamped hr_onboarding_items.
 */
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireApiRole } from '@/lib/auth/guards'
import {
  deleteChecklistTemplateItem,
  HrChecklistTemplateError,
  updateChecklistTemplateItem,
} from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function jsonError(err: unknown) {
  if (err instanceof HrChecklistTemplateError) {
    return NextResponse.json({ error: err.message }, { status: err.status })
  }
  const message = err instanceof Error ? err.message : 'Template request failed.'
  return NextResponse.json({ error: message }, { status: 500 })
}

function parseId(raw: string): number | null {
  const id = Number(raw)
  return Number.isInteger(id) && id > 0 ? id : null
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole('hr-tools')
  if ('error' in auth) return auth.error

  const { id: raw } = await params
  const id = parseId(raw)
  if (!id) return NextResponse.json({ error: 'Invalid template id.' }, { status: 400 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    const item = await updateChecklistTemplateItem(
      id,
      {
        label:      body.label === undefined ? undefined : String(body.label),
        category:   body.category === undefined ? undefined : String(body.category),
        active:     body.active === undefined ? undefined : Boolean(body.active),
        sort_order: body.sort_order == null ? null : Number(body.sort_order),
      },
      auth.session.username,
    )
    if (!item) return NextResponse.json({ error: 'Template item not found.' }, { status: 404 })
    revalidatePath('/admin/team/hr/onboarding/templates')
    return NextResponse.json({ ok: true, item })
  } catch (err) {
    return jsonError(err)
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole('hr-tools')
  if ('error' in auth) return auth.error

  const { id: raw } = await params
  const id = parseId(raw)
  if (!id) return NextResponse.json({ error: 'Invalid template id.' }, { status: 400 })

  try {
    const deleted = await deleteChecklistTemplateItem(id)
    if (!deleted) return NextResponse.json({ error: 'Template item not found.' }, { status: 404 })
    revalidatePath('/admin/team/hr/onboarding/templates')
    return NextResponse.json({ ok: true })
  } catch (err) {
    return jsonError(err)
  }
}
