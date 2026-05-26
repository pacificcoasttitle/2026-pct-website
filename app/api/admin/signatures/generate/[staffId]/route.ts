import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isAuthenticated, verifyAdminToken, ADMIN_COOKIE } from '@/lib/admin-auth'
import { renderSignatureForStaff, SignatureRenderError } from '@/lib/signature-renderer'

export const runtime = 'nodejs'

async function getActorEmail(): Promise<string | null> {
  try {
    const jar = await cookies()
    const token = jar.get(ADMIN_COOKIE)?.value
    if (!token) return null
    const session = await verifyAdminToken(token)
    return session?.username || null
  } catch {
    return null
  }
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ staffId: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { staffId: staffIdRaw } = await params
  const staffId = parseInt(staffIdRaw, 10)
  if (!Number.isFinite(staffId) || staffId <= 0) {
    return NextResponse.json({ error: 'Invalid staff id' }, { status: 400 })
  }

  const adminEmail = (await getActorEmail()) || 'unknown'

  try {
    const { staff, template, html } = await renderSignatureForStaff(staffId)

    console.log(
      `[signature-generate] admin=${adminEmail} staff_id=${staffId} template=${template.name} length=${html.length}`
    )

    return NextResponse.json({
      staff_id:      staff.id,
      staff_name:    `${staff.first_name} ${staff.last_name}`,
      staff_email:   staff.email,
      template_id:   template.id,
      template_name: template.name,
      html,
      generated_at:  new Date().toISOString(),
    })
  } catch (err) {
    if (err instanceof SignatureRenderError) {
      if (err.code === 'STAFF_NOT_FOUND') {
        return NextResponse.json({ error: err.message }, { status: 404 })
      }
      console.error(`[signature-generate] ${err.code}:`, err.message)
      return NextResponse.json({ error: err.message }, { status: 500 })
    }
    console.error('[signature-generate] unexpected error:', err)
    return NextResponse.json({ error: 'Failed to render signature' }, { status: 500 })
  }
}
