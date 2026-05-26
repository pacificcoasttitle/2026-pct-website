/**
 * Corporate Standard — PCT email signature template.
 *
 * Outlook-safe, table-based, inline CSS only. Mustache placeholders are
 * substituted by the signature generator. Conditional sections use the
 * standard {{#field}}…{{/field}} block syntax so optional fields can be
 * omitted at render time without leaving empty rows.
 *
 * Hard rules enforced here:
 *   - Tables for all layout (no div for layout)
 *   - Inline CSS only (no <style>, no classes)
 *   - Web-safe fonts only (Arial, Helvetica, sans-serif)
 *   - Absolute https:// URLs for every image
 *   - bgcolor attributes on color blocks (Outlook ignores some CSS bg)
 *   - cellpadding="0" cellspacing="0" border="0" on every table
 *   - Explicit width/height/alt on every <img>
 *   - No background-image, no @media, no flex/grid, no rgba
 *
 * Placeholders consumed:
 *   {{first_name}} {{last_name}} {{title}} {{department}} {{email}}
 *   {{phone}} {{office_direct}} {{photo_url}}
 *   {{office_address_line1}} {{office_city}} {{office_state}} {{office_zip}}
 *   {{office_main_phone}} {{license_number}}
 *   {{linkedin_url}} {{instagram_url}}
 *
 * Conditional sections (rendered only when truthy):
 *   {{#department}}…{{/department}}
 *   {{#phone}}…{{/phone}}
 *   {{#office_direct}}…{{/office_direct}}
 *   {{#office_main_phone}}…{{/office_main_phone}}
 *   {{#license_number}}…{{/license_number}}
 *
 * Phase 1: social icons are intentionally omitted from the template until
 * linkedin.png / instagram.png are hosted. Photo column always renders;
 * the caller is responsible for substituting the PCT logo URL when a
 * staff member has no headshot (see DEFAULT_PHOTO_URL below).
 */

export const DEFAULT_PHOTO_URL = 'https://www.pct.com/logo2.png'

export const CORPORATE_STANDARD_HTML = `<table cellpadding="0" cellspacing="0" border="0" width="500" style="border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;color:#1f2937;font-size:13px;line-height:1.4;">
  <tr>
    <td width="92" valign="top" align="left" style="padding:0 12px 0 0;">
      <img src="{{photo_url}}" alt="{{first_name}} {{last_name}}" width="80" height="80" style="display:block;width:80px;height:80px;border-radius:40px;border:0;outline:none;text-decoration:none;">
    </td>
    <td width="8" bgcolor="#f26b2b" valign="top" style="width:4px;background-color:#f26b2b;font-size:0;line-height:0;">&nbsp;</td>
    <td valign="top" style="padding:0 0 0 12px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
        <tr>
          <td style="font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#03374f;padding:0 0 2px 0;line-height:1.2;">
            {{first_name}} {{last_name}}
          </td>
        </tr>
        <tr>
          <td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#4b5563;padding:0 0 2px 0;line-height:1.3;">
            {{title}}{{#department}} &middot; {{department}}{{/department}}
          </td>
        </tr>
        <tr>
          <td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b7280;padding:0 0 8px 0;line-height:1.3;">
            Pacific Coast Title Company
          </td>
        </tr>
        <tr>
          <td style="padding:0 0 6px 0;">
            <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
              {{#phone}}
              <tr>
                <td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#03374f;padding:0 8px 2px 0;width:48px;font-weight:bold;">Phone</td>
                <td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#1f2937;padding:0 0 2px 0;">
                  <a href="tel:{{phone}}" style="color:#1f2937;text-decoration:none;">{{phone}}</a>
                </td>
              </tr>
              {{/phone}}
              {{#office_direct}}
              <tr>
                <td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#03374f;padding:0 8px 2px 0;width:48px;font-weight:bold;">Office</td>
                <td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#1f2937;padding:0 0 2px 0;">
                  <a href="tel:{{office_direct}}" style="color:#1f2937;text-decoration:none;">{{office_direct}}</a>
                </td>
              </tr>
              {{/office_direct}}
              <tr>
                <td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#03374f;padding:0 8px 2px 0;width:48px;font-weight:bold;">Email</td>
                <td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;padding:0 0 2px 0;">
                  <a href="mailto:{{email}}" style="color:#f26b2b;text-decoration:none;">{{email}}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#4b5563;padding:0 0 2px 0;line-height:1.5;">
            {{office_address_line1}}<br>
            {{office_city}}, {{office_state}} {{office_zip}}{{#office_main_phone}} &middot; <a href="tel:{{office_main_phone}}" style="color:#4b5563;text-decoration:none;">{{office_main_phone}}</a>{{/office_main_phone}}
          </td>
        </tr>
        {{#license_number}}
        <tr>
          <td style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#6b7280;padding:2px 0 0 0;">
            DRE #{{license_number}}
          </td>
        </tr>
        {{/license_number}}
      </table>
    </td>
    <td width="100" valign="top" align="right" style="padding:0 0 0 12px;">
      <a href="https://www.pct.com" style="text-decoration:none;">
        <img src="https://www.pct.com/logo2.png" alt="Pacific Coast Title Company" width="96" height="36" style="display:block;width:96px;height:auto;border:0;outline:none;text-decoration:none;">
      </a>
    </td>
  </tr>
</table>`

/**
 * Lightweight Mustache renderer covering exactly the features this
 * template uses: simple {{var}} substitution and {{#section}}…{{/section}}
 * conditionals. Sections render when the value is truthy and non-empty.
 * Variables are HTML-escaped by default; href/src values inherit the same
 * escaping which is sufficient for our trusted, server-side data.
 *
 * This intentionally does NOT implement Mustache's full spec (no
 * iteration, no lambdas, no partials). Keep it small and predictable.
 */
export interface SignatureContext {
  first_name?:           string | null
  last_name?:            string | null
  title?:                string | null
  department?:           string | null
  email?:                string | null
  phone?:                string | null
  office_direct?:        string | null
  /** When blank, the renderer substitutes DEFAULT_PHOTO_URL (PCT logo). */
  photo_url?:            string | null
  office_address_line1?: string | null
  office_city?:          string | null
  office_state?:         string | null
  office_zip?:           string | null
  office_main_phone?:    string | null
  license_number?:       string | null
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
  // Photo always renders; fall back to the PCT logo for staff without a
  // headshot so the photo column shape stays consistent across signatures.
  const photo_url = isTruthy(ctx.photo_url) ? ctx.photo_url : DEFAULT_PHOTO_URL
  const data: Record<string, unknown> = { ...ctx, photo_url }

  // 1. Strip/keep conditional sections.
  //    Repeat until stable so nested-ish sections (none here today) work.
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
