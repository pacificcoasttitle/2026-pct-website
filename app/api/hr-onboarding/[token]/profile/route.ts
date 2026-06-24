/**
 * PATCH /api/hr-onboarding/[token]/profile
 *
 * ⚠️ PUBLIC, UNAUTHENTICATED WRITE SURFACE. Modeled EXACTLY on the rep
 * route (app/api/onboarding/[token]/profile/route.ts), with the gaps the
 * spec called out fixed (rate-limit added).
 *
 * SECURITY MODEL (assume a hostile caller):
 *   - The token is RE-VERIFIED on EVERY call (resolveHrOnboardingByToken)
 *     — we never trust that the page loaded or any prior check.
 *   - The onboarding identity (which row) comes ONLY from the
 *     token-resolved record — NEVER from the body, params, or query. A
 *     body carrying a different id is ignored.
 *   - STRICT ALLOWLIST: only the named packet fields below may be written.
 *     The scrubbed subset is built by ITERATING the allowlist — the body
 *     is NEVER spread into the payload.
 *   - WRITES ONLY hr_onboarding.payload (jsonb merge) + status/timestamps.
 *     NEVER hr_employees/vcard/staff. NEVER finalizes.
 *   - RATE-LIMITED per (token + IP).
 *   - Every field is type/length-validated; generic errors (no internal leak).
 *   - A finalized/submitted record is locked to the public caller.
 *
 * Two actions (body.action):
 *   - 'save'   (default): merge allowlisted fields into payload.
 *   - 'submit': mark the packet submitted (status='submitted'); review by HR (4e).
 *
 * No document upload (4d). No finalize (4e).
 */
import { NextResponse } from 'next/server'
import {
  resolveHrOnboardingByToken,
  mergeHrOnboardingPayload,
  markHrOnboardingSubmitted,
} from '@/lib/admin-db'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// The ONLY fields the public caller may write into payload. Anything
// else in the body is dropped. (HR-packet fields per the spec.)
const ALLOWED_FIELDS = [
  'first_name', 'last_name', 'full_legal_name', 'preferred_name',
  'personal_email', 'mobile',
  'birthday', 'start_date',
  'emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship',
  'home_address_line1', 'home_address_line2', 'home_city', 'home_state', 'home_zip',
  'pronouns', 't_shirt_size', 'dietary_restrictions',
] as const
type AllowedField = (typeof ALLOWED_FIELDS)[number]

// Per-field max lengths — cap to prevent jsonb bloat from a hostile caller.
const MAX_LEN: Record<AllowedField, number> = {
  first_name: 80, last_name: 80, full_legal_name: 160, preferred_name: 80,
  personal_email: 160, mobile: 40,
  birthday: 10, start_date: 10,
  emergency_contact_name: 120, emergency_contact_phone: 40, emergency_contact_relationship: 60,
  home_address_line1: 160, home_address_line2: 160, home_city: 100, home_state: 40, home_zip: 20,
  pronouns: 40, t_shirt_size: 12, dietary_restrictions: 300,
}

// Fields that must be an ISO date (YYYY-MM-DD) if present.
const DATE_FIELDS = new Set<AllowedField>(['birthday', 'start_date'])
const EMAIL_FIELDS = new Set<AllowedField>(['personal_email'])

// Rate limit: 30 saves / minute per (token + IP). (The rep profile route
// had no limit — spec asked us to close that gap here.)
const RL_LIMIT     = 30
const RL_WINDOW_MS = 60_000

const INVALID_LINK = 'This link has expired or is invalid. Please contact HR for a new link.'

function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params

  // Rate limit FIRST (before any work), keyed by token + IP.
  const rl = rateLimit(`hr-onboarding-profile:${token}:${clientIp(request)}`, RL_LIMIT, RL_WINDOW_MS)
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Please wait a moment and try again.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    )
  }

  // RE-VERIFY the token server-side. null = invalid/expired/mismatch/
  // wrong-purpose. Generic message — never leak WHY.
  const record = await resolveHrOnboardingByToken(token)
  if (!record) {
    return NextResponse.json({ ok: false, error: INVALID_LINK }, { status: 410 })
  }

  // Locked once submitted/finalized/cancelled — the public caller can't edit.
  if (!['draft', 'invited', 'in_progress'].includes(record.status)) {
    return NextResponse.json(
      { ok: false, error: 'This onboarding has already been submitted and can no longer be edited.' },
      { status: 409 },
    )
  }

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('bad body')
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }

  const action = body.action === 'submit' ? 'submit' : 'save'

  // STRICT ALLOWLIST scrub — iterate the allowlist, NEVER spread body.
  // Identity is the token-resolved record.id ONLY (any id in body ignored).
  const scrubbed: Record<string, string> = {}
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
    if (value && DATE_FIELDS.has(field) && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return NextResponse.json({ ok: false, error: `Field "${field}" must be a valid date.` }, { status: 400 })
    }
    if (value && EMAIL_FIELDS.has(field) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return NextResponse.json({ ok: false, error: `Field "${field}" must be a valid email.` }, { status: 400 })
    }
    scrubbed[field] = value
  }

  try {
    // Persist any allowlisted fields (scoped to the token-resolved id).
    if (Object.keys(scrubbed).length > 0) {
      const merged = await mergeHrOnboardingPayload(record.id, scrubbed)
      if (!merged) {
        // Lost the editable window between resolve + write (race).
        return NextResponse.json(
          { ok: false, error: 'This onboarding can no longer be edited.' },
          { status: 409 },
        )
      }
    }

    if (action === 'submit') {
      const submitted = await markHrOnboardingSubmitted(record.id)
      if (!submitted) {
        return NextResponse.json(
          { ok: false, error: 'This onboarding can no longer be edited.' },
          { status: 409 },
        )
      }
      return NextResponse.json({ ok: true, status: submitted.status }, { status: 200 })
    }

    return NextResponse.json({ ok: true, status: 'in_progress' }, { status: 200 })
  } catch {
    // Generic — never leak internal detail to a public caller.
    return NextResponse.json({ ok: false, error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
