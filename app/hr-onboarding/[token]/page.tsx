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

const NAVY = '#03374f'
const ORANGE = '#f26b2b'
const WARM = '#f0ede9'

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: WARM, fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <div style={{ backgroundColor: NAVY, padding: '20px 24px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://www.pct.com/logo2.png" alt="Pacific Coast Title Company" width={150} style={{ display: 'block', border: 0 }} />
      </div>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px' }}>
        {children}
      </div>
    </div>
  )
}

function InvalidLink() {
  return (
    <PageShell>
      <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '40px 32px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h1 style={{ color: NAVY, fontSize: 24, margin: '0 0 12px 0' }}>This link has expired or is invalid</h1>
        <p style={{ color: '#4b5563', fontSize: 15, lineHeight: 1.6, margin: '0 0 8px 0' }}>
          The onboarding link you used is no longer valid. This can happen if the link
          expired or a newer link was sent.
        </p>
        <p style={{ color: '#4b5563', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
          Please contact HR to request a fresh onboarding link.
        </p>
      </div>
    </PageShell>
  )
}

function AlreadySubmitted({ first }: { first: string }) {
  return (
    <PageShell>
      <div style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '40px 32px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <p style={{ margin: '0 0 4px 0', fontSize: 13, fontWeight: 700, color: ORANGE, textTransform: 'uppercase', letterSpacing: 1 }}>
          Thank you{first ? `, ${first}` : ''}
        </p>
        <h1 style={{ color: NAVY, fontSize: 24, margin: '0 0 12px 0' }}>Your onboarding is submitted</h1>
        <p style={{ color: '#4b5563', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
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
  if (record.hr_employee_id != null) {
    const emp = await getHrEmployeeById(record.hr_employee_id)
    if (emp) {
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
  const initial = {
    first_name:                     val('first_name'),
    last_name:                      val('last_name'),
    full_legal_name:                val('full_legal_name'),
    preferred_name:                 val('preferred_name'),
    personal_email:                 val('personal_email'),
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
  }

  // Heading greeting uses the resolved first name (draft or HR seed).
  const firstName = initial.first_name.trim()
  const isExisting = record.hr_employee_id != null

  return (
    <PageShell>
      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '28px 28px', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <p style={{ margin: '0 0 4px 0', fontSize: 13, fontWeight: 700, color: ORANGE, textTransform: 'uppercase', letterSpacing: 1 }}>
          {isExisting ? 'Pacific Coast Title' : 'Welcome to Pacific Coast Title'}
        </p>
        <h1 style={{ margin: '0 0 10px 0', fontSize: 26, color: NAVY }}>
          {isExisting
            ? (firstName ? `Hi ${firstName}, please confirm your information` : 'Please confirm your information')
            : (firstName ? `Hi ${firstName}, let’s get you set up` : 'Let’s get you set up')}
        </h1>
        <p style={{ margin: 0, fontSize: 15, color: '#4b5563', lineHeight: 1.6 }}>
          {isExisting
            ? 'We’re updating our records. Please review the details below, make any corrections, and submit. Your changes are reviewed by HR before anything is finalized.'
            : 'Please confirm your details below. Your information is reviewed by HR before anything is finalized — you can save as you go and submit when you’re done.'}
        </p>
      </div>

      <HrOnboardingForm token={token} initial={initial} />

      <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', margin: '24px 0 8px 0' }}>
        Questions? Contact Pacific Coast Title HR.
      </p>
    </PageShell>
  )
}
