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

export function TessaSectionCard({ section, defaultExpanded = false, facts }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const badgeBg =
    section.title === 'TITLE REQUIREMENTS'
      ? 'bg-green-100 text-green-800'
      : section.title === 'LIENS AND JUDGMENTS'
      ? 'bg-red-100 text-red-800'
      : section.title === 'TAXES AND ASSESSMENTS'
      ? 'bg-amber-100 text-amber-800'
      : 'bg-gray-100 text-gray-700'

  return (
    <div
      className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      style={{ borderLeft: `4px solid ${section.borderColor}` }}
    >
      {/* Header / toggle */}
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
          <SectionBody section={section} facts={facts} />
        </div>
      )}
    </div>
  )
}
