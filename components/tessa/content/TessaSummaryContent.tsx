'use client'

interface Risk {
  severity: 'blocker' | 'material'
  title: string
  explanation: string
}

function parseSummary(content: string): { risks: Risk[]; narrative: string } {
  const risks: Risk[] = []

  // ── Parse risks ──────────────────────────────────────────────
  // The AI outputs risks in various formats:
  //   1. **Risk title** — explanation
  //   - 1) **Risk title** — explanation
  //   1) Risk title — explanation
  //   - Risk title — explanation
  // We need to handle all of these and strip markdown bold markers.

  const riskBlockMatch = content.match(
    /TOP CLOSING RISKS[\s\S]*?(?=\n{2,}(?:This|Title|The\s+property|The\s+title|Overall)|$)/i
  )

  if (riskBlockMatch) {
    const riskText = riskBlockMatch[0]
    const lines = riskText.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()

      // Skip the header line itself
      if (/^TOP CLOSING RISKS/i.test(trimmed)) continue
      if (!trimmed || trimmed === '-') continue

      // Match numbered items: "1. text", "- 1) text", "1) text", "- text"
      const m = trimmed.match(
        /^[-•*]?\s*\d+[.)]\s*(.+)$|^[-•*]\s+(.+)$/
      )
      if (!m) continue

      let raw = (m[1] || m[2] || '').trim()

      // Strip leading/trailing ** bold markers
      raw = raw.replace(/\*\*/g, '')

      // Split on " — " or " - " dash separator to get title vs explanation
      const dashMatch = raw.match(/^(.+?)\s*[—–-]\s*(.+)$/)
      let title: string
      let explanation: string

      if (dashMatch) {
        title = dashMatch[1].trim()
        explanation = dashMatch[2].trim()
      } else {
        title = raw
        explanation = ''
      }

      // Determine severity from content
      const combined = (title + ' ' + explanation).toLowerCase()
      const isBlocker =
        combined.includes('block') ||
        combined.includes('soi') ||
        combined.includes('statement of information') ||
        combined.includes('will not insure') ||
        combined.includes('mandatory') ||
        combined.includes('must be completed before') ||
        combined.includes('block policy')

      risks.push({
        severity: isBlocker ? 'blocker' : 'material',
        title,
        explanation,
      })
    }
  }

  // ── Deduplicate risks ────────────────────────────────────────
  // The AI sometimes outputs the risks twice (once in the numbered list,
  // once repeated below). Deduplicate by checking if a risk title is
  // a substring of another already-added risk.
  const deduped: Risk[] = []
  const seen = new Set<string>()
  for (const risk of risks) {
    // Normalize for comparison: lowercase, strip parens/items/numbers
    const key = risk.title.toLowerCase().replace(/\(items?\s*#[\d,\s&]+\)/gi, '').trim()
    // Check if we already have a risk with substantially similar text
    const isDuplicate = [...seen].some(
      (s) => s.includes(key.slice(0, 30)) || key.includes(s.slice(0, 30))
    )
    if (!isDuplicate && key.length > 5) {
      seen.add(key)
      deduped.push(risk)
    }
  }

  // ── Parse narrative ──────────────────────────────────────────
  // The narrative is the paragraph(s) AFTER the risks block.
  // Look for sentences starting with "This is a", "Title is", "The property", etc.
  const afterRisks = content
    .replace(
      /TOP CLOSING RISKS[\s\S]*?(?=\n{2,}(?:This|Title|The\s+property|The\s+title|Overall))/i,
      ''
    )
    .trim()

  // Find substantive paragraphs (>60 chars, not bullet lines, not risk repeats)
  const paragraphs = afterRisks.split(/\n\n+/)
  let narrative = ''
  for (const p of paragraphs) {
    const cleaned = p.trim().replace(/\*\*/g, '')
    // Skip if it's a bullet list, risk header, or too short
    if (cleaned.startsWith('-') || cleaned.startsWith('•')) continue
    if (/^TOP CLOSING RISKS/i.test(cleaned)) continue
    if (/^\d+[.)]\s*\*?\*?/.test(cleaned)) continue
    if (cleaned.length < 60) continue
    narrative = cleaned
    break
  }

  // If we couldn't isolate a paragraph, try joining non-bullet lines
  if (!narrative) {
    narrative = afterRisks
      .split('\n')
      .filter(
        (l) =>
          l.trim().length > 40 &&
          !l.trim().startsWith('-') &&
          !l.trim().startsWith('•') &&
          !/^\d+[.)]/.test(l.trim()) &&
          !/TOP CLOSING RISKS/i.test(l.trim())
      )
      .map((l) => l.trim().replace(/\*\*/g, ''))
      .join(' ')
      .trim()
  }

  return { risks: deduped, narrative }
}

// ── Render helpers ────────────────────────────────────────────

function highlightDollars(text: string) {
  const parts = text.split(/(\$[\d,]+(?:\.\d{2})?\+?)/)
  return parts.map((part, i) =>
    part.match(/^\$[\d,]/) ? (
      <span key={i} className="font-semibold text-gray-900">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

// ── Component ─────────────────────────────────────────────────

export function TessaSummaryContent({ content }: { content: string }) {
  const { risks, narrative } = parseSummary(content)

  // Fallback: no structured content found at all
  if (!risks.length && !narrative) {
    // Strip markdown bold and render as clean text
    const cleaned = content
      .replace(/\*\*/g, '')
      .replace(/\n\s*\n/g, '\n\n')
      .trim()

    return (
      <div className="pt-4 space-y-3">
        {cleaned.split(/\n\n+/).map((para, i) => (
          <p key={i} className="text-sm text-gray-600 leading-relaxed">
            {highlightDollars(para)}
          </p>
        ))}
      </div>
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
          <div className="space-y-3">
            {risks.map((r, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="shrink-0 mt-1">
                  <span
                    className={`w-2.5 h-2.5 rounded-full inline-block ${
                      r.severity === 'blocker' ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                  />
                </span>
                <div>
                  <span className="font-medium text-gray-800">{highlightDollars(r.title)}</span>
                  {r.explanation && (
                    <>
                      <span className="text-gray-400"> — </span>
                      <span className="text-gray-600">{highlightDollars(r.explanation)}</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Narrative paragraph */}
      {narrative && (
        <p className="text-sm text-gray-600 leading-relaxed">
          {highlightDollars(narrative)}
        </p>
      )}
    </div>
  )
}
