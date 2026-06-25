import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireApiRole } from '@/lib/auth/guards'
import { updateEmployee, getEmployeeAdminBySlug } from '@/lib/admin-db'

// GET — fetch single employee
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = await requireApiRole('employees')
  if ('error' in auth) return auth.error

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
  const auth = await requireApiRole('employees')
  if ('error' in auth) return auth.error

  const { slug } = await params
  const body = await req.json()

  // Whitelist of editable fields.
  //
  // ⚠️ HR-sync Stage 7 (design §5): the SHARED identity fields — first_name,
  // last_name, title, email, phone, mobile, photo_url, office_id,
  // department_id, active — are managed in HR and are deliberately NOT in
  // this allowlist. Even a direct API call cannot mutate them here; HR is
  // the sole editor. The values still flow DOWN from HR via the sync. Only
  // the marketing SECTION fields below are editable on the vcard.
  const allowed = [
    'bio', 'languages', 'specialties', 'linkedin',
    'featured', 'sales_manager', 'website_active',
    'website_bio', 'website_specialties', 'website_custom_title',
    'website_meta_description', 'mailchimp_audience_id', 'mailchimp_form_code',
  ]

  const data: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) data[key] = body[key]
  }

  const updated = await updateEmployee(slug, data)
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // /team is no longer a public page; just refresh the admin list
  revalidatePath('/admin/team/employees')

  return NextResponse.json(updated)
}
