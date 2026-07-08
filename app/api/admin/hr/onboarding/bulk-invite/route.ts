/**
 * POST /api/admin/hr/onboarding/bulk-invite
 *
 * Bulk "send update invite to existing employees" — THREE explicit modes.
 * Gated requireApiRole('hr-tools'). Non-blocking per employee, concurrency
 * pool of 5, extended maxDuration.
 *
 * ⚠️⚠️ SAFETY — the DEFAULT must be side-effect-free:
 *   - mode='dry_run' (DEFAULT — also the fallback for missing/unknown
 *     mode): computes the eligible set, writes NOTHING to the DB, and
 *     sends ONE clearly-marked SAMPLE preview to the override
 *     (HR_BULK_INVITE_TEST_EMAIL || 'ghernandez@pct.com'). Fully
 *     repeatable. ⚠️ NO real token is minted (no onboarding exists) — the
 *     preview link is inert.
 *   - mode='test': CREATES onboardings for real (or reuses existing open
 *     ones) but sends exactly ONE representative invite to the override.
 *   - mode='real' (EXPLICIT opt-in): sends each employee their invite at
 *     their own work email. NEVER the default — requires { mode: 'real' }.
 *
 * ⚠️ Existing open onboardings: for test/real, an employee who already has
 * a sendable open onboarding (draft/invited/in_progress) is REUSED and
 * sent — NOT skipped (so a real go-live after a test run actually
 * delivers). The atomic unique index still guarantees no duplicate is
 * created. submitted/finalized/cancelled are never re-sent (excluded by
 * the eligible-set query).
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
  HrOnboardingOpenConflictError,
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

/**
 * DRY-RUN preview: render the REAL invite template for a representative
 * employee and send ONE sample to the override. ⚠️ NO token is minted (no
 * onboarding exists) — the link is inert and the subject/body are clearly
 * marked as a preview. Writes nothing.
 */
async function sendPreviewSample(
  sample: BulkInviteEligibleRow | null,
  sg: typeof sgMail,
): Promise<void> {
  const firstName = (sample?.name.split(' ')[0] || 'there').trim()
  const subject = `[PREVIEW] Bulk invite sample — Pacific Coast Title`
  const html = renderHrOnboardingInvite({
    subject,
    first_name:           firstName,
    // ⚠️ Inert link — dry-run mints NO real token for a non-existent
    // onboarding. This is a preview of the layout/copy only.
    onboarding_url:       `${SITE_BASE}/hr-onboarding/preview-only-inert-link`,
    expiry_label:         '14 days',
    is_existing_employee: true,
  })
  await sg.send({
    to:      TEST_RECIPIENT,
    from:    { email: 'hr@pct.com', name: 'Pacific Coast Title HR' },
    subject,
    html,
  })
}

type BulkMode = 'dry_run' | 'test' | 'real'

interface PerEmployeeResult {
  employee_id: number
  name:        string
  status:      'sent_created' | 'sent_existing' | 'created_no_email' | 'skipped' | 'failed'
  detail?:     string
  sent_to?:    string
}

export async function POST(request: Request) {
  const auth = await requireApiRole('hr-tools')
  if ('error' in auth) return auth.error
  const actor = auth.session.username || 'unknown'

  // ⚠️ DEFAULT to dry_run (missing/unknown mode → dry_run). test creates;
  // real requires the EXPLICIT { mode: 'real' } — never reachable by default.
  let body: Record<string, unknown> = {}
  try {
    body = await request.json()
  } catch {
    // no body → dry_run (the safe, side-effect-free default)
  }
  const mode: BulkMode =
    body.mode === 'real' ? 'real' : body.mode === 'test' ? 'test' : 'dry_run'

  const { eligible, skippedNoEmail, counts } = await getEmployeesEligibleForBulkInvite()

  const sg = getSg()
  if (!sg) {
    return NextResponse.json(
      { error: 'Email is not configured (SENDGRID_API_KEY missing).' },
      { status: 503 },
    )
  }

  // ── DRY RUN (default): NO DB writes. Report the eligible set + send ONE
  // inert sample preview to the override. Fully repeatable. ──
  if (mode === 'dry_run') {
    let sampleSentTo: string | null = null
    let sampleError: string | null = null
    try {
      await sendPreviewSample(eligible[0] ?? null, sg)
      sampleSentTo = TEST_RECIPIENT
    } catch (err) {
      // A preview failure must not imply anything was created (nothing was).
      sampleError = err instanceof Error ? err.message : 'Failed to send preview.'
      console.error('[hr-bulk-invite] dry_run preview send failed:', err)
    }
    console.log(`[hr-bulk-invite] actor=${actor} mode=dry_run would_create=${counts.new} would_send=${counts.total} (no DB writes)`)
    return NextResponse.json({
      ok: true,
      mode: 'dry_run',
      total_eligible: counts.total,
      would_create: counts.new,        // 'new' → would be created
      would_send: counts.total,         // every eligible would be sent in real mode
      existing_open: counts.existingOpen,
      sample_sent_to: sampleSentTo,
      sample_error: sampleError,
      skipped_no_email: skippedNoEmail.length,
      // Full eligible breakdown (no records touched).
      eligible: eligible.map((e) => ({ employee_id: e.id, name: e.name, category: e.category })),
    })
  }

  // ── TEST / REAL: create-or-reuse + send. ──
  const isRealMode = mode === 'real'
  let testEmailSent = false // test mode sends exactly ONE representative email

  const perEmployee: PerEmployeeResult[] = await runWithConcurrency(
    eligible,
    5,
    async (emp: BulkInviteEligibleRow): Promise<PerEmployeeResult> => {
      try {
        // Resolve the onboarding to send for: REUSE an existing open one
        // (never create a duplicate), else CREATE a fresh one. The atomic
        // unique index still guarantees no double-create under a race.
        let onboardingId: number
        let wasExisting: boolean
        if (emp.category === 'existing_open' && emp.open_onboarding_id != null) {
          onboardingId = emp.open_onboarding_id
          wasExisting = true
        } else {
          const existing = await findActiveHrOnboarding({ hrEmployeeId: emp.id })
          if (existing) {
            // Race/stale-eligibility: an open one appeared — reuse it.
            onboardingId = existing.id
            wasExisting = true
          } else {
            const created = await createHrOnboardingForExisting({
              hr_employee_id: emp.id,
              created_by:     actor,
            })
            onboardingId = created.id
            wasExisting = false
          }
        }

        const firstName = emp.name.split(' ')[0] || ''
        const sentStatus = wasExisting ? 'sent_existing' as const : 'sent_created' as const

        if (isRealMode) {
          // ⚠️ REAL MODE (explicit): send to the employee's own work email.
          await sendInviteForOnboarding(onboardingId, emp.id, firstName, emp.email, sg)
          await markHrOnboardingInvited(onboardingId, null)
          return { employee_id: emp.id, name: emp.name, status: sentStatus, sent_to: emp.email }
        }

        // ⚠️ TEST MODE: send ONE representative email to the override.
        if (!testEmailSent) {
          testEmailSent = true
          await sendInviteForOnboarding(onboardingId, emp.id, firstName, TEST_RECIPIENT, sg)
          await markHrOnboardingInvited(onboardingId, TEST_RECIPIENT)
          return { employee_id: emp.id, name: emp.name, status: sentStatus, sent_to: TEST_RECIPIENT, detail: 'Representative test email.' }
        }
        // Onboarding created/exists, but no email sent (test mode, one already sent).
        return { employee_id: emp.id, name: emp.name, status: 'created_no_email', detail: wasExisting ? 'Existing onboarding (test mode — no email sent).' : 'Onboarding created (test mode — no email sent).' }
      } catch (err) {
        // Concurrent-race create: the atomic index rejected a 2nd open
        // onboarding. Reuse the winner + send (don't skip, don't fail).
        if (err instanceof HrOnboardingOpenConflictError) {
          try {
            const raced = await findActiveHrOnboarding({ hrEmployeeId: emp.id })
            if (raced) {
              const firstName = emp.name.split(' ')[0] || ''
              if (isRealMode) {
                await sendInviteForOnboarding(raced.id, emp.id, firstName, emp.email, sg)
                await markHrOnboardingInvited(raced.id, null)
                return { employee_id: emp.id, name: emp.name, status: 'sent_existing', sent_to: emp.email, detail: 'Reused after create race.' }
              }
              if (!testEmailSent) {
                testEmailSent = true
                await sendInviteForOnboarding(raced.id, emp.id, firstName, TEST_RECIPIENT, sg)
                await markHrOnboardingInvited(raced.id, TEST_RECIPIENT)
                return { employee_id: emp.id, name: emp.name, status: 'sent_existing', sent_to: TEST_RECIPIENT, detail: 'Reused after create race (representative).' }
              }
              return { employee_id: emp.id, name: emp.name, status: 'created_no_email', detail: 'Existing onboarding (race; test mode — no email sent).' }
            }
          } catch (inner) {
            console.error(`[hr-bulk-invite] employee ${emp.id} reuse-after-race failed:`, inner)
          }
        }
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

  const sentCreated  = results.filter((r) => r.status === 'sent_created').length
  const sentExisting = results.filter((r) => r.status === 'sent_existing').length
  const created      = results.filter((r) => r.status === 'created_no_email').length
  const skipped      = results.filter((r) => r.status === 'skipped').length
  const failed       = results.filter((r) => r.status === 'failed').length

  console.log(`[hr-bulk-invite] actor=${actor} mode=${mode} total=${results.length} sent_created=${sentCreated} sent_existing=${sentExisting} created_no_email=${created} skipped=${skipped} failed=${failed}`)

  return NextResponse.json({
    ok: true,
    mode,
    total: results.length,
    sent: sentCreated + sentExisting,
    sent_created: sentCreated,
    sent_existing: sentExisting,
    created_no_email: created,
    skipped,
    failed,
    test_recipient: isRealMode ? null : TEST_RECIPIENT,
    results,
  })
}
