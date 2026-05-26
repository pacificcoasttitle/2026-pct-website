/**
 * Shared signature renderer.
 *
 * Used by both /api/admin/signatures/generate/[staffId] and
 * /api/admin/signatures/send/[staffId] so the rendered HTML is identical
 * across preview and delivery.
 *
 * Resolution order:
 *   - Template:  staff.signature_template_id → getDefaultSignatureTemplate()
 *   - Phone:     staff.cell_phone → staff.office_direct
 *   - Photo:     staff.photo_url → ui-avatars.com initials avatar
 *                (PCT navy bg, white initials)
 *   - Office:    only populated when staff.office_location matches a slug
 */

import {
  getStaffMemberById,
  getSignatureTemplateById,
  getDefaultSignatureTemplate,
  getOfficeLocationBySlug,
  type StaffMember,
  type SignatureTemplate,
  type OfficeLocation,
} from '@/lib/admin-db'
import { renderSignature } from '@/lib/signature-templates/corporate-standard'

/**
 * Photo URL resolution. Uses the staff member's uploaded headshot when
 * present; otherwise generates a per-person initials avatar from
 * ui-avatars.com using PCT navy + white. Service-rendered so we get
 * pre-rounded, retina-ready PNGs without bundling an avatar generator.
 */
export function buildPhotoUrl(
  staff: Pick<StaffMember, 'first_name' | 'last_name' | 'photo_url'>,
): string {
  if (staff.photo_url) return staff.photo_url

  const params = new URLSearchParams({
    name:       `${staff.first_name} ${staff.last_name}`,
    size:       '160',     // 2x retina, rendered at 80x80
    background: '03374f',  // PCT navy (no leading # in URL)
    color:      'ffffff',
    bold:       'true',
    format:     'png',
    rounded:    'true',
  })
  return `https://ui-avatars.com/api/?${params.toString()}`
}

export class SignatureRenderError extends Error {
  readonly code: 'STAFF_NOT_FOUND' | 'TEMPLATE_NOT_FOUND'
  constructor(code: 'STAFF_NOT_FOUND' | 'TEMPLATE_NOT_FOUND', message: string) {
    super(message)
    this.code = code
    this.name = 'SignatureRenderError'
  }
}

export interface RenderedSignature {
  staff:    StaffMember
  template: SignatureTemplate
  office:   OfficeLocation | null
  html:     string
}

export async function renderSignatureForStaff(staffId: number): Promise<RenderedSignature> {
  const staff = await getStaffMemberById(staffId)
  if (!staff) {
    throw new SignatureRenderError('STAFF_NOT_FOUND', `Staff member ${staffId} not found`)
  }

  const template = staff.signature_template_id
    ? await getSignatureTemplateById(staff.signature_template_id)
    : await getDefaultSignatureTemplate()

  if (!template) {
    throw new SignatureRenderError(
      'TEMPLATE_NOT_FOUND',
      staff.signature_template_id
        ? `Signature template ${staff.signature_template_id} not found and no default template available`
        : 'No default signature template found. Seed one before generating signatures.'
    )
  }

  const office = staff.office_location
    ? await getOfficeLocationBySlug(staff.office_location)
    : null

  const html = renderSignature(template.html_template, {
    first_name:           staff.first_name,
    last_name:            staff.last_name,
    title:                staff.title,
    department:           staff.department || '',
    email:                staff.email,
    phone:                staff.cell_phone || staff.office_direct || '',
    photo_url:            buildPhotoUrl(staff),
    office_address_line1: office?.address_line1 || '',
    office_city:          office?.city || '',
    office_state:         office?.state || '',
    office_zip:           office?.zip || '',
    office_main_phone:    office?.main_phone || '',
  })

  return { staff, template, office, html }
}
