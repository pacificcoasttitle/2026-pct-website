"use client"

/**
 * HR onboarding wizard — V0 visual design wired to the EXISTING logic.
 *
 * ⚠️ The VISUAL layer is the V0 design (polished enterprise look, V0's
 * navy/orange/green palette). The LOGIC is unchanged from the prior
 * inline-styled form: the same state, set(), save(action), uploadDoc(),
 * handleSubmit(), and the `initial` prefill prop. V0's own dummy logic
 * (fake timers, simulated upload, stricter validation, demo harness) is
 * NOT used.
 *
 * Theme: the wizard is wrapped in `.pct-wizard`, which scopes V0's palette
 * locally (see globals.css) and forces light mode — app-global tokens are
 * untouched.
 *
 * ⚠️ PRESERVED CONTRACTS:
 *   - Reads/writes the existing snake_case HrOnboardingFormData via set().
 *   - save() PATCHes the whole form to the profile route; the server
 *     ALLOWLIST is the source of truth (we never gate keys client-side
 *     beyond the existing minimal first+last check at submit).
 *   - uploadDoc() POSTs to /upload with the existing doc keys
 *     (id/tax_form/direct_deposit); only the server-returned file_name is
 *     stored client-side — never a URL/R2 key.
 *   - "Save for later" still persists partial data (no V0 required gate).
 */

import { useRef, useState } from 'react'
import {
  ArrowLeft, Loader2, AlertTriangle, Check, ShieldCheck, Lock,
  ChevronDown, UploadCloud, CheckCircle2, FileText, RefreshCw, Pencil,
} from 'lucide-react'
import PhoneInput, { isValidUsPhone } from '@/components/ui/PhoneInput'

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
  t_shirt_size: string
  bio: string
}

type FieldKey = keyof HrOnboardingFormData

const STEPS = ['Basics', 'Personal', 'Emergency', 'Documents', 'Review'] as const

// Standard document uploads (government ID, tax form, direct deposit) were
// removed from onboarding — HR collects those separately. Only sales-rep
// materials remain, gated by onboarding_type === 'sales_rep'. Retrieval +
// labels for any already-uploaded standard docs live in the HR-side views
// and the upload route allowlist (kept intact so old docs stay viewable).
// Sales-rep-only extras (shown only when onboarding_type === 'sales_rep').
const HEADSHOT_ACCEPT = '.png,.jpg,.jpeg,.webp'
const CLIENT_LIST_ACCEPT =
  '.csv,.xlsx,.xls,.pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf'

const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

// ⚠️ 2-LETTER VALUES with full-name display labels — protects existing /
// prefilled 2-letter home_state data (a stored "CA" stays selected).
const US_STATES: { value: string; label: string }[] = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'],
  ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'],
  ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'],
  ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'],
  ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'],
  ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'],
  ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
  ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
  ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'],
  ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'],
  ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'],
  ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
].map(([value, label]) => ({ value, label }))

const CONTROL =
  'h-11 w-full rounded-lg border border-input bg-card px-3.5 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground/70 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/25'

function FieldShell({
  label, required, helper, children,
}: {
  label: string
  required?: boolean
  helper?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-accent">*</span>}
      </label>
      {children}
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  )
}

export default function HrOnboardingForm({
  token,
  initial,
  mode = 'new',
  onboardingType = 'sales_rep',
}: {
  token: string
  initial: HrOnboardingFormData
  mode?: 'new' | 'existing'
  onboardingType?: 'sales_rep' | 'employee'
}) {
  const isSalesRep = onboardingType === 'sales_rep'
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<HrOnboardingFormData>(initial)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedNote, setSavedNote] = useState<string | null>(null)
  // Uploaded doc display state (file name only — never a URL/key).
  const [docs, setDocs] = useState<Record<string, string>>({})
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const isLast = step === STEPS.length - 1

  function set<K extends FieldKey>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    setSavedNote(null)
  }

  function focusCard() {
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function uploadDoc(docType: string, file: File) {
    setError(null)
    setUploadingDoc(docType)
    try {
      const fd = new FormData()
      fd.append('doc_type', docType)
      fd.append('file', file)
      const res = await fetch(`/api/hr-onboarding/${token}/upload`, { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'Upload failed. Please try again.')
        return
      }
      // Show only the safe display name returned by the server.
      setDocs((d) => ({ ...d, [docType]: data?.document?.file_name || file.name }))
    } finally {
      setUploadingDoc(null)
    }
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
      focusCard()
    }
  }

  function handleBack() {
    setError(null)
    setStep((s) => Math.max(0, s - 1))
    focusCard()
  }

  function jumpTo(target: number) {
    setError(null)
    setStep(target)
    focusCard()
  }

  async function handleSaveDraft() {
    setSaving(true)
    const ok = await save('save')
    setSaving(false)
    if (ok) setSavedNote('Saved — you can return to this link later.')
  }

  async function handleSubmit() {
    // Minimal validation (existing): first + last only. The server
    // allowlist is the source of truth; "save for later" stays permissive.
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('Please provide your first and last name.')
      setStep(0)
      focusCard()
      return
    }
    // Phones are US 10-digit. Mobile is required; emergency phone optional
    // (empty is valid). Block submit on non-conforming input rather than
    // silently truncating.
    if (!isValidUsPhone(form.mobile) || !isValidUsPhone(form.emergency_contact_phone)) {
      setError('Phone numbers must be US 10-digit (e.g. (555) 123-4567).')
      setStep(0)
      focusCard()
      return
    }
    setSubmitting(true)
    const ok = await save('submit')
    setSubmitting(false)
    if (ok) setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="pct-wizard w-full max-w-[480px]">
        <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[var(--success)]/10">
            <CheckCircle2 className="size-9 text-[var(--success)]" aria-hidden="true" />
          </div>
          <h1 className="text-balance text-xl font-semibold text-foreground">
            Thank you — your onboarding is submitted
          </h1>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
            HR will review your information. There&apos;s nothing more you need to do right now —
            if anything else is needed, HR will reach out.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="pct-wizard w-full max-w-[660px]">
      {/* Stepper */}
      <nav aria-label="Onboarding progress" className="mb-7 px-2">
        <ol className="flex items-start">
          {STEPS.map((label, i) => {
            const completed = i < step
            const active = i === step
            const isLastStep = i === STEPS.length - 1
            return (
              <li key={label} className={isLastStep ? 'flex flex-col items-center' : 'flex flex-1 flex-col items-center'}>
                <div className="flex w-full items-center">
                  <span
                    aria-current={active ? 'step' : undefined}
                    className={[
                      'flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
                      completed ? 'border-accent bg-accent text-accent-foreground' : '',
                      active ? 'border-accent bg-card text-accent ring-4 ring-accent/15' : '',
                      !completed && !active ? 'border-border bg-card text-muted-foreground' : '',
                    ].join(' ')}
                  >
                    {completed ? <Check className="size-4" aria-hidden="true" /> : i + 1}
                  </span>
                  {!isLastStep && (
                    <div className="mx-1.5 h-0.5 flex-1 rounded-full bg-border">
                      <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: completed ? '100%' : '0%' }} />
                    </div>
                  )}
                </div>
                <span className={['mt-2 text-center text-[11px] font-medium sm:text-xs', active ? 'text-accent' : completed ? 'text-foreground' : 'text-muted-foreground'].join(' ')}>
                  {label}
                </span>
              </li>
            )
          })}
        </ol>
      </nav>

      <div ref={cardRef} className="scroll-mt-6 rounded-2xl border border-border bg-card shadow-sm">
        {/* Header */}
        <div className="border-b border-border px-6 py-5 sm:px-8">
          <h1 className="text-balance text-lg font-semibold text-foreground sm:text-xl">
            {mode === 'existing' ? 'Confirm Your Information' : 'Welcome to Pacific Coast Title'}
          </h1>
          <p className="mt-1 text-pretty text-sm text-muted-foreground">
            {mode === 'existing'
              ? 'Please review and update your details so our records stay current.'
              : 'Let’s get you set up — this only takes a few minutes.'}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 sm:px-8">
          {error && (
            <div role="alert" className="mb-5 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span className="font-medium">{error}</span>
            </div>
          )}
          {savedNote && !error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-[var(--success)]/30 bg-[var(--success)]/5 px-4 py-3 text-sm text-[var(--success)]">
              <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span className="font-medium">{savedNote}</span>
            </div>
          )}

          <div key={step} className="animate-in fade-in slide-in-from-right-2 duration-300">
            {step === 0 && <BasicsStep form={form} set={set} />}
            {step === 1 && <PersonalStep form={form} set={set} />}
            {step === 2 && <EmergencyStep form={form} set={set} />}
            {step === 3 && (
              <DocumentsStep
                docs={docs}
                uploadingDoc={uploadingDoc}
                onSelect={uploadDoc}
                isSalesRep={isSalesRep}
                bio={form.bio}
                onBioChange={(v) => set('bio', v)}
              />
            )}
            {step === 4 && (
              <div className="flex flex-col gap-5">
                <ReviewStep form={form} docs={docs} onEdit={jumpTo} isSalesRep={isSalesRep} />
                <p className="text-center text-xs text-muted-foreground">
                  By submitting, you confirm this information is accurate.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer nav */}
        <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-1">
            {step > 0 ? (
              <button type="button" onClick={handleBack} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back
              </button>
            ) : (
              <span className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
                <Lock className="size-3.5" aria-hidden="true" />
                Secure &amp; encrypted
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={handleSaveDraft} disabled={saving || submitting} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-60">
              {saving && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
              {saving ? 'Saving…' : 'Save for later'}
            </button>

            {isLast ? (
              <button type="button" onClick={handleSubmit} disabled={saving || submitting} className="inline-flex min-w-[120px] items-center justify-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-70">
                {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
            ) : (
              <button type="button" onClick={handleNext} disabled={saving || submitting} className="inline-flex min-w-[120px] items-center justify-center gap-1.5 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-70">
                {saving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {saving ? 'Saving…' : 'Continue'}
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5 text-[var(--success)]" aria-hidden="true" />
        Pacific Coast Title protects your data with bank-grade encryption.
      </p>
    </div>
  )
}

/* ── Step bodies (V0 markup, existing keys) ──────────────────────── */

type StepProps = { form: HrOnboardingFormData; set: <K extends FieldKey>(k: K, v: string) => void }

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={CONTROL} {...props} />
}

function SelectInput({
  placeholder, children, ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { placeholder?: string }) {
  return (
    <div className="relative">
      <select
        className={`${CONTROL} appearance-none pr-10 ${props.value ? '' : 'text-muted-foreground/70'}`}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
    </div>
  )
}

function BasicsStep({ form, set }: StepProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <FieldShell label="First Name" required>
        <TextInput value={form.first_name} onChange={(e) => set('first_name', e.target.value)} autoComplete="given-name" placeholder="Jane" />
      </FieldShell>
      <FieldShell label="Last Name" required>
        <TextInput value={form.last_name} onChange={(e) => set('last_name', e.target.value)} autoComplete="family-name" placeholder="Doe" />
      </FieldShell>
      <div className="sm:col-span-2">
        <FieldShell label="Full Legal Name" helper="If different from above">
          <TextInput value={form.full_legal_name} onChange={(e) => set('full_legal_name', e.target.value)} placeholder="Jane Elizabeth Doe" />
        </FieldShell>
      </div>
      <div className="sm:col-span-2">
        <FieldShell label="Preferred Name">
          <TextInput value={form.preferred_name} onChange={(e) => set('preferred_name', e.target.value)} placeholder="Jane" />
        </FieldShell>
      </div>
    </div>
  )
}

function PersonalStep({ form, set }: StepProps) {
  // Render a fallback option if a legacy home_state value isn't a known
  // 2-letter code (e.g. a stored full name) so it doesn't silently blank.
  const stateKnown = US_STATES.some((s) => s.value === form.home_state)
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <FieldShell label="Personal Email" required>
        <TextInput type="email" value={form.personal_email} onChange={(e) => set('personal_email', e.target.value)} autoComplete="email" placeholder="jane@example.com" />
      </FieldShell>
      <FieldShell label="Mobile Phone" required>
        <PhoneInput className={CONTROL} value={form.mobile} onChange={(v) => set('mobile', v)} placeholder="(555) 123-4567" />
      </FieldShell>
      <FieldShell label="Date of Birth">
        <TextInput type="date" value={form.birthday} onChange={(e) => set('birthday', e.target.value)} />
      </FieldShell>
      <FieldShell label="Start Date">
        <TextInput type="date" value={form.start_date} onChange={(e) => set('start_date', e.target.value)} />
      </FieldShell>
      <div className="sm:col-span-2">
        <FieldShell label="Home Address">
          <TextInput value={form.home_address_line1} onChange={(e) => set('home_address_line1', e.target.value)} autoComplete="address-line1" placeholder="123 Harbor Blvd" />
        </FieldShell>
      </div>
      <div className="sm:col-span-2">
        <FieldShell label="Address Line 2" helper="Apt, suite, etc.">
          <TextInput value={form.home_address_line2} onChange={(e) => set('home_address_line2', e.target.value)} autoComplete="address-line2" placeholder="Suite 200" />
        </FieldShell>
      </div>
      <FieldShell label="City">
        <TextInput value={form.home_city} onChange={(e) => set('home_city', e.target.value)} autoComplete="address-level2" placeholder="Santa Ana" />
      </FieldShell>
      <div className="grid grid-cols-2 gap-4">
        <FieldShell label="State">
          <SelectInput placeholder="Select" value={form.home_state} onChange={(e) => set('home_state', e.target.value)}>
            {!stateKnown && form.home_state && <option value={form.home_state}>{form.home_state}</option>}
            {US_STATES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </SelectInput>
        </FieldShell>
        <FieldShell label="ZIP">
          <TextInput inputMode="numeric" value={form.home_zip} onChange={(e) => set('home_zip', e.target.value)} autoComplete="postal-code" placeholder="92701" />
        </FieldShell>
      </div>
      <div className="sm:col-span-2">
        <FieldShell label="PCT Swag T-Shirt Size" helper="For your Pacific Coast Title swag">
          <SelectInput placeholder="Select a size" value={form.t_shirt_size} onChange={(e) => set('t_shirt_size', e.target.value)}>
            {SHIRT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </SelectInput>
        </FieldShell>
      </div>
    </div>
  )
}

function EmergencyStep({ form, set }: StepProps) {
  return (
    <div className="grid gap-5">
      <FieldShell label="Contact Name">
        <TextInput value={form.emergency_contact_name} onChange={(e) => set('emergency_contact_name', e.target.value)} placeholder="John Doe" />
      </FieldShell>
      <FieldShell label="Contact Phone">
        <PhoneInput className={CONTROL} value={form.emergency_contact_phone} onChange={(v) => set('emergency_contact_phone', v)} placeholder="(555) 987-6543" />
      </FieldShell>
      <FieldShell label="Relationship">
        <TextInput value={form.emergency_contact_relationship} onChange={(e) => set('emergency_contact_relationship', e.target.value)} placeholder="Spouse" />
      </FieldShell>
    </div>
  )
}

function DocumentsStep({
  docs, uploadingDoc, onSelect, isSalesRep, bio, onBioChange,
}: {
  docs: Record<string, string>
  uploadingDoc: string | null
  onSelect: (docType: string, file: File) => void
  isSalesRep: boolean
  bio: string
  onBioChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Standard document uploads (government ID, tax form, direct deposit)
          are no longer collected via onboarding — HR handles those
          separately. Regular employees therefore have no uploads here and
          see a friendly note; sales reps still upload their materials. */}
      {!isSalesRep && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-input bg-muted/30 px-4 py-8 text-center">
          <ShieldCheck className="size-6 text-[var(--success)]" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-foreground">No documents needed</h3>
          <p className="max-w-[380px] text-xs text-muted-foreground">
            There&rsquo;s nothing to upload here — just continue to review and submit.
            HR will reach out directly if any paperwork is required.
          </p>
        </div>
      )}

      {/* Sales-rep-only extras: headshot, bio, client list. Regular
          employees never see these (type-gated). Collect + store only. */}
      {isSalesRep && (
        <div className="flex flex-col gap-4 rounded-xl border border-dashed border-input bg-muted/30 p-4">
          <h3 className="text-sm font-semibold text-foreground">Sales rep materials</h3>
          <UploadTile
            label="Headshot"
            accept={HEADSHOT_ACCEPT}
            hint="PNG · JPG · WEBP"
            fileName={docs['headshot']}
            uploading={uploadingDoc === 'headshot'}
            disabled={!!uploadingDoc && uploadingDoc !== 'headshot'}
            onSelect={(file) => onSelect('headshot', file)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => onBioChange(e.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="A short professional bio for your marketing profile…"
              className="w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground/70 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/25"
            />
            <p className="text-xs text-muted-foreground">{bio.length}/2000</p>
          </div>
          <UploadTile
            label="Contact / client list"
            accept={CLIENT_LIST_ACCEPT}
            hint="CSV · XLSX · XLS · PDF"
            fileName={docs['client_list']}
            uploading={uploadingDoc === 'client_list'}
            disabled={!!uploadingDoc && uploadingDoc !== 'client_list'}
            onSelect={(file) => onSelect('client_list', file)}
          />
        </div>
      )}

      {isSalesRep && (
        <>
          <p className="flex items-center justify-center gap-2 rounded-lg bg-secondary/60 px-4 py-3 text-center text-xs font-medium text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
            Your documents are encrypted and only visible to HR.
          </p>
          <p className="text-center text-xs text-muted-foreground">
            You can submit even if you upload some documents later — HR will follow up if anything is missing.
          </p>
        </>
      )}
    </div>
  )
}

function UploadTile({
  label, accept, hint, fileName, uploading, disabled, onSelect,
}: {
  label: string
  accept: string
  hint: string
  fileName?: string
  uploading: boolean
  disabled: boolean
  onSelect: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  function pick() { if (!disabled && !uploading) inputRef.current?.click() }
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-4 transition-colors">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{hint}</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        aria-label={`Upload ${label}`}
        disabled={uploading || disabled}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onSelect(f); e.target.value = '' }}
      />
      {uploading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-input bg-muted/40 px-4 py-7">
          <Loader2 className="size-6 animate-spin text-accent" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">Uploading…</p>
        </div>
      ) : fileName ? (
        <div className="flex flex-1 items-center gap-3 rounded-lg border border-[var(--success)]/40 bg-[var(--success)]/5 px-3.5 py-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--success)]/15 text-[var(--success)]">
            <CheckCircle2 className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-sm font-medium text-foreground">
              <FileText className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="truncate">{fileName}</span>
            </p>
            <p className="text-xs text-[var(--success)]">Uploaded successfully</p>
          </div>
          <button type="button" onClick={pick} disabled={disabled} className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50">
            <RefreshCw className="size-3" aria-hidden="true" />
            Replace
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          disabled={disabled}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f && !disabled) onSelect(f) }}
          className="group flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-muted/40 px-4 py-7 text-center transition-colors hover:border-accent hover:bg-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-accent/15 group-hover:text-accent">
            <UploadCloud className="size-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-foreground">
            Drag &amp; drop or <span className="text-accent">browse</span>
          </span>
          <span className="text-xs text-muted-foreground">Max 20MB</span>
        </button>
      )}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-1.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value || '—'}</dd>
    </div>
  )
}

function SummarySection({
  title, step, onEdit, children,
}: {
  title: string
  step: number
  onEdit: (s: number) => void
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button type="button" onClick={() => onEdit(step)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
          <Pencil className="size-3" aria-hidden="true" />
          Edit
        </button>
      </div>
      <dl className="grid gap-x-6 sm:grid-cols-2">{children}</dl>
    </section>
  )
}

// Sales-rep upload doc types shown in the wizard (bio is a text field, not
// an upload — summarized separately). Standard docs were removed, so a
// regular employee has no documents here.
const SALES_REP_DOC_TYPES: { key: string; label: string }[] = [
  { key: 'headshot', label: 'Headshot' },
  { key: 'client_list', label: 'Contact / client list' },
]

function ReviewStep({
  form, docs, onEdit, isSalesRep,
}: {
  form: HrOnboardingFormData
  docs: Record<string, string>
  onEdit: (s: number) => void
  isSalesRep: boolean
}) {
  const salesRepUploaded = SALES_REP_DOC_TYPES.filter((d) => docs[d.key]).length
  const hasBio = !!form.bio?.trim()
  return (
    <div className="flex flex-col gap-4">
      <SummarySection title="Basics" step={0} onEdit={onEdit}>
        <SummaryRow label="First Name" value={form.first_name} />
        <SummaryRow label="Last Name" value={form.last_name} />
        <SummaryRow label="Full Legal Name" value={form.full_legal_name} />
        <SummaryRow label="Preferred Name" value={form.preferred_name} />
      </SummarySection>
      <SummarySection title="Personal" step={1} onEdit={onEdit}>
        <SummaryRow label="Personal Email" value={form.personal_email} />
        <SummaryRow label="Mobile Phone" value={form.mobile} />
        <SummaryRow label="Date of Birth" value={form.birthday} />
        <SummaryRow label="Start Date" value={form.start_date} />
        <SummaryRow label="Address" value={[form.home_address_line1, form.home_address_line2].filter(Boolean).join(', ')} />
        <SummaryRow label="City / State / ZIP" value={[form.home_city, form.home_state, form.home_zip].filter(Boolean).join(', ')} />
        <SummaryRow label="PCT Swag T-Shirt Size" value={form.t_shirt_size} />
      </SummarySection>
      <SummarySection title="Emergency Contact" step={2} onEdit={onEdit}>
        <SummaryRow label="Contact Name" value={form.emergency_contact_name} />
        <SummaryRow label="Contact Phone" value={form.emergency_contact_phone} />
        <SummaryRow label="Relationship" value={form.emergency_contact_relationship} />
      </SummarySection>
      <SummarySection title="Documents" step={3} onEdit={onEdit}>
        {isSalesRep ? (
          <>
            <SummaryRow
              label="Uploaded"
              value={`${salesRepUploaded} of ${SALES_REP_DOC_TYPES.length} documents`}
            />
            <SummaryRow label="Bio" value={hasBio ? 'Provided' : 'Not provided'} />
          </>
        ) : (
          <SummaryRow label="Documents" value="No documents needed" />
        )}
      </SummarySection>
    </div>
  )
}
