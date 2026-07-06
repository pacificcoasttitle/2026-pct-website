/**
 * MIGRATION: orchestration closers tracking columns (Batch C).
 *
 * Adds two nullable tracking timestamps:
 *   - hr_onboarding_department_tokens.completed_notified_at
 *       Stamped when HR was notified that THIS department completed all
 *       its items (notify-once gate — re-completions never re-notify).
 *   - hr_onboarding.intro_email_sent_at
 *       Stamped when the new-hire intro email was sent on kickoff
 *       (system action, send/show-once).
 *
 * IDEMPOTENT: ADD COLUMN IF NOT EXISTS.
 *
 * ⚠️ MANUAL-RUN ON PROD (Director): this is the 4th manual-prod migration
 * for the HR onboarding work. Run on deploy against the prod DATABASE_URL:
 *   npx tsx scripts/migrations/2026-07-06-orchestration-closers-tracking.ts
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

  console.log('Adding hr_onboarding_department_tokens.completed_notified_at...')
  await pool.query(
    `ALTER TABLE hr_onboarding_department_tokens
       ADD COLUMN IF NOT EXISTS completed_notified_at TIMESTAMPTZ`,
  )

  console.log('Adding hr_onboarding.intro_email_sent_at...')
  await pool.query(
    `ALTER TABLE hr_onboarding
       ADD COLUMN IF NOT EXISTS intro_email_sent_at TIMESTAMPTZ`,
  )

  const check = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM information_schema.columns
        WHERE table_name = 'hr_onboarding_department_tokens'
          AND column_name = 'completed_notified_at') AS dept_col,
      (SELECT COUNT(*) FROM information_schema.columns
        WHERE table_name = 'hr_onboarding'
          AND column_name = 'intro_email_sent_at') AS onboarding_col
  `)
  const row = check.rows[0]
  if (Number(row.dept_col) === 0) throw new Error('completed_notified_at not added.')
  if (Number(row.onboarding_col) === 0) throw new Error('intro_email_sent_at not added.')

  console.log('✓ completed_notified_at + intro_email_sent_at present.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
