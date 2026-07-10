"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const NAVY = '#03374f'
const ORANGE = '#f26b2b'

interface DocRow {
  id: number
  doc_type: string
  file_name: string | null
  uploaded_at: string
}

interface DepartmentKickoffRow {
  category: string
  item_count: number
  sent_to: string | null
  sent_at: string | null
  sent_by: string | null
  department_note: string | null
}

interface DepartmentKickoffResult {
  sent?: Array<{ category: string; department: string; sent_to: string; item_count: number }>
  skipped?: Array<{ category: string; department: string; reason: string }>
  failed?: Array<{ category: string; department: string; sent_to: string; item_count: number; error: string }>
  tracking?: DepartmentKickoffRow[]
}

interface Props {
  id: number
  status: string
  invitedEmail: string | null
  hrEmployeeId: number | null
  payload: Record<string, unknown>
  invitedAt: string | null
  submittedAt: string | null
  finalizedAt: string | null
  createdAt: string
  tokenExpiresAt: string | null
  documents: DocRow[]
  departmentKickoff: DepartmentKickoffRow[]
  introEmailSentAt: string | null
}

// Fields that map to hr_employees on finalize (4a design).
const MAPPED_FIELDS: { key: string; label: string }[] = [
  { key: 'first_name', label: 'First name' },
  { key: 'last_name', label: 'Last name' },
  { key: 'full_legal_name', label: 'Full legal name' },
  { key: 'email', label: 'Email' },
  { key: 'title', label: 'Title' },
  { key: 'department', label: 'Department' },
  { key: 'office', label: 'Office' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'office_phone', label: 'Office phone' },
  { key: 'birthday', label: 'Birthday' },
  { key: 'start_date', label: 'Start date' },
]

// Fields preserved in payload (no hr_employees column — 4a flagged).
const UNMAPPED_FIELDS: { key: string; label: string }[] = [
  { key: 'preferred_name', label: 'Preferred name' },
  { key: 'personal_email', label: 'Personal email' },
  { key: 'emergency_contact_name', label: 'Emergency contact' },
  { key: 'emergency_contact_phone', label: 'Emergency phone' },
  { key: 'emergency_contact_relationship', label: 'Emergency relationship' },
  { key: 'home_address_line1', label: 'Address line 1' },
  { key: 'home_address_line2', label: 'Address line 2' },
  { key: 'home_city', label: 'City' },
  { key: 'home_state', label: 'State' },
  { key: 'home_zip', label: 'ZIP' },
  { key: 't_shirt_size', label: 'PCT Swag T-Shirt Size' },
  { key: 'bio', label: 'Bio (sales rep)' },
]

const DOC_TYPE_LABEL: Record<string, string> = {
  id: 'Government ID',
  tax_form: 'Tax form (W-4)',
  direct_deposit: 'Direct deposit',
  headshot: 'Headshot',
  client_list: 'Contact / client list',
  // signed_policy retired (upload prompt removed); legacy rows fall back
  // to the raw doc_type via `|| d.doc_type` at the render site.
}

const DEPARTMENT_LABEL: Record<string, string> = {
  administrative: 'Administrative',
  marketing: 'Marketing',
  'customer-service': 'Customer Service',
  it: 'IT',
}

function str(payload: Record<string, unknown>, key: string): string {
  const v = payload[key]
  return typeof v === 'string' ? v.trim() : ''
}

function fmt(d: string | null): string {
  if (!d) return '—'
  const dt = new Date(d)
  return Number.isNaN(dt.getTime()) ? d : dt.toLocaleString()
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    submitted: { bg: 'rgba(242,107,43,0.15)', fg: '#c4541d' },
    finalized: { bg: '#d1fae5', fg: '#065f46' },
    in_progress: { bg: '#e0f2fe', fg: '#075985' },
    invited: { bg: '#ede9fe', fg: '#5b21b6' },
    draft: { bg: '#e5e7eb', fg: '#4b5563' },
    cancelled: { bg: '#fee2e2', fg: '#991b1b' },
  }
  const s = map[status] ?? map.draft
  return (
    <span style={{ backgroundColor: s.bg, color: s.fg, fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 999, textTransform: 'capitalize' }}>
      {status.replace('_', ' ')}
    </span>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 14, padding: '20px 22px', marginBottom: 18, boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #eef0f2' }}>
      <h2 style={{ margin: '0 0 14px 0', fontSize: 15, color: NAVY, fontWeight: 700 }}>{title}</h2>
      {children}
    </div>
  )
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '7px 0', borderTop: '1px solid #f3f4f6', fontSize: 14 }}>
      <div style={{ width: 180, color: '#6b7280', flexShrink: 0 }}>{label}</div>
      <div style={{ color: value ? '#111827' : '#cbd5e1' }}>{value || '—'}</div>
    </div>
  )
}

export default function HrOnboardingReviewClient(props: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(props.status)
  const [busy, setBusy] = useState<null | 'finalize' | 'changes' | 'cancel' | 'kickoff'>(null)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [departmentKickoff, setDepartmentKickoff] = useState(props.departmentKickoff)
  const [kickoffResult, setKickoffResult] = useState<DepartmentKickoffResult | null>(null)
  const [introEmailSentAt, setIntroEmailSentAt] = useState<string | null>(props.introEmailSentAt)

  // Refetch department kickoff state on focus. Department notes and item
  // completions are written from a SEPARATE (token-gated) session, so this
  // open HR page can go stale; refetching on focus picks them up without a
  // manual reload. Mirrors the Batch-A checklist refetch discipline: event
  // driven (NOT polling), busy-guarded so it never clobbers a mid-flight
  // HR action (finalize/changes/cancel/kickoff), and silent on failure.
  const busyRef = useRef<typeof busy>(null)
  busyRef.current = busy

  const refetchKickoff = useCallback(async () => {
    if (busyRef.current !== null) return
    try {
      const res = await fetch(`/api/admin/hr/onboarding/${props.id}/kickoff/state`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      })
      if (!res.ok) return
      const data = await res.json().catch(() => null)
      if (!data?.departmentKickoff || busyRef.current !== null) return
      setDepartmentKickoff(data.departmentKickoff as DepartmentKickoffRow[])
    } catch {
      // Silent — focus-refetch is a freshness convenience, not critical.
    }
  }, [props.id])

  useEffect(() => {
    const onFocus = () => { void refetchKickoff() }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void refetchKickoff()
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [refetchKickoff])

  const isSubmitted = status === 'submitted'
  const isFinalized = status === 'finalized'
  const isCancelled = status === 'cancelled'
  const canCancel = !isFinalized && !isCancelled
  const canKickoffDepartments = isSubmitted || isFinalized
  const hasKickedOffDepartments = departmentKickoff.some((row) => row.sent_at)

  const expired =
    !!props.tokenExpiresAt &&
    ['invited', 'in_progress'].includes(status) &&
    new Date(props.tokenExpiresAt).getTime() <= Date.now()

  async function finalize() {
    if (!isSubmitted) return
    if (!confirm('Approve & finalize? This creates/updates the canonical employee record. This cannot be undone here.')) return
    setError(null); setNote(null); setBusy('finalize')
    try {
      const res = await fetch(`/api/admin/hr/onboarding/${props.id}/finalize`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data?.error || 'Could not finalize.'); return }
      setStatus('finalized')
      setNote('Onboarding finalized — the employee record has been committed.')
      router.refresh()
    } finally { setBusy(null) }
  }

  async function cancel() {
    if (!canCancel) return
    if (!confirm('Cancel this onboarding? The employee’s link will stop working. (A finalized onboarding can’t be cancelled.)')) return
    setError(null); setNote(null); setBusy('cancel')
    try {
      const res = await fetch(`/api/admin/hr/onboarding/${props.id}/cancel`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data?.error || 'Could not cancel.'); return }
      setStatus('cancelled')
      setNote('Onboarding cancelled — the invite link no longer works.')
      router.refresh()
    } finally { setBusy(null) }
  }

  async function requestChanges() {
    if (!isSubmitted) return
    setError(null); setNote(null); setBusy('changes')
    try {
      const res = await fetch(`/api/admin/hr/onboarding/${props.id}/request-changes`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data?.error || 'Could not request changes.'); return }
      setStatus('in_progress')
      setNote('Sent back to the employee (status: in progress). Their existing onboarding link still works so they can edit and re-submit — or use “Resend” on the onboarding list to issue a fresh link (which invalidates the old one).')
      router.refresh()
    } finally { setBusy(null) }
  }

  async function kickoffDepartments() {
    if (!canKickoffDepartments) return
    const message = hasKickedOffDepartments
      ? 'Re-send department kickoff emails? This generates new department links and invalidates the previous ones — any old department link will stop working, so teams must use the new email.'
      : 'Kick off department checklist emails? This sends one email to each department that has checklist items.'
    if (!confirm(message)) return
    setError(null); setNote(null); setKickoffResult(null); setBusy('kickoff')
    try {
      const res = await fetch(`/api/admin/hr/onboarding/${props.id}/kickoff`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data?.error || 'Could not kick off departments.'); return }
      setKickoffResult(data)
      if (Array.isArray(data.tracking)) setDepartmentKickoff(data.tracking)
      // Intro email is a system action; reflect it once sent (router.refresh
      // below reloads the authoritative timestamp).
      if ((data.intro_email === 'sent' || data.intro_email === 'skipped') && !introEmailSentAt) {
        setIntroEmailSentAt(new Date().toISOString())
      }
      const sent = Array.isArray(data.sent) ? data.sent.length : 0
      const failed = Array.isArray(data.failed) ? data.failed.length : 0
      const skipped = Array.isArray(data.skipped) ? data.skipped.length : 0
      setNote(`Department kickoff complete — sent ${sent}, skipped ${skipped}, failed ${failed}. Re-sends replace department links and the previous links stop working.`)
      router.refresh()
    } finally { setBusy(null) }
  }

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '8px 0 40px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <a href="/admin/team/hr/onboarding" style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none' }}>← Back to onboardings</a>
          <h1 style={{ margin: '6px 0 0 0', fontSize: 22, color: NAVY }}>
            {str(props.payload, 'first_name')} {str(props.payload, 'last_name')}
            {!str(props.payload, 'first_name') && (props.invitedEmail || `Onboarding #${props.id}`)}
          </h1>
        </div>
        <StatusBadge status={status} />
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 14 }}>{error}</div>
      )}
      {note && !error && (
        <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 14 }}>{note}</div>
      )}

      <Card title="Status & history">
        <FieldRow label="Invited" value={fmt(props.invitedAt)} />
        <FieldRow label="Submitted" value={fmt(props.submittedAt)} />
        <FieldRow label="Finalized" value={fmt(props.finalizedAt)} />
        <FieldRow
          label="Invite link"
          value={
            props.tokenExpiresAt
              ? expired
                ? `Expired ${fmt(props.tokenExpiresAt)} — resend to issue a fresh link`
                : `Valid until ${fmt(props.tokenExpiresAt)}`
              : '—'
          }
        />
        <FieldRow label="Linked employee" value={props.hrEmployeeId ? `#${props.hrEmployeeId} (existing — will update)` : 'None (new hire — will create)'} />
      </Card>

      <Card title="Department kickoff">
        <p style={{ margin: '0 0 10px 0', fontSize: 12, color: '#9ca3af' }}>
          Sends one task-only checklist link to each department with items. Re-send replaces the department links and the previous links stop working, so teams must use the new email.
        </p>
        {departmentKickoff.map((row) => (
          <div key={row.category} style={{ padding: '8px 0', borderTop: '1px solid #f3f4f6', fontSize: 14 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 150, color: NAVY, fontWeight: 700 }}>{DEPARTMENT_LABEL[row.category] || row.category}</div>
              <div style={{ width: 80, color: '#6b7280' }}>{row.item_count} item{row.item_count === 1 ? '' : 's'}</div>
              <div style={{ flex: 1, color: row.sent_at ? '#047857' : '#9ca3af' }}>
                {row.sent_at
                  ? `Sent ${fmt(row.sent_at)} to ${row.sent_to || '—'}${row.sent_by ? ` by ${row.sent_by}` : ''}`
                  : row.item_count > 0 ? 'Not sent yet' : 'Skipped — no items'}
              </div>
            </div>
            {row.department_note && (
              <div style={{ marginTop: 6, marginLeft: 150, padding: '8px 12px', borderRadius: 8, backgroundColor: '#f9fafb', border: '1px solid #eef0f2' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 3 }}>Note from {DEPARTMENT_LABEL[row.category] || row.category}</div>
                <div style={{ fontSize: 13, color: '#374151', whiteSpace: 'pre-wrap' }}>{row.department_note}</div>
              </div>
            )}
          </div>
        ))}
        {kickoffResult && (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 10, backgroundColor: '#f9fafb', border: '1px solid #eef0f2', fontSize: 13 }}>
            {(kickoffResult.sent || []).length > 0 && (
              <div style={{ color: '#047857', marginBottom: 6 }}>
                Sent: {(kickoffResult.sent || []).map((r) => `${r.department} → ${r.sent_to}`).join(', ')}
              </div>
            )}
            {(kickoffResult.skipped || []).length > 0 && (
              <div style={{ color: '#6b7280', marginBottom: 6 }}>
                Skipped: {(kickoffResult.skipped || []).map((r) => `${r.department} (${r.reason})`).join(', ')}
              </div>
            )}
            {(kickoffResult.failed || []).length > 0 && (
              <div style={{ color: '#b91c1c' }}>
                Failed: {(kickoffResult.failed || []).map((r) => `${r.department} (${r.error})`).join(', ')}
              </div>
            )}
          </div>
        )}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>
            System actions
          </div>
          <div style={{ fontSize: 14, color: introEmailSentAt ? '#047857' : '#9ca3af' }}>
            {introEmailSentAt
              ? `Intro email sent ✓ ${fmt(introEmailSentAt)}`
              : 'Intro email not sent yet — sent to the new hire on department kickoff.'}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <button
            type="button"
            onClick={kickoffDepartments}
            disabled={!canKickoffDepartments || busy !== null}
            style={{ height: 40, padding: '0 16px', borderRadius: 10, border: 'none', backgroundColor: NAVY, color: '#fff', fontSize: 14, fontWeight: 700, cursor: canKickoffDepartments ? 'pointer' : 'not-allowed', opacity: !canKickoffDepartments || busy ? 0.6 : 1 }}
          >
            {busy === 'kickoff'
              ? 'Sending…'
              : hasKickedOffDepartments ? 'Re-send departments' : 'Kick off departments'}
          </button>
        </div>
      </Card>

      <Card title="Will be saved to the employee record">
        {MAPPED_FIELDS.map((f) => (
          <FieldRow key={f.key} label={f.label} value={f.key === 'email' ? (str(props.payload, 'email') || props.invitedEmail || '') : str(props.payload, f.key)} />
        ))}
      </Card>

      <Card title="Additional info (kept on the onboarding record)">
        <p style={{ margin: '0 0 8px 0', fontSize: 12, color: '#9ca3af' }}>
          These fields have no employee-record column yet, so they stay preserved on this onboarding.
        </p>
        {UNMAPPED_FIELDS.filter((f) => str(props.payload, f.key)).length === 0 ? (
          <p style={{ margin: 0, fontSize: 14, color: '#cbd5e1' }}>None provided.</p>
        ) : (
          UNMAPPED_FIELDS.map((f) => {
            const v = str(props.payload, f.key)
            return v ? <FieldRow key={f.key} label={f.label} value={v} /> : null
          })
        )}
      </Card>

      <Card title="Uploaded documents">
        {props.documents.length === 0 ? (
          <p style={{ margin: 0, fontSize: 14, color: '#cbd5e1' }}>No documents uploaded.</p>
        ) : (
          props.documents.map((d) => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: '1px solid #f3f4f6' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{DOC_TYPE_LABEL[d.doc_type] || d.doc_type}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>{d.file_name || '(file)'} · {fmt(d.uploaded_at)}</div>
              </div>
              {/* Viewed ONLY through the authenticated hr-tools route — never a public URL. */}
              <a
                href={`/api/admin/hr/onboarding/${props.id}/documents/${d.id}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 13, fontWeight: 700, color: ORANGE, textDecoration: 'none', padding: '6px 14px', border: `1px solid ${ORANGE}`, borderRadius: 8 }}
              >
                View
              </a>
            </div>
          ))
        )}
      </Card>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 4 }}>
        {/* Cancel — available for any non-finalized, non-cancelled record. */}
        {canCancel && (
          <button
            type="button"
            onClick={cancel}
            disabled={busy !== null}
            style={{ height: 42, padding: '0 16px', borderRadius: 10, border: '1px solid #fecaca', backgroundColor: '#fff', color: '#b91c1c', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}
          >
            {busy === 'cancel' ? 'Cancelling…' : 'Cancel onboarding'}
          </button>
        )}

        <div style={{ flex: 1 }} />

        {isFinalized ? (
          <span style={{ fontSize: 14, color: '#047857', fontWeight: 600, alignSelf: 'center' }}>
            ✓ Finalized — committed to the employee roster (read-only).
          </span>
        ) : isCancelled ? (
          <span style={{ fontSize: 14, color: '#9ca3af', alignSelf: 'center' }}>
            This onboarding was cancelled — the invite link no longer works.
          </span>
        ) : !isSubmitted ? (
          <span style={{ fontSize: 14, color: '#9ca3af', alignSelf: 'center' }}>
            This onboarding is <strong>{status.replace('_', ' ')}</strong> — only a submitted onboarding can be reviewed &amp; finalized.
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={requestChanges}
              disabled={busy !== null}
              style={{ height: 42, padding: '0 18px', borderRadius: 10, border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}
            >
              {busy === 'changes' ? 'Working…' : 'Request changes'}
            </button>
            <button
              type="button"
              onClick={finalize}
              disabled={busy !== null}
              style={{ height: 42, padding: '0 22px', borderRadius: 10, border: 'none', backgroundColor: ORANGE, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: busy ? 0.6 : 1 }}
            >
              {busy === 'finalize' ? 'Finalizing…' : 'Approve & Finalize'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
