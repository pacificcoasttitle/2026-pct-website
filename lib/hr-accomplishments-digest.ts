// ============================================================
// PCT HR — quarterly accomplishments digest (on-demand, no saved table)
//
// Pulls accomplishment notes for a date window, computes COVERAGE FACTS
// in code (always shown), and optionally calls OpenAI to produce a
// per-employee SUMMARY that presents/organizes — never ranks/scores.
//
// GATE: canViewAccomplishmentsDigest (role === 'hr' || 'top_level' ONLY).
// Same predicate as canViewAllNotes — NOT hr-tools.
// ============================================================

import { z } from 'zod'
import { getPool } from '@/lib/admin-db'
import type { AdminSession } from '@/lib/admin-auth'
import { canViewAllNotes } from '@/lib/hr-employee-notes'

export { canViewAllNotes as canViewAccomplishmentsDigest }

export type QuarterNumber = 1 | 2 | 3 | 4

export interface QuarterWindow {
  year:    number
  quarter: QuarterNumber
  start:   string // YYYY-MM-DD inclusive
  end:     string // YYYY-MM-DD exclusive
  label:   string // e.g. "Q2 2026 (Apr–Jun)"
}

export interface AccomplishmentNoteRow {
  id:            number
  body:          string
  category:      string | null
  date:          string // YYYY-MM-DD
  author_name:   string | null
  author_user_id: number
}

export interface EmployeeAccomplishmentGroup {
  employee_id:   number
  employee_name: string
  notes:         AccomplishmentNoteRow[]
  note_count:    number
  authors:       string[]
}

export interface DigestCoverageFacts {
  total_notes:           number
  employees_with_notes:  number
  notes_per_author:      Array<{ author_name: string; count: number }>
  notes_per_employee:    Array<{ employee_id: number; employee_name: string; count: number }>
  window:                QuarterWindow
}

export interface DigestAiEmployeeSummary {
  employee_id:      number
  employee_name:    string
  note_count:       number
  authors:          string[]
  summary:          string
  themes:           string[]
  source_note_ids:  number[]
}

export interface DigestAiResult {
  employees: DigestAiEmployeeSummary[]
  caveats:   string[]
}

const MODEL = 'gpt-4o-mini' as const

const QUARTER_MONTHS: Record<QuarterNumber, [string, string]> = {
  1: ['Jan', 'Mar'],
  2: ['Apr', 'Jun'],
  3: ['Jul', 'Sep'],
  4: ['Oct', 'Dec'],
}

/** Calendar quarter boundaries [start inclusive, end exclusive) as YYYY-MM-DD. */
export function quarterToWindow(year: number, quarter: QuarterNumber): QuarterWindow {
  const starts: Record<QuarterNumber, string> = {
    1: `${year}-01-01`,
    2: `${year}-04-01`,
    3: `${year}-07-01`,
    4: `${year}-10-01`,
  }
  const endYear = quarter === 4 ? year + 1 : year
  const endQuarter = (quarter === 4 ? 1 : (quarter + 1)) as QuarterNumber
  const endStarts: Record<QuarterNumber, string> = {
    1: `${endYear}-01-01`,
    2: `${endYear}-04-01`,
    3: `${endYear}-07-01`,
    4: `${endYear}-10-01`,
  }
  const [mStart, mEnd] = QUARTER_MONTHS[quarter]
  return {
    year,
    quarter,
    start: starts[quarter],
    end: endStarts[endQuarter],
    label: `Q${quarter} ${year} (${mStart}–${mEnd})`,
  }
}

/** The most recently completed calendar quarter (not the one in progress). */
export function getLastCompletedQuarter(refDate = new Date()): QuarterWindow {
  const year = refDate.getFullYear()
  const month = refDate.getMonth() // 0-indexed
  if (month < 3) return quarterToWindow(year - 1, 4)
  if (month < 6) return quarterToWindow(year, 1)
  if (month < 9) return quarterToWindow(year, 2)
  return quarterToWindow(year, 3)
}

/** Recent quarter presets for the selector (last completed first). */
export function listRecentQuarterPresets(count = 8, refDate = new Date()): QuarterWindow[] {
  let { year, quarter } = getLastCompletedQuarter(refDate)
  const out: QuarterWindow[] = []
  for (let i = 0; i < count; i++) {
    out.push(quarterToWindow(year, quarter))
    quarter = (quarter === 1 ? 4 : (quarter - 1)) as QuarterNumber
    if (quarter === 4) year -= 1
  }
  return out
}

interface RawAccomplishmentRow {
  id:              number
  hr_employee_id:  number
  employee_name:   string
  body:            string
  category:        string | null
  note_date:       string
  author_user_id:  number
  author_name:     string | null
}

/**
 * Pull flat accomplishment rows for [start, end), then group by employee.
 */
export async function getAccomplishmentsForQuarter(
  start: string,
  end: string,
): Promise<EmployeeAccomplishmentGroup[]> {
  const db = getPool()
  const res = await db.query(
    `SELECT n.id,
            n.hr_employee_id,
            TRIM(he.first_name || ' ' || he.last_name) AS employee_name,
            n.body,
            n.category,
            COALESCE(n.occurred_on, n.created_at::date)::text AS note_date,
            n.author_user_id,
            COALESCE(
              NULLIF(TRIM(COALESCE(u.first_name,'') || ' ' || COALESCE(u.last_name,'')), ''),
              u.username
            ) AS author_name
       FROM hr_employee_notes n
       JOIN hr_employees he ON he.id = n.hr_employee_id
       LEFT JOIN vcard_admin_users u ON u.id = n.author_user_id
      WHERE n.deleted_at IS NULL
        AND n.note_type = 'accomplishment'
        AND COALESCE(n.occurred_on, n.created_at::date) >= $1::date
        AND COALESCE(n.occurred_on, n.created_at::date) < $2::date
      ORDER BY he.last_name, he.first_name, note_date, n.id`,
    [start, end],
  )

  const rows = res.rows as RawAccomplishmentRow[]
  const byEmployee = new Map<number, EmployeeAccomplishmentGroup>()

  for (const row of rows) {
    let group = byEmployee.get(row.hr_employee_id)
    if (!group) {
      group = {
        employee_id: row.hr_employee_id,
        employee_name: row.employee_name,
        notes: [],
        note_count: 0,
        authors: [],
      }
      byEmployee.set(row.hr_employee_id, group)
    }
    group.notes.push({
      id: row.id,
      body: row.body,
      category: row.category,
      date: row.note_date,
      author_name: row.author_name,
      author_user_id: row.author_user_id,
    })
    group.note_count += 1
    const authorLabel = row.author_name || `User #${row.author_user_id}`
    if (!group.authors.includes(authorLabel)) {
      group.authors.push(authorLabel)
    }
  }

  return [...byEmployee.values()].sort((a, b) =>
    a.employee_name.localeCompare(b.employee_name),
  )
}

/** Coverage facts computed IN CODE — shown even if AI fails. */
export function computeCoverageFacts(
  groups: EmployeeAccomplishmentGroup[],
  window: QuarterWindow,
): DigestCoverageFacts {
  const authorCounts = new Map<string, number>()
  let total = 0
  for (const g of groups) {
    total += g.note_count
    for (const n of g.notes) {
      const label = n.author_name || `User #${n.author_user_id}`
      authorCounts.set(label, (authorCounts.get(label) ?? 0) + 1)
    }
  }

  return {
    total_notes: total,
    employees_with_notes: groups.length,
    notes_per_author: [...authorCounts.entries()]
      .map(([author_name, count]) => ({ author_name, count }))
      .sort((a, b) => b.count - a.count || a.author_name.localeCompare(b.author_name)),
    notes_per_employee: groups
      .map((g) => ({ employee_id: g.employee_id, employee_name: g.employee_name, count: g.note_count }))
      .sort((a, b) => b.count - a.count || a.employee_name.localeCompare(b.employee_name)),
    window,
  }
}

const SYSTEM_PROMPT = `You are preparing a quarterly accomplishments DIGEST for leadership at Pacific Coast Title.
Your job is to SUMMARIZE and ORGANIZE the logged accomplishment notes only.

STRICT RULES — violations are not acceptable:
- Do NOT rank, score, compare, nominate, or select winners.
- Do NOT use comparative or superlative language (best, top, most deserving, outstanding compared to, winner, leading, #1).
- Do NOT infer or invent accomplishments not present in the notes. The notes are your ONLY source.
- If a person's notes are sparse, say so plainly — do not embellish.
- Leadership decides recognition; you only prepare the digest.

For each employee with notes, produce:
- A concise faithful synthesis of THAT person's logged accomplishments (summary).
- Optional themes[] grounded in their notes (short phrases, not rankings).
- source_note_ids[] listing every note id you drew from (must be a subset of the provided ids).

Output valid JSON matching the schema exactly. No markdown.`

const AiResponseSchema = z.object({
  employees: z.array(z.object({
    employee_id:     z.number().int(),
    employee_name:   z.string(),
    note_count:      z.number().int(),
    authors:         z.array(z.string()),
    summary:         z.string(),
    themes:          z.array(z.string()).default([]),
    source_note_ids: z.array(z.number().int()),
  })),
  caveats: z.array(z.string()).default([]),
})

/** Backend OpenAI call — presents only, never ranks. Returns null on failure. */
export async function generateAccomplishmentsDigestAi(
  groups: EmployeeAccomplishmentGroup[],
): Promise<{ result: DigestAiResult | null; error: string | null }> {
  if (groups.length === 0) {
    return { result: { employees: [], caveats: [] }, error: null }
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return { result: null, error: 'AI summary unavailable — OPENAI_API_KEY is not configured.' }
  }

  const payload = groups.map((g) => ({
    employee_id: g.employee_id,
    employee_name: g.employee_name,
    note_count: g.note_count,
    authors: g.authors,
    notes: g.notes.map((n) => ({
      id: n.id,
      body: n.body,
      category: n.category,
      date: n.date,
      author_name: n.author_name,
    })),
  }))

  const userContent = [
    'Summarize the following accomplishment notes per employee.',
    'Return JSON: { "employees": [...], "caveats": [...] }',
    '',
    JSON.stringify({ employees: payload }),
  ].join('\n')

  let openaiRes: Response
  try {
    openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
      }),
    })
  } catch {
    return { result: null, error: 'AI summary unavailable — service unreachable.' }
  }

  if (!openaiRes.ok) {
    return { result: null, error: 'AI summary unavailable — service error.' }
  }

  interface OpenAIResponse {
    choices?: Array<{ message?: { content?: string } }>
  }
  const data = (await openaiRes.json().catch(() => null)) as OpenAIResponse | null
  const raw = data?.choices?.[0]?.message?.content
  if (!raw) {
    return { result: null, error: 'AI summary unavailable — empty response.' }
  }

  try {
    const parsed = AiResponseSchema.parse(JSON.parse(raw))
    return { result: parsed, error: null }
  } catch {
    return { result: null, error: 'AI summary unavailable — invalid response format.' }
  }
}

export function assertDigestAccess(session: AdminSession | null): boolean {
  return !!session && canViewAllNotes(session)
}
