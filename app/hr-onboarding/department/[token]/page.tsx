/**
 * /hr-onboarding/department/[token] — public department task checklist.
 *
 * No-login, token-gated, task-only. The token resolves to exactly one
 * onboarding + checklist category; the page reads only that category's
 * hr_onboarding_items plus a minimal hire display name.
 */
import type { Metadata } from 'next'
import { resolveDepartmentToken } from '@/lib/hr-onboarding-token'
import { getHrDepartmentChecklistView } from '@/lib/admin-db'
import DepartmentChecklistClient from './DepartmentChecklistClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Department Onboarding Checklist | Pacific Coast Title',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
}

const NAVY = '#03374f'

const CATEGORY_LABELS: Record<string, string> = {
  administrative:     'Administrative',
  marketing:          'Marketing',
  'customer-service': 'Customer Service',
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="pct-wizard min-h-screen bg-background font-sans">
      <header className="px-6 py-5" style={{ backgroundColor: NAVY }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://www.pct.com/logo2-dark.png" alt="Pacific Coast Title Company" width={150} className="block border-0" />
      </header>
      <main className="mx-auto flex max-w-3xl flex-col px-5 py-10">
        {children}
      </main>
    </div>
  )
}

function InvalidLink() {
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-[480px] rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-balance text-xl font-semibold text-foreground">
          This link has expired or is invalid
        </h1>
        <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
          Please contact HR if you need a fresh department checklist link.
        </p>
      </div>
    </PageShell>
  )
}

export default async function DepartmentOnboardingPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const resolved = await resolveDepartmentToken(token)
  if (!resolved) return <InvalidLink />

  const view = await getHrDepartmentChecklistView(resolved.onboarding_id, resolved.category)
  if (!view) return <InvalidLink />

  const label = CATEGORY_LABELS[view.category] ?? view.category
  const complete = view.items.filter((item) => item.status === 'complete').length
  const locked = !['submitted', 'finalized'].includes(view.status)

  return (
    <PageShell>
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          {label} Checklist
        </p>
        <h1 className="mt-1 text-balance text-2xl font-semibold text-foreground">
          Onboarding tasks for {view.hire_name}
        </h1>
        <p className="mx-auto mt-2 max-w-[560px] text-pretty text-sm leading-relaxed text-muted-foreground">
          Complete the department tasks below. This page shows only task status for your department.
        </p>
      </div>

      <div className="mb-4 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-foreground">{label}</div>
            <div className="text-xs text-muted-foreground">Task-only department checklist</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: NAVY }}>{complete}/{view.items.length}</div>
            <div className="text-xs text-muted-foreground">complete</div>
          </div>
        </div>
      </div>

      <DepartmentChecklistClient token={token} initialItems={view.items} locked={locked} />
    </PageShell>
  )
}
