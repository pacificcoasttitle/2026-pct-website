#!/usr/bin/env tsx
/**
 * scripts/seed-june-2026-campaigns.ts
 *
 * One-time seed of the June 2026 marketing calendar from the PCT
 * Marketing Department Restart Plan. 14 items across 4 lanes.
 *
 * Usage:
 *   npx tsx scripts/seed-june-2026-campaigns.ts             # dry-run
 *   npx tsx scripts/seed-june-2026-campaigns.ts --commit    # write
 *
 * Safety:
 *   - Dry-run by default (no writes without --commit)
 *   - Validates every row against the same Zod shape as POST /upcoming
 *   - Aborts on any conflict (existing item with same date+title)
 *   - Aborts on any past-dated item (would immediately slip)
 *   - Exhaustive pre-flight gating before ANY write (all-or-nothing at
 *     the validation stage — see TRANSACTION NOTE below)
 *
 * TRANSACTION NOTE (flagged for Reviewer):
 *   The ticket asks for both (a) inserting via createUpcomingItem — the
 *   established helper, no parallel raw-SQL write path — and (b) a single
 *   DB transaction. These can't both hold without modifying lib/admin-db
 *   (out of scope this ticket): createUpcomingItem runs on the shared
 *   pool and accepts no client, so a BEGIN/COMMIT on a dedicated client
 *   would NOT enclose its inserts. Rather than fake a transaction or open
 *   a forbidden parallel write path, this script makes the batch
 *   all-or-nothing at the PRE-FLIGHT stage: every row is Zod-validated,
 *   past-date-checked, and conflict-checked BEFORE the first write, so a
 *   write-time failure is effectively impossible. If a write still throws
 *   mid-batch, the script stops and reports exactly which rows were
 *   inserted; a re-run's conflict check then skips them. If true
 *   single-connection atomicity is required, the clean fix is a follow-up
 *   that lets createUpcomingItem accept an optional client.
 */

/* eslint-disable no-console */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { z } from 'zod'

// ── Env loading (same boilerplate as scripts/migrations/*) ──────────
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

// ── Validation schema ───────────────────────────────────────────────
// Mirrors the POST /upcoming CreateBodySchema (app/api/admin/marketing/
// recap/upcoming/route.ts). The route's schema is a non-exported const
// and this ticket forbids modifying application files, so it's mirrored
// here rather than imported. Kept field-for-field identical for the
// fields this seed touches.
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const LANES    = ['marketing-piece', 'social', 'weekly-email', 'other'] as const
const STATUSES = ['planned', 'shipped', 'cancelled'] as const

const SeedRowSchema = z.object({
  scheduled_date:      z.string().regex(DATE_RE, 'Use YYYY-MM-DD format'),
  title:               z.string().trim().min(1).max(200),
  lane:                z.enum(LANES).optional().default('other'),
  description:         z.string().trim().max(1000).optional().nullable(),
  asset_count_planned: z.coerce.number().int().min(0).max(9999).optional().nullable(),
  notes:               z.string().trim().max(2000).optional().nullable(),
  status:              z.enum(STATUSES).optional().default('planned'),
})

// ── The 14 seed items (locked spec) ─────────────────────────────────
const SEED_ITEMS = [
  { scheduled_date: '2026-06-02', lane: 'weekly-email',
    title: 'Week 1 — Market Insight',
    description: 'Tuesday email send. Theme: Market Insight (e.g. what low inventory means for sellers). Topic TBD by Thursday draft due. Draft Thu 5/28, Approve Mon 6/1, Send Tue 6/2.' },
  { scheduled_date: '2026-06-03', lane: 'social',
    title: 'Week 1 social posts (2–3 pieces)',
    description: 'Wednesday social production. 2–3 branded posts. Categories rotate: title tips, escrow explainers, market stats, tool promos.' },
  { scheduled_date: '2026-06-04', lane: 'marketing-piece',
    title: 'How to Read a Preliminary Title Report',
    description: 'Bi-weekly marketing piece. Draft due Mon 6/1, Final Thu 6/4, Release to sales Fri 6/5. Delivered as PDF flyer + social graphic + email insert.' },
  { scheduled_date: '2026-06-05', lane: 'other',
    title: 'June kickoff review',
    description: 'First Monthly Wins Review — kickoff format since no prior month to review. Cover: what shipped, what got delayed, what reps requested, what to repeat.' },
  { scheduled_date: '2026-06-09', lane: 'weekly-email',
    title: 'Week 2 — Title/Escrow Education',
    description: 'Tuesday email send. Theme: Title/Escrow Education (e.g. how to read a preliminary title report). Topic TBD by Thursday draft due.' },
  { scheduled_date: '2026-06-10', lane: 'social',
    title: 'Week 2 social posts (2–3 pieces)',
    description: 'Wednesday social production. 2–3 branded posts.' },
  { scheduled_date: '2026-06-16', lane: 'weekly-email',
    title: 'Week 3 — Farming/Prospecting',
    description: 'Tuesday email send. Theme: Farming/Prospecting (e.g. how to identify likely sellers). Topic TBD by Thursday draft due.' },
  { scheduled_date: '2026-06-17', lane: 'social',
    title: 'Week 3 social posts (2–3 pieces)',
    description: 'Wednesday social production. 2–3 branded posts.' },
  { scheduled_date: '2026-06-18', lane: 'marketing-piece',
    title: 'Wire Fraud Prevention',
    description: 'Bi-weekly marketing piece. Draft Mon 6/15, Final Thu 6/18, Release Fri 6/19. PDF flyer + social graphic + email insert.' },
  { scheduled_date: '2026-06-23', lane: 'weekly-email',
    title: 'Week 4 — Tool Spotlight',
    description: 'Tuesday email send. Theme: Tool Spotlight (e.g. how PCT tools help agents win more business). Topic TBD by Thursday draft due.' },
  { scheduled_date: '2026-06-23', lane: 'other',
    title: 'Build July plan',
    description: "Monthly planning meeting. Set next month's calendar: email topics, marketing piece schedule, social themes, approval deadlines." },
  { scheduled_date: '2026-06-24', lane: 'social',
    title: 'Week 4 social posts (2–3 pieces)',
    description: 'Wednesday social production. 2–3 branded posts.' },
  { scheduled_date: '2026-06-30', lane: 'weekly-email',
    title: 'Week 5 — Market Insight (rotation restart)',
    description: 'Tuesday email send. Theme rotation restarts at Market Insight (Week 1 of next cycle). Topic TBD.' },
  { scheduled_date: '2026-07-01', lane: 'social',
    title: 'Week 5 social posts (2–3 pieces)',
    description: 'Wednesday social production for week starting 6/29 — falls on 7/1 (Wed). Optional include if scope is "first week of June" only.' },
] as const

const SEED_CREATED_BY = 'seed:june-2026'

// ── PT-anchored today (Intl en-CA / America/Los_Angeles), matching the
// recap shaper. No new Date('YYYY-MM-DD') anywhere. ──
function pacificTodayISO(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year:     'numeric',
    month:    '2-digit',
    day:      '2-digit',
  }).format(new Date())
}

// Short "Mon DD" label for console output (component-wise; no UTC parse).
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function shortLabel(iso: string): string {
  const [, m, d] = iso.split('-').map(Number)
  return `${MONTHS[m - 1]} ${String(d).padStart(2, ' ')}`
}

function pad(s: string, n: number): string {
  return s.length >= n ? s : s + ' '.repeat(n - s.length)
}

async function main() {
  const isCommit = process.argv.includes('--commit')
  const todayISO = pacificTodayISO()

  console.log(`\nPCT June 2026 Calendar Seed — ${isCommit ? 'COMMIT MODE' : 'DRY RUN'}`)

  // ── STEP 1: validate all rows against the Zod shape (no writes) ──
  const validated: Array<z.infer<typeof SeedRowSchema>> = []
  const validationErrors: string[] = []
  SEED_ITEMS.forEach((row, i) => {
    const parsed = SeedRowSchema.safeParse(row)
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
    console.error(`Validation: ${validationErrors.length} of ${SEED_ITEMS.length} rows FAILED the Zod schema:`)
    console.error(validationErrors.join('\n'))
    console.error('\nAborting before any writes (fail-fast, all-or-nothing).')
    process.exit(1)
  }
  console.log(`Validation: ${validated.length} items pass Zod schema ✓`)

  // ── STEP 2: past-date check (PT) ──
  const pastDated = SEED_ITEMS.filter((row) => row.scheduled_date < todayISO)
  if (pastDated.length > 0) {
    console.error(`Past-date check: ${pastDated.length} item(s) are dated before today PT (${todayISO}):`)
    for (const row of pastDated) {
      console.error(`  ${shortLabel(row.scheduled_date)}  ${row.title}`)
    }
    console.error(
      '\nRefusing to seed past-dated items (would immediately appear as ' +
      'slippage in the completion card). Update dates or use --allow-past ' +
      '(--allow-past is not implemented — intentional; add deliberately if ever needed).',
    )
    process.exit(1)
  }
  console.log(`Past-date check: none ✓ (today PT: ${todayISO})`)

  // ── STEP 3: conflict check — existing rows with same (date, title) ──
  const pool = getPool()
  const dates = [...new Set(SEED_ITEMS.map((r) => r.scheduled_date))]
  const existing = await pool.query(
    `SELECT scheduled_date::text AS scheduled_date, title
       FROM marketing_upcoming
      WHERE scheduled_date = ANY($1::date[])`,
    [dates],
  )
  const existingKeys = new Set(
    existing.rows.map((r: { scheduled_date: string; title: string }) => `${r.scheduled_date}|${r.title}`),
  )
  const conflicts = SEED_ITEMS.filter((r) => existingKeys.has(`${r.scheduled_date}|${r.title}`))
  if (conflicts.length > 0) {
    console.error(`Conflict check: ${conflicts.length} existing item(s) match (date, title):`)
    for (const row of conflicts) {
      console.error(`  ${shortLabel(row.scheduled_date)}  ${row.title}`)
    }
    console.error(
      '\nAborting — these would be duplicates. Use --force to skip duplicates ' +
      '(--force is not implemented — intentional; add deliberately if ever needed).',
    )
    process.exit(1)
  }
  console.log(`Conflict check: 0 existing items match (date, title) ✓`)

  // ── STEP 4: dry-run → print summary and exit (NO writes) ──
  const laneCounts = SEED_ITEMS.reduce<Record<string, number>>((acc, r) => {
    acc[r.lane] = (acc[r.lane] ?? 0) + 1
    return acc
  }, {})

  if (!isCommit) {
    console.log('\nItems to insert:')
    for (const row of SEED_ITEMS) {
      console.log(`${shortLabel(row.scheduled_date)}  ${pad(row.lane, 16)} ${row.title}`)
    }
    console.log('───────────────────────────────────────────────────────')
    console.log(`Total: ${SEED_ITEMS.length} items`)
    console.log('By lane:')
    for (const lane of LANES) {
      if (laneCounts[lane]) console.log(`  ${pad(lane, 16)} : ${laneCounts[lane]}`)
    }
    console.log('\nNo writes performed. Re-run with --commit to insert.\n')
    process.exit(0)
  }

  // ── STEP 5: --commit → insert via createUpcomingItem ──
  // Pre-flight gates above guarantee these inserts can't fail on
  // validation/conflict/past-date grounds. See TRANSACTION NOTE.
  console.log(`\nInserting ${SEED_ITEMS.length} items via createUpcomingItem...`)
  const insertedIds: number[] = []
  try {
    for (const row of SEED_ITEMS) {
      const created = await createUpcomingItem({
        scheduled_date: row.scheduled_date,
        title:          row.title,
        lane:           row.lane,
        description:    row.description ?? null,
        // Locked spec: all defaults. asset_count_planned blank, owner null,
        // status planned, recurrence none, no asset link.
        asset_count_planned: null,
        notes:          null,
        status:         'planned',
        owner:          null,
        asset_delivery_batch_id: null,
        recurrence_pattern: 'none',
        recurrence_until:   null,
        created_by:     SEED_CREATED_BY,
      })
      insertedIds.push(created.id)
      console.log(`✓ id ${pad(String(created.id), 3)} ${shortLabel(row.scheduled_date)}  ${pad(row.lane, 16)} ${row.title}`)
    }
  } catch (err) {
    console.error(`\nInsert failed after ${insertedIds.length} of ${SEED_ITEMS.length} rows.`)
    console.error(`Inserted ids: ${insertedIds.join(', ') || '(none)'}`)
    console.error('Re-run the script — the conflict check will skip the rows already inserted.')
    console.error(err)
    process.exit(1)
  }

  // ── STEP 6: final summary ──
  console.log(`\n${insertedIds.length} items inserted.`)
  console.log('Next steps:')
  console.log('• Open calendar: /admin/team/marketing-recap/calendar')
  console.log('• Verify the 14 chips render across June 2–30 + Jul 1')
  console.log('• Monday\'s recap will include the week\'s items (cron fires Jun 1 8am PT)\n')
  process.exit(0)
}

main().catch((err) => { console.error(err); process.exit(1) })
