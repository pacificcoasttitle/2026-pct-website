/**
 * Role gate for the employees segment (list, new, [slug]).
 * requirePageRole redirects a user lacking the 'employees' capability
 * before any child page (or its data fetches) renders. Auth (session)
 * is already handled by the parent (protected) layout.
 */
import { requirePageRole } from '@/lib/auth/guards'

export default async function EmployeesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requirePageRole('employees')
  return <>{children}</>
}
