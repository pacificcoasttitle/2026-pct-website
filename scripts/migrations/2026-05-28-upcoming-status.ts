/**
 * MIGRATION: Add status column to marketing_upcoming.
 *
 * BACKGROUND:
 * Stage H1 of the rich-item-model build adds a three-value status enum
 * to upcoming items: 'planned' | 'shipped' | 'cancelled'. New items
 * default to 'planned'; existing rows are backfilled to 'planned' so
 * the column is NOT NULL safely.
 *
 * SCHEMA STYLE NOTE:
 * The other status-bearing tables in this codebase
 * (marketing_recap_drafts.status, marketing_recap_sends.send_status,
 * asset_delivery_batches.status) all use `TEXT NOT NULL DEFAULT '...'`
 * — they do NOT use Postgres ENUM types. Type-safety lives in the
 * TypeScript union (`UpcomingStatus`) and is enforced server-side via
 * the Zod schemas at the route layer. We follow that established
 * pattern here for consistency — adding a CHECK constraint to keep
 * bad values out at the DB layer too.
 *
 * IDEMPOTENT: Safe to re-run. Uses ADD COLUMN IF NOT EXISTS, and the
 * CHECK constraint is added with NOT VALID + a guarded re-add so a
 * re-run doesn't double-attach it.
 *
 * RUN: npx tsx scripts/migrations/2026-05-28-upcoming-status.ts
 *
 * VERIFICATION:
 * After running, verify with:
 *   SELECT column_name, data_type, column_default, is_nullable
 *     FROM information_schema.columns
 *    WHERE table_name = 'marketing_upcoming' AND column_name = 'status';
 *
 *   SELECT status, COUNT(*) FROM marketing_upcoming GROUP BY status;
 */

/* eslint-disable no-console */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Tiny .env loader — mirrors the sales_manager migration so this
// script can be invoked directly via `npx tsx` outside Next.js's runtime.
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

  console.log('Adding status column to marketing_upcoming...')

  await pool.query(`
    ALTER TABLE marketing_upcoming
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'planned'
  `)

  // Defensive backfill: ADD COLUMN with DEFAULT handles new rows and
  // back-populates existing rows in modern Postgres, but this is cheap
  // and covers any edge case where a row landed before DEFAULT applied.
  await pool.query(`
    UPDATE marketing_upcoming
       SET status = 'planned'
     WHERE status IS NULL OR status NOT IN ('planned', 'shipped', 'cancelled')
  `)

  // Attach a CHECK constraint to keep stray values out at the DB layer.
  // Idempotent: drop-if-exists then add. NOT VALID isn't needed because
  // the prior UPDATE already normalized every row.
  await pool.query(`
    ALTER TABLE marketing_upcoming
    DROP CONSTRAINT IF EXISTS marketing_upcoming_status_check
  `)
  await pool.query(`
    ALTER TABLE marketing_upcoming
    ADD CONSTRAINT marketing_upcoming_status_check
    CHECK (status IN ('planned', 'shipped', 'cancelled'))
  `)

  // Verify
  const result = await pool.query(`
    SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
     WHERE table_name = 'marketing_upcoming' AND column_name = 'status'
  `)
  if (result.rows.length === 0) {
    throw new Error('Column was not created')
  }
  console.log('✓ Column verified:')
  console.log(result.rows[0])

  const counts = await pool.query(`
    SELECT status, COUNT(*)::int AS n
      FROM marketing_upcoming
     GROUP BY status
     ORDER BY status ASC
  `)
  console.log('✓ Status distribution after backfill:')
  if (counts.rows.length === 0) {
    console.log('  (table empty)')
  } else {
    for (const row of counts.rows) {
      console.log(`  ${row.status}: ${row.n}`)
    }
  }

  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
