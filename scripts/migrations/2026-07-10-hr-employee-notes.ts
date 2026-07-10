/**
 * MIGRATION: per-employee accomplishment notes (2 tables).
 *
 * Creates the notes system for recognition tracking:
 *
 *   1. hr_employee_note_authors — an allowlist of WHO may author notes,
 *      independent of the over-broad manager='all' role. A row here (active)
 *      grants write access to a non-HR user.
 *
 *   2. hr_employee_notes — the notes themselves: subject employee,
 *      server-set author, note_type (defaults 'accomplishment'), body,
 *      optional category/occurred_on, and soft-delete columns (reserved).
 *
 * Plus 3 indexes:
 *   - by employee + created_at (list newest-first for one employee)
 *   - by author + employee + created_at (manager-private scoped reads)
 *   - a PARTIAL index for the future AI quarterly-nomination pass over
 *     accomplishments (WHERE deleted_at IS NULL AND note_type='accomplishment')
 *
 * ⚠️ NO CHECK constraint locking note_type — the schema deliberately allows
 * future types (reprimand/other). The API enforces the ENABLED set
 * (accomplishment only) so the disabled types are unreachable today.
 *
 * IDEMPOTENT: CREATE TABLE / CREATE INDEX ... IF NOT EXISTS.
 *
 * ⚠️ MANUAL-RUN ON PROD (Director): this is the 9th manual-prod migration
 * for the HR work this session. Run on deploy against prod:
 *   npx tsx scripts/migrations/2026-07-10-hr-employee-notes.ts
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

  console.log('Creating hr_employee_note_authors...')
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hr_employee_note_authors (
      author_user_id    INTEGER PRIMARY KEY REFERENCES vcard_admin_users(id) ON DELETE CASCADE,
      active            BOOLEAN NOT NULL DEFAULT TRUE,
      added_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      added_by_user_id  INTEGER REFERENCES vcard_admin_users(id) ON DELETE SET NULL
    )
  `)

  console.log('Creating hr_employee_notes...')
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hr_employee_notes (
      id                  SERIAL PRIMARY KEY,
      hr_employee_id      INTEGER NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
      author_user_id      INTEGER NOT NULL REFERENCES vcard_admin_users(id) ON DELETE RESTRICT,
      note_type           TEXT NOT NULL DEFAULT 'accomplishment',
      body                TEXT NOT NULL,
      category            TEXT,
      occurred_on         DATE,
      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at          TIMESTAMPTZ,
      deleted_by_user_id  INTEGER REFERENCES vcard_admin_users(id) ON DELETE SET NULL
    )
  `)

  console.log('Creating indexes...')
  await pool.query(`
    CREATE INDEX IF NOT EXISTS hr_employee_notes_employee_created_idx
      ON hr_employee_notes (hr_employee_id, created_at DESC)
  `)
  await pool.query(`
    CREATE INDEX IF NOT EXISTS hr_employee_notes_author_employee_created_idx
      ON hr_employee_notes (author_user_id, hr_employee_id, created_at DESC)
  `)
  // Partial index for the future AI quarterly-nomination pass: only live
  // accomplishment notes.
  await pool.query(`
    CREATE INDEX IF NOT EXISTS hr_employee_notes_ai_accomplishments_idx
      ON hr_employee_notes (hr_employee_id, occurred_on, created_at DESC)
      WHERE deleted_at IS NULL AND note_type = 'accomplishment'
  `)

  const check = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM information_schema.tables
        WHERE table_name='hr_employee_note_authors') AS authors_tbl,
      (SELECT COUNT(*) FROM information_schema.tables
        WHERE table_name='hr_employee_notes') AS notes_tbl,
      (SELECT COUNT(*) FROM pg_indexes
        WHERE indexname IN (
          'hr_employee_notes_employee_created_idx',
          'hr_employee_notes_author_employee_created_idx',
          'hr_employee_notes_ai_accomplishments_idx'
        )) AS idx_count
  `)
  const row = check.rows[0]
  if (Number(row.authors_tbl) === 0) throw new Error('hr_employee_note_authors not created.')
  if (Number(row.notes_tbl) === 0) throw new Error('hr_employee_notes not created.')
  if (Number(row.idx_count) < 3) throw new Error(`Expected 3 indexes, found ${row.idx_count}.`)

  console.log('✓ hr_employee_note_authors + hr_employee_notes + 3 indexes present.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
