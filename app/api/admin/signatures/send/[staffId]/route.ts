import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import sgMail from '@sendgrid/mail'
import { isAuthenticated, verifyAdminToken, ADMIN_COOKIE } from '@/lib/admin-auth'
import { renderSignatureForStaff, SignatureRenderError } from '@/lib/signature-renderer'

export const runtime = 'nodejs'

/* ─── SendGrid lazy-init (same pattern as lib/fincen-email.ts) ─── */
let sgInitialized = false
function getSg(): typeof sgMail | null {
  const key = process.env.SENDGRID_API_KEY
  if (!key) return null
  if (!sgInitialized) {
    sgMail.setApiKey(key)
    sgInitialized = true
  }
  return sgMail
}

async function getActorEmail(): Promise<string | null> {
  try {
    const jar = await cookies()
    const token = jar.get(ADMIN_COOKIE)?.value
    if (!token) return null
    const session = await verifyAdminToken(token)
    return session?.username || null
  } catch {
    return null
  }
}

const SETUP_INSTRUCTIONS_HTML = `
  <ol style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#374151;">
    <li><strong>Open this email in a web browser</strong> (Chrome, Edge, or Safari) &mdash; not in Outlook itself. Outlook strips formatting on paste.</li>
    <li><strong>Select your signature above:</strong> Click just before "[Name]" and drag down to select the entire signature block.</li>
    <li><strong>Copy:</strong> Press Ctrl+C (Windows) or Cmd+C (Mac).</li>
    <li><strong>Open Outlook</strong> and go to: File &rarr; Options &rarr; Mail &rarr; Signatures (Outlook Desktop) OR Settings (gear) &rarr; View all Outlook settings &rarr; Mail &rarr; Compose and reply (Outlook Web)</li>
    <li><strong>Create a new signature</strong> called "PCT Standard".</li>
    <li><strong>Click in the signature edit area</strong> and press Ctrl+V (Cmd+V) to paste.</li>
    <li><strong>Set as default:</strong> Choose this signature for "New messages" and "Replies/forwards".</li>
    <li><strong>Save</strong> and send yourself a test email to verify.</li>
  </ol>
`

function buildEmailBody(firstName: string, signatureHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Your PCT Email Signature</title></head>
<body style="margin:0;padding:24px;background-color:#f9fafb;font-family:Arial,sans-serif;color:#1f2937;">
  <table cellpadding="0" cellspacing="0" border="0" width="600" align="center" style="background-color:#ffffff;border-collapse:collapse;border-radius:8px;padding:32px;">
    <tr>
      <td>
        <p style="font-size:16px;line-height:1.5;margin:0 0 16px 0;">Hi ${escapeHtml(firstName)},</p>
        <p style="font-size:14px;line-height:1.6;color:#374151;margin:0 0 24px 0;">
          Your standardized Pacific Coast Title email signature is below. Follow the steps to install it in Outlook.
        </p>

        <h2 style="font-size:18px;color:#03374f;margin:24px 0 12px 0;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">Your Signature:</h2>
        <div style="padding:16px;background-color:#ffffff;border:1px solid #e5e7eb;border-radius:4px;margin-bottom:24px;">
          ${signatureHtml}
        </div>

        <h2 style="font-size:18px;color:#03374f;margin:32px 0 12px 0;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">How to Install:</h2>
        ${SETUP_INSTRUCTIONS_HTML}

        <p style="font-size:13px;color:#6b7280;margin:32px 0 0 0;line-height:1.5;border-top:1px solid #e5e7eb;padding-top:16px;">
          If you have any questions, contact the Marketing team at
          <a href="mailto:ghernandez@pct.com" style="color:#f26b2b;text-decoration:none;">ghernandez@pct.com</a>
          or
          <a href="mailto:jdominguez@pct.com" style="color:#f26b2b;text-decoration:none;">jdominguez@pct.com</a>.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function escapeHtml(v: string): string {
  return v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ staffId: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { staffId: staffIdRaw } = await params
  const staffId = parseInt(staffIdRaw, 10)
  if (!Number.isFinite(staffId) || staffId <= 0) {
    return NextResponse.json({ error: 'Invalid staff id' }, { status: 400 })
  }

  const adminEmail = (await getActorEmail()) || 'unknown'

  let rendered
  try {
    rendered = await renderSignatureForStaff(staffId)
  } catch (err) {
    if (err instanceof SignatureRenderError) {
      if (err.code === 'STAFF_NOT_FOUND') {
        return NextResponse.json({ error: err.message }, { status: 404 })
      }
      console.error(`[signature-send] ${err.code}:`, err.message)
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    console.error('[signature-send] render error:', err)
    return NextResponse.json({ error: 'Failed to render signature' }, { status: 500 })
  }

  const { staff, html: signatureHtml } = rendered

  const sg = getSg()
  if (!sg) {
    console.error('[signature-send] SENDGRID_API_KEY not configured')
    return NextResponse.json(
      { error: 'Email service not configured. Add SENDGRID_API_KEY to environment.' },
      { status: 503 }
    )
  }

  const emailBody = buildEmailBody(staff.first_name, signatureHtml)

  try {
    await sg.send({
      to:      staff.email,
      from:    { email: 'marketing@pct.com', name: 'PCT Signature Center' },
      subject: 'Your PCT Email Signature is Ready',
      html:    emailBody,
    })
  } catch (err) {
    console.error('[signature-send] SendGrid send failed:', err)
    return NextResponse.json({ error: 'Failed to send signature email' }, { status: 500 })
  }

  const sentAt = new Date().toISOString()
  console.log(
    `[signature-send] admin=${adminEmail} staff_id=${staffId} staff_email=${staff.email} sent_at=${sentAt}`
  )

  return NextResponse.json({
    staff_id:    staff.id,
    staff_name:  `${staff.first_name} ${staff.last_name}`,
    staff_email: staff.email,
    sent:        true,
    sent_at:     sentAt,
  })
}
