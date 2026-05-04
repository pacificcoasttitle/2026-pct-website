import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getSmsSendLog } from '@/lib/admin-db'

export const runtime = 'nodejs'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const numId = Number(id)
  if (!Number.isFinite(numId) || numId <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  const data = await getSmsSendLog(numId)
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
