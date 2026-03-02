/**
 * Admin panel shell — sidebar + content area.
 * Middleware guarantees only authenticated users reach this layout.
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { verifyAdminToken, ADMIN_COOKIE } from '@/lib/admin-auth'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = { title: 'PCT Admin' }

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jar     = await cookies()
  const token   = jar.get(ADMIN_COOKIE)?.value
  const session = token ? await verifyAdminToken(token) : null

  if (!session) redirect('/admin/login')

  return (
    <div className="min-h-screen flex bg-[#f0ede9]">
      <AdminSidebar username={session.username} role={session.role} />

      {/* Main content */}
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
