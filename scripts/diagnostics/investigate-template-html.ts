/* Read-only dump of vcard_email_templates html_content for diagnosis. */
/* eslint-disable no-console */
import { Client } from 'pg'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'

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
    const res = await c.query<{ id: number; name: string; category: string | null; html_content: string; updated_at: string; updated_by: string | null }>(
      `SELECT id, name, category, html_content, updated_at::text, updated_by FROM vcard_email_templates ORDER BY id`,
    )
    for (const r of res.rows) {
      console.log(`\n══════════════════════════════════════════════`)
      console.log(`id=${r.id}  category=${r.category}  name="${r.name}"  updated_at=${r.updated_at}  updated_by=${r.updated_by ?? '(null)'}`)
      console.log(`length=${r.html_content.length}`)

      // Save full HTML to a scratch file (gitignored under backups/) so we can read it cleanly.
      const outPath = resolve(process.cwd(), 'backups', `template-${r.id}-${r.category ?? 'none'}.html`)
      mkdirSync(dirname(outPath), { recursive: true })
      writeFileSync(outPath, r.html_content, 'utf8')
      console.log(`saved → ${outPath}`)

      // ── Audit: every <img …> tag with full attribute block.
      const imgs = [...r.html_content.matchAll(/<img\b[^>]*>/gi)]
      console.log(`\nFully-formed <img …> tag count: ${imgs.length}`)
      imgs.forEach((m, i) => {
        const tag = m[0].replace(/\s+/g, ' ')
        console.log(`  [${i}] @${m.index}  ${tag}`)
      })

      // ── Audit: any literal "<img" followed (within 400 chars) by NO closing ">".
      const opens = [...r.html_content.matchAll(/<img\b/gi)]
      const broken: string[] = []
      for (const o of opens) {
        const start = o.index ?? 0
        const window = r.html_content.slice(start, start + 400)
        if (!/>/.test(window)) broken.push(`@${start} — '<img' without '>' within 400 chars`)
      }
      console.log(`broken <img with no closing '>' within 400 chars: ${broken.length}`)
      broken.forEach((b) => console.log(`  ${b}`))

      // ── Audit: stray attribute text after a '>'
      const stray = [...r.html_content.matchAll(/>\s*([^<]*?(?:\balt=|\bwidth=|\bstyle=|\bsrc=|\bheight=)[^<]{0,160})/gi)]
      if (stray.length) {
        console.log(`\nOrphaned attribute-looking text (after a '>'), ${stray.length} hit(s):`)
        for (const s of stray) console.log(`  @${s.index}: ${JSON.stringify(s[1].slice(0, 180))}`)
      } else {
        console.log(`no orphaned attribute text`)
      }

      // ── Audit: merge tags
      const heroTag = (r.html_content.match(/\{\{HERO_IMAGE\}\}/g) || []).length
      const dataHero = (r.html_content.match(/data-hero=/g) || []).length
      console.log(`{{HERO_IMAGE}} tokens: ${heroTag}    data-hero attrs: ${dataHero}`)
    }
  } finally {
    await c.end()
  }
}
main().catch((e) => { console.error('Fatal:', e); process.exit(1) })
