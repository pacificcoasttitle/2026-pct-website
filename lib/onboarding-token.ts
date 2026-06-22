// ============================================================
// PCT Rep Onboarding — signed-link token primitive
//
// Mirrors lib/admin-auth.ts's jose HS256 usage, but is DELIBERATELY
// isolated from admin auth: it uses a SEPARATE secret
// (ONBOARDING_TOKEN_SECRET) so a leaked rep link has zero relation to
// admin sessions. The payload is minimal — { onboarding_id, purpose }.
//
// Tokens are reusable-until-expiry (14 days). Statefulness/revocation
// lives in the DB layer: only sha256(token) is stored on the row, and
// resolveOnboardingByToken (admin-db.ts) requires the stored hash +
// stored expiry to match in addition to a valid signature.
// ============================================================

import { SignJWT, jwtVerify } from 'jose'
import { createHash } from 'crypto'

const PURPOSE = 'rep_onboarding'
const EXPIRES = '14d'

/**
 * Secret for rep-onboarding tokens. MUST be distinct from the admin
 * secret — a different env var and a different dev fallback string.
 */
function onboardingSecret() {
  // .trim() matters: the ?? trap treats an empty/whitespace env var as
  // "defined". Treat blank as missing.
  const resolved = process.env.ONBOARDING_TOKEN_SECRET?.trim() || ''

  if (process.env.NODE_ENV === 'production' && !resolved) {
    throw new Error(
      'ONBOARDING_TOKEN_SECRET is required in production — refusing to sign/verify onboarding tokens with a dev fallback',
    )
  }

  // Non-production keeps the dev fallback so local dev works without env vars.
  const s = resolved || 'dev-onboarding-secret-change-me-in-env'
  return new TextEncoder().encode(s)
}

/** Sign a fresh onboarding token for the given onboarding record id. */
export async function signOnboardingToken(onboardingId: number): Promise<string> {
  return new SignJWT({ onboarding_id: onboardingId, purpose: PURPOSE })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRES)
    .sign(onboardingSecret())
}

/**
 * Verify a token's signature + expiry + purpose claim. Returns the
 * onboarding_id on success, or null on ANY failure (bad signature,
 * expired, wrong/missing purpose, malformed payload). Never throws.
 */
export async function verifyOnboardingToken(
  token: string,
): Promise<{ onboarding_id: number } | null> {
  try {
    const { payload } = await jwtVerify(token, onboardingSecret())
    if (payload.purpose !== PURPOSE) return null
    const id = payload.onboarding_id
    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) return null
    return { onboarding_id: id }
  } catch {
    return null
  }
}

/** Stable sha256 hex of a token — this (never the raw token) is stored. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
