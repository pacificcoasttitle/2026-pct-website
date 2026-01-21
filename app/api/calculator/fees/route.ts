import { NextRequest, NextResponse } from 'next/server'

interface FeeRequest {
  transactionType: 'purchase' | 'refinance'
  county: string
  city: string
  salesPrice?: number
  loanAmount: number
  cityTransferTaxRate: number
}

interface FeeBreakdown {
  titleInsurance: {
    ownerPolicy: number
    lenderPolicy: number
    endorsements: number
    total: number
  }
  escrowFees: {
    baseFee: number
    documentPreparation: number
    notaryFees: number
    wireTransfer: number
    courierFees: number
    total: number
  }
  transferTaxes: {
    county: number
    city: number
    total: number
  }
  recordingFees: {
    deed: number
    mortgage: number
    total: number
  }
  grandTotal: number
}

// Title insurance rate calculation (simplified CLTA/ALTA rates)
function calculateOwnerPolicyPremium(salesPrice: number): number {
  if (salesPrice <= 0) return 0
  
  // Tiered premium structure (simplified)
  let premium = 0
  
  if (salesPrice <= 100000) {
    premium = salesPrice * 0.00575
  } else if (salesPrice <= 500000) {
    premium = 575 + (salesPrice - 100000) * 0.00429
  } else if (salesPrice <= 1000000) {
    premium = 575 + 1716 + (salesPrice - 500000) * 0.00352
  } else if (salesPrice <= 5000000) {
    premium = 575 + 1716 + 1760 + (salesPrice - 1000000) * 0.00275
  } else {
    premium = 575 + 1716 + 1760 + 11000 + (salesPrice - 5000000) * 0.00225
  }
  
  return Math.round(premium * 100) / 100
}

function calculateLenderPolicyPremium(loanAmount: number, hasOwnerPolicy: boolean): number {
  if (loanAmount <= 0) return 0
  
  // Simultaneous issue discount when owner policy is also issued
  const multiplier = hasOwnerPolicy ? 0.4 : 1.0
  
  let premium = 0
  
  if (loanAmount <= 100000) {
    premium = loanAmount * 0.00375
  } else if (loanAmount <= 500000) {
    premium = 375 + (loanAmount - 100000) * 0.00275
  } else if (loanAmount <= 1000000) {
    premium = 375 + 1100 + (loanAmount - 500000) * 0.00225
  } else {
    premium = 375 + 1100 + 1125 + (loanAmount - 1000000) * 0.00175
  }
  
  return Math.round(premium * multiplier * 100) / 100
}

function calculateEscrowFees(amount: number): number {
  // Base escrow fee calculation
  const baseFee = 250 + (amount / 1000) * 2
  return Math.min(Math.max(baseFee, 350), 2500)
}

export async function POST(request: NextRequest) {
  try {
    const body: FeeRequest = await request.json()
    const { transactionType, salesPrice, loanAmount, cityTransferTaxRate } = body

    const isPurchase = transactionType === 'purchase'
    const effectiveSalesPrice = isPurchase ? (salesPrice || 0) : 0
    const baseAmount = isPurchase ? effectiveSalesPrice : loanAmount

    // Title Insurance
    const ownerPolicy = isPurchase ? calculateOwnerPolicyPremium(effectiveSalesPrice) : 0
    const lenderPolicy = calculateLenderPolicyPremium(loanAmount, isPurchase)
    const endorsements = isPurchase ? 150 : 100 // Standard endorsements

    // Escrow Fees
    const baseFee = calculateEscrowFees(baseAmount)
    const documentPreparation = 125
    const notaryFees = 75
    const wireTransfer = 35
    const courierFees = 50

    // Transfer Taxes (only for purchases)
    const countyTransferTax = isPurchase ? (effectiveSalesPrice / 1000) * 1.10 : 0
    const cityTransferTax = isPurchase ? (effectiveSalesPrice / 1000) * cityTransferTaxRate : 0

    // Recording Fees
    const deedRecording = isPurchase ? 75 : 0
    const mortgageRecording = 125

    const breakdown: FeeBreakdown = {
      titleInsurance: {
        ownerPolicy,
        lenderPolicy,
        endorsements,
        total: ownerPolicy + lenderPolicy + endorsements,
      },
      escrowFees: {
        baseFee: Math.round(baseFee * 100) / 100,
        documentPreparation,
        notaryFees,
        wireTransfer,
        courierFees,
        total: Math.round((baseFee + documentPreparation + notaryFees + wireTransfer + courierFees) * 100) / 100,
      },
      transferTaxes: {
        county: Math.round(countyTransferTax * 100) / 100,
        city: Math.round(cityTransferTax * 100) / 100,
        total: Math.round((countyTransferTax + cityTransferTax) * 100) / 100,
      },
      recordingFees: {
        deed: deedRecording,
        mortgage: mortgageRecording,
        total: deedRecording + mortgageRecording,
      },
      grandTotal: 0,
    }

    breakdown.grandTotal = Math.round(
      (breakdown.titleInsurance.total +
        breakdown.escrowFees.total +
        breakdown.transferTaxes.total +
        breakdown.recordingFees.total) * 100
    ) / 100

    return NextResponse.json(breakdown)
  } catch (error) {
    console.error('Fee calculation error:', error)
    return NextResponse.json({ error: 'Failed to calculate fees' }, { status: 500 })
  }
}
