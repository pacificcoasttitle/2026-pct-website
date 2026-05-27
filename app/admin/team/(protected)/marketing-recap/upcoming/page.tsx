import Link from 'next/link'
import { ArrowLeft, CalendarDays } from 'lucide-react'
import { getUpcomingItems } from '@/lib/admin-db'
import { UpcomingManager } from '@/components/admin/marketing-recap/UpcomingManager'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Upcoming Items | Marketing Recap | PCT' }

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

export default async function UpcomingPage() {
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)
  const ninetyDaysAhead = new Date(today)
  ninetyDaysAhead.setDate(today.getDate() + 90)

  const fromDate = toDateInputValue(thirtyDaysAgo)
  const toDate = toDateInputValue(ninetyDaysAhead)

  const items = await getUpcomingItems({
    fromDate,
    toDate,
    activeOnly: false,
  })

  return (
    <div className="space-y-5 pt-2 lg:pt-0 max-w-7xl">
      <header className="space-y-2">
        <Link
          href="/admin/team/marketing-recap"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#f26b2b]"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Marketing Recap
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-[#003d79]">
          <CalendarDays className="w-6 h-6 text-[#f26b2b]" />
          Upcoming Items
        </h1>
        <p className="text-gray-500 text-sm max-w-2xl">
          Manage the schedule of upcoming marketing pieces. These appear in the
          &quot;Coming This Week&quot; section of the Weekly Marketing Recap.
        </p>
      </header>

      <UpcomingManager
        initialItems={items}
        initialFromDate={fromDate}
        initialToDate={toDate}
      />
    </div>
  )
}
