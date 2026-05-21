/**
 * scripts/verify-marketing.ts
 *
 * Non-mutating verification of the email-marketing stack:
 *   1. Required env vars
 *   2. Mailchimp API connectivity (GET /3.0/ ping)
 *   3. SendGrid API connectivity (GET /v3/scopes)
 *   4. Postgres marketing tables + per-rep audience health
 *
 * DEVELOPMENT ONLY. Refuses to run in production.
 *
 * Usage:
 *   npm run verify:marketing
 *
 * Loads env from .env.local (preferred) or .env if present.
 */

/* eslint-disable no-console */

import { Client } from 'pg'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// ── Production guard ─────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  console.error('✗ refusing to run: NODE_ENV=production')
  process.exit(1)
}

// ── Tiny .env loader (no dotenv dep) ─────────────────────────────
function loadEnvFile(path: string) {
  if (!existsSync(path)) return false
  const raw = readFileSync(path, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i)
    if (!m) continue
    const [, key, rawVal] = m
    if (process.env[key]) continue // don't overwrite existing
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

// ── Pretty status helpers ────────────────────────────────────────
const OK = '✅'
const WARN = '⚠️ '
const BAD = '❌'

type Section = { title: string; lines: string[]; status: 'ok' | 'warn' | 'bad' }
const sections: Section[] = []
function addSection(s: Section) {
  sections.push(s)
}

function header(t: string) {
  console.log(`\n\x1b[1m\x1b[36m── ${t} ${'─'.repeat(Math.max(0, 60 - t.length))}\x1b[0m`)
}

// ── 1. Env vars ──────────────────────────────────────────────────
const REQUIRED = [
  'DATABASE_URL',
  'MAILCHIMP_API_KEY',
  'MAILCHIMP_SERVER',
  'SENDGRID_API_KEY',
  'NEXT_PUBLIC_SITE_URL',
] as const

function maskSecret(v: string | undefined): string {
  if (!v) return '(unset)'
  if (v.length <= 8) return '***'
  return `${v.slice(0, 4)}…${v.slice(-4)} (len ${v.length})`
}

function checkEnv() {
  header('1. Environment variables')
  console.log(loadedFrom ? `Loaded from ${loadedFrom}` : 'No .env.local / .env file found (using process env only)')
  const missing: string[] = []
  for (const k of REQUIRED) {
    const v = process.env[k]
    const present = !!(v && v.trim())
    const isSecret = k.endsWith('_KEY') || k === 'DATABASE_URL'
    const display = present ? (isSecret ? maskSecret(v) : v) : ''
    console.log(`  ${present ? OK : BAD} ${k.padEnd(22)} ${display}`)
    if (!present) missing.push(k)
  }
  addSection({
    title: 'Env vars',
    status: missing.length === 0 ? 'ok' : missing.length === REQUIRED.length ? 'bad' : 'warn',
    lines: missing.length ? [`Missing: ${missing.join(', ')}`] : ['All required vars set'],
  })
}

// ── 2. Mailchimp ─────────────────────────────────────────────────
async function checkMailchimp() {
  header('2. Mailchimp connectivity (non-mutating GET /3.0/)')
  const apiKey = process.env.MAILCHIMP_API_KEY
  const server = process.env.MAILCHIMP_SERVER
  if (!apiKey || !server) {
    console.log(`  ${WARN} skipped — MAILCHIMP_API_KEY / MAILCHIMP_SERVER not set`)
    addSection({ title: 'Mailchimp', status: 'warn', lines: ['Skipped — env not set'] })
    return
  }
  const url = `https://${server}.api.mailchimp.com/3.0/`
  const auth = `Basic ${Buffer.from(`any:${apiKey}`).toString('base64')}`
  try {
    const res = await fetch(url, { headers: { Authorization: auth } })
    if (res.status === 401) {
      console.log(`  ${BAD} 401 Unauthorized — API key is invalid or revoked`)
      addSection({ title: 'Mailchimp', status: 'bad', lines: ['401 — API key invalid'] })
      return
    }
    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      console.log(`  ${BAD} HTTP ${res.status} ${res.statusText}`)
      if (txt) console.log(`     ${txt.slice(0, 300)}`)
      addSection({ title: 'Mailchimp', status: 'bad', lines: [`HTTP ${res.status}`] })
      return
    }
    const data = (await res.json()) as {
      account_name?: string
      email?: string
      login_id?: string
      total_subscribers?: number
    }
    console.log(`  ${OK} 200 OK`)
    console.log(`     account_name      : ${data.account_name ?? '(none)'}`)
    console.log(`     email             : ${data.email ?? '(none)'}`)
    console.log(`     login_id          : ${data.login_id ?? '(none)'}`)
    console.log(`     total_subscribers : ${data.total_subscribers ?? 0}`)
    addSection({
      title: 'Mailchimp',
      status: 'ok',
      lines: [
        `Account: ${data.account_name ?? '?'} <${data.email ?? '?'}>`,
        `Total subscribers across all lists: ${data.total_subscribers ?? 0}`,
      ],
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const dnsy = /ENOTFOUND|EAI_AGAIN|getaddrinfo/.test(msg)
    console.log(`  ${BAD} ${dnsy ? 'DNS error — MAILCHIMP_SERVER likely wrong' : 'Network error'}`)
    console.log(`     ${msg}`)
    addSection({
      title: 'Mailchimp',
      status: 'bad',
      lines: [dnsy ? `DNS error reaching ${url} — check MAILCHIMP_SERVER` : msg],
    })
  }
}

// ── 3. SendGrid ──────────────────────────────────────────────────
async function checkSendGrid() {
  header('3. SendGrid connectivity (non-mutating GET /v3/scopes)')
  const apiKey = process.env.SENDGRID_API_KEY
  if (!apiKey) {
    console.log(`  ${WARN} skipped — SENDGRID_API_KEY not set`)
    addSection({ title: 'SendGrid', status: 'warn', lines: ['Skipped — env not set'] })
    return
  }
  if (!apiKey.startsWith('SG.')) {
    console.log(`  ${WARN} key does not start with "SG." — likely invalid format`)
  }
  try {
    const res = await fetch('https://api.sendgrid.com/v3/scopes', {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (res.status === 401) {
      console.log(`  ${BAD} 401 Unauthorized — API key is invalid or revoked`)
      addSection({ title: 'SendGrid', status: 'bad', lines: ['401 — API key invalid'] })
      return
    }
    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      console.log(`  ${BAD} HTTP ${res.status} ${res.statusText}`)
      if (txt) console.log(`     ${txt.slice(0, 300)}`)
      addSection({ title: 'SendGrid', status: 'bad', lines: [`HTTP ${res.status}`] })
      return
    }
    const data = (await res.json()) as { scopes?: string[] }
    const scopes = data.scopes ?? []
    const interesting = ['mail.send', 'sender_verification_eligible', 'mail_settings.read']
    const present = interesting.filter((s) => scopes.includes(s))
    console.log(`  ${OK} 200 OK — key is valid`)
    console.log(`     total scopes: ${scopes.length}`)
    console.log(`     mail.send present: ${scopes.includes('mail.send') ? 'yes' : 'NO (cannot send)'}`)
    console.log(`     sample scopes: ${scopes.slice(0, 6).join(', ')}${scopes.length > 6 ? ', …' : ''}`)
    addSection({
      title: 'SendGrid',
      status: scopes.includes('mail.send') ? 'ok' : 'warn',
      lines: [
        `Key valid (${scopes.length} scopes)`,
        scopes.includes('mail.send') ? 'mail.send: yes' : 'mail.send: NO — key cannot send mail',
        present.length ? `relevant: ${present.join(', ')}` : '',
      ].filter(Boolean),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.log(`  ${BAD} Network error: ${msg}`)
    addSection({ title: 'SendGrid', status: 'bad', lines: [msg] })
  }
}

// ── 4. Postgres ──────────────────────────────────────────────────
async function checkPostgres() {
  header('4. Postgres marketing health')
  const url = process.env.DATABASE_URL
  if (!url) {
    console.log(`  ${WARN} skipped — DATABASE_URL not set`)
    addSection({ title: 'Postgres', status: 'warn', lines: ['Skipped — env not set'] })
    return
  }
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
  try {
    await client.connect()
    console.log(`  ${OK} connected`)

    // Table presence
    const tableCheck = await client.query<{ table_name: string }>(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('vcard_email_templates','vcard_email_campaigns','vcard_employees')
    `)
    const tables = new Set(tableCheck.rows.map((r) => r.table_name))
    const need = ['vcard_email_templates', 'vcard_email_campaigns', 'vcard_employees']
    for (const t of need) {
      console.log(`  ${tables.has(t) ? OK : BAD} table ${t} ${tables.has(t) ? 'exists' : 'MISSING'}`)
    }

    const summary: string[] = []

    if (tables.has('vcard_email_templates')) {
      const r = await client.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM vcard_email_templates`)
      console.log(`     vcard_email_templates rows: ${r.rows[0].count}`)
      summary.push(`templates rows: ${r.rows[0].count}`)
    }
    if (tables.has('vcard_email_campaigns')) {
      const r = await client.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM vcard_email_campaigns`)
      console.log(`     vcard_email_campaigns rows: ${r.rows[0].count}`)
      summary.push(`campaigns rows: ${r.rows[0].count}`)
    }

    if (tables.has('vcard_employees')) {
      const withMc = await client.query<{ count: string }>(`
        SELECT COUNT(*)::text AS count FROM vcard_employees
        WHERE mailchimp_audience_id IS NOT NULL AND mailchimp_audience_id <> ''
      `)
      const gaps = await client.query<{ count: string }>(`
        SELECT COUNT(*)::text AS count FROM vcard_employees
        WHERE active = true AND website_active = true
          AND (mailchimp_audience_id IS NULL OR mailchimp_audience_id = '')
      `)
      console.log(`     reps with mailchimp_audience_id: ${withMc.rows[0].count}`)
      console.log(`     active+live reps WITHOUT audience (gaps): ${gaps.rows[0].count}`)
      summary.push(
        `reps with audience: ${withMc.rows[0].count}`,
        `gaps flagged: ${gaps.rows[0].count}`
      )

      const sample = await client.query<{
        first_name: string
        last_name: string
        mailchimp_audience_id: string
      }>(`
        SELECT first_name, last_name, mailchimp_audience_id
        FROM vcard_employees
        WHERE mailchimp_audience_id IS NOT NULL AND mailchimp_audience_id <> ''
        ORDER BY last_name
        LIMIT 5
      `)
      console.log(`     first 5 audience IDs:`)
      const idShape = /^[0-9a-f]{10}$/
      let badShape = 0
      for (const row of sample.rows) {
        const id = row.mailchimp_audience_id
        const ok = idShape.test(id)
        if (!ok) badShape++
        console.log(`       ${ok ? OK : WARN} ${row.first_name} ${row.last_name}: ${id} ${ok ? '' : '← not 10-char lowercase hex'}`)
      }
      if (sample.rows.length === 0) console.log(`       (none)`)
      if (badShape > 0) summary.push(`${badShape} of ${sample.rows.length} sampled IDs do not look like Mailchimp list IDs`)
    }

    addSection({
      title: 'Postgres',
      status: need.every((t) => tables.has(t)) ? 'ok' : 'bad',
      lines: summary.length ? summary : ['(no rows queried)'],
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.log(`  ${BAD} ${msg}`)
    addSection({ title: 'Postgres', status: 'bad', lines: [msg] })
  } finally {
    await client.end().catch(() => {})
  }
}

// ── Final summary ────────────────────────────────────────────────
function printSummary() {
  header('Summary')
  for (const s of sections) {
    const icon = s.status === 'ok' ? OK : s.status === 'warn' ? WARN : BAD
    console.log(`  ${icon} ${s.title}`)
    for (const l of s.lines) console.log(`       · ${l}`)
  }
  const anyBad = sections.some((s) => s.status === 'bad')
  console.log('')
  if (anyBad) {
    console.log('\x1b[31mOne or more checks failed.\x1b[0m')
    process.exit(2)
  }
  console.log('\x1b[32mAll checks passed (warnings may still need attention).\x1b[0m')
}

async function main() {
  console.log('PCT Email Marketing — Verification (read-only)')
  checkEnv()
  await checkMailchimp()
  await checkSendGrid()
  await checkPostgres()
  printSummary()
}

main().catch((err) => {
  console.error('\nFatal:', err)
  process.exit(1)
})
