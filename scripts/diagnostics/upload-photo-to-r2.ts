/**
 * One-off CLI: upload a local image to Cloudflare R2 with a specific key.
 *
 * Mirrors the SigV4 logic in app/api/admin/upload/route.ts but lets the
 * caller pin the destination key (so we get a stable URL like
 * marketing/jerry-hernandez.png instead of a random timestamped name).
 *
 * Usage:
 *   npx tsx scripts/upload-photo-to-r2.ts <local-file> <r2-key>
 *
 * Example:
 *   npx tsx scripts/upload-photo-to-r2.ts Jerry.png marketing/jerry-hernandez.png
 *
 * Reads R2_* env vars from .env.local (loaded by tsx via --env-file).
 */
import { readFileSync } from 'fs'
import { extname } from 'path'
import { createHash, createHmac } from 'crypto'

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

const CONTENT_TYPES: Record<string, string> = {
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
}

async function main() {
  const [localPath, r2Key] = process.argv.slice(2)
  if (!localPath || !r2Key) {
    console.error('Usage: npx tsx scripts/upload-photo-to-r2.ts <local-file> <r2-key>')
    process.exit(1)
  }

  const accountId  = process.env.R2_ACCOUNT_ID
  const bucket     = process.env.R2_BUCKET_NAME
  const accessKey  = process.env.R2_ACCESS_KEY_ID
  const secret     = process.env.R2_SECRET_ACCESS_KEY
  const publicBase = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '')

  if (!accountId || !bucket || !accessKey || !secret || !publicBase) {
    console.error('Missing R2_* env vars. Run with: npx tsx --env-file=.env.local scripts/upload-photo-to-r2.ts ...')
    process.exit(1)
  }

  const body        = readFileSync(localPath)
  const ext         = extname(localPath).toLowerCase()
  const contentType = CONTENT_TYPES[ext] || 'application/octet-stream'

  const host       = `${accountId}.r2.cloudflarestorage.com`
  const region     = 'auto'
  const service    = 's3'
  const objectPath = `/${bucket}/${r2Key}`

  const now      = new Date()
  const amzDate  = now.toISOString().replace(/[:\-]|\.\d{3}/g, '').slice(0, 15) + 'Z'
  const dateOnly = amzDate.slice(0, 8)

  const payloadHash = sha256hex(body)

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

  const res = await fetch(`https://${host}${objectPath}`, {
    method: 'PUT',
    headers: {
      Authorization:          authorization,
      'Content-Type':         contentType,
      'Content-Length':       String(body.length),
      'x-amz-content-sha256': payloadHash,
      'x-amz-date':           amzDate,
    },
    body,
    // @ts-expect-error - Node fetch requires duplex for body streams
    duplex: 'half',
  })

  if (!res.ok) {
    const text = await res.text()
    console.error(`R2 upload failed (${res.status}):`)
    console.error(text)
    process.exit(1)
  }

  const url = `${publicBase}/${r2Key}`
  console.log(`Uploaded ${localPath} (${body.length} bytes) to ${url}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
