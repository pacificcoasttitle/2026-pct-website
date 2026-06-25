/**
 * HR-sync resolvers (Stage 2) — pure, READ-ONLY lookups that translate
 * an HR text value into the FK / slug a facet table expects.
 *
 * ⚠️ FAIL-CLOSED: every resolver returns `null` on no-match. null means
 * "unmappable — SKIP this field" to the Stage 3 sync; a resolver NEVER
 * guesses a value and NEVER throws on an unmappable input. (It may throw
 * only on a genuine infrastructure failure, e.g. the DB being down — that
 * is not a "no-match".)
 *
 * Lookup tables (confirmed to exist, read-only):
 *   - vcard_departments (id, name)        → department text → vcard FK
 *   - vcard_offices     (id, name)        → office text     → vcard FK
 *   - office_locations  (id, slug, …)     → office slug set (staff)
 *
 * ⚠️ NOTHING here writes. Nothing calls these yet — Stage 3 wires them.
 */
import { getPool } from '@/lib/admin-db'

function norm(v: string | null | undefined): string {
  return (v ?? '').trim().toLowerCase()
}

/**
 * HR office LABEL → staff office SLUG. The explicit mapping locked in the
 * design (§4b). Keyed on a normalized (trim+lowercase) label so casing /
 * spacing drift doesn't cause a false miss.
 *
 * ⚠️ Any label NOT in this map resolves to null (skip) — never guessed.
 */
const OFFICE_LABEL_TO_STAFF_SLUG: Record<string, string> = {
  'glendale office':        'glendale',
  'orange county office':   'orange-hq',
  'inland empire branch':   'ontario',
  'porterville':            'porterville',
  'las vegas (tsg)':        'las-vegas-tsg',
  'livermore (tsg)':        'livermore-tsg',
}

/**
 * Resolve an HR department text → vcard_departments.id, or null if there
 * is no exact (case-insensitive) name match. Null → caller skips the
 * field (never writes a wrong FK).
 */
export async function resolveDepartmentToVcardId(
  hrDeptText: string | null | undefined,
): Promise<number | null> {
  const name = norm(hrDeptText)
  if (!name) return null
  const db = getPool()
  const res = await db.query(
    `SELECT id FROM vcard_departments WHERE LOWER(TRIM(name)) = $1 LIMIT 1`,
    [name],
  )
  return res.rows[0]?.id ?? null
}

/**
 * Resolve an HR office text → vcard_offices.id, or null if there is no
 * exact (case-insensitive) name match. Null → caller skips the field.
 */
export async function resolveOfficeToVcardId(
  hrOfficeText: string | null | undefined,
): Promise<number | null> {
  const name = norm(hrOfficeText)
  if (!name) return null
  const db = getPool()
  const res = await db.query(
    `SELECT id FROM vcard_offices WHERE LOWER(TRIM(name)) = $1 LIMIT 1`,
    [name],
  )
  return res.rows[0]?.id ?? null
}

/**
 * Resolve an HR office LABEL → the staff office slug (per the §4b map),
 * or null if the label isn't in the map OR the slug isn't a real
 * office_locations row. Double-guarded: the explicit map AND a read-only
 * existence check, so a stale map entry can't write a non-existent slug.
 */
export async function resolveOfficeToStaffSlug(
  hrOfficeLabel: string | null | undefined,
): Promise<string | null> {
  const slug = OFFICE_LABEL_TO_STAFF_SLUG[norm(hrOfficeLabel)]
  if (!slug) return null
  const db = getPool()
  const res = await db.query(
    `SELECT slug FROM office_locations WHERE slug = $1 LIMIT 1`,
    [slug],
  )
  return res.rows[0]?.slug ?? null
}

/** Exposed for tests/diagnostics — the locked label→slug map (read-only). */
export const OFFICE_LABEL_SLUG_MAP: Readonly<Record<string, string>> =
  OFFICE_LABEL_TO_STAFF_SLUG
