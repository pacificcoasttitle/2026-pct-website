import Mustache from 'mustache'

// ============================================================
// Personalized Asset Delivery — email template (Outlook-safe HTML)
// ============================================================
//
// Source design: v0/components/email/personalized-asset-delivery-email.tsx
//              + v0/components/email/email-components.tsx (PCT_BRAND, AssetPreviewCard,
//                CalloutBox, UseCaseItem, MarketingTeamSignature, EmailFooter…)
//
// V0 uses div/flex layout + Lucide icons. Email clients (especially Outlook
// for Windows desktop) don't reliably render flex/grid/border-radius/icon
// fonts, so this file is a table-based translation:
//   - Tables for all layout (no <div> for structure)
//   - Inline CSS only (no <style>, no classes)
//   - bgcolor attributes on color blocks (Outlook ignores some CSS bg)
//   - cellpadding="0" cellspacing="0" border="0" + role="presentation" on
//     every layout table
//   - Web-safe font stack (Arial / Helvetica / sans-serif)
//   - No flex / grid / rgba / @media
//   - Lucide icons → letter tiles ("P", "I", "T") rendered in PCT orange
//   - V0 download icon (Lucide Download) → "↓" arrow in a navy tile
//
// Mustache placeholders consumed (rendered server-side at send time):
//   {{rep_first_name}}        — "Jerry"
//   {{campaign_name}}         — "February Marketing Toolkit"
//   {{ai_intro_paragraph}}    — 2-3 sentence AI-generated personalised intro
//   {{asset_preview_cards}}   — HTML for all attached files, built server-side
//                                via renderAssetPreviewCard() below
//   {{questions_callout}}     — optional callout text override
//
// The send endpoint should:
//   1. Build {{asset_preview_cards}} by mapping attachments through
//      renderAssetPreviewCard()
//   2. Apply Mustache (or equivalent) to ASSET_DELIVERY_HTML with the
//      placeholders above
//   3. SendGrid the result as the HTML body with the actual files as
//      attachments (the preview cards are visual aids — the real files
//      go in the MIME attachment list)

/**
 * CANONICAL SOURCE — DO NOT BUILD UI EDITORS WITHOUT GUARD
 *
 * This file is the canonical source for the Asset Delivery email template.
 * The DB row in asset_delivery_templates is auto-synced from this file
 * on every deploy via ON CONFLICT (slug) DO UPDATE SET html_template.
 *
 * IMPORTANT: The UPSERT is unconditional — every cold start overwrites
 * the DB row from this file. This is BY DESIGN — V0 design lives here,
 * code-reviewed, version-controlled.
 *
 * If you ever build a UI editor that lets admins customize asset delivery
 * email templates:
 *   1. Add updated_by column to asset_delivery_templates
 *   2. Add WHERE updated_by='system' guard to seedAssetDeliveryTemplate
 *   3. Document the file-authoritative vs DB-authoritative boundary
 *
 * Until then: edit this file → deploy → DB syncs automatically.
 *
 * RENDERER: Uses mustache npm package (canonical). All {{var}} fields
 * are HTML-escaped by default. {{{asset_preview_cards}}} uses triple-
 * stash to inject server-rendered card HTML — the renderAssetPreviewCard
 * helper must ensure its output is safe HTML.
 */

// ── Brand constants (mirror PCT_BRAND from v0/email-components.tsx) ─
const NAVY          = '#03374f'
const ORANGE        = '#f26b2b'
const WARM_NEUTRAL  = '#f0ede9'
const WHITE         = '#ffffff'
const TEXT_DARK     = '#1f2937'
const TEXT_MUTED    = '#6b7280'
const BORDER        = '#e5e7eb'
const ORANGE_TINT   = '#fcefe7' // solid hex stand-in for V0's rgba(242,107,43,0.08)

const FONT_STACK = "Arial, Helvetica, sans-serif"

// ── Asset preview card helper ────────────────────────────────────
//
// Server-side renderer for one attachment row. Output is a complete
// table-cell block matching the spec's Outlook-safe AssetPreviewCard
// translation. The send endpoint maps over its attachments and joins
// the strings to produce {{asset_preview_cards}}.

export type AssetIconType = 'pdf' | 'image' | 'text' | 'other'

interface AssetPreviewCardInput {
  title:     string
  iconType:  AssetIconType
  /**
   * Human-readable type label shown beneath the title.
   * Defaults derived from iconType: PDF DOCUMENT / PNG IMAGE / TEXT FILE / FILE.
   */
  typeLabel?: string
}

const ICON_LETTER: Record<AssetIconType, string> = {
  pdf:   'P',
  image: 'I',
  text:  'T',
  other: 'F',
}

const DEFAULT_TYPE_LABEL: Record<AssetIconType, string> = {
  pdf:   'PDF DOCUMENT',
  image: 'PNG IMAGE',
  text:  'TEXT FILE',
  other: 'FILE',
}

// Minimal HTML escaping for user-supplied strings that land inside HTML
// text nodes (filenames, AI intros). Attribute contexts are not used
// here; the template is fully static apart from text content.
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function renderAssetPreviewCard(input: AssetPreviewCardInput): string {
  const letter    = ICON_LETTER[input.iconType]
  const typeLabel = input.typeLabel ?? DEFAULT_TYPE_LABEL[input.iconType]
  const title     = escapeHtml(input.title)
  const label     = escapeHtml(typeLabel)
  return `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:${WARM_NEUTRAL};border:1px solid ${BORDER};border-radius:8px;margin-bottom:12px;">
  <tr>
    <td width="64" valign="middle" align="center" bgcolor="${WHITE}" style="padding:16px;background-color:${WHITE};border-right:1px solid ${BORDER};border-radius:8px 0 0 8px;">
      <span style="font-family:${FONT_STACK};font-size:24px;color:${ORANGE};font-weight:bold;line-height:1;">${letter}</span>
    </td>
    <td valign="middle" style="padding:16px;font-family:${FONT_STACK};">
      <p style="font-size:14px;font-weight:bold;color:${TEXT_DARK};margin:0 0 4px 0;line-height:1.3;">${title}</p>
      <p style="font-size:12px;color:${TEXT_MUTED};margin:0;text-transform:uppercase;letter-spacing:0.5px;line-height:1.3;">${label}</p>
    </td>
    <td width="56" valign="middle" align="center" style="padding:16px;">
      <span style="display:inline-block;width:36px;height:36px;line-height:36px;text-align:center;background-color:${NAVY};color:${WHITE};font-family:${FONT_STACK};font-size:16px;font-weight:bold;border-radius:6px;">&darr;</span>
    </td>
  </tr>
</table>`
}

// ── Master template HTML ─────────────────────────────────────────
//
// Single Mustache document. The send pipeline:
//   const html = mustache.render(ASSET_DELIVERY_HTML, {
//     rep_first_name:       rep.first_name,
//     campaign_name:        batch.campaign_name,
//     ai_intro_paragraph:   aiIntroHtmlSafe,
//     asset_preview_cards:  attachments.map(renderAssetPreviewCard).join(''),
//     questions_callout:    'Need changes? Reply to this email.',
//   })

export const ASSET_DELIVERY_HTML = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<meta charset="utf-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>Your {{campaign_name}} is Ready</title>
<!--[if mso]>
<style type="text/css">
table { border-collapse: collapse; }
td    { mso-line-height-rule: exactly; }
</style>
<![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${WARM_NEUTRAL};font-family:${FONT_STACK};">
<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" bgcolor="${WARM_NEUTRAL}" style="background-color:${WARM_NEUTRAL};">
  <tr>
    <td align="center" style="padding:24px 12px;">

      <!-- Email shell, 600px max -->
      <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="600" bgcolor="${WHITE}" style="width:600px;max-width:600px;background-color:${WHITE};border-radius:8px;">

        <!-- Header (navy logo bar) -->
        <tr>
          <td bgcolor="${NAVY}" style="background-color:${NAVY};padding:24px 32px;border-radius:8px 8px 0 0;">
            <img src="https://www.pct.com/logo2.png" alt="Pacific Coast Title Company" width="150" height="auto" style="display:block;width:150px;height:auto;border:0;outline:none;text-decoration:none;" />
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;font-family:${FONT_STACK};">

            <!-- Section label / eyebrow pill -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-bottom:16px;">
              <tr>
                <td bgcolor="${NAVY}" style="background-color:${NAVY};padding:6px 12px;border-radius:4px;">
                  <span style="font-family:${FONT_STACK};font-size:11px;font-weight:bold;color:${WHITE};text-transform:uppercase;letter-spacing:0.1em;line-height:1;">Marketing Toolkit</span>
                </td>
              </tr>
            </table>

            <!-- Headline -->
            <h1 style="font-family:${FONT_STACK};font-size:24px;font-weight:bold;color:${NAVY};margin:0 0 8px 0;line-height:1.25;">
              Your {{campaign_name}} is Ready, {{rep_first_name}}
            </h1>

            <!-- AI intro paragraph -->
            <p style="font-family:${FONT_STACK};font-size:15px;color:${TEXT_DARK};line-height:1.7;margin:0 0 28px 0;">
              {{ai_intro_paragraph}}
            </p>

            <!-- "Your Personalized Assets" subhead -->
            <p style="font-family:${FONT_STACK};font-size:13px;font-weight:bold;color:${NAVY};text-transform:uppercase;letter-spacing:0.1em;margin:0 0 16px 0;line-height:1.3;">
              Your Personalized Assets
            </p>

            <!-- Asset preview cards (server-rendered) -->
            <div style="margin-bottom:28px;">
              {{{asset_preview_cards}}}
            </div>

            <!-- Orange callout: "Questions?" -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" bgcolor="${ORANGE_TINT}" style="background-color:${ORANGE_TINT};border-left:4px solid ${ORANGE};border-radius:0 6px 6px 0;margin:24px 0;">
              <tr>
                <td style="padding:20px 24px;font-family:${FONT_STACK};">
                  <p style="font-family:${FONT_STACK};font-size:13px;font-weight:bold;color:${ORANGE};margin:0 0 8px 0;text-transform:uppercase;letter-spacing:0.05em;line-height:1.3;">
                    Questions?
                  </p>
                  <p style="font-family:${FONT_STACK};font-size:14px;color:${TEXT_DARK};line-height:1.6;margin:0;">
                    {{questions_callout}}
                  </p>
                </td>
              </tr>
            </table>

            <!-- Marketing team signature -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-top:1px solid ${BORDER};margin-top:32px;">
              <tr>
                <td style="padding-top:24px;">
                  <table cellpadding="0" cellspacing="0" border="0" role="presentation">
                    <tr>
                      <td width="48" valign="top" align="center" bgcolor="${ORANGE}" style="background-color:${ORANGE};width:48px;height:48px;border-radius:8px;">
                        <span style="font-family:${FONT_STACK};font-size:24px;font-weight:bold;color:${WHITE};line-height:48px;">&#9993;</span>
                      </td>
                      <td valign="top" style="padding-left:16px;font-family:${FONT_STACK};">
                        <p style="font-family:${FONT_STACK};font-size:15px;font-weight:bold;color:${TEXT_DARK};margin:0 0 2px 0;line-height:1.3;">PCT Marketing Team</p>
                        <p style="font-family:${FONT_STACK};font-size:13px;color:${TEXT_MUTED};margin:0 0 8px 0;line-height:1.3;">Pacific Coast Title Company</p>
                        <p style="font-family:${FONT_STACK};font-size:13px;color:${TEXT_MUTED};margin:0;line-height:1.5;">Questions? Just reply to this email.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer (warm-neutral, centred) -->
        <tr>
          <td bgcolor="${WARM_NEUTRAL}" style="background-color:${WARM_NEUTRAL};padding:24px 32px;border-top:1px solid ${BORDER};border-radius:0 0 8px 8px;font-family:${FONT_STACK};text-align:center;">
            <p style="font-family:${FONT_STACK};font-size:12px;color:${TEXT_MUTED};margin:0 0 8px 0;text-align:center;line-height:1.5;">Pacific Coast Title Company</p>
            <p style="font-family:${FONT_STACK};font-size:12px;color:${TEXT_MUTED};margin:0 0 12px 0;text-align:center;line-height:1.5;">
              <a href="https://www.pct.com" style="color:${NAVY};text-decoration:none;">www.pct.com</a>
            </p>
            <p style="font-family:${FONT_STACK};font-size:11px;color:${TEXT_MUTED};margin:0;text-align:center;line-height:1.5;">
              <a href="#" style="color:${TEXT_MUTED};text-decoration:underline;">Unsubscribe</a>
              &nbsp;&middot;&nbsp;
              <a href="#" style="color:${TEXT_MUTED};text-decoration:underline;">Manage Preferences</a>
            </p>
          </td>
        </tr>

      </table>
      <!-- /Email shell -->

    </td>
  </tr>
</table>
</body>
</html>`

// Defaults that the send endpoint can spread into the Mustache context.
export const ASSET_DELIVERY_DEFAULTS = {
  questions_callout: 'Need changes or a different version? Reply to this email and the marketing team will help.',
} as const

// Helper that maps a MIME type to one of the four icon buckets the
// renderer understands. Used by the send pipeline.
export function iconTypeForMime(mime: string | null | undefined): AssetIconType {
  if (!mime) return 'other'
  const m = mime.toLowerCase()
  if (m === 'application/pdf' || m.endsWith('/pdf')) return 'pdf'
  if (m.startsWith('image/')) return 'image'
  if (m.startsWith('text/'))  return 'text'
  return 'other'
}

// Re-export the escaper for the send pipeline so user-supplied text
// (AI intro, filenames) gets the same treatment.
export { escapeHtml as escapeAssetDeliveryText }

/**
 * Renders ASSET_DELIVERY_HTML via the canonical Mustache implementation
 * (mustache npm package). Supports:
 *   - {{var}}            — HTML-escaped
 *   - {{{var}}}          — raw HTML (used for {{{asset_preview_cards}}})
 *   - {{#sec}}…{{/sec}}  — section, kept when value is truthy/non-empty
 *
 * Mustache treats empty strings, null, undefined, false, and empty
 * arrays as falsy for sections — matches the previous custom-renderer
 * semantics. null/undefined fields are normalized to '' so missing
 * values render as empty rather than the literal string "null".
 */
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
