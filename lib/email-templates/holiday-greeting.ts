/**
 * Holiday Greeting — Outlook-safe email template.
 *
 * Translated from the V0 holiday-greeting-email design. Follows the same
 * hard rules as lib/signature-templates/corporate-standard.ts:
 *   - Tables for all layout (no <div> for layout)
 *   - Inline CSS only, web-safe fonts only
 *   - Absolute https:// URLs for every image
 *   - cellpadding="0" cellspacing="0" border="0" role="presentation"
 *   - mso-table-lspace/rspace:0pt on every layout table
 *   - bgcolor attributes in addition to inline background-color CSS
 *   - No box-shadow, no @media, no flex/grid, no rgba
 *
 * Mustache placeholders (consumed by the campaign send pipeline that
 * already substitutes {{REP_*}} merge tags in vcard_email_templates):
 *
 *   {{headline}}              — large navy headline (required)
 *   {{message_paragraph_1}}   — first body paragraph (required)
 *   {{message_paragraph_2}}   — second body paragraph (conditional)
 *   {{office_hours_notice}}   — left-bar callout block (conditional)
 *   {{hero_image}}            — optional festive hero image URL (conditional)
 *   {{rep_name}} {{rep_title}} {{rep_phone}} {{rep_email}} {{rep_photo_url}}
 *
 * Conditional sections use {{#field}}…{{/field}} block syntax. The
 * renderer strips a section whose key resolves to empty/null/false.
 *
 * Comments below use plain HTML <!-- --> since these survive through
 * any client. (Mustache {{!-- --}} comments are not handled by our
 * lightweight renderer — they would render as literal text.)
 */

export const HOLIDAY_GREETING_HTML = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#f0ede9;">
  <tr>
    <td align="center" style="padding:24px 16px;">
      <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="600" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;width:600px;max-width:600px;background-color:#ffffff;">

        <!-- HEADER -->
        <tr>
          <td bgcolor="#03374f" style="background-color:#03374f;padding:24px 32px;">
            <img src="https://www.pct.com/logo2.png" alt="Pacific Coast Title Company" width="150" style="display:block;width:150px;height:auto;border:0;outline:none;text-decoration:none;">
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:40px 32px;font-family:Arial,Helvetica,sans-serif;">

            <!-- Eyebrow label -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin-bottom:24px;">
              <tr>
                <td bgcolor="#03374f" style="background-color:#03374f;border-radius:4px;padding:6px 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:#ffffff;text-transform:uppercase;letter-spacing:0.1em;">
                  Seasonal Greeting
                </td>
              </tr>
            </table>

            <!-- Headline -->
            <h1 style="font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:bold;color:#03374f;margin:0 0 24px 0;line-height:1.25;">{{headline}}</h1>

            <!-- Message paragraphs -->
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1f2937;line-height:1.7;margin:0 0 20px 0;">
              {{message_paragraph_1}}
            </p>

            {{#message_paragraph_2}}
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1f2937;line-height:1.7;margin:0 0 20px 0;">
              {{message_paragraph_2}}
            </p>
            {{/message_paragraph_2}}

            <!-- Office hours callout (optional) -->
            {{#office_hours_notice}}
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:24px 0;">
              <tr>
                <td bgcolor="#f0ede9" style="background-color:#f0ede9;border-left:4px solid #03374f;border-radius:0 6px 6px 0;padding:20px 24px;font-family:Arial,Helvetica,sans-serif;">
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:#03374f;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px 0;">Office Hours</p>
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1f2937;line-height:1.6;margin:0;">{{office_hours_notice}}</p>
                </td>
              </tr>
            </table>
            {{/office_hours_notice}}

            <!-- Optional festive hero image -->
            {{#hero_image}}
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:24px 0;">
              <tr>
                <td>
                  <img src="{{hero_image}}" alt="" width="536" style="display:block;width:100%;max-width:536px;height:auto;border:0;outline:none;border-radius:8px;">
                </td>
              </tr>
            </table>
            {{/hero_image}}

            <!-- REP SIGNATURE BLOCK -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:24px;">
              <tr>
                <td width="96" valign="top" style="padding:24px 16px 0 0;">
                  <img src="{{rep_photo_url}}" alt="{{rep_name}}" width="80" height="80" style="display:block;width:80px;height:80px;border-radius:40px;border:0;outline:none;">
                </td>
                <td valign="top" style="padding-top:24px;">
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:bold;color:#1f2937;margin:0 0 3px 0;line-height:1.2;">{{rep_name}}</p>
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b7280;margin:0 0 14px 0;">{{rep_title}}</p>
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#1f2937;margin:0 0 6px 0;">
                    <a href="tel:{{rep_phone}}" style="color:#1f2937;text-decoration:none;">{{rep_phone}}</a>
                  </p>
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#1f2937;margin:0;">
                    <a href="mailto:{{rep_email}}" style="color:#f26b2b;text-decoration:none;">{{rep_email}}</a>
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td bgcolor="#f0ede9" style="background-color:#f0ede9;padding:24px 32px;border-top:1px solid #e5e7eb;text-align:center;font-family:Arial,Helvetica,sans-serif;">
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b7280;margin:0 0 8px 0;text-align:center;">Pacific Coast Title Company</p>
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;margin:0 0 12px 0;text-align:center;">
              <a href="https://www.pct.com" style="color:#03374f;text-decoration:none;">www.pct.com</a>
            </p>
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#6b7280;margin:0;text-align:center;">
              <a href="*|UNSUB|*" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>
              &middot;
              <a href="*|UPDATE_PROFILE|*" style="color:#6b7280;text-decoration:underline;">Manage Preferences</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>`

/** Default metadata persisted alongside the HTML in vcard_email_templates. */
export const HOLIDAY_GREETING_META = {
  name:      'Holiday Greeting',
  category:  'holidays',
  subject:   'Warm Wishes from Pacific Coast Title',
  preheader: 'A note of appreciation from your title insurance team',
} as const
