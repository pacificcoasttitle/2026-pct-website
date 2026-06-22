import { NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/auth/guards'
import { getSmsSendLogs } from '@/lib/admin-db'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  const auth = await requireApiRole('sms')
  if ('error' in auth) return auth.error
  const url = new URL(req.url)
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || 25)))
  const logs = await getSmsSendLogs(limit)
  return NextResponse.json({ logs })
}
