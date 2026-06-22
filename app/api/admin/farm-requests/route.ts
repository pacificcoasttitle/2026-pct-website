import { NextRequest, NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/auth/guards'
import { getAllFarmRequests, updateFarmStatus } from '@/lib/admin-db'

export async function GET() {
  const auth = await requireApiRole('farms')
  if ('error' in auth) return auth.error
  const data = await getAllFarmRequests()
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const auth = await requireApiRole('farms')
  if ('error' in auth) return auth.error
  const { id, status } = await req.json()
  if (!id || !status) {
    return NextResponse.json({ error: 'id and status required' }, { status: 400 })
  }
  await updateFarmStatus(id, status)
  return NextResponse.json({ success: true })
}
