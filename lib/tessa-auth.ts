import { createHash } from 'crypto'

export const TESSA_COOKIE = 'tessa_session'

/** Returns true if TESSA_ACCESS_CODE is set, meaning auth is required. */
export function isAuthRequired(): boolean {
  return !!process.env.TESSA_ACCESS_CODE
}

/** Signed cookie value tied to the current access code. */
export function createSessionValue(): string {
  const code = process.env.TESSA_ACCESS_CODE || ''
  const hash = createHash('sha256').update(`tessa:${code}`).digest('hex').slice(0, 16)
  return `ok.${hash}`
}

/** Validate a tessa_session cookie value. Returns true if auth is disabled OR the value matches. */
export function isValidSession(value: string | undefined): boolean {
  if (!isAuthRequired()) return true
  if (!value) return false
  return value === createSessionValue()
}
