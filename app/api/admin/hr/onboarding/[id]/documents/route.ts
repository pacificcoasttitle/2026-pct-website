/**
 * GET /api/admin/hr/onboarding/[id]/documents
 *
 * List the document metadata for an onboarding. Gated
 * requireApiRole('hr-tools').
 *
 * ⚠️ PII: returns only safe metadata (id, doc_type, file_name, date).
 * The R2 file_key / any public URL is NEVER included — HR streams the
 * bytes through the gated [docId] route, which resolves the key
 * server-side.
 */
import { NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/auth/guards'
import { getHrOnboardingById, getHrOnboardingDocuments } from '@/lib/admin-db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole('hr-tools')
  if ('error' in auth) return auth.error

  const { id: idRaw } = await params
  const id = parseInt(idRaw, 10)
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid onboarding id' }, { status: 400 })
  }

  const onboarding = await getHrOnboardingById(id)
  if (!onboarding) {
    return NextResponse.json({ error: 'Onboarding not found' }, { status: 404 })
  }

  const documents = await getHrOnboardingDocuments(id)
  return NextResponse.json({ ok: true, documents })
}
