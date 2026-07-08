/**
 * HR onboarding SUBMITTED notification email.
 *
 * Sent to HR (internal) when an employee submits their onboarding packet
 * — the keystone markHrOnboardingSubmitted previously fired silently.
 *
 * ⚠️ NON-PII: this is an internal "go review" nudge. The body carries
 * ONLY a non-sensitive summary (name, when, new-vs-existing, a link to the
 * gated HR review page). It NEVER includes SSN/DOB/bank/document contents
 * — the reviewer opens the authenticated HR page for the actual details.
 *
 * Same brand shell as the invite (navy header, warm-neutral footer,
 * tables-for-layout, inline hex colors only).
 */
import Mustache from 'mustache'

const PCT_BRAND = {
  navy:        '#03374f',
  orange:      '#f26b2b',
  warmNeutral: '#f0ede9',
  white:       '#ffffff',
  textDark:    '#1f2937',
  textMuted:   '#6b7280',
} as const

export interface HrOnboardingSubmittedNotifyContext {
  subject:        string
  employee_name:  string
  submitted_when: string   // human-readable timestamp
  review_url:     string   // /admin/team/hr/onboarding/[id]
  hire_type:      string   // "New" | "Existing Employee" (from is_new_hire)
}

export const HR_ONBOARDING_SUBMITTED_NOTIFY_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${PCT_BRAND.warmNeutral}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${PCT_BRAND.warmNeutral};">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: ${PCT_BRAND.white}; border-radius: 8px; overflow: hidden;">

          <!-- HEADER -->
          <tr>
            <td style="background-color: ${PCT_BRAND.navy}; padding: 28px 32px; text-align: center;">
              <img src="https://www.pct.com/logo2.png" alt="Pacific Coast Title Company" width="180" style="display: block; margin: 0 auto 12px;">
              <div style="color: ${PCT_BRAND.white}; font-size: 22px; font-weight: 600; letter-spacing: 0.3px;">
                Onboarding Submitted
              </div>
              <div style="color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 4px;">
                Ready for HR review
              </div>
            </td>
          </tr>

          <!-- SUMMARY -->
          <tr>
            <td style="padding: 28px 32px 8px 32px;">
              <p style="margin: 0 0 12px 0; color: ${PCT_BRAND.textDark}; font-size: 15px; line-height: 1.6;">
                <strong>{{employee_name}}</strong> has submitted their onboarding packet.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 8px 0 4px 0;">
                <tr>
                  <td style="padding: 4px 0; color: ${PCT_BRAND.textMuted}; font-size: 14px; width: 120px;">Submitted</td>
                  <td style="padding: 4px 0; color: ${PCT_BRAND.textDark}; font-size: 14px;">{{submitted_when}}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: ${PCT_BRAND.textMuted}; font-size: 14px;">Type</td>
                  <td style="padding: 4px 0; color: ${PCT_BRAND.textDark}; font-size: 14px;">{{hire_type}}</td>
                </tr>
              </table>
              <p style="margin: 12px 0 0 0; color: ${PCT_BRAND.textDark}; font-size: 15px; line-height: 1.6;">
                Please review their information and finalize when ready.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 20px 32px 28px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: ${PCT_BRAND.orange}; border-radius: 8px;">
                    <a href="{{{review_url}}}" target="_blank" style="display: inline-block; padding: 14px 32px; color: ${PCT_BRAND.white}; font-size: 16px; font-weight: 700; text-decoration: none; letter-spacing: 0.3px;">
                      Review Onboarding &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 12px 0 0 0; color: ${PCT_BRAND.textMuted}; font-size: 12px; line-height: 1.5;">
                {{{review_url}}}
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: ${PCT_BRAND.warmNeutral}; padding: 20px 32px; text-align: center;">
              <div style="color: ${PCT_BRAND.textMuted}; font-size: 12px; line-height: 1.6;">
                Pacific Coast Title Company &nbsp;·&nbsp; Human Resources<br>
                This is an internal notification — details are on the secure HR review page.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim()

export function renderHrOnboardingSubmittedNotify(
  ctx: HrOnboardingSubmittedNotifyContext,
): string {
  const data: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(ctx)) {
    data[k] = v === null || v === undefined ? '' : v
  }
  return Mustache.render(HR_ONBOARDING_SUBMITTED_NOTIFY_TEMPLATE, data)
}
