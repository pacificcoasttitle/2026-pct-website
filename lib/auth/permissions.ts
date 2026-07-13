// ============================================================
// PCT Admin — Central RBAC permission map (Phase 1a foundation)
//
// THE single source of truth for which roles can access which
// capability groups. Page-gating, API-gating, and the sidebar filter
// (Phases 1c/1d/1e) all read from this one map so they can't drift.
//
// SAFETY PROPERTY: DEFAULT-DENY. A null/unknown role, or a role with
// no group for the requested capability, resolves to false. We NEVER
// default to true.
//
// NOTE: This module is currently UNREFERENCED — nothing enforces it
// yet, so it changes no existing behavior. Enforcement lands later.
// ============================================================

/** Known admin roles. `notes_author` is a narrowly-scoped notes-only role. */
export type AdminRole = 'top_level' | 'hr' | 'manager' | 'notes_author'

/** Distinct admin capability areas, derived from the route map. */
export type CapabilityGroup =
  | 'dashboard'
  | 'employees'
  | 'onboarding'
  | 'signatures'
  | 'hr-tools'
  | 'marketing'
  | 'sms'
  | 'asset-delivery'
  | 'farms'
  | 'assessments'
  | 'fees'
  | 'notes'

/** Every capability group — used to resolve the `'all'` sentinel. */
export const ALL_GROUPS: CapabilityGroup[] = [
  'dashboard',
  'employees',
  'onboarding',
  'signatures',
  'hr-tools',
  'marketing',
  'sms',
  'asset-delivery',
  'farms',
  'assessments',
  'fees',
  'notes',
]

/**
 * Role → capability groups. The single source of truth.
 * - `top_level` → `'all'` sentinel: access everything; new groups are
 *   auto-included (future-proof).
 * - `hr` → the HR workspace (dashboard + hr-tools). HR is intentionally
 *   NOT granted the marketing-owned 'employees' (Sales Reps vCard) or
 *   'signatures' (Signature Center) capabilities — those are marketing
 *   functions. The HR roster (gated 'hr-tools') already shows all
 *   employees, incl. sales reps, so HR loses no employee visibility.
 * - `manager` → `'all'`: 3 active admin users (hugo, LAsales, neil)
 *   have role='manager'; full access preserves the status quo (today
 *   every logged-in admin has full access). Scoping the manager role
 *   is a separate, deliberate future decision.
 * - `notes_author` → `['notes']` ONLY — the dedicated notes workspace;
 *   no dashboard, HR record, marketing, or any other admin surface.
 */
const ROLE_GROUPS: Record<AdminRole, CapabilityGroup[] | 'all'> = {
  top_level: 'all',
  hr: ['dashboard', 'onboarding', 'hr-tools'],
  manager: 'all', // 3 active admins are 'manager'; full access (status quo). Scope later if desired.
  notes_author: ['notes'],
}

/**
 * Can `role` access `group`? DEFAULT-DENY:
 * - no role (null/undefined/'') → false
 * - unknown role → false
 * - role with groups but not this one → false
 * Only an explicit grant (or the `'all'` sentinel) returns true.
 */
export function roleCanAccess(
  role: AdminRole | string | null | undefined,
  group: CapabilityGroup,
): boolean {
  if (!role) return false
  const groups = ROLE_GROUPS[role as AdminRole]
  if (groups === undefined) return false
  if (groups === 'all') return true
  return groups.includes(group)
}

/**
 * The capability groups a role can access, resolving the `'all'`
 * sentinel to the full group list. Consistent with roleCanAccess.
 * Unknown/null role → `[]` (fails closed). Useful for the sidebar
 * filter in a later phase.
 */
export function groupsForRole(
  role: AdminRole | string | null | undefined,
): CapabilityGroup[] {
  if (!role) return []
  const groups = ROLE_GROUPS[role as AdminRole]
  if (groups === undefined) return []
  if (groups === 'all') return [...ALL_GROUPS]
  return [...groups]
}
