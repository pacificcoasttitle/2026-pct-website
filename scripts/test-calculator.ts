/**
 * Rate calculator regression tests.
 *
 *   npm run test:calculator
 *
 * Every expected value below was read by hand from the underwriter rate manuals:
 *   - Commonwealth (CLTIC) CA Title Rate Manual eff. 9/4/2026 — Part II Table R, Part VIII
 *   - Westcor CA Rate Manual — §3.17 Residential Refinance Rate, §11.2 Basic Rate, Section X
 * plus the city transfer tax schedule in data/calculator/transfer-taxes.json.
 * If a rate manual changes, update the data file AND the expectation here.
 */
import assert from 'node:assert/strict'
import { calculate, getFeeOptions, type CalculatorInput } from '../lib/calculator-engine'

let passed = 0
let failed = 0

function test(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  ok   ${name}`)
  } catch (err) {
    failed++
    console.log(`  FAIL ${name}`)
    console.log(`       ${(err as Error).message.split('\n')[0]}`)
  }
}

function purchase(overrides: Partial<CalculatorInput> & { salesPrice: number; loanAmount: number }) {
  return calculate({
    transactionType: 'purchase',
    countyZone: 'Orange',
    cityName: 'Irvine',
    selectedFeeIds: [],
    ...overrides,
  })
}

function refinance(loanAmount: number, overrides: Partial<CalculatorInput> = {}) {
  return calculate({
    transactionType: 'refinance',
    countyZone: 'Orange',
    cityName: 'Irvine',
    salesPrice: 0,
    loanAmount,
    selectedFeeIds: [],
    ...overrides,
  })
}

console.log('\nTitle — purchases (CLTIC Table R)')

test('$800k / $640k Irvine: ALTA Homeowner\'s = Table R $2,056 × 1.2', () => {
  const r = purchase({ salesPrice: 800_000, loanAmount: 640_000 })
  assert.equal(r.titleFees.ownerPolicy, 2467)
  assert.equal(r.titleFees.lenderPolicy, 1143)          // $630,001–640,000 concurrent
  assert.equal(r.titleFees.underwriter, 'Commonwealth Land Title Insurance Company')
})

test('$800k CLTA Standard = Table R $2,056', () => {
  const r = purchase({ salesPrice: 800_000, loanAmount: 640_000, ownerPolicyType: 'clta' })
  assert.equal(r.titleFees.ownerPolicy, 2056)
})

test('$1.6M / $1.2M: owner $3,124 × 1.2, lender $1,579', () => {
  const r = purchase({ salesPrice: 1_600_000, loanAmount: 1_200_000 })
  assert.equal(r.titleFees.ownerPolicy, 3749)
  assert.equal(r.titleFees.lenderPolicy, 1579)
})

test('$25k minimum bracket: owner $609 × 1.2, lender $463', () => {
  const r = purchase({ salesPrice: 25_000, loanAmount: 20_000 })
  assert.equal(r.titleFees.ownerPolicy, 731)
  assert.equal(r.titleFees.lenderPolicy, 463)
})

test('$3,000,000 top of table: $4,211 / $2,472', () => {
  const r = purchase({ salesPrice: 3_000_000, loanAmount: 3_000_000, ownerPolicyType: 'clta' })
  assert.equal(r.titleFees.ownerPolicy, 4211)
  assert.equal(r.titleFees.lenderPolicy, 2472)
  assert.equal(r.callForQuote, false)
})

test('$3.5M: over-$3M formula (+$5.25 / +$4.20 per $10k)', () => {
  const r = purchase({ salesPrice: 3_500_000, loanAmount: 3_500_000, ownerPolicyType: 'clta' })
  assert.equal(r.titleFees.ownerPolicy, 4211 + Math.round(5.25 * 50))   // 4474
  assert.equal(r.titleFees.lenderPolicy, 2472 + 4.20 * 50)               // 2682
})

test('$5.5M purchase is call-for-quote', () => {
  const r = purchase({ salesPrice: 5_500_000, loanAmount: 4_000_000 })
  assert.equal(r.callForQuote, true)
  assert.equal(r.titleFees.ownerPolicy, 0)
})

test('No owner\'s policy → no concurrent lender rate', () => {
  const r = purchase({ salesPrice: 800_000, loanAmount: 640_000, includeOwnerPolicy: false })
  assert.equal(r.titleFees.ownerPolicy, 0)
  assert.equal(r.titleFees.lenderPolicy, 0)
})

console.log('\nTitle — refinances (Westcor §3.17)')

test('$640k refi = $840', () => {
  const r = refinance(640_000)
  assert.equal(r.titleFees.lenderPolicy, 840)
  assert.equal(r.titleFees.underwriter, 'Westcor Land Title Insurance Company')
})

test('$1.2M refi = $1,550; $2.5M = $2,800; $7.5M = $5,900', () => {
  assert.equal(refinance(1_200_000).titleFees.lenderPolicy, 1550)
  assert.equal(refinance(2_500_000).titleFees.lenderPolicy, 2800)
  assert.equal(refinance(7_500_000).titleFees.lenderPolicy, 5900)
  assert.equal(refinance(7_500_000).callForQuote, false)
})

test('$10.5M refi is call-for-quote', () => {
  assert.equal(refinance(10_500_000).callForQuote, true)
})

test('Centralized program (§3.18): $640k = $680, over $5M call-for-quote', () => {
  assert.equal(refinance(640_000, { refinanceProgram: 'centralized' }).titleFees.lenderPolicy, 680)
  assert.equal(refinance(5_500_000, { refinanceProgram: 'centralized' }).callForQuote, true)
})

console.log('\nEndorsements')

test('Purchase defaults: 100-06 N/C, 110.9-06 $25, 116-06 N/C', () => {
  const r = purchase({ salesPrice: 800_000, loanAmount: 640_000 })
  const codes = r.titleFees.endorsements.map(e => e.code)
  assert.deepEqual(codes, ['CLTA 100-06 (ALTA 9-06)', 'CLTA 110.9-06 (ALTA 8.1-06)', 'CLTA 116-06'])
  assert.equal(r.titleFees.endorsementTotal, 25)
})

test('Owner 10% endorsement (100.12-06) = 10% of Table R $2,056 = $206', () => {
  const r = purchase({ salesPrice: 800_000, loanAmount: 640_000, selectedEndorsementIds: [4] })
  const e = r.titleFees.endorsements.find(x => x.id === 4)!
  assert.equal(e.fee, 206)
})

test('Owner endorsement does not attach without an owner\'s policy', () => {
  const r = purchase({ salesPrice: 800_000, loanAmount: 640_000, includeOwnerPolicy: false, selectedEndorsementIds: [4] })
  assert.equal(r.titleFees.endorsements.some(x => x.id === 4), false)
})

test('Refi 103.5 = 10% of Westcor Basic Rate ($1,823 at $640k) = $182', () => {
  const r = refinance(640_000, { selectedEndorsementIds: [23] })
  assert.equal(r.titleFees.endorsements.find(x => x.id === 23)!.fee, 182)
})

console.log('\nEscrow')

test('Orange $800k purchase escrow = $500 + $4/1,000 = $3,700', () => {
  const r = purchase({ salesPrice: 800_000, loanAmount: 640_000 })
  assert.equal(r.escrowFees.baseFee, 3700)
  assert.equal(r.escrowFees.baseFeeAvailable, true)
})

test('Contra Costa County zone resolves after rename', () => {
  const r = purchase({ salesPrice: 800_000, loanAmount: 640_000, countyZone: 'Contra Costa County', cityName: 'Concord' })
  assert.equal(r.escrowFees.baseFeeAvailable, true)
  assert.ok(r.escrowFees.baseFee > 0)
})

test('Zone with no escrow schedule → not available + call for quote', () => {
  const r = purchase({ salesPrice: 800_000, loanAmount: 640_000, countyZone: 'Fresno', cityName: 'All Cities' })
  assert.equal(r.escrowFees.baseFeeAvailable, false)
  assert.equal(r.escrowFees.baseFee, 0)
  assert.equal(r.callForQuote, true)
})

test('Independent escrow (includeEscrow=false): no escrow fee, no escrow add-ons, recording fees stay', () => {
  const r = purchase({ salesPrice: 800_000, loanAmount: 640_000, includeEscrow: false })
  assert.equal(r.escrowFees.included, false)
  assert.equal(r.escrowFees.total, 0)
  assert.equal(r.escrowFees.additionalFees.length, 0)
  assert.equal(r.callForQuote, false)
  assert.ok(r.additionalFees.length > 0)
  assert.equal(r.grandTotal, r.titleFees.total + r.transferTaxes.total + r.additionalFeesTotal)
})

test('Independent escrow in a zone with no escrow schedule is not call-for-quote', () => {
  const r = purchase({ salesPrice: 800_000, loanAmount: 640_000, countyZone: 'Fresno', cityName: 'All Cities', includeEscrow: false })
  assert.equal(r.callForQuote, false)
})

test('Fee options hide escrow-category fees when escrow is not included', () => {
  assert.equal(getFeeOptions('purchase', false).some(o => o.category === 'escrow'), false)
  assert.equal(getFeeOptions('purchase', true).some(o => o.category === 'escrow'), true)
})

console.log('\nOptional fees')

test('Optional fees are off unless selected', () => {
  const r = purchase({ salesPrice: 800_000, loanAmount: 640_000 })
  const names = [...r.escrowFees.additionalFees, ...r.additionalFees].map(f => f.name)
  assert.equal(names.includes('Home Warranty Fee'), false)
  assert.equal(names.includes('TC Fee'), false)
  assert.equal(names.includes('New Loan Fee'), true)
})

test('Selecting an optional fee adds it', () => {
  const opts = getFeeOptions('purchase')
  const hw = opts.find(o => o.name === 'Home Warranty Fee')!
  const r = purchase({ salesPrice: 800_000, loanAmount: 640_000, selectedFeeIds: [hw.id] })
  assert.equal(r.additionalFees.some(f => f.name === 'Home Warranty Fee'), true)
})

test('Omitting selectedFeeIds uses the defaultOn set (legacy clients)', () => {
  const r = calculate({ transactionType: 'purchase', countyZone: 'Orange', cityName: 'Irvine', salesPrice: 800_000, loanAmount: 640_000 })
  const optionalOn = [...r.escrowFees.additionalFees, ...r.additionalFees].filter(f => f.optional)
  assert.equal(optionalOn.length, getFeeOptions('purchase').filter(o => o.defaultOn).length)
})

console.log('\nTransfer taxes')

const tt = (zone: string, city: string, price: number) =>
  purchase({ salesPrice: price, loanAmount: 0, countyZone: zone, cityName: city }).transferTaxes

test('Glendale: county only ($1.10) — no phantom city tax', () => {
  const t = tt('Los Angeles County', 'Glendale', 800_000)
  assert.equal(t.countyTax, 880)
  assert.equal(t.cityTax, 0)
})

test('Los Angeles $800k: $4.50/1,000 city, no ULA', () => {
  const t = tt('Los Angeles County', 'Los Angeles', 800_000)
  assert.equal(t.cityTax, 3600)
  assert.equal(t.total, 4480)
})

test('Los Angeles $6M: $4.50 base + 4% ULA on full price', () => {
  const t = tt('Los Angeles County', 'Los Angeles', 6_000_000)
  assert.equal(t.cityTax, 27_000 + 240_000)
})

test('Culver City $2M: graduated $6,750 + 1.5% of $500k = $14,250', () => {
  const t = tt('Los Angeles County', 'Culver City', 2_000_000)
  assert.equal(t.cityTax, 14_250)
})

test('Oakland $1M: $15/1,000 bracket on full price', () => {
  assert.equal(tt('Alameda County', 'Oakland', 1_000_000).cityTax, 15_000)
})

test('Berkeley $2M: $25/1,000 above $1.6M', () => {
  assert.equal(tt('Alameda County', 'Berkeley', 2_000_000).cityTax, 50_000)
})

test('Richmond $2M: 1.25% bracket', () => {
  assert.equal(tt('Contra Costa County', 'Richmond', 2_000_000).cityTax, 25_000)
})

test('Riverside city $800k: $1.10 city; Temecula: county only', () => {
  assert.equal(tt('Riverside', 'Riverside', 800_000).cityTax, 880)
  assert.equal(tt('Riverside', 'Temecula', 800_000).cityTax, 0)
})

test('San Francisco $1.5M: combined $7.50/1,000, no separate county tax', () => {
  const t = tt('San Francisco', 'All Cities', 1_500_000)
  assert.equal(t.countyTax, 0)
  assert.equal(t.cityTax, 11_250)
})

test('Refinance has no transfer tax', () => {
  assert.equal(refinance(640_000).transferTaxes.total, 0)
})

console.log('\nRate basis')

test('Result reports which manual priced it', () => {
  assert.match(purchase({ salesPrice: 800_000, loanAmount: 640_000 }).rateBasis.label, /Commonwealth/)
  assert.match(refinance(640_000).rateBasis.label, /Westcor/)
})

console.log(`\n${passed} passed, ${failed} failed\n`)
if (failed > 0) process.exit(1)
