'use client'

import { TessaSectionCard } from './TessaSectionCard'
import { TessaCheatSheet } from './TessaCheatSheet'
import { TessaComplexityScore } from './TessaComplexityScore'
import type { ParsedSection, PrelimFacts, CheatSheetItem } from '@/lib/tessa/tessa-types'

interface Props {
  sections: ParsedSection[]
  facts: PrelimFacts | null
  cheatSheetItems: CheatSheetItem[]
  fileName: string
  onReset: () => void
}

export function TessaPrelimResults({
  sections,
  facts,
  cheatSheetItems,
  fileName,
  onReset,
}: Props) {
  return (
    <div className="space-y-4">
      {/* File header bar */}
      <div className="flex items-center justify-between bg-gray-50 rounded-xl border border-gray-200 px-5 py-3">
        <div>
          <p className="text-xs text-gray-500">Analyzed document</p>
          <p className="font-semibold text-gray-900 text-sm">{fileName}</p>
        </div>
        <div className="text-right text-xs text-gray-400">
          <p>Tessa™ AI&nbsp;|&nbsp;v3.3.0 (Guardrails)</p>
          <p>{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Complexity score header */}
      <TessaComplexityScore sections={sections} fileName={fileName} />

      {/* Section cards — pass facts so structured renderers can use ground-truth data */}
      {sections.map((section, i) => (
        <TessaSectionCard
          key={section.title}
          section={section}
          defaultExpanded={i === 0}
          facts={facts}
        />
      ))}

      {/* Realtor cheat sheet */}
      <TessaCheatSheet items={cheatSheetItems} facts={facts} />

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
        <p className="font-semibold text-amber-800 text-sm mb-1">⚠️ Important Disclaimer</p>
        <p className="text-sm text-amber-700">
          This is an AI-generated <strong>summary</strong> of your Preliminary Title Report for
          informational purposes only. You must read the entire preliminary title report for complete
          information. If you have questions, contact your sales representative or title officer for
          clarification and guidance.
        </p>
      </div>

      {/* Footer CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 py-3 px-5 rounded-xl border-2 border-[#f26b2b] text-[#f26b2b] font-bold text-sm hover:bg-orange-50 transition-colors"
        >
          📄 Analyze New File
        </button>
        <a
          href="/contact"
          className="flex-1 py-3 px-5 rounded-xl bg-gray-900 text-white font-bold text-sm text-center hover:bg-gray-700 transition-colors"
        >
          📞 Talk to a Title Officer
        </a>
      </div>
    </div>
  )
}
