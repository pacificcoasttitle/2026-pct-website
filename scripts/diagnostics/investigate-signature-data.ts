/* Read-only inspection: staff_members + office_locations for Jerry Hernandez. */
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
    // 1. staff_members columns + Jerry's row
    const cols = await c.query<{ column_name: string; data_type: string; is_nullable: string }>(
      `SELECT column_name, data_type, is_nullable
         FROM information_schema.columns
        WHERE table_name = 'staff_members'
        ORDER BY ordinal_position`,
    )
    console.log('staff_members columns:')
    for (const r of cols.rows) {
      console.log(`  ${r.column_name.padEnd(28)} ${r.data_type}`)
    }

    const jerry = await c.query(
      `SELECT *
         FROM staff_members
        WHERE LOWER(email) = LOWER($1)
           OR (LOWER(first_name) = 'jerry' AND LOWER(last_name) = 'hernandez')`,
      ['ghernandez@pct.com'],
    )
    console.log(`\nJerry rows found: ${jerry.rowCount}`)
    for (const r of jerry.rows) {
      // Mask email a bit for the log
      const masked = { ...r } as Record<string, unknown>
      if (typeof masked.email === 'string') {
        const e = masked.email
        const at = e.indexOf('@')
        if (at > 2) masked.email = `${e.slice(0, 2)}…@${e.slice(at + 1)}`
      }
      console.log(JSON.stringify(masked, null, 2))
    }

    // 2. office_locations columns + every row
    const ocols = await c.query<{ column_name: string; data_type: string }>(
      `SELECT column_name, data_type
         FROM information_schema.columns
        WHERE table_name = 'office_locations'
        ORDER BY ordinal_position`,
    )
    console.log('\noffice_locations columns:')
    for (const r of ocols.rows) console.log(`  ${r.column_name.padEnd(28)} ${r.data_type}`)

    const offices = await c.query(
      `SELECT slug, display_name, address_line1, city, state, zip, main_phone
         FROM office_locations
        ORDER BY slug`,
    )
    console.log(`\noffice_locations rows: ${offices.rowCount}`)
    for (const r of offices.rows) console.log(JSON.stringify(r))

    // 3. If Jerry has an office_location slug, look up the exact match
    const jerryOffice = jerry.rows[0]?.office_location as string | null | undefined
    console.log(`\nJerry's office_location field value: ${JSON.stringify(jerryOffice)}`)
    if (jerryOffice) {
      const match = await c.query(
        `SELECT slug, display_name, address_line1, city, state, zip, main_phone
           FROM office_locations
          WHERE slug = $1`,
        [jerryOffice],
      )
      console.log(`Match by exact slug: ${match.rowCount} row(s)`)
      for (const r of match.rows) console.log(JSON.stringify(r))

      const ci = await c.query(
        `SELECT slug, display_name FROM office_locations WHERE LOWER(slug) = LOWER($1)`,
        [jerryOffice],
      )
      console.log(`Match by LOWER(slug)=LOWER($1): ${ci.rowCount} row(s)`)
      for (const r of ci.rows) console.log(JSON.stringify(r))
    }
  } finally {
    await c.end()
  }
}
main().catch((e) => { console.error('Fatal:', e); process.exit(1) })
