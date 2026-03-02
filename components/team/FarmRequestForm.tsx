"use client"

import { useState } from 'react'
import { CheckCircle, AlertCircle, Loader2, MapPin, List } from 'lucide-react'

const LIST_TYPES = [
  { value: 'OUT_OF_STATE', label: 'Out-of-State Owners' },
  { value: 'EMPTY_NESTER', label: 'Empty Nesters' },
  { value: 'ABSENTEE',     label: 'Absentee Owners' },
  { value: 'JUST_LISTED',  label: 'Just Listed' },
  { value: 'JUST_SOLD',    label: 'Just Sold' },
  { value: 'NEW_MOVER',    label: 'New Movers' },
  { value: 'INVESTOR',     label: 'Investors' },
  { value: 'OTHER',        label: 'Other' },
]

const LIST_SIZES = [
  { value: 'UNDER_100',  label: 'Under 100' },
  { value: '100_250',    label: '100 – 250' },
  { value: '250_500',    label: '250 – 500' },
  { value: '500_1000',   label: '500 – 1,000' },
  { value: '1000_PLUS',  label: '1,000+' },
]

const RADII = ['0.25 mi', '0.5 mi', '1 mi', '2 mi', '5 mi']

interface Props {
  repSlug:  string
  repName:  string
  repEmail: string
}

export function FarmRequestForm({ repSlug, repName, repEmail }: Props) {
  const [form, setForm] = useState({
    list_type:        '',
    city_area:        '',
    property_address: '',
    radius:           '',
    list_size:        '',
    output_formats:   ['pdf'] as string[],
    notes:            '',
    contact_name:     '',
    contact_email:    '',
    contact_phone:    '',
  })
  const [status,      setStatus]      = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg,    setErrorMsg]    = useState('')

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleFormat(fmt: string) {
    setForm((f) => ({
      ...f,
      output_formats: f.output_formats.includes(fmt)
        ? f.output_formats.filter((x) => x !== fmt)
        : [...f.output_formats, fmt],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.list_type || !form.city_area || !form.list_size || !form.contact_name || !form.contact_email) return

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/farm-request', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, rep_slug: repSlug, rep_name: repName, rep_email: repEmail }),
      })
      if (res.ok) {
        setStatus('success')
      } else {
        const data = await res.json()
        setStatus('error')
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Please try again.')
    }
  }

  const fieldClass = "w-full h-11 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#03374f]/15 focus:border-[#03374f]/40 transition-all text-sm"
  const selectClass = fieldClass + " appearance-none cursor-pointer"
  const labelClass  = "block text-sm font-semibold text-gray-700 mb-1.5"

  if (status === 'success') {
    return (
      <div className="text-center py-14 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-8">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-[#03374f]">Request Submitted!</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          {repName} has been notified. You&apos;ll receive a confirmation email
          and can expect to hear back within 1–2 business days.
        </p>
        <button
          type="button"
          onClick={() => { setStatus('idle'); setForm({ list_type: '', city_area: '', property_address: '', radius: '', list_size: '', output_formats: ['pdf'], notes: '', contact_name: '', contact_email: '', contact_phone: '' }) }}
          className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 bg-[#03374f] text-white rounded-xl font-medium text-sm hover:bg-[#03374f]/90 transition-colors"
        >
          Submit Another Request
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-5">

      {/* List Type */}
      <div>
        <label className={labelClass}>
          List Type <span className="text-[#f26b2b]">*</span>
        </label>
        <select value={form.list_type} onChange={(e) => set('list_type', e.target.value)} required className={selectClass}>
          <option value="">Select a list type…</option>
          {LIST_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* City / Area */}
      <div>
        <label className={labelClass}>
          City / Area <span className="text-[#f26b2b]">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={form.city_area}
            onChange={(e) => set('city_area', e.target.value)}
            required
            placeholder="e.g. Irvine, CA"
            className={fieldClass + " pl-10"}
          />
        </div>
      </div>

      {/* Property Address + Radius — two columns */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Property Address <span className="text-gray-400 font-normal">(opt)</span></label>
          <input
            type="text"
            value={form.property_address}
            onChange={(e) => set('property_address', e.target.value)}
            placeholder="123 Main St"
            className={fieldClass}
          />
        </div>
        <div>
          <label className={labelClass}>Radius</label>
          <select value={form.radius} onChange={(e) => set('radius', e.target.value)} className={selectClass}>
            <option value="">Any</option>
            {RADII.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* List Size */}
      <div>
        <label className={labelClass}>
          Approximate List Size <span className="text-[#f26b2b]">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {LIST_SIZES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => set('list_size', s.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                form.list_size === s.value
                  ? 'bg-[#03374f] text-white border-[#03374f]'
                  : 'bg-[#f8f6f3] text-gray-600 border-gray-200 hover:border-[#03374f]/40'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Output Format */}
      <div>
        <label className={labelClass}>Output Format</label>
        <div className="flex gap-3">
          {['pdf', 'excel'].map((fmt) => (
            <label key={fmt} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.output_formats.includes(fmt)}
                onChange={() => toggleFormat(fmt)}
                className="w-4 h-4 rounded accent-[#f26b2b]"
              />
              <span className="text-sm text-gray-700 uppercase font-medium">{fmt}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className={labelClass}>Notes <span className="text-gray-400 font-normal">(opt)</span></label>
        <textarea
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          rows={3}
          placeholder="Any specific criteria or additional details…"
          className="w-full px-4 py-3 bg-[#f8f6f3] border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#03374f]/15 focus:border-[#03374f]/40 transition-all text-sm resize-none"
        />
      </div>

      <div className="border-t border-gray-100 pt-5 space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Your Contact Info</p>

        <div>
          <label className={labelClass}>Full Name <span className="text-[#f26b2b]">*</span></label>
          <input type="text" value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)} required placeholder="Jane Smith" className={fieldClass} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Email <span className="text-[#f26b2b]">*</span></label>
            <input type="email" value={form.contact_email} onChange={(e) => set('contact_email', e.target.value)} required placeholder="you@example.com" className={fieldClass} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input type="tel" value={form.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} placeholder="(714) 555-0100" className={fieldClass} />
          </div>
        </div>
      </div>

      {status === 'error' && errorMsg && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full h-12 bg-[#f26b2b] hover:bg-[#e05d1e] disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
      >
        {status === 'loading' ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
        ) : (
          <><List className="w-4 h-4" /> Submit Farm Request</>
        )}
      </button>

      <p className="text-xs text-center text-gray-400">
        Your request goes directly to {repName}.
      </p>
    </form>
  )
}
