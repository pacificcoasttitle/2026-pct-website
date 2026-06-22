/**
 * /api/admin/marketing/asset-delivery/upload
 *
 * POST   — multipart upload of a single file into a batch's R2 folder.
 * DELETE — remove a single file (R2 + DB row + decrement batch counts).
 *
 * Filename convention enforced:
 *   C-<n>[-<firstname>].{ext}
 *
 *   - C-<n>             active vcard_employees.sms_code (case-insensitive,
 *                       dash optional: C-28, C28, c-28 all valid). For
 *                       team codes (multiple reps share a code, e.g. C-4)
 *                       this resolves to the lowest-id active holder
 *                       (the "senior team rep") — delivery uses that
 *                       rep's email, which is typically the shared team
 *                       inbox (e.g. teamlopez@pct.com for C-4). This is
 *                       the WHOLE basename now — no campaign-slug prefix,
 *                       no format suffix, no '__' delimiter.
 *   - [-<firstname>]    optional, validation-only. If present and it
 *                       doesn't match the matched rep's first_name we
 *                       log a structured warning but ACCEPT the upload.
 *                       Hyphens allowed in the name suffix for compound
 *                       names (-mary-jane).
 *   - {ext}             .pdf → always classified 'flyer'. .png/.jpg/.jpeg
 *                       → image; the specific format (social /
 *                       social-story / email-insert) is DERIVED from a
 *                       single batch-level picker the client sends as the
 *                       `image_format` field (not read from the filename).
 *
 * The old long grammar ({slug}__C-<n>__{format}.ext) is RETIRED — there
 * is no backward-compat path. The campaign_slug was vestigial in the
 * filename (only asserted == batch.campaign_slug, never stored, never in
 * the R2 key); it stays as a batch COLUMN but is gone from the filename.
 *
 * Bulk uploads: the UI calls POST once per file. 21 reps × 3 formats =
 * 63 sequential requests with client-side concurrency throttling. Keeps
 * server-side handling simple and lets the UI retry individual failures.
 */
import { NextRequest, NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/auth/guards'
import {
  getAssetDeliveryBatchById,
  getFilesByBatchId,
  addAssetDeliveryFile,
  getAssetDeliveryFileById,
  deleteAssetDeliveryFile,
  incrementBatchCounts,
  getEmployeeBySmsCode,
} from '@/lib/admin-db'
import { uploadToR2, deleteFromR2, R2ConfigError } from '@/lib/r2-upload'

export const runtime = 'nodejs'

/* ─── Constants ────────────────────────────────────────────────── */

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20 MB
const ALLOWED_MIME  = new Set(['application/pdf', 'image/png', 'image/jpeg'])
// Image extensions and the three image formats the batch-level picker
// offers. PDFs are always 'flyer' (no picker, no ambiguity) — we no
// longer distinguish flyer vs print on upload.
const IMAGE_EXTS     = new Set(['png', 'jpg', 'jpeg'])
const IMAGE_FORMATS  = new Set(['social', 'social-story', 'email-insert'])
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const TERMINAL_BATCH_STATUSES = new Set(['sent', 'sending'])

/**
 * Parse the middle filename segment as an SMS code with optional
 * firstname suffix. Returns the normalized code ('C-<n>' uppercase)
 * plus the lowercased name suffix when present.
 *
 * Accepted forms: 'C-28', 'C28', 'c-28', 'C-28-jerry', 'c4-mary-jane'.
 * Rejects: '', 'ghernandez', '28', 'CC-1'.
 */
const SMS_CODE_RE = /^c-?(\d+)(?:-([a-z0-9-]+))?$/i

function parseSmsCodeSegment(segment: string): { code: string; nameSuffix: string | null } | null {
  const m = segment.match(SMS_CODE_RE)
  if (!m) return null
  return {
    code:       `C-${m[1]}`,
    nameSuffix: m[2] ? m[2].toLowerCase() : null,
  }
}

/* ─── POST ─────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  const auth = await requireApiRole('asset-delivery')
  if ('error' in auth) return auth.error
  const adminEmail = auth.session.username || 'unknown'

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

  /* 4. Filename parse (short grammar: C-<n>[-<name>].ext).
     The basename IS the rep-code segment — no slug, no format segment,
     no '__' delimiter. Reuse the existing SMS-code regex on the whole
     basename. */
  const filename = file.name
  const extMatch = filename.match(/\.([^.]+)$/)
  const ext      = extMatch ? extMatch[1].toLowerCase() : ''
  const baseName = extMatch ? filename.slice(0, -extMatch[0].length) : filename

  const parsed = parseSmsCodeSegment(baseName)
  if (!parsed) {
    return NextResponse.json(
      { error: 'Filename must be C-<rep#>.<ext> (e.g. C-28.pdf or C-28-jane.jpg)' },
      { status: 400 },
    )
  }
  const { code: normalizedCode, nameSuffix } = parsed

  /* 4b. Derive format from the extension (+ batch-level picker for
     images). PDF is always a flyer; PNG/JPG/JPEG take the image_format
     the client sends from the single batch-level picker. */
  let format: string
  if (ext === 'pdf') {
    format = 'flyer'
  } else if (IMAGE_EXTS.has(ext)) {
    const imageFormat = String(form.get('image_format') || '').trim()
    if (!IMAGE_FORMATS.has(imageFormat)) {
      return NextResponse.json(
        {
          error:
            `Image uploads require an image_format of 'social', 'social-story', or ` +
            `'email-insert' (got '${imageFormat || 'none'}').`,
        },
        { status: 400 },
      )
    }
    format = imageFormat
  } else {
    return NextResponse.json(
      { error: `Unsupported file type: .${ext || 'unknown'}` },
      { status: 400 },
    )
  }

  /* 5. Look up rep by sms_code (resolution UNCHANGED). */

  let rep:
    | {
        id:         number
        first_name: string
        last_name:  string
        name:       string
        email:      string
        slug:       string
        sms_code:   string
      }
    | null = null
  try {
    const found = await getEmployeeBySmsCode(normalizedCode)
    if (found && found.email) {
      rep = {
        id:         found.id,
        first_name: found.first_name,
        last_name:  found.last_name,
        name:       found.name,
        email:      found.email,
        slug:       found.slug,
        sms_code:   found.sms_code,
      }
    }
  } catch (err) {
    console.error('[asset-upload] rep lookup failed:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (!rep) {
    return NextResponse.json(
      {
        error:
          `No active rep found for code ${normalizedCode}. Valid codes can be seen in ` +
          `the admin Team page or SMS Studio. Check that the rep is active and has an ` +
          `sms_code assigned.`,
      },
      { status: 400 },
    )
  }

  /* 5b. Non-blocking name-suffix mismatch warning. */
  if (nameSuffix && nameSuffix !== rep.first_name.toLowerCase()) {
    // Observability only. No vendor_api_logs table exists in this
    // codebase, so we log structured JSON to stdout — matches the
    // pattern used elsewhere in this route.
    console.warn('[asset-upload] name_suffix_does_not_match_rep_first_name', JSON.stringify({
      vendor:             'asset_delivery',
      operation:          'name_mismatch_warning',
      filename:           filename,
      parsed_code:        normalizedCode,
      parsed_name:        nameSuffix,
      matched_rep_id:     rep.id,
      matched_first_name: rep.first_name,
      matched_sms_code:   rep.sms_code,
    }))
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
  const auth = await requireApiRole('asset-delivery')
  if ('error' in auth) return auth.error
  const adminEmail = auth.session.username || 'unknown'

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
