'use client'

import { SeverityBadgeInline } from './TessaShared'

type Severity = 'blocker' | 'material' | 'informational'

interface ReqItem {
  item: string
  title: string
  details: string
  nextStep: string
  owner: string
  severity: Severity
  whyItMatters: string
  subsection: string
}

function parseRequirements(content: string): { actionList: string[]; items: ReqItem[] } {
  const lines = content.split('\n')
  const actionList: string[] = []
  const items: ReqItem[] = []

  type Mode = 'none' | 'actionList' | 'priority' | 'company' | 'clearing'
  let mode: Mode = 'none'
  let cur: Partial<ReqItem> | null = null

  const flush = () => {
    if (cur?.title) {
      items.push({
        item: cur.item ?? '',
        title: cur.title,
        details: cur.details ?? '',
        nextStep: cur.nextStep ?? '',
        owner: cur.owner ?? '',
        severity: cur.severity ?? 'material',
        whyItMatters: cur.whyItMatters ?? '',
        subsection: cur.subsection ?? 'company',
      })
    }
    cur = null
  }

  for (const raw of lines) {
    const line = raw.trim()

    // Section header detection
    if (/^ACTION LIST/i.test(line)) { flush(); mode = 'actionList'; continue }
    if (/^PRIORITY SCHEDULE A/i.test(line)) { flush(); mode = 'priority'; continue }
    if (/^REQUIREMENTS?\s*\(Company/i.test(line)) { flush(); mode = 'company'; continue }
    if (/^CLEARING ITEMS/i.test(line)) { flush(); mode = 'clearing'; continue }
    if (!line || line.startsWith('---')) continue

    // Action list items (stop if we see an "Item #" line)
    if (mode === 'actionList') {
      if (/^-\s*Items?\s*#/i.test(line)) {
        mode = 'company'
      } else if (/^-\s/.test(line)) {
        actionList.push(line.replace(/^-\s*/, ''))
        continue
      }
    }

    // Item header: "- Item #N: Title" or "- Items #N & #M: Title"
    const itemMatch = line.match(
      /^-\s*(Items?\s*#[\d\s,&–\-]+(?:#[\d]+)?(?:\s*and\s*#[\d]+)?)\s*:\s*(.+)$/i
    )
    if (itemMatch && mode !== 'actionList') {
      flush()
      const subsection =
        mode === 'priority' ? 'priority' : mode === 'clearing' ? 'clearing' : 'company'
      cur = {
        item: itemMatch[1].trim(),
        title: itemMatch[2].trim(),
        details: '',
        nextStep: '',
        owner: '',
        severity: 'material',
        whyItMatters: '',
        subsection,
      }
      continue
    }

    // Sub-field lines inside an item
    if (cur) {
      const kv = line.match(/^-\s*(Details|Next step|Owner|Closing impact|Why it matters):\s*(.+)$/i)
      if (kv) {
        const key = kv[1].toLowerCase()
        const val = kv[2].trim()
        if (key === 'details') cur.details = val
        else if (key === 'next step') cur.nextStep = val
        else if (key === 'owner') cur.owner = val
        else if (key === 'closing impact') {
          const v = val.toLowerCase()
          cur.severity = v.startsWith('block')
            ? 'blocker'
            : v.startsWith('info')
            ? 'informational'
            : 'material'
        } else if (key === 'why it matters') cur.whyItMatters = val
      }
    }
  }
  flush()

  return { actionList, items }
}

const borderFor: Record<Severity, string> = {
  blocker: 'border-l-red-500',
  material: 'border-l-amber-400',
  informational: 'border-l-blue-300',
}

export function TessaRequirementsContent({ content }: { content: string }) {
  const { actionList, items } = parseRequirements(content)
  const blockers = items.filter((i) => i.severity === 'blocker').length
  const material = items.filter((i) => i.severity === 'material').length
  const informational = items.filter((i) => i.severity === 'informational').length

  if (!items.length && !actionList.length) {
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
    <div className="space-y-4 pt-4">
      {/* Severity count strip */}
      {blockers + material + informational > 0 && (
        <div className="flex flex-wrap gap-4 mb-1">
          {blockers > 0 && (
            <span className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              {blockers} Blocker{blockers > 1 ? 's' : ''}
            </span>
          )}
          {material > 0 && (
            <span className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {material} Material
            </span>
          )}
          {informational > 0 && (
            <span className="flex items-center gap-1.5 text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              {informational} Info
            </span>
          )}
        </div>
      )}

      {/* Action list */}
      {actionList.length > 0 && (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            📋 Action List
          </p>
          <ol className="space-y-1">
            {actionList.map((a, i) => (
              <li key={i} className="flex gap-2 text-xs text-slate-700">
                <span className="text-slate-400 shrink-0">{i + 1}.</span>
                <span>{a}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Requirement cards */}
      {items.map((req, i) => (
        <div
          key={i}
          className={`border-l-4 ${borderFor[req.severity] ?? 'border-l-gray-300'} bg-gray-50 rounded-r-lg p-5`}
        >
          <div className="flex items-start justify-between mb-2 gap-2">
            <SeverityBadgeInline severity={req.severity} />
            <span className="text-xs font-mono text-gray-400 shrink-0">{req.item}</span>
          </div>
          <h4 className="font-semibold text-gray-900 text-sm mb-1">{req.title}</h4>
          {req.details && req.details !== 'Not stated' && req.details !== 'Unclear' && (
            <p className="text-xs text-gray-500 leading-relaxed mb-3">{req.details}</p>
          )}
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
            {req.nextStep && req.nextStep !== 'Not stated' && (
              <span>
                <span className="text-gray-400">Next step:</span>{' '}
                <span className="text-gray-700 font-medium">{req.nextStep}</span>
              </span>
            )}
            {req.owner && req.owner !== 'Not stated' && (
              <span>
                <span className="text-gray-400">Owner:</span>{' '}
                <span className="text-gray-600">{req.owner}</span>
              </span>
            )}
          </div>
          {req.whyItMatters && req.whyItMatters !== 'Not stated' && (
            <p className="mt-2 text-xs text-gray-400 italic">{req.whyItMatters}</p>
          )}
        </div>
      ))}

      {/* Closing warning */}
      <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm font-semibold text-amber-800 mb-1">⚠️ Closing Warning</p>
        <p className="text-sm text-amber-700">
          Missing or incomplete requirements will{' '}
          <strong>stop this transaction from closing</strong>. Resolve each item with the title
          officer before funding or recording.
        </p>
      </div>
    </div>
  )
}
