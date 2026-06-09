/**
 * Tiny in-memory fixed-window rate limiter.
 *
 * Net-new for the public token-gated onboarding upload endpoint — an
 * UNAUTHENTICATED upload route must not be unthrottled. Keyed by an
 * arbitrary string (we key by token + IP). In-memory means it's
 * per-process (a serverless instance), which is sufficient as a basic
 * abuse guard; a DB/Redis-backed limiter can replace it later without
 * changing call sites.
 */

interface Window { count: number; resetAt: number }

const buckets = new Map<string, Window>()

export interface RateLimitResult {
  allowed:    boolean
  remaining:  number
  retryAfter: number // seconds until the window resets
}

/**
 * Fixed-window check. Returns { allowed } and increments the counter
 * for `key` when allowed. `limit` requests are permitted per
 * `windowMs`. Opportunistically evicts expired buckets to bound memory.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()

  // Opportunistic cleanup so the map doesn't grow unbounded.
  if (buckets.size > 5000) {
    for (const [k, w] of buckets) if (w.resetAt <= now) buckets.delete(k)
  }

  const existing = buckets.get(key)
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, retryAfter: 0 }
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((existing.resetAt - now) / 1000) }
  }

  existing.count += 1
  return { allowed: true, remaining: limit - existing.count, retryAfter: 0 }
}
