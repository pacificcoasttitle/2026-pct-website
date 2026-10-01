'use client'

import { useEffect, useState } from 'react'
import { Switch } from '@/components/ui/switch'

export function AssetEmailPreference({ slug }: { slug: string }) {
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const url = `/api/admin/employees/${encodeURIComponent(slug)}/asset-email-preference`

  useEffect(() => {
    const controller = new AbortController()
    setEnabled(null)
    setError('')
    fetch(url, { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        const data = await response.json()
        if (!response.ok || typeof data.enabled !== 'boolean') throw new Error('Could not load preference. Reload to try again.')
        setEnabled(data.enabled)
      })
      .catch(error => { if (!controller.signal.aborted) setError(error.message) })
    return () => controller.abort()
  }, [url])

  async function save(value: boolean) {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch(url, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: value }),
      })
      const data = await response.json()
      if (!response.ok || typeof data.enabled !== 'boolean') throw new Error(data.error || 'Could not save preference.')
      setEnabled(data.enabled)
      setMessage('Saved')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not save preference.')
    } finally { setSaving(false) }
  }

  return <div className="rounded-xl bg-gray-50 p-4">
    <div className="flex items-center justify-between gap-4">
      <label htmlFor="asset-email-enabled" className="text-sm font-semibold text-[#03374f]">Email Marketing Pieces</label>
      <div className="flex items-center gap-2">
        <span className="text-xs">{enabled === null ? 'Loading' : enabled ? 'ON' : 'OFF'}</span>
        <Switch id="asset-email-enabled" checked={enabled === true} disabled={enabled === null || saving}
          onCheckedChange={save} aria-describedby="asset-email-help" />
      </div>
    </div>
    <p id="asset-email-help" className="mt-2 text-xs text-gray-600">Send this rep their personalized IG Stories, flyers, and calendars by email. Saves immediately. Does not change client campaigns, texts, or other notifications.</p>
    <p role="status" className="mt-1 text-xs text-gray-600">{saving ? 'Saving…' : message}</p>
    {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
}
