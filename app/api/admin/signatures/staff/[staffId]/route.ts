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
  updateStaffMember,
  deleteStaffMember,
  type StaffMemberInput,
} from '@/lib/admin-db'
import { normalizePhone } from '@/lib/phone-utils'

export const runtime = 'nodejs'

// Partial schema — every field optional, matching Partial<StaffMemberInput>.
// Empty strings on optional fields are coerced to null at the DB layer.
//
// ⚠️ HR-sync Stage 7 (design §5): the SHARED identity fields — first_name,
// last_name, full_legal_name, title, department, email, office_direct,
// cell_phone, office_location, photo_url, license_number, active — are
// managed in HR and are DELIBERATELY NOT in this schema. Zod silently
// drops unknown keys, so even a direct API call carrying a shared field
// cannot write it here; HR is the sole editor and the values flow down via
// the sync. Only the signature SECTION fields below are accepted.
const PatchSchema = z.object({
  fax:             z.string().trim().max(50).nullable().optional(),
  linkedin_url:    z.string().trim().max(500).nullable().optional(),
  instagram_url:   z.string().trim().max(500).nullable().optional(),
  group_email:     z.string().trim().max(200).nullable().optional(),
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

  // Convert empty strings on nullable SECTION fields to actual null so the
  // DB stores nulls (UI checks for null to render "(not set)"). Only the
  // editable section fields survive PatchSchema now — shared fields are
  // dropped by the schema (HR-sync Stage 7).
  const dbInput: Partial<StaffMemberInput> = { ...input }
  const nullableKeys: (keyof StaffMemberInput)[] = [
    'fax', 'linkedin_url', 'instagram_url', 'group_email',
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

  // Normalize the fax phone field when present (matching the import
  // pipeline). office_direct / cell_phone are shared → no longer handled.
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
