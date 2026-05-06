import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { isAuthenticated } from '@/lib/admin-auth'
import { createEmployee } from '@/lib/admin-db'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const first_name = String(body.first_name || '').trim()
  const last_name  = String(body.last_name  || '').trim()
  if (!first_name || !last_name) {
    return NextResponse.json({ error: 'First name and last name are required.' }, { status: 400 })
  }

  try {
    const created = await createEmployee({
      first_name,
      last_name,
      title:           body.title          ? String(body.title)          : undefined,
      email:           body.email          ? String(body.email)          : undefined,
      mobile:          body.mobile         ? String(body.mobile)         : undefined,
      phone:           body.phone          ? String(body.phone)          : undefined,
      office_id:       body.office_id      != null ? Number(body.office_id)      : null,
      department_id:   body.department_id  != null ? Number(body.department_id)  : null,
      sms_code:        body.sms_code       ? String(body.sms_code)       : undefined,
      active:          body.active         === false ? false : true,
      website_active:  body.website_active === true,
      bio:             body.bio            ? String(body.bio)             : undefined,
      website_bio:     body.website_bio    ? String(body.website_bio)     : undefined,
      photo_url:       body.photo_url      ? String(body.photo_url)       : undefined,
    })

    revalidatePath('/admin/team/employees')

    return NextResponse.json({ success: true, employee: created }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create employee'
    const status  = /already/i.test(message) ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
