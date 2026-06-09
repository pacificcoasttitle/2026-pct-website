'use client'

/**
 * OnboardingProfileForm — the rep verify-info form (Phase 2c).
 *
 * Client island rendered inside the server-gated 2b page. It edits ONLY
 * the rep-writable allowlist; locked fields (name/title/email) are shown
 * read-only. Save → PATCH /api/onboarding/[token]/profile (the server
 * re-verifies the token + enforces the allowlist authoritatively — this
 * form is just the UI). The token is passed from the page's route.
 *
 * Brand: PCT navy #03374f, orange #f26b2b.
 */

import { useState } from 'react'

const NAVY   = '#03374f'
const ORANGE = '#f26b2b'

export interface EditableValues {
  phone:       string
  mobile:      string
  bio:         string
  specialties: string
  languages:   string
  linkedin:    string
  facebook:    string
  instagram:   string
  twitter:     string
  website:     string
}

interface Props {
  token:             string
  locked:            { name: string; title: string; email: string }
  initial:           EditableValues
  initialVerifiedAt: string | null
}

const FIELDS: { key: keyof EditableValues; label: string; type: 'text' | 'textarea' }[] = [
  { key: 'phone',       label: 'Phone',                       type: 'text' },
  { key: 'mobile',      label: 'Mobile',                      type: 'text' },
  { key: 'bio',         label: 'Bio',                         type: 'textarea' },
  { key: 'specialties', label: 'Specialties',                 type: 'text' },
  { key: 'languages',   label: 'Languages',                   type: 'text' },
  { key: 'linkedin',    label: 'LinkedIn',                    type: 'text' },
  { key: 'facebook',    label: 'Facebook',                    type: 'text' },
  { key: 'instagram',   label: 'Instagram',                   type: 'text' },
  { key: 'twitter',     label: 'Twitter / X',                 type: 'text' },
  { key: 'website',     label: 'Website',                     type: 'text' },
]

function fmtDate(iso: string | null): string {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      timeZone: 'America/Los_Angeles',
    }).format(new Date(iso))
  } catch { return '' }
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', padding: '9px 11px',
  border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, color: NAVY,
  fontFamily: 'inherit', backgroundColor: '#fff',
}
const lockedStyle: React.CSSProperties = {
  ...inputStyle, backgroundColor: '#f3f4f6', color: '#6b7280',
}

export function OnboardingProfileForm({ token, locked, initial, initialVerifiedAt }: Props) {
  const [values, setValues]   = useState<EditableValues>(initial)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')
  const [verifiedAt, setVerifiedAt] = useState<string | null>(initialVerifiedAt)
  const [justSaved, setJustSaved]   = useState(false)

  function set(key: keyof EditableValues, v: string) {
    setValues((cur) => ({ ...cur, [key]: v }))
    setJustSaved(false)
  }

  async function save() {
    setSaving(true); setError(''); setJustSaved(false)
    try {
      const res = await fetch(`/api/onboarding/${encodeURIComponent(token)}/profile`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(values),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Could not save your info. Please try again.')
      setVerifiedAt(data?.info_verified_at ?? new Date().toISOString())
      setJustSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your info. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '24px 28px', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: 16, color: NAVY }}>Your information</h2>
        {verifiedAt && (
          <span style={{ fontSize: 12, fontWeight: 600, color: '#065f46', backgroundColor: '#d1fae5', padding: '3px 10px', borderRadius: 999 }}>
            ✓ Verified{fmtDate(verifiedAt) ? ` on ${fmtDate(verifiedAt)}` : ''}
          </span>
        )}
      </div>

      {/* Locked fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Name</label>
          <input value={locked.name} disabled readOnly style={lockedStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Title</label>
          <input value={locked.title} disabled readOnly style={lockedStyle} />
        </div>
      </div>
      <div style={{ marginBottom: 6 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Email</label>
        <input value={locked.email} disabled readOnly style={lockedStyle} />
      </div>
      <p style={{ margin: '0 0 18px 0', fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>
        Name, title, and email are managed by your manager — contact them to change these.
      </p>

      {/* Editable fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {FIELDS.map((f) => (
          <div key={f.key} style={{ gridColumn: f.type === 'textarea' ? '1 / -1' : 'auto' }}>
            <label style={{ display: 'block', fontSize: 12, color: '#6b7280', marginBottom: 4 }}>{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea
                value={values[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            ) : (
              <input
                value={values[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
                style={inputStyle}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <p style={{ margin: '16px 0 0 0', fontSize: 13, color: '#b91c1c', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px' }}>
          {error}
        </p>
      )}
      {justSaved && !error && (
        <p style={{ margin: '16px 0 0 0', fontSize: 13, color: '#065f46', backgroundColor: '#d1fae5', borderRadius: 8, padding: '8px 12px' }}>
          Thanks — your info is saved.
        </p>
      )}

      <div style={{ marginTop: 18 }}>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          style={{
            backgroundColor: ORANGE, color: '#fff', border: 'none',
            borderRadius: 10, padding: '11px 22px', fontSize: 14, fontWeight: 700,
            cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? 'Saving…' : 'Save / Verify my info'}
        </button>
      </div>
    </div>
  )
}
