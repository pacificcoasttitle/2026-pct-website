'use client'

import type { ReactNode } from 'react'
import { KV } from './TessaShared'

function parseDocStatus(content: string): {
  description: string | null
  rows: { label: string; value: ReactNode }[]
} {
  const kv: Record<string, string> = {}
  for (const line of content.split('\n')) {
    const m = line.trim().match(/^-?\s*([^:]+):\s*(.+)$/)
    if (m) kv[m[1].trim().toLowerCase()] = m[2].trim()
  }

  // Description from the opening sentence
  const firstSentence = content.split(/\.\s/)[0]?.trim() ?? ''
  const description =
    firstSentence.toLowerCase().startsWith('this is') ? firstSentence + '.' : null

  // Ordered field map
  const fieldMap: [string[], string][] = [
    [['report type', 'type'], 'Report Type'],
    [['effective date', 'date'], 'Effective Date'],
    [['title order', 'order no', 'order number', 'title order no'], 'Title Order No.'],
    [['underwriter', 'underwriting company'], 'Underwriter'],
    [['title officer', 'officer'], 'Title Officer'],
    [['scope'], 'Scope'],
    [['pages', 'page count'], 'Pages'],
    [['status', 'completeness'], 'Status'],
  ]

  const rows: { label: string; value: ReactNode }[] = []
  const shown = new Set<string>()

  for (const [keys, label] of fieldMap) {
    for (const k of keys) {
      const v = kv[k]
      if (v && v !== 'Not stated' && v !== 'Unclear') {
        rows.push({ label, value: v })
        keys.forEach((key) => shown.add(key))
        break
      }
    }
  }

  // Remaining fields not already shown
  for (const [key, val] of Object.entries(kv)) {
    if (!shown.has(key) && val && val !== 'Not stated' && val !== 'Unclear') {
      rows.push({ label: key.charAt(0).toUpperCase() + key.slice(1), value: val })
    }
  }

  return { description, rows }
}

export function TessaDocStatusContent({ content }: { content: string }) {
  const { description, rows } = parseDocStatus(content)

  if (rows.length === 0 && !description) {
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
    <div className="pt-4">
      {description && (
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">{description}</p>
      )}
      {rows.length > 0 && (
        <div className="divide-y divide-gray-100">
          {rows.map(({ label, value }, i) => (
            <KV key={i} label={label}>
              {value}
            </KV>
          ))}
        </div>
      )}
    </div>
  )
}
