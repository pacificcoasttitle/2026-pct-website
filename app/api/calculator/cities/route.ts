import { NextRequest, NextResponse } from 'next/server'

// Cities by county with their transfer tax rates (per $1000 of sale price)
const citiesByCounty: Record<string, Array<{ id: string; name: string; transferTaxRate: number }>> = {
  'los-angeles': [
    { id: 'los-angeles-city', name: 'Los Angeles', transferTaxRate: 4.50 },
    { id: 'culver-city', name: 'Culver City', transferTaxRate: 4.50 },
    { id: 'pomona', name: 'Pomona', transferTaxRate: 2.20 },
    { id: 'santa-monica', name: 'Santa Monica', transferTaxRate: 3.00 },
    { id: 'long-beach', name: 'Long Beach', transferTaxRate: 1.10 },
    { id: 'pasadena', name: 'Pasadena', transferTaxRate: 1.10 },
    { id: 'glendale', name: 'Glendale', transferTaxRate: 1.10 },
    { id: 'other-la', name: 'Other (County Rate)', transferTaxRate: 1.10 },
  ],
  'orange': [
    { id: 'anaheim', name: 'Anaheim', transferTaxRate: 1.10 },
    { id: 'irvine', name: 'Irvine', transferTaxRate: 1.10 },
    { id: 'newport-beach', name: 'Newport Beach', transferTaxRate: 1.10 },
    { id: 'huntington-beach', name: 'Huntington Beach', transferTaxRate: 1.10 },
    { id: 'santa-ana', name: 'Santa Ana', transferTaxRate: 1.10 },
    { id: 'other-orange', name: 'Other (County Rate)', transferTaxRate: 1.10 },
  ],
  'san-diego': [
    { id: 'san-diego-city', name: 'San Diego', transferTaxRate: 1.10 },
    { id: 'chula-vista', name: 'Chula Vista', transferTaxRate: 1.10 },
    { id: 'oceanside', name: 'Oceanside', transferTaxRate: 1.10 },
    { id: 'carlsbad', name: 'Carlsbad', transferTaxRate: 1.10 },
    { id: 'other-sd', name: 'Other (County Rate)', transferTaxRate: 1.10 },
  ],
  'riverside': [
    { id: 'riverside-city', name: 'Riverside', transferTaxRate: 1.10 },
    { id: 'corona', name: 'Corona', transferTaxRate: 1.10 },
    { id: 'temecula', name: 'Temecula', transferTaxRate: 1.10 },
    { id: 'murrieta', name: 'Murrieta', transferTaxRate: 1.10 },
    { id: 'other-riverside', name: 'Other (County Rate)', transferTaxRate: 1.10 },
  ],
  'san-bernardino': [
    { id: 'ontario', name: 'Ontario', transferTaxRate: 1.10 },
    { id: 'rancho-cucamonga', name: 'Rancho Cucamonga', transferTaxRate: 1.10 },
    { id: 'fontana', name: 'Fontana', transferTaxRate: 1.10 },
    { id: 'san-bernardino-city', name: 'San Bernardino', transferTaxRate: 1.10 },
    { id: 'other-sb', name: 'Other (County Rate)', transferTaxRate: 1.10 },
  ],
  'ventura': [
    { id: 'ventura-city', name: 'Ventura', transferTaxRate: 1.10 },
    { id: 'oxnard', name: 'Oxnard', transferTaxRate: 1.10 },
    { id: 'thousand-oaks', name: 'Thousand Oaks', transferTaxRate: 1.10 },
    { id: 'simi-valley', name: 'Simi Valley', transferTaxRate: 1.10 },
    { id: 'other-ventura', name: 'Other (County Rate)', transferTaxRate: 1.10 },
  ],
  'santa-barbara': [
    { id: 'santa-barbara-city', name: 'Santa Barbara', transferTaxRate: 1.10 },
    { id: 'santa-maria', name: 'Santa Maria', transferTaxRate: 1.10 },
    { id: 'other-sb-county', name: 'Other (County Rate)', transferTaxRate: 1.10 },
  ],
  'kern': [
    { id: 'bakersfield', name: 'Bakersfield', transferTaxRate: 1.10 },
    { id: 'other-kern', name: 'Other (County Rate)', transferTaxRate: 1.10 },
  ],
  'san-luis-obispo': [
    { id: 'san-luis-obispo-city', name: 'San Luis Obispo', transferTaxRate: 1.10 },
    { id: 'other-slo', name: 'Other (County Rate)', transferTaxRate: 1.10 },
  ],
  'fresno': [
    { id: 'fresno-city', name: 'Fresno', transferTaxRate: 1.10 },
    { id: 'clovis', name: 'Clovis', transferTaxRate: 1.10 },
    { id: 'other-fresno', name: 'Other (County Rate)', transferTaxRate: 1.10 },
  ],
  'sacramento': [
    { id: 'sacramento-city', name: 'Sacramento', transferTaxRate: 2.75 },
    { id: 'elk-grove', name: 'Elk Grove', transferTaxRate: 1.10 },
    { id: 'other-sac', name: 'Other (County Rate)', transferTaxRate: 1.10 },
  ],
  'alameda': [
    { id: 'oakland', name: 'Oakland', transferTaxRate: 15.00 },
    { id: 'berkeley', name: 'Berkeley', transferTaxRate: 15.00 },
    { id: 'alameda-city', name: 'Alameda', transferTaxRate: 12.00 },
    { id: 'hayward', name: 'Hayward', transferTaxRate: 8.50 },
    { id: 'fremont', name: 'Fremont', transferTaxRate: 1.10 },
    { id: 'other-alameda', name: 'Other (County Rate)', transferTaxRate: 1.10 },
  ],
  'contra-costa': [
    { id: 'richmond', name: 'Richmond', transferTaxRate: 7.00 },
    { id: 'el-cerrito', name: 'El Cerrito', transferTaxRate: 12.00 },
    { id: 'walnut-creek', name: 'Walnut Creek', transferTaxRate: 1.10 },
    { id: 'concord', name: 'Concord', transferTaxRate: 1.10 },
    { id: 'other-cc', name: 'Other (County Rate)', transferTaxRate: 1.10 },
  ],
  'santa-clara': [
    { id: 'san-jose', name: 'San Jose', transferTaxRate: 3.30 },
    { id: 'palo-alto', name: 'Palo Alto', transferTaxRate: 3.30 },
    { id: 'mountain-view', name: 'Mountain View', transferTaxRate: 3.30 },
    { id: 'sunnyvale', name: 'Sunnyvale', transferTaxRate: 1.10 },
    { id: 'other-sc', name: 'Other (County Rate)', transferTaxRate: 1.10 },
  ],
  'san-mateo': [
    { id: 'san-mateo-city', name: 'San Mateo', transferTaxRate: 5.00 },
    { id: 'redwood-city', name: 'Redwood City', transferTaxRate: 1.10 },
    { id: 'other-sm', name: 'Other (County Rate)', transferTaxRate: 1.10 },
  ],
  'san-francisco': [
    { id: 'san-francisco-city', name: 'San Francisco', transferTaxRate: 6.80 },
  ],
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const county = searchParams.get('county')

  if (!county) {
    return NextResponse.json({ error: 'County parameter is required' }, { status: 400 })
  }

  const cities = citiesByCounty[county] || []
  return NextResponse.json({ cities })
}
