/**
 * PATCH /api/admin/hr/employees/[id]
 *
 * Soft-deactivate or reactivate an HR employee. NEVER hard-deletes.
 *   { active: false } → active=false + deactivated_at=NOW()
 *   { active: true  } → active=true  + deactivated_at=NULL (reactivate)
 *
 * Gated requireApiRole('hr-tools'). updated_by = actor username.
 *
 * ⚠️ Touches ONLY hr_employees. The linked vcard_employees /
 * staff_members facets are owned by their teams and are left untouched.
 */
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireApiRole } from '@/lib/auth/guards'
import { setHrEmployeeActive } from '@/lib/admin-db'

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

  if (typeof body.active !== 'boolean') {
    return NextResponse.json({ error: 'Body must include { active: boolean }.' }, { status: 400 })
  }

  try {
    const updated = await setHrEmployeeActive(idNum, body.active, auth.session.username)
    if (!updated) {
      return NextResponse.json({ error: 'Employee not found.' }, { status: 404 })
    }

    revalidatePath('/admin/team/hr')
    revalidatePath('/admin/team/hr/dashboard')

    return NextResponse.json({ success: true, employee: updated }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update employee'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
