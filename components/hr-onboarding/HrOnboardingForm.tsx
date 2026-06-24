"use client"

import { useState } from 'react'

const NAVY = '#03374f'
const ORANGE = '#f26b2b'

export interface HrOnboardingFormData {
  first_name: string
  last_name: string
  full_legal_name: string
  preferred_name: string
  personal_email: string
  mobile: string
  birthday: string
  start_date: string
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_contact_relationship: string
  home_address_line1: string
  home_address_line2: string
  home_city: string
  home_state: string
  home_zip: string
  pronouns: string
  t_shirt_size: string
  dietary_restrictions: string
}

const STEPS = ['Basics', 'Personal', 'Emergency', 'Review'] as const

const inputStyle: React.CSSProperties = {
  width: '100%', height: 42, padding: '0 12px', boxSizing: 'border-box',
  border: '1px solid #d1d5db', borderRadius: 10, fontSize: 14, color: '#1f2937',
  backgroundColor: '#f9fafb',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 700, color: '#6b7280', marginBottom: 6,
}

function Field({
  label, value, onChange, type = 'text', placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '24px 24px', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      {children}
    </div>
  )
}

export default function HrOnboardingForm({
  token,
  initial,
}: {
  token: string
  initial: HrOnboardingFormData
}) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<HrOnboardingFormData>(initial)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedNote, setSavedNote] = useState<string | null>(null)

  function set<K extends keyof HrOnboardingFormData>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function save(action: 'save' | 'submit'): Promise<boolean> {
    setError(null)
    const res = await fetch(`/api/hr-onboarding/${token}/profile`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, action }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      setError(data?.error || 'Something went wrong. Please try again.')
      return false
    }
    return true
  }

  async function handleNext() {
    setSaving(true)
    const ok = await save('save')
    setSaving(false)
    if (ok) {
      setSavedNote('Progress saved.')
      setStep((s) => Math.min(s + 1, STEPS.length - 1))
    }
  }

  async function handleSaveDraft() {
    setSaving(true)
    const ok = await save('save')
    setSaving(false)
    if (ok) setSavedNote('Progress saved — you can return to this link later.')
  }

  async function handleSubmit() {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('Please provide your first and last name.')
      setStep(0)
      return
    }
    setSubmitting(true)
    const ok = await save('submit')
    setSubmitting(false)
    if (ok) setSubmitted(true)
  }

  if (submitted) {
    return (
      <Card>
        <p style={{ margin: '0 0 4px 0', fontSize: 13, fontWeight: 700, color: ORANGE, textTransform: 'uppercase', letterSpacing: 1 }}>
          All done
        </p>
        <h2 style={{ margin: '0 0 10px 0', fontSize: 22, color: NAVY }}>Thank you — your onboarding is submitted</h2>
        <p style={{ margin: 0, fontSize: 15, color: '#4b5563', lineHeight: 1.6 }}>
          HR will review your information. There&apos;s nothing more you need to do right now.
        </p>
      </Card>
    )
  }

  return (
    <div>
      {/* Progress */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {STEPS.map((label, i) => (
          <div key={label} style={{ flex: 1 }}>
            <div style={{ height: 6, borderRadius: 999, backgroundColor: i <= step ? ORANGE : '#e5e7eb' }} />
            <div style={{ fontSize: 11, color: i === step ? NAVY : '#9ca3af', marginTop: 4, fontWeight: i === step ? 700 : 400 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}
      {savedNote && !error && (
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 14 }}>
          {savedNote}
        </div>
      )}

      {step === 0 && (
        <Card>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 18, color: NAVY }}>The basics</h2>
          <Field label="First name" value={form.first_name} onChange={(v) => set('first_name', v)} />
          <Field label="Last name" value={form.last_name} onChange={(v) => set('last_name', v)} />
          <Field label="Full legal name" value={form.full_legal_name} onChange={(v) => set('full_legal_name', v)} placeholder="If different from above" />
          <Field label="Preferred name" value={form.preferred_name} onChange={(v) => set('preferred_name', v)} />
          <Field label="Pronouns" value={form.pronouns} onChange={(v) => set('pronouns', v)} />
        </Card>
      )}

      {step === 1 && (
        <Card>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 18, color: NAVY }}>Personal details</h2>
          <Field label="Personal email" type="email" value={form.personal_email} onChange={(v) => set('personal_email', v)} />
          <Field label="Mobile phone" value={form.mobile} onChange={(v) => set('mobile', v)} />
          <Field label="Birthday" type="date" value={form.birthday} onChange={(v) => set('birthday', v)} />
          <Field label="Start date" type="date" value={form.start_date} onChange={(v) => set('start_date', v)} />
          <Field label="Home address" value={form.home_address_line1} onChange={(v) => set('home_address_line1', v)} placeholder="Street address" />
          <Field label="Address line 2" value={form.home_address_line2} onChange={(v) => set('home_address_line2', v)} placeholder="Apt, suite, etc." />
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 2 }}><Field label="City" value={form.home_city} onChange={(v) => set('home_city', v)} /></div>
            <div style={{ flex: 1 }}><Field label="State" value={form.home_state} onChange={(v) => set('home_state', v)} /></div>
            <div style={{ flex: 1 }}><Field label="ZIP" value={form.home_zip} onChange={(v) => set('home_zip', v)} /></div>
          </div>
          <Field label="T-shirt size" value={form.t_shirt_size} onChange={(v) => set('t_shirt_size', v)} placeholder="S / M / L / XL" />
          <Field label="Dietary restrictions" value={form.dietary_restrictions} onChange={(v) => set('dietary_restrictions', v)} />
        </Card>
      )}

      {step === 2 && (
        <Card>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 18, color: NAVY }}>Emergency contact</h2>
          <Field label="Contact name" value={form.emergency_contact_name} onChange={(v) => set('emergency_contact_name', v)} />
          <Field label="Contact phone" value={form.emergency_contact_phone} onChange={(v) => set('emergency_contact_phone', v)} />
          <Field label="Relationship" value={form.emergency_contact_relationship} onChange={(v) => set('emergency_contact_relationship', v)} />
        </Card>
      )}

      {step === 3 && (
        <Card>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 18, color: NAVY }}>Review &amp; submit</h2>
          <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#4b5563', lineHeight: 1.6 }}>
            Please review your details. You can go back to make changes. When you submit,
            HR will review your information.
          </p>
          <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.9 }}>
            <div><strong style={{ color: NAVY }}>Name:</strong> {form.first_name} {form.last_name}</div>
            {form.preferred_name && <div><strong style={{ color: NAVY }}>Preferred:</strong> {form.preferred_name}</div>}
            {form.personal_email && <div><strong style={{ color: NAVY }}>Email:</strong> {form.personal_email}</div>}
            {form.mobile && <div><strong style={{ color: NAVY }}>Mobile:</strong> {form.mobile}</div>}
            {form.start_date && <div><strong style={{ color: NAVY }}>Start date:</strong> {form.start_date}</div>}
            {form.emergency_contact_name && (
              <div><strong style={{ color: NAVY }}>Emergency:</strong> {form.emergency_contact_name} ({form.emergency_contact_relationship || 'contact'}) {form.emergency_contact_phone}</div>
            )}
          </div>
          <p style={{ margin: '16px 0 0 0', fontSize: 12, color: '#9ca3af' }}>
            Document uploads will be requested separately.
          </p>
        </Card>
      )}

      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
        <div>
          {step > 0 && (
            <button
              type="button"
              onClick={() => { setError(null); setSavedNote(null); setStep((s) => Math.max(0, s - 1)) }}
              style={{ height: 42, padding: '0 18px', borderRadius: 10, border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Back
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving || submitting}
            style={{ height: 42, padding: '0 18px', borderRadius: 10, border: '1px solid #d1d5db', backgroundColor: '#fff', color: NAVY, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: saving || submitting ? 0.6 : 1 }}
          >
            {saving ? 'Saving…' : 'Save for later'}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={saving || submitting}
              style={{ height: 42, padding: '0 22px', borderRadius: 10, border: 'none', backgroundColor: ORANGE, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: saving || submitting ? 0.6 : 1 }}
            >
              {saving ? 'Saving…' : 'Continue'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || submitting}
              style={{ height: 42, padding: '0 22px', borderRadius: 10, border: 'none', backgroundColor: ORANGE, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: saving || submitting ? 0.6 : 1 }}
            >
              {submitting ? 'Submitting…' : 'Submit onboarding'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
