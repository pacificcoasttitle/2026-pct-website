import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isAuthenticated, verifyAdminToken, ADMIN_COOKIE } from '@/lib/admin-auth'
import { sendBatchMms, sendSingleSms, sendTextBatch } from '@/lib/render-sms'
import {
  getEmployeeAdminBySlug,
  getSmsEmployees,
  recordSmsSendLog,
  buildRecipientsFromResponse,
  smsPhoneLast4,
  type SmsSendLogRecipient,
} from '@/lib/admin-db'

export const runtime = 'nodejs'

function defaultPreviewMode() {
  return process.env.RENDER_SMS_PREVIEW_MODE === 'true'
}

function defaultTestPhone() {
  return process.env.RENDER_SMS_TEST_PHONE || undefined
}

async function currentActor(): Promise<string | null> {
  try {
    const jar = await cookies()
    const token = jar.get(ADMIN_COOKIE)?.value
    if (!token) return null
    const session = await verifyAdminToken(token)
    return session?.username ?? null
  } catch { return null }
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    serviceUrl: process.env.RENDER_API_URL || 'https://main-website-files.onrender.com',
    defaultPreviewMode: defaultPreviewMode(),
    defaultTestPhone: defaultTestPhone() ?? null,
  })
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const mode = body.mode === 'text' ? 'text' : 'mms'
    const sendModeRaw = String(body.send_mode || '').trim() || null
    const message = String(body.message || '').trim()
    const preview_mode =
      typeof body.preview_mode === 'boolean' ? body.preview_mode : defaultPreviewMode()
    const test_phone = String(body.test_phone || defaultTestPhone() || '').trim() || undefined
    const actor = await currentActor()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const single_rep_slug = String(body.single_rep_slug || '').trim() || undefined

    // ── Single-rep TEXT — call Render /api/send-single directly ──
    if (mode === 'text' && single_rep_slug) {
      const rep = await getEmployeeAdminBySlug(single_rep_slug)
      if (!rep) return NextResponse.json({ error: 'Rep not found' }, { status: 404 })
      const phone = test_phone || rep.mobile
      if (!phone) return NextResponse.json({ error: `${rep.name} has no mobile on file. Add a Test Phone.` }, { status: 400 })
      const data = await sendSingleSms({ phone, message, preview_mode })
      const ok = Boolean(data.success)

      const log_id = await recordSmsSendLog({
        mode: 'single-text',
        send_mode: sendModeRaw ?? 'single',
        preview_mode,
        test_phone: test_phone ?? null,
        message,
        image_urls: null,
        total: 1,
        successful: ok ? 1 : 0,
        failed: ok ? 0 : 1,
        success: ok,
        error: ok ? null : (data.error ? String(data.error) : 'Send failed'),
        raw_response: data,
        actor,
        recipients: [{
          rep_slug:    rep.slug,
          rep_name:    rep.name,
          sms_code:    rep.sms_code ?? null,
          phone_last4: smsPhoneLast4(phone),
          status:      ok ? 'sent' : 'failed',
          error:       ok ? null : (data.error ? String(data.error) : 'Send failed'),
        }],
      })

      return NextResponse.json(
        { ...data, log_id, mode: 'single-text', target: { slug: rep.slug, name: rep.name, phone, sms_code: rep.sms_code } },
        { status: ok ? 200 : 502 },
      )
    }

    if (mode === 'text') {
      const data = await sendTextBatch({ message, preview_mode, test_phone })
      // Build recipient rows from response, falling back to the active rep roster
      const allReps = await getSmsEmployees()
      const fallback: SmsSendLogRecipient[] = allReps
        .filter((e) => e.active)
        .map((e) => ({
          rep_slug:    e.slug,
          rep_name:    e.name,
          sms_code:    e.sms_code,
          phone_last4: smsPhoneLast4(test_phone || e.mobile),
          status:      data.success ? 'sent' : 'unknown',
          error:       null,
        }))
      const recipients = buildRecipientsFromResponse(data, fallback)
      const ok = Boolean(data.success)

      const r = data as Record<string, unknown>
      const sentFromList   = recipients.filter((x) => (x.status || '').toLowerCase() === 'sent').length
      const failedFromList = recipients.filter((x) => {
        const s = (x.status || '').toLowerCase()
        return s === 'failed' || s === 'error'
      }).length
      const totalCount      = Number(r.total      ?? r.recipient_count ?? recipients.length)
      const successfulCount = Number(r.successful ?? r.success_count   ?? (recipients.length ? sentFromList   : (ok ? totalCount : 0)))
      const failedCount     = Number(r.failed     ?? r.fail_count      ?? (recipients.length ? failedFromList : (ok ? 0 : totalCount)))

      const log_id = await recordSmsSendLog({
        mode: 'text',
        send_mode: sendModeRaw ?? 'all',
        preview_mode,
        test_phone: test_phone ?? null,
        message,
        image_urls: null,
        total:       totalCount,
        successful:  successfulCount,
        failed:      failedCount,
        success:     ok,
        error:       ok ? null : (data.error ? String(data.error) : null),
        raw_response: data,
        actor,
        recipients,
      })

      return NextResponse.json({ ...data, log_id }, { status: data.success ? 200 : 502 })
    }

    const imageUrls = Array.isArray(body.imageUrls)
      ? body.imageUrls.map((v: unknown) => String(v || '').trim()).filter(Boolean)
      : []
    if (!imageUrls.length) {
      return NextResponse.json({ error: 'At least one image URL is required for MMS' }, { status: 400 })
    }

    const send_to_all = Boolean(body.send_to_all)
    const images = imageUrls.map((url: string) => ({ url }))
    const data = await sendBatchMms({
      images,
      message,
      send_to_all,
      preview_mode,
      test_phone,
    })

    // Surface a clearer message when Render returns success:false but no error
    if (!data.success && !data.error) {
      const failed   = (data as { failed?: number }).failed
      const total    = (data as { total?: number }).total
      const summary  = `SMS service rejected the batch (${failed ?? '?'} of ${total ?? '?'} failed). Check Render logs and that R2 image URLs are publicly fetchable.`
      ;(data as { error?: string }).error = summary
    }

    // Recipient log for MMS — Render usually returns a `recipients` array
    // somewhere in the payload. buildRecipientsFromResponse digs through
    // common wrappers and key aliases so we don't lose the per-rep detail.
    const recipients = buildRecipientsFromResponse(data, [])
    const ok = Boolean(data.success)

    // Totals: Render uses success_count / fail_count / recipient_count
    // (per docs/SYSTEMS-TECHNICAL-INTERNALS.md), but other batch shapes
    // use successful / failed / total. Derive from the recipient list as
    // a final fallback so the log always reflects reality.
    const r = data as Record<string, unknown>
    const sentFromList   = recipients.filter((x) => (x.status || '').toLowerCase() === 'sent').length
    const failedFromList = recipients.filter((x) => {
      const s = (x.status || '').toLowerCase()
      return s === 'failed' || s === 'error'
    }).length
    const totalCount      = Number(r.total      ?? r.recipient_count ?? recipients.length)
    const successfulCount = Number(r.successful ?? r.success_count   ?? (recipients.length ? sentFromList   : (ok ? totalCount : 0)))
    const failedCount     = Number(r.failed     ?? r.fail_count      ?? (recipients.length ? failedFromList : (ok ? 0 : totalCount || 1)))

    const log_id = await recordSmsSendLog({
      mode: 'mms',
      send_mode: sendModeRaw,
      preview_mode,
      test_phone: test_phone ?? null,
      message,
      image_urls: imageUrls,
      total:       totalCount,
      successful:  successfulCount,
      failed:      failedCount,
      success:     ok,
      error:       ok ? null : (data.error ? String(data.error) : null),
      raw_response: data,
      actor,
      recipients,
    })

    return NextResponse.json({ ...data, log_id }, { status: data.success ? 200 : 502 })
  } catch (err) {
    console.error('SMS Studio API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
