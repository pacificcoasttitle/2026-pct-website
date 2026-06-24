// ============================================================
// PCT HR Onboarding — signed-link token primitive
//
// Modeled EXACTLY on lib/onboarding-token.ts (the proven rep-onboarding
// primitive), but DELIBERATELY isolated from BOTH admin auth AND rep
// onboarding:
//   - its OWN secret (HR_ONBOARDING_TOKEN_SECRET) — distinct from
//     ONBOARDING_TOKEN_SECRET and NEXTAUTH_SECRET, so a leaked HR link
//     has zero relation to admin sessions or rep links.
//   - its OWN purpose claim ('hr_onboarding') with a purpose-confusion
//     guard: a rep-onboarding token ('rep_onboarding') presented here is
//     REJECTED, and (by symmetry) an HR token won't verify in the rep
//     resolver. This closes the cross-flow token-confusion class.
//
// Tokens are reusable-until-expiry (14 days). Statefulness/revocation
// lives in the DB layer: only sha256(token) is stored on the row, and
// resolveHrOnboardingByToken (admin-db.ts) requires the stored hash +
// stored expiry to match in addition to a valid signature (default-deny).
//
// ⚠️ DEPLOY NOTE: HR_ONBOARDING_TOKEN_SECRET MUST be added to Vercel
// (production) before 4b/4c go live — exactly as NEXTAUTH_SECRET and
// ONBOARDING_TOKEN_SECRET were. In production this module THROWS if the
// secret is missing/blank (fail-loud); it will not sign/verify with a
// dev fallback in prod.
// ============================================================

import { SignJWT, jwtVerify } from 'jose'
import { createHash } from 'crypto'

const PURPOSE = 'hr_onboarding'
const EXPIRES = '14d'

/**
 * Secret for HR-onboarding tokens. MUST be distinct from the admin
 * secret AND the rep-onboarding secret — a different env var and a
 * different dev fallback string.
 */
function hrOnboardingSecret() {
  // .trim() matters: the ?? trap treats an empty/whitespace env var as
  // "defined". Treat blank as missing.
  const resolved = process.env.HR_ONBOARDING_TOKEN_SECRET?.trim() || ''

  if (process.env.NODE_ENV === 'production' && !resolved) {
    throw new Error(
      'HR_ONBOARDING_TOKEN_SECRET is required in production — refusing to sign/verify HR onboarding tokens with a dev fallback',
    )
  }

  // Non-production keeps the dev fallback so local dev works without env vars.
  const s = resolved || 'dev-hr-onboarding-secret-change-me-in-env'
  return new TextEncoder().encode(s)
}

/** Sign a fresh HR-onboarding token for the given hr_onboarding record id. */
export async function signHrOnboardingToken(onboardingId: number): Promise<string> {
  return new SignJWT({ hr_onboarding_id: onboardingId, purpose: PURPOSE })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRES)
    .sign(hrOnboardingSecret())
}

/**
 * Verify a token's signature + expiry + purpose claim. Returns the
 * hr_onboarding_id on success, or null on ANY failure (bad signature,
 * expired, wrong/missing purpose — INCLUDING a rep-onboarding token —
 * or malformed payload). Never throws.
 */
export async function verifyHrOnboardingToken(
  token: string,
): Promise<{ hr_onboarding_id: number } | null> {
  try {
    const { payload } = await jwtVerify(token, hrOnboardingSecret())
    // Purpose-confusion guard: only 'hr_onboarding' is accepted here.
    if (payload.purpose !== PURPOSE) return null
    const id = payload.hr_onboarding_id
    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) return null
    return { hr_onboarding_id: id }
  } catch {
    return null
  }
}

/** Stable sha256 hex of a token — this (never the raw token) is stored. */
export function hashHrOnboardingToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
