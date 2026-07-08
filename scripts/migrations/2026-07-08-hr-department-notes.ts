/**
 * MIGRATION: per-department notes back to HR.
 *
 * Adds two nullable columns to hr_onboarding_department_tokens so a
 * department can leave a free-text note for HR (e.g. what they completed):
 *   - department_note            TEXT
 *   - department_note_updated_at TIMESTAMPTZ
 *
 * IDEMPOTENT: ADD COLUMN IF NOT EXISTS.
 *
 * ⚠️ MANUAL-RUN ON PROD (Director): this is the 7th manual-prod migration
 * for the HR onboarding work this session. Run on deploy against prod:
 *   npx tsx scripts/migrations/2026-07-08-hr-department-notes.ts
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

  console.log('Adding hr_onboarding_department_tokens.department_note...')
  await pool.query(
    `ALTER TABLE hr_onboarding_department_tokens
       ADD COLUMN IF NOT EXISTS department_note TEXT`,
  )
  console.log('Adding hr_onboarding_department_tokens.department_note_updated_at...')
  await pool.query(
    `ALTER TABLE hr_onboarding_department_tokens
       ADD COLUMN IF NOT EXISTS department_note_updated_at TIMESTAMPTZ`,
  )

  const check = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM information_schema.columns
        WHERE table_name='hr_onboarding_department_tokens' AND column_name='department_note') AS note,
      (SELECT COUNT(*) FROM information_schema.columns
        WHERE table_name='hr_onboarding_department_tokens' AND column_name='department_note_updated_at') AS ts
  `)
  const row = check.rows[0]
  if (Number(row.note) === 0) throw new Error('department_note not added.')
  if (Number(row.ts) === 0) throw new Error('department_note_updated_at not added.')

  console.log('✓ department_note + department_note_updated_at present.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
