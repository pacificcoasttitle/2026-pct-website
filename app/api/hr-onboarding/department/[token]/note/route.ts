/**
 * PATCH /api/hr-onboarding/department/[token]/note
 *
 * Token-gated department note-to-HR save. Auth is ONLY the department
 * token (fail-closed via resolveDepartmentToken). The (onboarding_id,
 * category) target is derived from the resolved token — NEVER the body.
 * Writes only that department-token row's department_note + stamp.
 */
import { NextResponse } from 'next/server'
import { resolveDepartmentToken } from '@/lib/hr-onboarding-token'
import { setHrDepartmentNote } from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_LEN = 2000

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params
  const resolved = await resolveDepartmentToken(token)
  if (!resolved) {
    return NextResponse.json({ error: 'Invalid or expired link.' }, { status: 404 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const raw = body.note == null ? '' : String(body.note)
  if (raw.length > MAX_LEN) {
    return NextResponse.json(
      { error: `Note must be ${MAX_LEN} characters or fewer.` },
      { status: 400 },
    )
  }
  const note = raw.trim()

  const saved = await setHrDepartmentNote(
    resolved.onboarding_id,
    resolved.category,
    note === '' ? null : note,
  )
  if (!saved) {
    return NextResponse.json(
      { error: 'Department link not found.' },
      { status: 404 },
    )
  }

  return NextResponse.json({
    ok: true,
    department_note: saved.department_note,
    department_note_updated_at: saved.department_note_updated_at,
  })
}
