#!/usr/bin/env tsx
/**
 * scripts/import-july-2026-marketing-calendar.ts
 *
 * One-time import of the July 2026 Marketing Content Calendar from:
 *   docs/marketing-skills/calendar/PCT_July_2026_Marketing_Content_Calendar.xlsx
 *
 * Usage:
 *   npx tsx scripts/import-july-2026-marketing-calendar.ts
 *   npx tsx scripts/import-july-2026-marketing-calendar.ts --allow-past --commit
 *
 * Safety:
 *   - Dry-run by default
 *   - Validates every row against the same schema as POST /upcoming
 *   - Aborts on duplicate (scheduled_date + title)
 *   - Past-dated rows require --allow-past
 *   - Writes only through createUpcomingItem(), matching the app's CRUD path
 */

/* eslint-disable no-console */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { z } from 'zod'

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

import { createUpcomingItem, getPool } from '../lib/admin-db'
import { CreateBodySchema, LANES } from '@/app/api/admin/marketing/recap/upcoming/route'

const SOURCE_WORKBOOK =
  'docs/marketing-skills/calendar/PCT_July_2026_Marketing_Content_Calendar.xlsx'

type RawCalendarRow = {
  week: string
  scheduled_date: string
  content_type: string
  title: string
  angle: string
  deliverable: string
  cta_notes: string
  source_status: string
  owner: string
  channel: string
  priority: string
}

const RAW_ROWS: RawCalendarRow[] = [
  {
    week: '1',
    scheduled_date: '2026-07-01',
    content_type: 'Social',
    title: 'Entity-Owned Property: Authority Flow',
    angle: 'Turn the email topic into a simple flow: Entity -> Documents -> Signer. Explain why signing authority should be confirmed early.',
    deliverable: 'Instagram/Facebook Story + rep social post',
    cta_notes: 'Use the context version already created; CTA: Ask early to avoid signing delays.',
    source_status: 'Ready',
    owner: 'Marketing',
    channel: 'Social Media',
    priority: 'High',
  },
  {
    week: '1',
    scheduled_date: '2026-07-02',
    content_type: 'PDF',
    title: 'Entity-Owned Property Signing Authority Cheat Sheet',
    angle: 'One-page reference showing what title may need when property is held by an LLC, corporation, partnership, trust-owned entity, or investor group.',
    deliverable: 'PDF flyer / sales piece',
    cta_notes: 'Add Independence Day closure footer if distributed this week.',
    source_status: 'Planned',
    owner: 'Marketing',
    channel: 'PDF Piece',
    priority: 'High',
  },
  {
    week: '1',
    scheduled_date: '2026-07-03',
    content_type: 'Notice',
    title: 'Independence Day Closure',
    angle: 'Pacific Coast Title will be closed Friday, July 3rd in observance of Independence Day. Regular business hours resume Monday, July 6th.',
    deliverable: 'Holiday notice / optional social reminder',
    cta_notes: 'Use as footer blurb in email and/or short social reminder.',
    source_status: 'Planned',
    owner: 'Marketing',
    channel: 'Company Notice',
    priority: 'High',
  },
  {
    week: '2',
    scheduled_date: '2026-07-07',
    content_type: 'Email',
    title: 'Why Title Asks for a Statement of Information',
    angle: 'Educate agents on why the SI helps distinguish clients from people with similar names and can prevent delays tied to judgments, liens, or identity questions.',
    deliverable: 'HTML email + hero banner',
    cta_notes: 'CTA: Reach out if your client has questions about the SI.',
    source_status: 'Planned',
    owner: 'Marketing',
    channel: 'Email',
    priority: 'High',
  },
  {
    week: '2',
    scheduled_date: '2026-07-08',
    content_type: 'Social',
    title: 'Similar Name? Different Person.',
    angle: 'Quick social explainer: the Statement of Information helps title separate your client from someone else with a similar name.',
    deliverable: 'Story/reel graphic',
    cta_notes: 'Visual idea: name-match card with checkmark; keep it simple.',
    source_status: 'Planned',
    owner: 'Marketing',
    channel: 'Social Media',
    priority: 'Medium',
  },
  {
    week: '2',
    scheduled_date: '2026-07-09',
    content_type: 'PDF',
    title: 'Statement of Information Client Explainer',
    angle: 'Client-facing PDF that explains what the SI is, why title asks for it, and how it helps avoid unnecessary delays.',
    deliverable: 'PDF flyer / handout',
    cta_notes: 'Use rep-friendly language so agents can forward it to clients.',
    source_status: 'Planned',
    owner: 'Marketing',
    channel: 'PDF Piece',
    priority: 'High',
  },
  {
    week: '3',
    scheduled_date: '2026-07-14',
    content_type: 'Email',
    title: 'Old Liens Can Still Slow Down a Closing',
    angle: 'Explain that paid-off does not always mean released from public record. Old deeds of trust, judgments, and tax liens can still appear on title.',
    deliverable: 'HTML email + hero banner',
    cta_notes: 'CTA: Ask title early if an old lien or paid-off loan appears.',
    source_status: 'Planned',
    owner: 'Marketing',
    channel: 'Email',
    priority: 'High',
  },
  {
    week: '3',
    scheduled_date: '2026-07-15',
    content_type: 'Social',
    title: 'Paid Off Does Not Always Mean Released',
    angle: 'Engaging reminder that old liens or unreleased loans may still need documentation before closing.',
    deliverable: 'Story/reel graphic',
    cta_notes: 'Visual idea: paid stamp vs public record checklist.',
    source_status: 'Planned',
    owner: 'Marketing',
    channel: 'Social Media',
    priority: 'Medium',
  },
  {
    week: '3',
    scheduled_date: '2026-07-16',
    content_type: 'PDF',
    title: 'Old Liens & Unreleased Loans Cheat Sheet',
    angle: 'One-page cheat sheet covering old deeds of trust, judgments, tax liens, similar names, and proof of release/satisfaction.',
    deliverable: 'PDF flyer / sales piece',
    cta_notes: 'Can reuse and expand prior old liens copy.',
    source_status: 'Planned',
    owner: 'Marketing',
    channel: 'PDF Piece',
    priority: 'High',
  },
  {
    week: '4',
    scheduled_date: '2026-07-21',
    content_type: 'Email',
    title: 'Who Needs to Sign? Common Title Signing Surprises',
    angle: 'Show agents how trusts, LLCs, spouses, deceased owners, divorce, POAs, and corporations can affect who needs to sign.',
    deliverable: 'HTML email + hero banner',
    cta_notes: 'CTA: Confirm signers early before closing week.',
    source_status: 'Planned',
    owner: 'Marketing',
    channel: 'Email',
    priority: 'High',
  },
  {
    week: '4',
    scheduled_date: '2026-07-22',
    content_type: 'Social',
    title: 'The Right Signer Matters',
    angle: 'Simple social piece showing that the wrong or missing signer can delay signing, funding, or recording.',
    deliverable: 'Story/reel graphic',
    cta_notes: 'Visual idea: signer map / approval chain.',
    source_status: 'Planned',
    owner: 'Marketing',
    channel: 'Social Media',
    priority: 'Medium',
  },
  {
    week: '4',
    scheduled_date: '2026-07-23',
    content_type: 'PDF',
    title: 'Who Needs to Sign? Agent Checklist',
    angle: 'PDF checklist agents can use to identify signer issues early: trusts, entities, spouses, divorce, death, POA, and authority docs.',
    deliverable: 'PDF checklist',
    cta_notes: 'Strong evergreen handout for reps.',
    source_status: 'Planned',
    owner: 'Marketing',
    channel: 'PDF Piece',
    priority: 'High',
  },
  {
    week: '5',
    scheduled_date: '2026-07-28',
    content_type: 'Email',
    title: 'Title Changes & Property Tax Questions to Flag Early',
    angle: 'Educational reminder that title changes, inheritances, transfers, trusts, or adding/removing someone from title may raise reassessment or tax questions.',
    deliverable: 'HTML email + hero banner',
    cta_notes: 'CTA: Encourage clients to consult CPA, attorney, or tax advisor when needed.',
    source_status: 'Planned',
    owner: 'Marketing',
    channel: 'Email',
    priority: 'High',
  },
  {
    week: '5',
    scheduled_date: '2026-07-29',
    content_type: 'Social',
    title: 'Title Change = Questions to Ask First',
    angle: 'Social post highlighting that changing title can affect more than the deed: tax, lender, estate plan, and future sale questions.',
    deliverable: 'Story/reel graphic',
    cta_notes: 'Visual idea: four-question card: Tax / Property Tax / Ownership / Lender.',
    source_status: 'Planned',
    owner: 'Marketing',
    channel: 'Social Media',
    priority: 'Medium',
  },
  {
    week: '5',
    scheduled_date: '2026-07-30',
    content_type: 'PDF',
    title: 'Before You Change Title: Questions to Review',
    angle: 'PDF piece reminding clients and agents to review tax, property tax, ownership, trust/estate plan, lender, and insurance questions before signing a deed.',
    deliverable: 'PDF flyer / sales piece',
    cta_notes: 'Can align with the vesting/title change piece already modernized.',
    source_status: 'Planned',
    owner: 'Marketing',
    channel: 'PDF Piece',
    priority: 'High',
  },
]

const LANE_BY_TYPE: Record<string, z.infer<typeof CreateBodySchema>['lane']> = {
  Email: 'weekly-email',
  PDF: 'marketing-piece',
  Social: 'social',
  Notice: 'other',
}

const IMPORT_CREATED_BY = 'import:july-2026-marketing-calendar'

function pacificTodayISO(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function shortLabel(iso: string): string {
  const [, m, d] = iso.split('-').map(Number)
  return `${MONTHS[m - 1]} ${String(d).padStart(2, ' ')}`
}

function pad(s: string, n: number): string {
  return s.length >= n ? s : s + ' '.repeat(n - s.length)
}

function notesFor(row: RawCalendarRow): string {
  return [
    `Deliverable: ${row.deliverable}`,
    `CTA / Notes: ${row.cta_notes}`,
    `Source status: ${row.source_status}`,
    `Channel: ${row.channel}`,
    `Priority: ${row.priority}`,
    `Source workbook: ${SOURCE_WORKBOOK}`,
  ].join('\n')
}

function normalizeRow(row: RawCalendarRow) {
  return {
    scheduled_date: row.scheduled_date,
    title: row.title,
    lane: LANE_BY_TYPE[row.content_type] ?? 'other',
    description: row.angle,
    asset_count_planned: null,
    notes: notesFor(row),
    status: 'planned' as const,
    owner: row.owner,
    asset_delivery_batch_id: null,
    recurrence_pattern: 'none' as const,
    recurrence_until: null,
  }
}

async function main() {
  const isCommit = process.argv.includes('--commit')
  const allowPast = process.argv.includes('--allow-past')
  const todayISO = pacificTodayISO()
  const rows = RAW_ROWS.map(normalizeRow)

  console.log(`\nPCT July 2026 Marketing Calendar Import — ${isCommit ? 'COMMIT MODE' : 'DRY RUN'}`)
  console.log(`Source: ${SOURCE_WORKBOOK}`)

  const validated: Array<z.infer<typeof CreateBodySchema>> = []
  const validationErrors: string[] = []
  rows.forEach((row, i) => {
    const parsed = CreateBodySchema.safeParse(row)
    if (parsed.success) {
      validated.push(parsed.data)
    } else {
      validationErrors.push(
        `  row ${i + 1} (${row.scheduled_date} "${row.title}"): ` +
          parsed.error.issues.map((iss) => `${iss.path.join('.') || 'body'}: ${iss.message}`).join('; '),
      )
    }
  })
  if (validationErrors.length > 0) {
    console.error(`Validation: ${validationErrors.length} of ${rows.length} rows failed:`)
    console.error(validationErrors.join('\n'))
    console.error('\nAborting before any writes.')
    process.exit(1)
  }
  console.log(`Validation: ${validated.length} items pass Zod schema`)

  const pastDated = rows.filter((row) => row.scheduled_date < todayISO)
  if (pastDated.length > 0 && !allowPast) {
    console.error(`Past-date check: ${pastDated.length} item(s) are dated before today PT (${todayISO}):`)
    for (const row of pastDated) {
      console.error(`  ${shortLabel(row.scheduled_date)}  ${row.title}`)
    }
    console.error('\nRe-run with --allow-past if these historical July rows should be imported.')
    process.exit(1)
  }
  console.log(
    pastDated.length > 0
      ? `Past-date check: ${pastDated.length} past item(s), allowed by --allow-past`
      : `Past-date check: none (today PT: ${todayISO})`,
  )

  const pool = getPool()
  const dates = [...new Set(rows.map((r) => r.scheduled_date))]
  const existing = await pool.query(
    `SELECT scheduled_date::text AS scheduled_date, title
       FROM marketing_upcoming
      WHERE scheduled_date = ANY($1::date[])`,
    [dates],
  )
  const existingKeys = new Set(
    existing.rows.map((r: { scheduled_date: string; title: string }) => `${r.scheduled_date}|${r.title}`),
  )
  const conflicts = rows.filter((r) => existingKeys.has(`${r.scheduled_date}|${r.title}`))
  if (conflicts.length > 0) {
    console.error(`Conflict check: ${conflicts.length} existing item(s) match (date, title):`)
    for (const row of conflicts) {
      console.error(`  ${shortLabel(row.scheduled_date)}  ${row.title}`)
    }
    console.error('\nAborting to avoid duplicates.')
    process.exit(1)
  }
  console.log('Conflict check: 0 existing items match (date, title)')

  const laneCounts = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.lane] = (acc[row.lane] ?? 0) + 1
    return acc
  }, {})

  if (!isCommit) {
    console.log('\nItems to insert:')
    for (const row of rows) {
      console.log(`${shortLabel(row.scheduled_date)}  ${pad(row.lane, 16)} ${row.title}`)
    }
    console.log('───────────────────────────────────────────────────────')
    console.log(`Total: ${rows.length} items`)
    console.log('By lane:')
    for (const lane of LANES) {
      if (laneCounts[lane]) console.log(`  ${pad(lane, 16)} : ${laneCounts[lane]}`)
    }
    console.log('\nNo writes performed. Re-run with --allow-past --commit to insert.\n')
    process.exit(0)
  }

  console.log(`\nInserting ${rows.length} items via createUpcomingItem...`)
  const insertedIds: number[] = []
  try {
    for (const row of rows) {
      const created = await createUpcomingItem({
        scheduled_date: row.scheduled_date,
        title: row.title,
        lane: row.lane,
        description: row.description ?? null,
        asset_count_planned: null,
        notes: row.notes,
        status: 'planned',
        owner: row.owner,
        asset_delivery_batch_id: null,
        recurrence_pattern: 'none',
        recurrence_until: null,
        created_by: IMPORT_CREATED_BY,
      })
      insertedIds.push(created.id)
      console.log(`✓ id ${pad(String(created.id), 3)} ${shortLabel(row.scheduled_date)}  ${pad(row.lane, 16)} ${row.title}`)
    }
  } catch (err) {
    console.error(`\nInsert failed after ${insertedIds.length} of ${rows.length} rows.`)
    console.error(`Inserted ids: ${insertedIds.join(', ') || '(none)'}`)
    console.error(err)
    process.exit(1)
  }

  console.log(`\n${insertedIds.length} July calendar items inserted.`)
  console.log('Next steps:')
  console.log('• Open calendar: /admin/team/marketing-recap/calendar')
  console.log('• Review July items and mark past completed items shipped as appropriate\n')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
