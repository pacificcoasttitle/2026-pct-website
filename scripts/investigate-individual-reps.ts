/**
 * scripts/investigate-individual-reps.ts
 *
 * Investigator (read-only). Cross-references the 18 individual sales reps
 * from the legacy JSON with vcard_employees in Postgres, and pings each
 * Mailchimp audience to check it's still live.
 *
 * NO WRITES. Safe to run anytime.
 *
 *   npx tsx scripts/investigate-individual-reps.ts
 */

/* eslint-disable no-console */

import { Client } from 'pg'
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

type LegacyRep = { name: string; email: string; audienceId: string }

const REPS: LegacyRep[] = [
  { name: 'Angeline Ahn', email: 'awu@pct.com', audienceId: '51b5235061' },
  { name: 'Christy Coffey', email: 'CCOFFEY@PCT.COM', audienceId: 'c3230bc1da' },
  { name: 'Corey Velasquez', email: 'Cvelasquez@pct.com', audienceId: 'fe609e1dd3' },
  { name: 'David Gomez', email: 'DGOMEZ@PCT.COM', audienceId: 'a8f29f3045' },
  { name: 'Felicia Pantoja', email: 'FPANTOJA@PCT.COM', audienceId: '9e0b2f4a6a' },
  { name: 'Justin Nouri', email: 'JNOURI@PCT.COM', audienceId: 'bd021cf027' },
  { name: 'Linda Ruiz', email: 'LRUIZ@PCT.COM', audienceId: '4a5b695d62' },
  { name: 'Lou Morreale', email: 'LMORREALE@PCT.COM', audienceId: 'c5332e3bbd' },
  { name: 'Michael Nouri', email: 'MNOURI@PCT.COM', audienceId: '813d4def1d' },
  { name: 'Neil Torquato', email: 'NEIL@PCT.COM', audienceId: '92bdcb1fe6' },
  { name: 'Nick Watt', email: 'Nwatt@pct.com', audienceId: '2cc3f87657' },
  { name: 'Richard Bohn', email: 'RBOHN@PCT.COM', audienceId: '91623b0b38' },
  { name: 'Rouanne Garcia', email: 'rgarcia@pct.com', audienceId: '97f29f4aa9' },
  { name: 'Saeed Ghaffari', email: 'Sghaffari@pct.com', audienceId: 'dec8a4a5e6' },
  { name: 'Sandra Millar', email: 'SMILLAR@PCT.COM', audienceId: '9ff974ce5f' },
  { name: 'Simon Wu', email: 'SWU@PCT.COM', audienceId: '8525d48693' },
  { name: 'Sonia Flores', email: 'SFLORES@PCT.COM', audienceId: 'f4ebc3d962' },
  { name: 'Veronica Sanchez', email: 'VSANCHEZ@PCT.COM', audienceId: '7eb4fc7c3e' },
]

type DbRow = {
  id: number
  first_name: string
  last_name: string
  email: string
  active: boolean
  website_active: boolean
  mailchimp_audience_id: string | null
}

type McResult =
  | { ok: true; memberCount: number; name: string }
  | { ok: false; status: number; message: string }

async function checkAudience(audienceId: string): Promise<McResult> {
  const apiKey = process.env.MAILCHIMP_API_KEY
  const server = process.env.MAILCHIMP_SERVER
  if (!apiKey || !server) {
    return { ok: false, status: 0, message: 'MAILCHIMP env not set' }
  }
  const url = `https://${server}.api.mailchimp.com/3.0/lists/${audienceId}`
  const auth = `Basic ${Buffer.from(`any:${apiKey}`).toString('base64')}`
  try {
    const res = await fetch(url, { headers: { Authorization: auth } })
    if (res.status === 200) {
      const data = (await res.json()) as {
        name?: string
        stats?: { member_count?: number }
      }
      return {
        ok: true,
        memberCount: data.stats?.member_count ?? 0,
        name: data.name ?? '(unnamed)',
      }
    }
    return { ok: false, status: res.status, message: res.statusText }
  } catch (err) {
    return { ok: false, status: 0, message: err instanceof Error ? err.message : String(err) }
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set')
    process.exit(1)
  }
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()

  type Categorized = {
    rep: LegacyRep
    db: DbRow | null
    mc: McResult
    category: 'A' | 'B' | 'C' | 'D'
  }
  const results: Categorized[] = []

  try {
    for (const rep of REPS) {
      const r = await client.query<DbRow>(
        `SELECT id, first_name, last_name, email, active, website_active, mailchimp_audience_id
           FROM vcard_employees
          WHERE LOWER(email) = LOWER($1)
          LIMIT 1`,
        [rep.email],
      )
      const db = r.rows[0] ?? null
      const mc = await checkAudience(rep.audienceId)

      let category: 'A' | 'B' | 'C' | 'D'
      if (!db) {
        category = 'D'
      } else if (!db.mailchimp_audience_id || db.mailchimp_audience_id === '') {
        category = 'A'
      } else if (db.mailchimp_audience_id === rep.audienceId) {
        category = 'B'
      } else {
        category = 'C'
      }
      results.push({ rep, db, mc, category })
    }
  } finally {
    await client.end()
  }

  const A = results.filter((x) => x.category === 'A')
  const B = results.filter((x) => x.category === 'B')
  const C = results.filter((x) => x.category === 'C')
  const D = results.filter((x) => x.category === 'D')
  const dead = results.filter((x) => !x.mc.ok)

  console.log('\n📊 SUMMARY')
  console.log(`- Reps in legacy JSON (individuals): ${REPS.length}`)
  console.log(`- Found in Postgres: ${results.filter((x) => x.db).length}`)
  console.log(`- Ready to backfill (A): ${A.length}`)
  console.log(`- Already correct (B): ${B.length}`)
  console.log(`- Conflicts (C): ${C.length}`)
  console.log(`- Missing from Postgres (D): ${D.length}`)
  console.log(`- Dead audiences: ${dead.length}`)

  const mcStatus = (mc: McResult) =>
    mc.ok ? `✅ Valid (${mc.memberCount} members)` : `❌ ${mc.status || ''} ${mc.message}`.trim()

  console.log('\n✅ READY TO BACKFILL (Category A):')
  console.log('| ID | Name | Email | Active | Audience ID | Mailchimp Status |')
  console.log('|----|------|-------|--------|-------------|-------------------|')
  for (const x of A) {
    console.log(
      `| ${x.db!.id} | ${x.rep.name} | ${x.db!.email} | ${x.db!.active} | ${x.rep.audienceId} | ${mcStatus(x.mc)} |`,
    )
  }
  if (A.length === 0) console.log('| (none) |')

  console.log('\n👍 ALREADY CORRECT (Category B):')
  console.log('| ID | Name | Email | Audience ID | Mailchimp Status |')
  console.log('|----|------|-------|-------------|-------------------|')
  for (const x of B) {
    console.log(
      `| ${x.db!.id} | ${x.rep.name} | ${x.db!.email} | ${x.rep.audienceId} | ${mcStatus(x.mc)} |`,
    )
  }
  if (B.length === 0) console.log('| (none) |')

  console.log('\n⚠️ CONFLICTS (Category C):')
  console.log('| ID | Name | Email | DB Has | Legacy Says | Mailchimp Status (legacy) |')
  console.log('|----|------|-------|--------|-------------|---------------------------|')
  for (const x of C) {
    console.log(
      `| ${x.db!.id} | ${x.rep.name} | ${x.db!.email} | ${x.db!.mailchimp_audience_id} | ${x.rep.audienceId} | ${mcStatus(x.mc)} |`,
    )
  }
  if (C.length === 0) console.log('| (none) |')

  console.log('\n❓ MISSING IN POSTGRES (Category D):')
  console.log('| Name | Email | Audience ID | Mailchimp Status |')
  console.log('|------|-------|-------------|-------------------|')
  for (const x of D) {
    console.log(`| ${x.rep.name} | ${x.rep.email} | ${x.rep.audienceId} | ${mcStatus(x.mc)} |`)
  }
  if (D.length === 0) console.log('| (none) |')

  console.log('\n💀 DEAD AUDIENCES:')
  console.log('| Name | Audience ID | Mailchimp Status |')
  console.log('|------|-------------|-------------------|')
  for (const x of dead) {
    console.log(`| ${x.rep.name} | ${x.rep.audienceId} | ${mcStatus(x.mc)} |`)
  }
  if (dead.length === 0) console.log('| (none) |')
}

main().catch((err) => {
  console.error('Fatal:', err instanceof Error ? err.message : String(err))
  process.exit(1)
})
