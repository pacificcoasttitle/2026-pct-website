'use client'

/**
 * Shared US phone input — formats clean 10-digit input to (XXX) XXX-XXXX.
 *
 * ⚠️ These are US 10-digit-only fields. The component NEVER silently
 * truncates or strips characters from over-length / non-conforming input.
 * Instead it passes the user's typed value through unchanged and exposes
 * an INVALID state (inline message + onValidityChange) so the data is
 * never silently mangled and the consumer can block submit.
 *
 * Behavior:
 *   - empty                → valid (optional fields allowed)
 *   - clean ≤10-digit typing → formatted progressively ("(714", "(714) 55", …)
 *   - exactly 10 digits     → "(714) 555-1234", valid
 *   - >10 digits / letters / extensions → value kept VERBATIM (no
 *     truncation) + flagged invalid once the field is touched (blur)
 *
 * ⚠️ EXISTING DATA SAFETY: the component is controlled and only
 * transforms the value on a USER edit. A pre-loaded legacy value (e.g.
 * "(714) 555-1234 x203") renders AS-IS and is never reformatted or
 * truncated on mount — so opening + saving an unrelated field on the same
 * form can't clobber it. It is only re-validated/reformatted if the user
 * actually edits THIS field.
 *
 * formatPhoneDisplay() formats an existing clean value for display; it
 * returns '' for non-10-digit input (callers fall back to the raw value).
 * isValidUsPhone() is the shared validity check (empty = valid).
 */
import { forwardRef, useState } from 'react'

/** Format a clean US 10-digit value → (XXX) XXX-XXXX. '' if not 10 digits. */
export function formatPhoneDisplay(raw: string | null | undefined): string {
  const digits = String(raw ?? '').replace(/\D/g, '')
  if (digits.length !== 10) return ''
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

/** Progressive format used WHILE typing clean (≤10-digit) input. */
function formatProgressive(digits: string): string {
  if (digits.length === 0) return ''
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

/** A value is "phone-shaped" if it's only digits + the usual formatting chars. */
function isPhoneShaped(v: string): boolean {
  return /^[\d\s()+.\-]*$/.test(v)
}

/**
 * US 10-digit validity. Empty is valid (optional). A value is valid iff it
 * is phone-shaped AND has exactly 10 digits (so "(714) 555-1234" passes;
 * an extension, 11-digit, or international value fails).
 */
export function isValidUsPhone(value: string | null | undefined): boolean {
  const v = String(value ?? '').trim()
  if (v === '') return true
  if (!isPhoneShaped(v)) return false
  return v.replace(/\D/g, '').length === 10
}

type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type'
> & {
  value: string | null | undefined
  /**
   * Receives the new value. For clean ≤10-digit input this is the
   * formatted display string; for over-length / non-phone input it is the
   * user's typed value VERBATIM (never truncated).
   */
  onChange: (value: string) => void
  /** Notified whenever validity changes (US 10-digit; empty = valid). */
  onValidityChange?: (valid: boolean) => void
  /** Force-show the invalid message (e.g. on a submit attempt). */
  showInvalid?: boolean
  /** Inline message shown when invalid. */
  invalidMessage?: string
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  {
    value,
    onChange,
    onValidityChange,
    showInvalid = false,
    invalidMessage = 'Enter a US 10-digit phone number',
    placeholder = '(714) 000-0000',
    maxLength,
    onBlur,
    ...rest
  },
  ref,
) {
  const [touched, setTouched] = useState(false)
  const current = String(value ?? '')
  const valid = isValidUsPhone(current)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    const digits = raw.replace(/\D/g, '')
    // Clean US input (≤10 digits, no letters) → format progressively.
    // Anything else (>10 digits, letters/extensions) is passed through
    // VERBATIM so nothing is silently dropped — it just flags invalid.
    const next = isPhoneShaped(raw) && digits.length <= 10 ? formatProgressive(digits) : raw
    onChange(next)
    onValidityChange?.(isValidUsPhone(next))
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    setTouched(true)
    onBlur?.(e)
  }

  // Only flag once the user has interacted (touched) or the consumer asks
  // (showInvalid) — never flag a freshly-rendered legacy value.
  const flag = !valid && (touched || showInvalid)

  return (
    <>
      <input
        {...rest}
        ref={ref}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={current}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        // No maxLength clamp by default — clamping would silently block
        // over-length input instead of flagging it. Honor an explicit one.
        maxLength={maxLength}
        aria-invalid={flag || undefined}
      />
      {flag && (
        <p className="mt-1 text-xs text-red-600">{invalidMessage}</p>
      )}
    </>
  )
})

export default PhoneInput
