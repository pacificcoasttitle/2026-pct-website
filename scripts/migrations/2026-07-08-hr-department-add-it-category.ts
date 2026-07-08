/**
 * MIGRATION: add 'it' to the HR department-token category CHECK.
 *
 * Adds a 4th HR-onboarding department category (key 'it', label 'IT').
 * Widens hr_onboarding_department_tokens_category_chk to accept 'it' so
 * IT department tokens can be issued/stored.
 *
 * ⚠️ SCOPE: touches ONLY the HR department-token CHECK. The legacy
 * rep_onboarding_items_category_check is a SEPARATE system and is NOT
 * modified here.
 *
 * IDEMPOTENT: DROP CONSTRAINT IF EXISTS then ADD (re-runnable).
 *
 * ⚠️ MANUAL-RUN ON PROD (Director): this is the 6th manual-prod migration
 * for the HR onboarding work this session. Run on deploy against prod:
 *   npx tsx scripts/migrations/2026-07-08-hr-department-add-it-category.ts
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

  console.log("Altering hr_onboarding_department_tokens_category_chk to include 'it'...")
  await pool.query(
    `ALTER TABLE hr_onboarding_department_tokens
       DROP CONSTRAINT IF EXISTS hr_onboarding_department_tokens_category_chk`,
  )
  await pool.query(
    `ALTER TABLE hr_onboarding_department_tokens
       ADD CONSTRAINT hr_onboarding_department_tokens_category_chk
       CHECK (category IN ('administrative','marketing','customer-service','it'))`,
  )

  // Verify the constraint now admits 'it'.
  const def = await pool.query(
    `SELECT pg_get_constraintdef(oid) AS def
       FROM pg_constraint
      WHERE conname = 'hr_onboarding_department_tokens_category_chk'`,
  )
  const text = def.rows[0]?.def ?? ''
  if (!/'it'/.test(text)) throw new Error(`CHECK does not include 'it': ${text}`)

  console.log('✓ CHECK now includes it:', text)
  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
