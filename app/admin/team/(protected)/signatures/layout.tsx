/**
 * Role gate for the signatures segment (list, import, [staffId],
 * [staffId]/edit, preview-template).
 * requirePageRole redirects a user lacking the 'signatures' capability
 * before any child page renders. Auth is handled by the parent
 * (protected) layout.
 */
import { requirePageRole } from '@/lib/auth/guards'

export default async function SignaturesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requirePageRole('signatures')
  return <>{children}</>
}
