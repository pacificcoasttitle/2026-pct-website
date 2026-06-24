/**
 * POST /api/admin/hr/onboarding/[id]/send
 *
 * Issue + email the tokenized HR onboarding invite (4b). Reuses 4a's
 * issueHrOnboardingToken (stores sha256+expiry, returns raw token →
 * re-sending re-issues + invalidates the prior link), builds the public
 * /hr-onboarding/{token} URL (the route itself is 4c), renders the
 * branded invite, sends via SendGrid, and stamps status='invited' +
 * invited_at.
 *
 * Gated requireApiRole('hr-tools'). ⚠️ The raw token is NEVER logged or
 * returned in the response — only embedded in the emailed URL.
 *
 * ⚠️ Writes ONLY hr_onboarding. No writes to hr_employees/vcard/staff.
 */
import { NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'
import { requireApiRole } from '@/lib/auth/guards'
import {
  getHrOnboardingById,
  issueHrOnboardingToken,
  markHrOnboardingInvited,
} from '@/lib/admin-db'
import { renderHrOnboardingInvite } from '@/lib/email-templates/hr-onboarding-invite'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUBJECT = 'Welcome to Pacific Coast Title — start your onboarding'
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
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole('hr-tools')
  if ('error' in auth) return auth.error

  const actor = auth.session.username || 'unknown'
  const { id: idRaw } = await params
  const id = parseInt(idRaw, 10)
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid onboarding id' }, { status: 400 })
  }

  const onboarding = await getHrOnboardingById(id)
  if (!onboarding) {
    return NextResponse.json({ error: 'Onboarding record not found.' }, { status: 404 })
  }

  const email = (onboarding.invited_email || String(onboarding.payload?.email || '')).trim().toLowerCase()
  if (!email) {
    return NextResponse.json(
      { error: 'No invite email on this onboarding record.' },
      { status: 400 },
    )
  }

  const firstName =
    String(onboarding.payload?.first_name || '').trim() || 'there'

  // 4a: re-issuing overwrites the stored hash → prior link dies.
  const token = await issueHrOnboardingToken(id)
  if (!token) {
    return NextResponse.json({ error: 'Failed to generate onboarding link.' }, { status: 500 })
  }

  // Public route is /hr-onboarding/[token] (4c builds it).
  const onboardingUrl = `${SITE_BASE}/hr-onboarding/${token}`
  const html = renderHrOnboardingInvite({
    subject:        SUBJECT,
    first_name:     firstName,
    onboarding_url: onboardingUrl,
    expiry_label:   '14 days',
  })

  const sg = getSg()
  if (!sg) {
    console.error('[hr-onboarding-send] SENDGRID_API_KEY not configured')
    return NextResponse.json(
      { error: 'Email service not configured. Add SENDGRID_API_KEY to environment.' },
      { status: 503 },
    )
  }

  try {
    await sg.send({
      to:      email,
      from:    { email: 'hr@pct.com', name: 'Pacific Coast Title HR' },
      subject: SUBJECT,
      html,
    })
  } catch (err) {
    console.error('[hr-onboarding-send] SendGrid error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 })
  }

  const updated = await markHrOnboardingInvited(id)

  // Log the actor + recipient + record — NEVER the token.
  console.log(`[hr-onboarding-send] actor=${actor} onboarding_id=${id} sent_to=${email}`)

  return NextResponse.json({
    ok:         true,
    sent_to:    email,
    onboarding: updated,
  })
}
