/**
 * GET /api/team/[slug]/vcf
 *
 * Returns a vCard (.vcf) file for an employee so a browser can prompt
 * "Add to Contacts" without any client-side JS required.
 *
 * This is also useful as the PHOTO URL inside the vCard itself (sharable link).
 */
import { NextResponse } from 'next/server'
import { getEmployeeBySlug } from '@/lib/vcard-db'
import { resolvePhotoUrl } from '@/types/employee'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const emp = await getEmployeeBySlug(slug)

  if (!emp) {
    return new NextResponse('Not found', { status: 404 })
  }

  const photo  = resolvePhotoUrl(emp)
  const mobile = emp.mobile ?? emp.phone ?? ''
  const office = emp.phone && emp.mobile ? emp.phone : ''
  const city   = emp.office?.city   ?? ''
  const state  = emp.office?.state  ?? 'CA'
  const street = emp.office?.street ?? ''
  const zip    = emp.office?.zip    ?? ''

  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${emp.name}`,
    `N:${emp.last_name};${emp.first_name};;;`,
    'ORG:Pacific Coast Title Company',
    emp.title ? `TITLE:${emp.title}` : '',
    mobile ? `TEL;TYPE=CELL,VOICE:${mobile}` : '',
    office ? `TEL;TYPE=WORK,VOICE:${office}` : '',
    emp.email ? `EMAIL;TYPE=WORK,INTERNET:${emp.email}` : '',
    street ? `ADR;TYPE=WORK:;;${street};${city};${state};${zip};US` : '',
    photo ? `PHOTO;VALUE=URL:${photo}` : '',
    emp.linkedin ? `URL;TYPE=LinkedIn:${emp.linkedin}` : '',
    `URL;TYPE=Website:https://www.pct.com/team/${emp.slug}`,
    `NOTE:Connect with ${emp.first_name} at Pacific Coast Title · (866) 724-1050 · pct.com`,
    'END:VCARD',
  ]

  const vcf = lines.filter(Boolean).join('\r\n')

  return new NextResponse(vcf, {
    headers: {
      'Content-Type':        'text/vcard;charset=utf-8',
      'Content-Disposition': `attachment; filename="${emp.slug}.vcf"`,
      'Cache-Control':       'no-store',
    },
  })
}
