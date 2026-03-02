import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getAssessments } from '@/lib/admin-db'

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const rows = await getAssessments(300)
  return NextResponse.json(rows)
}

