"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'

interface Office { id: number; name: string; city: string | null }
interface Dept   { id: number; name: string; color: string }

interface Props {
  offices: Office[]
  depts:   Dept[]
}

const INPUT = "w-full h-10 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#03374f]/15 focus:border-[#03374f]/40 transition-all"

export default function EmployeeNewForm({ offices, depts }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState<string | null>(null)
  const [ok,     setOk]     = useState<string | null>(null)

  const [form, setForm] = useState({
    first_name:     '',
    last_name:      '',
    title:          '',
    email:          '',
    mobile:         '',
    phone:          '',
    office_id:      '' as string,
    department_id:  '' as string,
    sms_code:       '',
    active:         true,
    website_active: false,
  })

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    setError(null)
    setOk(null)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('First name and last name are required.')
      return
    }
    setSaving(true)
    setError(null)
    setOk(null)
    try {
      const res = await fetch('/api/admin/employees', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          office_id:     form.office_id     ? Number(form.office_id)     : null,
          department_id: form.department_id ? Number(form.department_id) : null,
          sms_code:      form.sms_code.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to create employee')

      setOk(`Created ${data.employee.name}. Redirecting to edit…`)
      setTimeout(() => {
        router.push(`/admin/team/employees/${data.employee.slug}`)
        router.refresh()
      }, 600)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create employee')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-2 lg:pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/team/employees"
            className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-[#03374f] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#03374f]">Add Employee</h1>
            <p className="text-gray-500 text-sm mt-1">
              Create the record. Photo, bio, and Mailchimp setup happen on the next screen.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First name *">
              <input
                className={INPUT}
                value={form.first_name}
                onChange={(e) => update('first_name', e.target.value)}
                placeholder="Jane"
                autoFocus
                required
              />
            </Field>
            <Field label="Last name *">
              <input
                className={INPUT}
                value={form.last_name}
                onChange={(e) => update('last_name', e.target.value)}
                placeholder="Smith"
                required
              />
            </Field>
            <Field label="Title">
              <input
                className={INPUT}
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="Sales Representative"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                className={INPUT}
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="jane@pct.com"
              />
            </Field>
            <Field label="Mobile">
              <input
                className={INPUT}
                value={form.mobile}
                onChange={(e) => update('mobile', e.target.value)}
                placeholder="(555) 555-1212"
              />
            </Field>
            <Field label="Office phone">
              <input
                className={INPUT}
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="(555) 555-2000"
              />
            </Field>
            <Field label="Office">
              <select
                className={INPUT}
                value={form.office_id}
                onChange={(e) => update('office_id', e.target.value)}
              >
                <option value="">— Select —</option>
                {offices.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}{o.city ? ` (${o.city})` : ''}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Department">
              <select
                className={INPUT}
                value={form.department_id}
                onChange={(e) => update('department_id', e.target.value)}
              >
                <option value="">— Select —</option>
                {depts.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </Field>
            <Field label="SMS code (optional)">
              <input
                className={INPUT}
                value={form.sms_code}
                onChange={(e) => update('sms_code', e.target.value.toUpperCase())}
                placeholder="C-23"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Used to route MMS replies and prefix uploaded image filenames. Leave blank if this rep won&apos;t use SMS.
              </p>
            </Field>
          </div>

          <div className="flex flex-wrap gap-6 pt-2 border-t border-gray-50">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => update('active', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#f26b2b] focus:ring-[#f26b2b]"
              />
              Active employee
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.website_active}
                onChange={(e) => update('website_active', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#f26b2b] focus:ring-[#f26b2b]"
              />
              Show on public website
            </label>
          </div>
        </div>

        {/* Status / actions */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {ok && (
          <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{ok}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/team/employees"
            className="h-10 px-4 inline-flex items-center text-sm text-gray-600 hover:text-[#03374f]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-5 inline-flex items-center gap-2 rounded-xl bg-[#f26b2b] text-white text-sm font-semibold hover:bg-[#d85c1f] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {saving ? 'Creating…' : 'Create employee'}
          </button>
        </div>
      </form>
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
