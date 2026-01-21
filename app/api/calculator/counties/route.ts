import { NextResponse } from 'next/server'

// California counties served by PCT
const counties = [
  { id: 'los-angeles', name: 'Los Angeles' },
  { id: 'orange', name: 'Orange' },
  { id: 'san-diego', name: 'San Diego' },
  { id: 'riverside', name: 'Riverside' },
  { id: 'san-bernardino', name: 'San Bernardino' },
  { id: 'ventura', name: 'Ventura' },
  { id: 'santa-barbara', name: 'Santa Barbara' },
  { id: 'kern', name: 'Kern' },
  { id: 'san-luis-obispo', name: 'San Luis Obispo' },
  { id: 'fresno', name: 'Fresno' },
  { id: 'sacramento', name: 'Sacramento' },
  { id: 'alameda', name: 'Alameda' },
  { id: 'contra-costa', name: 'Contra Costa' },
  { id: 'santa-clara', name: 'Santa Clara' },
  { id: 'san-mateo', name: 'San Mateo' },
  { id: 'san-francisco', name: 'San Francisco' },
]

export async function GET() {
  return NextResponse.json({ counties })
}
