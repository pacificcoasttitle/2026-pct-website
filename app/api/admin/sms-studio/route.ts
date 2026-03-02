import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { sendBatchMms, sendTextBatch } from '@/lib/render-sms'

export const runtime = 'nodejs'

function defaultPreviewMode() {
  return process.env.RENDER_SMS_PREVIEW_MODE === 'true'
}

function defaultTestPhone() {
  return process.env.RENDER_SMS_TEST_PHONE || undefined
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
    const message = String(body.message || '').trim()
    const preview_mode =
      typeof body.preview_mode === 'boolean' ? body.preview_mode : defaultPreviewMode()
    const test_phone = String(body.test_phone || defaultTestPhone() || '').trim() || undefined

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (mode === 'text') {
      const data = await sendTextBatch({ message, preview_mode, test_phone })
      return NextResponse.json(data, { status: data.success ? 200 : 502 })
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
    return NextResponse.json(data, { status: data.success ? 200 : 502 })
  } catch (err) {
    console.error('SMS Studio API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

