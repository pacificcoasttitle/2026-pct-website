"use client"

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  UserX,
  RotateCcw,
  Upload,
  User as UserIcon,
} from 'lucide-react'
import PhoneInput from '@/components/ui/PhoneInput'

interface CoreFields {
  id:              number
  first_name:      string
  last_name:       string
  full_legal_name: string | null
  title:           string | null
  department:      string | null
  office:          string | null
  email:           string
  mobile:          string | null
  office_phone:    string | null
  active:          boolean
  birthday:        string | null
  start_date:      string | null
  photo_url:       string | null
}

/**
 * Derive a display-only work anniversary from start_date. Returns null for
 * a missing/invalid date. Shows completed years of service + the next
 * anniversary date. NOT a stored field.
 */
function deriveAnniversary(startDate: string | null): { years: number; next: string } | null {
  if (!startDate) return null
  const start = new Date(`${startDate}T00:00:00`)
  if (Number.isNaN(start.getTime())) return null
  const now = new Date()
  let years = now.getFullYear() - start.getFullYear()
  // The next anniversary in the current/next year.
  const next = new Date(start)
  next.setFullYear(now.getFullYear())
  if (next < now) {
    next.setFullYear(now.getFullYear() + 1)
  } else {
    // Anniversary hasn't occurred yet this year → completed years is one fewer.
    years -= 1
  }
  if (years < 0) years = 0
  const nextStr = next.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
  return { years, next: nextStr }
}

// 'YYYY-MM-DD' for a date input value (DATE columns may arrive as a longer
// ISO string depending on the driver; slice to the date part).
function toDateInput(v: string | null): string {
  if (!v) return ''
  return v.slice(0, 10)
}

interface Props {
  employee:    CoreFields
  departments: string[]
  offices:     string[]
}

const INPUT =
  "w-full h-10 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#03374f]/15 focus:border-[#03374f]/40 transition-all"
const LABEL = "block text-xs font-semibold text-gray-500 mb-1.5"

export default function HrEmployeeEditForm({ employee, departments, offices }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error,  setError]  = useState<string | null>(null)
  const [ok,     setOk]     = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Headshot URL is managed by its own upload route + clear action (kept
  // out of the core form state so the dedicated photo flow owns it).
  const [photoUrl, setPhotoUrl] = useState<string | null>(employee.photo_url)

  const [form, setForm] = useState({
    first_name:      employee.first_name,
    last_name:       employee.last_name,
    full_legal_name: employee.full_legal_name ?? '',
    title:           employee.title ?? '',
    department:      employee.department ?? '',
    office:          employee.office ?? '',
    email:           employee.email,
    mobile:          employee.mobile ?? '',
    office_phone:    employee.office_phone ?? '',
    birthday:        toDateInput(employee.birthday),
    start_date:      toDateInput(employee.start_date),
  })

  const anniversary = deriveAnniversary(form.start_date || null)

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function patch(payload: Record<string, unknown>, okMsg: string) {
    setError(null)
    setOk(null)
    const res = await fetch(`/api/admin/hr/employees/${employee.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data?.error || 'Update failed.')
      return false
    }
    setOk(okMsg)
    router.refresh()
    return true
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('First name and last name are required.')
      return
    }
    if (!form.email.trim()) {
      setError('Email is required.')
      return
    }
    setSaving(true)
    await patch(form, 'Saved.')
    setSaving(false)
  }

  async function handleToggleActive() {
    const next = !employee.active
    if (next === false) {
      const okConfirm = window.confirm(
        `Deactivate ${employee.first_name} ${employee.last_name}? They'll be marked inactive. ` +
          `This does not delete the record or change their signature/marketing presence.`,
      )
      if (!okConfirm) return
    }
    setToggling(true)
    await patch({ active: next }, next ? 'Reactivated.' : 'Deactivated.')
    setToggling(false)
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setOk(null)
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`/api/admin/hr/employees/${employee.id}/photo`, {
        method: 'POST',
        body: fd,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'Upload failed.')
        return
      }
      setPhotoUrl(data.url as string)
      setOk('Headshot updated.')
      router.refresh()
    } catch {
      setError('Network error during upload.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handlePhotoClear() {
    if (!window.confirm('Remove this headshot? The linked marketing/signature photo is not overwritten by a blank.')) {
      return
    }
    setError(null)
    setOk(null)
    // Clearing routes through the SAME update path. photo_url='' is a blank;
    // the sync's blank-guard means it will NOT overwrite a good facet photo.
    const okDone = await patch({ photo_url: '' }, 'Headshot removed.')
    if (okDone) setPhotoUrl(null)
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {ok && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{ok}</span>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
      >
        {/* Headshot */}
        <div className="flex items-center gap-4 pb-1">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="Headshot" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-8 h-8 text-gray-300" />
            )}
          </div>
          <div className="space-y-2">
            <label className={LABEL}>Headshot</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="h-9 px-3.5 inline-flex items-center gap-2 rounded-xl border border-gray-200 text-sm font-medium text-[#03374f] hover:border-[#03374f]/40 hover:bg-[#03374f]/[0.03] transition-colors disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Uploading…' : photoUrl ? 'Replace' : 'Upload'}
              </button>
              {photoUrl && (
                <button
                  type="button"
                  onClick={handlePhotoClear}
                  disabled={uploading}
                  className="h-9 px-3 inline-flex items-center rounded-xl border border-gray-200 text-sm font-medium text-gray-500 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Remove
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>
            <p className="text-[11px] text-gray-400">JPG/PNG, up to 10 MB. Syncs to linked marketing/signature.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>First name *</label>
            <input className={INPUT} value={form.first_name} onChange={(e) => set('first_name', e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Last name *</label>
            <input className={INPUT} value={form.last_name} onChange={(e) => set('last_name', e.target.value)} />
          </div>
        </div>

        <div>
          <label className={LABEL}>Full legal name</label>
          <input className={INPUT} value={form.full_legal_name} onChange={(e) => set('full_legal_name', e.target.value)} />
        </div>

        <div>
          <label className={LABEL}>Email *</label>
          <input type="email" className={INPUT} value={form.email} onChange={(e) => set('email', e.target.value)} />
        </div>

        <div>
          <label className={LABEL}>Title</label>
          <input className={INPUT} value={form.title} onChange={(e) => set('title', e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Department</label>
            <input
              className={INPUT}
              list="hr-edit-departments"
              value={form.department}
              onChange={(e) => set('department', e.target.value)}
            />
            <datalist id="hr-edit-departments">
              {departments.map((d) => <option key={d} value={d} />)}
            </datalist>
          </div>
          <div>
            <label className={LABEL}>Office</label>
            <input
              className={INPUT}
              list="hr-edit-offices"
              value={form.office}
              onChange={(e) => set('office', e.target.value)}
            />
            <datalist id="hr-edit-offices">
              {offices.map((o) => <option key={o} value={o} />)}
            </datalist>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Mobile</label>
            <PhoneInput className={INPUT} value={form.mobile} onChange={(v) => set('mobile', v)} />
          </div>
          <div>
            <label className={LABEL}>Office phone</label>
            <PhoneInput className={INPUT} value={form.office_phone} onChange={(v) => set('office_phone', v)} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Birthday</label>
            <input
              type="date"
              className={INPUT}
              value={form.birthday}
              onChange={(e) => set('birthday', e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL}>Start date</label>
            <input
              type="date"
              className={INPUT}
              value={form.start_date}
              onChange={(e) => set('start_date', e.target.value)}
            />
            <p className="mt-1.5 text-[11px] text-gray-400">
              {anniversary
                ? `${anniversary.years} ${anniversary.years === 1 ? 'year' : 'years'} of service · next anniversary ${anniversary.next}`
                : 'Work anniversary appears once a start date is set.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-5 inline-flex items-center gap-2 rounded-xl bg-[#f26b2b] text-white text-sm font-semibold hover:bg-[#d85c1f] transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>

          <button
            type="button"
            onClick={handleToggleActive}
            disabled={toggling}
            className={`h-10 px-4 inline-flex items-center gap-2 rounded-xl border text-sm font-medium transition-colors disabled:opacity-50 ${
              employee.active
                ? 'border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-600 hover:bg-red-50'
                : 'border-gray-200 text-gray-600 hover:border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            {toggling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : employee.active ? (
              <UserX className="w-4 h-4" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            {employee.active ? 'Deactivate' : 'Reactivate'}
          </button>
        </div>
      </form>
    </div>
  )
}
