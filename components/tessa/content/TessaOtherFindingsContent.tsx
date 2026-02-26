'use client'

import { Recording } from './TessaShared'

interface Finding {
  type: string
  details: string
  impact: string
  action: string
  recording?: string
}

function parseFindings(content: string): Finding[] {
  if (content.toLowerCase().includes('no other significant findings')) return []

  const findings: Finding[] = []
  // Each finding starts with "- Type:"
  const chunks = content.split(/(?=^-\s*Type:)/im)
  for (const chunk of chunks) {
    if (!chunk.trim()) continue
    const kv: Record<string, string> = {}
    for (const line of chunk.split('\n')) {
      const m = line.trim().match(/^-\s*([^:]+):\s*(.+)$/)
      if (m) kv[m[1].trim().toLowerCase()] = m[2].trim()
    }
    if (kv['type'] || kv['details']) {
      findings.push({
        type: kv['type'] || 'Finding',
        details: kv['details'] || '',
        impact: kv['impact'] || 'Low',
        action: kv['action'] || '',
        recording: kv['recording ref'] || kv['recording'] || undefined,
      })
    }
  }
  return findings
}

const ICONS: Array<[string, string]> = [
  ['ucc', '⚡'],
  ['solar', '☀️'],
  ['judgment', '⚖️'],
  ['uninsured', '📋'],
  ['redevelopment', '🏛️'],
  ['easement', '📍'],
  ['covenant', '📜'],
  ['ccr', '📜'],
  ['restriction', '📜'],
  ['map', '🗺️'],
  ['mineral', '⛏️'],
  ['lease', '📄'],
]

function icon(type: string) {
  const t = type.toLowerCase()
  return ICONS.find(([k]) => t.includes(k))?.[1] ?? '📄'
}

const impactCls: Record<string, string> = {
  high: 'text-red-600 bg-red-50 border-red-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  low: 'text-green-700 bg-green-50 border-green-200',
}

export function TessaOtherFindingsContent({ content }: { content: string }) {
  const findings = parseFindings(content)

  if (findings.length === 0) {
    // Check for "none" message
    if (content.toLowerCase().includes('no other significant')) {
      return (
        <p className="pt-4 text-sm text-gray-500 italic">
          No other significant findings in the critical section.
        </p>
      )
    }
    // Fall back to formatted text
    return (
      <div
        className="pt-4 prose prose-sm max-w-none text-gray-700"
        dangerouslySetInnerHTML={{
          __html: content
            .replace(/\n/g, '<br/>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
        }}
      />
    )
  }

  return (
    <div className="pt-4 space-y-2">
      {findings.map((f, i) => {
        const impact = f.impact?.toLowerCase() || 'low'
        const colorCls = impactCls[impact] ?? impactCls.low
        return (
          <div
            key={i}
            className="border border-gray-100 rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-1 gap-2">
              <div className="flex items-center gap-2">
                <span>{icon(f.type)}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  {f.type}
                </span>
              </div>
              <span
                className={`text-xs px-1.5 py-0.5 rounded font-medium border ${colorCls} shrink-0`}
              >
                {impact.charAt(0).toUpperCase() + impact.slice(1)} impact
              </span>
            </div>
            {f.details && f.details !== 'Not stated' && (
              <p className="text-sm text-gray-700 mb-2">{f.details}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {f.recording && <Recording num={f.recording} />}
              {f.action && <span className="text-gray-500">→ {f.action}</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
