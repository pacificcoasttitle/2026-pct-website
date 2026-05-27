/**
 * MIGRATION: Add sales_manager BOOLEAN column to vcard_employees.
 *
 * BACKGROUND:
 * vcard_employees predates the in-code ensure* pattern used by newer
 * tables (signature_templates, staff_members, asset_delivery_*). The
 * table has no CREATE TABLE block in this codebase. Adding new columns
 * therefore requires a one-shot migration script run against Render
 * Postgres directly.
 *
 * IDEMPOTENT: Safe to re-run. Uses ADD COLUMN IF NOT EXISTS.
 *
 * RUN: npx tsx scripts/migrations/2026-05-27-vcard-sales-manager.ts
 *
 * SCOPE:
 * - sales_manager: boolean flag, default false. Used by the Weekly
 *   Marketing Recap feature to identify sales managers who should
 *   receive the recap email. Set explicitly per-rep via the admin
 *   employee edit UI (not inferred from title).
 *
 * VERIFICATION:
 * After running, verify with:
 *   SELECT column_name, data_type, column_default
 *   FROM information_schema.columns
 *   WHERE table_name = 'vcard_employees' AND column_name = 'sales_manager';
 */

/* eslint-disable no-console */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Tiny .env loader — mirrors scripts/backfill-team-audiences.ts so this
// migration can be invoked directly via `npx tsx` outside Next.js's runtime.
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

  console.log('Adding sales_manager column to vcard_employees...')

  await pool.query(`
    ALTER TABLE vcard_employees
    ADD COLUMN IF NOT EXISTS sales_manager BOOLEAN DEFAULT false
  `)

  // Verify
  const result = await pool.query(`
    SELECT column_name, data_type, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'vcard_employees' AND column_name = 'sales_manager'
  `)

  if (result.rows.length === 0) {
    throw new Error('Column was not created')
  }

  console.log('✓ Column verified:')
  console.log(result.rows[0])

  // Confirm all existing rows defaulted to false
  const counts = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE sales_manager = true)  AS true_count,
      COUNT(*) FILTER (WHERE sales_manager = false) AS false_count,
      COUNT(*) FILTER (WHERE sales_manager IS NULL) AS null_count
    FROM vcard_employees
  `)

  console.log('✓ Existing row distribution:')
  console.log(counts.rows[0])
  console.log('  (expected: 0 true, 35 false, 0 null)')

  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
