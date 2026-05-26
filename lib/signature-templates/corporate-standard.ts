/**
 * Corporate Standard — PCT email signature template.
 *
 * Outlook-safe, table-based, inline CSS only. Mustache-templated so the
 * same HTML serves all PCT employees. Conditional sections use the
 * {{#field}}…{{/field}} block syntax so optional fields drop cleanly
 * without leaving empty rows or orphaned punctuation.
 *
 * Hard rules enforced here:
 *   - Tables for all layout (no <div> for layout)
 *   - Inline CSS only (no <style>, no classes)
 *   - Web-safe fonts only (Arial, Helvetica, sans-serif)
 *   - Absolute https:// URLs for every image
 *   - cellpadding="0" cellspacing="0" border="0" on every table
 *   - role="presentation" + mso-table-lspace/rspace:0pt for Outlook
 *   - Explicit width/height/alt on every <img>
 *   - No background-image, no @media, no flex/grid, no rgba
 *
 * PLACEHOLDERS:
 *   {{first_name}} {{last_name}}        — always
 *   {{title}}                           — always
 *   {{department}}                      — conditional (eyebrow row)
 *   {{phone}}                           — conditional (cell first, fallback office_direct)
 *   {{office_main_phone}}               — conditional, shown as "Office: …" under phone
 *   {{email}}                           — always (mailto)
 *   {{photo_url}}                       — always (uploaded photo or ui-avatars initials)
 *   {{office_address_line1}}            — conditional, wraps the whole address row
 *   {{office_city}} {{office_state}} {{office_zip}}
 *
 * REMOVED (Phase 2 — V0 hardened design):
 *   {{office_direct}}    — folded into {{phone}} fallback in the renderer
 *   {{license_number}}   — not used in V0 design
 *   {{linkedin_url}} {{instagram_url}}  — social removed in Phase 1
 *
 * Photo column always renders. The renderer is responsible for supplying
 * a non-empty {{photo_url}} (either uploaded headshot or a generated
 * ui-avatars.com initials avatar).
 */

export const CORPORATE_STANDARD_HTML = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;font-family:Arial,Helvetica,sans-serif;width:540px;max-width:540px;background-color:#ffffff;">
  <tr>
    <td width="6" style="width:6px;background-color:#f26b2b;font-size:0;line-height:0;">&nbsp;</td>
    <td style="padding:18px 18px 16px 18px;vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:516px;">
        <tr>
          <td width="190" style="width:190px;padding:0 18px 0 0;border-right:1px solid #e5e7eb;vertical-align:top;">
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
              <tr>
                <td style="vertical-align:middle;">
                  <img src="{{photo_url}}" width="80" height="80" alt="{{first_name}} {{last_name}}" style="display:block;width:80px;height:80px;border-radius:40px;border:0;outline:none;text-decoration:none;">
                </td>
              </tr>
              <tr>
                <td style="padding-top:12px;color:#03374f;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:bold;line-height:22px;">
                  {{first_name}} {{last_name}}
                </td>
              </tr>
              <tr>
                <td style="padding-top:4px;color:#f26b2b;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;line-height:17px;">
                  {{title}}
                </td>
              </tr>
              {{#department}}
              <tr>
                <td style="padding-top:3px;color:#6b7280;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:14px;text-transform:uppercase;letter-spacing:.5px;">
                  {{department}}
                </td>
              </tr>
              {{/department}}
              <tr>
                <td style="padding-top:14px;">
                  <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
                    <tr>
                      <td style="border-top:1px solid #e5e7eb;padding-top:12px;">
                        <img src="https://www.pct.com/logo2.png" width="150" alt="Pacific Coast Title Company" style="display:block;border:0;outline:none;text-decoration:none;width:150px;height:auto;">
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
          <td width="326" style="width:326px;padding:0 0 0 18px;vertical-align:top;">
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:100%;">
              {{#phone}}
              <tr>
                <td style="padding-bottom:9px;vertical-align:top;">
                  <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
                    <tr>
                      <td width="26" height="26" style="width:26px;height:26px;background-color:#f3f4f6;text-align:center;vertical-align:middle;color:#03374f;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;line-height:26px;">P</td>
                      <td style="padding-left:10px;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;">
                        <a href="tel:{{phone}}" style="color:#03374f;font-size:13px;font-weight:bold;line-height:16px;text-decoration:none;">{{phone}}</a>{{#office_main_phone}}<br><span style="color:#6b7280;font-size:11px;line-height:14px;">Office: <a href="tel:{{office_main_phone}}" style="color:#6b7280;text-decoration:none;">{{office_main_phone}}</a></span>{{/office_main_phone}}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              {{/phone}}
              <tr>
                <td style="padding-bottom:9px;vertical-align:top;">
                  <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
                    <tr>
                      <td width="26" height="26" style="width:26px;height:26px;background-color:#f3f4f6;text-align:center;vertical-align:middle;color:#03374f;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;line-height:26px;">E</td>
                      <td style="padding-left:10px;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;">
                        <a href="mailto:{{email}}" style="color:#f26b2b;font-size:13px;font-weight:bold;line-height:16px;text-decoration:none;">{{email}}</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              {{#office_address_line1}}
              <tr>
                <td style="padding-bottom:9px;vertical-align:top;">
                  <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
                    <tr>
                      <td width="26" height="26" style="width:26px;height:26px;background-color:#f3f4f6;text-align:center;vertical-align:middle;color:#03374f;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;line-height:26px;">A</td>
                      <td style="padding-left:10px;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;color:#6b7280;font-size:11px;line-height:15px;">
                        {{office_address_line1}}<br>{{office_city}}, {{office_state}} {{office_zip}}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              {{/office_address_line1}}
              <tr>
                <td style="padding-bottom:9px;vertical-align:top;">
                  <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
                    <tr>
                      <td width="26" height="26" style="width:26px;height:26px;background-color:#f3f4f6;text-align:center;vertical-align:middle;color:#03374f;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;line-height:26px;">W</td>
                      <td style="padding-left:10px;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;">
                        <a href="https://www.pct.com" style="color:#03374f;font-size:13px;font-weight:bold;line-height:16px;text-decoration:none;">www.pct.com</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding-top:6px;border-top:1px solid #e5e7eb;color:#9ca3af;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:13px;text-transform:uppercase;letter-spacing:.5px;">
                  California Title Insurance &amp; Escrow Since 2006
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`

/**
 * Lightweight Mustache renderer covering exactly the features this
 * template uses: simple {{var}} substitution and {{#section}}…{{/section}}
 * conditionals. Sections render when the value is truthy and non-empty.
 * Variables are HTML-escaped; href/src values inherit the same escaping
 * which is sufficient for trusted, server-side data.
 *
 * Intentionally does NOT implement full Mustache (no iteration, no
 * lambdas, no partials). Keep it small and predictable.
 */
export interface SignatureContext {
  first_name?:           string | null
  last_name?:            string | null
  title?:                string | null
  department?:           string | null
  email?:                string | null
  /** Cell preferred, office_direct as fallback. Renderer computes this. */
  phone?:                string | null
  /** Always supplied by the renderer (uploaded photo or initials avatar). */
  photo_url?:            string | null
  office_address_line1?: string | null
  office_city?:          string | null
  office_state?:         string | null
  office_zip?:           string | null
  office_main_phone?:    string | null
}

function escapeHtml(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function isTruthy(v: unknown): boolean {
  if (v === null || v === undefined) return false
  if (typeof v === 'string') return v.trim() !== ''
  if (typeof v === 'boolean') return v
  return Boolean(v)
}

export function renderSignature(
  template: string,
  ctx: SignatureContext,
): string {
  const data: Record<string, unknown> = { ...ctx }

  // 1. Strip/keep conditional sections.
  //    Repeat until stable so nested-ish sections (none today) work.
  const sectionRe = /\{\{#([a-z_]+)\}\}([\s\S]*?)\{\{\/\1\}\}/g
  let prev = ''
  let out  = template
  while (out !== prev) {
    prev = out
    out = out.replace(sectionRe, (_m, key: string, body: string) =>
      isTruthy(data[key]) ? body : '',
    )
  }

  // 2. Substitute simple variables.
  out = out.replace(/\{\{([a-z_]+)\}\}/g, (_m, key: string) =>
    escapeHtml(data[key]),
  )

  return out
}
