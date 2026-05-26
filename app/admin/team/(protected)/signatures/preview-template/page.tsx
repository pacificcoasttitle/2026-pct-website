/**
 * /admin/team/signatures/preview-template
 *
 * Visual smoke test for the Corporate Standard signature template.
 * Pulls a real staff_members row (Jerry Hernandez by preference, otherwise
 * the first active member) and renders the in-repo template against it
 * before any DB migration runs.
 *
 * Server component; auth is enforced by the (protected) route-group layout.
 */
import Link from 'next/link'
import { ArrowLeft, Eye, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import {
  getAllStaffMembers,
  getStaffMemberByEmail,
  getOfficeLocationBySlug,
  type StaffMember,
  type OfficeLocation,
} from '@/lib/admin-db'
import {
  CORPORATE_STANDARD_HTML,
  renderSignature,
  type SignatureContext,
} from '@/lib/signature-templates/corporate-standard'

export const metadata = { title: 'Preview Signature Template | PCT Team Admin' }
export const dynamic  = 'force-dynamic'

// Synthetic fallback so the page renders even on an empty DB.
const FALLBACK_STAFF = {
  first_name:     'Jerry',
  last_name:      'Hernandez',
  title:          'Manager of Product Development',
  department:     'Marketing',
  email:          'ghernandez@pct.com',
  office_direct:  '818.662.6727',
  cell_phone:     null as string | null,
  photo_url:      null as string | null,
  office_location:'glendale',
  license_number: null as string | null,
}

const FALLBACK_OFFICE = {
  display_name: 'Glendale',
  address_line1: '450 N. Brand Blvd., Ste. 600',
  city:  'Glendale',
  state: 'CA',
  zip:   '91203',
  main_phone: '818.662.6700',
}

async function loadPreviewStaff(): Promise<{
  source: 'db' | 'fallback'
  staff:  Pick<StaffMember,
    'first_name' | 'last_name' | 'title' | 'department' | 'email' |
    'office_direct' | 'cell_phone' | 'photo_url' | 'office_location' |
    'license_number'
  >
}> {
  try {
    const jerry = await getStaffMemberByEmail('ghernandez@pct.com')
    if (jerry) return { source: 'db', staff: jerry }
    const any = await getAllStaffMembers({ activeOnly: true })
    if (any[0]) return { source: 'db', staff: any[0] }
  } catch { /* db offline */ }
  return { source: 'fallback', staff: FALLBACK_STAFF }
}

async function loadOffice(slug: string | null): Promise<Pick<OfficeLocation,
  'display_name' | 'address_line1' | 'city' | 'state' | 'zip' | 'main_phone'
> | null> {
  if (!slug) return null
  try {
    const o = await getOfficeLocationBySlug(slug)
    if (o) return o
  } catch { /* db offline */ }
  return null
}

export default async function PreviewSignaturePage() {
  const { source, staff } = await loadPreviewStaff()
  const office = (await loadOffice(staff.office_location)) ||
    (staff.office_location === 'glendale' ? FALLBACK_OFFICE : null)

  // Phone preference: cell first, then office_direct (per design brief).
  const phone = staff.cell_phone || staff.office_direct || null

  const ctx: SignatureContext = {
    first_name:           staff.first_name,
    last_name:            staff.last_name,
    title:                staff.title,
    department:           staff.department,
    email:                staff.email,
    phone,
    office_direct:        staff.office_direct,
    photo_url:            staff.photo_url,
    office_address_line1: office?.address_line1 ?? null,
    office_city:          office?.city          ?? null,
    office_state:         office?.state         ?? null,
    office_zip:           office?.zip           ?? null,
    office_main_phone:    office?.main_phone    ?? null,
    license_number:       staff.license_number,
  }

  const renderedHtml = renderSignature(CORPORATE_STANDARD_HTML, ctx)
  const iframeSrcDoc = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:24px;background:#f5f5f5;">${renderedHtml}</body></html>`

  return (
    <div className="space-y-6 pt-2 lg:pt-0 max-w-5xl">
      <header className="space-y-2">
        <Link href="/admin/team/marketing/signatures"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#f26b2b]">
          <ArrowLeft className="w-3 h-3" /> Back to Signature Center
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#03374f]">
          <Eye className="w-6 h-6 text-[#f26b2b]" />
          Preview Signature Template
        </h1>
        <p className="text-sm text-gray-500">
          Renders <code className="font-mono">lib/signature-templates/corporate-standard.ts</code>
          {' '}against a real staff row. The database row is not modified until the migration
          script is run with <code className="font-mono">--confirm</code>.
        </p>
      </header>

      {source === 'fallback' && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 mt-0.5 text-amber-500 flex-shrink-0" />
          <div>
            No staff row found (DB empty or offline). Falling back to a hard-coded
            Jerry Hernandez fixture so the template still renders.
          </div>
        </div>
      )}

      {/* Data fed to template */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-[#03374f] mb-3">Fixture Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-xs font-mono">
          {Object.entries(ctx).map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <span className="text-gray-500 w-44 flex-shrink-0">{k}</span>
              <span className="text-[#03374f] break-all">
                {v == null || v === '' ? <em className="text-gray-400">∅</em> : String(v)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Rendered preview */}
      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
          <Eye className="w-4 h-4 text-[#f26b2b]" />
          <h2 className="text-sm font-semibold text-[#03374f]">Rendered Preview</h2>
          <span className="text-xs text-gray-500 ml-auto">
            iframe sandboxed; replicates Outlook table rendering
          </span>
        </div>
        <iframe
          title="Signature preview"
          srcDoc={iframeSrcDoc}
          sandbox=""
          className="w-full bg-white"
          style={{ height: 360, border: 0 }}
        />
      </Card>

      {/* Source HTML */}
      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
          <h2 className="text-sm font-semibold text-[#03374f]">Rendered HTML Source</h2>
          <span className="text-xs text-gray-500 ml-auto">
            {renderedHtml.length} chars
          </span>
        </div>
        <pre className="p-5 text-[11px] leading-relaxed text-gray-700 bg-white overflow-x-auto whitespace-pre-wrap break-words">
{renderedHtml}
        </pre>
      </Card>
    </div>
  )
}
