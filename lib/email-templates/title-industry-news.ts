/**
 * Title Industry News — Outlook-safe email template (V3 of 4).
 *
 * Translated from the V0 title-industry-news-email composition. Inherits
 * the shared brand system established in V1 (Holiday Greeting) and V2
 * (Product Spotlight):
 *   - Navy header + 150px logo
 *   - Navy eyebrow pill (paired here with a right-aligned date/issue line)
 *   - Hero image (optional)
 *   - "QUICK TAKES" panel — warm-neutral container with 1–4 bulleted items
 *   - Navy callout box ("What This Means for You")
 *   - Rep signature + warm-neutral footer
 *
 * Same hard rules:
 *   - Tables for all layout, no <div> for layout
 *   - Inline CSS only, web-safe fonts only
 *   - Absolute https:// URLs for every <img>
 *   - cellpadding="0" cellspacing="0" border="0" role="presentation"
 *   - mso-table-lspace/rspace:0pt on every table
 *   - bgcolor + inline background-color on every color block
 *   - No background-image, no @media, no flex/grid, no rgba, no SVG
 *
 * Mustache placeholders:
 *   {{eyebrow_label}}      — short uppercase label (e.g. "TITLE INDUSTRY NEWS")
 *   {{issue_date}}         — right-aligned date / issue line (e.g. "Jan 15, 2026 · Issue 23")
 *   {{headline}}           — main story headline (required)
 *   {{hero_image}}         — optional lead image (conditional)
 *   {{body_paragraph_1}}   — first paragraph (required)
 *   {{body_paragraph_2}}   — second paragraph (conditional)
 *   {{body_paragraph_3}}   — third paragraph (conditional)
 *   {{quick_take_1..4}}    — up to four bullet items (each conditional)
 *   {{callout_title}}      — navy callout title (conditional, pair w/ body)
 *   {{callout_body}}       — navy callout body  (conditional)
 *   {{rep_name}} {{rep_title}} {{rep_phone}} {{rep_email}} {{rep_photo_url}}
 *
 * The QUICK TAKES container only renders when at least one quick take is
 * present. We gate it on {{#quick_take_1}}; the design intent assumes
 * takes are populated in order (1 → 4) so the section disappears entirely
 * if there's no first take. This matches how editors fill the form.
 *
 * V0 deviations worth noting:
 *   - V0's lead-story visual is a decorative navy block with inline SVG
 *     shield + radial gradients. Translated to a plain <img src="{{hero_image}}">
 *     (SVG + gradients are banned). Hero is conditional because not every
 *     issue needs a visual.
 *   - V0's eyebrow + date pair uses flex. Translated to a 2-column
 *     <table> with eyebrow left, date right-aligned. Outlook-safe.
 *   - V0's "Quick Takes" container is a warm-neutral rounded panel.
 *     Reproduced as a single <td bgcolor="#f0ede9"> with a small inner
 *     table per bullet.
 */

export const TITLE_INDUSTRY_NEWS_HTML = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#f0ede9;">
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

            <!-- Eyebrow + date pair -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin-bottom:16px;">
              <tr>
                <td valign="middle" align="left">
                  {{#eyebrow_label}}
                  <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
                    <tr>
                      <td bgcolor="#03374f" style="background-color:#03374f;border-radius:4px;padding:6px 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:#ffffff;text-transform:uppercase;letter-spacing:0.1em;">
                        {{eyebrow_label}}
                      </td>
                    </tr>
                  </table>
                  {{/eyebrow_label}}
                </td>
                {{#issue_date}}
                <td valign="middle" align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b7280;">
                  {{issue_date}}
                </td>
                {{/issue_date}}
              </tr>
            </table>

            <!-- Headline -->
            <h1 style="font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:bold;color:#03374f;margin:0 0 24px 0;line-height:1.25;">{{headline}}</h1>

            <!-- Hero image (optional) -->
            {{#hero_image}}
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 0 24px 0;">
              <tr>
                <td>
                  <img src="{{hero_image}}" alt="{{headline}}" width="536" style="display:block;width:100%;max-width:536px;height:auto;border:0;outline:none;border-radius:8px;">
                </td>
              </tr>
            </table>
            {{/hero_image}}

            <!-- Body paragraphs -->
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1f2937;line-height:1.7;margin:0 0 16px 0;">
              {{body_paragraph_1}}
            </p>

            {{#body_paragraph_2}}
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1f2937;line-height:1.7;margin:0 0 16px 0;">
              {{body_paragraph_2}}
            </p>
            {{/body_paragraph_2}}

            {{#body_paragraph_3}}
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1f2937;line-height:1.7;margin:0 0 24px 0;">
              {{body_paragraph_3}}
            </p>
            {{/body_paragraph_3}}

            <!-- QUICK TAKES (warm-neutral container, 1–4 bullets) -->
            {{#quick_take_1}}
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:24px 0;">
              <tr>
                <td bgcolor="#f0ede9" style="background-color:#f0ede9;border-radius:8px;padding:24px;font-family:Arial,Helvetica,sans-serif;">
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:#03374f;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 16px 0;">Quick Takes</p>

                  <!-- quick take 1 -->
                  <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;border-bottom:1px solid #e5e7eb;margin:0 0 12px 0;">
                    <tr>
                      <td width="14" valign="top" style="padding:8px 0 12px 0;">
                        <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
                          <tr>
                            <td width="6" height="6" bgcolor="#f26b2b" style="width:6px;height:6px;background-color:#f26b2b;border-radius:3px;font-size:0;line-height:0;">&nbsp;</td>
                          </tr>
                        </table>
                      </td>
                      <td valign="top" style="padding:0 0 12px 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1f2937;line-height:1.5;">
                        {{quick_take_1}}
                      </td>
                    </tr>
                  </table>

                  {{#quick_take_2}}
                  <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;border-bottom:1px solid #e5e7eb;margin:0 0 12px 0;">
                    <tr>
                      <td width="14" valign="top" style="padding:8px 0 12px 0;">
                        <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
                          <tr>
                            <td width="6" height="6" bgcolor="#f26b2b" style="width:6px;height:6px;background-color:#f26b2b;border-radius:3px;font-size:0;line-height:0;">&nbsp;</td>
                          </tr>
                        </table>
                      </td>
                      <td valign="top" style="padding:0 0 12px 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1f2937;line-height:1.5;">
                        {{quick_take_2}}
                      </td>
                    </tr>
                  </table>
                  {{/quick_take_2}}

                  {{#quick_take_3}}
                  <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;border-bottom:1px solid #e5e7eb;margin:0 0 12px 0;">
                    <tr>
                      <td width="14" valign="top" style="padding:8px 0 12px 0;">
                        <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
                          <tr>
                            <td width="6" height="6" bgcolor="#f26b2b" style="width:6px;height:6px;background-color:#f26b2b;border-radius:3px;font-size:0;line-height:0;">&nbsp;</td>
                          </tr>
                        </table>
                      </td>
                      <td valign="top" style="padding:0 0 12px 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1f2937;line-height:1.5;">
                        {{quick_take_3}}
                      </td>
                    </tr>
                  </table>
                  {{/quick_take_3}}

                  {{#quick_take_4}}
                  <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
                    <tr>
                      <td width="14" valign="top" style="padding-top:8px;">
                        <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
                          <tr>
                            <td width="6" height="6" bgcolor="#f26b2b" style="width:6px;height:6px;background-color:#f26b2b;border-radius:3px;font-size:0;line-height:0;">&nbsp;</td>
                          </tr>
                        </table>
                      </td>
                      <td valign="top" style="padding-left:12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1f2937;line-height:1.5;">
                        {{quick_take_4}}
                      </td>
                    </tr>
                  </table>
                  {{/quick_take_4}}

                </td>
              </tr>
            </table>
            {{/quick_take_1}}

            <!-- Navy callout ("What This Means for You") -->
            {{#callout_title}}
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:24px 0;">
              <tr>
                <td bgcolor="#f0ede9" style="background-color:#f0ede9;border-left:4px solid #03374f;border-radius:0 6px 6px 0;padding:20px 24px;font-family:Arial,Helvetica,sans-serif;">
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:#03374f;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px 0;">{{callout_title}}</p>
                  {{#callout_body}}
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1f2937;line-height:1.6;margin:0;">{{callout_body}}</p>
                  {{/callout_body}}
                </td>
              </tr>
            </table>
            {{/callout_title}}

            <!-- REP SIGNATURE BLOCK -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:24px;">
              <tr>
                <td width="72" valign="top" style="padding:24px 16px 0 0;">
                  <img src="{{rep_photo_url}}" alt="{{rep_name}}" width="56" height="56" style="display:block;width:56px;height:56px;border-radius:28px;border:0;outline:none;">
                </td>
                <td valign="top" style="padding-top:24px;">
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#1f2937;margin:0 0 2px 0;line-height:1.2;">{{rep_name}}</p>
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7280;margin:0 0 12px 0;">{{rep_title}}</p>
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1f2937;margin:0 0 4px 0;">
                    <a href="tel:{{rep_phone}}" style="color:#1f2937;text-decoration:none;">{{rep_phone}}</a>
                  </p>
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1f2937;margin:0;">
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
export const TITLE_INDUSTRY_NEWS_META = {
  name:      'Title Industry News',
  category:  'title_news',
  subject:   'Title Industry Update',
  preheader: 'Latest regulatory changes and market intelligence',
} as const
