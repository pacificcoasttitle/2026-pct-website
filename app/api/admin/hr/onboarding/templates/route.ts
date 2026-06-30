/**
 * GET/POST /api/admin/hr/onboarding/templates
 *
 * HR checklist template editor. Gated requireApiRole('hr-tools').
 * Touches ONLY hr_onboarding_item_templates; stamped hr_onboarding_items
 * remain the historical per-person record.
 */
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireApiRole } from '@/lib/auth/guards'
import {
  addChecklistTemplateItem,
  getChecklistTemplates,
  HrChecklistTemplateError,
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

export async function GET(request: Request) {
  const auth = await requireApiRole('hr-tools')
  if ('error' in auth) return auth.error

  const type = new URL(request.url).searchParams.get('type') || ''
  try {
    const templates = await getChecklistTemplates(type)
    return NextResponse.json({ ok: true, templates })
  } catch (err) {
    return jsonError(err)
  }
}

export async function POST(request: Request) {
  const auth = await requireApiRole('hr-tools')
  if ('error' in auth) return auth.error

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    const item = await addChecklistTemplateItem(
      String(body.onboarding_type || body.type || ''),
      {
        item_key:    String(body.item_key || ''),
        label:       String(body.label || ''),
        category:    String(body.category || ''),
        sort_order:  body.sort_order == null ? null : Number(body.sort_order),
      },
      auth.session.username,
    )
    revalidatePath('/admin/team/hr/onboarding/templates')
    return NextResponse.json({ ok: true, item }, { status: 201 })
  } catch (err) {
    return jsonError(err)
  }
}
