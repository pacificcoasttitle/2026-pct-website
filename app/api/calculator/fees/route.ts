import { NextRequest, NextResponse } from 'next/server'
import { calculate, type CalculatorInput } from '@/lib/calculator-engine'

interface FeeRequest {
  transactionType: 'purchase' | 'refinance'
  countyZone: string
  cityName: string
  salesPrice?: number
  loanAmount: number
  ownerPolicyType?: 'clta' | 'alta'
  lenderPolicyType?: 'clta' | 'alta'
  selectedEndorsementIds?: number[]
  includeOwnerPolicy?: boolean
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
      ownerPolicyType: body.ownerPolicyType || 'clta',
      lenderPolicyType: body.lenderPolicyType || 'clta',
      selectedEndorsementIds: body.selectedEndorsementIds || [],
      includeOwnerPolicy: body.includeOwnerPolicy !== false,
    }

    const result = calculate(input)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Fee calculation error:', error)
    return NextResponse.json({ error: 'Failed to calculate fees' }, { status: 500 })
  }
}
