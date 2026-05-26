/* Read-only inspection of vcard_email_templates. */
/* eslint-disable no-console */
import { Client } from 'pg'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'

function loadEnvFile(p: string) {
  if (!existsSync(p)) return false
  for (const line of readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i)
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
  const url = process.env.DATABASE_URL
  if (!url) { console.error('DATABASE_URL not set'); process.exit(1) }
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } })
  await c.connect()
  try {
    const res = await c.query<{
      id: number; name: string; category: string | null;
      subject: string; size: string;
      created_at: string; updated_at: string;
      created_by: string | null; updated_by: string | null;
      preview: string; html_content: string;
    }>(`
      SELECT id, name, category, subject,
             LENGTH(html_content)::text AS size,
             created_at::text, updated_at::text,
             created_by, updated_by,
             LEFT(html_content, 200) AS preview,
             html_content
      FROM vcard_email_templates
      ORDER BY id
    `)
    console.log(`rows: ${res.rowCount}\n`)
    for (const r of res.rows) {
      const sha = createHash('sha256').update(r.html_content).digest('hex').slice(0, 16)
      console.log(`── id=${r.id} category=${r.category ?? '(none)'} name=${JSON.stringify(r.name)}`)
      console.log(`   subject:    ${r.subject}`)
      console.log(`   size:       ${r.size} bytes`)
      console.log(`   sha256[16]: ${sha}`)
      console.log(`   created:    ${r.created_at} by ${r.created_by ?? '(none)'}`)
      console.log(`   updated:    ${r.updated_at} by ${r.updated_by ?? '(none)'}`)
      console.log(`   preview:    ${r.preview.replace(/\s+/g, ' ').slice(0, 180)}`)
      console.log('')
    }
    // Cross-check: are any two rows' html_content identical?
    const buckets = new Map<string, number[]>()
    for (const r of res.rows) {
      const sha = createHash('sha256').update(r.html_content).digest('hex')
      if (!buckets.has(sha)) buckets.set(sha, [])
      buckets.get(sha)!.push(r.id)
    }
    const dupes = [...buckets.values()].filter((v) => v.length > 1)
    if (dupes.length > 0) {
      console.log('⚠️  duplicate html_content groups (by sha256):')
      for (const g of dupes) console.log(`    ids: ${g.join(', ')}`)
    } else {
      console.log('✓ every row has a unique html_content sha256')
    }
  } finally {
    await c.end()
  }
}

main().catch((e) => { console.error('Fatal:', e instanceof Error ? e.message : String(e)); process.exit(1) })
