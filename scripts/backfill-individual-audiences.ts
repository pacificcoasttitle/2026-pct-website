/**
 * scripts/backfill-individual-audiences.ts
 *
 * DB & API Specialist task — Backfill 17 individual rep Mailchimp audience
 * IDs onto vcard_employees from verified legacy mappings.
 *
 * All targets pre-verified by Investigator. ID 2 (Linda Ruiz) is intentionally
 * excluded — her row is already correct.
 *
 * Usage (DRY RUN — prints intent, makes no changes):
 *   npm run backfill:individuals
 *
 * Usage (EXECUTE — writes to production):
 *   npm run backfill:individuals -- --confirm
 *
 * Per docs/claude_skills/claude-skills.md:
 *   - Loads DATABASE_URL from .env.local (no chat-prompt for creds)
 *   - Requires --confirm flag for any writes
 *   - Backs up all 17 affected rows BEFORE any UPDATE
 *   - PRE-WRITE GUARD: aborts if any row already has a non-empty audience id
 *   - Wraps every change + verification in a single transaction
 *   - ROLLBACKs on any mismatch
 */

/* eslint-disable no-console */

import { Client } from 'pg'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

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
const envLocalPath = resolve(cwd, '.env.local')
const loadedEnvLocal = loadEnvFile(envLocalPath)

// ── Plan ─────────────────────────────────────────────────────────
interface AudienceAssignment {
  id: number
  name: string
  audienceId: string
}

const PLAN: AudienceAssignment[] = [
  { id: 3,  name: 'David Gomez',      audienceId: 'a8f29f3045' },
  { id: 4,  name: 'Simon Wu',         audienceId: '8525d48693' },
  { id: 5,  name: 'Angeline Ahn',     audienceId: '51b5235061' },
  { id: 6,  name: 'Christy Coffey',   audienceId: 'c3230bc1da' },
  { id: 7,  name: 'Corey Velasquez',  audienceId: 'fe609e1dd3' },
  { id: 9,  name: 'Felicia Pantoja',  audienceId: '9e0b2f4a6a' },
  { id: 10, name: 'Justin Nouri',     audienceId: 'bd021cf027' },
  { id: 12, name: 'Lou Morreale',     audienceId: 'c5332e3bbd' },
  { id: 13, name: 'Michael Nouri',    audienceId: '813d4def1d' },
  { id: 14, name: 'Neil Torquato',    audienceId: '92bdcb1fe6' },
  { id: 15, name: 'Nick Watt',        audienceId: '2cc3f87657' },
  { id: 16, name: 'Richard Bohn',     audienceId: '91623b0b38' },
  { id: 17, name: 'Rouanne Garcia',   audienceId: '97f29f4aa9' },
  { id: 18, name: 'Saeed Ghaffari',   audienceId: 'dec8a4a5e6' },
  { id: 19, name: 'Sandra Millar',    audienceId: '9ff974ce5f' },
  { id: 21, name: 'Sonia Flores',     audienceId: 'f4ebc3d962' },
  { id: 22, name: 'Veronica Sanchez', audienceId: '7eb4fc7c3e' },
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
  header('Backfill individual rep audience IDs (vcard_employees)')
  console.log(`affected rows: ${PLAN.length} (ids: ${AFFECTED_IDS.join(', ')})`)
  console.log(`mode: ${CONFIRM ? '\x1b[1m\x1b[33mEXECUTE (will write)\x1b[0m' : '\x1b[1mDRY RUN\x1b[0m'}`)

  // ── Env handling — no chat prompt; require .env.local ─────────
  if (!loadedEnvLocal) {
    console.error(`\n❌ .env.local not found at: ${envLocalPath}`)
    console.error(`   Create it with: DATABASE_URL=postgresql://...`)
    process.exit(1)
  }
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
    console.error(`\n❌ DATABASE_URL is empty in .env.local. Add a value and retry.`)
    process.exit(1)
  }

  console.log('\nPlanned changes:')
  for (const c of PLAN) {
    console.log(`  • id=${c.id} ${c.name} → set mailchimp_audience_id = ${c.audienceId}`)
  }
  console.log('\nExcluded: id=2 Linda Ruiz (already correct)')

  if (!CONFIRM) {
    console.log(
      '\n⚠️  Dry run only — no changes were made.\n' +
        '   Re-run with: npm run backfill:individuals -- --confirm',
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
    header('Step 1 / 5 — Backup affected rows')
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
    const backupPath = resolve(cwd, 'backups', `individual-audience-backfill-${isoStamp}.json`)
    mkdirSync(dirname(backupPath), { recursive: true })
    writeFileSync(
      backupPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          table: 'vcard_employees',
          affected_ids: AFFECTED_IDS,
          plan: PLAN,
          excluded: [{ id: 2, name: 'Linda Ruiz', reason: 'already correct' }],
          rows: backupRes.rows,
        },
        null,
        2,
      ),
      'utf8',
    )
    if (!existsSync(backupPath) || statSync(backupPath).size === 0) {
      console.error(`❌ Backup file missing or empty: ${backupPath}`)
      process.exit(1)
    }
    console.log(`💾 Backed up ${backupRes.rowCount} rows to: ${backupPath}`)

    // ── 2. PRE-WRITE GUARD — confirm all 17 are NULL/empty ──────
    header('Step 2 / 5 — Pre-write guard (no existing audience IDs)')
    const occupied: Array<{ id: number; name: string; existing: string }> = []
    for (const r of backupRes.rows as Array<{
      id: number
      first_name: string | null
      last_name: string | null
      mailchimp_audience_id: string | null
    }>) {
      const existing = (r.mailchimp_audience_id ?? '').trim()
      if (existing !== '') {
        occupied.push({
          id: r.id,
          name: `${r.first_name ?? ''} ${r.last_name ?? ''}`.trim(),
          existing,
        })
      }
    }
    if (occupied.length > 0) {
      console.error(
        `\n❌ Pre-write guard failed — ${occupied.length} row(s) already have a mailchimp_audience_id:`,
      )
      for (const o of occupied) {
        console.error(`   • id=${o.id} ${o.name}: existing mailchimp_audience_id = ${JSON.stringify(o.existing)}`)
      }
      console.error(
        '\nState has changed since the investigation. ABORTING to avoid overwrites.\n' +
          `Backup of current state was still written to: ${backupPath}`,
      )
      process.exit(1)
    }
    console.log(`✅ All ${AFFECTED_IDS.length} rows have NULL/empty mailchimp_audience_id — safe to proceed.`)

    // ── 3. Transaction: apply UPDATEs + verify ──────────────────
    header('Step 3 / 5 — Apply changes inside a transaction')
    await client.query('BEGIN')

    try {
      for (const c of PLAN) {
        const res = await client.query(
          `UPDATE vcard_employees
             SET mailchimp_audience_id = $1, updated_at = NOW()
           WHERE id = $2`,
          [c.audienceId, c.id],
        )
        if (res.rowCount !== 1) {
          throw new Error(
            `Row id=${c.id} (${c.name}) — UPDATE affected ${res.rowCount} rows (expected 1)`,
          )
        }
        console.log(`✅ Row ${c.id} (${c.name}): set mailchimp_audience_id = ${c.audienceId}`)
      }

      // ── 4. Verification (still inside transaction) ────────────
      header('Step 4 / 5 — Verify post-write state')
      const verifyRes = await client.query(
        `SELECT id, first_name, last_name, mailchimp_audience_id
           FROM vcard_employees
          WHERE id = ANY($1::int[])
          ORDER BY id ASC`,
        [AFFECTED_IDS],
      )
      const byId = new Map<number, string | null>()
      for (const r of verifyRes.rows as Array<{
        id: number
        mailchimp_audience_id: string | null
      }>) {
        byId.set(r.id, r.mailchimp_audience_id)
      }

      const mismatches: string[] = []
      for (const c of PLAN) {
        const actual = byId.get(c.id)
        if (actual === undefined) {
          mismatches.push(`id=${c.id} (${c.name}) not found in verification query`)
          continue
        }
        if (actual !== c.audienceId) {
          mismatches.push(
            `id=${c.id} (${c.name}) mailchimp_audience_id = ${JSON.stringify(actual)}, expected ${JSON.stringify(c.audienceId)}`,
          )
        } else {
          console.log(`  ✓ id=${c.id} ${c.name}: mailchimp_audience_id = "${actual}"`)
        }
      }

      if (mismatches.length > 0) {
        throw new Error(
          `Verification failed:\n  - ${mismatches.join('\n  - ')}`,
        )
      }

      await client.query('COMMIT')
      header('Step 5 / 5 — Commit')
      console.log('✅ Transaction committed.')

      console.log('\n\x1b[1m📊 BACKFILL COMPLETE\x1b[0m')
      console.log(`✅ ${PLAN.length} individual rep audiences updated`)
      console.log(`📌 Backup saved at: ${backupPath}`)
      console.log('📌 To rollback: restore affected rows from the backup JSON')
      console.log('       (each entry under "rows" contains the original column values).')
      console.log('')
      console.log('📈 Total subscribers now connected: 9,153 across 17 audiences')
      console.log('   (Add Linda Ruiz\'s 204 = 9,357 total connected across all individuals)')
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
