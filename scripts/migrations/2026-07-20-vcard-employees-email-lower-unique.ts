/**
 * MIGRATION: partial UNIQUE index on normalized vcard email.
 *
 * Layer 2 (ensure-vcard) matches and creates vcards by email as the identity
 * key. Without a UNIQUE constraint on email, concurrent creates of the same
 * rep can produce two vcards — SELECT-before-insert is not atomic, and the
 * 23505 catch path can never fire. This adds the missing structural guard:
 *
 *   CREATE UNIQUE INDEX vcard_employees_email_lower_unique
 *     ON vcard_employees (LOWER(TRIM(email)))
 *     WHERE email IS NOT NULL AND TRIM(email) <> '';
 *
 * ⚠️ PARTIAL — null/blank emails are excluded so multiple blank rows remain
 * allowed (some legacy vcards have no email).
 * ⚠️ NORMALIZED — LOWER(TRIM) matches ensure-vcard's lookup + lowercase-
 * on-insert, so case/whitespace variants cannot duplicate.
 *
 * IDEMPOTENT: CREATE UNIQUE INDEX IF NOT EXISTS.
 *
 * ⚠️ PRE-CHECK: before creating, scan for existing normalized-email
 * duplicates. If any exist, abort with a report (do not fail opaquely).
 * Reviewer reports 0 today — confirm at run time.
 *
 * ⚠️ MANUAL-RUN ON PROD (Director): this is the 10th manual-prod migration
 * for the HR work this session. Run on deploy:
 *   npx tsx scripts/migrations/2026-07-20-vcard-employees-email-lower-unique.ts
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

const INDEX_NAME = 'vcard_employees_email_lower_unique'

async function main() {
  const pool = getPool()

  // ── PRE-CHECK: any existing normalized-email duplicates? ──
  console.log('Pre-check: scanning for duplicate LOWER(TRIM(email)) on vcard_employees...')
  const dupes = await pool.query<{
    norm_email: string
    dup_count: number
    vcard_ids: number[]
  }>(
    `SELECT LOWER(TRIM(email)) AS norm_email,
            COUNT(*)::int AS dup_count,
            ARRAY_AGG(id ORDER BY id) AS vcard_ids
       FROM vcard_employees
      WHERE email IS NOT NULL AND TRIM(email) <> ''
      GROUP BY LOWER(TRIM(email))
     HAVING COUNT(*) > 1
      ORDER BY norm_email`,
  )

  if (dupes.rowCount && dupes.rowCount > 0) {
    console.error(
      `\n❌ ABORTING — ${dupes.rowCount} normalized email(s) already have MULTIPLE vcards.\n` +
        `Resolve these before re-running (merge/unlink extras):`,
    )
    for (const r of dupes.rows) {
      console.error(
        `   ${r.norm_email}: vcards ${JSON.stringify(r.vcard_ids)} (${r.dup_count} rows)`,
      )
    }
    process.exit(1)
  }
  console.log('✓ No existing duplicates — safe to create the index.')

  // ── CREATE the partial unique index (idempotent) ──
  console.log(`Creating partial unique index ${INDEX_NAME}...`)
  await pool.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS ${INDEX_NAME}
       ON vcard_employees (LOWER(TRIM(email)))
     WHERE email IS NOT NULL AND TRIM(email) <> ''`,
  )

  const check = await pool.query(
    `SELECT indexdef FROM pg_indexes WHERE indexname = $1`,
    [INDEX_NAME],
  )
  if (check.rowCount === 0) throw new Error(`Index ${INDEX_NAME} was not created.`)

  console.log(`✓ ${INDEX_NAME} present.`)
  console.log(`  ${check.rows[0].indexdef}`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
