/**
 * POST /api/admin/hr/onboarding/bulk-invite
 *
 * Bulk "send update invite to all existing employees". For each eligible
 * employee (active, is_new_hire=false, has a work email, no open
 * onboarding) this REUSES the single-flow internals to:
 *   1. findActiveHrOnboarding (fired-once guard — skip if one exists),
 *   2. createHrOnboardingForExisting (create + seed the checklist by type),
 *   3. render + send the warm "confirm your info" invite (SendGrid).
 *
 * Gated requireApiRole('hr-tools'). Non-blocking per employee (one failure
 * records `failed` + the batch continues), concurrency-pooled (5), with an
 * extended maxDuration.
 *
 * ⚠️⚠️ TESTING SAFETY — the default MUST NOT blast real employees:
 *   - mode='test' (DEFAULT): still CREATES onboardings for real (proves
 *     the DB/checklist mechanism), but sends exactly ONE representative
 *     invite to HR_BULK_INVITE_TEST_EMAIL || 'ghernandez@pct.com'. No
 *     employee's real email is ever a recipient.
 *   - mode='real' (EXPLICIT, deliberate): sends each invite to the
 *     employee's own work email. This is NEVER the default — the request
 *     must explicitly set { mode: 'real' }.
 */
import { NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'
import { requireApiRole } from '@/lib/auth/guards'
import {
  getEmployeesEligibleForBulkInvite,
  findActiveHrOnboarding,
  createHrOnboardingForExisting,
  issueHrOnboardingToken,
  markHrOnboardingInvited,
  getHrEmployeeById,
  type BulkInviteEligibleRow,
} from '@/lib/admin-db'
import { renderHrOnboardingInvite } from '@/lib/email-templates/hr-onboarding-invite'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // up to ~100 create+send ops in a pool of 5

const SUBJECT_NEW      = 'Welcome to Pacific Coast Title — start your onboarding'
const SUBJECT_EXISTING = 'Please confirm your information on file — Pacific Coast Title'
const SITE_BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pct.com').replace(/\/$/, '')

// ⚠️ Test-mode recipient — the single override address for the one
// representative email. Never the real employee list.
const TEST_RECIPIENT = (process.env.HR_BULK_INVITE_TEST_EMAIL || 'ghernandez@pct.com').trim()

let sgInitialized = false
function getSg(): typeof sgMail | null {
  const key = process.env.SENDGRID_API_KEY
  if (!key) return null
  if (!sgInitialized) {
    sgMail.setApiKey(key)
    sgInitialized = true
  }
  return sgMail
}

async function runWithConcurrency<TIn, TOut>(
  items: TIn[],
  limit: number,
  worker: (item: TIn, index: number) => Promise<TOut>,
): Promise<TOut[]> {
  const results: TOut[] = new Array(items.length)
  let cursor = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const idx = cursor++
      results[idx] = await worker(items[idx], idx)
    }
  })
  await Promise.all(runners)
  return results
}

/** Render + send the invite for one onboarding id. Recipient is passed in
 *  (test mode → override; real mode → the employee's work email). Returns
 *  the address actually sent to. Throws on send failure (caught by caller). */
async function sendInviteForOnboarding(
  onboardingId: number,
  hrEmployeeId: number,
  firstName: string,
  recipient: string,
  sg: typeof sgMail,
): Promise<void> {
  const employee = await getHrEmployeeById(hrEmployeeId)
  const isNewHire = employee ? employee.is_new_hire !== false : true
  const isExisting = !isNewHire
  const subject = isExisting ? SUBJECT_EXISTING : SUBJECT_NEW

  const token = await issueHrOnboardingToken(onboardingId)
  if (!token) throw new Error('Failed to generate onboarding link.')

  const html = renderHrOnboardingInvite({
    subject,
    first_name:           firstName || 'there',
    onboarding_url:       `${SITE_BASE}/hr-onboarding/${token}`,
    expiry_label:         '14 days',
    is_existing_employee: isExisting,
  })

  await sg.send({
    to:      recipient,
    from:    { email: 'hr@pct.com', name: 'Pacific Coast Title HR' },
    subject,
    html,
  })
}

interface PerEmployeeResult {
  employee_id: number
  name:        string
  status:      'sent' | 'created_no_email' | 'skipped' | 'failed'
  detail?:     string
  sent_to?:    string
}

export async function POST(request: Request) {
  const auth = await requireApiRole('hr-tools')
  if ('error' in auth) return auth.error
  const actor = auth.session.username || 'unknown'

  // ⚠️ DEFAULT to test mode. Real mode requires an EXPLICIT { mode: 'real' }.
  let body: Record<string, unknown> = {}
  try {
    body = await request.json()
  } catch {
    // no body → test mode (the safe default)
  }
  const isRealMode = body.mode === 'real'

  const { eligible, skippedNoEmail } = await getEmployeesEligibleForBulkInvite()

  const sg = getSg()
  if (!sg) {
    return NextResponse.json(
      { error: 'Email is not configured (SENDGRID_API_KEY missing).' },
      { status: 503 },
    )
  }

  // In test mode we send exactly ONE representative email (the Director
  // wants one delivery, not 100). We still CREATE every onboarding. Track
  // whether the representative email has been sent so only the first
  // successfully-created onboarding triggers it.
  let testEmailSent = false

  const perEmployee: PerEmployeeResult[] = await runWithConcurrency(
    eligible,
    5,
    async (emp: BulkInviteEligibleRow): Promise<PerEmployeeResult> => {
      try {
        // Fired-once guard: never double-create for an open onboarding.
        const existing = await findActiveHrOnboarding({ hrEmployeeId: emp.id })
        if (existing) {
          return { employee_id: emp.id, name: emp.name, status: 'skipped', detail: 'Already has an open onboarding.' }
        }

        // Create the onboarding + seed the checklist (REAL in both modes).
        const onboarding = await createHrOnboardingForExisting({
          hr_employee_id: emp.id,
          created_by:     actor,
        })

        const firstName = String(onboarding.payload?.first_name || emp.name.split(' ')[0] || '').trim()

        if (isRealMode) {
          // ⚠️ REAL MODE (explicit): send to the employee's own work email.
          await sendInviteForOnboarding(onboarding.id, emp.id, firstName, emp.email, sg)
          await markHrOnboardingInvited(onboarding.id, null)
          return { employee_id: emp.id, name: emp.name, status: 'sent', sent_to: emp.email }
        }

        // ⚠️ TEST MODE (default): onboarding created; send ONE
        // representative email to the override, not to this employee.
        if (!testEmailSent) {
          // Claim the single representative send (first creator wins).
          testEmailSent = true
          await sendInviteForOnboarding(onboarding.id, emp.id, firstName, TEST_RECIPIENT, sg)
          await markHrOnboardingInvited(onboarding.id, TEST_RECIPIENT)
          return { employee_id: emp.id, name: emp.name, status: 'sent', sent_to: TEST_RECIPIENT, detail: 'Representative test email.' }
        }
        // Onboarding created, but no email sent (test mode, one already sent).
        return { employee_id: emp.id, name: emp.name, status: 'created_no_email', detail: 'Onboarding created (test mode — no email sent).' }
      } catch (err) {
        console.error(`[hr-bulk-invite] employee ${emp.id} failed:`, err)
        return {
          employee_id: emp.id,
          name: emp.name,
          status: 'failed',
          detail: err instanceof Error ? err.message : 'Unknown error',
        }
      }
    },
  )

  // Fold the blank-email skips into the results (reported, not dropped).
  const results: PerEmployeeResult[] = [
    ...perEmployee,
    ...skippedNoEmail.map((s) => ({
      employee_id: s.id,
      name: s.name,
      status: 'skipped' as const,
      detail: 'No work email on file.',
    })),
  ]

  const sent    = results.filter((r) => r.status === 'sent').length
  const created = results.filter((r) => r.status === 'created_no_email').length
  const skipped = results.filter((r) => r.status === 'skipped').length
  const failed  = results.filter((r) => r.status === 'failed').length

  console.log(`[hr-bulk-invite] actor=${actor} mode=${isRealMode ? 'real' : 'test'} total=${results.length} sent=${sent} created_no_email=${created} skipped=${skipped} failed=${failed}`)

  return NextResponse.json({
    ok: true,
    mode: isRealMode ? 'real' : 'test',
    total: results.length,
    sent,
    created_no_email: created,
    skipped,
    failed,
    test_recipient: isRealMode ? null : TEST_RECIPIENT,
    results,
  })
}
