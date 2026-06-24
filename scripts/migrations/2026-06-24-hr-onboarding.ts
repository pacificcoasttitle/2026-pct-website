/**
 * MIGRATION (4a): Create hr_onboarding + hr_onboarding_documents.
 *
 * BACKGROUND:
 * The Phase 4 spine: a STAGE-AND-FINALIZE onboarding flow. A new hire (or
 * a pre-linked shell) gets a tokenized link; their submitted input lands
 * in hr_onboarding.payload (jsonb) as STAGED data pending HR review. On HR
 * approval (4e) the reviewed payload is mapped into hr_employees. Uploaded
 * documents attach via hr_onboarding_documents (R2 keys, never raw files).
 *
 * Token security: only sha256(token) is stored (token_hash) alongside an
 * authoritative token_expires_at — the raw token is emailed, never stored.
 * See lib/hr-onboarding-token.ts + issue/resolveHrOnboardingByToken.
 *
 * ⚠️ ADDITIVE ONLY. Creates two new tables. References hr_employees(id)
 * (already exists). Does NOT alter hr_employees / vcard_employees /
 * staff_members or their data.
 *
 * IDEMPOTENT: Safe to re-run. CREATE TABLE / CREATE INDEX IF NOT EXISTS.
 *
 * ⚠️ WRITTEN FOR REVIEW — NOT run in this ticket. Runs in the gated
 * deploy step (same handling as 2026-06-24-hr-employees.ts).
 *
 * RUN (gated step): npx tsx scripts/migrations/2026-06-24-hr-onboarding.ts
 *
 * VERIFICATION:
 *   SELECT table_name FROM information_schema.tables
 *    WHERE table_name IN ('hr_onboarding','hr_onboarding_documents');
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

// Import AFTER env is loaded so the pg pool picks up DATABASE_URL.
import { getPool } from '../../lib/admin-db'

async function main() {
  const pool = getPool()

  console.log('Creating hr_onboarding...')
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hr_onboarding (
      id                SERIAL PRIMARY KEY,

      -- Linked canonical employee. NULL until finalize (or set up front
      -- for a pre-linked "shell" employee being onboarded).
      hr_employee_id    INTEGER REFERENCES hr_employees(id),

      -- Status machine: draft → invited → in_progress → submitted →
      -- finalized | cancelled.
      status            TEXT NOT NULL DEFAULT 'draft',

      -- Token auth: sha256(token) only — never the raw token.
      token_hash        TEXT,
      token_expires_at  TIMESTAMPTZ,

      invited_email     TEXT,

      -- STAGED employee input, pending HR review (finalize maps → hr_employees).
      payload           JSONB NOT NULL DEFAULT '{}'::jsonb,

      created_by        TEXT,
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      invited_at        TIMESTAMPTZ,
      submitted_at      TIMESTAMPTZ,
      finalized_at      TIMESTAMPTZ
    );
  `)

  // Idempotent column top-ups (re-run safety if the table pre-existed).
  const cols: Array<[string, string]> = [
    ['hr_employee_id', 'INTEGER REFERENCES hr_employees(id)'],
    ['status', "TEXT NOT NULL DEFAULT 'draft'"],
    ['token_hash', 'TEXT'],
    ['token_expires_at', 'TIMESTAMPTZ'],
    ['invited_email', 'TEXT'],
    ['payload', "JSONB NOT NULL DEFAULT '{}'::jsonb"],
    ['created_by', 'TEXT'],
    ['created_at', 'TIMESTAMPTZ NOT NULL DEFAULT NOW()'],
    ['updated_at', 'TIMESTAMPTZ NOT NULL DEFAULT NOW()'],
    ['invited_at', 'TIMESTAMPTZ'],
    ['submitted_at', 'TIMESTAMPTZ'],
    ['finalized_at', 'TIMESTAMPTZ'],
  ]
  for (const [c, def] of cols) {
    await pool.query(`ALTER TABLE hr_onboarding ADD COLUMN IF NOT EXISTS ${c} ${def}`)
  }

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_hr_onboarding_token_hash ON hr_onboarding (token_hash)`)
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_hr_onboarding_status     ON hr_onboarding (status)`)

  console.log('Creating hr_onboarding_documents...')
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hr_onboarding_documents (
      id              SERIAL PRIMARY KEY,
      onboarding_id   INTEGER NOT NULL REFERENCES hr_onboarding(id),
      doc_type        TEXT NOT NULL,
      file_key        TEXT NOT NULL,   -- R2 object key
      file_name       TEXT,
      uploaded_by     TEXT,            -- 'employee' | actor username
      uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_hr_onboarding_documents_onboarding ON hr_onboarding_documents (onboarding_id)`,
  )

  // Verify
  const t = await pool.query(`
    SELECT table_name
      FROM information_schema.tables
     WHERE table_name IN ('hr_onboarding','hr_onboarding_documents')
     ORDER BY table_name
  `)
  const names = t.rows.map((r: { table_name: string }) => r.table_name)
  if (!names.includes('hr_onboarding') || !names.includes('hr_onboarding_documents')) {
    throw new Error(`Tables not created. Found: ${names.join(', ') || '(none)'}`)
  }
  console.log(`✓ Tables verified: ${names.join(', ')}`)
  console.log('\n✓ Additive only — hr_employees / vcard_employees / staff_members untouched.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
