"use client"

import { useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPhoneDisplay } from '@/components/ui/PhoneInput'
import {
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Globe,
  ExternalLink,
  Eye,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  Settings,
  Upload,
  X,
  Lock,
} from 'lucide-react'
import type { AdminEmployee } from '@/lib/admin-db'

interface Office { id: number; name: string; city: string | null }
interface Dept   { id: number; name: string; color: string }

interface Props {
  employee: AdminEmployee & { photo_url: string }
  offices:  Office[]
  depts:    Dept[]
}

function Section({ title, icon: Icon, children }: {
  title:    string
  icon:     React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
        <Icon className="w-4 h-4 text-[#f26b2b]" />
        <h2 className="font-semibold text-[#03374f] text-sm">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-4">
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

const INPUT = "w-full h-10 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#03374f]/15 focus:border-[#03374f]/40 transition-all"
const TEXTAREA = "w-full px-3.5 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#03374f]/15 focus:border-[#03374f]/40 transition-all resize-none"

// HR-sync Stage 7: shared identity fields are read-only here (managed in
// HR). Greyed, non-editable styling for the disabled shared inputs.
const INPUT_RO = "w-full h-10 px-3.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"

/** Small "Managed in HR" hint shown beneath each read-only shared field. */
function ManagedInHr() {
  return (
    <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-[#03374f]/60">
      <Lock className="w-3 h-3" />
      Managed in HR
    </span>
  )
}

export default function EmployeeEditForm({ employee: initial, offices, depts }: Props) {
  // Rebuild the Mailchimp action URL from stored JSON for display
  const storedMcUrl = (() => {
    try {
      const mc = initial.mailchimp_form_code ? JSON.parse(initial.mailchimp_form_code) : null
      if (mc?.server && mc?.u && mc?.audienceId)
        return `https://pct.${mc.server}.list-manage.com/subscribe/post?u=${mc.u}&id=${mc.audienceId}${mc.formId ? `&f_id=${mc.formId}` : ''}`
      return ''
    } catch { return '' }
  })()

  const [emp, setEmp] = useState(initial)
  const [mcUrl, setMcUrl] = useState(storedMcUrl)
  const [mcParsed, setMcParsed] = useState<{ server?: string; u?: string; audienceId?: string; formId?: string } | null>(null)
  const [saving,    setSaving]    = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState<string | null>(null)
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handlePhotoUpload(file: File) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setUploadErr('Please choose an image file (JPG, PNG, WebP).')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadErr('Photo is too large (max 10 MB).')
      return
    }
    setUploading(true)
    setUploadErr(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/employees/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Upload failed')
      setEmp((prev) => ({ ...prev, photo_url: data.url }))
      setSaveMsg(null)
    } catch (err) {
      setUploadErr(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  /** Auto-parse Mailchimp form action URL or full embed code */
  function handleMcUrlChange(value: string) {
    setMcUrl(value)
    setSaveMsg(null)
    // Decode HTML entities (&amp; → &) since Mailchimp embed code uses them
    const decoded = value.replace(/&amp;/g, '&')
    // Find the list-manage subscribe URL anywhere in the pasted content
    const urlMatch = decoded.match(/https?:\/\/[^"'\s]*list-manage\.com\/subscribe\/post[^"'\s]*/i)
    if (urlMatch) {
      try {
        const url = new URL(urlMatch[0])
        const hostParts = url.hostname.split('.')
        const server = hostParts.length >= 3 ? hostParts[hostParts.length - 3] : ''
        const u = url.searchParams.get('u') || ''
        const id = url.searchParams.get('id') || ''
        const fid = url.searchParams.get('f_id') || ''
        if (server && u && id) {
          setMcParsed({ server, u, audienceId: id, formId: fid })
          return
        }
      } catch { /* fall through */ }
    }
    setMcParsed(null)
  }

  function update(field: string, value: unknown) {
    setEmp((prev) => ({ ...prev, [field]: value }))
    setSaveMsg(null)
  }

  async function handleSave() {
    setSaving(true)
    setSaveMsg(null)
    try {
      // Build Mailchimp form config JSON from parsed URL
      let mailchimpFormCode: string | null = null
      if (mcParsed?.server && mcParsed?.u && mcParsed?.audienceId) {
        mailchimpFormCode = JSON.stringify({
          server:     mcParsed.server,
          u:          mcParsed.u,
          audienceId: mcParsed.audienceId,
          formId:     mcParsed.formId || '',
        })
      }

      // ⚠️ HR-sync Stage 7 (design §5): the SHARED identity fields
      // (first_name, last_name, title, email, phone, mobile, office_id,
      // department_id, active, photo_url) are managed in HR and are
      // read-only here. They are deliberately EXCLUDED from this body so a
      // stale/edited client state can never POST them — the section fields
      // below are all that marketing edits. (Server PATCH allowlist is the
      // real enforcement; this keeps the wire honest.)
      const res = await fetch(`/api/admin/employees/${emp.slug}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          bio:                      emp.bio,
          languages:                emp.languages,
          specialties:              emp.specialties,
          linkedin:                 emp.linkedin,
          featured:                 emp.featured,
          sales_manager:            emp.sales_manager,
          website_active:           emp.website_active,
          website_bio:              emp.website_bio,
          website_specialties:      emp.website_specialties,
          website_custom_title:     emp.website_custom_title,
          website_meta_description: emp.website_meta_description,
          mailchimp_audience_id:    mcParsed?.audienceId ?? emp.mailchimp_audience_id,
          mailchimp_form_code:      mailchimpFormCode,
        }),
      })

      if (res.ok) {
        setSaveMsg({ ok: true, text: 'Changes saved!' })
      } else {
        const d = await res.json()
        setSaveMsg({ ok: false, text: d.error ?? 'Save failed' })
      }
    } catch {
      setSaveMsg({ ok: false, text: 'Network error — try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-2 lg:pt-0 pb-12">

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/team/employees"
          className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition text-gray-500 hover:text-[#03374f]"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-[#03374f] truncate">{initial.name}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{initial.title ?? 'Team Member'}</p>
        </div>

        {/* Download vCard link (the public /team profile page has been retired) */}
        <a
          href={`/api/team/${emp.slug}/vcf`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#f26b2b] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          vCard
        </a>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#f26b2b] hover:bg-[#e05d1e] disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow text-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* Save status */}
      {saveMsg && (
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm border ${
          saveMsg.ok
            ? 'bg-green-50 border-green-100 text-green-700'
            : 'bg-red-50 border-red-100 text-red-600'
        }`}>
          {saveMsg.ok
            ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {saveMsg.text}
        </div>
      )}

      {/* ── Profile Photo ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
            {emp.photo_url ? (
              <Image
                src={emp.photo_url}
                alt={emp.name}
                width={80}
                height={80}
                className="w-full h-full object-cover object-top"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                No photo
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Profile photo
            </p>
            {/* HR-sync Stage 7: photo is a SHARED field managed in HR — the
                whole control set (upload, remove, file input, paste-URL) is
                disabled as a unit. The photo still displays for context. */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled
                aria-disabled="true"
                title="Managed in HR"
                className="h-9 px-4 inline-flex items-center gap-2 rounded-xl bg-gray-200 text-gray-500 text-xs font-semibold cursor-not-allowed"
              >
                <Upload className="w-3.5 h-3.5" />
                {emp.photo_url ? 'Replace photo' : 'Upload photo'}
              </button>
              {emp.photo_url && (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  title="Managed in HR"
                  className="h-9 px-3 inline-flex items-center gap-1 rounded-xl border border-gray-200 text-xs text-gray-400 cursor-not-allowed"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                disabled
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handlePhotoUpload(f)
                }}
              />
            </div>
            <ManagedInHr />
            <p className="text-[11px] text-gray-400">
              The headshot is managed in HR and syncs here automatically.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0 self-start">
            <Eye className="w-3.5 h-3.5" />
            {emp.view_count} views
          </div>
        </div>

        {uploadErr && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>{uploadErr}</span>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Photo URL
          </label>
          <input
            type="url"
            value={emp.photo_url ?? ''}
            disabled
            readOnly
            placeholder="https://pub-xxx.r2.dev/sales-rep-photos/WebThumb/Name.png"
            className={INPUT_RO}
          />
          <ManagedInHr />
        </div>
      </div>

      {/* ── Settings toggles ── */}
      <Section title="Status & Visibility" icon={Settings}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {([
            // `active` is a SHARED field (managed in HR) → read-only.
            { field: 'active',         label: 'Active',           desc: 'Shows in directory', readOnly: true },
            { field: 'website_active', label: 'Website Page Live', desc: 'pct.com/slug', readOnly: false },
            { field: 'featured',       label: 'Featured',          desc: 'Shown at top', readOnly: false },
            { field: 'sales_manager',  label: 'Sales Manager',     desc: 'Receives manager recaps', readOnly: false },
          ] as const).map(({ field, label, desc, readOnly }) => (
            <label
              key={field}
              title={readOnly ? 'Managed in HR' : undefined}
              className={`flex flex-col gap-1.5 p-4 rounded-xl border-2 transition-all ${
                readOnly
                  ? 'cursor-not-allowed border-gray-200 bg-gray-100'
                  : emp[field]
                    ? 'border-[#f26b2b] bg-[#f26b2b]/5 cursor-pointer'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300 cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${readOnly ? 'text-gray-500' : 'text-[#03374f]'}`}>{label}</span>
                <div className={`w-9 h-5 rounded-full transition-all flex-shrink-0 relative ${
                  readOnly ? (emp[field] ? 'bg-gray-400' : 'bg-gray-300') : emp[field] ? 'bg-[#f26b2b]' : 'bg-gray-300'
                }`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                    emp[field] ? 'left-[18px]' : 'left-0.5'
                  }`} />
                </div>
                <input
                  type="checkbox"
                  checked={emp[field] as boolean}
                  disabled={readOnly}
                  onChange={(e) => { if (!readOnly) update(field, e.target.checked) }}
                  className="sr-only"
                />
              </div>
              <span className="text-[11px] text-gray-400">{readOnly ? 'Managed in HR' : desc}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* ── Basic Info ── */}
      <Section title="Basic Information" icon={User}>
        {/* HR-sync Stage 7: name/title/department/office are SHARED →
            read-only (managed in HR). Values display for context. */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name">
            <input type="text" value={emp.first_name} disabled readOnly className={INPUT_RO} />
            <ManagedInHr />
          </Field>
          <Field label="Last Name">
            <input type="text" value={emp.last_name} disabled readOnly className={INPUT_RO} />
            <ManagedInHr />
          </Field>
        </div>

        <Field label="Title / Position">
          <input type="text" value={emp.title ?? ''} disabled readOnly placeholder="Senior Account Executive" className={INPUT_RO} />
          <ManagedInHr />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Department">
            <select value={emp.department_id ?? ''} disabled className={INPUT_RO}>
              <option value="">— None —</option>
              {depts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <ManagedInHr />
          </Field>
          <Field label="Office">
            <select value={emp.office_id ?? ''} disabled className={INPUT_RO}>
              <option value="">— None —</option>
              {offices.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
            <ManagedInHr />
          </Field>
        </div>
      </Section>

      {/* ── Contact ── */}
      <Section title="Contact Information" icon={Mail}>
        {/* HR-sync Stage 7: email + phones are SHARED → read-only. */}
        <Field label="Email">
          <input type="email" value={emp.email ?? ''} disabled readOnly placeholder="name@pct.com" className={INPUT_RO} />
          <ManagedInHr />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Mobile / Cell">
            <input type="tel" value={formatPhoneDisplay(emp.mobile) || (emp.mobile ?? '')} disabled readOnly placeholder="(714) 555-0100" className={INPUT_RO} />
            <ManagedInHr />
          </Field>
          <Field label="Direct / Office Line">
            <input type="tel" value={formatPhoneDisplay(emp.phone) || (emp.phone ?? '')} disabled readOnly placeholder="(818) 543-2130" className={INPUT_RO} />
            <ManagedInHr />
          </Field>
        </div>
        <Field label="LinkedIn URL">
          <input
            type="url"
            value={emp.linkedin ?? ''}
            onChange={(e) => update('linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/..."
            className={INPUT}
          />
        </Field>
      </Section>

      {/* ── Bio & Specialties ── */}
      <Section title="Bio & Specialties" icon={FileText}>
        <Field label="Internal Bio (vCard / SMS page)">
          <textarea
            value={emp.bio ?? ''}
            onChange={(e) => update('bio', e.target.value)}
            placeholder="Short professional bio…"
            rows={3}
            className={TEXTAREA}
          />
        </Field>

        <Field label="Specialties (JSON array — e.g. [&quot;Residential&quot;,&quot;Refinance&quot;])">
          <input
            type="text"
            value={emp.specialties ?? ''}
            onChange={(e) => update('specialties', e.target.value)}
            placeholder='["Residential Title","Refinancing","1031 Exchanges"]'
            className={INPUT}
          />
        </Field>

        <Field label="Languages (JSON array — e.g. [&quot;English&quot;,&quot;Spanish&quot;])">
          <input
            type="text"
            value={emp.languages ?? ''}
            onChange={(e) => update('languages', e.target.value)}
            placeholder='["English","Spanish"]'
            className={INPUT}
          />
        </Field>
      </Section>

      {/* ── Website Page ── */}
      <Section title="Website Page (pct.com/slug)" icon={Globe}>
        <div className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          URL: <span className="font-mono text-[#03374f]">https://www.pct.com/{emp.slug}</span>
          {' · '}
          <span className={emp.website_active ? 'text-green-600 font-medium' : 'text-gray-400'}>
            {emp.website_active ? 'Live' : 'Hidden'}
          </span>
        </div>

        <Field label="Page Headline (overrides default)">
          <input
            type="text"
            value={emp.website_custom_title ?? ''}
            onChange={(e) => update('website_custom_title', e.target.value)}
            placeholder={`${emp.first_name}'s Weekly Updates`}
            className={INPUT}
          />
        </Field>

        <Field label="Website Bio (shown on public page)">
          <textarea
            value={emp.website_bio ?? ''}
            onChange={(e) => update('website_bio', e.target.value)}
            placeholder="Longer bio for the public-facing page…"
            rows={4}
            className={TEXTAREA}
          />
        </Field>

        <Field label="Meta Description (SEO)">
          <input
            type="text"
            value={emp.website_meta_description ?? ''}
            onChange={(e) => update('website_meta_description', e.target.value)}
            placeholder="Connect with Jane at Pacific Coast Title…"
            className={INPUT}
          />
        </Field>

        <div className="border-t border-gray-100 pt-4 mt-2">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Mail className="w-3.5 h-3.5" />
            Mailchimp Subscribe Form
          </p>

          <Field label="Paste Mailchimp Form URL or Embed Code">
            <textarea
              value={mcUrl}
              onChange={(e) => handleMcUrlChange(e.target.value)}
              placeholder="Paste the form action URL or the full embed code from Mailchimp here…"
              rows={3}
              className={TEXTAREA}
            />
          </Field>

          {/* Auto-parsed feedback */}
          {mcUrl.trim() && (
            mcParsed ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-100 rounded-xl text-xs text-green-700">
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Detected: server <strong>{mcParsed.server}</strong> · audience <strong>{mcParsed.audienceId}</strong>
                {mcParsed.formId && <> · form <strong>{mcParsed.formId}</strong></>}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Could not detect Mailchimp URL. Make sure it contains <code className="bg-amber-100/50 px-1 rounded">list-manage.com/subscribe/post?u=...&amp;id=...</code>
              </div>
            )
          )}

          <p className="text-[11px] text-gray-400 leading-relaxed mt-1">
            In Mailchimp → Audience → Signup Forms → Embedded Forms → copy the form <code className="bg-gray-100 px-1 rounded text-[10px]">action</code> URL. We&apos;ll parse everything automatically.
          </p>
        </div>
      </Section>

      {/* Bottom save */}
      <div className="flex justify-end gap-3 pt-2">
        <Link
          href="/admin/team/employees"
          className="px-5 py-2.5 text-sm text-gray-500 hover:text-[#03374f] transition-colors"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#f26b2b] hover:bg-[#e05d1e] disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow text-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
