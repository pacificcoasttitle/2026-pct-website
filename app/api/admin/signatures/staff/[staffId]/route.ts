/**
 * /api/admin/signatures/staff/[staffId]
 *
 * PATCH  — update mutable fields on a staff_members row.
 * DELETE — hard-delete a staff_members row.
 *
 * Both methods require an admin session. The PATCH zod schema mirrors
 * StaffMemberInput's mutable subset; office_location is validated against
 * the office_locations table before the UPDATE is issued.
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireApiRole } from '@/lib/auth/guards'
import {
  getStaffMemberById,
  getStaffMemberByEmail,
  getAllOfficeLocations,
  updateStaffMember,
  deleteStaffMember,
  type StaffMemberInput,
} from '@/lib/admin-db'
import { normalizePhone } from '@/lib/phone-utils'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Partial schema — every field optional, matching Partial<StaffMemberInput>.
// Empty strings on optional fields are coerced to null at the DB layer.
const PatchSchema = z.object({
  first_name:      z.string().trim().min(1).max(100).optional(),
  last_name:       z.string().trim().min(1).max(100).optional(),
  full_legal_name: z.string().trim().max(200).nullable().optional(),
  title:           z.string().trim().min(1).max(200).optional(),
  department:      z.string().trim().max(100).nullable().optional(),
  email:           z.string().trim().min(1).max(200).optional(),
  office_direct:   z.string().trim().max(50).nullable().optional(),
  cell_phone:      z.string().trim().max(50).nullable().optional(),
  fax:             z.string().trim().max(50).nullable().optional(),
  office_location: z.string().trim().max(100).nullable().optional(),
  photo_url:       z.string().trim().max(1000).nullable().optional(),
  license_number:  z.string().trim().max(100).nullable().optional(),
  linkedin_url:    z.string().trim().max(500).nullable().optional(),
  instagram_url:   z.string().trim().max(500).nullable().optional(),
  group_email:     z.string().trim().max(200).nullable().optional(),
  active:          z.boolean().optional(),
  part_time:       z.boolean().optional(),
})

function emptyToNull<T extends string | null | undefined>(v: T): string | null {
  if (v === undefined || v === null) return null
  const t = String(v).trim()
  return t === '' ? null : t
}

function parseStaffId(raw: string): number | null {
  const n = parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

/* ─── PATCH ─────────────────────────────────────────────────────── */

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ staffId: string }> },
) {
  const auth = await requireApiRole('signatures')
  if ('error' in auth) return auth.error

  const { staffId: raw } = await params
  const staffId = parseStaffId(raw)
  if (!staffId) {
    return NextResponse.json({ error: 'Invalid staff id' }, { status: 400 })
  }

  let parsed
  try {
    const body = await req.json()
    parsed = PatchSchema.safeParse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 },
    )
  }
  const input = parsed.data

  // Confirm the row exists before we touch anything.
  const existing = await getStaffMemberById(staffId)
  if (!existing) {
    return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
  }

  // Email format + uniqueness check (only when changed).
  if (input.email && input.email.trim().toLowerCase() !== existing.email.toLowerCase()) {
    const normalized = input.email.trim().toLowerCase()
    if (!EMAIL_RE.test(normalized)) {
      return NextResponse.json(
        { error: 'Invalid email format', field: 'email' },
        { status: 400 },
      )
    }
    const collision = await getStaffMemberByEmail(normalized)
    if (collision && collision.id !== staffId) {
      return NextResponse.json(
        { error: `Another staff member already uses ${normalized}`, field: 'email' },
        { status: 409 },
      )
    }
    input.email = normalized
  }

  // Office slug validation (when set to a non-empty value).
  if (input.office_location && input.office_location.trim() !== '') {
    const offices = await getAllOfficeLocations()
    const slugs = new Set(offices.map((o) => o.slug))
    if (!slugs.has(input.office_location)) {
      return NextResponse.json(
        { error: `Office '${input.office_location}' not found`, field: 'office_location' },
        { status: 400 },
      )
    }
  }

  // Convert empty strings on nullable fields to actual null so the DB
  // stores nulls (UI checks for null to render "(not set)").
  const dbInput: Partial<StaffMemberInput> = { ...input }
  const nullableKeys: (keyof StaffMemberInput)[] = [
    'full_legal_name', 'department', 'office_direct', 'cell_phone', 'fax',
    'office_location', 'photo_url', 'license_number', 'linkedin_url',
    'instagram_url', 'group_email',
  ]
  for (const k of nullableKeys) {
    if (k in dbInput) {
      const v = dbInput[k]
      if (typeof v === 'string') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(dbInput as any)[k] = emptyToNull(v)
      }
    }
  }

  // Normalize phone fields when present, matching the CSV import pipeline.
  // Runs AFTER emptyToNull above, so we only touch non-null values and
  // preserve the "user cleared the field → null" contract.
  if (dbInput.office_direct !== undefined && dbInput.office_direct !== null) {
    dbInput.office_direct = normalizePhone(dbInput.office_direct)
  }
  if (dbInput.cell_phone !== undefined && dbInput.cell_phone !== null) {
    dbInput.cell_phone = normalizePhone(dbInput.cell_phone)
  }
  if (dbInput.fax !== undefined && dbInput.fax !== null) {
    dbInput.fax = normalizePhone(dbInput.fax)
  }

  const adminEmail = auth.session.username || 'unknown'

  try {
    const updated = await updateStaffMember(staffId, dbInput, adminEmail)
    if (!updated) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }
    console.log(
      `[staff-patch] admin=${adminEmail} staff_id=${staffId} fields=${Object.keys(input).join(',')}`,
    )
    return NextResponse.json({ staff: updated })
  } catch (err) {
    console.error('[staff-patch] update failed:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

/* ─── DELETE ────────────────────────────────────────────────────── */

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ staffId: string }> },
) {
  const auth = await requireApiRole('signatures')
  if ('error' in auth) return auth.error

  const { staffId: raw } = await params
  const staffId = parseStaffId(raw)
  if (!staffId) {
    return NextResponse.json({ error: 'Invalid staff id' }, { status: 400 })
  }

  const adminEmail = auth.session.username || 'unknown'

  try {
    const deleted = await deleteStaffMember(staffId)
    if (!deleted) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
    }
    console.log(`[staff-delete] admin=${adminEmail} staff_id=${staffId}`)
    return NextResponse.json({ deleted: true, staff_id: staffId })
  } catch (err) {
    console.error('[staff-delete] delete failed:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
