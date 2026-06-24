"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  UserX,
  RotateCcw,
} from 'lucide-react'

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
  const [error,  setError]  = useState<string | null>(null)
  const [ok,     setOk]     = useState<string | null>(null)

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
  })

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
            <input className={INPUT} value={form.mobile} onChange={(e) => set('mobile', e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Office phone</label>
            <input className={INPUT} value={form.office_phone} onChange={(e) => set('office_phone', e.target.value)} />
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
