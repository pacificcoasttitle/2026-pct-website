'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { ParsedSection } from '@/lib/tessa/tessa-types'

interface Props {
  section: ParsedSection
  defaultExpanded?: boolean
}

function formatContent(content: string, sectionTitle: string): string {
  // Basic markdown → HTML
  let out = content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\s*\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')

  // Item numbers highlighted
  out = out.replace(/Items\s*#\s*(\d{1,3})\s*(?:&|and)\s*#\s*(\d{1,3})/gi,
    '<span class="tessa-item-num">Item #$1</span> <span class="tessa-item-num">Item #$2</span>')
  out = out.replace(/(Item\s*#?\s*)(\d{1,3})/gi,
    '<span class="tessa-item-num">Item #$2</span>')

  // Severity pills
  out = out.replace(/\[(BLOCKER|MATERIAL|Material|INFO|Informational)\]/g, (_m: string, lvl: string) => {
    const key = (lvl || '').toLowerCase()
    const norm = key.startsWith('block') ? 'blocker' : key.startsWith('info') ? 'info' : 'material'
    const label = norm === 'blocker' ? '🔴 BLOCKER' : norm === 'info' ? '🔵 INFO' : '🟡 MATERIAL'
    const cls = norm === 'blocker'
      ? 'inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800 border border-red-300 mx-1'
      : norm === 'info'
      ? 'inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 mx-1'
      : 'inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 mx-1'
    return `<span class="${cls}">${label}</span>`
  })

  // Dollar amounts
  out = out.replace(/(\$[\d,]+(?:\.\d{2})?)/g,
    '<span class="font-semibold text-green-700">$1</span>')

  // Tax delinquent highlight
  if (sectionTitle === 'TAXES AND ASSESSMENTS') {
    out = out.replace(/(For Tax Defaults \/ Redemptions:)/gi,
      '<div class="mt-4 pt-3 border-t-2 border-red-300"><strong class="text-red-700 text-sm">🚨 $1</strong></div>')
    out = out.replace(/(For Property Taxes:)/gi,
      '<strong class="text-amber-700 text-sm">$1</strong>')
    out = out.replace(/(For Other Assessments:)/gi,
      '<strong class="text-gray-600 text-sm">$1</strong>')
  }

  return out
}

export function TessaSectionCard({ section, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const isBlocker = section.title === 'TITLE REQUIREMENTS'
  const isLiens = section.title === 'LIENS AND JUDGMENTS'
  const isTaxes = section.title === 'TAXES AND ASSESSMENTS'

  const badgeBg = isBlocker
    ? 'bg-green-100 text-green-800'
    : isLiens
    ? 'bg-red-100 text-red-800'
    : isTaxes
    ? 'bg-amber-100 text-amber-800'
    : 'bg-gray-100 text-gray-700'

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
      style={{ borderLeft: `4px solid ${section.borderColor}` }}
    >
      {/* Header */}
      <button
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <span className="text-xl flex-shrink-0">{section.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900 text-sm uppercase tracking-wide">
              {section.title}
            </span>
            {section.itemCount > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${badgeBg}`}>
                {section.itemCount}
              </span>
            )}
          </div>
          {!expanded && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{section.preview}</p>
          )}
        </div>
        <span className="flex-shrink-0 text-gray-400">
          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </span>
      </button>

      {/* Body */}
      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-gray-100">
          <div
            className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: formatContent(section.content, section.title),
            }}
          />
          {section.title === 'TITLE REQUIREMENTS' && (
            <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm font-semibold text-amber-800 mb-1">⚠️ Closing Warning</p>
              <p className="text-sm text-amber-700">
                Missing or incomplete requirements will <strong>stop this transaction from closing</strong>.
                Resolve each item with the title officer before funding or recording.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
