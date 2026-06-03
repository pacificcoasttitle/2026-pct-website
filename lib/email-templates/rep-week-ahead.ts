/**
 * Rep "Week Ahead" email template (forward-only)
 *
 * Canonical source for the weekly rep-facing "What's Coming This Week"
 * email. Rendered at draft-generation time (the Monday cron's additive
 * rep step) by calling renderRepWeekAhead(REP_WEEK_AHEAD_TEMPLATE, ctx)
 * and persisted to marketing_rep_recap_drafts.html_content.
 *
 * This is a SEPARATE template from the manager recap
 * (lib/email-templates/marketing-recap.ts). It reuses that template's
 * brand shell + the "Coming This Week" upcoming-items card markup, but
 * is FORWARD-ONLY: it drops "Sent Last Week" and "By The Numbers"
 * (those are manager/backward-looking).
 *
 * AUDIENCE: the active-rep roster (getPreviewRecipientReps). Org-wide
 * content — the calendar has no rep association, so every rep sees the
 * same "what marketing is putting out this week".
 *
 * CONTRACT: consumes types/marketing-recap.ts MarketingRecapContext
 * (reuses the forward-looking fields: upcoming_items, has_upcoming_items,
 * next_week_start/end). The render wrapper derives a forward-facing
 * subject + week-ahead label from the context's next-week dates.
 *
 * OUTLOOK-SAFE: tables for layout, inline styles only, role=
 * "presentation" layout tables, 600px max width, web-safe fonts, hex
 * colors only, no flexbox/grid, no <style> blocks, no web fonts.
 */
import Mustache from 'mustache'
import type { MarketingRecapContext } from '@/types/marketing-recap'

// ───── PCT brand palette (matches marketing-recap.ts) ─────
const PCT_BRAND = {
  navy:        '#03374f',
  orange:      '#f26b2b',
  warmNeutral: '#f0ede9',
  white:       '#ffffff',
  textDark:    '#1f2937',
  textMuted:   '#6b7280',
  border:      '#e5e7eb',
  shipped:     '#2e7d32',
} as const

// ───── HTML template (forward-only) ─────
export const REP_WEEK_AHEAD_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${PCT_BRAND.warmNeutral}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <!-- Email shell -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${PCT_BRAND.warmNeutral};">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: ${PCT_BRAND.white}; border-radius: 8px; overflow: hidden;">

          <!-- ───── HEADER (navy) ───── -->
          <tr>
            <td style="background-color: ${PCT_BRAND.navy}; padding: 28px 32px; text-align: center;">
              <img src="https://www.pct.com/logo2.png" alt="Pacific Coast Title Company" width="180" style="display: block; margin: 0 auto 12px;">
              <div style="color: ${PCT_BRAND.white}; font-size: 22px; font-weight: 600; letter-spacing: 0.3px;">
                Your Week Ahead
              </div>
              <div style="color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 4px;">
                {{week_ahead_label}}
              </div>
            </td>
          </tr>

          <!-- ───── INTRO (rep-facing, "no surprises") ───── -->
          <tr>
            <td style="padding: 28px 32px 8px 32px;">
              <p style="margin: 0; color: ${PCT_BRAND.textDark}; font-size: 15px; line-height: 1.6;">
                Here's what's coming from marketing this week &mdash; so you're never caught off guard. Know what's landing in your clients' inboxes and feeds before it does, and you'll always have an answer ready.
              </p>
            </td>
          </tr>

          <!-- ───── SECTION: COMING THIS WEEK ───── -->
          <tr>
            <td style="padding: 24px 32px 8px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: ${PCT_BRAND.navy}; color: ${PCT_BRAND.white}; padding: 6px 14px; border-radius: 999px; font-size: 11px; font-weight: 600; letter-spacing: 0.6px; text-transform: uppercase;">
                    Coming This Week
                  </td>
                </tr>
              </table>
              <div style="color: ${PCT_BRAND.textMuted}; font-size: 13px; margin-top: 6px;">
                {{next_week_start}} to {{next_week_end}}
              </div>
            </td>
          </tr>

          {{#has_upcoming_items}}
          <tr>
            <td style="padding: 16px 32px 8px 32px;">
              {{#upcoming_items}}
              <!-- Upcoming item -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-left: 3px solid ${PCT_BRAND.orange}; background-color: ${PCT_BRAND.warmNeutral}; border-radius: 4px; margin-bottom: 10px;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="color: ${PCT_BRAND.textDark}; font-size: 14px; font-weight: 600;">
                          {{title}}{{#is_shipped}}<span style="color: ${PCT_BRAND.shipped}; font-weight: 600; font-size: 11px; margin-left: 6px;">[Shipped]</span>{{/is_shipped}}
                        </td>
                        <td align="right" style="white-space: nowrap;">
                          <span style="display: inline-block; background-color: ${PCT_BRAND.white}; color: ${PCT_BRAND.navy}; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; border: 1px solid ${PCT_BRAND.border};">
                            {{lane_label}}
                          </span>
                        </td>
                      </tr>
                    </table>
                    <div style="color: ${PCT_BRAND.textMuted}; font-size: 12px; margin-top: 4px;">
                      {{scheduled_date_label}}
                      {{#has_asset_count}}
                      &nbsp;·&nbsp; {{asset_count_planned}} assets planned
                      {{/has_asset_count}}
                    </div>
                    {{#description}}
                    <div style="color: ${PCT_BRAND.textDark}; font-size: 13px; line-height: 1.5; margin-top: 6px;">
                      {{description}}
                    </div>
                    {{/description}}
                  </td>
                </tr>
              </table>
              {{/upcoming_items}}
            </td>
          </tr>
          {{/has_upcoming_items}}

          {{^has_upcoming_items}}
          <tr>
            <td style="padding: 16px 32px;">
              <div style="background-color: ${PCT_BRAND.warmNeutral}; border-radius: 6px; padding: 18px; text-align: center; color: ${PCT_BRAND.textMuted}; font-size: 13px;">
                No scheduled items this week. Nothing new is going out &mdash; reach out to marketing anytime if you need something.
              </div>
            </td>
          </tr>
          {{/has_upcoming_items}}

          <!-- ───── FOOTER ───── -->
          <tr>
            <td style="background-color: ${PCT_BRAND.warmNeutral}; padding: 20px 32px; text-align: center;">
              <div style="color: ${PCT_BRAND.textMuted}; font-size: 12px; line-height: 1.6;">
                Pacific Coast Title Company &nbsp;·&nbsp; Marketing Department<br>
                Sent weekly to the sales team &nbsp;·&nbsp; Questions: marketing@pct.com
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

// ───── Forward-facing label / subject helpers ─────
//
// The MarketingRecapContext carries week_range_label for the PRIOR week
// (the manager email's anchor). The rep email is forward-looking, so we
// derive a NEXT-week range label from next_week_start/next_week_end.
// Component-wise parse avoids UTC drift on bare YYYY-MM-DD strings.

function formatWeekAheadRange(startISO: string, endISO: string): string {
  if (!startISO || !endISO) return ''
  const [sy, sm, sd] = startISO.split('-').map(Number)
  const [ey, em, ed] = endISO.split('-').map(Number)
  const startDate = new Date(sy, sm - 1, sd)
  const endDate   = new Date(ey, em - 1, ed)
  const monthDay  = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' })
  return `${monthDay.format(startDate)} to ${monthDay.format(endDate)}, ${ey}`
}

/** Forward-facing subject for the rep week-ahead email. */
export function buildRepWeekAheadSubject(ctx: MarketingRecapContext): string {
  const range = formatWeekAheadRange(ctx.next_week_start, ctx.next_week_end)
  return range ? `Your Week Ahead — ${range}` : 'Your Week Ahead from Marketing'
}

// ───── Renderer wrapper (parallels renderMarketingRecap) ─────
//
// Normalizes top-level null/undefined string fields to '' and injects
// the derived forward-facing subject + week-ahead label. Arrays
// (upcoming_items) and booleans (has_upcoming_items) pass through so the
// Mustache section blocks render as designed.
export function renderRepWeekAhead(
  template: string,
  ctx:      MarketingRecapContext,
): string {
  const data: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(ctx)) {
    data[k] = v === null || v === undefined ? '' : v
  }
  data.subject          = buildRepWeekAheadSubject(ctx)
  data.week_ahead_label = formatWeekAheadRange(ctx.next_week_start, ctx.next_week_end)
  return Mustache.render(template, data)
}
