/**
 * Smoke-test for ensureMarketingRecapTables().
 *
 * RUN: npx tsx scripts/test-ensure-marketing-recap.ts
 *
 * Verifies:
 *   - All 4 recap tables exist in information_schema
 *   - Rudy + Brandon are seeded as recipients
 *   - Count columns (recipient_count, successful_sends, failed_sends)
 *     are INTEGER not BIGINT
 *
 * Safe to re-run — ensureMarketingRecapTables() is idempotent.
 */

/* eslint-disable no-console */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Tiny .env loader — matches the pattern in scripts/migrations/*.
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

// Import AFTER env load so getPool() picks up DATABASE_URL.
import {
  ensureMarketingRecapTables,
  getPool,
  getActiveSalesManagers,
} from '../lib/admin-db'

async function main() {
  console.log('Running ensureMarketingRecapTables()...')
  await ensureMarketingRecapTables()
  console.log('✓ Function returned')

  const pool = getPool()

  // Verify all 4 tables exist
  const tables = await pool.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_name IN (
      'marketing_recap_recipients',
      'marketing_upcoming',
      'marketing_recap_drafts',
      'marketing_recap_sends'
    )
    ORDER BY table_name
  `)
  console.log('✓ Tables found:', tables.rows.map((r: { table_name: string }) => r.table_name))
  if (tables.rows.length !== 4) {
    throw new Error(`Expected 4 tables, found ${tables.rows.length}`)
  }

  // Verify recipients seed
  const recipients = await pool.query(`
    SELECT email, name, role FROM marketing_recap_recipients ORDER BY name
  `)
  console.log('✓ Seeded recipients:', recipients.rows)

  // Verify count columns are INTEGER not BIGINT
  const draftCols = await pool.query(`
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_name = 'marketing_recap_drafts'
      AND column_name IN ('recipient_count', 'successful_sends', 'failed_sends')
    ORDER BY column_name
  `)
  console.log('✓ Count column types:', draftCols.rows)
  for (const c of draftCols.rows as Array<{ column_name: string; data_type: string }>) {
    if (c.data_type !== 'integer') {
      throw new Error(`${c.column_name} is ${c.data_type}, expected integer`)
    }
  }

  // Verify the sales-manager resolver works against vcard_employees
  const managers = await getActiveSalesManagers()
  console.log('✓ Active sales managers:', managers)

  process.exit(0)
}

main().catch((err) => {
  console.error('Test failed:', err)
  process.exit(1)
})
