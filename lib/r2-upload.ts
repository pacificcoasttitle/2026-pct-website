/**
 * Shared Cloudflare R2 upload + delete helpers.
 *
 * Uses the R2 S3-compatible API with AWS Sig V4 signing — no SDK
 * dependency, just Node's crypto + fetch. Extracted from the original
 * inline implementation in `app/api/admin/upload/route.ts` so additional
 * upload endpoints (asset-delivery, etc.) can reuse the same code path
 * without duplication.
 *
 * Required environment variables (server-side only):
 *   R2_ACCOUNT_ID        — Cloudflare account ID
 *   R2_BUCKET_NAME       — bucket name (e.g. pct-files)
 *   R2_ACCESS_KEY_ID     — R2 API token access key
 *   R2_SECRET_ACCESS_KEY — R2 API token secret
 *   R2_PUBLIC_URL        — public base URL (e.g. https://pub-xxx.r2.dev)
 */
import { createHash, createHmac } from 'crypto'

export interface R2UploadOptions {
  buffer:      Buffer
  /** Object key, e.g. "asset-delivery/batch-uuid/file.pdf" — no leading slash. */
  key:         string
  contentType: string
}

export interface R2UploadResult {
  /** Public CDN URL. Empty string when R2_PUBLIC_URL is unset. */
  url:  string
  key:  string
  size: number
}

export class R2ConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'R2ConfigError'
  }
}

/* ─── SigV4 helpers ────────────────────────────────────────────── */

function sha256hex(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex')
}

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return createHmac('sha256', key).update(data).digest()
}

function getSigningKey(
  secret:  string,
  date:    string,
  region:  string,
  service: string,
): Buffer {
  const kDate    = hmacSha256(`AWS4${secret}`, date)
  const kRegion  = hmacSha256(kDate, region)
  const kService = hmacSha256(kRegion, service)
  return hmacSha256(kService, 'aws4_request')
}

interface R2Env {
  accountId:  string
  bucket:     string
  accessKey:  string
  secret:     string
  publicBase: string
}

function readR2Env(): R2Env {
  const accountId  = process.env.R2_ACCOUNT_ID
  const bucket     = process.env.R2_BUCKET_NAME
  const accessKey  = process.env.R2_ACCESS_KEY_ID
  const secret     = process.env.R2_SECRET_ACCESS_KEY
  if (!accountId || !bucket || !accessKey || !secret) {
    throw new R2ConfigError(
      'R2 storage not configured. Set R2_ACCOUNT_ID, R2_BUCKET_NAME, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.',
    )
  }
  const publicBase = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '')
  return { accountId, bucket, accessKey, secret, publicBase }
}

/* ─── PUT (upload) ─────────────────────────────────────────────── */

export async function uploadToR2(options: R2UploadOptions): Promise<R2UploadResult> {
  const { buffer, key, contentType } = options
  const { accountId, bucket, accessKey, secret, publicBase } = readR2Env()

  const host       = `${accountId}.r2.cloudflarestorage.com`
  const region     = 'auto'
  const service    = 's3'
  const endpoint   = `https://${host}`
  const objectPath = `/${bucket}/${key}`

  const now      = new Date()
  const amzDate  = now.toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0, 15) + 'Z'
  const dateOnly = amzDate.slice(0, 8)

  const payloadHash = sha256hex(buffer)

  const canonicalHeaders =
    `content-type:${contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`
  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date'

  const canonicalRequest = [
    'PUT',
    objectPath,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')

  const credentialScope = `${dateOnly}/${region}/${service}/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256hex(canonicalRequest),
  ].join('\n')

  const signingKey  = getSigningKey(secret, dateOnly, region, service)
  const signature   = createHmac('sha256', signingKey).update(stringToSign).digest('hex')
  const authorization =
    `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`

  const res = await fetch(`${endpoint}${objectPath}`, {
    method: 'PUT',
    headers: {
      Authorization:          authorization,
      'Content-Type':         contentType,
      'Content-Length':       String(buffer.length),
      'x-amz-content-sha256': payloadHash,
      'x-amz-date':           amzDate,
    },
    // Node's undici fetch accepts Buffer at runtime; the DOM RequestInit
    // type doesn't model it, and `duplex` isn't in the DOM types either.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body:   buffer as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    duplex: 'half' as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any)

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`R2 upload failed (${res.status}): ${text.slice(0, 300)}`)
  }

  return {
    url:  publicBase ? `${publicBase}/${key}` : '',
    key,
    size: buffer.length,
  }
}

/* ─── GET (download) ───────────────────────────────────────────── */

/**
 * Download an object's bytes by key. Used by the asset-delivery send
 * pipeline to fetch files for SendGrid MIME attachments.
 *
 * Uses a presigned-style SigV4 GET so we don't depend on the bucket
 * being public. Throws on any non-200 response.
 */
export async function downloadFromR2(key: string): Promise<Buffer> {
  const { accountId, bucket, accessKey, secret } = readR2Env()

  const host       = `${accountId}.r2.cloudflarestorage.com`
  const region     = 'auto'
  const service    = 's3'
  const endpoint   = `https://${host}`
  const objectPath = `/${bucket}/${key}`

  const now      = new Date()
  const amzDate  = now.toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0, 15) + 'Z'
  const dateOnly = amzDate.slice(0, 8)

  // Empty body for GET → empty-payload hash.
  const payloadHash = sha256hex('')

  const canonicalHeaders =
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date'

  const canonicalRequest = [
    'GET',
    objectPath,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')

  const credentialScope = `${dateOnly}/${region}/${service}/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256hex(canonicalRequest),
  ].join('\n')

  const signingKey = getSigningKey(secret, dateOnly, region, service)
  const signature  = createHmac('sha256', signingKey).update(stringToSign).digest('hex')
  const authorization =
    `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`

  const res = await fetch(`${endpoint}${objectPath}`, {
    method: 'GET',
    headers: {
      Authorization:          authorization,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date':           amzDate,
    },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`R2 download failed (${res.status}) for ${key}: ${text.slice(0, 300)}`)
  }

  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/* ─── DELETE ───────────────────────────────────────────────────── */

export async function deleteFromR2(key: string): Promise<void> {
  const { accountId, bucket, accessKey, secret } = readR2Env()

  const host       = `${accountId}.r2.cloudflarestorage.com`
  const region     = 'auto'
  const service    = 's3'
  const endpoint   = `https://${host}`
  const objectPath = `/${bucket}/${key}`

  const now      = new Date()
  const amzDate  = now.toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0, 15) + 'Z'
  const dateOnly = amzDate.slice(0, 8)

  // Empty body for DELETE.
  const payloadHash = sha256hex('')

  const canonicalHeaders =
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date'

  const canonicalRequest = [
    'DELETE',
    objectPath,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')

  const credentialScope = `${dateOnly}/${region}/${service}/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256hex(canonicalRequest),
  ].join('\n')

  const signingKey = getSigningKey(secret, dateOnly, region, service)
  const signature  = createHmac('sha256', signingKey).update(stringToSign).digest('hex')
  const authorization =
    `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`

  const res = await fetch(`${endpoint}${objectPath}`, {
    method: 'DELETE',
    headers: {
      Authorization:          authorization,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date':           amzDate,
    },
  })

  // S3/R2 returns 204 on success; 404 on already-deleted is also fine.
  if (!res.ok && res.status !== 404) {
    const text = await res.text().catch(() => '')
    throw new Error(`R2 delete failed (${res.status}): ${text.slice(0, 300)}`)
  }
}
