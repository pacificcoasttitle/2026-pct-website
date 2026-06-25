/**
 * THE DECLARATIVE SHARED-FIELD MAP (HR-sync Stage 2).
 *
 * The SINGLE source of truth for "which hr_employees fields are shared
 * with the facet tables (vcard_employees, staff_members) and how each
 * flows down." Per the re-architecture design §3a/§3c.
 *
 * ⚠️ Adding a shared field later = ONE new entry here. The Stage 3 sync
 * engine iterates this map; it has no per-field knowledge of its own.
 *
 * ⚠️ PURE DECLARATION. No DB access, no writes, no calls. The resolver
 * references below point at lib/hr-sync/resolvers.ts functions but are
 * NOT invoked here — Stage 3 invokes them.
 *
 * Target shape: each shared field declares an optional `vcard` and/or
 * `staff` target. A facet with NO column for the field omits that target
 * (e.g. full_legal_name has no vCard column) — expressed as `undefined`,
 * never a crash. A target is either:
 *   - { column, kind: 'direct' }                      → copy the HR value
 *   - { column, kind: 'resolver', resolver: <fn> }    → resolve first
 * A `pending: true` field is declared (documented as shared) but NOT yet
 * writable (its column doesn't exist yet) — Stage 3 skips it.
 */
import {
  resolveDepartmentToVcardId,
  resolveOfficeToVcardId,
  resolveOfficeToStaffSlug,
} from './resolvers'

/** Columns on hr_employees that can act as a sync SOURCE. */
export type HrSourceColumn =
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'title'
  | 'active'
  | 'department'
  | 'office'
  | 'photo_url'
  | 'full_legal_name'
  | 'mobile'
  | 'office_phone'

/** A resolver maps an HR text/value → the facet's stored value (FK/slug). */
export type FacetResolver = (
  hrValue: string | null | undefined,
) => Promise<string | number | null>

export type FacetTarget =
  | { column: string; kind: 'direct' }
  | { column: string; kind: 'resolver'; resolver: FacetResolver }

export interface SharedField {
  /** Stable key for logging / tests (usually the HR column name). */
  key: string
  /** The hr_employees column this field reads FROM. */
  source: HrSourceColumn
  /** vcard_employees target, or undefined if vCard has no home for it. */
  vcard?: FacetTarget
  /** staff_members target, or undefined if staff has no home for it. */
  staff?: FacetTarget
  /**
   * Declared-but-not-yet-writable (the HR/facet column doesn't exist
   * yet). Stage 3 MUST skip a pending field. Used for license_number
   * until hr_employees grows the column.
   */
  pending?: boolean
  /** Human note (why pending / any nuance). */
  note?: string
}

/**
 * THE LOCKED SHARED SET (design §3a/§3c). Order is documentation-only.
 */
export const SHARED_FIELD_MAP: SharedField[] = [
  // ── Identity (direct → both) ───────────────────────────────────
  {
    key: 'first_name',
    source: 'first_name',
    vcard: { column: 'first_name', kind: 'direct' },
    staff: { column: 'first_name', kind: 'direct' },
  },
  {
    key: 'last_name',
    source: 'last_name',
    vcard: { column: 'last_name', kind: 'direct' },
    staff: { column: 'last_name', kind: 'direct' },
  },
  {
    key: 'email',
    source: 'email',
    vcard: { column: 'email', kind: 'direct' },
    staff: { column: 'email', kind: 'direct' },
  },
  {
    key: 'title',
    source: 'title',
    vcard: { column: 'title', kind: 'direct' },
    staff: { column: 'title', kind: 'direct' },
  },
  {
    key: 'active',
    source: 'active',
    vcard: { column: 'active', kind: 'direct' },
    staff: { column: 'active', kind: 'direct' },
  },

  // ── Department: vCard FK (resolve) + staff text (direct) ────────
  {
    key: 'department',
    source: 'department',
    vcard: { column: 'department_id', kind: 'resolver', resolver: resolveDepartmentToVcardId },
    staff: { column: 'department', kind: 'direct' },
  },

  // ── Office: vCard FK (resolve) + staff slug (resolve) ───────────
  {
    key: 'office',
    source: 'office',
    vcard: { column: 'office_id', kind: 'resolver', resolver: resolveOfficeToVcardId },
    staff: { column: 'office_location', kind: 'resolver', resolver: resolveOfficeToStaffSlug },
  },

  // ── Photo (now shared, direct → both) — design §3c/§4j ──────────
  {
    key: 'photo_url',
    source: 'photo_url',
    vcard: { column: 'photo_url', kind: 'direct' },
    staff: { column: 'photo_url', kind: 'direct' },
  },

  // ── Full legal name: staff only (vCard has no column) ───────────
  {
    key: 'full_legal_name',
    source: 'full_legal_name',
    // vcard: undefined — no vCard column; cleanly skipped, not a crash.
    staff: { column: 'full_legal_name', kind: 'direct' },
  },

  // ── Phones (design §3a): HR carries `mobile` + `office_phone`. ──
  // HR mobile      → vcard.mobile + staff.cell_phone
  // HR office_phone→ vcard.phone  + staff.office_direct
  {
    key: 'mobile',
    source: 'mobile',
    vcard: { column: 'mobile', kind: 'direct' },
    staff: { column: 'cell_phone', kind: 'direct' },
  },
  {
    key: 'office_phone',
    source: 'office_phone',
    vcard: { column: 'phone', kind: 'direct' },
    staff: { column: 'office_direct', kind: 'direct' },
  },

  // ── License number — staff.license_number, PENDING. ────────────
  // hr_employees has NO license_number column yet (confirmed). Declared
  // here as shared so the map documents the intent, but marked pending
  // so Stage 3 SKIPS it — we do NOT invent an HR write. When HR grows
  // the column, flip `pending` off and set source: 'license_number'.
  {
    key: 'license_number',
    // source intentionally points at an existing column to keep the type
    // honest; pending=true means Stage 3 never reads it. Re-point to
    // 'license_number' once hr_employees has it.
    source: 'full_legal_name',
    staff: { column: 'license_number', kind: 'direct' },
    pending: true,
    note: 'hr_employees has no license_number column yet — pending a schema add. Stage 3 must skip pending fields.',
  },
]

/** Convenience: the active (non-pending) shared fields Stage 3 will sync. */
export const ACTIVE_SHARED_FIELDS: SharedField[] =
  SHARED_FIELD_MAP.filter((f) => !f.pending)
