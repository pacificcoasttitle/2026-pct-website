/**
 * HR department onboarding task email.
 *
 * Non-PII: name + department + token link only. The task list itself
 * lives behind the department token page.
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

export interface HrDepartmentKickoffEmailContext {
  subject:        string
  hire_name:      string
  department:     string
  department_url: string
}

export const HR_DEPARTMENT_KICKOFF_TEMPLATE = `
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
                New onboarding tasks
              </h1>
              <p style="margin:8px 0 0 0; color:${PCT_BRAND.textMuted}; font-size:15px; line-height:22px;">
                {{department}} checklist
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 0 40px;">
              <p style="margin:0 0 14px 0; color:${PCT_BRAND.textDark}; font-size:16px; line-height:25px;">
                HR has kicked off onboarding tasks for <strong>{{hire_name}}</strong>.
              </p>
              <p style="margin:0; color:${PCT_BRAND.textDark}; font-size:16px; line-height:25px;">
                Please open the secure checklist below to complete the {{department}} tasks for this new team member.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:30px 40px 8px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:${PCT_BRAND.orange}; border-radius:8px;">
                    <a href="{{{department_url}}}" target="_blank" style="display:inline-block; padding:15px 34px; color:${PCT_BRAND.white}; font-size:16px; font-weight:700; text-decoration:none;">
                      Open Department Checklist
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:12px 0 0 0; color:${PCT_BRAND.textMuted}; font-size:12px; line-height:18px; word-break:break-all;">
                {{{department_url}}}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 34px 40px;">
              <p style="margin:0; color:${PCT_BRAND.textMuted}; font-size:13px; line-height:20px;">
                Questions? Contact Pacific Coast Title HR at
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

export function renderHrDepartmentKickoffEmail(ctx: HrDepartmentKickoffEmailContext): string {
  const data: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(ctx)) {
    data[k] = v === null || v === undefined ? '' : v
  }
  return Mustache.render(HR_DEPARTMENT_KICKOFF_TEMPLATE, data)
}
