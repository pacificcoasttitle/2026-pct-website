/**
 * POST /api/hr-onboarding/[token]/upload  (multipart)
 *
 * ⚠️ PUBLIC, UNAUTHENTICATED, PII-BEARING upload (gov ID, W-4/SSN,
 * direct-deposit). Modeled on the rep upload SHELL
 * (app/api/onboarding/[token]/upload) — rate-limit → token re-verify →
 * formData → validate → uploadToR2 → metadata write — but HARDENED for
 * PII and WITHOUT the rep route's public-URL / photo-through behavior:
 *
 *   - identity (onboarding_id) from the token-resolved record ONLY
 *   - lock guard: no upload to submitted/finalized/cancelled
 *   - strict validation: size + per-doc-type MIME allowlist + extension
 *     match + MAGIC-BYTE sniff (a .pdf that isn't a PDF is rejected)
 *   - PRIVATE, non-guessable R2 key (random stem — never slug-based)
 *   - stores ONLY result.key (the R2 object key) — NEVER result.url
 *   - writes ONLY hr_onboarding_documents (+ onboarding updated_at);
 *     never hr_employees/vcard/staff; no photo write-through
 *   - generic errors (no PII/internal leak)
 *
 * HR retrieves docs server-side via the hr-tools-gated route
 * (/api/admin/hr/onboarding/[id]/documents/[docId]) using downloadFromR2.
 * The public URL is never stored or exposed to any client.
 */
import { NextResponse } from 'next/server'
import {
  resolveHrOnboardingByToken,
  insertHrOnboardingDocument,
} from '@/lib/admin-db'
import { uploadToR2, R2ConfigError, randomStem } from '@/lib/r2-upload'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB

// HR document types the public caller may upload. 'client_list' is the
// sales-rep contact/client list (spreadsheet or PDF); the wizard shows it
// only for sales_rep onboardings, but the allowlist is enforced here.
// ⚠️ id/tax_form/direct_deposit are RETAINED in the allowlist even though
// the wizard no longer offers those upload tiles. This is intentional: it
// keeps already-uploaded standard docs (from earlier testing) retrievable
// and their labels intact. No new standard uploads happen because the UI
// tiles were removed — the allowlist is a retrieval/back-compat safety net,
// not a new-upload surface.
const DOC_TYPES = new Set(['id', 'tax_form', 'direct_deposit', 'headshot', 'client_list'])

// Doc types valid ONLY on a sales_rep onboarding (server-enforced gate).
const SALES_REP_ONLY_DOC_TYPES = new Set(['headshot', 'client_list'])

// Logical file categories → permitted MIME types.
const DOC_MIME = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/webp'])
const IMAGE_ONLY_MIME = new Set(['image/png', 'image/jpeg', 'image/webp'])
// A client list is a spreadsheet (CSV/XLSX/XLS) or a PDF. NOT an image.
const CLIENT_LIST_MIME = new Set([
  'application/pdf',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
])

function allowedMimeFor(docType: string): Set<string> {
  // headshot is image-only; client_list is spreadsheet/PDF; everything
  // else may be a PDF or an image.
  if (docType === 'headshot') return IMAGE_ONLY_MIME
  if (docType === 'client_list') return CLIENT_LIST_MIME
  return DOC_MIME
}

// Extensions that legitimately pair with each MIME type.
const MIME_EXT: Record<string, string[]> = {
  'application/pdf': ['pdf'],
  'image/png': ['png'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/webp': ['webp'],
  'text/csv': ['csv'],
  'application/vnd.ms-excel': ['xls', 'csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
}

// Rate limit: 10 uploads / minute per (token + IP).
const RL_LIMIT = 10
const RL_WINDOW_MS = 60_000

const INVALID_LINK = 'This link has expired or is invalid. Please contact HR for a new link.'

function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

function sanitizeFilename(name: string): string {
  const base = name.split(/[\\/]/).pop() || 'file'
  return base.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_{2,}/g, '_').slice(0, 120) || 'file'
}

function extOf(name: string): string {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/)
  return m ? m[1] : ''
}

/**
 * Magic-byte sniff: confirm the leading bytes match the claimed MIME.
 * PII-hardening over the rep flow's MIME-only check — a file whose
 * declared type doesn't match its actual signature is rejected.
 */
function magicMatches(mime: string, buf: Buffer, ext: string): boolean {
  if (buf.length < 12) return false
  // A genuine CSV has no binary signature. The no-magic PASS is scoped
  // STRICTLY to a real .csv (by extension) — never granted just because a
  // binary check failed. So a fake .xls (Excel MIME, non-OLE2 bytes) is
  // rejected below rather than slipping through.
  if (ext === 'csv') return true
  switch (mime) {
    case 'application/pdf':
      // %PDF
      return buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46
    case 'image/png':
      // \x89 P N G \r \n \x1a \n
      return (
        buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
        buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
      )
    case 'image/jpeg':
      // FF D8 FF
      return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff
    case 'image/webp':
      // RIFF....WEBP
      return (
        buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
        buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
      )
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      // XLSX is a ZIP container: PK\x03\x04 (or the empty/spanned variants).
      return buf[0] === 0x50 && buf[1] === 0x4b &&
        (buf[2] === 0x03 || buf[2] === 0x05 || buf[2] === 0x07)
    case 'application/vnd.ms-excel':
      // With ext !== 'csv' (handled above), a .xls under this MIME MUST be
      // a genuine OLE2 compound file: D0 CF 11 E0 A1 B1 1A E1. A failed
      // check rejects (a fake .xls no longer passes).
      return (
        buf[0] === 0xd0 && buf[1] === 0xcf && buf[2] === 0x11 && buf[3] === 0xe0 &&
        buf[4] === 0xa1 && buf[5] === 0xb1 && buf[6] === 0x1a && buf[7] === 0xe1
      )
    case 'text/csv':
      // A genuine .csv is handled by the ext==='csv' pass above. Any
      // text/csv MIME reaching here without a .csv extension is rejected.
      return false
    default:
      return false
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params

  // 1. Rate limit FIRST (before any work), keyed by token + IP.
  const rl = rateLimit(`hr-onboarding-upload:${token}:${clientIp(request)}`, RL_LIMIT, RL_WINDOW_MS)
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many uploads. Please wait a moment and try again.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    )
  }

  // 2. RE-VERIFY the token. null = invalid/expired/wrong-purpose/mismatch.
  const record = await resolveHrOnboardingByToken(token)
  if (!record) {
    return NextResponse.json({ ok: false, error: INVALID_LINK }, { status: 410 })
  }

  // 3. Lock guard — can't upload to a submitted/finalized/cancelled record.
  if (!['draft', 'invited', 'in_progress'].includes(record.status)) {
    return NextResponse.json(
      { ok: false, error: 'This onboarding has already been submitted and can no longer be edited.' },
      { status: 409 },
    )
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid upload.' }, { status: 400 })
  }

  // 4. doc_type allowlist + file presence.
  const docType = String(form.get('doc_type') || '').trim()
  if (!DOC_TYPES.has(docType)) {
    return NextResponse.json({ ok: false, error: 'Unknown document type.' }, { status: 400 })
  }

  // 4a. Sales-rep-only doc gating — SERVER-ENFORCED (not just UI). headshot
  // + client_list are only valid on a sales_rep onboarding; standard docs
  // (id/tax_form/direct_deposit) are allowed for any type. The type comes
  // from the token-resolved record, never the body.
  if (SALES_REP_ONLY_DOC_TYPES.has(docType) && record.onboarding_type !== 'sales_rep') {
    return NextResponse.json(
      { ok: false, error: 'This document type is not part of this onboarding.' },
      { status: 403 },
    )
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'File required.' }, { status: 400 })
  }

  // 5. Strict validation (PII).
  if (file.size === 0) {
    return NextResponse.json({ ok: false, error: 'File is empty.' }, { status: 400 })
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { ok: false, error: `File too large (max ${MAX_FILE_SIZE / (1024 * 1024)} MB).` },
      { status: 413 },
    )
  }

  const mime = file.type
  if (!allowedMimeFor(docType).has(mime)) {
    return NextResponse.json(
      { ok: false, error: `Unsupported file type for ${docType}.` },
      { status: 400 },
    )
  }

  // Extension must match the claimed MIME.
  const ext = extOf(file.name)
  if (!ext || !(MIME_EXT[mime] || []).includes(ext)) {
    return NextResponse.json(
      { ok: false, error: 'File extension does not match its type.' },
      { status: 400 },
    )
  }

  // Read bytes once; magic-byte sniff before any storage.
  const buffer = Buffer.from(await file.arrayBuffer())
  if (!magicMatches(mime, buffer, ext)) {
    return NextResponse.json(
      { ok: false, error: 'File contents do not match the declared type.' },
      { status: 400 },
    )
  }

  // 6. PRIVATE, non-guessable key (random stem; scoped to the resolved id).
  const key = `hr-onboarding/${record.id}/${docType}-${randomStem()}.${ext}`

  // 7. Upload. ⚠️ Ignore result.url (public URL) — store ONLY result.key.
  let result
  try {
    result = await uploadToR2({ buffer, key, contentType: mime })
  } catch (err) {
    if (err instanceof R2ConfigError) {
      return NextResponse.json({ ok: false, error: 'Upload storage is not configured.' }, { status: 500 })
    }
    console.error('[hr-onboarding-upload] R2 upload failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ ok: false, error: 'Upload failed. Please try again.' }, { status: 500 })
  }

  // 8. Persist metadata — file_key ONLY (never the public URL). Writes
  //    only hr_onboarding_documents (+ onboarding updated_at).
  try {
    const doc = await insertHrOnboardingDocument({
      onboardingId: record.id,
      docType,
      fileKey: result.key,
      fileName: sanitizeFilename(file.name),
      uploadedBy: 'employee',
    })
    // ⚠️ Response carries NO key/url — only safe display metadata.
    return NextResponse.json({
      ok: true,
      document: {
        id: doc.id,
        doc_type: doc.doc_type,
        file_name: doc.file_name,
        uploaded_at: doc.uploaded_at,
      },
    })
  } catch {
    return NextResponse.json({ ok: false, error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}
