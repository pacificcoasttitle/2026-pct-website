/**
 * Market Update — Outlook-safe email template (V4 of 4).
 *
 * Translated from the V0 market-update-email composition. Inherits the
 * shared brand system established in V1–V3:
 *   - Navy header + 150px logo
 *   - Navy eyebrow pill (paired here with right-aligned date/region line)
 *   - Headline
 *   - 2×2 metric card grid (the signature element of this template)
 *   - Optional chart image (replaces V0's fake CSS bar chart)
 *   - Commentary paragraphs + heading
 *   - Orange-accent callout box ("What Agents Should Know")
 *   - Rep signature + warm-neutral footer
 *
 * Same hard rules as V1–V3:
 *   - Tables for all layout, no <div> for layout
 *   - Inline CSS only, web-safe fonts only
 *   - Absolute https:// URLs for every <img>
 *   - cellpadding="0" cellspacing="0" border="0" role="presentation"
 *   - mso-table-lspace/rspace:0pt on every table
 *   - bgcolor + inline background-color on every color block
 *   - No background-image, no @media, no flex/grid, no rgba, no SVG
 *
 * Two challenging elements worth calling out:
 *
 * 1) METRIC GRID. V0 uses CSS grid(repeat(2,1fr)). Outlook ignores grid,
 *    so we render a 2×2 <table> and use border-collapse:separate with
 *    border-spacing:8px to create visible gaps between cards. This is the
 *    one place in the entire template system where we intentionally
 *    deviate from border-collapse:collapse — separate spacing is the only
 *    portable way to put white gaps between bordered cells.
 *
 * 2) CHART. V0 fakes a bar chart with colored <div>s of varying heights.
 *    There's no clean Outlook equivalent. We replace it with an optional
 *    {{chart_image}} the admin can upload per campaign via TinyMCE.
 *    Gracefully absent when not provided.
 *
 * Mustache placeholders:
 *   {{eyebrow_label}}       — short uppercase label (e.g. "MARKET UPDATE")
 *   {{date_and_region}}     — right-aligned date/region (e.g. "Week of Jan 15, 2026 · LA County")
 *   {{headline}}            — main takeaway headline (required)
 *
 *   {{metric_N_label}}      — N=1..4, e.g. "Median Sale Price" (required per card)
 *   {{metric_N_value}}      — N=1..4, e.g. "$945K"             (required per card)
 *   {{metric_N_trend_arrow}}— N=1..4, optional. One of: ↑  ↓  →
 *   {{metric_N_trend_color}}— N=1..4, optional. One of:
 *                             #10b981 (up / green)
 *                             #ef4444 (down / red)
 *                             #6b7280 (flat / gray)
 *     Cards 2–4 are each independently conditional on their {label}.
 *     If a card has no trend arrow, the trend row is skipped.
 *
 *   {{chart_image}}         — optional hosted chart PNG (conditional)
 *   {{chart_caption}}       — optional caption under the chart (conditional)
 *
 *   {{commentary_heading}}  — e.g. "Trend Commentary" (conditional)
 *   {{commentary_paragraph_1}} — first commentary paragraph (conditional)
 *   {{commentary_paragraph_2}} — second commentary paragraph (conditional)
 *
 *   {{callout_title}}       — orange-accent callout title (conditional, pair w/ body)
 *   {{callout_body}}        — orange-accent callout body  (conditional)
 *
 *   {{rep_name}} {{rep_title}} {{rep_phone}} {{rep_email}} {{rep_photo_url}}
 *
 * V0 deviations worth noting:
 *   - V0's eyebrow + date pair uses flex. Translated to a 2-column
 *     <table> with eyebrow left, date right-aligned. Same approach as V3.
 *   - V0's CSS-grid metric layout becomes a 2×2 table with
 *     border-spacing:8px (see note above).
 *   - V0's CSS bar chart becomes an optional uploaded image.
 *   - V0's callout uses variant="orange" — we render an orange left border
 *     (#f26b2b) on a warm-neutral container.
 *
 * Subject/preheader: the spec proposes "Market Update — {{date_and_region}}".
 * The existing campaign send pipeline only substitutes the legacy uppercase
 * merge tags (e.g. {{REP_NAME}}); a lowercase {{date_and_region}} would
 * leak literally into the inbox. Defaulting to a static subject; admins
 * customize per-campaign in the wizard.
 */

export const MARKET_UPDATE_HTML = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#f0ede9;">
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

            <!-- Eyebrow + date/region pair -->
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
                {{#date_and_region}}
                <td valign="middle" align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6b7280;">
                  {{date_and_region}}
                </td>
                {{/date_and_region}}
              </tr>
            </table>

            <!-- Headline -->
            <h1 style="font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:bold;color:#03374f;margin:0 0 24px 0;line-height:1.25;">{{headline}}</h1>

            <!-- METRIC GRID (2×2). border-collapse:separate + border-spacing for gaps. -->
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:separate;border-spacing:8px 8px;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 0 32px 0;">
              <tr>
                <td width="50%" valign="top" align="center" bgcolor="#ffffff" style="width:50%;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;font-family:Arial,Helvetica,sans-serif;">
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px 0;">{{metric_1_label}}</p>
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:bold;color:#03374f;margin:0;line-height:1.2;">{{metric_1_value}}</p>
                  {{#metric_1_trend_arrow}}
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:{{metric_1_trend_color}};margin:4px 0 0 0;">{{metric_1_trend_arrow}}</p>
                  {{/metric_1_trend_arrow}}
                </td>
                <td width="50%" valign="top" align="center" bgcolor="#ffffff" style="width:50%;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;font-family:Arial,Helvetica,sans-serif;">
                  {{#metric_2_label}}
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px 0;">{{metric_2_label}}</p>
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:bold;color:#03374f;margin:0;line-height:1.2;">{{metric_2_value}}</p>
                  {{#metric_2_trend_arrow}}
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:{{metric_2_trend_color}};margin:4px 0 0 0;">{{metric_2_trend_arrow}}</p>
                  {{/metric_2_trend_arrow}}
                  {{/metric_2_label}}
                </td>
              </tr>
              <tr>
                <td width="50%" valign="top" align="center" bgcolor="#ffffff" style="width:50%;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;font-family:Arial,Helvetica,sans-serif;">
                  {{#metric_3_label}}
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px 0;">{{metric_3_label}}</p>
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:bold;color:#03374f;margin:0;line-height:1.2;">{{metric_3_value}}</p>
                  {{#metric_3_trend_arrow}}
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:{{metric_3_trend_color}};margin:4px 0 0 0;">{{metric_3_trend_arrow}}</p>
                  {{/metric_3_trend_arrow}}
                  {{/metric_3_label}}
                </td>
                <td width="50%" valign="top" align="center" bgcolor="#ffffff" style="width:50%;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;font-family:Arial,Helvetica,sans-serif;">
                  {{#metric_4_label}}
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px 0;">{{metric_4_label}}</p>
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:bold;color:#03374f;margin:0;line-height:1.2;">{{metric_4_value}}</p>
                  {{#metric_4_trend_arrow}}
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:{{metric_4_trend_color}};margin:4px 0 0 0;">{{metric_4_trend_arrow}}</p>
                  {{/metric_4_trend_arrow}}
                  {{/metric_4_label}}
                </td>
              </tr>
            </table>

            <!-- Optional chart image -->
            {{#chart_image}}
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:0 0 24px 0;">
              <tr>
                <td>
                  <img src="{{chart_image}}" alt="Market trend chart" width="536" style="display:block;width:100%;max-width:536px;height:auto;border:0;outline:none;border-radius:8px;">
                  {{#chart_caption}}
                  <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#6b7280;font-style:italic;text-align:center;margin:8px 0 0 0;">{{chart_caption}}</p>
                  {{/chart_caption}}
                </td>
              </tr>
            </table>
            {{/chart_image}}

            <!-- Commentary heading -->
            {{#commentary_heading}}
            <h2 style="font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#03374f;margin:0 0 16px 0;">{{commentary_heading}}</h2>
            {{/commentary_heading}}

            <!-- Commentary paragraphs -->
            {{#commentary_paragraph_1}}
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1f2937;line-height:1.7;margin:0 0 16px 0;">
              {{commentary_paragraph_1}}
            </p>
            {{/commentary_paragraph_1}}

            {{#commentary_paragraph_2}}
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#1f2937;line-height:1.7;margin:0 0 24px 0;">
              {{commentary_paragraph_2}}
            </p>
            {{/commentary_paragraph_2}}

            <!-- Orange-accent callout ("What Agents Should Know") -->
            {{#callout_title}}
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;margin:24px 0;">
              <tr>
                <td bgcolor="#f0ede9" style="background-color:#f0ede9;border-left:4px solid #f26b2b;border-radius:0 6px 6px 0;padding:20px 24px;font-family:Arial,Helvetica,sans-serif;">
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
export const MARKET_UPDATE_META = {
  name:      'Market Update',
  category:  'market_update',
  subject:   'Market Update',
  preheader: "This week's market intelligence",
} as const
