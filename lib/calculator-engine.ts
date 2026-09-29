/**
 * PCT Rate Calculator Engine
 *
 * Everything here is a lookup against the JSON tables in data/calculator/.
 * Those files are versioned in git and are the production source of truth.
 *
 *   title-rates.json          CLTIC Table R (purchase owner's / concurrent lender) + Westcor Basic Rate
 *   refinance-programs.json   Westcor §3.17 Residential Refinance Rate (and §3.18 Centralized)
 *   endorsements.json         CLTIC Part VIII (purchase) / Westcor Section X (refinance)
 *   escrow-resale.json        Purchase escrow by county zone
 *   escrow-refinance.json     Refinance escrow by county zone
 *   fees.json                 Recording / other fees, with optional + defaultOn flags
 *   transfer-taxes.json       County + city documentary transfer tax (flat or tiered)
 *   counties.json             County zone / city dropdowns
 *   rate-sources.json         Which manual each side of the calculator is priced on
 *
 * All rates are in whole dollars (stored as integers in the data).
 */

import titleRatesData from '@/data/calculator/title-rates.json'
import refinanceProgramsData from '@/data/calculator/refinance-programs.json'
import escrowResaleData from '@/data/calculator/escrow-resale.json'
import escrowRefinanceData from '@/data/calculator/escrow-refinance.json'
import feesData from '@/data/calculator/fees.json'
import endorsementsData from '@/data/calculator/endorsements.json'
import transferTaxesData from '@/data/calculator/transfer-taxes.json'
import countiesData from '@/data/calculator/counties.json'
import rateSourcesData from '@/data/calculator/rate-sources.json'

// ── Types ───────────────────────────────────────────────────────────────────

export type TransactionType = 'purchase' | 'refinance'
export type OwnerPolicyType = 'clta' | 'alta' // CLTA Standard vs ALTA Homeowner's
export type LenderPolicyType = 'clta' | 'alta' // Kept for API compatibility; purchases always price the concurrent lender column
export type RefinanceProgram = 'standard' | 'centralized'

/** Highest purchase amount the bracket table covers. Above this we ask the user to call. */
export const MAX_RATED_PURCHASE_AMOUNT = 5_000_000

export interface CalculatorInput {
  transactionType: TransactionType
  countyZone: string          // e.g. "Orange", "Los Angeles County"
  cityName: string            // e.g. "Irvine"
  salesPrice: number          // Purchase: property sale price; Refinance: 0
  loanAmount: number          // Loan/mortgage amount
  ownerPolicyType?: OwnerPolicyType    // Purchase only. PCT quotes ALTA Homeowner's by default.
  lenderPolicyType?: LenderPolicyType  // Accepted but not used for pricing (see note above)
  refinanceProgram?: RefinanceProgram  // Refinance only. 'centralized' has eligibility rules — not exposed publicly.
  selectedEndorsementIds?: number[]    // Optional endorsements
  selectedFeeIds?: number[]            // Optional fees (fees.json rows with optional: true)
  includeOwnerPolicy?: boolean         // Purchase: usually true
  includeEscrow?: boolean              // false = independent escrow; PCT escrow fee and escrow add-ons are omitted
}

export interface EndorsementLine {
  id: number
  code: string
  name: string
  fee: number
  isDefault: boolean
}

export interface TitleFees {
  underwriter: string
  ownerPolicy: number
  ownerPolicyLabel: string
  lenderPolicy: number
  lenderPolicyLabel: string
  endorsements: EndorsementLine[]
  endorsementTotal: number
  total: number
}

export interface FeeLine {
  id: number
  name: string
  fee: number
  category: string
  party: string
  optional: boolean
}

export interface EscrowFees {
  included: boolean           // false = customer is using an independent escrow; nothing is charged
  baseFee: number
  baseFeeAvailable: boolean   // false = no escrow schedule for this zone; show "call for quote"
  additionalFees: FeeLine[]
  total: number
}

export interface TransferTaxResult {
  countyTax: number
  cityTax: number
  countyRate: number          // per $1,000
  cityRate: number            // effective per $1,000 (cityTax / price * 1000)
  cityRateLabel: string       // human label, e.g. "$4.50/1,000" or "tiered"
  note: string
  total: number
}

export interface RateBasis {
  underwriter: string
  manual: string
  effectiveDate: string
  label: string
}

export interface CalculatorResult {
  titleFees: TitleFees
  escrowFees: EscrowFees
  transferTaxes: TransferTaxResult
  additionalFees: FeeLine[]
  additionalFeesTotal: number
  grandTotal: number
  callForQuote: boolean
  callForQuoteReason: string
  rateBasis: RateBasis
  disclaimer: string
}

// ── Title Rate Lookup ───────────────────────────────────────────────────────

interface TitleRateRow {
  minRange: number
  maxRange: number
  ownerRate: number        // CLTIC Table R Residential Owner's — CLTA Standard owner's policy
  homeOwnerRate: number    // ALTA Homeowner's — Table R + 20% surcharge, min $480 (CLTIC 2.1.B.1)
  conLoanRate: number      // CLTIC Table R Lender's Concurrent
  basicRate: number        // Westcor 11.2 Basic Rate (base for % endorsements on refinances)
}

const titleRates = titleRatesData as TitleRateRow[]

function lookupTitleRate(amount: number): TitleRateRow | null {
  if (amount <= 0) return null
  return titleRates.find(r => amount >= r.minRange && amount <= r.maxRange) || null
}

// ── Refinance Rate Lookup (Westcor) ─────────────────────────────────────────

interface RefinanceProgramDef {
  label: string
  manualSection: string
  maxAmount: number
  brackets: { minRange: number; maxRange: number; rate: number }[]
}

const refinancePrograms = refinanceProgramsData as Record<RefinanceProgram, RefinanceProgramDef>

function lookupRefinanceRate(program: RefinanceProgram, loanAmount: number): { rate: number; def: RefinanceProgramDef } {
  const def = refinancePrograms[program] ?? refinancePrograms.standard
  const row = def.brackets.find(b => loanAmount >= b.minRange && loanAmount <= b.maxRange)
  return { rate: row ? row.rate : 0, def }
}

// ── Endorsement Pricing ─────────────────────────────────────────────────────

/**
 * Endorsement rows are flat so the admin JSON viewer can render them.
 *   fee      — flat dollar charge (0 = no charge unless percent is set)
 *   percent  — percentage of the base rate (0 = not percentage priced)
 *   minFee / maxFee — clamps applied to a percentage charge (0 = none)
 *   basis    — which rate the percentage applies to:
 *              'owner'  → Table R Residential Owner's rate at the sales price (CLTIC)
 *              'lender' → Lender's Concurrent rate at the loan amount (CLTIC)
 *              'basic'  → Westcor Basic Rate at the loan amount (refinance)
 *   policy   — 'owner' endorsements only attach when an owner's policy is issued;
 *              'lender' endorsements only attach when there is a loan.
 */
interface EndorsementRow {
  id: number
  code: string
  name: string
  transactionType: 'Resale' | 'Re-finance'
  policy: 'owner' | 'lender'
  isDefault: boolean
  fee: number
  percent: number
  minFee: number
  maxFee: number
  basis: 'owner' | 'lender' | 'basic'
  source?: string
  note?: string
}

const endorsements = endorsementsData as EndorsementRow[]

function priceEndorsement(e: EndorsementRow, salesPrice: number, loanAmount: number): number {
  if (!e.percent || e.percent <= 0) return e.fee || 0

  let base = 0
  if (e.basis === 'owner') {
    base = lookupTitleRate(salesPrice)?.ownerRate ?? 0
  } else if (e.basis === 'lender') {
    base = lookupTitleRate(loanAmount)?.conLoanRate ?? 0
  } else {
    base = lookupTitleRate(loanAmount)?.basicRate ?? 0
  }

  let fee = Math.round(base * (e.percent / 100))
  if (e.minFee > 0 && fee < e.minFee) fee = e.minFee
  if (e.maxFee > 0 && fee > e.maxFee) fee = e.maxFee
  return fee
}

export function calculateTitleFees(input: CalculatorInput): TitleFees {
  const {
    transactionType,
    salesPrice,
    loanAmount,
    ownerPolicyType = 'alta',   // Default: ALTA Homeowner's Policy
    refinanceProgram = 'standard',
    selectedEndorsementIds = [],
    includeOwnerPolicy = true,
  } = input

  const isPurchase = transactionType === 'purchase'
  const underwriter = isPurchase ? rateSourcesData.purchase.underwriter : rateSourcesData.refinance.underwriter
  const ownerIssued = isPurchase && includeOwnerPolicy && salesPrice > 0

  // ── Owner's Policy (Purchase only — CLTIC Table R) ──
  let ownerPolicy = 0
  let ownerPolicyLabel = ''
  if (ownerIssued) {
    const row = lookupTitleRate(salesPrice)
    if (row) {
      ownerPolicy = ownerPolicyType === 'alta' ? row.homeOwnerRate : row.ownerRate
    }
    ownerPolicyLabel = ownerPolicyType === 'alta'
      ? 'ALTA Homeowner\'s Policy'
      : 'CLTA Standard Owner\'s Policy'
  }

  // ── Lender's Policy ──
  let lenderPolicy = 0
  let lenderPolicyLabel = ''
  if (loanAmount > 0) {
    if (isPurchase) {
      // Purchase: CLTIC Lender's Concurrent rate. If no owner's policy is issued
      // the concurrent rate does not apply and the quote should be handled manually.
      const row = lookupTitleRate(loanAmount)
      lenderPolicy = row && ownerIssued ? row.conLoanRate : 0
      lenderPolicyLabel = 'ALTA Lender\'s Policy (Concurrent)'
    } else {
      const { rate, def } = lookupRefinanceRate(refinanceProgram, loanAmount)
      lenderPolicy = rate
      lenderPolicyLabel = `ALTA Loan Policy (${def.label})`
    }
  }

  // ── Endorsements ──
  const txnType = isPurchase ? 'Resale' : 'Re-finance'
  const activeEndorsements = endorsements.filter(e => {
    if (e.transactionType !== txnType) return false
    if (e.policy === 'owner' && !ownerIssued) return false
    if (e.policy === 'lender' && loanAmount <= 0) return false
    return e.isDefault || selectedEndorsementIds.includes(e.id)
  })
  const endorsementItems: EndorsementLine[] = activeEndorsements.map(e => ({
    id: e.id,
    code: e.code,
    name: e.name,
    fee: priceEndorsement(e, salesPrice, loanAmount),
    isDefault: e.isDefault,
  }))
  const endorsementTotal = endorsementItems.reduce((sum, e) => sum + e.fee, 0)

  const total = ownerPolicy + lenderPolicy + endorsementTotal

  return {
    underwriter,
    ownerPolicy,
    ownerPolicyLabel,
    lenderPolicy,
    lenderPolicyLabel,
    endorsements: endorsementItems,
    endorsementTotal,
    total,
  }
}

// ── Fees (fees.json) ────────────────────────────────────────────────────────

interface FeeRow {
  id: number
  transactionType: 'resale' | 'refinance'
  category: string
  name: string
  value: number
  active: boolean
  optional?: boolean   // true = only charged when the user selects it
  defaultOn?: boolean  // UI hint: pre-check the box
  party?: string       // who customarily pays: buyer | seller | borrower
}

const fees = feesData as FeeRow[]

function activeFees(transactionType: TransactionType, selectedFeeIds: number[] | undefined): FeeRow[] {
  const txnKey = transactionType === 'purchase' ? 'resale' : 'refinance'
  // When the caller does not send selectedFeeIds at all, fall back to the defaultOn set
  // so older clients and the print view keep working.
  const selected = selectedFeeIds ?? fees.filter(f => f.optional && f.defaultOn).map(f => f.id)
  return fees.filter(f => {
    if (!f.active || f.transactionType !== txnKey) return false
    if (f.optional) return selected.includes(f.id)
    return true
  })
}

function toFeeLine(f: FeeRow): FeeLine {
  return { id: f.id, name: f.name, fee: f.value, category: f.category, party: f.party ?? '', optional: !!f.optional }
}

/** Optional fees the UI should offer as checkboxes for this transaction type. */
export function getFeeOptions(transactionType: TransactionType, includeEscrow = true) {
  const txnKey = transactionType === 'purchase' ? 'resale' : 'refinance'
  return fees
    .filter(f => f.active && f.transactionType === txnKey && f.optional)
    .filter(f => includeEscrow || f.category !== 'escrow')
    .map(f => ({ id: f.id, name: f.name, fee: f.value, category: f.category, party: f.party ?? '', defaultOn: !!f.defaultOn }))
}

// ── Escrow Fee Calculation ──────────────────────────────────────────────────

interface EscrowResaleRow {
  county: string
  minRange: number
  maxRange: number | null
  baseAmount: number | null
  perThousandPrice: number | null
  baseRate: number | null
  minimumRate: number | null
}

interface EscrowRefiRow {
  county: string
  minRange: number
  maxRange: number | null
  escrowRate: number
}

function findEscrowResaleRate(zone: string, amount: number): number | null {
  const rows = (escrowResaleData as EscrowResaleRow[]).filter(
    r => r.county === `${zone}__All`
  )

  const row = rows.find(r => {
    const min = r.minRange
    const max = r.maxRange ?? Infinity
    return amount >= min && amount <= max
  })

  if (!row) return null

  // If baseRate is directly set, use it
  if (row.baseRate && row.baseRate > 0) {
    return row.baseRate
  }

  // If minimumRate is set and no per-thousand calculation, return minimum
  if (row.minimumRate && row.minimumRate > 0 && !row.perThousandPrice) {
    return row.minimumRate
  }

  // Calculate: baseAmount + (price / 1000) * perThousandPrice
  let fee = 0
  if (row.baseAmount && row.perThousandPrice) {
    fee = row.baseAmount + (amount / 1000) * row.perThousandPrice
  }

  // Apply minimum
  if (row.minimumRate && row.minimumRate > 0 && fee < row.minimumRate) {
    fee = row.minimumRate
  }

  return Math.round(fee * 100) / 100
}

function findEscrowRefiRate(zone: string, amount: number): number | null {
  const rows = (escrowRefinanceData as EscrowRefiRow[]).filter(
    r => r.county === `${zone}__All` || r.county === `${zone}__Re-Finance`
  )

  const row = rows.find(r => {
    const min = r.minRange
    const max = r.maxRange ?? Infinity
    return amount >= min && amount <= max
  })

  return row ? row.escrowRate : null
}

export function calculateEscrowFees(input: CalculatorInput): EscrowFees {
  const { transactionType, countyZone, salesPrice, loanAmount, selectedFeeIds, includeEscrow = true } = input
  const isPurchase = transactionType === 'purchase'
  const amount = isPurchase ? salesPrice : loanAmount

  if (!includeEscrow) {
    return { included: false, baseFee: 0, baseFeeAvailable: true, additionalFees: [], total: 0 }
  }

  const found = isPurchase
    ? findEscrowResaleRate(countyZone, amount)
    : findEscrowRefiRate(countyZone, amount)
  const baseFeeAvailable = found !== null
  const baseFee = found ?? 0

  const additionalFees = activeFees(transactionType, selectedFeeIds)
    .filter(f => f.category === 'escrow')
    .map(toFeeLine)
  const additionalTotal = additionalFees.reduce((sum, f) => sum + f.fee, 0)

  return {
    included: true,
    baseFee,
    baseFeeAvailable,
    additionalFees,
    total: baseFee + additionalTotal,
  }
}

// ── Transfer Tax Calculation ────────────────────────────────────────────────

/**
 * transfer-taxes.json rows are keyed by zoneName + cityName ("All Cities" = zone default).
 *   countyPerThousand — county documentary transfer tax (normally $1.10)
 *   cityPerThousand   — flat city rate
 *   tierMode / tiers  — tiered city rates:
 *       'full'       bracket rate applies to the entire price (Oakland, Berkeley, Santa Monica, SF, Richmond...)
 *       'marginal'   graduated — each slice taxed at its own rate (Culver City)
 *       'additional' cityPerThousand on the full price PLUS the bracket rate on the full price (LA Measure ULA)
 * Cities without a row get the zone's "All Cities" row, or county-only $1.10 if there is none.
 */
interface TransferTaxRow {
  zoneName: string
  cityName: string
  countyPerThousand: number
  cityPerThousand: number
  tierMode: 'none' | 'full' | 'marginal' | 'additional'
  tiers: { upTo: number | null; perThousand: number }[]
  note: string
}

const transferTaxes = transferTaxesData as TransferTaxRow[]

function cityTaxFor(row: TransferTaxRow, price: number): { tax: number; label: string } {
  const perK = price / 1000
  const money = (n: number) => Math.round(n * 100) / 100
  const fmt = (r: number) => `$${r.toFixed(2)}/1,000`

  if (row.tierMode === 'none' || row.tiers.length === 0) {
    return { tax: money(perK * row.cityPerThousand), label: fmt(row.cityPerThousand) }
  }

  const bracket = row.tiers.find(t => t.upTo === null || price <= t.upTo) ?? row.tiers[row.tiers.length - 1]

  if (row.tierMode === 'full') {
    return { tax: money(perK * bracket.perThousand), label: fmt(bracket.perThousand) }
  }

  if (row.tierMode === 'additional') {
    const tax = money(perK * row.cityPerThousand + perK * bracket.perThousand)
    const label = bracket.perThousand > 0
      ? `${fmt(row.cityPerThousand)} + ${fmt(bracket.perThousand)}`
      : fmt(row.cityPerThousand)
    return { tax, label }
  }

  // marginal
  let tax = 0
  let lower = 0
  for (const t of row.tiers) {
    const upper = t.upTo === null ? Infinity : t.upTo
    if (price > lower) {
      const slice = Math.min(price, upper) - lower
      tax += (slice / 1000) * t.perThousand
    }
    if (price <= upper) break
    lower = upper
  }
  return { tax: money(tax), label: 'graduated' }
}

export function calculateTransferTaxes(
  countyZone: string,
  cityName: string,
  salesPrice: number,
  isPurchase: boolean
): TransferTaxResult {
  if (!isPurchase || salesPrice <= 0) {
    return { countyTax: 0, cityTax: 0, countyRate: 0, cityRate: 0, cityRateLabel: '', note: '', total: 0 }
  }

  const row =
    transferTaxes.find(t => t.zoneName === countyZone && t.cityName === cityName) ??
    transferTaxes.find(t => t.zoneName === countyZone && t.cityName === 'All Cities')

  const countyRate = row ? row.countyPerThousand : 1.10
  const countyTax = Math.round((salesPrice / 1000) * countyRate * 100) / 100

  const city = row ? cityTaxFor(row, salesPrice) : { tax: 0, label: '' }
  const cityRate = salesPrice > 0 ? Math.round((city.tax / salesPrice) * 1000 * 100) / 100 : 0

  return {
    countyTax,
    cityTax: city.tax,
    countyRate,
    cityRate,
    cityRateLabel: city.label,
    note: row?.note ?? '',
    total: Math.round((countyTax + city.tax) * 100) / 100,
  }
}

// ── Additional Fees (Recording, Other) ──────────────────────────────────────

export function getAdditionalFees(transactionType: TransactionType, selectedFeeIds?: number[]): FeeLine[] {
  return activeFees(transactionType, selectedFeeIds)
    .filter(f => f.category !== 'escrow')
    .map(toFeeLine)
}

// ── Rate basis (what the quote is priced on) ────────────────────────────────

export function getRateBasis(transactionType: TransactionType, refinanceProgram: RefinanceProgram = 'standard'): RateBasis {
  if (transactionType === 'purchase') {
    const s = rateSourcesData.purchase
    const eff = s.effectiveDate ? ` (eff. ${formatDate(s.effectiveDate)})` : ''
    return { underwriter: s.underwriter, manual: s.manual, effectiveDate: s.effectiveDate, label: `Title rates: ${s.underwriter}, ${s.manual}${eff}` }
  }
  const s = rateSourcesData.refinance
  const def = refinancePrograms[refinanceProgram] ?? refinancePrograms.standard
  return { underwriter: s.underwriter, manual: s.manual, effectiveDate: s.effectiveDate, label: `Title rates: ${s.underwriter}, ${def.label} (${def.manualSection})` }
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${m}/${d}/${y}`
}

// ── Main Calculator ─────────────────────────────────────────────────────────

export function calculate(input: CalculatorInput): CalculatorResult {
  const isPurchase = input.transactionType === 'purchase'
  const program = input.refinanceProgram ?? 'standard'

  // "Call for quote" when a rated amount is above the bracket tables
  let callForQuote = false
  let callForQuoteReason = ''
  if (isPurchase) {
    if (input.salesPrice > MAX_RATED_PURCHASE_AMOUNT || input.loanAmount > MAX_RATED_PURCHASE_AMOUNT) {
      callForQuote = true
      callForQuoteReason = `Purchases over $${MAX_RATED_PURCHASE_AMOUNT.toLocaleString()} require a custom quote.`
    }
  } else {
    const max = (refinancePrograms[program] ?? refinancePrograms.standard).maxAmount
    if (input.loanAmount > max) {
      callForQuote = true
      callForQuoteReason = `Refinance loans over $${max.toLocaleString()} require a custom quote.`
    }
  }

  const titleFees = calculateTitleFees(input)
  const escrowFees = calculateEscrowFees(input)
  const transferTaxes = calculateTransferTaxes(
    input.countyZone,
    input.cityName,
    input.salesPrice,
    isPurchase
  )
  const additionalFees = getAdditionalFees(input.transactionType, input.selectedFeeIds)
  const additionalFeesTotal = additionalFees.reduce((sum, f) => sum + f.fee, 0)

  if (escrowFees.included && !escrowFees.baseFeeAvailable) {
    callForQuote = true
    callForQuoteReason = callForQuoteReason
      ? `${callForQuoteReason} Escrow fees for this county are quoted on request.`
      : 'Escrow fees for this county are quoted on request; the total below does not include the base escrow fee.'
  }

  const grandTotal = Math.round((titleFees.total + escrowFees.total + transferTaxes.total + additionalFeesTotal) * 100) / 100

  return {
    titleFees,
    escrowFees,
    transferTaxes,
    additionalFees,
    additionalFeesTotal,
    grandTotal,
    callForQuote,
    callForQuoteReason,
    rateBasis: getRateBasis(input.transactionType, program),
    disclaimer: 'This is an estimate only. Actual fees may vary based on specific transaction details, property type, and lender requirements. Contact Pacific Coast Title for an official quote.',
  }
}

// ── County/City Utilities ───────────────────────────────────────────────────

export interface CountyOption {
  zoneName: string
  zoneId: number
  transactionType: string | null
}

export interface CityOption {
  id: number
  name: string
  transactionType: string | null
}

export function getCounties(transactionType?: TransactionType): CountyOption[] {
  const txnFilter = transactionType === 'refinance' ? 'Re-Finance' : 'All'

  return (countiesData as CountyOption[])
    .filter(c => {
      // Include zones that support "All" or the specific transaction type
      return c.transactionType === 'All' || c.transactionType === txnFilter || !c.transactionType
    })
    .sort((a, b) => a.zoneName.localeCompare(b.zoneName))
}

export function getCitiesForCounty(
  zoneName: string,
  transactionType?: TransactionType
): CityOption[] {
  const county = (countiesData as { zoneName: string; cities: CityOption[] }[]).find(
    c => c.zoneName === zoneName
  )
  if (!county) return []

  return county.cities
    .filter(c => c.name !== 'All Cities')
    .sort((a, b) => a.name.localeCompare(b.name))
}

// ── Endorsements Utility ────────────────────────────────────────────────────

/** List of endorsements available for a transaction type (for building a picker UI). */
export function getEndorsements(transactionType: TransactionType) {
  const txnType = transactionType === 'purchase' ? 'Resale' : 'Re-finance'
  return endorsements
    .filter(e => e.transactionType === txnType)
    .map(e => ({
      id: e.id,
      code: e.code,
      name: e.name,
      policy: e.policy,
      fee: e.fee,
      percent: e.percent,
      isDefault: e.isDefault,
      note: e.note ?? '',
    }))
}
