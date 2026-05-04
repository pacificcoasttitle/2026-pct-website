"use client"

import { useCallback, useEffect, useImperativeHandle, useState, forwardRef } from 'react'
import {
  History,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
  AlertCircle,
  ImageIcon,
  MessageSquare,
} from 'lucide-react'

interface LogRow {
  id:           number
  mode:         string
  send_mode:    string | null
  preview_mode: boolean
  test_phone:   string | null
  message:      string
  image_urls:   string[] | null
  total:        number
  successful:   number
  failed:       number
  success:      boolean
  error:        string | null
  actor:        string | null
  created_at:   string
  recipient_count: number
}

interface RecipientRow {
  id?:          number
  rep_slug?:    string | null
  rep_name?:    string | null
  sms_code?:    string | null
  phone_last4?: string | null
  status?:      string | null
  error?:       string | null
}

export interface SmsLogsPanelHandle {
  refresh: (highlightId?: number) => void
}

function fmtTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    })
  } catch { return iso }
}

function fmtMode(mode: string, sendMode: string | null): string {
  if (mode === 'mms')         return sendMode === 'all'  ? 'MMS · Broadcast' : sendMode === 'per-image' ? 'MMS · Per-image' : 'MMS · Single rep'
  if (mode === 'single-text') return 'Text · Single rep'
  if (mode === 'text')        return 'Text · Broadcast'
  return mode
}

function StatusBadge({ status }: { status: string | null | undefined }) {
  const s = (status || '').toLowerCase()
  if (s === 'sent') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" /> Sent
      </span>
    )
  }
  if (s === 'failed' || s === 'error') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
        <XCircle className="w-3 h-3" /> Failed
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
      {status || 'Unknown'}
    </span>
  )
}

export const SmsLogsPanel = forwardRef<SmsLogsPanelHandle, object>(function SmsLogsPanel(_, ref) {
  const [logs, setLogs]         = useState<LogRow[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [details, setDetails]   = useState<Record<number, RecipientRow[]>>({})
  const [detailsLoading, setDetailsLoading] = useState<Record<number, boolean>>({})
  const [highlightId, setHighlightId] = useState<number | null>(null)

  const load = useCallback(async (highlight?: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/sms-studio/logs?limit=25', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to load logs')
      setLogs(data.logs || [])
      if (highlight) {
        setHighlightId(highlight)
        // Auto-expand the new entry
        setExpanded((prev) => new Set(prev).add(highlight))
        loadDetails(highlight)
        setTimeout(() => setHighlightId(null), 4000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load logs')
    } finally {
      setLoading(false)
    }
  }, [])

  async function loadDetails(id: number) {
    if (details[id]) return
    setDetailsLoading((d) => ({ ...d, [id]: true }))
    try {
      const res = await fetch(`/api/admin/sms-studio/logs/${id}`, { cache: 'no-store' })
      const data = await res.json()
      if (res.ok) {
        setDetails((prev) => ({ ...prev, [id]: data.recipients || [] }))
      }
    } finally {
      setDetailsLoading((d) => ({ ...d, [id]: false }))
    }
  }

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else { next.add(id); loadDetails(id) }
      return next
    })
  }

  useEffect(() => { load() }, [load])

  useImperativeHandle(ref, () => ({
    refresh: (highlightId?: number) => load(highlightId),
  }), [load])

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <header className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
        <History className="w-4 h-4 text-[#f26b2b]" />
        <h2 className="font-semibold text-[#03374f] text-sm">Send History</h2>
        <span className="text-xs text-gray-400">— last {logs.length || 25}</span>
        <button
          type="button"
          onClick={() => load()}
          disabled={loading}
          className="ml-auto inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#03374f] disabled:opacity-50"
          title="Refresh"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Refresh
        </button>
      </header>

      {error && (
        <div className="px-5 py-3 flex items-start gap-2 text-xs text-red-700 bg-red-50 border-b border-red-100">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {logs.length === 0 && !loading && !error && (
        <div className="py-12 text-center text-gray-400 text-sm">
          <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
          No sends yet. Once you send your first text or MMS, it will appear here.
        </div>
      )}

      <ul className="divide-y divide-gray-50">
        {logs.map((log) => {
          const isOpen      = expanded.has(log.id)
          const isHighlight = highlightId === log.id
          const recipients  = details[log.id] || []
          const loadingDet  = detailsLoading[log.id]

          return (
            <li
              key={log.id}
              className={`transition-colors ${isHighlight ? 'bg-amber-50' : 'hover:bg-gray-50/60'}`}
            >
              <button
                type="button"
                onClick={() => toggleExpand(log.id)}
                className="w-full flex items-start gap-3 px-5 py-3.5 text-left"
              >
                <div className="mt-0.5 text-gray-300">
                  {isOpen
                    ? <ChevronDown className="w-4 h-4" />
                    : <ChevronRight className="w-4 h-4" />}
                </div>

                {/* Big status icon */}
                <div className="mt-0.5 flex-shrink-0">
                  {log.success
                    ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                    : <XCircle className="w-5 h-5 text-red-500" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-[#03374f]">
                      {fmtMode(log.mode, log.send_mode)}
                    </span>
                    {log.preview_mode && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">
                        <Eye className="w-2.5 h-2.5" /> Preview
                      </span>
                    )}
                    {log.image_urls && log.image_urls.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                        <ImageIcon className="w-2.5 h-2.5" /> {log.image_urls.length}
                      </span>
                    )}
                    {log.test_phone && (
                      <span className="text-[10px] text-gray-500 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                        Test → ···{log.test_phone.replace(/\D/g, '').slice(-4)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{log.message}</p>
                  <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                    <span>{fmtTime(log.created_at)}</span>
                    {log.actor && <span>· {log.actor}</span>}
                    {log.error && <span className="text-red-600 truncate">· {log.error}</span>}
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-bold text-[#03374f]">
                    <span className="text-green-600">{log.successful}</span>
                    <span className="text-gray-300 mx-0.5">/</span>
                    <span>{log.total || log.recipient_count}</span>
                  </div>
                  {log.failed > 0 && (
                    <div className="text-[11px] text-red-600 font-semibold">{log.failed} failed</div>
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="bg-gray-50/70 border-t border-gray-100 px-5 py-3">
                  {loadingDet ? (
                    <div className="flex items-center gap-2 text-xs text-gray-500 py-3">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading recipients…
                    </div>
                  ) : recipients.length === 0 ? (
                    <div className="text-xs text-gray-500 italic py-3">
                      No per-recipient detail recorded for this send.
                    </div>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-500">
                          <th className="text-left font-semibold py-1.5">Rep</th>
                          <th className="text-left font-semibold py-1.5">SMS Code</th>
                          <th className="text-left font-semibold py-1.5">Phone</th>
                          <th className="text-left font-semibold py-1.5">Status</th>
                          <th className="text-left font-semibold py-1.5">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recipients.map((r, i) => (
                          <tr key={r.id ?? i} className="border-t border-gray-100">
                            <td className="py-1.5 font-medium text-[#03374f]">{r.rep_name || '—'}</td>
                            <td className="py-1.5 font-mono text-gray-600">{r.sms_code || '—'}</td>
                            <td className="py-1.5 text-gray-600">{r.phone_last4 ? `···${r.phone_last4}` : '—'}</td>
                            <td className="py-1.5"><StatusBadge status={r.status} /></td>
                            <td className="py-1.5 text-gray-500">{r.error || ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {/* Image thumbnails for MMS */}
                  {log.image_urls && log.image_urls.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Attached images ({log.image_urls.length})
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {log.image_urls.map((url, i) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block w-14 h-14 rounded-lg overflow-hidden border border-gray-200 bg-white">
                            <img src={url} alt={`Attachment ${i+1}`} className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
})
