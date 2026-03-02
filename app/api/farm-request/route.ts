import { NextRequest, NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'
import { insertFarmRequest } from '@/lib/admin-db'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

const LIST_TYPE_LABELS: Record<string, string> = {
  OUT_OF_STATE:  'Out-of-State Owners',
  EMPTY_NESTER:  'Empty Nesters',
  ABSENTEE:      'Absentee Owners',
  JUST_LISTED:   'Just Listed',
  JUST_SOLD:     'Just Sold',
  NEW_MOVER:     'New Movers',
  INVESTOR:      'Investors',
  OTHER:         'Other',
}

const LIST_SIZE_LABELS: Record<string, string> = {
  UNDER_100:  'Under 100',
  '100_250':  '100–250',
  '250_500':  '250–500',
  '500_1000': '500–1,000',
  '1000_PLUS':'1,000+',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      list_type, city_area, property_address, radius, list_size,
      output_formats, notes, contact_name, contact_email, contact_phone,
      rep_slug, rep_name, rep_email,
    } = body

    // Basic validation
    if (!list_type || !city_area || !list_size || !contact_name || !contact_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Save to DB
    const id = await insertFarmRequest({
      list_type,
      city_area,
      property_address: property_address || '',
      radius:           radius || '',
      list_size,
      output_formats:   output_formats || ['pdf'],
      notes:            notes || '',
      contact_name,
      contact_email,
      contact_phone:    contact_phone || '',
      rep_id:           rep_slug || '',
      rep_name:         rep_name || '',
      rep_email:        rep_email || '',
      source_channel:   'web',
    })

    const listLabel = LIST_TYPE_LABELS[list_type] ?? list_type
    const sizeLabel = LIST_SIZE_LABELS[list_size] ?? list_size
    const formats   = (output_formats as string[] ?? ['pdf']).map((f) => f.toUpperCase()).join(', ')

    // Email to rep (if they have email)
    if (rep_email) {
      await sgMail.send({
        to:      rep_email,
        from:    { email: 'no-reply@pct.com', name: 'PCT Farm System' },
        subject: `📋 New Farm Request from ${contact_name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
            <div style="background:#03374f;padding:24px 32px;border-radius:12px 12px 0 0">
              <img src="https://www.pct.com/logo2.png" alt="PCT" height="36" style="opacity:.9" />
            </div>
            <div style="background:#f8f6f3;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e1dc">
              <h2 style="color:#03374f;margin-top:0">New Farm Request</h2>
              <p>Hi ${rep_name?.split(' ')[0] ?? 'there'},</p>
              <p>You have a new farm list request via your PCT profile page.</p>

              <table style="width:100%;border-collapse:collapse;margin:20px 0">
                <tr style="border-bottom:1px solid #e5e1dc">
                  <td style="padding:10px 0;color:#666;width:40%">List Type</td>
                  <td style="padding:10px 0;font-weight:bold;color:#03374f">${listLabel}</td>
                </tr>
                <tr style="border-bottom:1px solid #e5e1dc">
                  <td style="padding:10px 0;color:#666">City / Area</td>
                  <td style="padding:10px 0;font-weight:bold;color:#03374f">${city_area}</td>
                </tr>
                ${property_address ? `<tr style="border-bottom:1px solid #e5e1dc">
                  <td style="padding:10px 0;color:#666">Property Address</td>
                  <td style="padding:10px 0;color:#03374f">${property_address}</td>
                </tr>` : ''}
                ${radius ? `<tr style="border-bottom:1px solid #e5e1dc">
                  <td style="padding:10px 0;color:#666">Radius</td>
                  <td style="padding:10px 0;color:#03374f">${radius}</td>
                </tr>` : ''}
                <tr style="border-bottom:1px solid #e5e1dc">
                  <td style="padding:10px 0;color:#666">List Size</td>
                  <td style="padding:10px 0;font-weight:bold;color:#03374f">${sizeLabel}</td>
                </tr>
                <tr style="border-bottom:1px solid #e5e1dc">
                  <td style="padding:10px 0;color:#666">Output Format</td>
                  <td style="padding:10px 0;color:#03374f">${formats}</td>
                </tr>
                ${notes ? `<tr style="border-bottom:1px solid #e5e1dc">
                  <td style="padding:10px 0;color:#666">Notes</td>
                  <td style="padding:10px 0;color:#03374f">${notes}</td>
                </tr>` : ''}
              </table>

              <div style="background:#fff;border:1px solid #e5e1dc;border-radius:8px;padding:16px;margin:20px 0">
                <h3 style="margin:0 0 12px;color:#03374f;font-size:14px;text-transform:uppercase;letter-spacing:.05em">Agent Info</h3>
                <p style="margin:4px 0"><strong>${contact_name}</strong></p>
                <p style="margin:4px 0"><a href="mailto:${contact_email}" style="color:#f26b2b">${contact_email}</a></p>
                ${contact_phone ? `<p style="margin:4px 0"><a href="tel:${contact_phone}" style="color:#f26b2b">${contact_phone}</a></p>` : ''}
              </div>

              <p style="font-size:12px;color:#999;margin-top:24px">
                Request #${id} · Submitted ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}
                · <a href="https://www.pct.com/admin/team/farms" style="color:#f26b2b">View in Admin</a>
              </p>
            </div>
          </div>
        `,
      })
    }

    // Confirmation to agent
    await sgMail.send({
      to:      contact_email,
      from:    { email: 'no-reply@pct.com', name: 'Pacific Coast Title' },
      subject: `Your Farm Request Has Been Received`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
          <div style="background:#03374f;padding:24px 32px;border-radius:12px 12px 0 0">
            <img src="https://www.pct.com/logo2.png" alt="PCT" height="36" style="opacity:.9" />
          </div>
          <div style="background:#f8f6f3;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e1dc">
            <h2 style="color:#03374f;margin-top:0">Request Received!</h2>
            <p>Hi ${contact_name?.split(' ')[0] ?? 'there'},</p>
            <p>We've received your farm list request and ${rep_name ? `<strong>${rep_name}</strong> has been notified` : 'your PCT rep has been notified'}. You can expect to hear back within 1–2 business days.</p>
            <p style="font-size:13px;color:#888">List: <strong>${listLabel}</strong> · Area: <strong>${city_area}</strong> · Size: <strong>${sizeLabel}</strong></p>
            <p>Questions? Reply to this email or call <a href="tel:+18667241050" style="color:#f26b2b">(866) 724-1050</a>.</p>
            <p style="font-size:12px;color:#999;margin-top:24px">Pacific Coast Title Company · Request #${id}</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true, id })
  } catch (err) {
    console.error('Farm request error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
