/**
 * POST /api/onboarding/[token]/upload  (multipart)
 *
 * Token-gated rep uploads (Phase 2d). Public endpoint → hardened:
 *   - token re-verified server-side on EVERY call (resolveOnboardingByToken)
 *   - rep_id / slug / onboarding_id come ONLY from the token-resolved record
 *   - per-kind MIME allow-sets + 20 MB size cap
 *   - net-new rate limiter (per token + IP)
 *
 * Kinds:
 *   - headshot    → R2 + asset row + write-through to vcard_employees.photo_url
 *                   (scrubbed { photo_url } only — same discipline as 2c)
 *   - client_list → R2 + asset row, STORE-ONLY. ⚠️ PII: the bytes are
 *                   NEVER opened, parsed, previewed, or transcribed.
 *   - bio         → text only (NOT a file); routed through the same
 *                   allowlisted bio write as 2c + a bio audit asset row.
 *
 * Completion: the 'headshot-bio-client-list' checklist item rolls to
 * in_progress as assets arrive and complete when all three are present.
 *
 * No email (2e).
 */
import { NextResponse } from 'next/server'
import {
  resolveOnboardingByToken,
  getEmployeeAdminById,
  updateEmployee,
  upsertOnboardingAsset,
  getOnboardingAssetKinds,
  setOnboardingItemStatusByKey,
} from '@/lib/admin-db'
import { uploadToR2, R2ConfigError } from '@/lib/r2-upload'
import { rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ITEM_KEY = 'headshot-bio-client-list'

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB
const MAX_BIO_LEN   = 4000

// Hard per-kind MIME allow-sets (public endpoint — allowlist, not deny).
const HEADSHOT_MIME = new Set(['image/png', 'image/jpeg', 'image/webp'])
const CLIENT_LIST_MIME = new Set([
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-excel',                                          // xls
])

// Rate limit: 10 uploads / minute per (token + IP).
const RL_LIMIT     = 10
const RL_WINDOW_MS = 60_000

function sanitizeFilename(name: string): string {
  // Strip any path components + collapse anything unsafe for an R2 key.
  const base = name.split(/[\\/]/).pop() || 'file'
  return base.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_{2,}/g, '_').slice(0, 120) || 'file'
}

function clientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

async function presence(onboardingId: number, photoUrl: string | null, bio: string | null) {
  const kinds = await getOnboardingAssetKinds(onboardingId)
  return {
    headshot:    kinds.includes('headshot') || !!(photoUrl && photoUrl.trim()),
    bio:         kinds.includes('bio')       || !!(bio && bio.trim()),
    client_list: kinds.includes('client_list'),
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params

  // Rate limit FIRST (before any work), keyed by token + IP.
  const rl = rateLimit(`onboarding-upload:${token}:${clientIp(request)}`, RL_LIMIT, RL_WINDOW_MS)
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many uploads. Please wait a moment and try again.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    )
  }

  // Re-verify the token server-side. null = invalid/expired/mismatch.
  const record = await resolveOnboardingByToken(token)
  if (!record) {
    return NextResponse.json(
      { ok: false, error: 'This link has expired or is invalid. Please contact your manager for a new link.' },
      { status: 410 },
    )
  }

  // rep identity from the TOKEN-resolved record ONLY.
  const employee = await getEmployeeAdminById(record.rep_id)
  if (!employee) {
    return NextResponse.json({ ok: false, error: 'Profile not found.' }, { status: 404 })
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid upload.' }, { status: 400 })
  }

  const kind = String(form.get('kind') || '').trim()

  // ── BIO: text only, routed through the 2c allowlisted write ──
  if (kind === 'bio') {
    const raw = form.get('bio')
    if (typeof raw !== 'string') {
      return NextResponse.json({ ok: false, error: 'Bio must be text.' }, { status: 400 })
    }
    const bio = raw.trim()
    if (bio.length > MAX_BIO_LEN) {
      return NextResponse.json({ ok: false, error: 'Bio is too long.' }, { status: 400 })
    }
    await updateEmployee(employee.slug, { bio })            // scrubbed: bio only
    await upsertOnboardingAsset({ onboardingId: record.id, kind: 'bio', text_value: bio })

    const pres = await presence(record.id, employee.photo_url, bio)
    const all  = pres.headshot && pres.bio && pres.client_list
    const result = await setOnboardingItemStatusByKey(record.id, ITEM_KEY, all ? 'complete' : 'in_progress')
    return NextResponse.json({
      ok: true, kind: 'bio', uploaded: true,
      item_status: result?.items.find((i) => i.item_key === ITEM_KEY)?.status ?? null,
      present: pres,
    })
  }

  // ── FILE kinds: headshot | client_list ──
  if (kind !== 'headshot' && kind !== 'client_list') {
    return NextResponse.json({ ok: false, error: 'Unknown upload kind.' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'File required.' }, { status: 400 })
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { ok: false, error: `File too large (max ${MAX_FILE_SIZE / (1024 * 1024)} MB).` },
      { status: 413 },
    )
  }

  const allowed = kind === 'headshot' ? HEADSHOT_MIME : CLIENT_LIST_MIME
  if (!allowed.has(file.type)) {
    return NextResponse.json(
      { ok: false, error: `Unsupported file type '${file.type || 'unknown'}' for ${kind}.` },
      { status: 400 },
    )
  }

  // R2 upload. The client list's bytes are pushed to R2 as opaque
  // bytes — we never read/parse them (PII).
  const safeName = sanitizeFilename(file.name)
  const key = `onboarding/${employee.slug}/${kind}-${safeName}`
  let result
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    result = await uploadToR2({ buffer, key, contentType: file.type })
  } catch (err) {
    if (err instanceof R2ConfigError) {
      return NextResponse.json({ ok: false, error: 'Upload storage is not configured.' }, { status: 500 })
    }
    console.error('[onboarding-upload] R2 upload failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ ok: false, error: 'Upload failed. Please try again.' }, { status: 500 })
  }

  // Persist the asset row (upsert by kind — re-upload replaces).
  await upsertOnboardingAsset({
    onboardingId: record.id,
    kind,
    r2_key:       result.key,
    file_name:    file.name,
    content_type: file.type,
  })

  // HEADSHOT write-through to photo_url — scrubbed { photo_url } only.
  let effectivePhotoUrl = employee.photo_url
  if (kind === 'headshot' && result.url) {
    await updateEmployee(employee.slug, { photo_url: result.url })
    effectivePhotoUrl = result.url
  }

  const pres = await presence(record.id, effectivePhotoUrl, employee.bio)
  const all  = pres.headshot && pres.bio && pres.client_list
  const updated = await setOnboardingItemStatusByKey(record.id, ITEM_KEY, all ? 'complete' : 'in_progress')

  return NextResponse.json({
    ok: true,
    kind,
    uploaded: true,
    item_status: updated?.items.find((i) => i.item_key === ITEM_KEY)?.status ?? null,
    present: pres,
    ...(kind === 'headshot' && result.url ? { photo_url: result.url } : {}),
    ...(kind === 'client_list' ? { file_name: file.name } : {}),
  })
}
