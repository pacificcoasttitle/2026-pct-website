'use client'

import type { ParsedSection, PrelimFacts } from '@/lib/tessa/tessa-types'

interface Props {
  sections: ParsedSection[]
  fileName: string
  facts?: PrelimFacts | null
}

function countSeverities(content: string) {
  let blockers = 0
  let material = 0
  let informational = 0
  for (const line of content.toLowerCase().split('\n')) {
    if (!line.includes('closing impact:')) continue
    if (line.includes('blocker')) blockers++
    else if (line.includes('material')) material++
    else if (line.includes('informational') || line.includes(' info')) informational++
  }
  return { blockers, material, informational }
}

export function TessaComplexityScore({ sections, fileName, facts }: Props) {
  const reqSection = sections.find((s) => s.title === 'TITLE REQUIREMENTS')
  const { blockers, material, informational } = reqSection
    ? countSeverities(reqSection.content)
    : { blockers: 0, material: 0, informational: 0 }

  const total = blockers + material + informational
  if (total === 0) return null

  const pBlocker = Math.round((blockers / total) * 100)
  const pMaterial = Math.round((material / total) * 100)
  const pInfo = 100 - pBlocker - pMaterial

  const complexity =
    blockers >= 3
      ? 'High complexity file'
      : blockers >= 1 || material >= 3
      ? 'Moderately complex file'
      : 'Lower complexity file'

  const summary =
    blockers > 0
      ? `${blockers} blocking item${blockers > 1 ? 's' : ''} must be resolved before title can insure.`
      : material > 0
      ? `${material} material item${material > 1 ? 's' : ''} to address before closing.`
      : 'Review informational items with your title officer.'

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3 gap-2">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
          File Complexity
        </h3>
        <span className="text-xs text-gray-400 truncate max-w-[280px] text-right">
          {facts?.property?.address
            ? `${facts.property.address}${facts.property.apn ? ` · ${facts.property.apn}` : ''}`
            : fileName}
        </span>
      </div>

      {/* Counts */}
      <div className="flex items-center gap-6 mb-3 flex-wrap">
        {blockers > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
            <span className="text-2xl font-bold text-gray-900 tabular-nums">{blockers}</span>
            <span className="text-xs text-gray-400">{blockers === 1 ? 'Blocker' : 'Blockers'}</span>
          </div>
        )}
        {material > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <span className="text-2xl font-bold text-gray-900 tabular-nums">{material}</span>
            <span className="text-xs text-gray-400">Material</span>
          </div>
        )}
        {informational > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-400 shrink-0" />
            <span className="text-2xl font-bold text-gray-900 tabular-nums">{informational}</span>
            <span className="text-xs text-gray-400">Info</span>
          </div>
        )}
      </div>

      {/* Stacked progress bar */}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex">
        {blockers > 0 && <div className="bg-red-500 h-full" style={{ width: `${pBlocker}%` }} />}
        {material > 0 && <div className="bg-amber-400 h-full" style={{ width: `${pMaterial}%` }} />}
        {informational > 0 && (
          <div className="bg-blue-300 h-full" style={{ width: `${pInfo}%` }} />
        )}
      </div>

      <p className="text-xs text-gray-500 mt-2">
        <span className="font-medium text-gray-700">{complexity}.</span> {summary}
      </p>
    </div>
  )
}
