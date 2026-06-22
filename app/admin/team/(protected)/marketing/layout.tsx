/**
 * Role gate for the marketing segment (hub, campaigns/new, history,
 * history/[batchId], templates, templates/[id]/edit).
 * requirePageRole redirects a user lacking the 'marketing' capability
 * before any child page renders. Auth is handled by the parent
 * (protected) layout.
 */
import { requirePageRole } from '@/lib/auth/guards'

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requirePageRole('marketing')
  return <>{children}</>
}
