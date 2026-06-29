/**
 * HR onboarding invite email template (Phase 4b).
 *
 * Admin-triggered: delivers a new hire (or existing employee) their
 * token-gated /hr-onboarding/{token} link. Rendered by
 * renderHrOnboardingInvite(context) and sent via SendGrid by
 * app/api/admin/hr/onboarding/[id]/send/route.ts.
 *
 * Modeled on lib/email-templates/onboarding-welcome.ts (rep variant) —
 * same PCT brand shell (navy header, warm-neutral footer), tables-for-
 * layout, inline styles, hex colors only.
 *
 * Brand: PCT navy #03374f, orange #f26b2b only.
 */
import Mustache from 'mustache'

const PCT_BRAND = {
  navy:        '#03374f',
  orange:      '#f26b2b',
  warmNeutral: '#f0ede9',
  white:       '#ffffff',
  textDark:    '#1f2937',
  textMuted:   '#6b7280',
} as const

export interface HrOnboardingInviteContext {
  subject:           string
  first_name:        string
  onboarding_url:    string
  expiry_label:      string   // e.g. "14 days"
  // When true → existing-employee "confirm your info on file" copy.
  // When false → new-hire welcome/onboard copy. Branding is identical in
  // both cases (this ticket swaps COPY only; visual redesign is later V0).
  is_existing_employee?: boolean
}

// V0-designed, email-safe invite (table HTML, MSO/Outlook VML bulletproof
// button, hidden preheader, mobile overrides). The two modes (new-hire
// welcome / existing-employee confirm) are merged into ONE template via
// the {{#is_existing_employee}} / {{^is_existing_employee}} conditionals;
// everything outside those blocks is identical across both designs.
//
// ⚠️ Mustache notes:
//   - All onboarding_url occurrences (the MSO VML href, the non-MSO
//     <a> href, and the visible fallback link) use TRIPLE mustache
//     {{{onboarding_url}}} so the URL is emitted RAW — not entity-mangled
//     (/ → &#x2F;). Outlook's VML href parser is less forgiving than
//     HTML, so a raw URL is the safe choice in every slot.
//   - {{{onboarding_url}}} inside the <!--[if mso]>…<![endif]--> comment
//     still renders — Mustache processes tags inside HTML comments.
//   - Greeting + expiry are guarded by {{#first_name}} / {{#expiry_label}}
//     so a missing value never renders "Hi ," or a broken expiry line.
export const HR_ONBOARDING_INVITE_TEMPLATE = `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>{{subject}}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Client-specific resets */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a { text-decoration: none; }

    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .px { padding-left: 24px !important; padding-right: 24px !important; }
      .stack { display: block !important; width: 100% !important; }
      .h1 { font-size: 26px !important; line-height: 32px !important; }
      .cta-td { padding-left: 24px !important; padding-right: 24px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:${PCT_BRAND.warmNeutral};">
  <!-- Preheader (hidden) -->
  <div style="display:none; font-size:1px; color:${PCT_BRAND.warmNeutral}; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden; mso-hide:all;">
    {{#is_existing_employee}}A quick check-in — please review and confirm your information on file.{{/is_existing_employee}}{{^is_existing_employee}}Welcome aboard — complete your onboarding in about 10 minutes to get set up.{{/is_existing_employee}}
  </div>

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${PCT_BRAND.warmNeutral};">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Card -->
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background-color:${PCT_BRAND.white}; border:1px solid #ded7cc; border-radius:12px; overflow:hidden;">

          <!-- Header / Logo -->
          <tr>
            <td align="center" class="px" style="padding:36px 40px 8px 40px;">
              <img src="https://www.pct.com/logo2.png" width="160" alt="Pacific Coast Title" style="display:block; width:160px; max-width:160px; height:auto;">
            </td>
          </tr>

          <!-- Accent rule -->
          <tr>
            <td class="px" style="padding:24px 40px 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="font-size:0; line-height:0; height:3px; background-color:${PCT_BRAND.orange}; border-radius:2px;" width="48">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <!-- Title + subtitle -->
          <tr>
            <td class="px" style="padding:20px 40px 0 40px;">
              <h1 class="h1" style="margin:0; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:30px; line-height:36px; color:${PCT_BRAND.navy}; font-weight:700; letter-spacing:-0.2px;">
                {{#is_existing_employee}}Please Confirm Your Information{{/is_existing_employee}}{{^is_existing_employee}}Welcome to Pacific Coast Title{{/is_existing_employee}}
              </h1>
              <p style="margin:8px 0 0 0; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:16px; line-height:22px; color:#6a7782; font-weight:500;">
                {{#is_existing_employee}}Help us keep your records current{{/is_existing_employee}}{{^is_existing_employee}}Let&rsquo;s get you set up{{/is_existing_employee}}
              </p>
            </td>
          </tr>

          <!-- Greeting + body copy -->
          <tr>
            <td class="px" style="padding:24px 40px 0 40px;">
              <p style="margin:0 0 16px 0; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:16px; line-height:25px; color:${PCT_BRAND.navy};">
                Hi {{#first_name}}{{first_name}}{{/first_name}}{{^first_name}}there{{/first_name}},
              </p>
              {{#is_existing_employee}}
              <p style="margin:0 0 16px 0; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:16px; line-height:25px; color:${PCT_BRAND.navy};">
                We&rsquo;re updating our records and want to make sure we have your current information on file.
              </p>
              <p style="margin:0; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:16px; line-height:25px; color:${PCT_BRAND.navy};">
                Please take a few minutes to review and confirm your details. It only takes a moment, and keeps everything accurate for payroll, benefits, and emergencies.
              </p>
              {{/is_existing_employee}}
              {{^is_existing_employee}}
              <p style="margin:0 0 16px 0; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:16px; line-height:25px; color:${PCT_BRAND.navy};">
                We&rsquo;re excited to have you on the team. To get started, please complete your onboarding.
              </p>
              <p style="margin:0; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:16px; line-height:25px; color:${PCT_BRAND.navy};">
                It takes about 10 minutes and collects the information we need to set you up &mdash; your details, emergency contact, and a few required documents.
              </p>
              {{/is_existing_employee}}
            </td>
          </tr>

          <!-- CTA button (bulletproof) -->
          <tr>
            <td align="center" class="cta-td" style="padding:32px 40px 8px 40px;">
              {{#is_existing_employee}}
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{{onboarding_url}}}" style="height:52px;v-text-anchor:middle;width:300px;" arcsize="12%" strokecolor="${PCT_BRAND.orange}" fillcolor="${PCT_BRAND.orange}">
                <w:anchorlock/>
                <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">Confirm My Information</center>
              </v:roundrect>
              <![endif]-->
              {{/is_existing_employee}}
              {{^is_existing_employee}}
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="{{{onboarding_url}}}" style="height:52px;v-text-anchor:middle;width:280px;" arcsize="12%" strokecolor="${PCT_BRAND.orange}" fillcolor="${PCT_BRAND.orange}">
                <w:anchorlock/>
                <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;">Start Onboarding</center>
              </v:roundrect>
              <![endif]-->
              {{/is_existing_employee}}
              <!--[if !mso]><!-- -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                <tr>
                  <td align="center" style="border-radius:8px; background-color:${PCT_BRAND.orange};">
                    <a href="{{{onboarding_url}}}" target="_blank" style="display:inline-block; padding:16px 40px; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:16px; line-height:20px; font-weight:700; color:#ffffff; background-color:${PCT_BRAND.orange}; border-radius:8px;">
                      {{#is_existing_employee}}Confirm My Information{{/is_existing_employee}}{{^is_existing_employee}}Start Onboarding{{/is_existing_employee}}
                    </a>
                  </td>
                </tr>
              </table>
              <!--<![endif]-->
            </td>
          </tr>

          <!-- Fallback link -->
          <tr>
            <td align="center" class="px" style="padding:8px 40px 0 40px;">
              <p style="margin:0; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:13px; line-height:20px; color:#6a7782;">
                Or copy this link into your browser:<br>
                <a href="{{{onboarding_url}}}" target="_blank" style="color:${PCT_BRAND.navy}; text-decoration:underline; word-break:break-all;">{{{onboarding_url}}}</a>
              </p>
              {{#expiry_label}}
              <p style="margin:10px 0 0 0; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:13px; line-height:20px; color:#9aa4ad;">
                This link is valid for {{expiry_label}}. If it expires, ask HR to send a new one.
              </p>
              {{/expiry_label}}
            </td>
          </tr>

          <!-- Reassurance note -->
          <tr>
            <td class="px" style="padding:28px 40px 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${PCT_BRAND.warmNeutral}; border-radius:8px;">
                <tr>
                  <td style="padding:16px 20px; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:14px; line-height:21px; color:${PCT_BRAND.navy};">
                    {{#is_existing_employee}}<strong style="color:${PCT_BRAND.navy};">What to expect:</strong> a short, pre-filled review of your details &mdash; just verify, update anything that&rsquo;s changed, and submit. Your information is encrypted and shared only with our HR team.{{/is_existing_employee}}{{^is_existing_employee}}<strong style="color:${PCT_BRAND.navy};">What to expect:</strong> a short, guided form you can complete in one sitting. Your information is encrypted and shared only with our HR team.{{/is_existing_employee}}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td class="px" style="padding:32px 40px 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="font-size:0; line-height:0; height:1px; background-color:#ded7cc;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="px" style="padding:24px 40px 36px 40px;">
              <p style="margin:0 0 10px 0; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:13px; line-height:20px; color:#6a7782;">
                Questions? Contact Pacific Coast Title HR at
                <a href="mailto:hr@pct.com" style="color:${PCT_BRAND.navy}; text-decoration:underline;">hr@pct.com</a>.
              </p>
              <p style="margin:0 0 10px 0; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:13px; line-height:20px; color:#6a7782;">
                If you weren&rsquo;t expecting this email, please contact HR before taking any action.
              </p>
              <p style="margin:0; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; font-size:12px; line-height:18px; color:#9aa4ad;">
                This message and any links are confidential and intended only for the named recipient.
                &copy; Pacific Coast Title. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
</body>
</html>
`.trim()

export function renderHrOnboardingInvite(ctx: HrOnboardingInviteContext): string {
  const data: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(ctx)) {
    data[k] = v === null || v === undefined ? '' : v
  }
  return Mustache.render(HR_ONBOARDING_INVITE_TEMPLATE, data)
}
