/**
 * POST /api/admin/hr/employees/[id]/photo
 *
 * HR-gated headshot upload for an hr_employees row. Gated
 * requireApiRole('hr-tools').
 *
 * REUSES the existing R2 upload mechanism (uploadToR2 + randomStem from
 * lib/r2-upload — the same SigV4 path the employees/signatures/marketing
 * routes use) under a NEW, clean HR key namespace: hr-employees/<stem>.<ext>.
 * Mirrors handleAdminImageUpload's validation (image-only, 10 MB cap).
 *
 * ⚠️ This is a PUBLIC-display headshot → a public R2 URL is the right tool.
 * Do NOT confuse with the hr-onboarding upload route, which stores PRIVATE,
 * non-guessable keys for PII docs (never a display URL).
 *
 * After the R2 PUT, the resulting public URL is persisted to
 * hr_employees.photo_url VIA updateHrEmployee() — NOT a raw write — so the
 * sync-wired path fires and the new photo cascades to linked facets
 * (photo_url is in ACTIVE_SHARED_FIELDS).
 */
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireApiRole } from '@/lib/auth/guards'
import { uploadToR2, randomStem } from '@/lib/r2-upload'
import { updateHrEmployee } from '@/lib/admin-db'

export const runtime = 'nodejs'

const MAX_IMAGE_BYTES = 10 * 1024 * 1024

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole('hr-tools')
  if ('error' in auth) return auth.error

  const { id } = await params
  const idNum = Number(id)
  if (!Number.isInteger(idNum) || idNum <= 0) {
    return NextResponse.json({ error: 'Invalid employee id' }, { status: 400 })
  }

  const { R2_ACCOUNT_ID, R2_BUCKET_NAME, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env
  if (!R2_ACCOUNT_ID || !R2_BUCKET_NAME || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    return NextResponse.json(
      { error: 'R2 storage not configured. Add R2_* env vars to Vercel.' },
      { status: 500 },
    )
  }

  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are accepted' }, { status: 400 })
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 })
    }

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const key = `hr-employees/${randomStem()}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())
    const { url } = await uploadToR2({ buffer, key, contentType: file.type })
    if (!url) {
      return NextResponse.json(
        { error: 'Upload succeeded but no public URL is configured (R2_PUBLIC_URL).' },
        { status: 500 },
      )
    }

    // Persist via the sync-wired update path so photo_url cascades to facets.
    const updated = await updateHrEmployee(idNum, {
      photo_url:  url,
      updated_by: auth.session.username,
    })
    if (!updated) {
      return NextResponse.json({ error: 'Employee not found.' }, { status: 404 })
    }

    revalidatePath('/admin/team/hr')
    revalidatePath(`/admin/team/hr/${idNum}`)

    return NextResponse.json({ success: true, url, key, employee: updated })
  } catch (err) {
    console.error('[hr-employee-photo] upload error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 500 },
    )
  }
}
