/**
 * Shared formatting helpers used across admin UI surfaces.
 *
 * Currently houses formatBytes, which was duplicated identically in
 * three asset-delivery components. The shared version is defensive
 * against the Postgres BIGINT → JavaScript string quirk: the pg driver
 * returns BIGINT columns as strings to preserve precision beyond 2^53,
 * which silently breaks number-typed callers that do arithmetic or
 * call .toFixed().
 *
 * Accepts number, string, null, or undefined and coerces safely.
 */
export function formatBytes(input: number | string | null | undefined): string {
  const n = typeof input === 'string' ? Number(input) : (input ?? 0)
  if (!Number.isFinite(n) || n === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let v = n
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(v >= 100 || i === 0 ? 0 : 1)} ${units[i]}`
}
