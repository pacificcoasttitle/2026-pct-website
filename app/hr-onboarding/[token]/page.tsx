/**
 * /hr-onboarding/[token] — Public, token-gated HR onboarding page (4c).
 *
 * ⚠️ PUBLIC, UNAUTHENTICATED. Lives OUTSIDE /admin so the admin
 * middleware never gates it — access is controlled SOLELY by the signed
 * token via 4a's resolveHrOnboardingByToken.
 *
 * Modeled on the rep public route (app/onboarding/[token]/page.tsx):
 *   - force-dynamic + noindex + no-referrer (token is in the URL).
 *   - resolveHrOnboardingByToken is the SOLE gate; null → a GENERIC
 *     invalid-link page (never leaks WHY: expired vs forged vs not-found).
 *   - Identity comes ONLY from the resolved record — never from the URL,
 *     query, or any client input.
 *   - A submitted/finalized record is shown read-only (not re-openable).
 *   - On first open, draft/invited flips to 'in_progress'.
 *
 * STAGE-AND-FINALIZE: the form writes only hr_onboarding.payload via the
 * profile API. Nothing here writes hr_employees. Documents = 4d.
 */
import type { Metadata } from 'next'
import {
  resolveHrOnboardingByToken,
  markHrOnboardingInProgress,
  getHrEmployeeById,
} from '@/lib/admin-db'
import HrOnboardingForm from '@/components/hr-onboarding/HrOnboardingForm'

export const dynamic = 'force-dynamic'

// noindex (a tokenized page must never be crawled/cached) + no-referrer
// (the token is in the URL — don't leak it via Referer to any asset).
export const metadata: Metadata = {
  title: 'Your Onboarding | Pacific Coast Title',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

// PageShell renders the V0 wizard's beige palette via the `.pct-wizard`
// scope (see globals.css) and forces light mode for every visitor — the
// app's global theme tokens are untouched.
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="pct-wizard min-h-screen bg-background font-sans">
      <header className="bg-primary px-6 py-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://www.pct.com/logo2-dark.png" alt="Pacific Coast Title Company" width={150} className="block border-0" />
      </header>
      <main className="mx-auto flex max-w-3xl flex-col items-center px-5 py-10">
        {children}
      </main>
    </div>
  )
}

function InvalidLink() {
  return (
    <PageShell>
      <div className="w-full max-w-[480px] rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-balance text-xl font-semibold text-foreground">
          This link has expired or is invalid
        </h1>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
          The onboarding link you used is no longer valid. This can happen if the link
          expired or a newer link was sent.
        </p>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
          Please contact HR to request a fresh onboarding link.
        </p>
      </div>
    </PageShell>
  )
}

function AlreadySubmitted({ first }: { first: string }) {
  return (
    <PageShell>
      <div className="w-full max-w-[480px] rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Thank you{first ? `, ${first}` : ''}
        </p>
        <h1 className="mt-1 text-balance text-xl font-semibold text-foreground">
          Your onboarding is submitted
        </h1>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
          We&apos;ve received your information and HR is reviewing it. There&apos;s nothing
          more you need to do right now. If anything else is needed, HR will reach out.
        </p>
      </div>
    </PageShell>
  )
}

export default async function HrOnboardingTokenPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  // SOLE gate. Never throws; null = invalid/expired/wrong-purpose/hash-mismatch.
  const record = await resolveHrOnboardingByToken(token)
  if (!record) return <InvalidLink />

  // Identity + seed data come ONLY from the resolved record's payload
  // (and, for existing employees, the server-side HR seed computed below).
  const payload = (record.payload ?? {}) as Record<string, unknown>
  const payloadFirstName = String(payload.first_name ?? '').trim()

  // Submitted/finalized/cancelled → read-only confirmation (not re-openable).
  if (['submitted', 'finalized', 'cancelled'].includes(record.status)) {
    return <AlreadySubmitted first={payloadFirstName} />
  }

  // First open: draft/invited → in_progress (stamp). Scoped to the
  // token-resolved id only.
  await markHrOnboardingInProgress(record.id)

  // ── Prefill seed (existing-employee "confirm your info") ──────────
  // For an EXISTING-employee onboarding (hr_employee_id set), seed a
  // NARROW set of personal confirm-these fields from the HR row. The HR
  // row is loaded SERVER-SIDE here (preferred over widening the token
  // resolver) so the full hr_employees row never reaches the client —
  // only the few seed values below flow into the form's initial values.
  //
  // ⚠️ PII-narrow: ONLY name / full legal name / mobile / birthday /
  // start_date are seeded. Title, department, office, office_phone,
  // photo_url, employment_status, FKs, audit + dedup fields are NEVER
  // seeded/exposed. The work email is NOT mapped to personal_email.
  //
  // ⚠️ DISPLAY-ONLY: this writes NOTHING. A saved draft (payload) OVERLAYS
  // the HR seed below (draft wins), preserving stage-and-finalize.
  const hrSeed: Record<string, string> = {}
  // The proposed PCT email (hr_employees.email) is shown READ-ONLY in the
  // wizard so the new hire sees what their PCT address will be. It is
  // DISTINCT from personal_email (below) and never seeded as an editable
  // value.
  let proposedPctEmail = ''
  if (record.hr_employee_id != null) {
    const emp = await getHrEmployeeById(record.hr_employee_id)
    if (emp) {
      proposedPctEmail = (emp.email ?? '').trim()
      const seed = (v: string | null | undefined) => (v == null ? '' : String(v).trim())
      // DATE columns may arrive as a Date object OR an ISO string depending
      // on the driver; normalize to YYYY-MM-DD (what the form date input
      // wants). Guard against a Date's locale toString leaking through.
      const seedDate = (v: unknown): string => {
        if (!v) return ''
        if (v instanceof Date) {
          return Number.isNaN(v.getTime()) ? '' : v.toISOString().slice(0, 10)
        }
        const s = String(v).trim()
        const m = s.match(/^\d{4}-\d{2}-\d{2}/)
        return m ? m[0] : ''
      }
      hrSeed.first_name      = seed(emp.first_name)
      hrSeed.last_name       = seed(emp.last_name)
      hrSeed.full_legal_name = seed(emp.full_legal_name)
      hrSeed.mobile          = seed(emp.mobile)
      hrSeed.birthday        = seedDate(emp.birthday)
      hrSeed.start_date      = seedDate(emp.start_date)
    }
  }

  // Payload (saved draft) OVERLAYS the HR seed → a previously saved value
  // always wins over the HR seed; HR seed only fills gaps.
  const val = (k: string) => {
    const fromPayload = payload[k]
    const p = fromPayload == null ? '' : String(fromPayload)
    if (p.trim() !== '') return p
    return hrSeed[k] ?? ''
  }
  // #1: personal_email defaults to the invite recipient (invited_email —
  // most likely their personal address), but ONLY when the user hasn't
  // already entered/saved one (payload wins; don't clobber). Editable
  // default, not locked.
  const personalEmailInitial = (() => {
    const saved = val('personal_email')
    if (saved.trim() !== '') return saved
    return (record.invited_email ?? '').trim()
  })()
  const initial = {
    first_name:                     val('first_name'),
    last_name:                      val('last_name'),
    full_legal_name:                val('full_legal_name'),
    preferred_name:                 val('preferred_name'),
    personal_email:                 personalEmailInitial,
    mobile:                         val('mobile'),
    birthday:                       val('birthday'),
    start_date:                     val('start_date'),
    emergency_contact_name:         val('emergency_contact_name'),
    emergency_contact_phone:        val('emergency_contact_phone'),
    emergency_contact_relationship: val('emergency_contact_relationship'),
    home_address_line1:             val('home_address_line1'),
    home_address_line2:             val('home_address_line2'),
    home_city:                      val('home_city'),
    home_state:                     val('home_state'),
    home_zip:                       val('home_zip'),
    t_shirt_size:                   val('t_shirt_size'),
    bio:                            val('bio'),
  }

  // Onboarding type drives the sales-rep-only document collection in the
  // wizard. It's on the resolved record (stamped from the employee). Any
  // non-'employee' value falls back to 'sales_rep'.
  const onboardingType: 'sales_rep' | 'employee' =
    record.onboarding_type === 'employee' ? 'employee' : 'sales_rep'

  // Heading greeting uses the resolved first name (draft or HR seed).
  const firstName = initial.first_name.trim()
  const isExisting = record.hr_employee_id != null

  return (
    <PageShell>
      <div className="mb-6 w-full max-w-[660px] text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          {isExisting ? 'Pacific Coast Title' : 'Welcome to Pacific Coast Title'}
        </p>
        <h1 className="mt-1 text-balance text-2xl font-semibold text-foreground">
          {isExisting
            ? (firstName ? `Hi ${firstName}, please confirm your information` : 'Please confirm your information')
            : (firstName ? `Hi ${firstName}, let’s get you set up` : 'Let’s get you set up')}
        </h1>
        <p className="mx-auto mt-2 max-w-[560px] text-pretty text-sm leading-relaxed text-muted-foreground">
          {isExisting
            ? 'We’re updating our records. Please review the details below, make any corrections, and submit. Your changes are reviewed by HR before anything is finalized.'
            : 'Please confirm your details below. Your information is reviewed by HR before anything is finalized — you can save as you go and submit when you’re done.'}
        </p>
      </div>

      <HrOnboardingForm token={token} initial={initial} mode={isExisting ? 'existing' : 'new'} onboardingType={onboardingType} proposedPctEmail={proposedPctEmail} />

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Questions? Contact Pacific Coast Title HR at{' '}
        <a href="mailto:hr@pct.com" className="font-medium text-accent hover:underline">hr@pct.com</a>.
      </p>
    </PageShell>
  )
}
