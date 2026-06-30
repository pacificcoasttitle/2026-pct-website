/**
 * MIGRATION: HR onboarding department orchestration tokens (Ticket 1).
 *
 * Adds one token row per (onboarding, checklist category) for department
 * task links. This is separate from hr_onboarding.token_hash, so the
 * employee wizard link is untouched.
 *
 * IDEMPOTENT: CREATE TABLE IF NOT EXISTS, ADD COLUMN IF NOT EXISTS, and
 * constraint/index creation guarded by catalog checks.
 *
 * RUN (gated deploy step):
 *   npx tsx scripts/migrations/2026-06-30-hr-onboarding-department-tokens.ts
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

  console.log('Creating hr_onboarding_department_tokens...')
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hr_onboarding_department_tokens (
      id               SERIAL PRIMARY KEY,
      onboarding_id    INTEGER NOT NULL REFERENCES hr_onboarding(id) ON DELETE CASCADE,
      category         TEXT NOT NULL,
      token_hash       TEXT NOT NULL,
      token_expires_at TIMESTAMPTZ NOT NULL,
      sent_to          TEXT,
      sent_at          TIMESTAMPTZ,
      sent_by          TEXT,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  const cols: Array<[string, string]> = [
    ['onboarding_id', 'INTEGER REFERENCES hr_onboarding(id) ON DELETE CASCADE'],
    ['category', 'TEXT'],
    ['token_hash', 'TEXT'],
    ['token_expires_at', 'TIMESTAMPTZ'],
    ['sent_to', 'TEXT'],
    ['sent_at', 'TIMESTAMPTZ'],
    ['sent_by', 'TEXT'],
    ['created_at', 'TIMESTAMPTZ NOT NULL DEFAULT NOW()'],
    ['updated_at', 'TIMESTAMPTZ NOT NULL DEFAULT NOW()'],
  ]
  for (const [c, def] of cols) {
    await pool.query(`ALTER TABLE hr_onboarding_department_tokens ADD COLUMN IF NOT EXISTS ${c} ${def}`)
  }

  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'hr_onboarding_department_tokens_category_chk'
      ) THEN
        ALTER TABLE hr_onboarding_department_tokens
          ADD CONSTRAINT hr_onboarding_department_tokens_category_chk
          CHECK (category IN ('administrative','marketing','customer-service'));
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'hr_onboarding_department_tokens_onboarding_category_uk'
      ) THEN
        ALTER TABLE hr_onboarding_department_tokens
          ADD CONSTRAINT hr_onboarding_department_tokens_onboarding_category_uk
          UNIQUE (onboarding_id, category);
      END IF;
    END $$;
  `)

  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_hr_onboarding_department_tokens_hash
       ON hr_onboarding_department_tokens (token_hash)`,
  )
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_hr_onboarding_department_tokens_onboarding
       ON hr_onboarding_department_tokens (onboarding_id)`,
  )

  const verify = await pool.query(`
    SELECT table_name
      FROM information_schema.tables
     WHERE table_name = 'hr_onboarding_department_tokens'
  `)
  if (verify.rows.length === 0) throw new Error('hr_onboarding_department_tokens not created.')

  console.log('✓ hr_onboarding_department_tokens created/verified.')
  console.log('✓ Separate from hr_onboarding.token_hash; wizard tokens untouched.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
