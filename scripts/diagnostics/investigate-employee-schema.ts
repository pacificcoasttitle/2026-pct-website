/* Read-only inspection of vcard_employees schema + employee counts. */
/* eslint-disable no-console */
import { Client } from 'pg'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnvFile(p: string) {
  if (!existsSync(p)) return false
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (!m) continue
    const [, k, rv] = m
    if (process.env[k]) continue
    let v = rv
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    process.env[k] = v
  }
  return true
}
loadEnvFile(resolve(process.cwd(), '.env.local')) || loadEnvFile(resolve(process.cwd(), '.env'))

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL!, ssl: { rejectUnauthorized: false } })
  await c.connect()
  try {
    const cols = await c.query<{ column_name: string; data_type: string; is_nullable: string }>(
      `SELECT column_name, data_type, is_nullable
         FROM information_schema.columns
        WHERE table_name = 'vcard_employees'
        ORDER BY ordinal_position`,
    )
    console.log('Columns:')
    for (const r of cols.rows) {
      console.log(`  ${r.column_name.padEnd(28)} ${r.data_type.padEnd(28)} ${r.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'}`)
    }

    const counts = await c.query<{ total: string; active: string; on_website: string }>(
      `SELECT COUNT(*)::text AS total,
              COUNT(*) FILTER (WHERE active = true)::text AS active,
              COUNT(*) FILTER (WHERE active = true AND website_active = true)::text AS on_website
         FROM vcard_employees`,
    )
    console.log('\nCounts:', counts.rows[0])

    // Sample one active row to see what real data looks like (no PII printed beyond name + masked email).
    const sample = await c.query<{ first_name: string; last_name: string; email: string | null; title: string | null; office_id: number | null; photo_url: string | null }>(
      `SELECT first_name, last_name, email, title, office_id, photo_url
         FROM vcard_employees
        WHERE active = true AND website_active = true
        ORDER BY id ASC
        LIMIT 1`,
    )
    if (sample.rows[0]) {
      const r = sample.rows[0]
      const maskedEmail = r.email ? `${r.email.slice(0, 2)}…@${r.email.split('@')[1] ?? '?'}` : '(null)'
      console.log('\nSample active+website_active row (PII masked):')
      console.log(`  name      : ${r.first_name} ${r.last_name}`)
      console.log(`  email     : ${maskedEmail}`)
      console.log(`  title     : ${r.title ?? '(null)'}`)
      console.log(`  office_id : ${r.office_id ?? '(null)'}`)
      console.log(`  photo_url : ${r.photo_url ? '(set)' : '(null)'}`)
    }
  } finally {
    await c.end()
  }
}
main().catch((e) => { console.error('Fatal:', e); process.exit(1) })
