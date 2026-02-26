'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { ParsedSection, PrelimFacts } from '@/lib/tessa/tessa-types'

import { TessaRequirementsContent } from './content/TessaRequirementsContent'
import { TessaSummaryContent } from './content/TessaSummaryContent'
import { TessaPropertyContent } from './content/TessaPropertyContent'
import { TessaLiensContent } from './content/TessaLiensContent'
import { TessaTaxContent } from './content/TessaTaxContent'
import { TessaOtherFindingsContent } from './content/TessaOtherFindingsContent'
import { TessaDocStatusContent } from './content/TessaDocStatusContent'

// Letter/symbol shown inside the colored square icon
const SECTION_ICON_LETTERS: Record<string, string> = {
  'TITLE REQUIREMENTS': '✓',
  'SUMMARY': 'Σ',
  'PROPERTY INFORMATION': 'P',
  'LIENS AND JUDGMENTS': '$',
  'TAXES AND ASSESSMENTS': 'T',
  'OTHER FINDINGS': '!',
  'DOCUMENT STATUS': 'i',
}

interface Props {
  section: ParsedSection
  defaultExpanded?: boolean
  facts?: PrelimFacts | null
}

function SectionBody({
  section,
  facts,
}: {
  section: ParsedSection
  facts?: PrelimFacts | null
}) {
  switch (section.title) {
    case 'TITLE REQUIREMENTS':
      return <TessaRequirementsContent content={section.content} />
    case 'SUMMARY':
      return <TessaSummaryContent content={section.content} />
    case 'PROPERTY INFORMATION':
      return <TessaPropertyContent content={section.content} facts={facts} />
    case 'LIENS AND JUDGMENTS':
      return <TessaLiensContent content={section.content} facts={facts} />
    case 'TAXES AND ASSESSMENTS':
      return <TessaTaxContent content={section.content} facts={facts} />
    case 'OTHER FINDINGS':
      return <TessaOtherFindingsContent content={section.content} />
    case 'DOCUMENT STATUS':
      return <TessaDocStatusContent content={section.content} />
    default:
      return (
        <div
          className="pt-4 prose prose-sm max-w-none text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: section.content
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\n\s*\n/g, '<br/><br/>')
              .replace(/\n/g, '<br/>')
              .replace(
                /(\$[\d,]+(?:\.\d{2})?)/g,
                '<span class="font-semibold text-gray-900">$1</span>'
              ),
          }}
        />
      )
  }
}

// Compute a short subtitle for sections that have extra context
function getSectionSubtitle(section: ParsedSection, facts: PrelimFacts | null | undefined): string | null {
  if (section.title === 'LIENS AND JUDGMENTS') {
    const dots = facts?.deeds_of_trust ?? []
    if (dots.length === 0) return null
    const total = dots.reduce((sum, d) => {
      const n = parseFloat((d.amount ?? '').replace(/[$,]/g, ''))
      return isNaN(n) ? sum : sum + n
    }, 0)
    const totalStr = total > 0
      ? ` · $${total.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      : ''
    return `${dots.length} DOT${dots.length > 1 ? 's' : ''}${totalStr}`
  }
  if (section.title === 'TAXES AND ASSESSMENTS') {
    const count = facts?.taxes?.property_taxes?.length ?? 0
    return count > 0 ? `${count} parcel${count > 1 ? 's' : ''}` : null
  }
  return null
}

export function TessaSectionCard({ section, defaultExpanded = false, facts }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const subtitle = getSectionSubtitle(section, facts)
  const isSummary = section.title === 'SUMMARY'

  return (
    <div
      className={`rounded-xl border bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow
        ${isSummary ? 'border-blue-200 bg-blue-50/30 ring-1 ring-blue-100' : 'border-gray-200'}`}
    >
      {/* Header / toggle */}
      <button
        className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gray-50/80 transition-colors"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        {/* Colored square icon — matches prototype */}
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: section.borderColor }}
        >
          {SECTION_ICON_LETTERS[section.title] ?? section.title[0]}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm tracking-tight">
              {section.title}
            </span>
            {/* Neutral count badge */}
            {section.itemCount > 0 && (
              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {section.itemCount}
              </span>
            )}
            {/* Section-specific subtitle (DOT total, parcel count) */}
            {subtitle && (
              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {subtitle}
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

      {/* Body — fade+slide in when expanded */}
      {expanded && (
        <div className="px-6 pb-6 pt-3 border-t border-gray-100 tessa-card-body-enter">
          <SectionBody section={section} facts={facts} />
        </div>
      )}
    </div>
  )
}
