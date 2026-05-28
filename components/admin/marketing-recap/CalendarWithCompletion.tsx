'use client'

/**
 * CalendarWithCompletion (Stage I2) — client island that coordinates the
 * completion card with the calendar grid.
 *
 * WHY THIS WRAPPER EXISTS / STATE-LIFTING CHOICE:
 * The calendar page is an async server component (it seeds initial items
 * from the DB). React state can't live there. The completion card and the
 * calendar grid must agree on the current month and the card must
 * re-fetch after every calendar mutation — that's shared client state, so
 * it needs a client owner. This wrapper is that owner.
 *
 * Rather than fully lift the calendar's internal year/month state up (a
 * large rewrite of its month-nav internals), we use the lighter
 * "onStateChange callback" + "state-based edit trigger" pattern:
 *   - CalendarView keeps owning year/month; it reports changes up via
 *     onMonthChange. This wrapper mirrors them and feeds the card.
 *   - CalendarView reports successful mutations via onMutated; this
 *     wrapper bumps refreshSignal, which the card depends on → re-fetch.
 *   - The card's slippage [Open] sets editRequest here; CalendarView
 *     reacts by opening its EXISTING edit Dialog (no duplicate dialog,
 *     no new mutation path), then clears the trigger via
 *     onEditRequestConsumed.
 *
 * The card and grid therefore always agree on the month, and the card
 * always reflects the latest data — without entangling the wrapper in
 * the calendar's mutation internals.
 */

import { useState } from 'react'
import { CalendarView } from '@/components/admin/marketing-recap/CalendarView'
import { CompletionCard } from '@/components/admin/marketing-recap/CompletionCard'
import type { UpcomingItem } from '@/lib/admin-db'

interface Props {
  initialYear:  number
  initialMonth: number
  initialItems: UpcomingItem[]
  initialError?: string
}

export function CalendarWithCompletion({
  initialYear, initialMonth, initialItems, initialError = '',
}: Props) {
  // Mirror of the calendar's current month (kept in sync via onMonthChange).
  const [year, setYear]   = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  // Bumped after every successful calendar mutation → card re-fetches.
  const [refreshSignal, setRefreshSignal] = useState(0)
  // Set by the card's slippage [Open]; consumed by CalendarView's edit Dialog.
  const [editRequest, setEditRequest] = useState<UpcomingItem | null>(null)

  return (
    <div className="space-y-5">
      <CompletionCard
        year={year}
        month={month}
        refreshSignal={refreshSignal}
        onOpenItem={(item) => setEditRequest(item)}
      />
      <CalendarView
        initialYear={initialYear}
        initialMonth={initialMonth}
        initialItems={initialItems}
        initialError={initialError}
        onMonthChange={(y, m) => { setYear(y); setMonth(m) }}
        onMutated={() => setRefreshSignal((n) => n + 1)}
        editRequest={editRequest}
        onEditRequestConsumed={() => setEditRequest(null)}
      />
    </div>
  )
}
