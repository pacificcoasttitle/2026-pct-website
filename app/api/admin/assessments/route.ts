import { NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/auth/guards'
import { getAssessments } from '@/lib/admin-db'

export async function GET() {
  const auth = await requireApiRole('assessments')
  if ('error' in auth) return auth.error
  const rows = await getAssessments(300)
  return NextResponse.json(rows)
}

