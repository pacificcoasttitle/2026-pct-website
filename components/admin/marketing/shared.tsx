/**
 * Shared building blocks for the Email Marketing admin UI.
 * - Brand colors: PCT navy #03374f / #003d79, accent orange #f26b2b.
 * - Status pills cover draft / scheduled / sent / cancelled / failed / skipped.
 */
'use client'

import * as React from 'react'
import { CheckCircle2, Clock, FileText, XCircle, AlertCircle, MinusCircle } from 'lucide-react'

export const PCT_NAVY = '#03374f'
export const PCT_ORANGE = '#f26b2b'

export type CampaignStatus =
  | 'draft' | 'scheduled' | 'sent' | 'cancelled' | 'failed' | 'skipped' | string

interface PillCfg {
  label: string
  cls:   string
  Icon:  React.ComponentType<{ className?: string }>
}

const STATUS_MAP: Record<string, PillCfg> = {
  draft:     { label: 'Draft',     cls: 'bg-gray-100 text-gray-600 border-gray-200',         Icon: FileText },
  scheduled: { label: 'Scheduled', cls: 'bg-blue-50 text-blue-700 border-blue-200',          Icon: Clock },
  sent:      { label: 'Sent',      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', cls: 'bg-red-50 text-red-700 border-red-200',             Icon: XCircle },
  failed:    { label: 'Failed',    cls: 'bg-red-50 text-red-700 border-red-200',             Icon: AlertCircle },
  skipped:   { label: 'Skipped',   cls: 'bg-amber-50 text-amber-700 border-amber-200',       Icon: MinusCircle },
}

export function StatusPill({ status, size = 'sm' }: { status: CampaignStatus; size?: 'sm' | 'xs' }) {
  const cfg = STATUS_MAP[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600 border-gray-200', Icon: FileText }
  const padding = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'
  const iconSize = size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${padding} ${cfg.cls}`}>
      <cfg.Icon className={iconSize} />
      {cfg.label}
    </span>
  )
}

/** Friendly date — May 21, 2026  */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return iso }
}

/** Friendly time — 4:30 PM PT (in viewer's TZ; PT is shorthand for "Pacific Time") */
export function formatTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit',
      timeZone: 'America/Los_Angeles',
    }) + ' PT'
  } catch { return iso }
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return `${formatDate(iso)} at ${formatTime(iso)}`
}

/** Inline alert that matches the existing studio's feedback style. */
export function InlineAlert({
  kind,
  message,
  onClose,
}: {
  kind: 'error' | 'success' | 'info'
  message: string
  onClose?: () => void
}) {
  if (!message) return null
  const cls =
    kind === 'error'   ? 'bg-red-50 border-red-100 text-red-700' :
    kind === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                         'bg-blue-50 border-blue-100 text-blue-700'
  return (
    <div className={`flex items-start gap-2.5 p-3.5 rounded-xl text-sm border ${cls}`}>
      {kind === 'error' ? <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> :
        kind === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" /> :
        <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />}
      <span className="flex-1">{message}</span>
      {onClose && (
        <button type="button" onClick={onClose} className="text-current/60 hover:text-current text-xs">✕</button>
      )}
    </div>
  )
}

/** Category → emoji icon for templates. */
export function categoryIcon(category: string | null | undefined): string {
  switch (category) {
    case 'product':       return '📦'
    case 'title_news':    return '📰'
    case 'market_update': return '📊'
    case 'holidays':      return '🎉'
    default:              return '📧'
  }
}

/** Category → background + text classes for the icon badge. */
export function categoryColor(category: string | null | undefined): { bg: string; text: string; label: string } {
  switch (category) {
    case 'product':       return { bg: 'bg-blue-50',    text: 'text-blue-700',    label: 'Product' }
    case 'title_news':    return { bg: 'bg-purple-50',  text: 'text-purple-700',  label: 'Title News' }
    case 'market_update': return { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Market Update' }
    case 'holidays':      return { bg: 'bg-amber-50',   text: 'text-amber-700',   label: 'Holidays' }
    default:              return { bg: 'bg-gray-100',   text: 'text-gray-600',    label: 'Custom' }
  }
}

/** Truncate a string for a one-line preview. */
export function previewText(s: string | null | undefined, max = 60): string {
  if (!s) return ''
  const trimmed = s.trim()
  if (trimmed.length <= max) return trimmed
  return trimmed.slice(0, max - 1).trimEnd() + '…'
}

export const TEMPLATE_CATEGORIES = [
  { key: 'product',       label: 'Product Spotlight' },
  { key: 'title_news',    label: 'Title Industry News' },
  { key: 'market_update', label: 'Market Update' },
  { key: 'holidays',      label: 'Holiday Greeting' },
] as const

export type TemplateCategoryKey = typeof TEMPLATE_CATEGORIES[number]['key']

/** A category is considered "default" if it matches one of the seeded keys. */
export function isDefaultTemplate(category: string | null | undefined): boolean {
  if (!category) return false
  return TEMPLATE_CATEGORIES.some((c) => c.key === category)
}
