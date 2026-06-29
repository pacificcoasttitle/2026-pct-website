/**
 * POST /api/admin/hr/onboarding
 *
 * HR-side onboarding create (the issuing half — 4b). Two paths:
 *   1. Existing employee: { hr_employee_id }      → FK set
 *   2. New shell:         { first_name, last_name, invited_email } → FK null
 *
 * Gated requireApiRole('hr-tools'). created_by = actor. Dup-guard: if an
 * in-flight onboarding already exists for the employee/email, return it
 * (200, deduped) rather than silently double-creating.
 *
 * ⚠️ Writes ONLY hr_onboarding (reads hr_employees for the existing
 * path). Does NOT write hr_employees/vcard/staff.
 */
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireApiRole } from '@/lib/auth/guards'
import {
  createHrOnboardingForExisting,
  createHrOnboardingShell,
  findActiveHrOnboarding,
} from '@/lib/admin-db'

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

  const createdBy = auth.session.username

  // HR-selected onboarding type (Sales Rep / Regular Employee). Validate
  // to the known vocabulary; anything missing/invalid → 'sales_rep' (the
  // safe, current-behavior default). The create fns also re-normalize.
  const onboarding_type =
    body.onboarding_type === 'employee' ? 'employee' : 'sales_rep'

  try {
    // Path 1 — existing employee
    if (body.hr_employee_id != null) {
      const hrEmployeeId = Number(body.hr_employee_id)
      if (!Number.isInteger(hrEmployeeId) || hrEmployeeId <= 0) {
        return NextResponse.json({ error: 'Invalid hr_employee_id.' }, { status: 400 })
      }

      const existing = await findActiveHrOnboarding({ hrEmployeeId })
      if (existing) {
        return NextResponse.json(
          { success: true, deduped: true, onboarding: existing },
          { status: 200 },
        )
      }

      const onboarding = await createHrOnboardingForExisting({
        hr_employee_id: hrEmployeeId,
        created_by:     createdBy,
        onboarding_type,
      })
      revalidatePath('/admin/team/hr/onboarding')
      return NextResponse.json({ success: true, onboarding }, { status: 201 })
    }

    // Path 2 — new shell
    const first_name    = String(body.first_name || '').trim()
    const last_name     = String(body.last_name || '').trim()
    const invited_email = String(body.invited_email || '').trim()

    if (!first_name || !last_name) {
      return NextResponse.json({ error: 'First name and last name are required.' }, { status: 400 })
    }
    if (!invited_email) {
      return NextResponse.json({ error: 'Invited email is required.' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invited_email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const existing = await findActiveHrOnboarding({ email: invited_email })
    if (existing) {
      return NextResponse.json(
        { success: true, deduped: true, onboarding: existing },
        { status: 200 },
      )
    }

    const onboarding = await createHrOnboardingShell({
      first_name,
      last_name,
      invited_email,
      created_by: createdBy,
      onboarding_type,
    })
    revalidatePath('/admin/team/hr/onboarding')
    return NextResponse.json({ success: true, onboarding }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create onboarding.'
    const status  = /not found/i.test(message) ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
