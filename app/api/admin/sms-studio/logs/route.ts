import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getSmsSendLogs } from '@/lib/admin-db'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const url = new URL(req.url)
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || 25)))
  const logs = await getSmsSendLogs(limit)
  return NextResponse.json({ logs })
}
