/**
 * /api/admin/upload — upload an image to Cloudflare R2 (pct-files/marketing/)
 *
 * Uses the R2 S3-compatible API with AWS Sig V4 signing.
 * No extra packages — pure Node.js crypto + fetch.
 *
 * Required Vercel environment variables:
 *   R2_ACCOUNT_ID        – Cloudflare account ID
 *   R2_BUCKET_NAME       – bucket name (e.g. pct-files)
 *   R2_ACCESS_KEY_ID     – R2 API token access key
 *   R2_SECRET_ACCESS_KEY – R2 API token secret
 *   R2_PUBLIC_URL        – public base URL (e.g. https://pub-xxx.r2.dev)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createHash, createHmac } from 'crypto'
import { isAuthenticated } from '@/lib/admin-auth'

export const runtime = 'nodejs'

// ── AWS Sig V4 helpers ────────────────────────────────────────────
function sha256hex(data: string | Buffer): string {
  return createHash('sha256').update(data).digest('hex')
}

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return createHmac('sha256', key).update(data).digest()
}

function getSigningKey(secret: string, date: string, region: string, service: string): Buffer {
  const kDate    = hmacSha256(`AWS4${secret}`, date)
  const kRegion  = hmacSha256(kDate, region)
  const kService = hmacSha256(kRegion, service)
  return hmacSha256(kService, 'aws4_request')
}

async function uploadToR2(
  body: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const accountId  = process.env.R2_ACCOUNT_ID!
  const bucket     = process.env.R2_BUCKET_NAME!
  const accessKey  = process.env.R2_ACCESS_KEY_ID!
  const secret     = process.env.R2_SECRET_ACCESS_KEY!
  const publicBase = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '')

  const host        = `${accountId}.r2.cloudflarestorage.com`
  const region      = 'auto'
  const service     = 's3'
  const endpoint    = `https://${host}`
  const objectPath  = `/${bucket}/${key}`

  // Timestamps
  const now      = new Date()
  const amzDate  = now.toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0, 15) + 'Z'
  const dateOnly = amzDate.slice(0, 8)

  const payloadHash = sha256hex(body)

  // ── Canonical request ─────────────────────────────────────────
  const canonicalHeaders =
    `content-type:${contentType}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`

  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date'

  const canonicalRequest = [
    'PUT',
    objectPath,
    '',                   // no query string
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')

  // ── String to sign ────────────────────────────────────────────
  const credentialScope = `${dateOnly}/${region}/${service}/aws4_request`
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256hex(canonicalRequest),
  ].join('\n')

  // ── Signature ─────────────────────────────────────────────────
  const signingKey  = getSigningKey(secret, dateOnly, region, service)
  const signature   = createHmac('sha256', signingKey).update(stringToSign).digest('hex')
  const authorization =
    `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`

  // ── Upload ────────────────────────────────────────────────────
  const res = await fetch(`${endpoint}${objectPath}`, {
    method: 'PUT',
    headers: {
      Authorization:            authorization,
      'Content-Type':           contentType,
      'Content-Length':         String(body.length),
      'x-amz-content-sha256':   payloadHash,
      'x-amz-date':             amzDate,
    },
    body,
    // @ts-expect-error – Node fetch needs duplex for streaming
    duplex: 'half',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`R2 upload failed (${res.status}): ${text}`)
  }

  // Return public CDN URL
  return `${publicBase}/${key}`
}

// ── Route handler ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { R2_ACCOUNT_ID, R2_BUCKET_NAME, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env
  if (!R2_ACCOUNT_ID || !R2_BUCKET_NAME || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    return NextResponse.json(
      { error: 'R2 storage not configured. Add R2_* env vars to Vercel.' },
      { status: 500 }
    )
  }

  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are accepted' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 400 })
    }

    const ext       = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const safeName  = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const key       = `marketing/${safeName}`          // pct-files/marketing/<file>

    const buffer    = Buffer.from(await file.arrayBuffer())
    const publicUrl = await uploadToR2(buffer, key, file.type)

    return NextResponse.json({ url: publicUrl, key, size: file.size, name: file.name })
  } catch (err) {
    console.error('[upload] R2 error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
