/**
 * MIGRATION (2d): Add deactivated_at to hr_employees.
 *
 * BACKGROUND:
 * HR soft-deactivation records WHEN an employee was marked inactive.
 * `active=false` flips the flag; `deactivated_at` stamps the moment.
 * Reactivation clears it back to NULL. Purely additive + nullable —
 * existing rows are unaffected (NULL = "never deactivated").
 *
 * ⚠️ Touches ONLY hr_employees. Does not alter vcard_employees or
 * staff_members.
 *
 * IDEMPOTENT: Safe to re-run. Uses ADD COLUMN IF NOT EXISTS.
 *
 * RUN (gated step, same handling as 2026-06-24-hr-employees.ts —
 * written + reviewed here, run in the deploy/Gopher step):
 *   npx tsx scripts/migrations/2026-06-24-hr-deactivated-at.ts
 *
 * VERIFICATION:
 *   SELECT column_name, data_type, is_nullable
 *     FROM information_schema.columns
 *    WHERE table_name = 'hr_employees' AND column_name = 'deactivated_at';
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

  console.log('Adding deactivated_at column to hr_employees...')

  await pool.query(`
    ALTER TABLE hr_employees
    ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ
  `)

  const result = await pool.query(`
    SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
     WHERE table_name = 'hr_employees' AND column_name = 'deactivated_at'
  `)
  if (result.rows.length === 0) {
    throw new Error('Column was not created')
  }
  console.log('✓ Column verified:')
  console.log(result.rows[0])

  console.log('\n✓ Only hr_employees touched — vcard_employees / staff_members untouched.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
