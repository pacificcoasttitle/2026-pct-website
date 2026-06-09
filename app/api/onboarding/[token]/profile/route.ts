/**
 * PATCH /api/onboarding/[token]/profile
 *
 * The first rep-facing WRITE, gated by the 2a/2b token mechanism.
 *
 * SECURITY MODEL:
 *   - The token is re-verified server-side on EVERY call
 *     (resolveOnboardingByToken) — we never trust that the page loaded.
 *   - rep_id / slug come ONLY from the token-resolved record, never
 *     from the request body or params. A rep can only update their own
 *     row; a body carrying a different rep_id/slug is ignored.
 *   - STRICT ALLOWLIST: only the 10 named fields below may be written.
 *     The scrubbed subset is built by ITERATING the allowlist — the
 *     request body is NEVER spread into updateEmployee. Locked fields
 *     (name/title/email, active, sales_manager, audience id, …) can
 *     never be touched, even via a crafted body.
 *
 * No uploads, no email (2d/2e).
 */
import { NextResponse } from 'next/server'
import {
  resolveOnboardingByToken,
  getEmployeeAdminById,
  updateEmployee,
  markOnboardingInfoVerified,
  type EmployeeUpdatePayload,
} from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// The ONLY fields a rep may write to their own profile. Anything else
// in the body is dropped silently.
const ALLOWED_FIELDS = [
  'phone', 'mobile', 'bio', 'specialties', 'languages',
  'linkedin', 'facebook', 'instagram', 'twitter', 'website',
] as const
type AllowedField = (typeof ALLOWED_FIELDS)[number]

// Per-field max lengths (bio gets a generous cap; the rest are short).
const MAX_LEN: Record<AllowedField, number> = {
  phone: 40, mobile: 40, bio: 4000, specialties: 600, languages: 300,
  linkedin: 300, facebook: 300, instagram: 300, twitter: 300, website: 300,
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params

  // Re-verify the token server-side. null = invalid/expired/mismatch.
  const record = await resolveOnboardingByToken(token)
  if (!record) {
    return NextResponse.json(
      { ok: false, error: 'This link has expired or is invalid. Please contact your manager for a new link.' },
      { status: 410 },
    )
  }

  // rep identity comes from the TOKEN-resolved record ONLY.
  const employee = await getEmployeeAdminById(record.rep_id)
  if (!employee) {
    return NextResponse.json({ ok: false, error: 'Profile not found.' }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('bad body')
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 })
  }

  // STRICT ALLOWLIST scrub — iterate the allowlist, never spread body.
  const scrubbed: EmployeeUpdatePayload = {}
  for (const field of ALLOWED_FIELDS) {
    if (!(field in body)) continue
    const raw = body[field]
    if (raw === null || raw === undefined) continue
    if (typeof raw !== 'string') {
      return NextResponse.json({ ok: false, error: `Field "${field}" must be text.` }, { status: 400 })
    }
    const value = raw.trim()
    if (value.length > MAX_LEN[field]) {
      return NextResponse.json({ ok: false, error: `Field "${field}" is too long.` }, { status: 400 })
    }
    scrubbed[field] = value
  }

  // updateEmployee receives ONLY the scrubbed subset, keyed by the
  // token-resolved slug. (No-op safe if the rep submitted nothing.)
  if (Object.keys(scrubbed).length > 0) {
    await updateEmployee(employee.slug, scrubbed)
  }

  // Mark the onboarding record (from the token) as info-verified.
  const infoVerifiedAt = await markOnboardingInfoVerified(record.id)

  return NextResponse.json({ ok: true, info_verified_at: infoVerifiedAt }, { status: 200 })
}
