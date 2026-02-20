import { NextRequest, NextResponse } from 'next/server'
import { getCitiesForCounty } from '@/lib/calculator-engine'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const county = searchParams.get('county')
  const txnType = searchParams.get('type') as 'purchase' | 'refinance' | null

  if (!county) {
    return NextResponse.json({ error: 'County parameter is required' }, { status: 400 })
  }

  const cities = getCitiesForCounty(county, txnType || undefined)

  return NextResponse.json({
    cities: cities.map(c => ({
      id: c.name,
      name: c.name,
    })),
  })
}
