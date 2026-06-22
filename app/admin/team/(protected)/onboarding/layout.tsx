/**
 * Role gate for the onboarding segment (list, [repId]).
 * requirePageRole redirects a user lacking the 'onboarding' capability
 * before any child page renders. Auth is handled by the parent
 * (protected) layout.
 */
import { requirePageRole } from '@/lib/auth/guards'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requirePageRole('onboarding')
  return <>{children}</>
}
