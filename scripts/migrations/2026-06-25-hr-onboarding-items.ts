/**
 * MIGRATION: HR onboarding checklist v1.
 *
 * Adds the manual per-hire checklist on the Phase 4 hr_onboarding spine:
 *   1. NEW TABLE hr_onboarding_items — one row per checklist item, linked
 *      to an hr_onboarding (ON DELETE CASCADE). Status vocabulary matches
 *      the legacy rep flow (pending | in_progress | complete). The
 *      `source` column ('manual' | 'auto') is the dormant seam for future
 *      auto-checking — v1 is all 'manual'.
 *   2. NEW COLUMN hr_onboarding.onboarding_type ('employee' | 'sales_rep',
 *      default 'sales_rep') — selects which seed item-set applies. Backfills
 *      existing rows to 'sales_rep' (they already default to it).
 *
 * ⚠️ ADDITIVE ONLY. New table + one new defaulted column. Does NOT alter
 * any existing hr_onboarding column, nor hr_employees / vcard / staff.
 *
 * ⚠️ Uses text + CHECK (NOT a pg enum) per enum-migrations-need-manual-sql:
 * text columns extend without manual ALTER TYPE gymnastics.
 *
 * IDEMPOTENT: CREATE TABLE / INDEX IF NOT EXISTS; ADD COLUMN IF NOT EXISTS.
 *
 * RUN (gated step): npx tsx scripts/migrations/2026-06-25-hr-onboarding-items.ts
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

  console.log('Adding hr_onboarding.onboarding_type...')
  await pool.query(
    `ALTER TABLE hr_onboarding
       ADD COLUMN IF NOT EXISTS onboarding_type TEXT NOT NULL DEFAULT 'sales_rep'`,
  )
  // CHECK constraint (idempotent add). 'employee' | 'sales_rep'.
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'hr_onboarding_onboarding_type_chk'
      ) THEN
        ALTER TABLE hr_onboarding
          ADD CONSTRAINT hr_onboarding_onboarding_type_chk
          CHECK (onboarding_type IN ('employee','sales_rep'));
      END IF;
    END $$;
  `)
  // Backfill any NULLs (defensive — column is NOT NULL DEFAULT, but if a
  // prior partial run left nulls, normalize them).
  await pool.query(
    `UPDATE hr_onboarding SET onboarding_type = 'sales_rep' WHERE onboarding_type IS NULL`,
  )

  console.log('Creating hr_onboarding_items...')
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hr_onboarding_items (
      id            SERIAL PRIMARY KEY,
      onboarding_id INTEGER NOT NULL REFERENCES hr_onboarding(id) ON DELETE CASCADE,
      item_key      TEXT NOT NULL,
      label         TEXT NOT NULL,
      category      TEXT NOT NULL,   -- 'administrative' | 'marketing' | 'customer-service'
      status        TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'in_progress' | 'complete'
      source        TEXT NOT NULL DEFAULT 'manual',   -- 'manual' | 'auto' (seam; v1 all manual)
      sort_order    INTEGER NOT NULL DEFAULT 0,
      completed_at  TIMESTAMPTZ,
      completed_by  TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  // Idempotent column top-ups (re-run safety if the table pre-existed).
  const cols: Array<[string, string]> = [
    ['onboarding_id', 'INTEGER REFERENCES hr_onboarding(id) ON DELETE CASCADE'],
    ['item_key', 'TEXT'],
    ['label', 'TEXT'],
    ['category', 'TEXT'],
    ['status', "TEXT NOT NULL DEFAULT 'pending'"],
    ['source', "TEXT NOT NULL DEFAULT 'manual'"],
    ['sort_order', 'INTEGER NOT NULL DEFAULT 0'],
    ['completed_at', 'TIMESTAMPTZ'],
    ['completed_by', 'TEXT'],
    ['created_at', 'TIMESTAMPTZ NOT NULL DEFAULT NOW()'],
    ['updated_at', 'TIMESTAMPTZ NOT NULL DEFAULT NOW()'],
  ]
  for (const [c, def] of cols) {
    await pool.query(`ALTER TABLE hr_onboarding_items ADD COLUMN IF NOT EXISTS ${c} ${def}`)
  }

  // Status / source CHECK constraints (idempotent).
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hr_onboarding_items_status_chk') THEN
        ALTER TABLE hr_onboarding_items
          ADD CONSTRAINT hr_onboarding_items_status_chk
          CHECK (status IN ('pending','in_progress','complete'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hr_onboarding_items_source_chk') THEN
        ALTER TABLE hr_onboarding_items
          ADD CONSTRAINT hr_onboarding_items_source_chk
          CHECK (source IN ('manual','auto'));
      END IF;
    END $$;
  `)

  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_hr_onboarding_items_onboarding ON hr_onboarding_items (onboarding_id)`,
  )

  // Verify
  const t = await pool.query(`
    SELECT table_name FROM information_schema.tables
     WHERE table_name = 'hr_onboarding_items'
  `)
  if (t.rows.length === 0) throw new Error('hr_onboarding_items not created.')

  const col = await pool.query(`
    SELECT column_name FROM information_schema.columns
     WHERE table_name = 'hr_onboarding' AND column_name = 'onboarding_type'
  `)
  if (col.rows.length === 0) throw new Error('hr_onboarding.onboarding_type not added.')

  console.log('✓ hr_onboarding_items created; hr_onboarding.onboarding_type added.')
  console.log('✓ Additive only — existing hr_onboarding columns / hr_employees / vcard / staff untouched.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
