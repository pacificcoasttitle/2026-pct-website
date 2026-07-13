/**
 * /admin/team/hr/accomplishments-digest — quarterly accomplishments digest.
 *
 * ⚠️ Gated by explicit role === 'hr' || 'top_level' (canViewAllNotes).
 * NOT requirePageRole('hr-tools') — manager='all' would pass that.
 * The parent hr/ layout still requires hr-tools to reach this URL;
 * this page adds the narrower digest gate on top.
 */
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getAdminSession, getDeniedRedirectForRole } from '@/lib/auth/guards'
import { canViewAllNotes } from '@/lib/hr-employee-notes'
import {
  getLastCompletedQuarter,
  listRecentQuarterPresets,
} from '@/lib/hr-accomplishments-digest'
import HrAccomplishmentsDigestClient from '@/components/admin/HrAccomplishmentsDigestClient'

export const metadata = { title: 'Accomplishments Digest | PCT Team Admin' }
export const dynamic = 'force-dynamic'

export default async function AccomplishmentsDigestPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')
  if (!canViewAllNotes(session)) redirect(getDeniedRedirectForRole(session))

  const defaultQuarter = getLastCompletedQuarter()
  const quarters = listRecentQuarterPresets(8)

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-2 lg:pt-0">
      <div>
        <Link
          href="/admin/team/hr/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#f26b2b] transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> HR Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-[#03374f]">Accomplishments Digest</h1>
        <p className="text-gray-500 text-sm mt-1">
          Quarterly summary of logged accomplishment notes for leadership review.
        </p>
      </div>

      <HrAccomplishmentsDigestClient
        quarters={quarters}
        defaultQuarter={defaultQuarter}
      />
    </div>
  )
}
