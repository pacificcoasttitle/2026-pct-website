/**
 * Role gate for the asset-delivery segment (list, new, [batchId]).
 * requirePageRole redirects a user lacking the 'asset-delivery'
 * capability before any child page renders. Auth is handled by the
 * parent (protected) layout.
 */
import { requirePageRole } from '@/lib/auth/guards'

export default async function AssetDeliveryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requirePageRole('asset-delivery')
  return <>{children}</>
}
