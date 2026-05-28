/**
 * MIGRATION: Link marketing_upcoming items to asset_delivery_batches.
 *
 * BACKGROUND:
 * Stage H3 of the rich-item-model build. Adds an optional FK from
 * marketing_upcoming to asset_delivery_batches — the batch that
 * fulfilled the upcoming item. Setting the link auto-flips status to
 * 'shipped' (handled in the DB helpers, not here). This is the "easy
 * button" for shipped status that H1 deferred.
 *
 * SCHEMA NOTES:
 * - asset_delivery_batch_id INTEGER NULL. Nullable = "no link set"
 *   (the default state). No existing rows have a value, so adding the
 *   FK can't fail on existing data.
 * - FK references asset_delivery_batches(id) ON DELETE SET NULL so
 *   deleting a batch nulls the link rather than cascade-deleting the
 *   upcoming item or blocking the delete.
 * - Partial index where the link is set — Postgres does NOT auto-index
 *   FK columns.
 *
 * IDEMPOTENT: Safe to re-run. ADD COLUMN IF NOT EXISTS; FK added with a
 * defensive DROP CONSTRAINT IF EXISTS first; CREATE INDEX IF NOT EXISTS.
 *
 * RUN: npx tsx scripts/migrations/2026-05-28-upcoming-asset-link.ts
 *
 * VERIFICATION:
 *   SELECT column_name, data_type, is_nullable
 *     FROM information_schema.columns
 *    WHERE table_name = 'marketing_upcoming'
 *      AND column_name = 'asset_delivery_batch_id';
 *
 *   SELECT COUNT(*) FILTER (WHERE asset_delivery_batch_id IS NULL)     AS unlinked,
 *          COUNT(*) FILTER (WHERE asset_delivery_batch_id IS NOT NULL) AS linked
 *     FROM marketing_upcoming;
 */

/* eslint-disable no-console */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Tiny .env loader — mirrors the H1/H2 migrations so this script can be
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

  console.log('Adding asset_delivery_batch_id column to marketing_upcoming...')

  await pool.query(`
    ALTER TABLE marketing_upcoming
    ADD COLUMN IF NOT EXISTS asset_delivery_batch_id INTEGER
  `)

  console.log('Attaching FK constraint (ON DELETE SET NULL)...')
  await pool.query(`
    ALTER TABLE marketing_upcoming
    DROP CONSTRAINT IF EXISTS marketing_upcoming_asset_link_fk
  `)
  await pool.query(`
    ALTER TABLE marketing_upcoming
    ADD CONSTRAINT marketing_upcoming_asset_link_fk
    FOREIGN KEY (asset_delivery_batch_id)
    REFERENCES asset_delivery_batches(id)
    ON DELETE SET NULL
  `)

  console.log('Creating partial index for the FK...')
  await pool.query(`
    CREATE INDEX IF NOT EXISTS marketing_upcoming_asset_link_idx
      ON marketing_upcoming(asset_delivery_batch_id)
      WHERE asset_delivery_batch_id IS NOT NULL
  `)

  // Verify
  const result = await pool.query(`
    SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
     WHERE table_name = 'marketing_upcoming'
       AND column_name = 'asset_delivery_batch_id'
  `)
  if (result.rows.length === 0) {
    throw new Error('Column was not created')
  }
  console.log('✓ Column verified:')
  console.log(result.rows[0])

  const dist = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE asset_delivery_batch_id IS NULL)::int     AS unlinked,
      COUNT(*) FILTER (WHERE asset_delivery_batch_id IS NOT NULL)::int AS linked
      FROM marketing_upcoming
  `)
  const row = dist.rows[0]
  console.log('✓ Link distribution:')
  console.log(`  unlinked (null): ${row.unlinked}`)
  console.log(`  linked (set):    ${row.linked}`)

  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
