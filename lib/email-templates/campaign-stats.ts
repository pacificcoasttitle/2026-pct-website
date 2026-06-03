/**
 * Per-rep campaign stats email template.
 *
 * Sent manually from a sent batch's detail view — each rep receives
 * THEIR OWN campaign's Mailchimp performance (opens, unique opens, open
 * rate, clicks, click rate, bounces, unsubscribes), framed as a living
 * "stats as of {today}" snapshot since the numbers keep accruing for a
 * few days after send.
 *
 * Rendered by renderCampaignStats(context) and sent via SendGrid by
 * app/api/admin/marketing/campaigns/[batchId]/send-stats/route.ts.
 *
 * Reuses the PCT brand shell + the marketing-recap "By The Numbers" 2×N
 * metric-grid markup (tables-for-layout, inline styles, hex colors) so
 * it renders consistently in Outlook/Gmail/Apple Mail.
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

/** Shape the render context consumes. All display formatting (rates as
 *  %, dates as labels) is done by the caller so the template stays a
 *  dumb renderer. */
export interface CampaignStatsContext {
  subject:        string   // email subject + <title>
  rep_first_name: string
  campaign_name:  string
  sent_date_label: string  // e.g. "Wed, May 27"
  as_of_label:    string   // e.g. "June 3, 2026"
  // Stat block (pre-formatted strings)
  opens_total:    string
  unique_opens:   string
  open_rate:      string   // "42.3%"
  clicks_total:   string
  click_rate:     string   // "8.1%"
  bounces:        string
  unsubscribes:   string
}

export const CAMPAIGN_STATS_TEMPLATE = `
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
                Your Campaign Results
              </div>
              <div style="color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 4px;">
                Sent {{sent_date_label}}
              </div>
            </td>
          </tr>

          <!-- ───── INTRO (rep-benefit) ───── -->
          <tr>
            <td style="padding: 28px 32px 8px 32px;">
              <p style="margin: 0 0 10px 0; color: ${PCT_BRAND.textDark}; font-size: 15px; line-height: 1.6;">
                Hi {{rep_first_name}}, here's how your campaign
                <strong>&ldquo;{{campaign_name}}&rdquo;</strong> performed with your clients.
              </p>
              <p style="margin: 0; color: ${PCT_BRAND.textMuted}; font-size: 13px; line-height: 1.6;">
                Email stats keep updating for a few days after send — here's where things stand as of <strong>{{as_of_label}}</strong>.
              </p>
            </td>
          </tr>

          <!-- ───── STAT BLOCK (2×N grid, By-The-Numbers donor markup) ───── -->
          <tr>
            <td style="padding: 16px 32px 8px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="50%" style="padding: 0 6px 12px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${PCT_BRAND.warmNeutral}; border-radius: 6px;">
                      <tr><td style="padding: 14px 16px;">
                        <div style="color: ${PCT_BRAND.navy}; font-size: 24px; font-weight: 700; line-height: 1;">{{open_rate}}</div>
                        <div style="color: ${PCT_BRAND.textMuted}; font-size: 12px; margin-top: 4px;">Open rate</div>
                      </td></tr>
                    </table>
                  </td>
                  <td width="50%" style="padding: 0 0 12px 6px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${PCT_BRAND.warmNeutral}; border-radius: 6px;">
                      <tr><td style="padding: 14px 16px;">
                        <div style="color: ${PCT_BRAND.navy}; font-size: 24px; font-weight: 700; line-height: 1;">{{click_rate}}</div>
                        <div style="color: ${PCT_BRAND.textMuted}; font-size: 12px; margin-top: 4px;">Click rate</div>
                      </td></tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding: 0 6px 12px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${PCT_BRAND.warmNeutral}; border-radius: 6px;">
                      <tr><td style="padding: 14px 16px;">
                        <div style="color: ${PCT_BRAND.navy}; font-size: 24px; font-weight: 700; line-height: 1;">{{opens_total}}</div>
                        <div style="color: ${PCT_BRAND.textMuted}; font-size: 12px; margin-top: 4px;">Total opens</div>
                      </td></tr>
                    </table>
                  </td>
                  <td width="50%" style="padding: 0 0 12px 6px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${PCT_BRAND.warmNeutral}; border-radius: 6px;">
                      <tr><td style="padding: 14px 16px;">
                        <div style="color: ${PCT_BRAND.navy}; font-size: 24px; font-weight: 700; line-height: 1;">{{unique_opens}}</div>
                        <div style="color: ${PCT_BRAND.textMuted}; font-size: 12px; margin-top: 4px;">Unique opens</div>
                      </td></tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td width="50%" style="padding: 0 6px 12px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${PCT_BRAND.warmNeutral}; border-radius: 6px;">
                      <tr><td style="padding: 14px 16px;">
                        <div style="color: ${PCT_BRAND.navy}; font-size: 24px; font-weight: 700; line-height: 1;">{{clicks_total}}</div>
                        <div style="color: ${PCT_BRAND.textMuted}; font-size: 12px; margin-top: 4px;">Total clicks</div>
                      </td></tr>
                    </table>
                  </td>
                  <td width="50%" style="padding: 0 0 12px 6px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${PCT_BRAND.warmNeutral}; border-radius: 6px;">
                      <tr><td style="padding: 14px 16px;">
                        <div style="color: ${PCT_BRAND.navy}; font-size: 24px; font-weight: 700; line-height: 1;">{{unsubscribes}}</div>
                        <div style="color: ${PCT_BRAND.textMuted}; font-size: 12px; margin-top: 4px;">Unsubscribes</div>
                      </td></tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${PCT_BRAND.warmNeutral}; border-radius: 6px;">
                      <tr><td style="padding: 14px 16px;">
                        <div style="color: ${PCT_BRAND.navy}; font-size: 24px; font-weight: 700; line-height: 1;">{{bounces}}</div>
                        <div style="color: ${PCT_BRAND.textMuted}; font-size: 12px; margin-top: 4px;">Bounces</div>
                      </td></tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ───── As-of note ───── -->
          <tr>
            <td style="padding: 4px 32px 24px 32px;">
              <div style="border-left: 3px solid ${PCT_BRAND.orange}; background-color: ${PCT_BRAND.warmNeutral}; border-radius: 4px; padding: 12px 16px; color: ${PCT_BRAND.textMuted}; font-size: 12px; line-height: 1.5;">
                These are an early snapshot as of <strong>{{as_of_label}}</strong>, not final numbers — opens and clicks typically keep climbing for several days after send.
              </div>
            </td>
          </tr>

          <!-- ───── FOOTER ───── -->
          <tr>
            <td style="background-color: ${PCT_BRAND.warmNeutral}; padding: 20px 32px; text-align: center;">
              <div style="color: ${PCT_BRAND.textMuted}; font-size: 12px; line-height: 1.6;">
                Pacific Coast Title Company &nbsp;·&nbsp; Marketing Department<br>
                Questions: marketing@pct.com
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

/** Renderer wrapper — parallels the other render* helpers. Normalizes
 *  null/undefined fields to '' so nothing leaks into the HTML. */
export function renderCampaignStats(ctx: CampaignStatsContext): string {
  const data: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(ctx)) {
    data[k] = v === null || v === undefined ? '' : v
  }
  return Mustache.render(CAMPAIGN_STATS_TEMPLATE, data)
}
