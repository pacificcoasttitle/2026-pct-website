"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, UserPlus, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

interface Props {
  departments: string[]
  offices:     string[]
}

const INPUT =
  "w-full h-10 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#03374f]/15 focus:border-[#03374f]/40 transition-all"
const LABEL = "block text-xs font-semibold text-gray-500 mb-1.5"

export default function HrEmployeeNewForm({ departments, offices }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState<string | null>(null)
  const [ok,     setOk]     = useState<string | null>(null)
  const [createdEmployee, setCreatedEmployee] = useState<{ id: number } | null>(null)

  const [form, setForm] = useState({
    first_name:      '',
    last_name:       '',
    full_legal_name: '',
    email:           '',
    title:           '',
    department:      '',
    office:          '',
    mobile:          '',
    office_phone:    '',
    active:          true,
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setOk(null)
    setCreatedEmployee(null)

    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('First name and last name are required.')
      return
    }
    if (!form.email.trim()) {
      setError('Email is required.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/hr/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'Failed to add employee.')
        setSaving(false)
        return
      }
      const employeeId = Number(data?.employee?.id)
      setOk('Added to roster.')
      setCreatedEmployee(Number.isInteger(employeeId) && employeeId > 0 ? { id: employeeId } : null)
      router.refresh()
    } catch {
      setError('Network error — please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-2 lg:pt-0">
      <div>
        <Link
          href="/admin/team/hr"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#f26b2b] transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Back to roster
        </Link>
        <h1 className="text-2xl font-bold text-[#03374f]">Add Employee</h1>
        <p className="text-gray-500 text-sm mt-1">
          Creates a canonical HR roster record only. It does not start onboarding,
          send an invite, or change anyone&apos;s marketing or signature presence.
          To onboard someone, use the Onboarding screen.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {ok && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold">{ok}</div>
              <div className="mt-0.5 text-emerald-700/80">
                This created a roster record only. Start onboarding from the Onboarding screen when you&apos;re ready.
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 pl-6">
            {createdEmployee && (
              <Link
                href={`/admin/team/hr/onboarding?employee=${createdEmployee.id}`}
                className="inline-flex h-9 items-center rounded-lg bg-[#03374f] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#02283a]"
              >
                Start onboarding →
              </Link>
            )}
            <Link
              href="/admin/team/hr"
              className="inline-flex h-9 items-center rounded-lg border border-emerald-200 bg-white px-3 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
            >
              Done / back to roster
            </Link>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
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
          <input className={INPUT} value={form.full_legal_name} onChange={(e) => set('full_legal_name', e.target.value)} placeholder="If different from above" />
        </div>

        <div>
          <label className={LABEL}>Email *</label>
          <input type="email" className={INPUT} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="name@pct.com" />
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
              list="hr-departments"
              value={form.department}
              onChange={(e) => set('department', e.target.value)}
              placeholder="Select or type…"
            />
            <datalist id="hr-departments">
              {departments.map((d) => <option key={d} value={d} />)}
            </datalist>
          </div>
          <div>
            <label className={LABEL}>Office</label>
            <input
              className={INPUT}
              list="hr-offices"
              value={form.office}
              onChange={(e) => set('office', e.target.value)}
              placeholder="Select or type…"
            />
            <datalist id="hr-offices">
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

        <label className="flex items-center gap-2.5 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => set('active', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[#f26b2b] focus:ring-[#f26b2b]/30"
          />
          Active
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-5 inline-flex items-center gap-2 rounded-xl bg-[#f26b2b] text-white text-sm font-semibold hover:bg-[#d85c1f] transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {saving ? 'Adding…' : 'Add Employee'}
          </button>
          <Link
            href="/admin/team/hr"
            className="h-10 px-4 inline-flex items-center rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
