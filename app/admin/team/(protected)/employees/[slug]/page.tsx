/**
 * /admin/team/employees/[slug] — Edit employee profile
 */
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getEmployeeAdminBySlug, getOfficesAndDepts, getOnboarding, ONBOARDING_ITEM_COUNT } from '@/lib/admin-db'
import { resolvePhotoUrl } from '@/types/employee'
import EmployeeEditForm from '@/components/admin/EmployeeEditForm'
import { OnboardingRepAction } from '@/components/admin/onboarding/OnboardingRepAction'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const emp = await getEmployeeAdminBySlug(slug)
  return { title: emp ? `Edit ${emp.name} | PCT Team Admin` : 'Not Found | PCT Team Admin' }
}

export default async function EditEmployeePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug }                   = await params
  const [emp, { offices, depts }]  = await Promise.all([
    getEmployeeAdminBySlug(slug),
    getOfficesAndDepts(),
  ])

  if (!emp) notFound()

  const photo = resolvePhotoUrl({ first_name: emp.first_name, photo_url: emp.photo_url })

  // Best-effort: surface whether onboarding has been started for this rep
  // so the action shows "Start" vs "View" + progress. A failure here must
  // not break the edit page.
  let hasOnboarding = false
  let progressLabel: string | null = null
  try {
    const ob = await getOnboarding(emp.id)
    if (ob) {
      hasOnboarding = true
      const complete = ob.items.filter((i) => i.status === 'complete').length
      progressLabel = `${complete} / ${ONBOARDING_ITEM_COUNT} complete`
    }
  } catch {
    // ignore — onboarding section just shows the default "Start" state
  }

  return (
    <div className="space-y-4">
      <OnboardingRepAction repId={emp.id} hasOnboarding={hasOnboarding} progressLabel={progressLabel} />
      <EmployeeEditForm
        employee={{ ...emp, photo_url: photo }}
        offices={offices}
        depts={depts}
      />
    </div>
  )
}
