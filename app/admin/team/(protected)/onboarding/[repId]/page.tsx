/**
 * /admin/team/onboarding/[repId] — Per-rep onboarding checklist.
 *
 * Server component. Loads the rep's onboarding record + items and the
 * employee name, then hands off to the interactive checklist client.
 * Auth enforced by the (protected) route segment.
 */
import { notFound } from 'next/navigation'
import { getOnboarding, getEmployeeAdminById } from '@/lib/admin-db'
import { OnboardingChecklist } from '@/components/admin/onboarding/OnboardingChecklist'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ repId: string }> }) {
  const { repId } = await params
  const emp = await getEmployeeAdminById(Number(repId))
  return { title: emp ? `${emp.name} — Onboarding | PCT Team Admin` : 'Onboarding | PCT Team Admin' }
}

export default async function RepOnboardingPage({ params }: { params: Promise<{ repId: string }> }) {
  const { repId } = await params
  const repIdNum = Number(repId)
  if (!Number.isInteger(repIdNum) || repIdNum <= 0) notFound()

  const [data, emp] = await Promise.all([
    getOnboarding(repIdNum),
    getEmployeeAdminById(repIdNum),
  ])

  if (!data) notFound()

  return (
    <OnboardingChecklist
      repId={repIdNum}
      repName={emp?.name ?? data.onboarding.rep_slug ?? `Rep #${repIdNum}`}
      initial={data}
    />
  )
}
