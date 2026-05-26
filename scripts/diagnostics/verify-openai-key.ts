/* Read-only OpenAI key validation: GET /v1/models only. */
/* eslint-disable no-console */
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
  const key =
    process.env.OPENAI_API_KEY ||
    process.env.Open_Ai_Key ||
    process.env.OPEN_AI_KEY
  if (!key) {
    console.error('❌ No OpenAI key found in env (checked OPENAI_API_KEY, Open_Ai_Key, OPEN_AI_KEY)')
    process.exit(2)
  }

  const prefix = key.startsWith('sk-proj-') ? 'sk-proj-' : key.startsWith('sk-') ? 'sk-' : '(other)'
  console.log(`key present: ${key.length} chars, prefix=${prefix}`)

  const res = await fetch('https://api.openai.com/v1/models', {
    method: 'GET',
    headers: { Authorization: `Bearer ${key}` },
  })
  console.log(`HTTP ${res.status} ${res.statusText}`)

  if (res.status !== 200) {
    const txt = await res.text().catch(() => '')
    console.error(`error body (truncated): ${txt.slice(0, 300)}`)
    process.exit(res.status === 401 ? 1 : res.status === 429 ? 3 : 4)
  }

  const data = (await res.json()) as { data?: Array<{ id: string }> }
  const ids = (data.data ?? []).map((m) => m.id)
  const want = ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo']
  console.log(`total models: ${ids.length}`)
  for (const m of want) {
    console.log(`  ${ids.includes(m) ? '✅' : '❌'} ${m}`)
  }
}

main().catch((e) => {
  console.error('Fatal:', e instanceof Error ? e.message : String(e))
  process.exit(1)
})
