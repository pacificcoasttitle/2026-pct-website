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
loadEnvFile(resolve(process.cwd(), '.env.local'))

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL!, ssl: { rejectUnauthorized: false } })
  await c.connect()
  try {
    const v = await c.query(`SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE active = true)::int AS active,
      COUNT(*) FILTER (WHERE active = true AND mailchimp_audience_id IS NOT NULL AND mailchimp_audience_id <> '')::int AS active_with_audience
    FROM vcard_employees`)
    console.log('vcard_employees:', v.rows[0])

    const s = await c.query(`SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE active = true)::int AS active,
      COUNT(*) FILTER (WHERE active = true AND LOWER(department) = 'sales')::int AS active_sales,
      COUNT(DISTINCT department) FILTER (WHERE active = true)::int AS distinct_depts
    FROM staff_members`)
    console.log('staff_members:', s.rows[0])

    const depts = await c.query(`SELECT department, COUNT(*)::int AS n
      FROM staff_members WHERE active = true
      GROUP BY department ORDER BY n DESC, department`)
    console.log('\nstaff_members departments (active):')
    for (const r of depts.rows) console.log(`  ${(r.department ?? '(null)').padEnd(28)} ${r.n}`)
  } finally { await c.end() }
}
main().catch((e) => { console.error(e); process.exit(1) })
