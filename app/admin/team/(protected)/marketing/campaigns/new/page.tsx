/**
 * /admin/team/marketing/campaigns/new — multi-step campaign wizard.
 * Server prep: load reps + their Mailchimp subscriber counts, then hand
 * off to the client wizard. Templates are loaded client-side.
 */
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send } from 'lucide-react'
import { getAllEmployeesAdmin } from '@/lib/admin-db'
import { CampaignWizard, RepLite } from '@/components/admin/marketing/CampaignWizard'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = { title: 'New Campaign | PCT Team Admin' }
export const dynamic  = 'force-dynamic'

async function fetchAudienceMemberCount(audienceId: string): Promise<number> {
  const apiKey = process.env.MAILCHIMP_API_KEY
  const server = process.env.MAILCHIMP_SERVER
  if (!apiKey || !server) return 0
  try {
    const res = await fetch(
      `https://${server}.api.mailchimp.com/3.0/lists/${audienceId}?fields=stats`,
      {
        headers: { Authorization: `Basic ${Buffer.from(`any:${apiKey}`).toString('base64')}` },
        next:    { revalidate: 300 },
      },
    )
    if (!res.ok) return 0
    const data = await res.json()
    return data.stats?.member_count ?? 0
  } catch { return 0 }
}

/** Map an office name to a short region label. Best-effort. */
function regionFromOffice(office: string | null): string | null {
  if (!office) return null
  const o = office.toLowerCase()
  if (o.includes('orange'))   return 'OC'
  if (o.includes('downey'))   return 'Downey'
  if (o.includes('glendale')) return 'GL'
  if (o.includes('ontario') || o.includes('inland')) return 'IE'
  if (o.includes('san diego')) return 'SD'
  // Fallback: first word capitalized.
  return office.split(/[\s,]+/)[0] || null
}

export default async function NewCampaignPage() {
  let employees: Awaited<ReturnType<typeof getAllEmployeesAdmin>> = []
  try { employees = await getAllEmployeesAdmin() } catch { /* db offline */ }

  // Recipient roster = active reps WITH a Mailchimp audience (the sendable
  // list). website_active is a public-vCard visibility flag and is NOT a
  // campaign-eligibility criterion. The has-audience check uses the same
  // truthy semantics as the client layer (null and '' both excluded).
  const showable = employees
    .filter((e) => e.active && !!e.mailchimp_audience_id)
    .sort((a, b) => a.name.localeCompare(b.name))

  const counts = await Promise.all(
    showable.map((e) => e.mailchimp_audience_id
      ? fetchAudienceMemberCount(e.mailchimp_audience_id)
      : Promise.resolve(0)),
  )

  const reps: RepLite[] = showable.map((e, i) => ({
    slug:                  e.slug,
    name:                  e.name,
    email:                 e.email,
    title:                 e.title,
    active:                e.active,
    website_active:        e.website_active,
    mailchimp_audience_id: e.mailchimp_audience_id ?? null,
    subscribers:           counts[i],
    region:                regionFromOffice(e.office_name),
  }))

  const regions = Array.from(new Set(
    reps.filter((r) => r.region && r.mailchimp_audience_id).map((r) => r.region!),
  )).sort()

  const mailchimpServer = process.env.MAILCHIMP_SERVER || 'us17'

  return (
    <div className="space-y-5 pt-2 lg:pt-0">
      <header className="space-y-2">
        <Link href="/admin/team/marketing"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#f26b2b]">
          <ArrowLeft className="w-3 h-3" /> Back to Marketing
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#03374f]">
          <Send className="w-6 h-6 text-[#f26b2b]" />
          Create Campaign
        </h1>
      </header>

      <Suspense fallback={<Skeleton className="h-96 w-full rounded-xl bg-gray-200" />}>
        <CampaignWizard reps={reps} mailchimpServer={mailchimpServer} regions={regions} />
      </Suspense>
    </div>
  )
}
