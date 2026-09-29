import { NextRequest, NextResponse } from 'next/server'
import {
  calculate,
  getFeeOptions,
  getEndorsements,
  getRateBasis,
  type CalculatorInput,
} from '@/lib/calculator-engine'

interface FeeRequest {
  transactionType: 'purchase' | 'refinance'
  countyZone: string
  cityName: string
  salesPrice?: number
  loanAmount: number
  ownerPolicyType?: 'clta' | 'alta'
  lenderPolicyType?: 'clta' | 'alta'
  refinanceProgram?: 'standard' | 'centralized'
  selectedEndorsementIds?: number[]
  selectedFeeIds?: number[]
  includeOwnerPolicy?: boolean
  includeEscrow?: boolean
}

// GET /api/calculator/fees?type=purchase|refinance
// Options the form needs before a quote: optional fees (checkboxes), endorsements, rate basis.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') === 'refinance' ? 'refinance' : 'purchase'
  return NextResponse.json({
    transactionType: type,
    feeOptions: getFeeOptions(type),
    endorsements: getEndorsements(type),
    rateBasis: getRateBasis(type),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body: FeeRequest = await request.json()

    const input: CalculatorInput = {
      transactionType: body.transactionType,
      countyZone: body.countyZone,
      cityName: body.cityName,
      salesPrice: body.transactionType === 'purchase' ? (body.salesPrice || 0) : 0,
      loanAmount: body.loanAmount,
      ownerPolicyType: body.ownerPolicyType || 'alta',
      lenderPolicyType: body.lenderPolicyType || 'alta',
      // The centralized refinance rate has eligibility requirements, so the public
      // calculator always quotes the standard residential refinance rate.
      refinanceProgram: 'standard',
      selectedEndorsementIds: body.selectedEndorsementIds || [],
      selectedFeeIds: Array.isArray(body.selectedFeeIds) ? body.selectedFeeIds : undefined,
      includeOwnerPolicy: body.includeOwnerPolicy !== false,
      // Most customers use an independent escrow, so PCT escrow is opt-in.
      includeEscrow: body.includeEscrow === true,
    }

    const result = calculate(input)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Fee calculation error:', error)
    return NextResponse.json({ error: 'Failed to calculate fees' }, { status: 500 })
  }
}
