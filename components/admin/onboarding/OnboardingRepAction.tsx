'use client'

/**
 * OnboardingRepAction — the per-employee onboarding entry point.
 *
 * Shown on the employee edit page. If the rep already has an onboarding
 * record, links to their checklist ("View onboarding"). Otherwise an
 * idempotent "Start onboarding" button creates it (POST
 * /api/admin/onboarding/start) and routes to the checklist.
 *
 * Brand: PCT navy #03374f, orange #f26b2b.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ClipboardCheck, Loader2, ChevronRight } from 'lucide-react'

interface Props {
  repId:          number
  hasOnboarding:  boolean
  progressLabel?: string | null  // e.g. "7 / 16 complete" when started
}

export function OnboardingRepAction({ repId, hasOnboarding, progressLabel }: Props) {
  const router = useRouter()
  const [starting, setStarting] = useState(false)
  const [error,    setError]    = useState('')

  async function start() {
    setStarting(true); setError('')
    try {
      const res = await fetch('/api/admin/onboarding/start', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ repId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Failed to start onboarding')
      router.push(`/admin/team/onboarding/${repId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start onboarding')
      setStarting(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 flex-wrap">
      <div className="w-9 h-9 rounded-xl bg-[#03374f]/10 flex items-center justify-center flex-shrink-0">
        <ClipboardCheck className="w-5 h-5 text-[#03374f]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#03374f]">New-rep onboarding</p>
        <p className="text-xs text-gray-500">
          {hasOnboarding
            ? `Checklist started${progressLabel ? ` — ${progressLabel}` : ''}.`
            : 'Start the new-rep checklist for this employee.'}
        </p>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
      {hasOnboarding ? (
        <Link
          href={`/admin/team/onboarding/${repId}`}
          className="h-9 px-4 inline-flex items-center gap-1.5 rounded-xl border border-gray-300 text-[#03374f] text-sm font-semibold hover:bg-gray-50 transition-colors flex-shrink-0"
        >
          View onboarding <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <button
          type="button"
          onClick={start}
          disabled={starting}
          className="h-9 px-4 inline-flex items-center gap-1.5 rounded-xl bg-[#f26b2b] text-white text-sm font-semibold hover:bg-[#d85c1f] transition-colors flex-shrink-0 disabled:opacity-60"
        >
          {starting && <Loader2 className="w-4 h-4 animate-spin" />}
          {starting ? 'Starting…' : 'Start onboarding'}
        </button>
      )}
    </div>
  )
}
