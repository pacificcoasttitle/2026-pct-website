/**
 * Product Spotlight — Outlook-safe email template.
 *
 * Translated from the V0 product-spotlight-email design (V2 of 4).
 * Shares the brand system established in V1 (Holiday Greeting):
 *   - EmailHeader = navy bar + logo
 *   - SectionLabel = navy eyebrow pill
 *   - CalloutBox (orange variant) = #fdf4f0 tint + orange left border
 *   - CTAButton = bulletproof Outlook button (table + bgcolor + anchor)
 *   - RepSignature = circular avatar + name/title/contact
 *   - EmailFooter = warm-neutral panel + Unsubscribe / Manage Preferences
 *
 * Same hard rules as lib/signature-templates/corporate-standard.ts:
 *   - Tables for all layout, no <div> for layout
 *   - Inline CSS only, web-safe fonts only (Arial, Helvetica, sans-serif)
 *   - Absolute https:// URLs for every image
 *   - cellpadding="0" cellspacing="0" border="0" role="presentation"
 *   - mso-table-lspace/rspace:0pt on every table style
 *   - bgcolor attribute in addition to inline background-color CSS
 *   - No background-image, no @media, no flex/grid, no rgba, no SVG
 *
 * Mustache placeholders:
 *   {{eyebrow_label}}      — short uppercase label (e.g. "PRODUCT SPOTLIGHT")
 *   {{headline}}           — main product/feature headline
 *   {{hero_image}}         — product image URL (required for this template)
 *   {{body_paragraph_1}}   — first paragraph (required)
 *   {{body_paragraph_2}}   — second paragraph (conditional)
 *   {{body_paragraph_3}}   — third paragraph (conditional)
 *   {{callout_title}}      — orange callout title (conditional, pair with body)
 *   {{callout_body}}       — orange callout body  (conditional)
 *   {{cta_url}}            — primary CTA destination URL
 *   {{cta_text}}           — primary CTA button label
 *   {{rep_name}} {{rep_title}} {{rep_phone}} {{rep_email}} {{rep_photo_url}}
 *
 * Conditional sections use {{#field}}…{{/field}}.
 *
 * The V0 design also contains:
 *   - A decorative hero placeholder with inline SVG + linear-gradient
 *     → translated to a plain <img src="{{hero_image}}"> (SVG + gradients
 *     are banned by the Outlook-safety rules)
 *   - A "Key Benefits" bullet list with orange checkmark circles
 *     → omitted; admins can express the same content as body_paragraph_2/3.
 *     If we need a structured benefits block later we can add a second
 *     template variant. Keeping the placeholder surface small for V2.
 */

export const PRODUCT_SPOTLIGHT_HTML = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#f0ede9;">
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
            {{#eyebrow_label}}
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin-bottom:24px;">
              <tr>
                <td bgcolor="#03374f" style="background-color:#03374f;border-radius:4px;padding:6px 12px;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:#ffffff;text-transform:uppercase;letter-spacing:0.1em;">
                  {{eyebrow_label}}
                </td>
              </tr>
            </table>
            {{/eyebrow_label}}

            <!-- Hero image -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 0 24px 0;">
              <tr>
                <td>
                  <img src="{{hero_image}}" alt="{{headline}}" width="536" style="display:block;width:100%;max-width:536px;height:auto;border:0;outline:none;border-radius:8px;">
                </td>
              </tr>
            </table>

            <!-- Headline -->
            <h1 style="font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:bold;color:#03374f;margin:0 0 20px 0;line-height:1.2;">{{headline}}</h1>

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
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1f2937;line-height:1.7;margin:0 0 16px 0;">
              {{body_paragraph_3}}
            </p>
            {{/body_paragraph_3}}

            <!-- Orange "Why this matters" callout -->
            {{#callout_title}}
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:24px 0;">
              <tr>
                <td bgcolor="#fdf4f0" style="background-color:#fdf4f0;border-left:4px solid #f26b2b;border-radius:0 6px 6px 0;padding:20px 24px;font-family:Arial,Helvetica,sans-serif;">
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;color:#f26b2b;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px 0;">{{callout_title}}</p>
                  {{#callout_body}}
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1f2937;line-height:1.6;margin:0;">{{callout_body}}</p>
                  {{/callout_body}}
                </td>
              </tr>
            </table>
            {{/callout_title}}

            <!-- CTA Button (bulletproof) -->
            {{#cta_url}}
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:8px 0 24px 0;">
              <tr>
                <td align="center">
                  <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;">
                    <tr>
                      <td bgcolor="#f26b2b" style="background-color:#f26b2b;border-radius:6px;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;">
                        <a href="{{cta_url}}" style="color:#ffffff;text-decoration:none;display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;">{{cta_text}}</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
            {{/cta_url}}

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
export const PRODUCT_SPOTLIGHT_META = {
  name:      'Product Spotlight',
  category:  'product',
  subject:   'Introducing PCT TitleHub: Faster Title Searches at Your Fingertips',
  preheader: 'A new tool to help you serve clients faster',
} as const
