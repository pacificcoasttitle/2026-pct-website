/**
 * Role gate for the marketing-recap segment (recap, [draftId],
 * calendar, recipients, upcoming). Recap is part of the marketing
 * capability, so it gates on 'marketing' (matching the recap APIs).
 * requirePageRole redirects a user lacking it before any child page
 * renders. Auth is handled by the parent (protected) layout.
 */
import { requirePageRole } from '@/lib/auth/guards'

export default async function MarketingRecapLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requirePageRole('marketing')
  return <>{children}</>
}
