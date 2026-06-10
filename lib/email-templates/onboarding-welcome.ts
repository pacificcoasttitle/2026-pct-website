/**
 * Rep onboarding welcome email template (Phase 2e).
 *
 * Admin-triggered: delivers the rep their token-gated /onboarding/{token}
 * link. Rendered by renderOnboardingWelcome(context) and sent via
 * SendGrid by app/api/admin/onboarding/[repId]/send-welcome/route.ts.
 *
 * Reuses the PCT brand shell (navy header, warm-neutral footer) used by
 * campaign-stats / rep-week-ahead — tables-for-layout, inline styles,
 * hex colors only for Outlook/Gmail/Apple Mail.
 *
 * Brand: PCT navy #03374f, orange #f26b2b only.
 */
import Mustache from 'mustache'

const PCT_BRAND = {
  navy:        '#03374f',
  orange:      '#f26b2b',
  warmNeutral: '#f0ede9',
  white:       '#ffffff',
  textDark:    '#1f2937',
  textMuted:   '#6b7280',
  border:      '#e5e7eb',
} as const

export interface OnboardingWelcomeContext {
  subject:          string
  rep_first_name:   string
  onboarding_url:   string
  expiry_label:     string   // e.g. "14 days"
}

export const ONBOARDING_WELCOME_TEMPLATE = `
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

          <!-- ───── HEADER (navy) ───── -->
          <tr>
            <td style="background-color: ${PCT_BRAND.navy}; padding: 28px 32px; text-align: center;">
              <img src="https://www.pct.com/logo2.png" alt="Pacific Coast Title Company" width="180" style="display: block; margin: 0 auto 12px;">
              <div style="color: ${PCT_BRAND.white}; font-size: 22px; font-weight: 600; letter-spacing: 0.3px;">
                Welcome to the Team
              </div>
              <div style="color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 4px;">
                Pacific Coast Title Company
              </div>
            </td>
          </tr>

          <!-- ───── GREETING + INTRO ───── -->
          <tr>
            <td style="padding: 28px 32px 8px 32px;">
              <p style="margin: 0 0 12px 0; color: ${PCT_BRAND.textDark}; font-size: 16px; line-height: 1.6;">
                Hi {{rep_first_name}},
              </p>
              <p style="margin: 0 0 12px 0; color: ${PCT_BRAND.textDark}; font-size: 15px; line-height: 1.6;">
                Welcome to Pacific Coast Title! We're excited to have you on the team.
                Before your first day, we need a few things from you so we can get your
                marketing materials and profile set up.
              </p>
              <p style="margin: 0; color: ${PCT_BRAND.textDark}; font-size: 15px; line-height: 1.6;">
                Use your personal onboarding link below to verify your contact info and
                upload your headshot, bio, and client list. It only takes a few minutes.
              </p>
            </td>
          </tr>

          <!-- ───── WHAT TO EXPECT ───── -->
          <tr>
            <td style="padding: 16px 32px 8px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: ${PCT_BRAND.navy}; color: ${PCT_BRAND.white}; padding: 6px 14px; border-radius: 999px; font-size: 11px; font-weight: 600; letter-spacing: 0.6px; text-transform: uppercase;">
                    What to Expect
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 32px 8px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${PCT_BRAND.warmNeutral}; border-radius: 6px;">
                <tr>
                  <td style="padding: 16px 20px; color: ${PCT_BRAND.textDark}; font-size: 14px; line-height: 1.7;">
                    <strong style="color: ${PCT_BRAND.navy};">1.</strong> Verify your contact information<br>
                    <strong style="color: ${PCT_BRAND.navy};">2.</strong> Upload your professional headshot<br>
                    <strong style="color: ${PCT_BRAND.navy};">3.</strong> Add your bio<br>
                    <strong style="color: ${PCT_BRAND.navy};">4.</strong> Upload your client list
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ───── CTA BUTTON ───── -->
          <tr>
            <td align="center" style="padding: 24px 32px 8px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: ${PCT_BRAND.orange}; border-radius: 8px;">
                    <a href="{{onboarding_url}}" target="_blank" style="display: inline-block; padding: 14px 32px; color: ${PCT_BRAND.white}; font-size: 16px; font-weight: 700; text-decoration: none; letter-spacing: 0.3px;">
                      Get Started &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ───── LINK FALLBACK + EXPIRY ───── -->
          <tr>
            <td style="padding: 8px 32px 24px 32px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: ${PCT_BRAND.textMuted}; font-size: 12px; line-height: 1.6;">
                Or copy and paste this link into your browser:<br>
                <a href="{{onboarding_url}}" style="color: ${PCT_BRAND.orange}; text-decoration: none;">{{onboarding_url}}</a>
              </p>
              <p style="margin: 0; color: ${PCT_BRAND.textMuted}; font-size: 12px; line-height: 1.5;">
                This link is valid for {{expiry_label}}. If it expires, ask your manager to send a new one.
              </p>
            </td>
          </tr>

          <!-- ───── FOOTER ───── -->
          <tr>
            <td style="background-color: ${PCT_BRAND.warmNeutral}; padding: 20px 32px; text-align: center;">
              <div style="color: ${PCT_BRAND.textMuted}; font-size: 12px; line-height: 1.6;">
                Pacific Coast Title Company &nbsp;·&nbsp; Marketing Department<br>
                Questions: <a href="mailto:marketing@pct.com" style="color: ${PCT_BRAND.orange}; text-decoration: none;">marketing@pct.com</a>
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

export function renderOnboardingWelcome(ctx: OnboardingWelcomeContext): string {
  const data: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(ctx)) {
    data[k] = v === null || v === undefined ? '' : v
  }
  return Mustache.render(ONBOARDING_WELCOME_TEMPLATE, data)
}
