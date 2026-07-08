/**
 * MIGRATION: atomic "one open onboarding per employee" guard.
 *
 * The open-onboarding dup-guard was check-then-insert (findActiveHrOnboarding
 * → createHrOnboardingForExisting), which is NOT atomic — two concurrent
 * bulk-invite requests could both pass the check and double-create. This
 * adds a PARTIAL UNIQUE INDEX so two OPEN onboardings for the same
 * employee-linked row are structurally impossible; the 2nd concurrent
 * insert fails with 23505 (caught in code → reported as skipped).
 *
 *   CREATE UNIQUE INDEX hr_onboarding_one_open_per_employee
 *     ON hr_onboarding (hr_employee_id)
 *     WHERE status IN ('draft','invited','in_progress','submitted')
 *       AND hr_employee_id IS NOT NULL;
 *
 * ⚠️ Shell onboardings (hr_employee_id NULL) are EXCLUDED — the index only
 * constrains employee-linked ones.
 *
 * IDEMPOTENT: CREATE UNIQUE INDEX IF NOT EXISTS.
 *
 * ⚠️ PRE-CHECK: index creation FAILS if existing duplicate open
 * onboardings already violate it. This migration first checks for such
 * duplicates and reports them (exits without creating the index) rather
 * than failing opaquely. Given the single-flow dup-guard has been active,
 * there likely are none — but resolve any before re-running.
 *
 * ⚠️ MANUAL-RUN ON PROD (Director): 8th manual-prod migration for the HR
 * onboarding work this session. Run on deploy:
 *   npx tsx scripts/migrations/2026-07-09-hr-onboarding-one-open-per-employee.ts
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

import { getPool } from '../../lib/admin-db'

const OPEN_STATUSES = ['draft', 'invited', 'in_progress', 'submitted']

async function main() {
  const pool = getPool()

  // ── PRE-CHECK: any existing duplicate OPEN onboardings? ──
  console.log('Pre-check: scanning for existing duplicate open onboardings...')
  const dupes = await pool.query(
    `SELECT hr_employee_id, COUNT(*)::int AS open_count,
            ARRAY_AGG(id ORDER BY id) AS onboarding_ids
       FROM hr_onboarding
      WHERE hr_employee_id IS NOT NULL
        AND status = ANY($1)
      GROUP BY hr_employee_id
     HAVING COUNT(*) > 1
      ORDER BY hr_employee_id`,
    [OPEN_STATUSES],
  )

  if (dupes.rowCount && dupes.rowCount > 0) {
    console.error(
      `\n❌ ABORTING — ${dupes.rowCount} employee(s) already have MULTIPLE open onboardings.\n` +
        `The unique index cannot be created until these are resolved (cancel/finalize the extras):`,
    )
    for (const r of dupes.rows) {
      console.error(`   employee ${r.hr_employee_id}: onboardings ${JSON.stringify(r.onboarding_ids)} (${r.open_count} open)`)
    }
    process.exit(1)
  }
  console.log('✓ No existing duplicates — safe to create the index.')

  // ── CREATE the partial unique index (idempotent) ──
  console.log('Creating partial unique index hr_onboarding_one_open_per_employee...')
  await pool.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS hr_onboarding_one_open_per_employee
       ON hr_onboarding (hr_employee_id)
     WHERE status IN ('draft','invited','in_progress','submitted')
       AND hr_employee_id IS NOT NULL`,
  )

  const check = await pool.query(
    `SELECT 1 FROM pg_indexes WHERE indexname = 'hr_onboarding_one_open_per_employee'`,
  )
  if (check.rowCount === 0) throw new Error('Index was not created.')

  console.log('✓ hr_onboarding_one_open_per_employee present.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
