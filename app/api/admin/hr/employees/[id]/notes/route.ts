/**
 * GET  /api/admin/hr/employees/[id]/notes  — list notes (session-scoped)
 * POST /api/admin/hr/employees/[id]/notes  — add an accomplishment note
 *
 * ⚠️ EVERYTHING security-relevant derives from the verified AdminSession:
 *   - Visibility (all vs own-only) is decided server-side in
 *     getEmployeeNotes — the route NEVER trusts a client author/all/filter.
 *   - On POST, author_user_id = session.userId and note_type is forced to
 *     'accomplishment' inside createEmployeeNote — the body's author/type
 *     are ignored.
 *
 * Auth model (deliberately NOT requireApiRole('hr-tools'), which the
 * manager='all' role would pass): we take the raw session and let the
 * notes policy layer decide. Non-allowlisted, non-HR users get 403.
 */
import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth/guards'
import {
  getEmployeeNotes,
  createEmployeeNote,
  NotesForbiddenError,
  NotesValidationError,
} from '@/lib/hr-employee-notes'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function parseId(id: string): number | null {
  const n = Number(id)
  return Number.isInteger(n) && n > 0 ? n : null
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const employeeId = parseId(id)
  if (employeeId === null) {
    return NextResponse.json({ error: 'Invalid employee id' }, { status: 400 })
  }

  try {
    const notes = await getEmployeeNotes(employeeId, session)
    return NextResponse.json({ ok: true, notes })
  } catch (err) {
    if (err instanceof NotesForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('GET employee notes failed:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const employeeId = parseId(id)
  if (employeeId === null) {
    return NextResponse.json({ error: 'Invalid employee id' }, { status: 400 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  try {
    // ⚠️ Only body/category/occurred_on are read. Any client-supplied
    // author_user_id / note_type is NOT passed through — the policy layer
    // sets author = session.userId and forces type = 'accomplishment'.
    const note = await createEmployeeNote(employeeId, session, {
      body: typeof body.body === 'string' ? body.body : '',
      category: typeof body.category === 'string' ? body.category : null,
      occurred_on: typeof body.occurred_on === 'string' ? body.occurred_on : null,
    })
    return NextResponse.json({ ok: true, note }, { status: 201 })
  } catch (err) {
    if (err instanceof NotesForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (err instanceof NotesValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    console.error('POST employee note failed:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
