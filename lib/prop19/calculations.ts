/**
 * Prop 19 Calculator — Pure Calculation Functions
 * All logic is deterministic and testable with no side effects.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type TimingOption = "before" | "within1" | "within2"

export const TIMING_LABELS: Record<TimingOption, { short: string; long: string; pct: string }> = {
  before: {
    short: "Buying BEFORE selling original home",
    long: "Replacement home purchased before selling original home",
    pct: "100%",
  },
  within1: {
    short: "Within 1 year after selling",
    long: "Replacement home purchased within 1 year after selling original",
    pct: "105%",
  },
  within2: {
    short: "Within 2 years after selling",
    long: "Replacement home purchased within 2 years after selling original",
    pct: "110%",
  },
}

export const TIMING_MULTIPLIERS: Record<TimingOption, number> = {
  before: 1.0,
  within1: 1.05,
  within2: 1.1,
}

/**
 * 2025–2027 Prop 19 parent-child base year value exclusion cap.
 * Adjusted biennially by the State Board of Equalization per CPI.
 */
export const PARENT_CHILD_EXCLUSION_2025 = 1_044_586

/**
 * Estimated effective CA property tax rate used for illustration.
 * 1% base rate + ~0.2% average local bond/assessment charges.
 * Actual rates vary by county and Tax Rate Area.
 */
export const TAX_RATE = 0.012

// ─── Formatting Helpers ───────────────────────────────────────────────────────

export function fmt(n: number): string {
  if (!isFinite(n)) return "0"
  return Math.round(n).toLocaleString("en-US")
}

export function fmtDec(n: number): string {
  if (!isFinite(n)) return "0.00"
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function parseCurrency(v: string): number {
  return parseFloat(v.replace(/[^0-9.]/g, "")) || 0
}

// ─── Senior / Disabled / Disaster Transfer ───────────────────────────────────

export interface SeniorResult {
  timingMultiplier: number
  adjustedThreshold: number
  isFullTransfer: boolean
  differenceAdded: number
  newTaxableValue: number
  taxWithProp19: number
  taxWithoutProp19: number
  annualSavings: number
  monthlySavings: number
  savings10yr: number
  savings20yr: number
  /** Width % for the "with Prop 19" bar in the visual comparison (always ≤ 100) */
  barPct: number
}

export function calcSenior(
  assessed: number,
  salePrice: number,
  replacementPrice: number,
  timing: TimingOption,
): SeniorResult {
  const timingMultiplier = TIMING_MULTIPLIERS[timing]
  const adjustedThreshold = salePrice * timingMultiplier
  const isFullTransfer = replacementPrice <= adjustedThreshold
  const differenceAdded = isFullTransfer ? 0 : replacementPrice - adjustedThreshold
  const newTaxableValue = assessed + differenceAdded
  const taxWithProp19 = newTaxableValue * TAX_RATE
  const taxWithoutProp19 = replacementPrice * TAX_RATE
  const annualSavings = Math.max(0, taxWithoutProp19 - taxWithProp19)

  return {
    timingMultiplier,
    adjustedThreshold,
    isFullTransfer,
    differenceAdded,
    newTaxableValue,
    taxWithProp19,
    taxWithoutProp19,
    annualSavings,
    monthlySavings: annualSavings / 12,
    savings10yr: annualSavings * 10,
    savings20yr: annualSavings * 20,
    barPct: taxWithoutProp19 > 0
      ? Math.max(4, Math.round((taxWithProp19 / taxWithoutProp19) * 100))
      : 100,
  }
}

// ─── Parent-Child Inheritance Transfer ───────────────────────────────────────

export interface ParentChildResult {
  exclusionLimit: number
  eligible: boolean
  isFullExclusion: boolean
  newTaxableValue: number
  taxWithExclusion: number
  taxWithoutExclusion: number
  annualSavings: number
  monthlySavings: number
  savings10yr: number
  savings20yr: number
  barPct: number
}

export function calcParentChild(
  assessed: number,
  marketValue: number,
  childWillOccupy: boolean,
): ParentChildResult {
  const exclusionLimit = assessed + PARENT_CHILD_EXCLUSION_2025
  const taxWithoutExclusion = marketValue * TAX_RATE

  if (!childWillOccupy) {
    return {
      exclusionLimit,
      eligible: false,
      isFullExclusion: false,
      newTaxableValue: marketValue,
      taxWithExclusion: taxWithoutExclusion,
      taxWithoutExclusion,
      annualSavings: 0,
      monthlySavings: 0,
      savings10yr: 0,
      savings20yr: 0,
      barPct: 100,
    }
  }

  const isFullExclusion = marketValue <= exclusionLimit
  const newTaxableValue = isFullExclusion ? assessed : assessed + (marketValue - exclusionLimit)
  const taxWithExclusion = newTaxableValue * TAX_RATE
  const annualSavings = Math.max(0, taxWithoutExclusion - taxWithExclusion)

  return {
    exclusionLimit,
    eligible: true,
    isFullExclusion,
    newTaxableValue,
    taxWithExclusion,
    taxWithoutExclusion,
    annualSavings,
    monthlySavings: annualSavings / 12,
    savings10yr: annualSavings * 10,
    savings20yr: annualSavings * 20,
    barPct: taxWithoutExclusion > 0
      ? Math.max(4, Math.round((taxWithExclusion / taxWithoutExclusion) * 100))
      : 100,
  }
}
