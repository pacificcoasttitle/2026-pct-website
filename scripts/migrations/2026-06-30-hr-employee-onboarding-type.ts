/**
 * MIGRATION: Add `onboarding_type` to `hr_employees`.
 *
 * BACKGROUND:
 * The onboarding TYPE (Sales Rep / Regular Employee) used to be chosen on
 * the Onboarding screen at invite time. We're consolidating onboarding to
 * a single path that starts from an EXISTING employee, so the type now
 * lives ON the employee record and the onboarding INHERITS it. This adds
 * the column that the Add Employee form writes and createHrOnboardingForExisting
 * reads.
 *
 * ⚠️ PURELY ADDITIVE. Adds one nullable-then-defaulted TEXT column to
 * hr_employees with a CHECK to the known vocabulary. Touches nothing else.
 *
 * VALUES: 'sales_rep' | 'employee' — mirrors HR_ONBOARDING_TEMPLATE_TYPES.
 * DEFAULT: 'sales_rep' (the prior implicit default → least surprise).
 *
 * IDEMPOTENT: `ADD COLUMN IF NOT EXISTS`, a conditional CHECK add, and a
 * backfill that only touches NULL rows. Safe to re-run.
 *
 * ⚠️ MANUAL PROD-RUN: not run automatically by the app. After review:
 *   npx tsx scripts/migrations/2026-06-30-hr-employee-onboarding-type.ts
 *
 * VERIFICATION:
 *   SELECT onboarding_type, COUNT(*) FROM hr_employees GROUP BY onboarding_type;
 */

/* eslint-disable no-console */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

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

  console.log('Adding hr_employees.onboarding_type...')

  // Add the column (nullable first so the add never fails on existing rows).
  await pool.query(`
    ALTER TABLE hr_employees
      ADD COLUMN IF NOT EXISTS onboarding_type TEXT
  `)

  // Backfill existing rows to the safe default BEFORE we tighten with a
  // NOT NULL/DEFAULT so no row violates the constraint.
  await pool.query(`
    UPDATE hr_employees
       SET onboarding_type = 'sales_rep'
     WHERE onboarding_type IS NULL
  `)

  // Set the column default for future inserts that omit it.
  await pool.query(`
    ALTER TABLE hr_employees
      ALTER COLUMN onboarding_type SET DEFAULT 'sales_rep'
  `)

  // Enforce the vocabulary. Add the CHECK only if it isn't already present
  // (Postgres has no ADD CONSTRAINT IF NOT EXISTS for CHECK pre-15, so we
  // guard via the catalog → idempotent re-runs).
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'hr_employees_onboarding_type_check'
      ) THEN
        ALTER TABLE hr_employees
          ADD CONSTRAINT hr_employees_onboarding_type_check
          CHECK (onboarding_type IN ('employee', 'sales_rep'));
      END IF;
    END
    $$;
  `)

  // Verify
  const result = await pool.query(`
    SELECT onboarding_type, COUNT(*)::int AS count
      FROM hr_employees
     GROUP BY onboarding_type
     ORDER BY onboarding_type
  `)
  console.log('✓ onboarding_type added + backfilled. Distribution:')
  for (const r of result.rows as Array<{ onboarding_type: string | null; count: number }>) {
    console.log(`  ${String(r.onboarding_type).padEnd(12)} ${r.count}`)
  }

  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
