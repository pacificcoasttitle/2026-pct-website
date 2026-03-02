"use client"

import { useState } from 'react'
import {
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  List,
  User,
  Truck,
} from 'lucide-react'
import type { FarmRequest } from '@/lib/admin-db'

const STATUS_OPTIONS = ['all', 'pending', 'processing', 'delivered', 'cancelled']

const STATUS_STYLE: Record<string, string> = {
  pending:    'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  delivered:  'bg-green-50 text-green-700 border-green-200',
  cancelled:  'bg-gray-50 text-gray-500 border-gray-200',
}

const LIST_TYPE_LABELS: Record<string, string> = {
  OUT_OF_STATE: 'Out-of-State',
  EMPTY_NESTER: 'Empty Nesters',
  ABSENTEE:     'Absentee',
  JUST_LISTED:  'Just Listed',
  JUST_SOLD:    'Just Sold',
  NEW_MOVER:    'New Movers',
  INVESTOR:     'Investors',
  OTHER:        'Other',
}

const LIST_SIZE_LABELS: Record<string, string> = {
  UNDER_100:  '< 100',
  '100_250':  '100–250',
  '250_500':  '250–500',
  '500_1000': '500–1k',
  '1000_PLUS': '1k+',
}

async function updateStatus(id: number, status: string) {
  await fetch('/api/admin/farm-requests', {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ id, status }),
  })
}

export default function FarmRequestsClient({ initial }: { initial: FarmRequest[] }) {
  const [requests, setRequests] = useState<FarmRequest[]>(initial)
  const [filter,   setFilter]   = useState('all')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [saving,   setSaving]   = useState<number | null>(null)

  const filtered = filter === 'all'
    ? requests
    : requests.filter((r) => r.status === filter)

  async function handleStatus(id: number, status: string) {
    setSaving(id)
    await updateStatus(id, status)
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
    setSaving(null)
  }

  const counts = STATUS_OPTIONS.slice(1).reduce((acc, s) => {
    acc[s] = requests.filter((r) => r.status === s).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="max-w-5xl mx-auto space-y-6 pt-2 lg:pt-0">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#03374f]">Farm Requests</h1>
          <p className="text-gray-500 text-sm mt-1">{requests.length} total requests</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Status pill counts */}
          {Object.entries(counts).map(([s, c]) => c > 0 && (
            <span key={s} className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLE[s] ?? ''}`}>
              {c} {s}
            </span>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-gray-100 p-1 shadow-sm w-fit">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
              filter === s ? 'bg-[#03374f] text-white shadow' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {s} {s !== 'all' && counts[s] > 0 && <span className="ml-1 opacity-60">({counts[s]})</span>}
          </button>
        ))}
      </div>

      {/* Requests */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center text-gray-400">
          No {filter !== 'all' ? filter : ''} requests found.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              {/* Row */}
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              >
                {/* Status pill */}
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${STATUS_STYLE[r.status] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  {r.status}
                </span>

                {/* List info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#03374f] text-sm">{r.contact_name}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-sm text-gray-600">{LIST_TYPE_LABELS[r.list_type] ?? r.list_type}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{r.city_area}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="text-sm text-gray-600">{LIST_SIZE_LABELS[r.list_size] ?? r.list_size}</span>
                  </div>
                  {r.rep_name && (
                    <p className="text-xs text-gray-400 mt-0.5">Rep: {r.rep_name}</p>
                  )}
                </div>

                {/* Date */}
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(r.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>

                <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${expanded === r.id ? 'rotate-180' : ''}`} />
              </div>

              {/* Expanded detail */}
              {expanded === r.id && (
                <div className="border-t border-gray-50 px-5 py-5 bg-gray-50/30 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    {/* Contact info */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Agent</p>
                      <p className="flex items-center gap-2 text-sm text-gray-700">
                        <User className="w-3.5 h-3.5 text-gray-400" /> {r.contact_name}
                      </p>
                      <a href={`mailto:${r.contact_email}`} className="flex items-center gap-2 text-sm text-[#f26b2b] hover:underline">
                        <Mail className="w-3.5 h-3.5" /> {r.contact_email}
                      </a>
                      {r.contact_phone && (
                        <a href={`tel:${r.contact_phone}`} className="flex items-center gap-2 text-sm text-[#f26b2b] hover:underline">
                          <Phone className="w-3.5 h-3.5" /> {r.contact_phone}
                        </a>
                      )}
                    </div>

                    {/* Request details */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Request Details</p>
                      <p className="flex items-center gap-2 text-sm text-gray-700">
                        <List className="w-3.5 h-3.5 text-gray-400" />
                        {LIST_TYPE_LABELS[r.list_type] ?? r.list_type} · {LIST_SIZE_LABELS[r.list_size] ?? r.list_size} records
                      </p>
                      <p className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {r.city_area}{r.radius ? ` (${r.radius})` : ''}
                      </p>
                      {r.property_address && (
                        <p className="text-sm text-gray-600 pl-5">{r.property_address}</p>
                      )}
                      {r.output_formats?.length > 0 && (
                        <p className="text-sm text-gray-600 pl-5">
                          Format: {r.output_formats.map((f) => f.toUpperCase()).join(', ')}
                        </p>
                      )}
                      {r.notes && (
                        <p className="text-sm text-gray-600 pl-5 italic">&ldquo;{r.notes}&rdquo;</p>
                      )}
                    </div>
                  </div>

                  {/* Status actions */}
                  <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400 mr-1">Update status:</span>
                    {['pending', 'processing', 'delivered', 'cancelled'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        disabled={r.status === s || saving === r.id}
                        onClick={() => handleStatus(r.id, s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-40 capitalize ${
                          r.status === s
                            ? (STATUS_STYLE[s] ?? '')
                            : 'bg-white border-gray-200 text-gray-500 hover:border-[#03374f]/30'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                    {r.rep_email && (
                      <a
                        href={`mailto:${r.rep_email}?subject=Farm Request from ${r.contact_name}&body=Hi ${r.rep_name?.split(' ')[0]}, see attached farm request from ${r.contact_name}.`}
                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-[#03374f] text-white text-xs font-semibold rounded-lg hover:bg-[#03374f]/90 transition-colors"
                      >
                        <Mail className="w-3 h-3" /> Email Rep
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
