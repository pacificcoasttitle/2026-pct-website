/**
 * New-hire intro/welcome email, sent on department kickoff.
 *
 * Non-PII: the hire's first name only, a warm welcome + what to expect.
 * No links to token pages, no personal data.
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
} as const

export interface HrNewHireIntroContext {
  subject:    string
  first_name: string
}

export const HR_NEW_HIRE_INTRO_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
</head>
<body style="margin:0; padding:0; background-color:${PCT_BRAND.warmNeutral}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${PCT_BRAND.warmNeutral};">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px; background-color:${PCT_BRAND.white}; border-radius:10px; overflow:hidden; border:1px solid #ded7cc;">
          <tr>
            <td align="center" style="padding:34px 32px 8px 32px;">
              <img src="https://www.pct.com/logo2-dark.png" width="160" alt="Pacific Coast Title" style="display:block; width:160px; max-width:160px; height:auto;">
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 0 40px;">
              <div style="width:48px; height:3px; background-color:${PCT_BRAND.orange}; border-radius:2px;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 0 40px;">
              <h1 style="margin:0; color:${PCT_BRAND.navy}; font-size:26px; line-height:32px; font-weight:700;">
                Welcome to Pacific Coast Title{{#first_name}}, {{first_name}}{{/first_name}}!
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:22px 40px 0 40px;">
              <p style="margin:0 0 14px 0; color:${PCT_BRAND.textDark}; font-size:16px; line-height:25px;">
                We're excited to have you joining the team. Behind the scenes, our
                departments are already getting everything ready for your first day.
              </p>
              <p style="margin:0 0 14px 0; color:${PCT_BRAND.textDark}; font-size:16px; line-height:25px;">
                Here's what to expect: our Administrative, Marketing, and Customer
                Service teams are preparing your accounts, workspace, and materials so
                you can hit the ground running. If we need anything else from you, HR
                will reach out directly.
              </p>
              <p style="margin:0; color:${PCT_BRAND.textDark}; font-size:16px; line-height:25px;">
                Welcome aboard — we're looking forward to working with you.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 34px 40px;">
              <p style="margin:0; color:${PCT_BRAND.textMuted}; font-size:13px; line-height:20px;">
                Questions? Reach Pacific Coast Title HR at
                <a href="mailto:hr@pct.com" style="color:${PCT_BRAND.navy}; text-decoration:underline;">hr@pct.com</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim()

export function renderHrNewHireIntro(ctx: HrNewHireIntroContext): string {
  const data: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(ctx)) {
    data[k] = v === null || v === undefined ? '' : v
  }
  return Mustache.render(HR_NEW_HIRE_INTRO_TEMPLATE, data)
}
