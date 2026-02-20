import { NextRequest, NextResponse } from 'next/server'
import { getCounties } from '@/lib/calculator-engine'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const txnType = searchParams.get('type') as 'purchase' | 'refinance' | null

  const counties = getCounties(txnType || undefined)

  // Deduplicate by zoneName and format for the UI
  const seen = new Set<string>()
  const unique = counties.filter(c => {
    if (seen.has(c.zoneName)) return false
    seen.add(c.zoneName)
    return true
  })

  return NextResponse.json({
    counties: unique.map(c => ({
      id: c.zoneName,
      name: c.zoneName,
    })),
  })
}
