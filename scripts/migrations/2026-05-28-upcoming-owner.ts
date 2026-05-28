/**
 * MIGRATION: Add owner column to marketing_upcoming.
 *
 * BACKGROUND:
 * Stage H2 of the rich-item-model build adds an optional free-text
 * 'owner' column to upcoming items — whoever's responsible for the
 * item. Nullable; the default state is "unset" (NULL). Empty strings
 * normalize to NULL at the API layer.
 *
 * SCHEMA STYLE NOTE:
 * Pure free-text TEXT column. No CHECK constraint (there's nothing to
 * constrain meaningfully — typo'd names are accepted; the length cap
 * lives in the Zod schemas at the route layer). No FK to
 * vcard_employees (decision locked — free-text only). No backfill
 * (NULL is the valid 'unset' state).
 *
 * IDEMPOTENT: Safe to re-run. Uses ADD COLUMN IF NOT EXISTS.
 *
 * RUN: npx tsx scripts/migrations/2026-05-28-upcoming-owner.ts
 *
 * VERIFICATION:
 * After running, verify with:
 *   SELECT column_name, data_type, column_default, is_nullable
 *     FROM information_schema.columns
 *    WHERE table_name = 'marketing_upcoming' AND column_name = 'owner';
 *
 *   SELECT COUNT(*) FILTER (WHERE owner IS NULL OR owner = '') AS unset,
 *          COUNT(*) FILTER (WHERE owner IS NOT NULL AND owner <> '') AS set
 *     FROM marketing_upcoming;
 */

/* eslint-disable no-console */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Tiny .env loader — mirrors the status migration so this script can
// be invoked directly via `npx tsx` outside Next.js's runtime.
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

  console.log('Adding owner column to marketing_upcoming...')

  await pool.query(`
    ALTER TABLE marketing_upcoming
    ADD COLUMN IF NOT EXISTS owner TEXT
  `)
  // No backfill needed (NULL is valid; default state is "unset").
  // No CHECK (free-text).

  // Verify
  const result = await pool.query(`
    SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
     WHERE table_name = 'marketing_upcoming' AND column_name = 'owner'
  `)
  if (result.rows.length === 0) {
    throw new Error('Column was not created')
  }
  console.log('✓ Column verified:')
  console.log(result.rows[0])

  const dist = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE owner IS NULL OR owner = '')::int          AS unset,
      COUNT(*) FILTER (WHERE owner IS NOT NULL AND owner <> '')::int    AS set_count
      FROM marketing_upcoming
  `)
  const row = dist.rows[0]
  console.log('✓ Owner null-vs-set distribution:')
  console.log(`  unset (null/empty): ${row.unset}`)
  console.log(`  set (has a name):   ${row.set_count}`)

  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
