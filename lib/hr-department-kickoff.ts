/**
 * Server-only HR department kickoff orchestration.
 *
 * Sends one email per checklist category WITH items, skips empty categories,
 * records sent tracking, and keeps each send failure isolated.
 */
import sgMail from '@sendgrid/mail'
import {
  getHrDepartmentKickoffState,
  getHrOnboardingById,
  markHrDepartmentTokenSent,
  claimHrOnboardingIntroEmail,
  clearHrOnboardingIntroEmail,
  type HrDepartmentKickoffState,
  type HrOnboardingChecklistCategory,
} from '@/lib/admin-db'
import {
  issueDepartmentToken,
  type HrOnboardingDepartmentCategory,
} from '@/lib/hr-onboarding-token'
import { renderHrDepartmentKickoffEmail } from '@/lib/email-templates/hr-department-kickoff'
import { renderHrNewHireIntro } from '@/lib/email-templates/hr-new-hire-intro'

const SITE_BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pct.com').replace(/\/$/, '')
const TEST_FALLBACK_EMAIL = 'ghernandez@pct.com'

const CATEGORY_LABELS: Record<HrOnboardingChecklistCategory, string> = {
  administrative:     'Administrative',
  marketing:          'Marketing',
  'customer-service': 'Customer Service',
  it:                 'IT',
}

const CATEGORY_ENV: Record<HrOnboardingChecklistCategory, string> = {
  administrative:     'DEPT_ADMINISTRATIVE_EMAIL',
  marketing:          'DEPT_MARKETING_EMAIL',
  'customer-service': 'DEPT_CUSTOMER_SERVICE_EMAIL',
  it:                 'DEPT_IT_EMAIL',
}

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

export class HrDepartmentKickoffError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'HrDepartmentKickoffError'
    this.status = status
  }
}

export interface HrDepartmentKickoffSent {
  category:       HrOnboardingChecklistCategory
  department:     string
  sent_to:        string
  item_count:     number
  department_url: string
}

export interface HrDepartmentKickoffSkipped {
  category:   HrOnboardingChecklistCategory
  department: string
  reason:     string
}

export interface HrDepartmentKickoffFailed {
  category:   HrOnboardingChecklistCategory
  department: string
  sent_to:    string
  item_count: number
  error:      string
}

export interface HrDepartmentKickoffSummary {
  ok:       true
  behavior: 'reissued_tokens'
  sent:     HrDepartmentKickoffSent[]
  skipped:  HrDepartmentKickoffSkipped[]
  failed:   HrDepartmentKickoffFailed[]
  tracking: HrDepartmentKickoffState[]
  // New-hire intro email (system action). 'sent' this call, 'skipped' if
  // already sent on a prior kickoff, 'no_recipient' if no personal email,
  // or 'failed' if the send errored (non-blocking).
  intro_email: 'sent' | 'skipped' | 'no_recipient' | 'failed'
}

export interface DepartmentKickoffEmailPayload {
  to:             string
  subject:        string
  html:           string
  category:       HrOnboardingChecklistCategory
  department_url: string
}

export type DepartmentKickoffEmailSender = (payload: DepartmentKickoffEmailPayload) => Promise<void>

export function departmentRecipientForCategory(category: HrOnboardingChecklistCategory): string | null {
  const envName = CATEGORY_ENV[category]
  // TODO: Set real department recipients in production env. Testing fallback
  // is intentional for now; never send to an empty string.
  const configured = process.env[envName]?.trim()
  const resolved = configured || TEST_FALLBACK_EMAIL
  return resolved.trim() || null
}

async function sendViaSendGrid(payload: DepartmentKickoffEmailPayload): Promise<void> {
  const sg = getSg()
  if (!sg) throw new Error('SENDGRID_API_KEY not configured')
  await sg.send({
    to:      payload.to,
    from:    { email: 'hr@pct.com', name: 'Pacific Coast Title HR' },
    subject: payload.subject,
    html:    payload.html,
  })
}

function hireNameFromPayload(payload: Record<string, unknown>, fallback: string): string {
  const first = String(payload.first_name ?? '').trim()
  const last = String(payload.last_name ?? '').trim()
  return `${first} ${last}`.trim() || fallback
}

/**
 * Send the new-hire intro/welcome email ONCE, as a SYSTEM action (not a
 * department checklist item). Goes to the hire's PERSONAL email (the
 * onboarding's invited_email — their PCT email isn't live yet). Send-once
 * is enforced by claimHrOnboardingIntroEmail (atomic stamp of
 * intro_email_sent_at); a re-kickoff finds it already stamped and skips.
 * Fully non-blocking — any failure rolls the claim back + is swallowed so
 * kickoff succeeds regardless.
 */
async function sendNewHireIntroOnce(
  onboardingId: number,
  invitedEmail: string | null,
  firstName: string,
): Promise<HrDepartmentKickoffSummary['intro_email']> {
  const to = invitedEmail?.trim()
  if (!to) {
    console.warn(`[hr-intro-email] no personal email on onboarding_id=${onboardingId} — skipping intro`)
    return 'no_recipient'
  }

  // Atomic send-once claim. Not won → already sent on a prior kickoff.
  const won = await claimHrOnboardingIntroEmail(onboardingId)
  if (!won) return 'skipped'

  try {
    const sg = getSg()
    if (!sg) {
      // No mailer configured — roll back so a later kickoff can retry.
      await clearHrOnboardingIntroEmail(onboardingId).catch(() => {})
      console.warn('[hr-intro-email] SENDGRID_API_KEY not configured — skipping intro')
      return 'failed'
    }
    const subject = 'Welcome to Pacific Coast Title'
    const html = renderHrNewHireIntro({ subject, first_name: firstName })
    await sg.send({
      to,
      from:    { email: 'hr@pct.com', name: 'Pacific Coast Title HR' },
      subject,
      html,
    })
    console.log(`[hr-intro-email] sent onboarding_id=${onboardingId} to=${to}`)
    return 'sent'
  } catch (err) {
    await clearHrOnboardingIntroEmail(onboardingId).catch(() => {})
    console.error('[hr-intro-email] send failed (kickoff unaffected):',
      err instanceof Error ? err.message : err)
    return 'failed'
  }
}

export async function kickOffHrDepartments({
  onboardingId,
  actor,
  sendEmail = sendViaSendGrid,
}: {
  onboardingId: number
  actor:        string | null
  sendEmail?:   DepartmentKickoffEmailSender
}): Promise<HrDepartmentKickoffSummary> {
  const onboarding = await getHrOnboardingById(onboardingId)
  if (!onboarding) throw new HrDepartmentKickoffError('Onboarding record not found.', 404)
  if (!['submitted', 'finalized'].includes(onboarding.status)) {
    throw new HrDepartmentKickoffError(
      `Departments can only be kicked off for submitted or finalized onboardings (current status: ${onboarding.status}).`,
      onboarding.status === 'cancelled' ? 409 : 400,
    )
  }

  const payload = (onboarding.payload ?? {}) as Record<string, unknown>
  const hireName = hireNameFromPayload(payload, `Onboarding #${onboarding.id}`)
  const firstName = String(payload.first_name ?? '').trim()
  const state = await getHrDepartmentKickoffState(onboardingId)
  const sent: HrDepartmentKickoffSent[] = []
  const skipped: HrDepartmentKickoffSkipped[] = []
  const failed: HrDepartmentKickoffFailed[] = []

  for (const row of state) {
    const department = CATEGORY_LABELS[row.category]
    if (row.item_count <= 0) {
      skipped.push({ category: row.category, department, reason: 'No checklist items for this department.' })
      continue
    }

    const to = departmentRecipientForCategory(row.category)
    if (!to) {
      console.warn(`[hr-dept-kickoff] no recipient resolved category=${row.category} onboarding_id=${onboardingId}`)
      skipped.push({ category: row.category, department, reason: 'No recipient configured.' })
      continue
    }

    // Re-issue every kickoff. The new stored hash invalidates the old link
    // for this department/category, keeping re-sends fresh and revocable.
    const token = await issueDepartmentToken(onboardingId, row.category as HrOnboardingDepartmentCategory)
    if (!token) {
      failed.push({ category: row.category, department, sent_to: to, item_count: row.item_count, error: 'Failed to issue department token.' })
      continue
    }

    const departmentUrl = `${SITE_BASE}/hr-onboarding/department/${token}`
    const subject = `New onboarding tasks for ${department} — ${hireName}`
    const html = renderHrDepartmentKickoffEmail({
      subject,
      hire_name:      hireName,
      department,
      department_url: departmentUrl,
    })

    try {
      await sendEmail({
        to,
        subject,
        html,
        category: row.category,
        department_url: departmentUrl,
      })
      await markHrDepartmentTokenSent(onboardingId, row.category, to, actor)
      sent.push({ category: row.category, department, sent_to: to, item_count: row.item_count, department_url: departmentUrl })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[hr-dept-kickoff] send failed onboarding_id=${onboardingId} category=${row.category}:`, message)
      failed.push({ category: row.category, department, sent_to: to, item_count: row.item_count, error: message })
    }
  }

  // System action: new-hire intro email to the personal email, sent once.
  // Independent of the department fan-out (non-blocking either way).
  const introEmail = await sendNewHireIntroOnce(onboardingId, onboarding.invited_email, firstName)

  return {
    ok: true,
    behavior: 'reissued_tokens',
    sent,
    skipped,
    failed,
    tracking: await getHrDepartmentKickoffState(onboardingId),
    intro_email: introEmail,
  }
}
