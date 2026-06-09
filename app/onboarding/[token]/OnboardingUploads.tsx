'use client'

/**
 * OnboardingUploads — the rep's action item (Phase 2d).
 *
 * Client island on the server-gated rep page. Three affordances:
 *   - Headshot: image picker with a client-side preview of the SELECTED
 *     image, uploaded to /api/onboarding/[token]/upload (kind=headshot).
 *   - Client list: file picker — we show ONLY the filename, never the
 *     contents (PII; the bytes are opaque, stored, never parsed).
 *   - Bio: textarea routed through the same endpoint (kind=bio), which
 *     performs the 2c allowlisted bio write.
 *
 * A 3-part progress strip (Headshot · Bio · Client list) reflects what's
 * present. The token comes from the page route; the server re-verifies
 * it + enforces MIME/size/rate-limit authoritatively.
 *
 * Brand: PCT navy #03374f, orange #f26b2b.
 */

import { useRef, useState } from 'react'

const NAVY   = '#03374f'
const ORANGE = '#f26b2b'

export interface PresentState { headshot: boolean; bio: boolean; client_list: boolean }

interface Props {
  token:        string
  initialPhoto: string | null
  initialBio:   string
  initialPresent: PresentState
}

const btn: React.CSSProperties = {
  backgroundColor: ORANGE, color: '#fff', border: 'none', borderRadius: 10,
  padding: '9px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
}
const btnGhost: React.CSSProperties = {
  backgroundColor: '#fff', color: NAVY, border: '1px solid #d1d5db', borderRadius: 10,
  padding: '9px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
}

function Pill({ label, done }: { label: string; done: boolean }) {
  return (
    <span style={{ fontSize: 13, fontWeight: 600, color: done ? '#065f46' : '#9ca3af' }}>
      {label} {done ? '✓' : '◻'}
    </span>
  )
}

export function OnboardingUploads({ token, initialPhoto, initialBio, initialPresent }: Props) {
  const [present, setPresent]   = useState<PresentState>(initialPresent)
  const [photo, setPhoto]       = useState<string | null>(initialPhoto)
  const [bio, setBio]           = useState(initialBio)
  const [headshotPreview, setHeadshotPreview] = useState<string | null>(null)
  const [clientFileName, setClientFileName]   = useState<string | null>(null)
  const [busy, setBusy]   = useState<string | null>(null)
  const [msg, setMsg]     = useState('')
  const [err, setErr]     = useState('')

  const headshotInput = useRef<HTMLInputElement>(null)
  const clientInput    = useRef<HTMLInputElement>(null)

  async function send(kind: string, payload: FormData) {
    setBusy(kind); setErr(''); setMsg('')
    try {
      const res = await fetch(`/api/onboarding/${encodeURIComponent(token)}/upload`, {
        method: 'POST', body: payload,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Upload failed. Please try again.')
      if (data.present) setPresent(data.present)
      return data
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Upload failed. Please try again.')
      return null
    } finally {
      setBusy(null)
    }
  }

  function onHeadshotPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    // Client-side preview of the SELECTED image only.
    const url = URL.createObjectURL(f)
    setHeadshotPreview(url)
  }

  async function uploadHeadshot() {
    const f = headshotInput.current?.files?.[0]
    if (!f) { setErr('Pick an image first.'); return }
    const fd = new FormData(); fd.append('kind', 'headshot'); fd.append('file', f)
    const data = await send('headshot', fd)
    if (data?.ok) {
      if (data.photo_url) setPhoto(data.photo_url)
      setMsg('Headshot received.')
      setHeadshotPreview(null)
      if (headshotInput.current) headshotInput.current.value = ''
    }
  }

  function onClientPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    setClientFileName(f ? f.name : null)   // filename ONLY — never read contents
  }

  async function uploadClientList() {
    const f = clientInput.current?.files?.[0]
    if (!f) { setErr('Pick a file first.'); return }
    const fd = new FormData(); fd.append('kind', 'client_list'); fd.append('file', f)
    const data = await send('client_list', fd)
    if (data?.ok) {
      setMsg(`Client list received: ${data.file_name || f.name}`)
      if (clientInput.current) clientInput.current.value = ''
    }
  }

  async function saveBio() {
    const fd = new FormData(); fd.append('kind', 'bio'); fd.append('bio', bio)
    const data = await send('bio', fd)
    if (data?.ok) setMsg('Bio saved.')
  }

  const card: React.CSSProperties = {
    backgroundColor: '#fff', borderRadius: 16, padding: '24px 28px', marginBottom: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  }
  const section: React.CSSProperties = { paddingTop: 18, marginTop: 18, borderTop: '1px solid #f3f4f6' }

  return (
    <div style={card}>
      <h2 style={{ margin: '0 0 4px 0', fontSize: 16, color: NAVY }}>Your action items</h2>
      <p style={{ margin: '0 0 14px 0', fontSize: 13, color: '#6b7280' }}>
        Please provide your headshot, bio, and client list.
      </p>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', padding: '10px 14px', backgroundColor: '#f9fafb', borderRadius: 10 }}>
        <Pill label="Headshot" done={present.headshot} />
        <Pill label="Bio" done={present.bio} />
        <Pill label="Client list" done={present.client_list} />
      </div>

      {err && <p style={{ margin: '14px 0 0 0', fontSize: 13, color: '#b91c1c', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px' }}>{err}</p>}
      {msg && !err && <p style={{ margin: '14px 0 0 0', fontSize: 13, color: '#065f46', backgroundColor: '#d1fae5', borderRadius: 8, padding: '8px 12px' }}>{msg}</p>}

      {/* Headshot */}
      <div style={section}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: 14, color: NAVY }}>Headshot</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {(headshotPreview || photo) && (
            <img
              src={headshotPreview || photo || ''}
              alt="Headshot preview"
              width={72} height={72}
              style={{ width: 72, height: 72, borderRadius: 36, objectFit: 'cover', border: '1px solid #e5e7eb' }}
            />
          )}
          <input
            ref={headshotInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onHeadshotPick}
            style={{ fontSize: 13 }}
          />
          <button type="button" style={btn} disabled={busy === 'headshot'} onClick={uploadHeadshot}>
            {busy === 'headshot' ? 'Uploading…' : 'Upload headshot'}
          </button>
        </div>
      </div>

      {/* Bio */}
      <div style={section}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: 14, color: NAVY }}>Bio</h3>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={5}
          placeholder="A short professional bio…"
          style={{ width: '100%', boxSizing: 'border-box', padding: '9px 11px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, color: NAVY, fontFamily: 'inherit', resize: 'vertical' }}
        />
        <div style={{ marginTop: 10 }}>
          <button type="button" style={btn} disabled={busy === 'bio'} onClick={saveBio}>
            {busy === 'bio' ? 'Saving…' : 'Save bio'}
          </button>
        </div>
      </div>

      {/* Client list */}
      <div style={section}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: 14, color: NAVY }}>Client list</h3>
        <p style={{ margin: '0 0 8px 0', fontSize: 12, color: '#9ca3af' }}>
          CSV or Excel (.csv, .xlsx, .xls). We store your file securely and never display its contents here.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <input
            ref={clientInput}
            type="file"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={onClientPick}
            style={{ fontSize: 13 }}
          />
          <button type="button" style={btnGhost} disabled={busy === 'client_list'} onClick={uploadClientList}>
            {busy === 'client_list' ? 'Uploading…' : 'Upload client list'}
          </button>
        </div>
        {clientFileName && (
          <p style={{ margin: '8px 0 0 0', fontSize: 12, color: '#6b7280' }}>Selected: {clientFileName}</p>
        )}
      </div>
    </div>
  )
}
