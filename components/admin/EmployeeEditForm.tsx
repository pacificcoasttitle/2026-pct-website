"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
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

export default function EmployeeEditForm({ employee: initial, offices, depts }: Props) {
  const [emp, setEmp] = useState(initial)
  const [saving,  setSaving]  = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ ok: boolean; text: string } | null>(null)

  function update(field: string, value: unknown) {
    setEmp((prev) => ({ ...prev, [field]: value }))
    setSaveMsg(null)
  }

  async function handleSave() {
    setSaving(true)
    setSaveMsg(null)
    try {
      const res = await fetch(`/api/admin/employees/${emp.slug}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          first_name:               emp.first_name,
          last_name:                emp.last_name,
          title:                    emp.title,
          email:                    emp.email,
          phone:                    emp.phone,
          mobile:                   emp.mobile,
          office_id:                emp.office_id,
          department_id:            emp.department_id,
          bio:                      emp.bio,
          photo_url:                emp.photo_url,
          languages:                emp.languages,
          specialties:              emp.specialties,
          linkedin:                 emp.linkedin,
          active:                   emp.active,
          featured:                 emp.featured,
          website_active:           emp.website_active,
          website_bio:              emp.website_bio,
          website_specialties:      emp.website_specialties,
          website_custom_title:     emp.website_custom_title,
          website_meta_description: emp.website_meta_description,
          mailchimp_audience_id:    emp.mailchimp_audience_id,
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

        {/* View profile link */}
        <a
          href={`/team/${emp.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#f26b2b] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View
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
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
          <Image
            src={emp.photo_url || '/placeholder.png'}
            alt={emp.name}
            width={64}
            height={64}
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Photo URL (R2 or absolute)
          </p>
          <input
            type="url"
            value={emp.photo_url ?? ''}
            onChange={(e) => update('photo_url', e.target.value)}
            placeholder="https://pub-xxx.r2.dev/sales-rep-photos/WebThumb/Name.png"
            className={INPUT}
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0">
          <Eye className="w-3.5 h-3.5" />
          {emp.view_count} views
        </div>
      </div>

      {/* ── Settings toggles ── */}
      <Section title="Status & Visibility" icon={Settings}>
        <div className="grid grid-cols-3 gap-4">
          {([
            { field: 'active',         label: 'Active',           desc: 'Shows in directory' },
            { field: 'website_active', label: 'Website Page Live', desc: 'pct.com/team/slug' },
            { field: 'featured',       label: 'Featured',          desc: 'Shown at top' },
          ] as const).map(({ field, label, desc }) => (
            <label
              key={field}
              className={`flex flex-col gap-1.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                emp[field]
                  ? 'border-[#f26b2b] bg-[#f26b2b]/5'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#03374f]">{label}</span>
                <div className={`w-9 h-5 rounded-full transition-all flex-shrink-0 relative ${
                  emp[field] ? 'bg-[#f26b2b]' : 'bg-gray-300'
                }`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                    emp[field] ? 'left-[18px]' : 'left-0.5'
                  }`} />
                </div>
                <input
                  type="checkbox"
                  checked={emp[field] as boolean}
                  onChange={(e) => update(field, e.target.checked)}
                  className="sr-only"
                />
              </div>
              <span className="text-[11px] text-gray-400">{desc}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* ── Basic Info ── */}
      <Section title="Basic Information" icon={User}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name">
            <input
              type="text"
              value={emp.first_name}
              onChange={(e) => update('first_name', e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field label="Last Name">
            <input
              type="text"
              value={emp.last_name}
              onChange={(e) => update('last_name', e.target.value)}
              className={INPUT}
            />
          </Field>
        </div>

        <Field label="Title / Position">
          <input
            type="text"
            value={emp.title ?? ''}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Senior Account Executive"
            className={INPUT}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Department">
            <select
              value={emp.department_id ?? ''}
              onChange={(e) => update('department_id', e.target.value ? Number(e.target.value) : null)}
              className={INPUT}
            >
              <option value="">— None —</option>
              {depts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Office">
            <select
              value={emp.office_id ?? ''}
              onChange={(e) => update('office_id', e.target.value ? Number(e.target.value) : null)}
              className={INPUT}
            >
              <option value="">— None —</option>
              {offices.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      {/* ── Contact ── */}
      <Section title="Contact Information" icon={Mail}>
        <Field label="Email">
          <input
            type="email"
            value={emp.email ?? ''}
            onChange={(e) => update('email', e.target.value)}
            placeholder="name@pct.com"
            className={INPUT}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Mobile / Cell">
            <input
              type="tel"
              value={emp.mobile ?? ''}
              onChange={(e) => update('mobile', e.target.value)}
              placeholder="(714) 555-0100"
              className={INPUT}
            />
          </Field>
          <Field label="Direct / Office Line">
            <input
              type="tel"
              value={emp.phone ?? ''}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="(818) 543-2130"
              className={INPUT}
            />
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
      <Section title="Website Page (pct.com/team/slug)" icon={Globe}>
        <div className="text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
          URL: <span className="font-mono text-[#03374f]">https://www.pct.com/team/{emp.slug}</span>
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

        <Field label="Mailchimp Audience ID">
          <input
            type="text"
            value={emp.mailchimp_audience_id ?? ''}
            onChange={(e) => update('mailchimp_audience_id', e.target.value)}
            placeholder="a8f29f3045"
            className={INPUT}
          />
        </Field>
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
