/**
 * Server-only: notify HR ONCE when a department completes all its tasks.
 *
 * Non-blocking + notify-once. The caller (the dept complete route) invokes
 * this after a completion that makes the department all-done. The
 * once-ness is guarded by claimHrDepartmentCompletedNotification (atomic
 * stamp of completed_notified_at); a send failure rolls the claim back so
 * a later completion can retry, and never breaks the completion itself.
 */
import sgMail from '@sendgrid/mail'
import {
  claimHrDepartmentCompletedNotification,
  clearHrDepartmentCompletedNotification,
  getHrDepartmentCategoryProgress,
  getHrOnboardingById,
  type HrOnboardingChecklistCategory,
} from '@/lib/admin-db'
import { renderHrDepartmentCompleteNotify } from '@/lib/email-templates/hr-department-complete-notify'

const SITE_BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pct.com').replace(/\/$/, '')

// Same recipient pattern as the submit notification (one-line swap to
// hr@pct.com later once verified).
const ONBOARDING_NOTIFY_EMAIL =
  process.env.HR_ONBOARDING_NOTIFY_EMAIL || 'ghernandez@pct.com'

const CATEGORY_LABELS: Record<HrOnboardingChecklistCategory, string> = {
  administrative:     'Administrative',
  marketing:          'Marketing',
  'customer-service': 'Customer Service',
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

function hireName(payload: Record<string, unknown>, fallback: string): string {
  const first = String(payload.first_name ?? '').trim()
  const last = String(payload.last_name ?? '').trim()
  return `${first} ${last}`.trim() || fallback
}

/**
 * If the given department is now all-complete AND HR hasn't been notified
 * yet, claim the notification and send the HR email. Fully non-blocking:
 * all errors are caught + logged; the department completion is unaffected.
 * Returns true only when an email was actually sent by this call.
 */
export async function maybeNotifyDepartmentComplete(
  onboardingId: number,
  category: HrOnboardingChecklistCategory,
): Promise<boolean> {
  try {
    const progress = await getHrDepartmentCategoryProgress(onboardingId, category)
    if (!progress.allDone) return false

    // Atomic notify-once claim. If we don't win it, HR was already told —
    // toggling items back and forth will never re-notify.
    const won = await claimHrDepartmentCompletedNotification(onboardingId, category)
    if (!won) return false

    try {
      const onboarding = await getHrOnboardingById(onboardingId)
      const payload = (onboarding?.payload ?? {}) as Record<string, unknown>
      const name = hireName(payload, `Onboarding #${onboardingId}`)
      const department = CATEGORY_LABELS[category] ?? category
      const reviewUrl = `${SITE_BASE}/admin/team/hr/onboarding/${onboardingId}`
      const subject = `${department} completed onboarding tasks: ${name}`

      const sg = getSg()
      if (!sg) {
        // No mailer configured — roll the claim back so a later completion
        // can retry (matches the intro-email path). No email was sent, so
        // we must NOT keep the stamp (it would permanently suppress retry).
        await clearHrDepartmentCompletedNotification(onboardingId, category).catch(() => {})
        console.warn('[hr-dept-complete-notify] SENDGRID_API_KEY not configured — rolled back stamp (retryable)')
        return false
      }

      const html = renderHrDepartmentCompleteNotify({
        subject,
        hire_name:  name,
        department,
        item_count: progress.total,
        review_url: reviewUrl,
      })

      await sg.send({
        to:      ONBOARDING_NOTIFY_EMAIL,
        from:    { email: 'hr@pct.com', name: 'Pacific Coast Title HR' },
        subject,
        html,
      })
      console.log(`[hr-dept-complete-notify] sent onboarding_id=${onboardingId} category=${category} to=${ONBOARDING_NOTIFY_EMAIL}`)
      return true
    } catch (sendErr) {
      // Roll the claim back so a later completion can retry the notify.
      await clearHrDepartmentCompletedNotification(onboardingId, category).catch(() => {})
      console.error('[hr-dept-complete-notify] send failed (completion unaffected):',
        sendErr instanceof Error ? sendErr.message : sendErr)
      return false
    }
  } catch (err) {
    console.error('[hr-dept-complete-notify] failed (completion unaffected):',
      err instanceof Error ? err.message : err)
    return false
  }
}
