/**
 * /admin/team — Team admin shell with sidebar.
 * Middleware guarantees only authenticated users reach this layout.
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyAdminToken, ADMIN_COOKIE } from '@/lib/admin-auth'
import AdminSidebar from '@/components/admin/AdminSidebar'
import './workspace.css'

export const metadata = { title: 'PCT Team Admin' }

export default async function TeamAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jar     = await cookies()
  const token   = jar.get(ADMIN_COOKIE)?.value
  const session = token ? await verifyAdminToken(token) : null

  if (!session) redirect('/admin/login')

  return (
    <div className="pct-workspace min-h-screen flex">
      <AdminSidebar username={session.username} role={session.role} />

      {/* Main content — full width for command-center UIs */}
      <main className="flex-1 min-w-0 flex flex-col overflow-x-hidden">
        <div className="pct-workspace-content flex-1 px-4 pb-6 pt-20 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
