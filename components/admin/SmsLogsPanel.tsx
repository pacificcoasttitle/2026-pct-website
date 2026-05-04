"use client"

import { Fragment, useCallback, useEffect, useImperativeHandle, useState, forwardRef } from 'react'
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

      {logs.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50/70 text-gray-500 border-b border-gray-100">
              <tr>
                <th className="w-6 py-2 px-3"></th>
                <th className="w-6 py-2 px-1"></th>
                <th className="text-left font-semibold py-2 px-2 whitespace-nowrap">When</th>
                <th className="text-left font-semibold py-2 px-2 whitespace-nowrap">Type</th>
                <th className="text-left font-semibold py-2 px-2">Message</th>
                <th className="text-left font-semibold py-2 px-2 whitespace-nowrap">Imgs</th>
                <th className="text-right font-semibold py-2 px-2 whitespace-nowrap">Sent</th>
                <th className="text-right font-semibold py-2 px-2 whitespace-nowrap">Failed</th>
                <th className="text-left font-semibold py-2 px-2 whitespace-nowrap">By</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const isOpen      = expanded.has(log.id)
                const isHighlight = highlightId === log.id
                const recipients  = details[log.id] || []
                const loadingDet  = detailsLoading[log.id]
                const total       = log.total || log.recipient_count

                return (
                  <Fragment key={log.id}>
                    <tr
                      onClick={() => toggleExpand(log.id)}
                      className={`cursor-pointer border-b border-gray-50 transition-colors ${
                        isHighlight ? 'bg-amber-50' : 'hover:bg-gray-50/60'
                      }`}
                    >
                      <td className="py-2 px-3 text-gray-300 align-top">
                        {isOpen
                          ? <ChevronDown className="w-3.5 h-3.5" />
                          : <ChevronRight className="w-3.5 h-3.5" />}
                      </td>
                      <td className="py-2 px-1 align-top">
                        {log.success
                          ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                          : <XCircle className="w-4 h-4 text-red-500" />}
                      </td>
                      <td className="py-2 px-2 text-gray-500 whitespace-nowrap align-top">
                        {fmtTime(log.created_at)}
                      </td>
                      <td className="py-2 px-2 align-top">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-[#03374f] whitespace-nowrap">{fmtMode(log.mode, log.send_mode)}</span>
                          {log.preview_mode && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-100 px-1 py-px rounded">
                              <Eye className="w-2.5 h-2.5" /> Preview
                            </span>
                          )}
                          {log.test_phone && (
                            <span className="text-[10px] text-gray-500 whitespace-nowrap">→···{log.test_phone.replace(/\D/g, '').slice(-4)}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-gray-600 max-w-[420px] align-top">
                        <div className="truncate">{log.message}</div>
                        {log.error && (
                          <div className="text-[11px] text-red-600 truncate mt-0.5">{log.error}</div>
                        )}
                      </td>
                      <td className="py-2 px-2 align-top">
                        {log.image_urls && log.image_urls.length > 0 ? (
                          <div className="flex items-center gap-1">
                            {log.image_urls.slice(0, 2).map((url, i) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="block w-6 h-6 rounded overflow-hidden border border-gray-200 bg-white flex-shrink-0"
                              >
                                <img src={url} alt="" className="w-full h-full object-cover" />
                              </a>
                            ))}
                            {log.image_urls.length > 2 && (
                              <span className="text-[10px] text-gray-400 ml-0.5">+{log.image_urls.length - 2}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-right font-semibold align-top">
                        <span className="text-green-600">{log.successful}</span>
                        <span className="text-gray-300">/{total}</span>
                      </td>
                      <td className="py-2 px-2 text-right font-semibold align-top">
                        {log.failed > 0
                          ? <span className="text-red-600">{log.failed}</span>
                          : <span className="text-gray-300">0</span>}
                      </td>
                      <td className="py-2 px-2 text-gray-500 whitespace-nowrap align-top">
                        {log.actor || '—'}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-gray-50/40">
                        <td colSpan={9} className="px-5 py-3">
                          {loadingDet ? (
                            <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading recipients…
                            </div>
                          ) : recipients.length === 0 ? (
                            <div className="text-xs text-gray-500 italic py-1">
                              No per-recipient detail recorded for this send.
                            </div>
                          ) : (
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-gray-500">
                                  <th className="text-left font-semibold py-1">Rep</th>
                                  <th className="text-left font-semibold py-1">SMS Code</th>
                                  <th className="text-left font-semibold py-1">Phone</th>
                                  <th className="text-left font-semibold py-1">Status</th>
                                  <th className="text-left font-semibold py-1">Notes</th>
                                </tr>
                              </thead>
                              <tbody>
                                {recipients.map((r, i) => (
                                  <tr key={r.id ?? i} className="border-t border-gray-100">
                                    <td className="py-1 font-medium text-[#03374f]">{r.rep_name || '—'}</td>
                                    <td className="py-1 font-mono text-gray-600">{r.sms_code || '—'}</td>
                                    <td className="py-1 text-gray-600">{r.phone_last4 ? `···${r.phone_last4}` : '—'}</td>
                                    <td className="py-1"><StatusBadge status={r.status} /></td>
                                    <td className="py-1 text-gray-500">{r.error || ''}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
})
