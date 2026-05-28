/**
 * Cron Authentication Helper
 *
 * Verifies that an incoming request to a cron route originated from
 * Vercel's cron system (or another trusted caller holding CRON_SECRET).
 *
 * Vercel sends: Authorization: Bearer <CRON_SECRET>
 *
 * Usage in a cron route:
 *   import { verifyCronAuth } from '@/lib/cron-auth'
 *
 *   export async function GET(request: Request) {
 *     if (!verifyCronAuth(request)) {
 *       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 *     }
 *     // ... cron logic
 *   }
 *
 * SECURITY: Uses timingSafeEqual to compare tokens, preventing timing
 * attacks that could leak the secret one byte at a time via response
 * latency measurement.
 *
 * Reference: https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
 */

import { timingSafeEqual } from 'node:crypto'

/**
 * Verifies the Authorization header against CRON_SECRET.
 *
 * @param request - The incoming cron request
 * @returns true if the Bearer token matches CRON_SECRET, false otherwise
 *
 * Returns false (not throws) on any failure mode:
 *   - CRON_SECRET not set in env
 *   - Missing Authorization header
 *   - Malformed header (not "Bearer <token>")
 *   - Token mismatch
 */
export function verifyCronAuth(request: Request): boolean {
  const expected = process.env.CRON_SECRET

  if (!expected) {
    // Misconfiguration — never authenticate if the secret isn't set.
    console.error('[cron-auth] CRON_SECRET is not set; rejecting request')
    return false
  }

  const header = request.headers.get('authorization')
  if (!header || !header.startsWith('Bearer ')) {
    return false
  }

  const token = header.slice('Bearer '.length)

  // timingSafeEqual requires equal-length buffers, so we compare lengths
  // first (this leaks length, which is acceptable — the secret's length
  // is not sensitive, only its contents). Then a constant-time compare
  // on the contents.
  const tokenBuf    = Buffer.from(token,    'utf8')
  const expectedBuf = Buffer.from(expected, 'utf8')

  if (tokenBuf.length !== expectedBuf.length) {
    return false
  }

  try {
    return timingSafeEqual(tokenBuf, expectedBuf)
  } catch {
    // timingSafeEqual throws if buffers differ in length (already guarded)
    // or on other unexpected input; treat any throw as auth failure.
    return false
  }
}
