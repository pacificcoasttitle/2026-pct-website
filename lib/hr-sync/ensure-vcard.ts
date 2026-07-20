/**
 * HR-sync Layer 2 — ensure a linked vcard facet for a newly created sales rep.
 *
 * CREATE-TIME ONLY (wired from createHrEmployee). Regular employees never
 * get a vcard. Flag-gated (HR_SYNC_ENABLED === 'true').
 *
 * Decision tree (email is the identity key):
 *   1. Already linked                          → no-op
 *   2. Blank email                             → skip + log
 *   3. Existing unlinked vcard by email        → LINK (David scenario)
 *   4. Existing vcard linked to someone else   → SKIP + flag (no hijack)
 *   5. No vcard                                → CREATE draft + LINK
 *
 * Idempotent: SELECT-before-insert; on unique-violation (23505) re-select
 * and link the winner. Draft = website_active=false. vcard only — never
 * creates staff_members. Non-blocking: failures are logged, never throw
 * upward (HR write stays successful) — same discipline as Layer 1.
 */
import type { HrEmployee } from '@/lib/admin-db'
import {
  resolveDepartmentToVcardId,
  resolveOfficeToVcardId,
} from './resolvers'

export type EnsureVcardAction =
  | 'already-linked'
  | 'linked-existing'
  | 'created'
  | 'skipped-blank-email'
  | 'skipped-linked-elsewhere'
  | 'skipped-not-sales-rep'
  | 'skipped-flag-off'

export interface EnsureVcardResult {
  action:          EnsureVcardAction
  hrEmployeeId:    number
  vcardEmployeeId: number | null
  detail?:         string
}

/**
 * Flag-gated, non-blocking wrapper. Call AFTER the HR insert has committed.
 * Never throws — mirrors maybeSyncHrEmployeeDown.
 */
export async function maybeEnsureVcardForSalesRep(
  hr: HrEmployee,
  context: string,
): Promise<void> {
  const { isHrSyncEnabled } = await import('./config')
  if (!isHrSyncEnabled()) return

  if (hr.onboarding_type !== 'sales_rep') return

  try {
    const result = await ensureVcardForRep(hr)
    console.info(
      '[hr-sync] Layer 2 ensure-vcard',
      JSON.stringify({ context, ...result }),
    )
  } catch (err) {
    console.error(
      '[hr-sync] Layer 2 ensure-vcard FAILED (HR write unaffected)',
      JSON.stringify({
        context,
        hrEmployeeId: hr.id,
        error: err instanceof Error ? err.message : String(err),
      }),
    )
  }
}

/**
 * Core match/create/link. Callers that need the result (tests) use this
 * directly; production goes through maybeEnsureVcardForSalesRep.
 */
export async function ensureVcardForRep(hr: HrEmployee): Promise<EnsureVcardResult> {
  // Lazy import breaks the admin-db ↔ hr-sync cycle (admin-db calls us).
  const {
    getPool,
    slugify,
    ensureUniqueSlug,
  } = await import('@/lib/admin-db')

  const base: Pick<EnsureVcardResult, 'hrEmployeeId' | 'vcardEmployeeId'> = {
    hrEmployeeId: hr.id,
    vcardEmployeeId: hr.vcard_employee_id,
  }

  if (hr.onboarding_type !== 'sales_rep') {
    return { ...base, action: 'skipped-not-sales-rep' }
  }

  // Already linked → idempotent no-op.
  if (hr.vcard_employee_id != null) {
    return {
      ...base,
      action: 'already-linked',
      vcardEmployeeId: hr.vcard_employee_id,
    }
  }

  const email = (hr.email ?? '').trim().toLowerCase()
  if (!email) {
    console.warn(
      '[hr-sync] Layer 2 skip: blank email — cannot match/create vcard',
      JSON.stringify({ hrEmployeeId: hr.id, needsReview: true }),
    )
    return { ...base, action: 'skipped-blank-email', detail: 'blank email' }
  }

  const db = getPool()

  // Look up existing vcard BY EMAIL (identity key).
  const existing = await db.query<{ id: number }>(
    `SELECT id FROM vcard_employees
      WHERE email IS NOT NULL AND LOWER(TRIM(email)) = $1
      ORDER BY id ASC
      LIMIT 1`,
    [email],
  )

  if (existing.rows[0]) {
    const vcardId = existing.rows[0].id as number
    // Is this vcard already claimed by a DIFFERENT hr_employee?
    const owner = await db.query<{ id: number; email: string | null }>(
      `SELECT id, email FROM hr_employees
        WHERE vcard_employee_id = $1 AND id <> $2
        LIMIT 1`,
      [vcardId, hr.id],
    )
    if (owner.rows[0]) {
      console.warn(
        '[hr-sync] Layer 2 SKIP+FLAG: vcard already linked to another HR employee (no hijack)',
        JSON.stringify({
          needsReview: true,
          hrEmployeeId: hr.id,
          email,
          vcardEmployeeId: vcardId,
          linkedToHrEmployeeId: owner.rows[0].id,
          linkedToEmail: owner.rows[0].email,
        }),
      )
      return {
        ...base,
        action: 'skipped-linked-elsewhere',
        vcardEmployeeId: vcardId,
        detail: `vcard ${vcardId} owned by hr #${owner.rows[0].id}`,
      }
    }

    await linkHrToVcard(hr.id, vcardId)
    return {
      ...base,
      action: 'linked-existing',
      vcardEmployeeId: vcardId,
    }
  }

  // No existing vcard → CREATE draft + LINK.
  try {
    const vcardId = await createDraftVcardFromHr(hr, email)
    await linkHrToVcard(hr.id, vcardId)
    return {
      ...base,
      action: 'created',
      vcardEmployeeId: vcardId,
    }
  } catch (err) {
    // Race: another writer inserted the same email. Re-select and LINK
    // (same pattern as open-onboarding conflict → reuse). Works when a
    // UNIQUE(email) constraint exists; without it the SELECT-before-insert
    // still covers the common non-race path.
    const code = (err as { code?: string })?.code
    if (code === '23505') {
      const winner = await db.query<{ id: number }>(
        `SELECT id FROM vcard_employees
          WHERE email IS NOT NULL AND LOWER(TRIM(email)) = $1
          ORDER BY id ASC LIMIT 1`,
        [email],
      )
      if (winner.rows[0]) {
        const vcardId = winner.rows[0].id as number
        const owner = await db.query<{ id: number }>(
          `SELECT id FROM hr_employees
            WHERE vcard_employee_id = $1 AND id <> $2 LIMIT 1`,
          [vcardId, hr.id],
        )
        if (owner.rows[0]) {
          console.warn(
            '[hr-sync] Layer 2 SKIP+FLAG after unique race: vcard claimed elsewhere',
            JSON.stringify({
              needsReview: true,
              hrEmployeeId: hr.id,
              vcardEmployeeId: vcardId,
              linkedToHrEmployeeId: owner.rows[0].id,
            }),
          )
          return {
            ...base,
            action: 'skipped-linked-elsewhere',
            vcardEmployeeId: vcardId,
          }
        }
        await linkHrToVcard(hr.id, vcardId)
        return {
          ...base,
          action: 'linked-existing',
          vcardEmployeeId: vcardId,
          detail: 'linked after unique-violation race',
        }
      }
    }
    throw err
  }
}

async function linkHrToVcard(hrId: number, vcardId: number): Promise<void> {
  const { getPool } = await import('@/lib/admin-db')
  const db = getPool()
  await db.query(
    `UPDATE hr_employees
        SET vcard_employee_id = $1,
            updated_at = NOW()
      WHERE id = $2
        AND vcard_employee_id IS NULL`,
    [vcardId, hrId],
  )
}

/**
 * Create a DRAFT vcard from the HR row.
 *  - website_active = FALSE (not public until Sales publishes)
 *  - sms_code / photo_url / bio left blank (Sales fills)
 *  - slug via ensureUniqueSlug
 *  - office_id / department_id resolved from HR text (fail-closed → null)
 */
async function createDraftVcardFromHr(hr: HrEmployee, email: string): Promise<number> {
  const { getPool, slugify, ensureUniqueSlug } = await import('@/lib/admin-db')

  const baseSlug = slugify(`${hr.first_name}-${hr.last_name}`)
  const slug = await ensureUniqueSlug(baseSlug)
  const officeId = await resolveOfficeToVcardId(hr.office)
  const departmentId = await resolveDepartmentToVcardId(hr.department)

  const db = getPool()
  const res = await db.query<{ id: number }>(
    `INSERT INTO vcard_employees (
       slug, first_name, last_name, email, title,
       mobile, phone, office_id, department_id,
       website_active, active, sales_manager
     ) VALUES (
       $1, $2, $3, $4, $5,
       $6, $7, $8, $9,
       FALSE, $10, FALSE
     )
     RETURNING id`,
    [
      slug,
      hr.first_name,
      hr.last_name,
      email,
      hr.title?.trim() || null,
      hr.mobile?.trim() || null,
      hr.office_phone?.trim() || null,
      officeId,
      departmentId,
      hr.active !== false,
    ],
  )
  return res.rows[0].id as number
}
