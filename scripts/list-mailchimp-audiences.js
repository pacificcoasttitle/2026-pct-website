// ============================================================
// scripts/list-mailchimp-audiences.js
//
// READ-ONLY. Dumps every rep in vcard_employees alongside their
// Mailchimp audience (list) ID, then lists active+live reps that are
// MISSING an audience. No writes, no mutations.
//
// Usage:
//   node scripts/list-mailchimp-audiences.js
//
// Reads DATABASE_URL from .env.local (preferred), then .env, then the
// shell environment. Does NOT hardcode any credentials.
// ============================================================

/* eslint-disable no-console */
const { Client } = require('pg')
const { existsSync, readFileSync } = require('node:fs')
const { resolve } = require('node:path')

// ── Tiny .env loader (no dotenv dependency) ──────────────────────
function loadEnvFile(path) {
  if (!existsSync(path)) return false
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i)
    if (!m) continue
    const [, key, rawVal] = m
    if (process.env[key]) continue
    let val = rawVal
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    process.env[key] = val
  }
  return true
}
const cwd = process.cwd()
loadEnvFile(resolve(cwd, '.env.local')) || loadEnvFile(resolve(cwd, '.env'))

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('✗ DATABASE_URL is not set. Add it to .env.local or export it before running.')
  process.exit(1)
}

// Mailchimp list IDs are 10-char lowercase hex (e.g. "a1b2c3d4e5")
const ID_SHAPE = /^[0-9a-f]{10}$/

async function main() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })
  await client.connect()

  // ── Every rep that HAS an audience ───────────────────────────
  const mapped = await client.query(`
    SELECT first_name || ' ' || last_name AS name,
           slug, sms_code, mailchimp_audience_id,
           active, website_active
    FROM vcard_employees
    WHERE mailchimp_audience_id IS NOT NULL AND mailchimp_audience_id <> ''
    ORDER BY last_name, first_name
  `)

  console.log('\n=== Reps WITH a Mailchimp audience =================================')
  console.log('shape  name                          audience_id   slug                 active live')
  console.log('------ ----------------------------- ------------- -------------------- ------ ----')
  let badShape = 0
  for (const r of mapped.rows) {
    const ok = ID_SHAPE.test(r.mailchimp_audience_id)
    if (!ok) badShape++
    console.log(
      `${ok ? '  ok  ' : ' WARN '} ` +
      `${String(r.name).padEnd(29).slice(0, 29)} ` +
      `${String(r.mailchimp_audience_id).padEnd(13)} ` +
      `${String(r.slug).padEnd(20).slice(0, 20)} ` +
      `${r.active ? ' yes ' : ' no  '} ${r.website_active ? 'yes' : 'no'}`
    )
  }

  // ── Active + live reps MISSING an audience (gaps) ────────────
  const gaps = await client.query(`
    SELECT first_name || ' ' || last_name AS name, slug, sms_code
    FROM vcard_employees
    WHERE active = true AND website_active = true
      AND (mailchimp_audience_id IS NULL OR mailchimp_audience_id = '')
    ORDER BY last_name, first_name
  `)

  console.log('\n=== Active + website-live reps MISSING an audience =================')
  if (gaps.rows.length === 0) {
    console.log('  (none — every active/live rep has an audience)')
  } else {
    for (const r of gaps.rows) {
      console.log(`  • ${String(r.name).padEnd(29)} ${r.slug}  (sms_code: ${r.sms_code || '—'})`)
    }
  }

  // ── Totals ───────────────────────────────────────────────────
  const totals = await client.query(`
    SELECT
      COUNT(*) FILTER (WHERE mailchimp_audience_id IS NOT NULL AND mailchimp_audience_id <> '') AS with_audience,
      COUNT(*) AS total
    FROM vcard_employees
  `)
  const t = totals.rows[0]
  console.log('\n=== Summary ========================================================')
  console.log(`  reps with audience : ${t.with_audience} / ${t.total}`)
  console.log(`  gaps (active+live) : ${gaps.rows.length}`)
  if (badShape > 0) console.log(`  ⚠️  ${badShape} audience ID(s) do not look like Mailchimp list IDs`)
  console.log('')

  await client.end()
}

main().catch((err) => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
