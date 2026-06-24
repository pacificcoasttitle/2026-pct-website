/**
 * GET /api/admin/hr/onboarding/[id]/documents/[docId]
 *
 * AUTHENTICATED HR document retrieval. Gated requireApiRole('hr-tools').
 *
 * ⚠️ PII: the file lives in R2 under a PRIVATE key. The browser gets the
 * bytes FROM THIS authenticated route via server-side downloadFromR2 —
 * the public R2 URL is NEVER exposed to any client. The doc row is
 * verified to belong to the given onboarding id (no cross-access).
 *
 * ?download=1 forces an attachment disposition; default is inline.
 */
import { NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/auth/guards'
import { getHrOnboardingDocument } from '@/lib/admin-db'
import { downloadFromR2, R2ConfigError } from '@/lib/r2-upload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Map stored R2 key extension → response Content-Type. (We control the
// key format on upload, so the extension is trustworthy here.)
const EXT_CONTENT_TYPE: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
}

function contentTypeForKey(key: string): string {
  const m = key.toLowerCase().match(/\.([a-z0-9]+)$/)
  const ext = m ? m[1] : ''
  return EXT_CONTENT_TYPE[ext] || 'application/octet-stream'
}

function sanitizeDownloadName(name: string | null, fallback: string): string {
  const base = (name || fallback).split(/[\\/]/).pop() || fallback
  // Strip quotes/newlines so it's safe inside a Content-Disposition header.
  return base.replace(/["\r\n]/g, '_').slice(0, 200) || fallback
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; docId: string }> },
) {
  const auth = await requireApiRole('hr-tools')
  if ('error' in auth) return auth.error

  const { id: idRaw, docId: docIdRaw } = await params
  const id = parseInt(idRaw, 10)
  const docId = parseInt(docIdRaw, 10)
  if (!Number.isFinite(id) || id <= 0 || !Number.isFinite(docId) || docId <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  // Verify the doc belongs to THIS onboarding (no cross-access).
  const doc = await getHrOnboardingDocument(id, docId)
  if (!doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  let bytes: Buffer
  try {
    // ⚠️ Server-side authenticated GET — the public URL is never used.
    bytes = await downloadFromR2(doc.file_key)
  } catch (err) {
    if (err instanceof R2ConfigError) {
      return NextResponse.json({ error: 'Storage is not configured.' }, { status: 500 })
    }
    console.error('[hr-doc-retrieve] R2 download failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Could not retrieve the document.' }, { status: 502 })
  }

  const url = new URL(request.url)
  const disposition = url.searchParams.get('download') === '1' ? 'attachment' : 'inline'
  const filename = sanitizeDownloadName(doc.file_name, `${doc.doc_type}-${doc.id}`)

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      'Content-Type': contentTypeForKey(doc.file_key),
      'Content-Disposition': `${disposition}; filename="${filename}"`,
      'Content-Length': String(bytes.length),
      // Private PII — never cache anywhere.
      'Cache-Control': 'private, no-store, max-age=0',
    },
  })
}
