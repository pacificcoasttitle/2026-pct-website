import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAdminToken, ADMIN_COOKIE } from '@/lib/admin-auth'
import { updateEmployee, getEmployeeAdminBySlug } from '@/lib/admin-db'

async function requireAuth() {
  const jar   = await cookies()
  const token = jar.get(ADMIN_COOKIE)?.value
  if (!token) return null
  return verifyAdminToken(token)
}

// GET — fetch single employee
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const emp = await getEmployeeAdminBySlug(slug)
  if (!emp) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(emp)
}

// PATCH — update employee fields
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await requireAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const body = await req.json()

  // Whitelist of editable fields
  const allowed = [
    'first_name', 'last_name', 'title', 'email', 'phone', 'mobile',
    'bio', 'photo_url', 'languages', 'specialties', 'linkedin',
    'office_id', 'department_id', 'active', 'featured', 'website_active',
    'website_bio', 'website_specialties', 'website_custom_title',
    'website_meta_description', 'mailchimp_audience_id', 'mailchimp_form_code',
  ]

  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }

  const updated = await updateEmployee(slug, data)
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(updated)
}
