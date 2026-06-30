/**
 * POST /api/admin/hr/employees
 *
 * HR adds a new employee. Creates ONLY the canonical hr_employees row
 * (vcard_employee_id + staff_member_id NULL — a decoupled "HR-only"
 * record). Does NOT create or modify vcard_employees / staff_members.
 *
 * Gated requireApiRole('hr-tools'). created_by = actor username.
 * email required + normalized + UNIQUE — duplicates return 409, never a
 * 500.
 */
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireApiRole } from '@/lib/auth/guards'
import { createHrEmployee } from '@/lib/admin-db'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const auth = await requireApiRole('hr-tools')
  if ('error' in auth) return auth.error

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const first_name = String(body.first_name || '').trim()
  const last_name  = String(body.last_name  || '').trim()
  const email      = String(body.email      || '').trim()
  // Onboarding type lives on the employee now (onboarding inherits it).
  // Validate to the known vocabulary; anything else → 'sales_rep' default.
  const onboarding_type =
    body.onboarding_type === 'employee' ? 'employee' : 'sales_rep'

  if (!first_name || !last_name) {
    return NextResponse.json({ error: 'First name and last name are required.' }, { status: 400 })
  }
  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }
  // Light shape check — not a full RFC validator, just a sanity gate.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  try {
    const created = await createHrEmployee({
      first_name,
      last_name,
      email,
      full_legal_name: body.full_legal_name ? String(body.full_legal_name) : undefined,
      title:           body.title           ? String(body.title)           : undefined,
      department:      body.department      ? String(body.department)      : undefined,
      office:          body.office          ? String(body.office)          : undefined,
      mobile:          body.mobile          ? String(body.mobile)          : undefined,
      office_phone:    body.office_phone    ? String(body.office_phone)    : undefined,
      active:          body.active === false ? false : true,
      onboarding_type,
      created_by:      auth.session.username,
    })

    revalidatePath('/admin/team/hr')
    revalidatePath('/admin/team/hr/dashboard')

    return NextResponse.json({ success: true, employee: created }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create employee'
    const status  = /already/i.test(message) ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
