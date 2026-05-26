/**
 * /api/admin/marketing/asset-delivery/upload
 *
 * POST   — multipart upload of a single file into a batch's R2 folder.
 * DELETE — remove a single file (R2 + DB row + decrement batch counts).
 *
 * Filename convention enforced:
 *   {campaign-slug}__{rep-prefix}__{format}.{ext}
 *
 *   - {campaign-slug}   must match the batch's campaign_slug
 *   - {rep-prefix}      must match the local-part of an active
 *                       vcard_employees.email (case-insensitive)
 *   - {format}          one of: flyer, social, social-story,
 *                       email-insert, print
 *   - {ext}             format-specific (pdf for flyer/print, png/jpg
 *                       for social/social-story/email-insert)
 *
 * Bulk uploads: the UI calls POST once per file. 21 reps × 3 formats =
 * 63 sequential requests with client-side concurrency throttling. Keeps
 * server-side handling simple and lets the UI retry individual failures.
 */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isAuthenticated, verifyAdminToken, ADMIN_COOKIE } from '@/lib/admin-auth'
import {
  getPool,
  getAssetDeliveryBatchById,
  getFilesByBatchId,
  addAssetDeliveryFile,
  getAssetDeliveryFileById,
  deleteAssetDeliveryFile,
  incrementBatchCounts,
} from '@/lib/admin-db'
import { uploadToR2, deleteFromR2, R2ConfigError } from '@/lib/r2-upload'

export const runtime = 'nodejs'

/* ─── Constants ────────────────────────────────────────────────── */

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB
const ALLOWED_MIME  = new Set(['application/pdf', 'image/png', 'image/jpeg'])
const ALLOWED_FORMATS = new Set([
  'flyer',
  'social',
  'social-story',
  'email-insert',
  'print',
])
const FORMAT_EXT_RULES: Record<string, { exts: string[]; label: string }> = {
  flyer:          { exts: ['pdf'],                label: 'PDF' },
  print:          { exts: ['pdf'],                label: 'PDF' },
  social:         { exts: ['png', 'jpg', 'jpeg'], label: 'PNG or JPG' },
  'social-story': { exts: ['png', 'jpg', 'jpeg'], label: 'PNG or JPG' },
  'email-insert': { exts: ['png', 'jpg', 'jpeg'], label: 'PNG or JPG' },
}
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const TERMINAL_BATCH_STATUSES = new Set(['sent', 'sending'])

/* ─── Auth helper ──────────────────────────────────────────────── */

async function getActorEmail(): Promise<string> {
  try {
    const jar = await cookies()
    const token = jar.get(ADMIN_COOKIE)?.value
    if (!token) return 'unknown'
    const session = await verifyAdminToken(token)
    return session?.username || 'unknown'
  } catch {
    return 'unknown'
  }
}

/* ─── POST ─────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const adminEmail = await getActorEmail()

  /* 1. Parse multipart body. */
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid multipart body' }, { status: 400 })
  }

  const file    = form.get('file')
  const batchId = String(form.get('batchId') || '').trim()

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File required' }, { status: 400 })
  }
  if (!batchId) {
    return NextResponse.json({ error: 'batchId required' }, { status: 400 })
  }
  if (!UUID_RE.test(batchId)) {
    return NextResponse.json({ error: 'batchId must be a UUID' }, { status: 400 })
  }

  /* 2. File size + type allowlist. */
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File too large (max ${MAX_FILE_SIZE / (1024 * 1024)} MB)` },
      { status: 400 },
    )
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type '${file.type || 'unknown'}'. Allowed: PDF, PNG, JPG.` },
      { status: 400 },
    )
  }

  /* 3. Batch lookup + status guard. */
  const batch = await getAssetDeliveryBatchById(batchId)
  if (!batch) {
    return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
  }
  if (TERMINAL_BATCH_STATUSES.has(batch.status)) {
    return NextResponse.json(
      { error: `Cannot add files to a batch that's already ${batch.status}` },
      { status: 400 },
    )
  }

  /* 4. Filename parse + validate. */
  const filename = file.name
  const extMatch = filename.match(/\.([^.]+)$/)
  const ext      = extMatch ? extMatch[1].toLowerCase() : ''
  const baseName = extMatch ? filename.slice(0, -extMatch[0].length) : filename
  const parts    = baseName.split('__')

  if (parts.length !== 3 || parts.some((p) => p.trim() === '')) {
    return NextResponse.json(
      {
        error:
          'Filename must be in format: {campaign-slug}__{rep-prefix}__{format}.{ext}',
      },
      { status: 400 },
    )
  }

  const [slug, repPrefix, format] = parts

  if (slug !== batch.campaign_slug) {
    return NextResponse.json(
      {
        error: `Filename slug '${slug}' doesn't match batch campaign '${batch.campaign_slug}'`,
      },
      { status: 400 },
    )
  }

  if (!ALLOWED_FORMATS.has(format)) {
    return NextResponse.json(
      {
        error: `Unknown format '${format}'. Valid formats: flyer, social, social-story, email-insert, print`,
      },
      { status: 400 },
    )
  }

  const extRule = FORMAT_EXT_RULES[format]
  if (!extRule.exts.includes(ext)) {
    return NextResponse.json(
      { error: `Format '${format}' requires ${extRule.label} file, got '${ext || 'unknown'}'` },
      { status: 400 },
    )
  }

  /* 5. Rep lookup via vcard_employees email local-part. */
  let rep: { id: number; name: string; email: string; slug: string } | null = null
  try {
    const db  = getPool()
    const res = await db.query(
      `SELECT id, name, email, slug
         FROM vcard_employees
        WHERE LOWER(SPLIT_PART(email, '@', 1)) = LOWER($1)
          AND active = true
        LIMIT 1`,
      [repPrefix],
    )
    rep = res.rows[0] || null
  } catch (err) {
    console.error('[asset-upload] rep lookup failed:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (!rep) {
    return NextResponse.json(
      { error: `No active rep found with email prefix '${repPrefix}'` },
      { status: 400 },
    )
  }

  /* 6. Duplicate check (same rep + same format already in batch). */
  let existingFiles
  try {
    existingFiles = await getFilesByBatchId(batchId)
  } catch (err) {
    console.error('[asset-upload] batch file lookup failed:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  const duplicate = existingFiles.find(
    (f) =>
      f.rep_email.toLowerCase() === rep!.email.toLowerCase() &&
      f.format === format,
  )
  if (duplicate) {
    return NextResponse.json(
      {
        error: `Duplicate: ${rep.name} already has a ${format} file in this batch. Delete the old one first or use a different format.`,
      },
      { status: 409 },
    )
  }

  /* 7. Upload to R2. */
  const key = `asset-delivery/${batchId}/${filename}`
  let uploadResult
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    uploadResult = await uploadToR2({ buffer, key, contentType: file.type })
  } catch (err) {
    if (err instanceof R2ConfigError) {
      console.error('[asset-upload]', err.message)
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    console.error('[asset-upload] R2 upload failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'R2 upload failed' },
      { status: 500 },
    )
  }

  /* 8. Insert file row. If this fails, best-effort delete the orphan. */
  let fileRow
  try {
    fileRow = await addAssetDeliveryFile({
      batch_id:          batchId,
      rep_email:         rep.email.toLowerCase(),
      format,
      original_filename: filename,
      r2_key:            uploadResult.key,
      r2_url:            uploadResult.url,
      file_size_bytes:   uploadResult.size,
      mime_type:         file.type,
    })
  } catch (err) {
    console.error('[asset-upload] DB insert failed; attempting R2 rollback:', err)
    try {
      await deleteFromR2(uploadResult.key)
    } catch (rollbackErr) {
      console.warn('[asset-upload] R2 rollback failed (orphan object):', rollbackErr)
    }
    return NextResponse.json({ error: 'Database error during file insert' }, { status: 500 })
  }

  /* 9. Increment batch counts (non-fatal). */
  try {
    await incrementBatchCounts(batchId, 1, uploadResult.size, adminEmail)
  } catch (err) {
    console.warn('[asset-upload] count increment failed (file still recorded):', err)
  }

  console.log(
    `[asset-upload] admin=${adminEmail} batch=${batchId} rep=${rep.email} format=${format} size=${uploadResult.size}`,
  )

  return NextResponse.json({
    file_id:           fileRow.id,
    batch_id:          batchId,
    rep_email:         rep.email,
    rep_name:          rep.name,
    format,
    original_filename: filename,
    r2_url:            uploadResult.url,
    file_size_bytes:   uploadResult.size,
  })
}

/* ─── DELETE ───────────────────────────────────────────────────── */

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const adminEmail = await getActorEmail()

  const fileIdRaw = req.nextUrl.searchParams.get('fileId')
  const fileId    = fileIdRaw ? parseInt(fileIdRaw, 10) : NaN
  if (!Number.isFinite(fileId) || fileId <= 0) {
    return NextResponse.json({ error: 'Invalid fileId' }, { status: 400 })
  }

  const fileRow = await getAssetDeliveryFileById(fileId)
  if (!fileRow) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const batch = await getAssetDeliveryBatchById(fileRow.batch_id)
  if (!batch) {
    // Shouldn't happen — files cascade with batches — but be defensive.
    return NextResponse.json({ error: 'Parent batch not found' }, { status: 404 })
  }
  if (TERMINAL_BATCH_STATUSES.has(batch.status)) {
    return NextResponse.json(
      { error: `Cannot remove files from a batch that's already ${batch.status}` },
      { status: 400 },
    )
  }

  /* R2 delete — non-fatal. Orphans get reaped by a separate sweep job. */
  try {
    await deleteFromR2(fileRow.r2_key)
  } catch (err) {
    console.warn('[asset-upload-delete] R2 delete failed (continuing):', err)
  }

  try {
    const deleted = await deleteAssetDeliveryFile(fileId)
    if (!deleted) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }
  } catch (err) {
    console.error('[asset-upload-delete] DB delete failed:', err)
    return NextResponse.json({ error: 'Database error during file delete' }, { status: 500 })
  }

  try {
    await incrementBatchCounts(
      fileRow.batch_id,
      -1,
      -fileRow.file_size_bytes,
      adminEmail,
    )
  } catch (err) {
    console.warn('[asset-upload-delete] count decrement failed:', err)
  }

  console.log(
    `[asset-upload-delete] admin=${adminEmail} batch=${fileRow.batch_id} file_id=${fileId} rep=${fileRow.rep_email} format=${fileRow.format}`,
  )

  return NextResponse.json({ deleted: true, file_id: fileId })
}
