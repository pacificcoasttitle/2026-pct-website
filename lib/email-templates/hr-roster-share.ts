/**
 * HR "roster directory" share email.
 *
 * Renders a SAFE directory subset of the HR roster as an email-safe HTML
 * table (table-based layout, inline styles — same discipline as the other
 * HR emails so it survives Outlook/Gmail). Branded: PCT navy #03374f,
 * logo2.png on a navy header band, hr@pct.com sender.
 *
 * ⚠️ PRIVACY: this module's public surface (DirectoryRosterRow) is a
 * NARROW subset — it NEVER accepts a full HrEmployee row. The route maps
 * the roster into DirectoryRosterRow[] explicitly, so a sensitive field
 * (personal mobile, birthday, start date, legal name, flags, docs) cannot
 * structurally reach this renderer.
 *
 * ⚠️ ESCAPING: every dynamic value is HTML-escaped before it touches the
 * markup (no injection from a name/title/etc.).
 */

const PCT_BRAND = {
  navy:        '#03374f',
  orange:      '#f26b2b',
  warmNeutral: '#f0ede9',
  white:       '#ffffff',
  textDark:    '#1f2937',
  textMuted:   '#6b7280',
  border:      '#e5e7eb',
} as const

/**
 * ⚠️ SAFE DIRECTORY SUBSET — the ONLY fields that may appear in the email.
 * Deliberately excludes: full_legal_name, mobile, photo_url,
 * onboarding_type, is_new_hire, employment_status, birthday, start_date,
 * vcard_employee_id, staff_member_id, needs_dedup_review,
 * dedup_review_note, deactivated_at, id, audit fields, documents, payload.
 */
export interface DirectoryRosterRow {
  first_name:   string
  last_name:    string
  title:        string | null
  department:   string | null
  office:       string | null
  email:        string        // work email
  office_phone: string | null
}

export interface HrRosterShareContext {
  subject: string
  rows:    DirectoryRosterRow[]
}

/** HTML-escape a value for safe inline insertion (belt: coerce to string). */
function esc(v: string | null | undefined): string {
  if (v == null) return ''
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** A single body cell (escaped). Shows an em-dash for empty values. */
function cell(v: string | null | undefined): string {
  const s = esc(v)
  const display = s.trim() === '' ? '&mdash;' : s
  return `<td style="padding:10px 12px; border-bottom:1px solid ${PCT_BRAND.border}; color:${PCT_BRAND.textDark}; font-size:13px; line-height:18px; vertical-align:top;">${display}</td>`
}

function headerCell(label: string): string {
  return `<th align="left" style="padding:10px 12px; border-bottom:2px solid ${PCT_BRAND.navy}; color:${PCT_BRAND.navy}; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">${esc(label)}</th>`
}

export function renderHrRosterShare(ctx: HrRosterShareContext): string {
  const bodyRows = ctx.rows
    .map((r) => {
      const name = `${(r.first_name ?? '').trim()} ${(r.last_name ?? '').trim()}`.trim()
      return `<tr>
        ${cell(name)}
        ${cell(r.title)}
        ${cell(r.department)}
        ${cell(r.office)}
        ${cell(r.email)}
        ${cell(r.office_phone)}
      </tr>`
    })
    .join('\n')

  const emptyRow = `<tr><td colspan="6" style="padding:18px 12px; color:${PCT_BRAND.textMuted}; font-size:14px; text-align:center;">No active employees to display.</td></tr>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(ctx.subject)}</title>
</head>
<body style="margin:0; padding:0; background-color:${PCT_BRAND.warmNeutral}; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${PCT_BRAND.warmNeutral};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="760" style="max-width:760px; background-color:${PCT_BRAND.white}; border-radius:8px; overflow:hidden; border:1px solid #ded7cc;">

          <!-- HEADER -->
          <tr>
            <td style="background-color:${PCT_BRAND.navy}; padding:26px 32px; text-align:center;">
              <img src="https://www.pct.com/logo2.png" alt="Pacific Coast Title Company" width="170" style="display:block; margin:0 auto 10px;">
              <div style="color:${PCT_BRAND.white}; font-size:20px; font-weight:600; letter-spacing:0.3px;">
                Employee Directory
              </div>
              <div style="color:rgba(255,255,255,0.85); font-size:13px; margin-top:4px;">
                ${ctx.rows.length} active ${ctx.rows.length === 1 ? 'employee' : 'employees'}
              </div>
            </td>
          </tr>

          <!-- INTRO -->
          <tr>
            <td style="padding:22px 32px 8px 32px;">
              <p style="margin:0; color:${PCT_BRAND.textDark}; font-size:15px; line-height:1.6;">
                Here is the current Pacific Coast Title employee directory (active employees only).
              </p>
            </td>
          </tr>

          <!-- TABLE -->
          <tr>
            <td style="padding:12px 24px 8px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse; width:100%;">
                <thead>
                  <tr>
                    ${headerCell('Name')}
                    ${headerCell('Title')}
                    ${headerCell('Department')}
                    ${headerCell('Office')}
                    ${headerCell('Work email')}
                    ${headerCell('Office phone')}
                  </tr>
                </thead>
                <tbody>
                  ${ctx.rows.length > 0 ? bodyRows : emptyRow}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:${PCT_BRAND.warmNeutral}; padding:20px 32px; text-align:center;">
              <div style="color:${PCT_BRAND.textMuted}; font-size:12px; line-height:1.6;">
                Pacific Coast Title Company &nbsp;&middot;&nbsp; Human Resources<br>
                Directory contact details only. Please keep this information internal.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
}
