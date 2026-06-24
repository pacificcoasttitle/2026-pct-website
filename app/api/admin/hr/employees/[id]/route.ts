/**
 * PATCH /api/admin/hr/employees/[id]
 *
 * Update an HR employee. Handles BOTH:
 *   • Soft-deactivate / reactivate (the 2d behavior, intact):
 *       { active: false } → active=false + deactivated_at=NOW()
 *       { active: true  } → active=true  + deactivated_at=NULL
 *   • Core-field edits (2b): first_name, last_name, full_legal_name,
 *       title, department, office, email, mobile, office_phone.
 *
 * Both flow through updateHrEmployee(), which applies the SAME
 * active/deactivated_at semantics as setHrEmployeeActive — the
 * deactivate logic is reused, not forked. Only the fields PRESENT in the
 * body are updated (partial update).
 *
 * Gated requireApiRole('hr-tools'). updated_by = actor username.
 * email (if edited) is unique + normalized → duplicate returns 409.
 *
 * ⚠️ Touches ONLY hr_employees. The linked vcard_employees /
 * staff_members facets are owned by their teams and are left untouched.
 */
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireApiRole } from '@/lib/auth/guards'
import { updateHrEmployee, type UpdateHrEmployeeInput } from '@/lib/admin-db'

export const runtime = 'nodejs'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole('hr-tools')
  if ('error' in auth) return auth.error

  const { id } = await params
  const idNum = Number(id)
  if (!Number.isInteger(idNum) || idNum <= 0) {
    return NextResponse.json({ error: 'Invalid employee id' }, { status: 400 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Build a strict, partial update from only the allowed core fields.
  const update: UpdateHrEmployeeInput = { updated_by: auth.session.username }

  const str = (v: unknown) => String(v ?? '').trim()
  if ('first_name' in body)      update.first_name = str(body.first_name)
  if ('last_name' in body)       update.last_name = str(body.last_name)
  if ('full_legal_name' in body) update.full_legal_name = body.full_legal_name == null ? null : str(body.full_legal_name)
  if ('title' in body)           update.title = body.title == null ? null : str(body.title)
  if ('department' in body)      update.department = body.department == null ? null : str(body.department)
  if ('office' in body)          update.office = body.office == null ? null : str(body.office)
  if ('mobile' in body)          update.mobile = body.mobile == null ? null : str(body.mobile)
  if ('office_phone' in body)    update.office_phone = body.office_phone == null ? null : str(body.office_phone)
  if ('email' in body)           update.email = str(body.email)

  if ('active' in body) {
    if (typeof body.active !== 'boolean') {
      return NextResponse.json({ error: 'active must be a boolean.' }, { status: 400 })
    }
    update.active = body.active
  }

  // Validate edited identity fields aren't being blanked.
  if (update.first_name !== undefined && !update.first_name) {
    return NextResponse.json({ error: 'First name cannot be blank.' }, { status: 400 })
  }
  if (update.last_name !== undefined && !update.last_name) {
    return NextResponse.json({ error: 'Last name cannot be blank.' }, { status: 400 })
  }
  if (update.email !== undefined) {
    if (!update.email) {
      return NextResponse.json({ error: 'Email cannot be blank.' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(update.email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }
  }

  try {
    const updated = await updateHrEmployee(idNum, update)
    if (!updated) {
      return NextResponse.json({ error: 'Employee not found.' }, { status: 404 })
    }

    revalidatePath('/admin/team/hr')
    revalidatePath('/admin/team/hr/dashboard')
    revalidatePath(`/admin/team/hr/${idNum}`)

    return NextResponse.json({ success: true, employee: updated }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update employee'
    const status  = /already/i.test(message) ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
