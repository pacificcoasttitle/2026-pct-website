// ============================================================
// PCT Admin — JWT auth helpers (Edge-compatible via jose)
// ============================================================

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export const ADMIN_COOKIE = 'pct_admin'
const EXPIRES = '8h'

function secret() {
  const s = process.env.NEXTAUTH_SECRET ?? process.env.ADMIN_SECRET ?? 'dev-secret-change-me-in-env'
  return new TextEncoder().encode(s)
}

export interface AdminSession {
  userId:   number
  username: string
  role:     string
  officeId: number | null
}

/** Create a signed JWT for an admin session. */
export async function createAdminToken(payload: AdminSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRES)
    .sign(secret())
}

/** Verify and decode an admin JWT. Returns null if invalid or expired. */
export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret())
    return payload as unknown as AdminSession
  } catch {
    return null
  }
}

/**
 * Convenience helper for Node.js API routes.
 * Reads the session cookie and returns true if the token is valid.
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const jar   = await cookies()
    const token = jar.get(ADMIN_COOKIE)?.value
    if (!token) return false
    return (await verifyAdminToken(token)) !== null
  } catch {
    return false
  }
}
