/**
 * MIGRATION (3a): Create the canonical `hr_employees` table (Option B).
 *
 * BACKGROUND:
 * `hr_employees` is the new canonical HR core for the ~109-person union
 * of `vcard_employees` (marketing/website reps) and `staff_members`
 * (signature center). It carries identity / contact / status / dept /
 * office, plus NULLABLE source FKs back to the two origin tables so we
 * never lose provenance, plus a `needs_dedup_review` flag for the
 * same-person-different-email pairs (flagged, NOT merged — Jerry
 * reviews them in-app later).
 *
 * ⚠️ PURELY ADDITIVE. This migration only CREATES `hr_employees`. It
 * does NOT touch `vcard_employees` or `staff_members` — signatures +
 * marketing keep working untouched. The backfill that POPULATES this
 * table is a separate, reviewable, idempotent script:
 *   scripts/backfill-hr-employees.ts  (also READ-ONLY on the sources)
 *
 * ⚠️ FOR REVIEW — NOT RUN in this ticket. 3b runs it after review.
 *
 * SCHEMA STYLE NOTE:
 * Matches the repo's existing migration pattern (see
 * scripts/migrations/2026-05-27-vcard-sales-manager.ts and
 * 2026-05-28-upcoming-owner.ts): a TS script invoked via `npx tsx`
 * that loads `.env.local`, grabs the shared `getPool()` from
 * lib/admin-db, and runs raw idempotent SQL (`CREATE TABLE IF NOT
 * EXISTS`, `ADD COLUMN IF NOT EXISTS`).
 *
 * IDEMPOTENT: Safe to re-run. `CREATE TABLE IF NOT EXISTS` + per-column
 * `ADD COLUMN IF NOT EXISTS` + `CREATE INDEX IF NOT EXISTS`.
 *
 * EMAIL UNIQUE NOTE:
 * `email` is normalized (lower(trim)) at backfill time and carries a
 * UNIQUE constraint. The dedup flag handles same-PERSON-different-EMAIL
 * — those rows have DIFFERENT emails, so they do NOT violate the unique
 * constraint (they're inserted as separate rows, just flagged). The
 * unique constraint only guards against the same email being inserted
 * twice (which also gives the backfill its idempotency via ON CONFLICT
 * (email) DO NOTHING).
 *
 * RUN (3b, after review): npx tsx scripts/migrations/2026-06-24-hr-employees.ts
 *
 * VERIFICATION:
 *   SELECT column_name, data_type, is_nullable, column_default
 *     FROM information_schema.columns
 *    WHERE table_name = 'hr_employees'
 *    ORDER BY ordinal_position;
 */

/* eslint-disable no-console */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Tiny .env loader — mirrors the other migration scripts so this can be
// invoked directly via `npx tsx` outside Next.js's runtime.
function loadEnvFile(path: string) {
  if (!existsSync(path)) return false
  const raw = readFileSync(path, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i)
    if (!m) continue
    const [, key, rawVal] = m
    if (process.env[key]) continue
    let val = rawVal
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    process.env[key] = val
  }
  return true
}
const cwd = process.cwd()
loadEnvFile(resolve(cwd, '.env.local')) || loadEnvFile(resolve(cwd, '.env'))

// Import AFTER env is loaded so the pg pool picks up DATABASE_URL.
import { getPool } from '../../lib/admin-db'

async function main() {
  const pool = getPool()

  console.log('Creating hr_employees (canonical HR core)...')

  // Canonical table. NULLABLE source FKs preserve provenance back to the
  // two origin tables without coupling their lifecycles to this one.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hr_employees (
      id                  SERIAL PRIMARY KEY,

      -- Identity
      first_name          TEXT NOT NULL,
      last_name           TEXT NOT NULL,
      full_legal_name     TEXT,

      -- Contact (email normalized lower(trim) at backfill; UNIQUE)
      email               TEXT NOT NULL,
      mobile              TEXT,
      office_phone        TEXT,

      -- Role / placement
      title               TEXT,
      department          TEXT,
      office              TEXT,

      -- Branding
      photo_url           TEXT,

      -- Status
      active              BOOLEAN NOT NULL DEFAULT true,
      employment_status   TEXT,            -- nullable, Phase 3+ (starts null)

      -- Phase 3 (start null)
      birthday            DATE,
      start_date          DATE,

      -- Provenance — nullable FKs back to the source tables
      vcard_employee_id   INTEGER REFERENCES vcard_employees(id),
      staff_member_id     INTEGER REFERENCES staff_members(id),

      -- Dedup review flag (same-person-different-email — flagged, NOT merged)
      needs_dedup_review  BOOLEAN NOT NULL DEFAULT false,
      dedup_review_note   TEXT,

      -- Audit
      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_by          TEXT,
      updated_by          TEXT
    );
  `)

  // Defensive: if the table pre-existed from an earlier partial run,
  // ensure each column is present (idempotent re-run safety).
  const addColumns: Array<[string, string]> = [
    ['full_legal_name', 'TEXT'],
    ['mobile', 'TEXT'],
    ['office_phone', 'TEXT'],
    ['title', 'TEXT'],
    ['department', 'TEXT'],
    ['office', 'TEXT'],
    ['photo_url', 'TEXT'],
    ['active', 'BOOLEAN NOT NULL DEFAULT true'],
    ['employment_status', 'TEXT'],
    ['birthday', 'DATE'],
    ['start_date', 'DATE'],
    ['vcard_employee_id', 'INTEGER REFERENCES vcard_employees(id)'],
    ['staff_member_id', 'INTEGER REFERENCES staff_members(id)'],
    ['needs_dedup_review', 'BOOLEAN NOT NULL DEFAULT false'],
    ['dedup_review_note', 'TEXT'],
    ['created_at', 'TIMESTAMPTZ NOT NULL DEFAULT NOW()'],
    ['updated_at', 'TIMESTAMPTZ NOT NULL DEFAULT NOW()'],
    ['created_by', 'TEXT'],
    ['updated_by', 'TEXT'],
  ]
  for (const [col, def] of addColumns) {
    await pool.query(`ALTER TABLE hr_employees ADD COLUMN IF NOT EXISTS ${col} ${def}`)
  }

  // UNIQUE on email (normalized at backfill). Gives the backfill its
  // ON CONFLICT (email) DO NOTHING idempotency. Created as a named
  // constraint via a unique index so re-runs are safe.
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_hr_employees_email
      ON hr_employees (email);
  `)

  // Helpful lookup indexes (provenance + dedup triage).
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_hr_employees_vcard
      ON hr_employees (vcard_employee_id);
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_hr_employees_staff
      ON hr_employees (staff_member_id);
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_hr_employees_dedup
      ON hr_employees (needs_dedup_review) WHERE needs_dedup_review = true;
  `)

  // Verify
  const result = await pool.query(`
    SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
     WHERE table_name = 'hr_employees'
     ORDER BY ordinal_position
  `)
  if (result.rows.length === 0) {
    throw new Error('hr_employees was not created')
  }
  console.log(`✓ hr_employees verified — ${result.rows.length} columns:`)
  for (const r of result.rows as Array<{
    column_name: string
    data_type: string
    is_nullable: string
  }>) {
    console.log(
      `  ${r.column_name.padEnd(20)} ${r.data_type.padEnd(28)} ${r.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'}`,
    )
  }

  console.log('\n✓ Source tables (vcard_employees / staff_members) untouched — purely additive.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
