/**
 * Role gate for the HR section (roster + future 2c/2d child pages).
 * requirePageRole redirects a user lacking the 'hr-tools' capability
 * before any child page (or its data fetches) renders. Auth (session)
 * is already handled by the parent (protected) layout.
 *
 * 'hr-tools' is HR-allowed (+ top_level/manager via 'all'). Gating at
 * the segment level means 2c/2d slot in under the same gate for free.
 */
import { requirePageRole } from '@/lib/auth/guards'

export default async function HrLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requirePageRole('hr-tools')
  return <>{children}</>
}
