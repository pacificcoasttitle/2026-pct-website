import Mustache from 'mustache'

// ============================================================
// Personalized Asset Delivery — email template (Outlook-safe HTML)
// ============================================================
//
// Delivers one marketing piece to a sales rep:
//   IG Story (Wed) · Flyer (Thu) · PDF Calendar (1st)
//
// Outlook-safe rules:
//   - Tables for all layout (no flex/grid)
//   - Inline CSS only
//   - bgcolor + background-color
//   - cellpadding/cellspacing/border="0" + role="presentation"
//   - Web-safe font stack
//   - No rgba / @media / background-image / SVG icons
//
// Mustache placeholders:
//   {{rep_first_name}}
//   {{campaign_name}}
//   {{piece_label}}          — "IG Story" | "Flyer" | "PDF Calendar"
//   {{piece_schedule}}       — "Wednesdays" | "Thursdays" | "1st of the month"
//   {{piece_tip}}            — how-to line for this piece type
//   {{attachment_count}}     — number of files attached
//   {{ai_intro_paragraph}}
//   {{questions_callout}}
//
/**
 * CANONICAL SOURCE — DO NOT BUILD UI EDITORS WITHOUT GUARD
 *
 * This file is the canonical source for the Asset Delivery email template.
 * The DB row in asset_delivery_templates is auto-synced from this file
 * on every deploy via ON CONFLICT (slug) DO UPDATE SET html_template.
 *
 * Until a guarded UI editor exists: edit this file → deploy → DB syncs.
 */

const NAVY         = '#03374f'
const ORANGE       = '#f26b2b'
const WARM_NEUTRAL = '#f0ede9'
const WHITE        = '#ffffff'
const TEXT_DARK    = '#1f2937'
const TEXT_MUTED   = '#6b7280'
const BORDER       = '#e5e7eb'
const ORANGE_TINT  = '#fcefe7'
const NAVY_SOFT    = '#e8eef1'

const FONT_STACK = 'Arial, Helvetica, sans-serif'

export const ASSET_DELIVERY_HTML = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<meta charset="utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>{{campaign_name}} — {{piece_label}}</title>
<!--[if mso]>
<style type="text/css">
table { border-collapse: collapse; }
td    { mso-line-height-rule: exactly; }
</style>
<![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${WARM_NEUTRAL};font-family:${FONT_STACK};">
<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" bgcolor="${WARM_NEUTRAL}" style="background-color:${WARM_NEUTRAL};border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
  <tr>
    <td align="center" style="padding:28px 12px;">

      <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="600" bgcolor="${WHITE}" style="width:600px;max-width:600px;background-color:${WHITE};border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">

        <!-- Header -->
        <tr>
          <td bgcolor="${NAVY}" style="background-color:${NAVY};padding:28px 32px 22px 32px;">
            <img src="https://www.pct.com/logo2.png" alt="Pacific Coast Title Company" width="150" height="auto" style="display:block;width:150px;height:auto;border:0;outline:none;text-decoration:none;" />
            <p style="font-family:${FONT_STACK};font-size:12px;font-weight:bold;color:${WHITE};letter-spacing:0.12em;text-transform:uppercase;margin:18px 0 0 0;line-height:1.3;">
              Marketing for your desk
            </p>
          </td>
        </tr>

        <!-- Orange accent -->
        <tr>
          <td bgcolor="${ORANGE}" height="4" style="background-color:${ORANGE};font-size:0;line-height:0;height:4px;">&nbsp;</td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 32px 28px 32px;font-family:${FONT_STACK};">

            <!-- Piece type pill + schedule -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 0 18px 0;">
              <tr>
                <td bgcolor="${ORANGE}" style="background-color:${ORANGE};padding:6px 12px;border-radius:4px;">
                  <span style="font-family:${FONT_STACK};font-size:11px;font-weight:bold;color:${WHITE};text-transform:uppercase;letter-spacing:0.1em;line-height:1;">{{piece_label}}</span>
                </td>
                {{#piece_schedule}}
                <td style="padding-left:10px;font-family:${FONT_STACK};font-size:12px;color:${TEXT_MUTED};line-height:1;">
                  {{piece_schedule}}
                </td>
                {{/piece_schedule}}
              </tr>
            </table>

            <!-- Headline -->
            <h1 style="font-family:${FONT_STACK};font-size:26px;font-weight:bold;color:${NAVY};margin:0 0 6px 0;line-height:1.25;">
              {{campaign_name}}
            </h1>
            <p style="font-family:${FONT_STACK};font-size:16px;color:${TEXT_MUTED};margin:0 0 22px 0;line-height:1.4;">
              Ready for you, {{rep_first_name}}
            </p>

            <!-- AI intro -->
            <p style="font-family:${FONT_STACK};font-size:15px;color:${TEXT_DARK};line-height:1.7;margin:0 0 28px 0;">
              {{ai_intro_paragraph}}
            </p>

            <!-- Attachments callout -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" bgcolor="${NAVY_SOFT}" style="background-color:${NAVY_SOFT};border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 0 20px 0;border-radius:6px;">
              <tr>
                <td width="56" valign="middle" align="center" bgcolor="${NAVY}" style="background-color:${NAVY};width:56px;padding:18px 0;border-radius:6px 0 0 6px;">
                  <span style="font-family:${FONT_STACK};font-size:22px;font-weight:bold;color:${WHITE};line-height:1;">&#8595;</span>
                </td>
                <td valign="middle" style="padding:16px 20px;font-family:${FONT_STACK};">
                  <p style="font-family:${FONT_STACK};font-size:14px;font-weight:bold;color:${NAVY};margin:0 0 4px 0;line-height:1.3;">
                    {{attachment_count}} file{{#attachment_plural}}s{{/attachment_plural}} attached
                  </p>
                  <p style="font-family:${FONT_STACK};font-size:13px;color:${TEXT_DARK};margin:0;line-height:1.5;">
                    {{piece_tip}}
                  </p>
                </td>
              </tr>
            </table>

            <!-- Questions -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" bgcolor="${ORANGE_TINT}" style="background-color:${ORANGE_TINT};border-left:4px solid ${ORANGE};border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 0 28px 0;">
              <tr>
                <td style="padding:16px 20px;font-family:${FONT_STACK};">
                  <p style="font-family:${FONT_STACK};font-size:12px;font-weight:bold;color:${ORANGE};margin:0 0 6px 0;text-transform:uppercase;letter-spacing:0.06em;line-height:1.3;">
                    Need a tweak?
                  </p>
                  <p style="font-family:${FONT_STACK};font-size:14px;color:${TEXT_DARK};line-height:1.6;margin:0;">
                    {{questions_callout}}
                  </p>
                </td>
              </tr>
            </table>

            <!-- Signature -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-top:1px solid ${BORDER};border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
              <tr>
                <td style="padding-top:22px;">
                  <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
                    <tr>
                      <td width="44" valign="top" align="center" bgcolor="${ORANGE}" style="background-color:${ORANGE};width:44px;height:44px;border-radius:6px;">
                        <span style="font-family:${FONT_STACK};font-size:18px;font-weight:bold;color:${WHITE};line-height:44px;">M</span>
                      </td>
                      <td valign="middle" style="padding-left:14px;font-family:${FONT_STACK};">
                        <p style="font-family:${FONT_STACK};font-size:14px;font-weight:bold;color:${TEXT_DARK};margin:0 0 2px 0;line-height:1.3;">PCT Marketing</p>
                        <p style="font-family:${FONT_STACK};font-size:12px;color:${TEXT_MUTED};margin:0;line-height:1.4;">Pacific Coast Title Company</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td bgcolor="${WARM_NEUTRAL}" style="background-color:${WARM_NEUTRAL};padding:20px 32px;border-top:1px solid ${BORDER};font-family:${FONT_STACK};text-align:center;">
            <p style="font-family:${FONT_STACK};font-size:12px;color:${TEXT_MUTED};margin:0 0 6px 0;text-align:center;line-height:1.5;">Pacific Coast Title Company</p>
            <p style="font-family:${FONT_STACK};font-size:12px;color:${TEXT_MUTED};margin:0;text-align:center;line-height:1.5;">
              <a href="https://www.pct.com" style="color:${NAVY};text-decoration:none;">www.pct.com</a>
              &nbsp;&middot;&nbsp;
              <a href="mailto:marketing@pct.com" style="color:${NAVY};text-decoration:none;">marketing@pct.com</a>
            </p>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>
</body>
</html>`

export const ASSET_DELIVERY_DEFAULTS = {
  questions_callout:
    'Reply to this email and the marketing team will help with a revision or alternate version.',
} as const

export type AssetDeliveryContext = Record<string, string | number | boolean | null | undefined>

export function renderAssetDeliveryHtml(
  template: string,
  ctx:      AssetDeliveryContext,
): string {
  const data: Record<string, string | number | boolean> = {}
  for (const [k, v] of Object.entries(ctx)) {
    data[k] = v === null || v === undefined ? '' : v
  }
  return Mustache.render(template, data)
}
