/**
 * MIGRATION: DB-backed HR onboarding checklist TEMPLATES (Phase 1+2).
 *
 * Converts the hardcoded per-type seed lists (lib/hr-onboarding/seed-items.ts)
 * into a master template table the seeder reads from. THREE steps, all in
 * this migration:
 *
 *   PART A — NEW TABLE hr_onboarding_item_templates: the per-type master
 *     checklist (active flag, sort_order, audit cols for the later editor
 *     UI). UNIQUE(onboarding_type, item_key) — a key is unique PER TYPE.
 *
 *   PART A (seed) — populate it from the CURRENT code lists bit-for-bit:
 *     sales_rep → the 16 CANONICAL_ITEMS (order 1..16),
 *     employee  → hr-packet + headshot-employee (order 1..2),
 *     all active=true. Day-one template == today's behavior.
 *
 *   PART B — BACKFILL: any hr_onboarding with ZERO stamped items (an old
 *     row that relied on seed-on-first-view) gets stamped NOW from its
 *     type's list — the SAME items it would have received — so future
 *     template edits can never retroactively change an old onboarding
 *     (closes the seed-on-first-view loophole; future-only made true).
 *
 * ⚠️ ADDITIVE + DATA-MATERIALIZING ONLY. New table + seed + backfill of
 * UNSTAMPED rows. Never mutates an already-stamped onboarding's items.
 * Does NOT change which items a type gets — source only (code → DB).
 *
 * ⚠️ text + CHECK (NOT a pg enum) per enum-migrations-need-manual-sql.
 * IDEMPOTENT: CREATE TABLE/INDEX IF NOT EXISTS; ON CONFLICT DO NOTHING on
 * the seed; backfill only touches rows with zero items.
 *
 * RUN: npx tsx scripts/migrations/2026-06-26-hr-onboarding-item-templates.ts
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
import {
  HR_ONBOARDING_SEED_ITEMS,
  type HrOnboardingType,
} from '../../lib/hr-onboarding/seed-items'

async function main() {
  const pool = getPool()

  // ── PART A: the template table ───────────────────────────────────
  console.log('Creating hr_onboarding_item_templates...')
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hr_onboarding_item_templates (
      id              SERIAL PRIMARY KEY,
      onboarding_type TEXT NOT NULL,   -- 'employee' | 'sales_rep'
      item_key        TEXT NOT NULL,
      label           TEXT NOT NULL,
      category        TEXT NOT NULL,
      sort_order      INTEGER NOT NULL DEFAULT 0,
      active          BOOLEAN NOT NULL DEFAULT true,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_by      TEXT,
      updated_by      TEXT,
      deactivated_at  TIMESTAMPTZ
    );
  `)

  // CHECK on onboarding_type + UNIQUE(type, item_key) (idempotent).
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hr_onboarding_item_templates_type_chk') THEN
        ALTER TABLE hr_onboarding_item_templates
          ADD CONSTRAINT hr_onboarding_item_templates_type_chk
          CHECK (onboarding_type IN ('employee','sales_rep'));
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hr_onboarding_item_templates_type_key_uk') THEN
        ALTER TABLE hr_onboarding_item_templates
          ADD CONSTRAINT hr_onboarding_item_templates_type_key_uk
          UNIQUE (onboarding_type, item_key);
      END IF;
    END $$;
  `)

  // ── PART A (seed): from the CURRENT code lists, bit-for-bit ──────
  // ON CONFLICT DO NOTHING keeps it idempotent and NEVER overwrites a
  // row HR may have edited via a future UI.
  const types: HrOnboardingType[] = ['sales_rep', 'employee']
  let seeded = 0
  for (const type of types) {
    const items = HR_ONBOARDING_SEED_ITEMS[type]
    for (let i = 0; i < items.length; i++) {
      const it = items[i]
      const res = await pool.query(
        `INSERT INTO hr_onboarding_item_templates
           (onboarding_type, item_key, label, category, sort_order, active)
         VALUES ($1, $2, $3, $4, $5, true)
         ON CONFLICT (onboarding_type, item_key) DO NOTHING`,
        [type, it.item_key, it.label, it.category, i + 1],
      )
      seeded += res.rowCount || 0
    }
  }
  console.log(`✓ Seeded ${seeded} template rows (sales_rep=${HR_ONBOARDING_SEED_ITEMS.sales_rep.length}, employee=${HR_ONBOARDING_SEED_ITEMS.employee.length} on a fresh table).`)

  // ── PART B: backfill UNSTAMPED onboardings ───────────────────────
  // Any hr_onboarding with zero hr_onboarding_items gets stamped from
  // its type's ACTIVE templates (the same items seed-on-first-view would
  // have produced). Already-stamped rows are skipped entirely.
  const unstamped = await pool.query(`
    SELECT o.id, o.onboarding_type
      FROM hr_onboarding o
     WHERE NOT EXISTS (
       SELECT 1 FROM hr_onboarding_items i WHERE i.onboarding_id = o.id
     )
     ORDER BY o.id ASC
  `)
  let backfilled = 0
  for (const row of unstamped.rows as Array<{ id: number; onboarding_type: string }>) {
    const type = row.onboarding_type === 'employee' ? 'employee' : 'sales_rep'
    // Read the active templates (same source the rewired seeder uses).
    const tpl = await pool.query(
      `SELECT item_key, label, category
         FROM hr_onboarding_item_templates
        WHERE onboarding_type = $1 AND active = true
        ORDER BY sort_order ASC, id ASC`,
      [type],
    )
    let items: Array<{ item_key: string; label: string; category: string }> = tpl.rows
    // Empty-guard + code fallback (mirrors the seeder).
    if (items.length === 0) {
      console.error(`[backfill] checklist template empty for type ${type} — using code fallback`)
      items = HR_ONBOARDING_SEED_ITEMS[type as HrOnboardingType]
    }
    if (items.length === 0) continue // never emit an empty INSERT

    const values: unknown[] = []
    const tuples: string[] = []
    items.forEach((it, i) => {
      const base = i * 5
      tuples.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`)
      values.push(row.id, it.item_key, it.label, it.category, i + 1)
    })
    await pool.query(
      `INSERT INTO hr_onboarding_items (onboarding_id, item_key, label, category, sort_order)
       VALUES ${tuples.join(', ')}`,
      values,
    )
    backfilled++
  }
  console.log(`✓ Backfilled ${backfilled} previously-unstamped onboarding row(s).`)

  // Verify
  const t = await pool.query(`
    SELECT table_name FROM information_schema.tables
     WHERE table_name = 'hr_onboarding_item_templates'
  `)
  if (t.rows.length === 0) throw new Error('hr_onboarding_item_templates not created.')

  console.log('✓ Template table created + seeded; unstamped onboardings backfilled.')
  console.log('✓ Additive/materializing only — no existing stamped items mutated.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
