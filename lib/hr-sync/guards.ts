/**
 * HR-sync guardrail helpers (Stage 2). Pure functions — no DB writes,
 * no calls beyond a field's own resolver. Stage 3 iterates the
 * shared-field map and asks these helpers "should I write this, and with
 * what value?".
 */
import type { FacetTarget } from './shared-field-map'

/**
 * §4i guard: treat null / undefined / empty / whitespace-only as blank.
 * The sync uses this to NEVER overwrite a real facet value with a blank
 * HR value. (Booleans / numbers are never "blank" — only string-ish
 * emptiness counts.)
 */
export function isBlank(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  return false
}

/** The outcome of deciding whether/what to write for one facet target. */
export type WriteDecision =
  | { write: true; value: string | number | boolean }
  | { write: false; reason: 'blank' | 'unresolved' | 'no-target' }

/**
 * Decide whether a single facet target should be written for a given HR
 * value, and resolve the value if the target needs a resolver.
 *
 * Rules (design §4c fail-closed, §4i never-overwrite-with-blank):
 *   - no target on this facet           → { write:false, 'no-target' }
 *   - HR value isBlank                   → { write:false, 'blank' }
 *   - resolver target resolves to null   → { write:false, 'unresolved' }
 *   - else                               → { write:true, value }
 *
 * For a 'direct' target the HR value is written as-is (already non-blank).
 * For a 'resolver' target the resolver's non-null result is written.
 *
 * ⚠️ This NEVER writes anything itself — it returns a decision. It may
 * `await` the field's resolver (a read-only lookup) to produce the value.
 */
export async function decideWrite(
  target: FacetTarget | undefined,
  hrValue: unknown,
): Promise<WriteDecision> {
  if (!target) return { write: false, reason: 'no-target' }

  // §4i: a blank HR value never overwrites a real facet value.
  if (isBlank(hrValue)) return { write: false, reason: 'blank' }

  if (target.kind === 'direct') {
    // Booleans pass straight through (e.g. `active`); everything else is
    // a non-blank string by the isBlank check above.
    if (typeof hrValue === 'boolean') return { write: true, value: hrValue }
    return { write: true, value: String(hrValue).trim() }
  }

  // Resolver target — fail-closed: null means "skip" (unresolvable).
  const resolved = await target.resolver(
    typeof hrValue === 'string' ? hrValue : String(hrValue),
  )
  if (resolved === null || resolved === undefined) {
    return { write: false, reason: 'unresolved' }
  }
  return { write: true, value: resolved }
}
