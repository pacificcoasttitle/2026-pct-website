'use client'

/**
 * Shared formatted phone input — formats as the user types to
 * (XXX) XXX-XXXX.
 *
 * ⚠️ This changes the INPUT UX only. The value it emits via onChange is
 * the formatted display string ("(714) 555-1234"), which is exactly what
 * is stored — matching the FinCEN intake's prior local behavior and the
 * free-text phone fields across the app (none of which enforce a
 * machine format). The HR sync simply copies these display strings to the
 * facet tables verbatim, so formatting is safe end-to-end.
 *
 * Behavior:
 *   - strips non-digits, keeps the first 10
 *   - partial input formats progressively ("(714", "(714) 55", …)
 *   - paste / backspace / non-digit chars are handled by reformatting
 *   - empty stays empty (optional fields allowed)
 *
 * Use formatPhoneDisplay() to format an existing stored value for display
 * (e.g. prefilled values, read-only fields).
 */
import { forwardRef } from 'react'

export function formatPhoneDisplay(raw: string | null | undefined): string {
  const digits = String(raw ?? '').replace(/\D/g, '').slice(0, 10)
  if (digits.length === 0) return ''
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type'
> & {
  value: string | null | undefined
  /** Receives the formatted display value, e.g. "(714) 555-1234". */
  onChange: (value: string) => void
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  { value, onChange, placeholder = '(714) 000-0000', maxLength, ...rest },
  ref,
) {
  return (
    <input
      {...rest}
      ref={ref}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      value={formatPhoneDisplay(value)}
      onChange={(e) => onChange(formatPhoneDisplay(e.target.value))}
      placeholder={placeholder}
      maxLength={maxLength ?? 14}
    />
  )
})

export default PhoneInput
