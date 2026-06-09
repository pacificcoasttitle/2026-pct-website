/**
 * /onboarding/[token] — Public, token-gated rep onboarding page.
 *
 * READ-ONLY (Phase 2b). Lives OUTSIDE /admin, so the admin middleware
 * (matcher: '/admin/:path*') never gates it — access is controlled
 * SOLELY by the signed token via 2a's resolveOnboardingByToken.
 *
 * The token resolves to exactly one onboarding_id; every query is
 * scoped to THAT id. No rep-supplied id is ever accepted, so a token
 * for one rep can never render another's onboarding. The token is
 * never logged and the gate internals / stored hash are never exposed.
 *
 * Phase 2c (verify-info form), 2d (uploads), and 2e (welcome email)
 * are later sub-phases — nothing here writes, uploads, or emails.
 */
import type { Metadata } from 'next'
import {
  resolveOnboardingByToken,
  getOnboarding,
  getEmployeeAdminById,
  getOnboardingAssetKinds,
  type OnboardingItem,
} from '@/lib/admin-db'
import { OnboardingProfileForm } from './OnboardingProfileForm'
import { OnboardingUploads } from './OnboardingUploads'

export const dynamic = 'force-dynamic'

// noindex (a tokenized page must never be crawled/cached) + no-referrer
// (the token is in the URL — don't leak it via Referer to any asset).
export const metadata: Metadata = {
  title: 'Your Onboarding | Pacific Coast Title',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

const NAVY  = '#03374f'
const ORANGE = '#f26b2b'
const WARM  = '#f0ede9'

// The single checklist item the rep themselves needs to provide; the
// rest are handled by the PCT team. (Read-only framing for 2b.)
const REP_ACTION_KEYS = new Set(['headshot-bio-client-list'])

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
          Please contact your manager to request a fresh onboarding link.
        </p>
      </div>
    </PageShell>
  )
}

const CATEGORY_LABEL: Record<string, string> = {
  'administrative':   'Administrative',
  'marketing':        'Marketing',
  'customer-service': 'Customer Service',
}
const CATEGORY_ORDER = ['administrative', 'marketing', 'customer-service'] as const

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    complete:    { bg: '#d1fae5', fg: '#065f46', label: 'Complete' },
    in_progress: { bg: 'rgba(242,107,43,0.15)', fg: '#c4541d', label: 'In progress' },
    pending:     { bg: '#e5e7eb', fg: '#4b5563', label: 'Pending' },
  }
  const s = map[status] ?? map.pending
  return (
    <span style={{ backgroundColor: s.bg, color: s.fg, fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  )
}

function ChecklistGroup({ category, items }: { category: string; items: OnboardingItem[] }) {
  if (items.length === 0) return null
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ backgroundColor: NAVY, color: '#fff', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, padding: '8px 16px', borderRadius: '12px 12px 0 0' }}>
        {CATEGORY_LABEL[category] ?? category}
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, backgroundColor: '#fff', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>
        {items.map((item) => {
          const repAction = REP_ACTION_KEYS.has(item.item_key)
          return (
            <li
              key={item.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderTop: '1px solid #f3f4f6',
                backgroundColor: repAction ? 'rgba(242,107,43,0.06)' : '#fff',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: NAVY }}>{item.label}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: 12, color: repAction ? ORANGE : '#9ca3af', fontWeight: repAction ? 600 : 400 }}>
                  {repAction ? 'Your action — you’ll provide this' : 'Handled by our team'}
                </p>
              </div>
              <StatusChip status={item.status} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default async function OnboardingTokenPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  // SOLE gate. Never throws; null = invalid/expired/hash-mismatch.
  const record = await resolveOnboardingByToken(token)
  if (!record) return <InvalidLink />

  // Every subsequent read is scoped to the RESOLVED token's ids only —
  // never anything from the request beyond the token itself.
  const [data, rep] = await Promise.all([
    getOnboarding(record.rep_id),
    getEmployeeAdminById(record.rep_id),
  ])

  if (!data) return <InvalidLink />

  const firstName = rep?.first_name?.trim() || 'there'
  const complete  = data.items.filter((i) => i.status === 'complete').length
  const total     = data.items.length

  const grouped = new Map<string, OnboardingItem[]>()
  for (const c of CATEGORY_ORDER) grouped.set(c, [])
  for (const it of [...data.items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))) {
    grouped.get(it.category)?.push(it)
  }

  // Initial presence for the rep's action item (assets + employee state).
  const assetKinds = await getOnboardingAssetKinds(record.id)
  const present = {
    headshot:    assetKinds.includes('headshot') || !!(rep?.photo_url && rep.photo_url.trim()),
    bio:         assetKinds.includes('bio')       || !!(rep?.bio && rep.bio.trim()),
    client_list: assetKinds.includes('client_list'),
  }

  return (
    <PageShell>
      {/* Welcome */}
      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '28px 28px', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <p style={{ margin: '0 0 4px 0', fontSize: 13, fontWeight: 700, color: ORANGE, textTransform: 'uppercase', letterSpacing: 1 }}>
          Welcome to Pacific Coast Title
        </p>
        <h1 style={{ margin: '0 0 10px 0', fontSize: 26, color: NAVY }}>Hi {firstName}, let’s get you set up</h1>
        <p style={{ margin: 0, fontSize: 15, color: '#4b5563', lineHeight: 1.6 }}>
          Here’s where your onboarding stands. Our team is handling most of the setup —
          you’ll see what’s done and what’s in progress below.
        </p>
      </div>

      {/* Verify-info form (2c) — editable allowlist; locked fields read-only.
          The server route re-verifies the token + enforces the allowlist. */}
      <OnboardingProfileForm
        token={token}
        locked={{ name: rep?.name || '', title: rep?.title || '', email: rep?.email || '' }}
        initial={{
          phone:       rep?.phone       || '',
          mobile:      rep?.mobile      || '',
          bio:         rep?.bio         || '',
          specialties: rep?.specialties || '',
          languages:   rep?.languages   || '',
          linkedin:    rep?.linkedin    || '',
          facebook:    rep?.facebook    || '',
          instagram:   rep?.instagram   || '',
          twitter:     rep?.twitter     || '',
          website:     rep?.website     || '',
        }}
        initialVerifiedAt={record.info_verified_at}
      />

      {/* Action items (2d) — headshot / bio / client list uploads. */}
      <OnboardingUploads
        token={token}
        initialPhoto={rep?.photo_url ?? null}
        initialBio={rep?.bio || ''}
        initialPresent={present}
      />

      {/* Progress */}
      <div style={{ backgroundColor: '#fff', borderRadius: 16, padding: '24px 28px', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16, color: NAVY }}>Onboarding progress</h2>
          <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{complete} / {total} complete</span>
        </div>
        <div style={{ height: 8, borderRadius: 999, backgroundColor: '#e5e7eb', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${total > 0 ? Math.round((complete / total) * 100) : 0}%`, backgroundColor: ORANGE }} />
        </div>
      </div>

      {/* Checklist (read-only) */}
      {CATEGORY_ORDER.map((cat) => (
        <ChecklistGroup key={cat} category={cat} items={grouped.get(cat) ?? []} />
      ))}

      <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', margin: '24px 0 8px 0' }}>
        Questions? Reach out to your manager or the Pacific Coast Title marketing team.
      </p>
    </PageShell>
  )
}
