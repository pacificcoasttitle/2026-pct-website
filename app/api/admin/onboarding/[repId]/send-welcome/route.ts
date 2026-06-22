/**
 * POST /api/admin/onboarding/[repId]/send-welcome
 *
 * Admin-triggered welcome email (Phase 2e). Regenerates the onboarding
 * token via issueOnboardingToken (overwriting the stored hash → any
 * prior link dies), emails the rep their /onboarding/{token} link via
 * SendGrid, and stamps welcome_sent_at. The raw token is NEVER echoed
 * in the response or logged.
 */
import { NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'
import { requireApiRole } from '@/lib/auth/guards'
import {
  getOnboarding,
  getEmployeeAdminById,
  issueOnboardingToken,
  markOnboardingWelcomeSent,
} from '@/lib/admin-db'
import { renderOnboardingWelcome } from '@/lib/email-templates/onboarding-welcome'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUBJECT = 'Welcome to Pacific Coast Title — let\'s get you set up'
const SITE_BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pct.com').replace(/\/$/, '')

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

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ repId: string }> },
) {
  const auth = await requireApiRole('onboarding')
  if ('error' in auth) return auth.error

  const adminEmail = auth.session.username || 'unknown'
  const { repId: repIdRaw } = await params
  const repId = parseInt(repIdRaw, 10)
  if (!Number.isFinite(repId) || repId <= 0) {
    return NextResponse.json({ error: 'Invalid rep id' }, { status: 400 })
  }

  const data = await getOnboarding(repId)
  if (!data) {
    return NextResponse.json(
      { error: 'No onboarding record found. Start onboarding first.' },
      { status: 404 },
    )
  }

  const rep = await getEmployeeAdminById(repId)
  if (!rep) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
  }
  if (!rep.email?.trim()) {
    return NextResponse.json(
      { error: 'This rep has no email address on file.' },
      { status: 400 },
    )
  }

  const token = await issueOnboardingToken(data.onboarding.id)
  if (!token) {
    return NextResponse.json({ error: 'Failed to generate onboarding link.' }, { status: 500 })
  }

  const onboardingUrl = `${SITE_BASE}/onboarding/${token}`
  const html = renderOnboardingWelcome({
    subject:          SUBJECT,
    rep_first_name:   rep.first_name || rep.name.split(' ')[0] || 'there',
    onboarding_url:   onboardingUrl,
    expiry_label:     '14 days',
  })

  const sg = getSg()
  if (!sg) {
    console.error('[onboarding-send-welcome] SENDGRID_API_KEY not configured')
    return NextResponse.json(
      { error: 'Email service not configured. Add SENDGRID_API_KEY to environment.' },
      { status: 503 },
    )
  }

  const sentTo = rep.email.trim().toLowerCase()

  try {
    await sg.send({
      to:      sentTo,
      from:    { email: 'marketing@pct.com', name: 'Pacific Coast Title' },
      subject: SUBJECT,
      html,
    })
  } catch (err) {
    console.error('[onboarding-send-welcome] SendGrid error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 })
  }

  const welcomeSentAt = await markOnboardingWelcomeSent(data.onboarding.id)

  console.log(
    `[onboarding-send-welcome] admin=${adminEmail} rep_id=${repId} sent_to=${sentTo}`,
  )

  return NextResponse.json({
    ok:              true,
    sent_to:         sentTo,
    welcome_sent_at: welcomeSentAt,
  })
}
