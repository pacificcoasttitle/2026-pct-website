/**
 * PCT Rate Calculator Engine
 *
 * Title premiums come from data/calculator/title-rates.json, which is built from
 * the current underwriter rate manuals:
 *   - Purchases:  Commonwealth Land Title (CLTIC) CA Rate Manual, eff. 9/4/2026,
 *                 Part II Insurance Rate Table "R" Residential Owner's / Lender's Concurrent.
 *   - Refinances: Westcor CA Rate Manual, Section 3.17 Residential Refinance Rate.
 *   - basicRate:  Westcor Section 11.2 Basic Rate, used only as the base for
 *                 percentage-priced refinance endorsements.
 * All rates are in whole dollars (stored as integers in the data).
 */

import titleRatesData from '@/data/calculator/title-rates.json'
import escrowResaleData from '@/data/calculator/escrow-resale.json'
import escrowRefinanceData from '@/data/calculator/escrow-refinance.json'
import feesData from '@/data/calculator/fees.json'
import endorsementsData from '@/data/calculator/endorsements.json'
import transferTaxesData from '@/data/calculator/transfer-taxes.json'
import countiesData from '@/data/calculator/counties.json'

// ── Types ───────────────────────────────────────────────────────────────────

export type TransactionType = 'purchase' | 'refinance'
export type OwnerPolicyType = 'clta' | 'alta' // CLTA Standard vs ALTA Homeowner's
export type LenderPolicyType = 'clta' | 'alta' // Kept for API compatibility; purchases always price the concurrent lender column

export const PURCHASE_UNDERWRITER = 'Commonwealth Land Title Insurance Company'
export const REFINANCE_UNDERWRITER = 'Westcor Land Title Insurance Company'

/** Highest amount the bracket table covers. Above this we ask the user to call. */
const MAX_RATED_AMOUNT = 5_000_000

export interface CalculatorInput {
  transactionType: TransactionType
  countyZone: string          // e.g. "Orange", "Los Angeles County"
  cityName: string            // e.g. "Irvine"
  salesPrice: number          // Purchase: property sale price; Refinance: 0
  loanAmount: number          // Loan/mortgage amount
  ownerPolicyType?: OwnerPolicyType    // Purchase only
  lenderPolicyType?: LenderPolicyType  // Accepted but not used for pricing (see note above)
  selectedEndorsementIds?: number[]    // Optional endorsements
  includeOwnerPolicy?: boolean         // Purchase: usually true
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

export interface EscrowFees {
  baseFee: number
  additionalFees: { name: string; fee: number }[]
  total: number
}

export interface TransferTaxResult {
  countyTax: number
  cityTax: number
  countyRate: number
  cityRate: number
  total: number
}

export interface CalculatorResult {
  titleFees: TitleFees
  escrowFees: EscrowFees
  transferTaxes: TransferTaxResult
  additionalFees: { name: string; fee: number; category: string }[]
  additionalFeesTotal: number
  grandTotal: number
  callForQuote: boolean   // true if the amount is above the rated range
  disclaimer: string
}

// ── Title Rate Lookup ───────────────────────────────────────────────────────

interface TitleRateRow {
  minRange: number
  maxRange: number
  ownerRate: number        // CLTIC Table R Residential Owner's — CLTA Standard owner's policy
  homeOwnerRate: number    // ALTA Homeowner's — Table R + 20% surcharge, min $480 (CLTIC 2.1.B.1)
  conLoanRate: number      // CLTIC Table R Lender's Concurrent
  resiLoanRate: number     // Westcor 3.17 Residential Refinance Rate
  basicRate: number        // Westcor 11.2 Basic Rate (base for % endorsements on refinances)
}

const titleRates = titleRatesData as TitleRateRow[]

function lookupTitleRate(amount: number): TitleRateRow | null {
  if (amount <= 0) return null
  const row = titleRates.find(r => amount >= r.minRange && amount <= r.maxRange)
  return row || null
}

// ── Endorsement Pricing ─────────────────────────────────────────────────────

/**
 * Endorsement rows are flat so the admin JSON editor can render them.
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
    selectedEndorsementIds = [],
    includeOwnerPolicy = true,
  } = input

  const isPurchase = transactionType === 'purchase'
  const underwriter = isPurchase ? PURCHASE_UNDERWRITER : REFINANCE_UNDERWRITER
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
    const row = lookupTitleRate(loanAmount)
    if (isPurchase) {
      // Purchase: CLTIC Lender's Concurrent rate. If no owner's policy is issued
      // the concurrent rate does not apply and the quote should be handled manually.
      lenderPolicy = row && ownerIssued ? row.conLoanRate : 0
      lenderPolicyLabel = 'ALTA Lender\'s Policy (Concurrent)'
    } else {
      // Refinance: Westcor 3.17 Residential Refinance Rate
      lenderPolicy = row ? row.resiLoanRate : 0
      lenderPolicyLabel = 'ALTA Loan Policy (Residential Refinance Rate)'
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

function findEscrowResaleRate(zone: string, amount: number): number {
  const rows = (escrowResaleData as EscrowResaleRow[]).filter(
    r => r.county === `${zone}__All`
  )

  const row = rows.find(r => {
    const min = r.minRange
    const max = r.maxRange ?? Infinity
    return amount >= min && amount <= max
  })

  if (!row) return 0

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

function findEscrowRefiRate(zone: string, amount: number): number {
  // Try zone-specific first
  let rows = (escrowRefinanceData as EscrowRefiRow[]).filter(
    r => r.county === `${zone}__All` || r.county === `${zone}__Re-Finance`
  )

  if (rows.length === 0) {
    // Fall back to zone-based matching
    rows = (escrowRefinanceData as EscrowRefiRow[]).filter(
      r => r.county.startsWith(zone)
    )
  }

  const row = rows.find(r => {
    const min = r.minRange
    const max = r.maxRange ?? Infinity
    return amount >= min && amount <= max
  })

  return row ? row.escrowRate : 0
}

export function calculateEscrowFees(input: CalculatorInput): EscrowFees {
  const { transactionType, countyZone, salesPrice, loanAmount } = input
  const isPurchase = transactionType === 'purchase'
  const amount = isPurchase ? salesPrice : loanAmount

  let baseFee = 0
  if (isPurchase) {
    baseFee = findEscrowResaleRate(countyZone, amount)
  } else {
    baseFee = findEscrowRefiRate(countyZone, amount)
  }

  // Additional active fees from the fees table for this transaction type
  const txnKey = isPurchase ? 'resale' : 'refinance'
  const activeFees = feesData.filter(
    f => f.active && f.transactionType === txnKey && f.category === 'escrow'
  )
  const additionalFees = activeFees.map(f => ({
    name: f.name,
    fee: f.value,
  }))

  const additionalTotal = additionalFees.reduce((sum, f) => sum + f.fee, 0)

  return {
    baseFee,
    additionalFees,
    total: baseFee + additionalTotal,
  }
}

// ── Transfer Tax Calculation ────────────────────────────────────────────────

interface TransferTaxRow {
  countyId: number
  zoneName: string
  countyTaxPerThousand: number
  cityTaxPerThousand: number
}

export function calculateTransferTaxes(
  countyZone: string,
  cityName: string,
  salesPrice: number,
  isPurchase: boolean
): TransferTaxResult {
  if (!isPurchase || salesPrice <= 0) {
    return { countyTax: 0, cityTax: 0, countyRate: 0, cityRate: 0, total: 0 }
  }

  // Find the transfer tax row for this zone/city
  const taxes = transferTaxesData as TransferTaxRow[]

  // Look up the city's specific tax rate first
  // The county_id in transfer_taxes maps to county_id_pk in county_mst
  // Find the city in countiesData to get its county_id
  const countyData = countiesData.find(
    (c: { zoneName: string }) => c.zoneName === countyZone
  )
  let cityEntry = null
  if (countyData) {
    cityEntry = (countyData as { cities: { id: number; name: string }[] }).cities.find(
      (c: { name: string }) => c.name === cityName
    )
  }

  // Try to find a specific tax row for this city's county_id
  let taxRow: TransferTaxRow | undefined
  if (cityEntry) {
    taxRow = taxes.find(t => t.countyId === (cityEntry as { id: number }).id)
  }

  // Fall back to zone-level "All Cities" entry
  if (!taxRow) {
    // Find the "All Cities" entry for this zone
    const allCitiesEntry = countiesData.find(
      (c: { zoneName: string }) => c.zoneName === countyZone
    )
    if (allCitiesEntry) {
      const allCities = (allCitiesEntry as { cities: { id: number; name: string }[] }).cities.find(
        (c: { name: string }) => c.name === 'All Cities'
      )
      if (allCities) {
        taxRow = taxes.find(t => t.countyId === (allCities as { id: number }).id)
      }
    }
  }

  // Default to standard county rate if no specific entry found
  const countyRate = taxRow ? taxRow.countyTaxPerThousand : 1.10
  const cityRate = taxRow ? taxRow.cityTaxPerThousand : 0

  const countyTax = Math.round((salesPrice / 1000) * countyRate * 100) / 100
  const cityTax = Math.round((salesPrice / 1000) * cityRate * 100) / 100

  return {
    countyTax,
    cityTax,
    countyRate,
    cityRate,
    total: countyTax + cityTax,
  }
}

// ── Additional Fees (Recording, Other) ──────────────────────────────────────

export function getAdditionalFees(transactionType: TransactionType) {
  const txnKey = transactionType === 'purchase' ? 'resale' : 'refinance'
  return feesData
    .filter(f => f.active && f.transactionType === txnKey && f.category !== 'escrow')
    .map(f => ({
      name: f.name,
      fee: f.value,
      category: f.category,
    }))
}

// ── Main Calculator ─────────────────────────────────────────────────────────

export function calculate(input: CalculatorInput): CalculatorResult {
  const isPurchase = input.transactionType === 'purchase'

  // "Call for quote" when any rated amount is above the bracket table
  const amounts = isPurchase ? [input.salesPrice, input.loanAmount] : [input.loanAmount]
  const callForQuote = amounts.some(a => a > MAX_RATED_AMOUNT)

  const titleFees = calculateTitleFees(input)
  const escrowFees = calculateEscrowFees(input)
  const transferTaxes = calculateTransferTaxes(
    input.countyZone,
    input.cityName,
    input.salesPrice,
    isPurchase
  )
  const additionalFees = getAdditionalFees(input.transactionType)
  const additionalFeesTotal = additionalFees.reduce((sum, f) => sum + f.fee, 0)

  const grandTotal = titleFees.total + escrowFees.total + transferTaxes.total + additionalFeesTotal

  return {
    titleFees,
    escrowFees,
    transferTaxes,
    additionalFees,
    additionalFeesTotal,
    grandTotal,
    callForQuote,
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
