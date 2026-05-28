/**
 * MIGRATION: Add recurrence to marketing_upcoming.
 *
 * BACKGROUND:
 * Stage H4 — the final and most complex H ticket. Adds compute-from-rule
 * recurrence to upcoming items. Five fixed patterns: none (default),
 * weekly, biweekly, monthly_day, monthly_weekday. Optional end date.
 *
 * SCHEMA NOTES:
 * - recurrence_pattern TEXT NOT NULL DEFAULT 'none' with a CHECK
 *   constraint (same TEXT-with-CHECK idiom as H1's status). New + existing
 *   rows are 'none' → fully backward-compatible.
 * - recurrence_until DATE NULL — optional end; NULL = unbounded (bounded
 *   in practice by the read-time window).
 * - Partial index on recurring rows only (small table, but good hygiene
 *   for the "all active recurring items" query the expander feeds).
 *
 * IDEMPOTENT: ADD COLUMN IF NOT EXISTS; defensive backfill; CHECK added
 * with DROP-IF-EXISTS first; CREATE INDEX IF NOT EXISTS.
 *
 * RUN: npx tsx scripts/migrations/2026-05-28-upcoming-recurrence.ts
 *
 * VERIFICATION:
 *   SELECT column_name, data_type, column_default, is_nullable
 *     FROM information_schema.columns
 *    WHERE table_name = 'marketing_upcoming'
 *      AND column_name IN ('recurrence_pattern','recurrence_until');
 *
 *   SELECT recurrence_pattern, COUNT(*) FROM marketing_upcoming
 *    GROUP BY recurrence_pattern ORDER BY recurrence_pattern;
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

  console.log('Adding recurrence columns to marketing_upcoming...')

  await pool.query(`
    ALTER TABLE marketing_upcoming
    ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT NOT NULL DEFAULT 'none'
  `)
  await pool.query(`
    ALTER TABLE marketing_upcoming
    ADD COLUMN IF NOT EXISTS recurrence_until DATE
  `)

  console.log('Defensive backfill of recurrence_pattern...')
  await pool.query(`
    UPDATE marketing_upcoming
       SET recurrence_pattern = 'none'
     WHERE recurrence_pattern IS NULL
        OR recurrence_pattern NOT IN ('none','weekly','biweekly','monthly_day','monthly_weekday')
  `)

  console.log('Attaching CHECK constraint...')
  await pool.query(`
    ALTER TABLE marketing_upcoming
    DROP CONSTRAINT IF EXISTS marketing_upcoming_recurrence_pattern_check
  `)
  await pool.query(`
    ALTER TABLE marketing_upcoming
    ADD CONSTRAINT marketing_upcoming_recurrence_pattern_check
    CHECK (recurrence_pattern IN ('none','weekly','biweekly','monthly_day','monthly_weekday'))
  `)

  console.log('Creating partial index for recurring rows...')
  await pool.query(`
    CREATE INDEX IF NOT EXISTS marketing_upcoming_recurrence_idx
      ON marketing_upcoming(recurrence_pattern)
      WHERE recurrence_pattern <> 'none'
  `)

  // Verify
  const cols = await pool.query(`
    SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
     WHERE table_name = 'marketing_upcoming'
       AND column_name IN ('recurrence_pattern','recurrence_until')
     ORDER BY column_name
  `)
  if (cols.rows.length !== 2) {
    throw new Error('Recurrence columns were not created as expected')
  }
  console.log('✓ Columns verified:')
  for (const r of cols.rows) console.log('  ', r)

  const dist = await pool.query(`
    SELECT recurrence_pattern, COUNT(*)::int AS n
      FROM marketing_upcoming
     GROUP BY recurrence_pattern
     ORDER BY recurrence_pattern
  `)
  console.log('✓ Pattern distribution:')
  if (dist.rows.length === 0) {
    console.log('   (table empty)')
  } else {
    for (const r of dist.rows) console.log(`   ${r.recurrence_pattern}: ${r.n}`)
  }

  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
