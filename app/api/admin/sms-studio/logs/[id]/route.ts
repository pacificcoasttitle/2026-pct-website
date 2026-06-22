import { NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/auth/guards'
import { getSmsSendLog } from '@/lib/admin-db'

export const runtime = 'nodejs'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole('sms')
  if ('error' in auth) return auth.error
  const { id } = await params
  const numId = Number(id)
  if (!Number.isFinite(numId) || numId <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }
  const data = await getSmsSendLog(numId)
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
