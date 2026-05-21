/* Read-only Mailchimp recent-activity probe. */
/* eslint-disable no-console */
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
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    process.env[key] = val
  }
  return true
}
loadEnvFile(resolve(process.cwd(), '.env.local')) || loadEnvFile(resolve(process.cwd(), '.env'))

async function main() {
  const apiKey = process.env.MAILCHIMP_API_KEY
  const server = process.env.MAILCHIMP_SERVER
  if (!apiKey || !server) {
    console.error('Mailchimp env not set')
    process.exit(1)
  }
  const auth = `Basic ${Buffer.from(`any:${apiKey}`).toString('base64')}`

  async function countByStatus(status: string, sinceIso?: string) {
    const params = new URLSearchParams({
      status,
      count: '1',
      fields: 'total_items',
    })
    if (sinceIso) params.set('since_send_time', sinceIso)
    const url = `https://${server}.api.mailchimp.com/3.0/campaigns?${params.toString()}`
    const res = await fetch(url, { headers: { Authorization: auth } })
    if (!res.ok) {
      const txt = await res.text().catch(() => '')
      console.error(`HTTP ${res.status} for status=${status}: ${txt.slice(0, 200)}`)
      return null
    }
    const data = (await res.json()) as { total_items?: number }
    return data.total_items ?? 0
  }

  // Most recent N campaigns (any status), to peek at activity shape
  async function recentCampaigns(count: number) {
    const params = new URLSearchParams({
      count: String(count),
      sort_field: 'create_time',
      sort_dir: 'DESC',
      fields:
        'campaigns.id,campaigns.web_id,campaigns.status,campaigns.create_time,campaigns.send_time,campaigns.settings.title,campaigns.settings.subject_line,campaigns.recipients.list_id,campaigns.recipients.list_name',
    })
    const url = `https://${server}.api.mailchimp.com/3.0/campaigns?${params.toString()}`
    const res = await fetch(url, { headers: { Authorization: auth } })
    if (!res.ok) return []
    const data = (await res.json()) as {
      campaigns?: Array<{
        id: string
        web_id: number
        status: string
        create_time: string
        send_time: string | null
        settings?: { title?: string; subject_line?: string }
        recipients?: { list_id?: string; list_name?: string }
      }>
    }
    return data.campaigns ?? []
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
  const drafts = await countByStatus('save')
  const schedules = await countByStatus('schedule')
  const sentTotal = await countByStatus('sent')
  const sentLast30 = await countByStatus('sent', thirtyDaysAgo)

  console.log('Mailchimp recent activity:')
  console.log(`  drafts (status=save): ${drafts}`)
  console.log(`  scheduled (status=schedule): ${schedules}`)
  console.log(`  sent (all-time): ${sentTotal}`)
  console.log(`  sent (last 30 days, since_send_time>=${thirtyDaysAgo}): ${sentLast30}`)

  console.log('\n10 most recent campaigns (any status):')
  const recent = await recentCampaigns(10)
  for (const c of recent) {
    console.log(
      `  [${c.status}] ${c.create_time}  list=${c.recipients?.list_name ?? c.recipients?.list_id ?? '?'}  title=${c.settings?.title ?? ''}  subj=${c.settings?.subject_line ?? ''}`,
    )
  }
}

main().catch((err) => {
  console.error('Fatal:', err instanceof Error ? err.message : String(err))
  process.exit(1)
})
