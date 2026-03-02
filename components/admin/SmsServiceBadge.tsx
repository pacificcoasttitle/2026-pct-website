"use client"

import { useEffect, useState } from 'react'

interface HealthState {
  loading: boolean
  error: string
  preview_mode: boolean
  status: string
  reps: number
}

export function SmsServiceBadge() {
  const [state, setState] = useState<HealthState>({
    loading: true,
    error: '',
    preview_mode: false,
    status: 'unknown',
    reps: 0,
  })

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch('/api/admin/sms-health', { cache: 'no-store' })
        const data = await res.json()
        if (!active) return
        if (!res.ok) {
          setState((s) => ({ ...s, loading: false, error: data.error || 'Failed to load health' }))
          return
        }
        setState({
          loading: false,
          error: '',
          preview_mode: Boolean(data.preview_mode),
          status: String(data.status || 'unknown'),
          reps: Number(data.sales_reps_count || 0),
        })
      } catch {
        if (!active) return
        setState((s) => ({ ...s, loading: false, error: 'Health check unreachable' }))
      }
    })()
    return () => {
      active = false
    }
  }, [])

  if (state.loading) {
    return <span className="text-xs text-gray-400">SMS health loading...</span>
  }
  if (state.error) {
    return (
      <span className="text-xs px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-700">
        SMS service unreachable
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className={`text-xs px-2.5 py-1 rounded-full border ${
          state.preview_mode
            ? 'bg-amber-50 border-amber-200 text-amber-700'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}
      >
        {state.preview_mode ? 'Preview Mode ON' : 'Live Mode ON'}
      </span>
      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600">
        Service: {state.status}
      </span>
      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600">
        Reps: {state.reps}
      </span>
    </div>
  )
}

