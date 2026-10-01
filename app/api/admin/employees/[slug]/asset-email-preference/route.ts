import { NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/auth/guards'
import { getEmployeeAdminBySlug, getRepAssetEmailEnabled, setRepAssetEmailEnabled } from '@/lib/admin-db'

type Context = { params: Promise<{ slug: string }> }

export async function GET(_request: Request, { params }: Context) {
  const auth = await requireApiRole('employees')
  if ('error' in auth) return auth.error
  const rep = await getEmployeeAdminBySlug((await params).slug)
  if (!rep) return NextResponse.json({ error: 'Rep not found' }, { status: 404 })
  return NextResponse.json({ enabled: await getRepAssetEmailEnabled(rep.id) })
}

export async function PATCH(request: Request, { params }: Context) {
  const auth = await requireApiRole('employees')
  if ('error' in auth) return auth.error
  const body = await request.json().catch(() => null)
  if (typeof body?.enabled !== 'boolean') {
    return NextResponse.json({ error: 'enabled must be a boolean' }, { status: 400 })
  }
  const rep = await getEmployeeAdminBySlug((await params).slug)
  if (!rep) return NextResponse.json({ error: 'Rep not found' }, { status: 404 })
  const enabled = await setRepAssetEmailEnabled(rep.id, body.enabled, auth.session.username || 'unknown')
  if (enabled === null) return NextResponse.json({ error: 'Rep not found' }, { status: 404 })
  return NextResponse.json({ enabled })
}
