/**
 * T7 — HR employee onboarding documents panel (read-only, PII-safe).
 *
 * Lists a finalized employee's onboarding documents (metadata only) with a
 * "View" action that points at the EXISTING authenticated 4d retrieval
 * route: GET /api/admin/hr/onboarding/[onboarding_id]/documents/[docId]
 * (gated hr-tools, streams the private R2 file, Cache-Control no-store).
 *
 * ⚠️ PII discipline: the client only ever gets metadata + ids. NO public
 * URL, NO file_key — the bytes flow exclusively through the gated route.
 * Read-only: this panel lists + links to view; it never uploads/deletes/
 * modifies. Lives on the already hr-tools-gated HR profile page.
 *
 * Server component (no client state) — the View links are plain anchors to
 * the authenticated route, so no doc content is fetched until HR clicks.
 */
import { FileText } from 'lucide-react'

const NAVY = '#03374f'

// Friendly labels mirror the onboarding review client's mapping.
const DOC_TYPE_LABEL: Record<string, string> = {
  id: 'Government ID',
  tax_form: 'Tax form (W-4)',
  direct_deposit: 'Direct deposit',
  headshot: 'Headshot',
  client_list: 'Contact / client list',
  // signed_policy was retired (upload prompt removed). Any legacy row of
  // that type falls back to its raw doc_type via the `|| d.doc_type` below.
}

export interface EmployeeDocRow {
  id:            number
  onboarding_id: number
  doc_type:      string
  file_name:     string | null
  uploaded_at:   string
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function HrEmployeeDocuments({ documents }: { documents: EmployeeDocRow[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4" style={{ color: NAVY }} />
        <h2 className="text-sm font-semibold" style={{ color: NAVY }}>
          Onboarding documents
        </h2>
      </div>

      {documents.length === 0 ? (
        <p className="text-sm text-gray-400">No onboarding documents.</p>
      ) : (
        <ul className="divide-y divide-gray-50 -my-1">
          {documents.map((d) => (
            <li key={d.id} className="flex items-center gap-4 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {DOC_TYPE_LABEL[d.doc_type] || d.doc_type}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {d.file_name || 'document'} · {fmtDate(d.uploaded_at)}
                </p>
              </div>
              {/*
                ⚠️ Viewed ONLY through the authenticated hr-tools retrieval
                route — never a public URL, never the file_key. The route
                streams the private file server-side with no-store.
              */}
              <a
                href={`/api/admin/hr/onboarding/${d.onboarding_id}/documents/${d.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 px-3 inline-flex items-center rounded-xl border border-gray-200 text-xs font-medium text-gray-500 hover:border-[#f26b2b]/40 hover:text-[#f26b2b] transition-colors flex-shrink-0"
              >
                View
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
