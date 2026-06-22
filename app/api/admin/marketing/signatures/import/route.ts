import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireApiRole } from '@/lib/auth/guards'
import {
  getAllOfficeLocations,
  getStaffMemberByEmail,
  bulkCreateStaffMembers,
  type StaffMemberInput,
} from '@/lib/admin-db'
import { normalizePhone } from '@/lib/phone-utils'

export const runtime = 'nodejs'

const MAX_ROWS = 500

/* ─── Zod schema ───────────────────────────────────────────────── */

const RowSchema = z.object({
  first_name:       z.string().trim().min(1, 'first_name is required').max(100),
  last_name:        z.string().trim().min(1, 'last_name is required').max(100),
  full_legal_name:  z.string().trim().max(200).optional().or(z.literal('')),
  title:            z.string().trim().min(1, 'title is required').max(200),
  department:       z.string().trim().max(100).optional().or(z.literal('')),
  email:            z.string().trim().min(1, 'email is required'),
  office_direct:    z.string().trim().max(50).optional().or(z.literal('')),
  cell_phone:       z.string().trim().max(50).optional().or(z.literal('')),
  fax:              z.string().trim().max(50).optional().or(z.literal('')),
  office_location:  z.string().trim().max(100).optional().or(z.literal('')),
  license_number:   z.string().trim().max(100).optional().or(z.literal('')),
  linkedin_url:     z.string().trim().max(500).optional().or(z.literal('')),
  instagram_url:    z.string().trim().max(500).optional().or(z.literal('')),
  group_email:      z.string().trim().max(200).optional().or(z.literal('')),
  active:           z.boolean().optional(),
  part_time:        z.boolean().optional(),
})

const BodySchema = z.object({
  mode: z.enum(['preview', 'commit']),
  rows: z.array(RowSchema).min(1).max(MAX_ROWS),
})

/* ─── Helpers ──────────────────────────────────────────────────── */

// RFC-5322-lite. Avoids false negatives on common addresses without going overboard.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase()
}

// normalizePhone now lives in @/lib/phone-utils (shared with PATCH route).
// Wrapper that preserves the "empty → null" contract this route's
// StaffMemberInput expects, since the shared helper returns "" for empty.
function normalizePhoneOrNull(raw: string | undefined | null): string | null {
  const out = normalizePhone(raw)
  return out === '' ? null : out
}

function emptyToNull(v: string | undefined): string | null {
  if (v === undefined || v === null) return null
  const t = String(v).trim()
  return t === '' ? null : t
}

/* ─── POST handler ─────────────────────────────────────────────── */

interface ValidationError {
  row_number: number
  email: string | null
  field: string
  error: string
}

export async function POST(req: NextRequest) {
  const auth = await requireApiRole('signatures')
  if ('error' in auth) return auth.error

  let parsed
  try {
    const raw = await req.json()
    parsed = BodySchema.safeParse(raw)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { mode, rows } = parsed.data
  const adminEmail = auth.session.username || 'unknown'

  /* ── 1. Load valid office slugs once ──────────────────────────── */
  let validOfficeSlugs: Set<string>
  try {
    const offices = await getAllOfficeLocations()
    validOfficeSlugs = new Set(offices.map((o) => o.slug))
  } catch (err) {
    console.error('[csv-import] failed to load office_locations:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  /* ── 2. Per-row validation + normalization ────────────────────── */
  const validationErrors: ValidationError[] = []
  const invalidOfficeLocations = new Set<string>()
  const emailCounts = new Map<string, number>()

  interface PreparedRow {
    rowNumber: number
    email: string
    input: StaffMemberInput
  }
  const prepared: PreparedRow[] = []
  const invalidRowNumbers = new Set<number>()

  for (let i = 0; i < rows.length; i++) {
    const rowNumber = i + 1
    const r = rows[i]
    let rowHasError = false

    const email = normalizeEmail(r.email || '')
    if (!email) {
      validationErrors.push({ row_number: rowNumber, email: null, field: 'email', error: 'email is required' })
      rowHasError = true
    } else if (!EMAIL_RE.test(email)) {
      validationErrors.push({ row_number: rowNumber, email, field: 'email', error: 'Invalid email format' })
      rowHasError = true
    }

    if (email) emailCounts.set(email, (emailCounts.get(email) || 0) + 1)

    const officeSlug = emptyToNull(r.office_location)
    if (officeSlug && !validOfficeSlugs.has(officeSlug)) {
      validationErrors.push({
        row_number: rowNumber,
        email: email || null,
        field: 'office_location',
        error: `Office '${officeSlug}' not found`,
      })
      invalidOfficeLocations.add(officeSlug)
      rowHasError = true
    }

    if (rowHasError) {
      invalidRowNumbers.add(rowNumber)
      continue
    }

    prepared.push({
      rowNumber,
      email,
      input: {
        first_name:      r.first_name.trim(),
        last_name:       r.last_name.trim(),
        full_legal_name: emptyToNull(r.full_legal_name),
        title:           r.title.trim(),
        department:      emptyToNull(r.department),
        email,
        office_direct:   normalizePhoneOrNull(r.office_direct),
        cell_phone:      normalizePhoneOrNull(r.cell_phone),
        fax:             normalizePhoneOrNull(r.fax),
        office_location: officeSlug,
        license_number:  emptyToNull(r.license_number),
        linkedin_url:    emptyToNull(r.linkedin_url),
        instagram_url:   emptyToNull(r.instagram_url),
        group_email:     emptyToNull(r.group_email),
        active:          r.active ?? true,
        part_time:       r.part_time ?? false,
      },
    })
  }

  /* ── 3. Duplicate detection (within batch) ────────────────────── */
  const duplicateEmailsInBatch = Array.from(emailCounts.entries())
    .filter(([, count]) => count > 1)
    .map(([email]) => email)

  /* ── 4. Conflict detection (already in DB) ────────────────────── */
  const uniqueEmails = Array.from(new Set(prepared.map((p) => p.email)))
  const emailsAlreadyInDb: string[] = []
  try {
    const existing = await Promise.all(
      uniqueEmails.map(async (e) => ({ email: e, found: await getStaffMemberByEmail(e) }))
    )
    for (const e of existing) {
      if (e.found) emailsAlreadyInDb.push(e.email)
    }
  } catch (err) {
    console.error('[csv-import] failed checking existing emails:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  const totalRows  = rows.length
  const validRows  = prepared.length
  const invalid    = invalidRowNumbers.size

  const baseResponse = {
    mode,
    total_rows:                 totalRows,
    valid_rows:                 validRows,
    invalid_rows:               invalid,
    duplicate_emails_in_batch:  duplicateEmailsInBatch,
    emails_already_in_db:       emailsAlreadyInDb,
    validation_errors:          validationErrors,
    invalid_office_locations:   Array.from(invalidOfficeLocations),
  }

  /* ── 5. Preview short-circuits here ───────────────────────────── */
  if (mode === 'preview') {
    console.log(
      `[csv-import] admin=${adminEmail} mode=preview total=${totalRows} valid=${validRows} imported=0`
    )
    return NextResponse.json(baseResponse)
  }

  /* ── 6. Commit: import valid rows ─────────────────────────────── */
  // Note: bulkCreateStaffMembers uses ON CONFLICT (email) DO UPDATE — so
  // emails already in DB become updates, not inserts.
  if (prepared.length === 0) {
    console.log(
      `[csv-import] admin=${adminEmail} mode=commit total=${totalRows} valid=0 imported=0`
    )
    return NextResponse.json({
      ...baseResponse,
      imported: 0,
      updated:  0,
      failed:   0,
      errors:   [],
    })
  }

  let importResult: { created: number; errors: Array<{ row: number; error: string }> }
  try {
    importResult = await bulkCreateStaffMembers(
      prepared.map((p) => p.input),
      adminEmail
    )
  } catch (err) {
    console.error('[csv-import] bulk insert failed:', err)
    return NextResponse.json({ error: 'Database error during import' }, { status: 500 })
  }

  // The bulk fn's row indices are 1-indexed within the `prepared` array.
  // Translate back to original CSV row numbers for the caller.
  const importErrors = importResult.errors.map((e) => ({
    row_number: prepared[e.row - 1]?.rowNumber ?? e.row,
    error:      e.error,
  }))

  const updated  = prepared.filter((p) => emailsAlreadyInDb.includes(p.email)).length
  const inserted = Math.max(0, importResult.created - updated)

  console.log(
    `[csv-import] admin=${adminEmail} mode=commit total=${totalRows} valid=${validRows} imported=${importResult.created}`
  )

  return NextResponse.json({
    ...baseResponse,
    imported: inserted,
    updated,
    failed:   importErrors.length,
    errors:   importErrors,
  })
}
