/**
 * HR "a department finished all its onboarding tasks" notification.
 *
 * Non-PII: hire name + department + a link to the gated HR review page
 * only. No task detail beyond the completed count, no payload/docs.
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

export interface HrDepartmentCompleteNotifyContext {
  subject:     string
  hire_name:   string
  department:  string
  item_count:  number
  review_url:  string
  note?:       string | null   // optional dept-authored note (not hire PII)
}

export const HR_DEPARTMENT_COMPLETE_NOTIFY_TEMPLATE = `
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
              <h1 style="margin:0; color:${PCT_BRAND.navy}; font-size:24px; line-height:31px; font-weight:700;">
                {{department}} finished onboarding tasks
              </h1>
              <p style="margin:8px 0 0 0; color:${PCT_BRAND.textMuted}; font-size:15px; line-height:22px;">
                for {{hire_name}}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 0 40px;">
              <p style="margin:0; color:${PCT_BRAND.textDark}; font-size:16px; line-height:25px;">
                The <strong>{{department}}</strong> team has completed all {{item_count}} onboarding
                {{#one}}task{{/one}}{{^one}}tasks{{/one}} for <strong>{{hire_name}}</strong>.
              </p>
            </td>
          </tr>
          {{#note}}
          <tr>
            <td style="padding:18px 40px 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${PCT_BRAND.warmNeutral}; border-radius:8px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <div style="color:${PCT_BRAND.textMuted}; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; margin-bottom:6px;">Note from {{department}}</div>
                    <div style="color:${PCT_BRAND.textDark}; font-size:14px; line-height:21px; white-space:pre-wrap;">{{note}}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          {{/note}}
          <tr>
            <td align="center" style="padding:30px 40px 8px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:${PCT_BRAND.orange}; border-radius:8px;">
                    <a href="{{{review_url}}}" target="_blank" style="display:inline-block; padding:15px 34px; color:${PCT_BRAND.white}; font-size:16px; font-weight:700; text-decoration:none;">
                      Review Onboarding
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 34px 40px;">
              <p style="margin:0; color:${PCT_BRAND.textMuted}; font-size:13px; line-height:20px;">
                This is an automated notification from Pacific Coast Title HR onboarding.
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

export function renderHrDepartmentCompleteNotify(ctx: HrDepartmentCompleteNotifyContext): string {
  const data: Record<string, unknown> = { one: ctx.item_count === 1 }
  for (const [k, v] of Object.entries(ctx)) {
    data[k] = v === null || v === undefined ? '' : v
  }
  return Mustache.render(HR_DEPARTMENT_COMPLETE_NOTIFY_TEMPLATE, data)
}
