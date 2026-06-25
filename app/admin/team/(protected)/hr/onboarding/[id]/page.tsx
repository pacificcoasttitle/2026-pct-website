/**
 * /admin/team/hr/onboarding/[id] — HR review of one onboarding (4e).
 *
 * Server component, gated 'hr-tools' (explicit + inherited from the hr/
 * segment layout). Shows the submitted staged payload + the uploaded
 * documents (metadata via 4d; each viewable through the 4d AUTHENTICATED
 * retrieval route — never a public URL). HR can request changes
 * (→ in_progress) or approve & finalize (→ commits to hr_employees).
 *
 * ⚠️ Only a 'submitted' onboarding is finalizable — the client guards
 * the action, and the finalize API re-guards server-side.
 */
import { notFound } from 'next/navigation'
import { requirePageRole } from '@/lib/auth/guards'
import {
  getHrOnboardingById,
  getHrOnboardingDocuments,
  getHrOnboardingItems,
  seedHrOnboardingItems,
} from '@/lib/admin-db'
import HrOnboardingReviewClient from '@/components/admin/HrOnboardingReviewClient'
import HrOnboardingChecklist from '@/components/admin/HrOnboardingChecklist'

export const metadata = { title: 'Review Onboarding | PCT Team Admin' }
export const dynamic = 'force-dynamic'

export default async function HrOnboardingReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requirePageRole('hr-tools')

  const { id: idRaw } = await params
  const id = parseInt(idRaw, 10)
  if (!Number.isFinite(id) || id <= 0) notFound()

  const onboarding = await getHrOnboardingById(id)
  if (!onboarding) notFound()

  const documents = await getHrOnboardingDocuments(id)

  // Seed-on-first-view backfill (idempotent): existing in-flight rows
  // created before the checklist shipped get their items here. New rows
  // are already seeded at create — this is a no-op for them.
  await seedHrOnboardingItems(onboarding.id, (onboarding as { onboarding_type?: string }).onboarding_type)
  const items = await getHrOnboardingItems(id)

  return (
    <>
      <HrOnboardingReviewClient
        id={onboarding.id}
        status={onboarding.status}
        invitedEmail={onboarding.invited_email}
        hrEmployeeId={onboarding.hr_employee_id}
        payload={onboarding.payload as Record<string, unknown>}
        invitedAt={onboarding.invited_at}
        submittedAt={onboarding.submitted_at}
        finalizedAt={onboarding.finalized_at}
        createdAt={onboarding.created_at}
        tokenExpiresAt={onboarding.token_expires_at}
        documents={documents.map((d) => ({
          id: d.id,
          doc_type: d.doc_type,
          file_name: d.file_name,
          uploaded_at: d.uploaded_at,
        }))}
      />
      <HrOnboardingChecklist
        onboardingId={onboarding.id}
        items={items.map((it) => ({
          id: it.id,
          item_key: it.item_key,
          label: it.label,
          category: it.category,
          status: it.status,
          completed_at: it.completed_at,
          completed_by: it.completed_by,
        }))}
      />
    </>
  )
}
