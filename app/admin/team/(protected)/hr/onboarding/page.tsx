/**
 * /admin/team/hr/onboarding — HR onboarding (admin/issuing side, 4b)
 *
 * Server component, gated 'hr-tools' (also inherited from the hr/
 * segment layout). Lists existing onboardings + supplies the active
 * roster for the "invite existing employee" picker. Create + send are
 * driven client-side via the 4b APIs. The public receive route
 * (/hr-onboarding/[token]) is 4c — not built here.
 */
import { getAllHrOnboardings, getAllHrEmployees, getHrOnboardingItemProgress, getEmployeesEligibleForBulkInvite } from '@/lib/admin-db'
import { requirePageRole } from '@/lib/auth/guards'
import HrOnboardingClient from '@/components/admin/HrOnboardingClient'

export const metadata = { title: 'HR Onboarding | PCT Team Admin' }
export const dynamic = 'force-dynamic'

export default async function HrOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ employee?: string; status?: string }>
}) {
  await requirePageRole('hr-tools')

  const { employee } = await searchParams
  const [onboardings, roster, bulkEligible] = await Promise.all([
    getAllHrOnboardings(),
    getAllHrEmployees(),
    getEmployeesEligibleForBulkInvite(),
  ])

  const progress = await getHrOnboardingItemProgress(onboardings.map((o) => o.id))

  const list = onboardings.map((o) => ({
    id:               o.id,
    name:             o.employee_name || o.invited_email || '(unnamed)',
    invited_email:    o.invited_email,
    status:           o.status,
    invited_at:       o.invited_at,
    created_at:       o.created_at,
    token_expires_at: o.token_expires_at,
    checklist:        progress[o.id] || null,
  }))

  // Only active employees are sensible invite targets.
  const employees = roster
    .filter((e) => e.active)
    .map((e) => ({
      id: e.id,
      name: `${e.first_name} ${e.last_name}`.trim(),
      email: e.email,
      onboarding_type: e.onboarding_type,
    }))

  const preselectedEmployeeId = Number(employee)
  const initialEmployeeId = Number.isInteger(preselectedEmployeeId) &&
    employees.some((e) => e.id === preselectedEmployeeId)
      ? String(preselectedEmployeeId)
      : ''

  return (
    <HrOnboardingClient
      onboardings={list}
      employees={employees}
      initialEmployeeId={initialEmployeeId}
      bulkEligibleCount={bulkEligible.eligible.length}
    />
  )
}
