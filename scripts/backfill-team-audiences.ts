/**
 * scripts/backfill-team-audiences.ts
 *
 * DB & API Specialist task — Backfill team Mailchimp audience IDs onto the
 * correct team-lead rows in vcard_employees, and deactivate one departed
 * employee. Wrapped in a single transaction with a pre-write JSON backup
 * and a post-write verification step.
 *
 * Usage (DRY RUN — prints intent, makes no changes):
 *   npm run backfill:audiences
 *
 * Usage (EXECUTE — writes to production):
 *   npm run backfill:audiences -- --confirm
 *
 * Per docs/claude_skills/claude-skills.md:
 *   - Requires --confirm flag for any writes
 *   - Backs up affected rows BEFORE any UPDATE
 *   - Wraps every change + verification in a single transaction
 *   - ROLLBACKs on any mismatch
 */

/* eslint-disable no-console */

import { Client } from 'pg'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

// ── Production guard is intentionally NOT applied here. ──────────
// This script is *designed* to write to the production database
// (gated behind --confirm + backup + transaction).

// ── Tiny .env loader (mirrors scripts/verify-marketing.ts) ───────
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
const loadedFrom =
  (loadEnvFile(resolve(cwd, '.env.local')) && '.env.local') ||
  (loadEnvFile(resolve(cwd, '.env')) && '.env') ||
  null

// ── Plan ─────────────────────────────────────────────────────────
type AudienceChange = {
  id: number
  name: string
  email: string
  field: 'mailchimp_audience_id'
  newValue: string | null
  description: string
}
type ActiveChange = {
  id: number
  name: string
  email: string
  field: 'active'
  newValue: boolean
  description: string
}
type Change = AudienceChange | ActiveChange

const PLAN: Change[] = [
  {
    id: 50,
    name: 'Izzy Lopez',
    email: 'izzy4title@gmail.com',
    field: 'mailchimp_audience_id',
    newValue: null,
    description: "cleared mailchimp_audience_id (was Lopez Team audience — moved to Hugo)",
  },
  {
    id: 25,
    name: 'Hugo Lopez',
    email: 'teamlopez@pct.com',
    field: 'mailchimp_audience_id',
    newValue: 'cea2911e34',
    description: "assigned Lopez Team audience (cea2911e34)",
  },
  {
    id: 23,
    name: 'Jorge Mesa',
    email: 'jmesa@pct.com',
    field: 'mailchimp_audience_id',
    newValue: '545f3afd67',
    description: "assigned TMG Team audience (545f3afd67)",
  },
  {
    id: 59,
    name: 'Janelly Marquez',
    email: 'jmarquez@pct.com',
    field: 'mailchimp_audience_id',
    newValue: '0cae582d6c',
    description: "assigned Title Gals audience (0cae582d6c)",
  },
  {
    id: 24,
    name: 'Jennifer Simms',
    email: 'jsimms@pct.com',
    field: 'active',
    newValue: false,
    description: "marked inactive (no longer with company)",
  },
]

const AFFECTED_IDS = PLAN.map((c) => c.id)

// ── CLI flags ────────────────────────────────────────────────────
const argv = process.argv.slice(2)
const CONFIRM = argv.includes('--confirm')

// ── Helpers ──────────────────────────────────────────────────────
function header(t: string) {
  console.log(`\n\x1b[1m\x1b[36m── ${t} ${'─'.repeat(Math.max(0, 60 - t.length))}\x1b[0m`)
}

async function main() {
  header('Backfill team audience IDs (vcard_employees)')
  console.log(`env loaded from: ${loadedFrom ?? '(none — relying on process env)'}`)
  console.log(`mode: ${CONFIRM ? '\x1b[1m\x1b[33mEXECUTE (will write)\x1b[0m' : '\x1b[1mDRY RUN\x1b[0m'}`)
  console.log(`affected row ids: ${AFFECTED_IDS.join(', ')}`)

  if (!process.env.DATABASE_URL) {
    console.error('\n❌ DATABASE_URL is not set. Add it to .env.local and retry.')
    process.exit(1)
  }

  console.log('\nPlanned changes:')
  for (const c of PLAN) {
    console.log(`  • id=${c.id} ${c.name} <${c.email}> → ${c.description}`)
  }

  if (!CONFIRM) {
    console.log(
      '\n⚠️  Dry run only — no changes were made.\n' +
        '   Re-run with: npm run backfill:audiences -- --confirm',
    )
    process.exit(0)
  }

  // ── Connect (single client for transaction safety) ─────────────
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()

  try {
    // ── 1. BACKUP affected rows BEFORE any writes ───────────────
    header('Step 1 / 4 — Backup affected rows')
    const backupRes = await client.query(
      `SELECT * FROM vcard_employees WHERE id = ANY($1::int[]) ORDER BY id ASC`,
      [AFFECTED_IDS],
    )

    if (backupRes.rowCount !== AFFECTED_IDS.length) {
      console.error(
        `❌ Expected ${AFFECTED_IDS.length} rows, found ${backupRes.rowCount}. ` +
          `Aborting before any writes.`,
      )
      const foundIds = backupRes.rows.map((r: { id: number }) => r.id)
      const missing = AFFECTED_IDS.filter((id) => !foundIds.includes(id))
      if (missing.length) console.error(`   Missing ids: ${missing.join(', ')}`)
      process.exit(1)
    }

    const isoStamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = resolve(cwd, 'backups', `audience-backfill-${isoStamp}.json`)
    mkdirSync(dirname(backupPath), { recursive: true })
    writeFileSync(
      backupPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          table: 'vcard_employees',
          affected_ids: AFFECTED_IDS,
          plan: PLAN,
          rows: backupRes.rows,
        },
        null,
        2,
      ),
      'utf8',
    )
    if (!existsSync(backupPath)) {
      console.error(`❌ Backup file was not written: ${backupPath}`)
      process.exit(1)
    }
    console.log(`💾 Backed up ${backupRes.rowCount} rows to: ${backupPath}`)

    // ── 2. Transaction: apply UPDATEs + verify ──────────────────
    header('Step 2 / 4 — Apply changes inside a transaction')
    await client.query('BEGIN')

    try {
      for (const c of PLAN) {
        if (c.field === 'mailchimp_audience_id') {
          const res = await client.query(
            `UPDATE vcard_employees
               SET mailchimp_audience_id = $1, updated_at = NOW()
             WHERE id = $2`,
            [c.newValue, c.id],
          )
          if (res.rowCount !== 1) {
            throw new Error(
              `Row id=${c.id} (${c.name}) — UPDATE affected ${res.rowCount} rows (expected 1)`,
            )
          }
          console.log(`✅ Row ${c.id} (${c.name}): ${c.description}`)
        } else if (c.field === 'active') {
          const res = await client.query(
            `UPDATE vcard_employees
               SET active = $1, updated_at = NOW()
             WHERE id = $2`,
            [c.newValue, c.id],
          )
          if (res.rowCount !== 1) {
            throw new Error(
              `Row id=${c.id} (${c.name}) — UPDATE affected ${res.rowCount} rows (expected 1)`,
            )
          }
          console.log(`✅ Row ${c.id} (${c.name}): ${c.description}`)
        }
      }

      // ── 3. Verification (still inside transaction) ────────────
      header('Step 3 / 4 — Verify post-write state')
      const verifyRes = await client.query(
        `SELECT id, first_name, last_name, email, mailchimp_audience_id, active
           FROM vcard_employees
          WHERE id = ANY($1::int[])
          ORDER BY id ASC`,
        [AFFECTED_IDS],
      )
      const byId = new Map<number, { mailchimp_audience_id: string | null; active: boolean }>()
      for (const r of verifyRes.rows as Array<{
        id: number
        mailchimp_audience_id: string | null
        active: boolean
      }>) {
        byId.set(r.id, { mailchimp_audience_id: r.mailchimp_audience_id, active: r.active })
      }

      const mismatches: string[] = []
      for (const c of PLAN) {
        const actual = byId.get(c.id)
        if (!actual) {
          mismatches.push(`id=${c.id} (${c.name}) not found in verification query`)
          continue
        }
        if (c.field === 'mailchimp_audience_id') {
          if (actual.mailchimp_audience_id !== c.newValue) {
            mismatches.push(
              `id=${c.id} (${c.name}) mailchimp_audience_id = ${JSON.stringify(
                actual.mailchimp_audience_id,
              )}, expected ${JSON.stringify(c.newValue)}`,
            )
          } else {
            console.log(
              `  ✓ id=${c.id} ${c.name}: mailchimp_audience_id = ${JSON.stringify(
                actual.mailchimp_audience_id,
              )}`,
            )
          }
        } else if (c.field === 'active') {
          if (actual.active !== c.newValue) {
            mismatches.push(
              `id=${c.id} (${c.name}) active = ${actual.active}, expected ${c.newValue}`,
            )
          } else {
            console.log(`  ✓ id=${c.id} ${c.name}: active = ${actual.active}`)
          }
        }
      }

      if (mismatches.length > 0) {
        throw new Error(
          `Verification failed:\n  - ${mismatches.join('\n  - ')}`,
        )
      }

      await client.query('COMMIT')
      header('Step 4 / 4 — Commit')
      console.log('✅ Transaction committed.')

      console.log('\n\x1b[1m📊 BACKFILL COMPLETE\x1b[0m')
      console.log('✅ 4 audience assignments updated')
      console.log('✅ 1 employee marked inactive')
      console.log(`📌 Backup saved at: ${backupPath}`)
      console.log('📌 To rollback: restore affected rows from the backup JSON')
      console.log('       (each entry under "rows" contains the original column values).')
    } catch (txErr) {
      await client.query('ROLLBACK')
      console.error('\n❌ Error inside transaction — ROLLED BACK. No changes were committed.')
      console.error(txErr instanceof Error ? txErr.message : String(txErr))
      console.error(`Backup is still available at: ${backupPath}`)
      process.exit(1)
    }
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('\n❌ Fatal error:', err instanceof Error ? err.message : String(err))
  process.exit(1)
})
