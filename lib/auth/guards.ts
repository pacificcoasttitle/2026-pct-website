// ============================================================
// PCT Admin — RBAC enforcement helpers (Phase 1b)
//
// The tools that 1c (pages) + 1d (API routes) will use to enforce the
// 1a permission map (lib/auth/permissions.ts). NOTHING is forced
// through these yet — pure addition, no existing route behavior
// changes.
//
// SINGLE SOURCE OF TRUTH: every authorization decision delegates to
// 1a's roleCanAccess(), which is DEFAULT-DENY (null/unknown role or
// role-without-group → false). No parallel permission logic lives here.
// ============================================================

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'
import {
  ADMIN_COOKIE,
  verifyAdminToken,
  type AdminSession,
} from '@/lib/admin-auth'
import { roleCanAccess, type CapabilityGroup } from '@/lib/auth/permissions'

/** Where a logged-in-but-unauthorized rep lands (safe, friendly). */
const PAGE_DENIED_REDIRECT = '/admin/team'

/**
 * Session-returning auth — the counterpart to isAuthenticated() (which
 * only returns a boolean; role checks need the session). Reads the
 * pct_admin cookie + verifies it. Returns AdminSession | null.
 *
 * cookies() from next/headers works in BOTH server components and
 * route handlers, so this one helper covers both contexts.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const jar = await cookies()
    const token = jar.get(ADMIN_COOKIE)?.value
    if (!token) return null
    return await verifyAdminToken(token)
  } catch {
    return null
  }
}

/**
 * Enforce a capability group for an API ROUTE HANDLER.
 *
 *   const auth = await requireApiRole('marketing')
 *   if ('error' in auth) return auth.error
 *   // auth.session is the verified, authorized session
 *
 * - No session            → 401 { error: 'Unauthorized' }
 * - Role lacks the group   → 403 { error: 'Forbidden' }
 * - Otherwise              → { session }
 *
 * Authorization delegates to 1a roleCanAccess (default-deny).
 */
export async function requireApiRole(
  group: CapabilityGroup,
): Promise<{ session: AdminSession } | { error: NextResponse }> {
  const session = await getAdminSession()
  if (!session) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  if (!roleCanAccess(session.role, group)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }
  return { session }
}

/**
 * Enforce a capability group for a PAGE (server component).
 *
 *   const session = await requirePageRole('employees')
 *   // reaching here means authorized
 *
 * - No session           → redirect('/admin/login')
 * - Role lacks the group  → redirect(PAGE_DENIED_REDIRECT) — a soft,
 *                           friendly bounce to the admin landing rather
 *                           than a hard error.
 * - Otherwise             → returns the authorized session.
 *
 * Authorization delegates to 1a roleCanAccess (default-deny).
 */
export async function requirePageRole(
  group: CapabilityGroup,
): Promise<AdminSession> {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  if (!roleCanAccess(session.role, group)) redirect(PAGE_DENIED_REDIRECT)
  return session
}
