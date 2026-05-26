/**
 * Shared phone-number normalization.
 *
 * Used by both the CSV import endpoint and the staff PATCH endpoint so
 * stored values are consistent regardless of entry point.
 *
 * Rules:
 *   - 10 digits           → "XXX.XXX.XXXX"
 *   - 11 digits, leading 1 → strip the 1, then "XXX.XXX.XXXX"
 *   - anything else        → original input, trimmed (preserves
 *                            international numbers, extensions, etc.)
 *   - null/undefined/empty → ""
 */
export function normalizePhone(input: string | null | undefined): string {
  if (!input) return ''

  const digits = input.replace(/\D/g, '')

  if (digits.length === 11 && digits.startsWith('1')) {
    const rest = digits.slice(1)
    return `${rest.slice(0, 3)}.${rest.slice(3, 6)}.${rest.slice(6, 10)}`
  }

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 10)}`
  }

  return input.trim()
}
