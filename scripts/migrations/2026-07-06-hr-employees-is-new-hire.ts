/**
 * MIGRATION: hr_employees.is_new_hire flag.
 *
 * Adds an explicit new-hire boolean that drives the onboarding invite
 * email tone (welcoming vs warm-appropriate). This replaces the broken
 * hr_employee_id-based "existing" check — post single-path-flow every
 * hire is added via Add Employee first, so hr_employee_id is ALWAYS set
 * and can no longer distinguish new vs existing.
 *
 * DEFAULT TRUE — rationale: someone being added + onboarded is most
 * commonly a new hire, and it matches the safe warm default already
 * chosen in 69ba1ab. Existing roster rows (≈109) backfill to TRUE; that
 * is intentional and harmless (they aren't emailed unless re-onboarded,
 * and the warm/welcoming tone is the safe default).
 *
 * IDEMPOTENT: ADD COLUMN IF NOT EXISTS ... DEFAULT true.
 *
 * ⚠️ MANUAL-RUN ON PROD (Director): this is the 5th manual-prod migration
 * for the HR onboarding work this session. Run on deploy against prod:
 *   npx tsx scripts/migrations/2026-07-06-hr-employees-is-new-hire.ts
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

async function main() {
  const pool = getPool()

  console.log('Adding hr_employees.is_new_hire (BOOLEAN NOT NULL DEFAULT true)...')
  await pool.query(
    `ALTER TABLE hr_employees
       ADD COLUMN IF NOT EXISTS is_new_hire BOOLEAN NOT NULL DEFAULT true`,
  )

  const check = await pool.query(`
    SELECT COUNT(*) AS col
      FROM information_schema.columns
     WHERE table_name = 'hr_employees' AND column_name = 'is_new_hire'`)
  if (Number(check.rows[0].col) === 0) throw new Error('is_new_hire not added.')

  const stats = await pool.query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE is_new_hire)::int AS new_hire_true
       FROM hr_employees`)
  console.log(`✓ is_new_hire present. rows total=${stats.rows[0].total}, is_new_hire=true=${stats.rows[0].new_hire_true} (existing rows backfilled TRUE).`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
