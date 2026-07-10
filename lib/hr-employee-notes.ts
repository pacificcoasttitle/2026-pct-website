// ============================================================
// PCT HR — per-employee accomplishment notes (data layer + policy)
//
// The SINGLE source of truth for the notes permission + visibility rules.
// Every security-relevant decision derives ONLY from the verified
// AdminSession — never from client-supplied author / all-flag / filter /
// note_type.
//
// VISIBILITY (server-enforced):
//   - HR (role='hr') and top_level  → see ALL notes for an employee, with
//     author attribution.
//   - An ACTIVE allowlisted author  → sees ONLY their OWN notes
//     (WHERE author_user_id = session.userId).
//   - Everyone else                 → forbidden (cannot view or write).
//
// AUTHORING:
//   - Requires HR/top_level OR an active hr_employee_note_authors row.
//   - author_user_id is ALWAYS session.userId (server-set).
//   - note_type is ALWAYS forced to 'accomplishment' (the only ENABLED
//     type). reprimand/other are reserved in the schema but unreachable.
//
// ⚠️ canViewAllNotes uses role === 'hr' || 'top_level' EXPLICITLY. It does
// NOT use roleCanAccess(..., 'hr-tools') — the manager role resolves to
// 'all' and would wrongly pass that check, letting a manager read every
// author's notes. All-view is intentionally scoped to the HR/admin roles.
// ============================================================

import type { Pool } from 'pg'
import { getPool } from '@/lib/admin-db'
import type { AdminSession } from '@/lib/admin-auth'

/** The only note_type the API/UI will create or list today. */
export const ENABLED_NOTE_TYPES = ['accomplishment'] as const
export type EnabledNoteType = (typeof ENABLED_NOTE_TYPES)[number]
const DEFAULT_NOTE_TYPE: EnabledNoteType = 'accomplishment'

const BODY_MAX_LEN = 4000
const CATEGORY_MAX_LEN = 100

export interface EmployeeNote {
  id:             number
  hr_employee_id: number
  author_user_id: number
  author_name:    string | null // resolved from vcard_admin_users
  note_type:      string
  body:           string
  category:       string | null
  occurred_on:    string | null // ::text (YYYY-MM-DD) or null
  created_at:     string
  updated_at:     string
}

/** Thrown when the caller is not authorized to view/write notes. */
export class NotesForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message)
    this.name = 'NotesForbiddenError'
  }
}

/** Thrown on invalid create input (bad/blank body, bad date, etc.). */
export class NotesValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotesValidationError'
  }
}

// ── Permission helpers ────────────────────────────────────────

/**
 * ⚠️ HR-all view is scoped to role === 'hr' || 'top_level' ONLY. Do NOT
 * substitute roleCanAccess(..., 'hr-tools'): manager='all' would pass and
 * a manager could read all authors' notes.
 */
export function canViewAllNotes(session: AdminSession): boolean {
  return session.role === 'hr' || session.role === 'top_level'
}

/** Is this user an ACTIVE row in the note-authors allowlist? */
export async function isAllowlistedAuthor(userId: number): Promise<boolean> {
  const db = getPool()
  const res = await db.query(
    `SELECT 1 FROM hr_employee_note_authors
      WHERE author_user_id = $1 AND active = TRUE
      LIMIT 1`,
    [userId],
  )
  return res.rows.length > 0
}

/** Can this user AUTHOR notes? HR/top_level, or an active allowlisted author. */
export async function canWriteNotes(session: AdminSession): Promise<boolean> {
  if (canViewAllNotes(session)) return true
  return isAllowlistedAuthor(session.userId)
}

/**
 * Can this user VIEW notes at all (in any scope)? Same set as write:
 * HR/top_level (all) or an active allowlisted author (own only).
 */
export async function canViewAnyNotes(session: AdminSession): Promise<boolean> {
  return canWriteNotes(session)
}

// ── Reads ─────────────────────────────────────────────────────

const NOTE_SELECT = `
  SELECT n.id,
         n.hr_employee_id,
         n.author_user_id,
         COALESCE(
           NULLIF(TRIM(COALESCE(u.first_name,'') || ' ' || COALESCE(u.last_name,'')), ''),
           u.username
         ) AS author_name,
         n.note_type,
         n.body,
         n.category,
         n.occurred_on::text AS occurred_on,
         n.created_at::text  AS created_at,
         n.updated_at::text  AS updated_at
    FROM hr_employee_notes n
    LEFT JOIN vcard_admin_users u ON u.id = n.author_user_id
`

/**
 * Notes for one employee, SCOPED by the verified session:
 *   - canViewAllNotes → all live accomplishment notes (with author name).
 *   - else canWriteNotes (allowlisted) → the SAME, but WHERE author = self.
 *   - else → NotesForbiddenError.
 *
 * ⚠️ Never accepts a client-supplied author/all/filter — the scope derives
 * ONLY from the session.
 */
export async function getEmployeeNotes(
  employeeId: number,
  session: AdminSession,
): Promise<EmployeeNote[]> {
  const db: Pool = getPool()

  if (canViewAllNotes(session)) {
    const res = await db.query(
      `${NOTE_SELECT}
        WHERE n.hr_employee_id = $1
          AND n.deleted_at IS NULL
          AND n.note_type = 'accomplishment'
        ORDER BY n.created_at DESC, n.id DESC`,
      [employeeId],
    )
    return res.rows as EmployeeNote[]
  }

  if (await isAllowlistedAuthor(session.userId)) {
    // ⚠️ Manager-private: their OWN notes only. The author filter is the
    // verified session.userId, NOT anything from the client.
    const res = await db.query(
      `${NOTE_SELECT}
        WHERE n.hr_employee_id = $1
          AND n.author_user_id = $2
          AND n.deleted_at IS NULL
          AND n.note_type = 'accomplishment'
        ORDER BY n.created_at DESC, n.id DESC`,
      [employeeId, session.userId],
    )
    return res.rows as EmployeeNote[]
  }

  throw new NotesForbiddenError('Not authorized to view notes.')
}

// ── Writes ────────────────────────────────────────────────────

export interface CreateEmployeeNoteInput {
  body:         string
  category?:    string | null
  occurred_on?: string | null // YYYY-MM-DD
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Create an accomplishment note.
 *   - Requires canWriteNotes → else NotesForbiddenError.
 *   - author_user_id = session.userId (SERVER-SET).
 *   - note_type FORCED to 'accomplishment' (client note_type ignored).
 *   - Validates the employee exists; body non-blank + <= BODY_MAX_LEN;
 *     category/occurred_on optional + validated.
 */
export async function createEmployeeNote(
  employeeId: number,
  session: AdminSession,
  input: CreateEmployeeNoteInput,
): Promise<EmployeeNote> {
  if (!(await canWriteNotes(session))) {
    throw new NotesForbiddenError('Not authorized to add notes.')
  }

  const body = typeof input.body === 'string' ? input.body.trim() : ''
  if (!body) throw new NotesValidationError('Note body is required.')
  if (body.length > BODY_MAX_LEN) {
    throw new NotesValidationError(`Note is too long (max ${BODY_MAX_LEN} characters).`)
  }

  let category: string | null = null
  if (input.category != null && String(input.category).trim() !== '') {
    category = String(input.category).trim()
    if (category.length > CATEGORY_MAX_LEN) {
      throw new NotesValidationError(`Category is too long (max ${CATEGORY_MAX_LEN} characters).`)
    }
  }

  let occurredOn: string | null = null
  if (input.occurred_on != null && String(input.occurred_on).trim() !== '') {
    occurredOn = String(input.occurred_on).trim()
    if (!DATE_RE.test(occurredOn) || Number.isNaN(new Date(occurredOn).getTime())) {
      throw new NotesValidationError('Date must be a valid YYYY-MM-DD.')
    }
  }

  const db = getPool()

  const exists = await db.query(`SELECT 1 FROM hr_employees WHERE id = $1 LIMIT 1`, [employeeId])
  if (exists.rows.length === 0) {
    throw new NotesValidationError('Employee not found.')
  }

  const inserted = await db.query(
    `INSERT INTO hr_employee_notes
       (hr_employee_id, author_user_id, note_type, body, category, occurred_on)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    // ⚠️ note_type is FORCED here — client-supplied types never reach this.
    [employeeId, session.userId, DEFAULT_NOTE_TYPE, body, category, occurredOn],
  )
  const newId = inserted.rows[0].id as number

  const res = await db.query(`${NOTE_SELECT} WHERE n.id = $1`, [newId])
  return res.rows[0] as EmployeeNote
}
