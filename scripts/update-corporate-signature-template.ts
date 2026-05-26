/**
 * scripts/update-corporate-signature-template.ts
 *
 * One-shot migration: replace the html_template column on the
 * "Corporate Standard" row in signature_templates with the freshly
 * designed, Outlook-safe HTML defined in lib/signature-templates/
 * corporate-standard.ts.
 *
 * Usage (DRY RUN — prints diff summary, makes no changes):
 *   npx tsx scripts/update-corporate-signature-template.ts
 *
 * Usage (EXECUTE — writes to the database):
 *   npx tsx scripts/update-corporate-signature-template.ts --confirm
 *
 * Safety:
 *   - Requires --confirm for any writes
 *   - Backs up the existing html_template to
 *       backups/signature-template-corporate-{timestamp}.html
 *     BEFORE issuing the UPDATE
 *   - Wraps the UPDATE in a single transaction; ROLLBACKs on row count != 1
 *   - Touches only the row WHERE name = 'Corporate Standard'
 *   - Leaves description, is_default, active unchanged
 */

/* eslint-disable no-console */

import { Client } from 'pg'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { CORPORATE_STANDARD_HTML } from '../lib/signature-templates/corporate-standard'

// ── Tiny .env loader (mirrors scripts/backfill-team-audiences.ts) ──
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

// ── CLI flags ───────────────────────────────────────────────────────
const argv    = process.argv.slice(2)
const CONFIRM = argv.includes('--confirm')

const TEMPLATE_NAME = 'Corporate Standard'

function header(t: string) {
  console.log(`\n\x1b[1m\x1b[36m── ${t} ${'─'.repeat(Math.max(0, 60 - t.length))}\x1b[0m`)
}

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

async function main() {
  header('Update Corporate Standard signature template')
  console.log(`env loaded from: ${loadedFrom ?? '(none — relying on process env)'}`)
  console.log(`mode: ${CONFIRM ? '\x1b[1m\x1b[33mEXECUTE (will write)\x1b[0m' : '\x1b[1mDRY RUN\x1b[0m'}`)
  console.log(`target row: signature_templates WHERE name = '${TEMPLATE_NAME}'`)
  console.log(`new html_template length: ${CORPORATE_STANDARD_HTML.length} chars`)

  if (!process.env.DATABASE_URL) {
    console.error('\n❌ DATABASE_URL is not set. Add it to .env.local and retry.')
    process.exit(1)
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()

  try {
    // ── 1. Read existing row ────────────────────────────────────────
    header('Step 1 / 3 — Read existing row')
    const existing = await client.query<{
      id:            number
      name:          string
      description:   string | null
      html_template: string
      active:        boolean
      is_default:    boolean
    }>(
      `SELECT id, name, description, html_template, active, is_default
         FROM signature_templates
        WHERE name = $1
        LIMIT 1`,
      [TEMPLATE_NAME],
    )

    if (existing.rowCount !== 1) {
      console.error(
        `❌ Expected exactly 1 row named '${TEMPLATE_NAME}', found ${existing.rowCount}. ` +
          `Aborting before any writes.`,
      )
      process.exit(1)
    }

    const row = existing.rows[0]
    console.log(`  id=${row.id}`)
    console.log(`  name=${row.name}`)
    console.log(`  description=${row.description ?? '(null)'}`)
    console.log(`  active=${row.active} is_default=${row.is_default}`)
    console.log(`  existing html length: ${row.html_template.length} chars`)

    if (row.html_template === CORPORATE_STANDARD_HTML) {
      console.log('\n✅ Database already matches the new template. Nothing to do.')
      process.exit(0)
    }

    // ── 2. Backup existing html ─────────────────────────────────────
    header('Step 2 / 3 — Backup existing html_template')
    const backupPath = resolve(
      cwd,
      'backups',
      `signature-template-corporate-${timestamp()}.html`,
    )
    if (CONFIRM) {
      mkdirSync(dirname(backupPath), { recursive: true })
      writeFileSync(backupPath, row.html_template, 'utf8')
      console.log(`  wrote backup → ${backupPath}`)
    } else {
      console.log(`  (dry run) would write backup → ${backupPath}`)
    }

    // ── 3. UPDATE in a transaction ──────────────────────────────────
    header('Step 3 / 3 — Update row')

    if (!CONFIRM) {
      console.log(
        '\n⚠️  Dry run only — no changes were made.\n' +
          '   Re-run with: npx tsx scripts/update-corporate-signature-template.ts --confirm',
      )
      process.exit(0)
    }

    await client.query('BEGIN')
    try {
      const upd = await client.query(
        `UPDATE signature_templates
            SET html_template = $1,
                updated_at    = NOW()
          WHERE name = $2`,
        [CORPORATE_STANDARD_HTML, TEMPLATE_NAME],
      )
      if (upd.rowCount !== 1) {
        throw new Error(
          `Expected to update 1 row, updated ${upd.rowCount}. Rolling back.`,
        )
      }
      await client.query('COMMIT')
      console.log(`✅ Updated 1 row (id=${row.id}).`)
      console.log(`   Backup at: ${backupPath}`)
    } catch (err) {
      await client.query('ROLLBACK')
      console.error('❌ Rolled back due to error:', err)
      process.exit(1)
    }
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
