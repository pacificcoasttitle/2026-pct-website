/**
 * CANONICAL SOURCE — DO NOT BUILD UI EDITORS WITHOUT GUARD
 *
 * This file is the canonical source for the Weekly Marketing Recap
 * email template. The DB row in marketing_recap_drafts.html_content
 * is rendered at draft-generation time (Phase C3) by calling
 * renderMarketingRecap(MARKETING_RECAP_TEMPLATE, context).
 *
 * RENDERER: Uses the mustache npm package (canonical, matches the
 * signature templates and asset-delivery template). All {{var}}
 * fields are HTML-escaped by default. Pre-rendered HTML blocks
 * (when introduced by the data shaper in Phase C2) should be
 * injected via {{{var}}} triple-stash so they are NOT escaped.
 * The current template uses single-stash everywhere because the
 * contract guarantees plain-text strings for all displayed fields.
 *
 * TONE: Leadership recap. Professional, neutral, factual.
 * Recipients: Rudy Cortez (SVP-COO), Brandon Heethuis (SVP-CFO),
 * Sales Managers (Anthony Zamora, Jorge Mesa, Neil Torquato),
 * CC marketing@pct.com. NOT consumer marketing. No unsubscribe
 * link — recipients can't opt out of an internal recap.
 *
 * CONTRACT: Consumes types/marketing-recap.ts MarketingRecapContext.
 *
 * OUTLOOK-SAFE: Tables for layout, inline styles only, role=
 * "presentation" on layout tables, cellpadding/cellspacing/border=0,
 * 600px max width, web-safe fonts, hex colors only (one rgba in the
 * header subtitle that degrades to opaque white in clients that
 * drop it), no flexbox/grid, no CSS variables, no <style> blocks,
 * no background-image, no web fonts.
 */
import Mustache from 'mustache'
import type { MarketingRecapContext } from '@/types/marketing-recap'

// ───── PCT brand palette ─────
// Hex values match the constants used in lib/email-templates/asset-delivery.ts
// (NAVY / ORANGE / WARM_NEUTRAL / WHITE / TEXT_DARK / TEXT_MUTED / BORDER).
// Kept as a typed object here for readability inside the template literal.
const PCT_BRAND = {
  navy:        '#03374f',
  orange:      '#f26b2b',
  warmNeutral: '#f0ede9',
  white:       '#ffffff',
  textDark:    '#1f2937',
  textMuted:   '#6b7280',
  border:      '#e5e7eb',
  // J1: shipped indicator. Material green 800 — a deep, high-contrast
  // green that renders consistently as a plain hex foreground color in
  // Outlook/Gmail/Apple Mail (no gradient, no theme dependency).
  shipped:     '#2e7d32',
} as const

// ───── HTML template ─────
//
// Outlook-safe constraints (verified):
//   1. Tables for all layout, never flexbox or CSS grid
//   2. Inline styles only (no <style> blocks)
//   3. role="presentation" on every layout table
//   4. cellpadding="0" cellspacing="0" border="0" on every layout table
//   5. Width capped at 600px
//   6. No CSS variables — Outlook doesn't support them
//   7. Hex colors only (one rgba on the header subtitle as a decorative
//      degradation — gracefully falls back to opaque white)
//   8. Web-safe font stack with sans-serif fallback
//   9. line-height as a unitless number (Outlook quirk)
//  10. No background-image (Outlook desktop blocks by default)
//  11. {{var}} for escaped substitution; {{{var}}} reserved for pre-
//      sanitized HTML blocks (data shaper at C2 will use as needed)
//
// Three content sections wrap the data:
//   - "Sent Last Week"  → iterates batches_sent or shows empty state
//   - "Coming This Week" → iterates upcoming_items or shows empty state
//   - "By The Numbers"  → 2×3 metric grid from numbers.{...}
//
// Greens (#047857 / #ecfdf5 / #a7f3d0 / #065f46) and reds
// (#b91c1c / #fef2f2 / #fecaca / #991b1b) are Tailwind emerald-700/
// emerald-50/emerald-200/emerald-800 and red-700/red-50/red-200/red-800.
// Used only inside the "Delivered" / "Failed" status tiles and the
// inline "✓ delivered / ✗ failed" line on each campaign card — same
// semantic palette as the rest of the admin UI, mapped to hex for
// Outlook compatibility.
export const MARKETING_RECAP_TEMPLATE = `
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
                Marketing Weekly
              </div>
              <div style="color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 4px;">
                Week of {{week_range_label}}
              </div>
            </td>
          </tr>

          <!-- ───── INTRO ───── -->
          <tr>
            <td style="padding: 28px 32px 8px 32px;">
              <p style="margin: 0; color: ${PCT_BRAND.textDark}; font-size: 15px; line-height: 1.6;">
                Here's what marketing shipped last week and what's on deck for the coming week.
              </p>
            </td>
          </tr>

          <!-- ───── SECTION: SENT LAST WEEK ───── -->
          <tr>
            <td style="padding: 24px 32px 8px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: ${PCT_BRAND.navy}; color: ${PCT_BRAND.white}; padding: 6px 14px; border-radius: 999px; font-size: 11px; font-weight: 600; letter-spacing: 0.6px; text-transform: uppercase;">
                    Sent Last Week
                  </td>
                </tr>
              </table>
              <div style="color: ${PCT_BRAND.textMuted}; font-size: 13px; margin-top: 6px;">
                {{last_week_start}} to {{last_week_end}}
              </div>
            </td>
          </tr>

          {{#has_batches_sent}}
          <tr>
            <td style="padding: 16px 32px 8px 32px;">
              {{#batches_sent}}
              <!-- Campaign card -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border: 1px solid ${PCT_BRAND.border}; border-radius: 6px; margin-bottom: 12px;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="color: ${PCT_BRAND.textDark}; font-size: 15px; font-weight: 600;">
                          {{campaign_name}}
                        </td>
                        <td align="right" style="white-space: nowrap;">
                          <span style="display: inline-block; background-color: ${PCT_BRAND.warmNeutral}; color: ${PCT_BRAND.navy}; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; letter-spacing: 0.4px;">
                            {{lane_label}}
                          </span>
                        </td>
                      </tr>
                    </table>
                    <div style="color: ${PCT_BRAND.textMuted}; font-size: 13px; margin-top: 8px;">
                      Sent {{sent_date_label}} &nbsp;·&nbsp; {{rep_count}} reps &nbsp;·&nbsp; {{file_count}} files
                    </div>
                    {{#description}}
                    <div style="color: ${PCT_BRAND.textDark}; font-size: 13px; line-height: 1.5; margin-top: 8px;">
                      {{description}}
                    </div>
                    {{/description}}
                    <div style="margin-top: 10px;">
                      <span style="color: #047857; font-size: 12px; font-weight: 600;">
                        &#10003; {{successful_sends}} delivered
                      </span>
                      {{#has_failures}}
                      &nbsp;·&nbsp;
                      <span style="color: #b91c1c; font-size: 12px; font-weight: 600;">
                        &#10007; {{failed_sends}} failed
                      </span>
                      {{/has_failures}}
                    </div>
                  </td>
                </tr>
              </table>
              {{/batches_sent}}
            </td>
          </tr>
          {{/has_batches_sent}}

          {{^has_batches_sent}}
          <tr>
            <td style="padding: 16px 32px;">
              <div style="background-color: ${PCT_BRAND.warmNeutral}; border-radius: 6px; padding: 18px; text-align: center; color: ${PCT_BRAND.textMuted}; font-size: 13px;">
                No asset delivery campaigns sent this week.
              </div>
            </td>
          </tr>
          {{/has_batches_sent}}

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
                No campaigns scheduled this week. Check in with marketing for updates.
              </div>
            </td>
          </tr>
          {{/has_upcoming_items}}

          <!-- ───── SECTION: BY THE NUMBERS ───── -->
          <tr>
            <td style="padding: 24px 32px 8px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: ${PCT_BRAND.navy}; color: ${PCT_BRAND.white}; padding: 6px 14px; border-radius: 999px; font-size: 11px; font-weight: 600; letter-spacing: 0.6px; text-transform: uppercase;">
                    By The Numbers
                  </td>
                </tr>
              </table>
              <div style="color: ${PCT_BRAND.textMuted}; font-size: 13px; margin-top: 6px;">
                Last week's totals
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding: 16px 32px 24px 32px;">
              <!-- Metrics grid: 2×3 using nested tables for Outlook -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <!-- Metric: campaigns_sent -->
                  <td width="50%" style="padding: 0 6px 12px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${PCT_BRAND.warmNeutral}; border-radius: 6px;">
                      <tr>
                        <td style="padding: 14px 16px;">
                          <div style="color: ${PCT_BRAND.navy}; font-size: 24px; font-weight: 700; line-height: 1;">
                            {{numbers.campaigns_sent}}
                          </div>
                          <div style="color: ${PCT_BRAND.textMuted}; font-size: 12px; margin-top: 4px;">
                            Campaigns sent
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <!-- Metric: unique_reps_reached -->
                  <td width="50%" style="padding: 0 0 12px 6px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${PCT_BRAND.warmNeutral}; border-radius: 6px;">
                      <tr>
                        <td style="padding: 14px 16px;">
                          <div style="color: ${PCT_BRAND.navy}; font-size: 24px; font-weight: 700; line-height: 1;">
                            {{numbers.unique_reps_reached}}
                          </div>
                          <div style="color: ${PCT_BRAND.textMuted}; font-size: 12px; margin-top: 4px;">
                            Reps reached
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <!-- Metric: total_files -->
                  <td width="50%" style="padding: 0 6px 12px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${PCT_BRAND.warmNeutral}; border-radius: 6px;">
                      <tr>
                        <td style="padding: 14px 16px;">
                          <div style="color: ${PCT_BRAND.navy}; font-size: 24px; font-weight: 700; line-height: 1;">
                            {{numbers.total_files}}
                          </div>
                          <div style="color: ${PCT_BRAND.textMuted}; font-size: 12px; margin-top: 4px;">
                            Files delivered
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <!-- Metric: total_payload_mb -->
                  <td width="50%" style="padding: 0 0 12px 6px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${PCT_BRAND.warmNeutral}; border-radius: 6px;">
                      <tr>
                        <td style="padding: 14px 16px;">
                          <div style="color: ${PCT_BRAND.navy}; font-size: 24px; font-weight: 700; line-height: 1;">
                            {{numbers.total_payload_mb}} MB
                          </div>
                          <div style="color: ${PCT_BRAND.textMuted}; font-size: 12px; margin-top: 4px;">
                            Total payload
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <!-- Metric: total_successful_sends -->
                  <td width="50%" style="padding: 0 6px 0 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px;">
                      <tr>
                        <td style="padding: 14px 16px;">
                          <div style="color: #047857; font-size: 24px; font-weight: 700; line-height: 1;">
                            {{numbers.total_successful_sends}}
                          </div>
                          <div style="color: #065f46; font-size: 12px; margin-top: 4px;">
                            Delivered
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <!-- Metric: total_failed_sends -->
                  <td width="50%" style="padding: 0 0 0 6px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px;">
                      <tr>
                        <td style="padding: 14px 16px;">
                          <div style="color: #b91c1c; font-size: 24px; font-weight: 700; line-height: 1;">
                            {{numbers.total_failed_sends}}
                          </div>
                          <div style="color: #991b1b; font-size: 12px; margin-top: 4px;">
                            Failed
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ───── FOOTER ───── -->
          <tr>
            <td style="background-color: ${PCT_BRAND.warmNeutral}; padding: 20px 32px; text-align: center;">
              <div style="color: ${PCT_BRAND.textMuted}; font-size: 12px; line-height: 1.6;">
                Pacific Coast Title Company &nbsp;·&nbsp; Marketing Department<br>
                Generated weekly &nbsp;·&nbsp; Questions: marketing@pct.com
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

// ───── Renderer wrapper ─────
//
// Matches the pattern used by lib/email-templates/asset-delivery.ts
// (renderAssetDeliveryHtml). The wrapper normalizes only top-level
// null/undefined string fields to empty strings — the contract states
// every field is required, but defensive normalization avoids
// literal "undefined" / "null" leaking into the rendered HTML if a
// data shaper bug ever produces an incomplete context.
//
// Nested objects (numbers) and arrays (batches_sent, upcoming_items)
// are passed through unchanged so Mustache section blocks
// ({{#batches_sent}}…{{/}}) and dot-notation ({{numbers.X}}) work
// as designed.
export function renderMarketingRecap(
  template: string,
  ctx:      MarketingRecapContext,
): string {
  const data: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(ctx)) {
    if (v === null || v === undefined) {
      data[k] = ''
    } else {
      data[k] = v
    }
  }
  return Mustache.render(template, data)
}
