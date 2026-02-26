'use client'

interface Risk {
  severity: 'blocker' | 'material'
  text: string
}

function parseSummary(content: string): { risks: Risk[]; narrative: string } {
  const risks: Risk[] = []

  // Find the TOP CLOSING RISKS block (numbered list)
  const riskBlockMatch = content.match(/TOP CLOSING RISKS[\s\S]*?(?=\n{2,}[A-Z]|\n{2,}This|\n{2,}Title|\n{2,}The\s|$)/i)
  if (riskBlockMatch) {
    for (const line of riskBlockMatch[0].split('\n')) {
      const m = line.match(/^\s*-?\s*\d+[.)]\s*(.+)/)
      if (m) {
        const text = m[1].replace(/^[🔴🟡]\s*/, '').trim()
        const sev: 'blocker' | 'material' =
          text.toLowerCase().includes('block') || text.toLowerCase().includes('soi')
            ? 'blocker'
            : 'material'
        risks.push({ severity: sev, text })
      }
    }
  }

  // Narrative: paragraph(s) after the risks block that are plain sentences
  const afterRisks = content
    .replace(/TOP CLOSING RISKS[\s\S]*?(?=\n{2,}[A-Z]|\n{2,}This|\n{2,}Title|\n{2,}The\s)/i, '')
    .trim()

  // Find first substantive paragraph (>50 chars, not a bullet)
  const narrative =
    afterRisks
      .split(/\n\n+/)
      .find((p) => p.trim().length > 50 && !p.trim().startsWith('-') && !p.trim().startsWith('1)')) ||
    afterRisks
      .split('\n')
      .filter((l) => l.trim().length > 50 && !l.trim().startsWith('-'))
      .join(' ') ||
    ''

  return { risks, narrative: narrative.trim() }
}

export function TessaSummaryContent({ content }: { content: string }) {
  const { risks, narrative } = parseSummary(content)

  // Highlight dollar amounts in narrative text
  function renderNarrative(text: string) {
    const parts = text.split(/(\$[\d,]+(?:\.\d{2})?)/)
    return parts.map((part, i) =>
      part.match(/^\$[\d,]/) ? (
        <span key={i} className="font-semibold text-gray-900">
          {part}
        </span>
      ) : (
        part
      )
    )
  }

  // Fallback: no structured content found
  if (!risks.length && !narrative) {
    return (
      <div
        className="pt-4 prose prose-sm max-w-none text-gray-700"
        dangerouslySetInnerHTML={{
          __html: content
            .replace(/\n/g, '<br/>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(
              /(\$[\d,]+(?:\.\d{2})?)/g,
              '<span class="font-semibold text-gray-900">$1</span>'
            ),
        }}
      />
    )
  }

  return (
    <div className="pt-4 space-y-4">
      {/* Top Closing Risks */}
      {risks.length > 0 && (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            ⚡ Top Closing Risks
          </h4>
          <div className="space-y-2">
            {risks.map((r, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <span className="shrink-0 mt-1.5">
                  <span
                    className={`w-2 h-2 rounded-full inline-block ${
                      r.severity === 'blocker' ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                  />
                </span>
                <span className="text-gray-700">{r.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Narrative paragraph */}
      {narrative && (
        <p className="text-sm text-gray-600 leading-relaxed">{renderNarrative(narrative)}</p>
      )}
    </div>
  )
}
