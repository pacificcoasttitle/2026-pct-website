// ============================================================
// TESSA™ Section Parser
// Splits the AI's markdown response into 7 structured sections.
// ============================================================

import type { ParsedSection } from './tessa-types'

const SECTION_CONFIG: Record<
  string,
  { icon: string; colorClass: string; borderColor: string; order: number; preview: string }
> = {
  'TITLE REQUIREMENTS': {
    icon: '✅',
    colorClass: 'text-green-700',
    borderColor: '#059669',
    order: 1,
    preview: 'Action items needed to close',
  },
  SUMMARY: {
    icon: '📋',
    colorClass: 'text-blue-700',
    borderColor: '#2563eb',
    order: 2,
    preview: 'Overview and top closing risks',
  },
  'PROPERTY INFORMATION': {
    icon: '🏠',
    colorClass: 'text-purple-700',
    borderColor: '#7c3aed',
    order: 3,
    preview: 'Address, APN, and vesting details',
  },
  'LIENS AND JUDGMENTS': {
    icon: '🚨',
    colorClass: 'text-red-700',
    borderColor: '#dc2626',
    order: 4,
    preview: 'Outstanding debts and encumbrances',
  },
  'TAXES AND ASSESSMENTS': {
    icon: '💰',
    colorClass: 'text-amber-700',
    borderColor: '#d97706',
    order: 5,
    preview: 'Property tax status and amounts due',
  },
  'OTHER FINDINGS': {
    icon: '📄',
    colorClass: 'text-gray-700',
    borderColor: '#6b7280',
    order: 6,
    preview: 'Easements, restrictions, and exceptions',
  },
  'DOCUMENT STATUS': {
    icon: 'ℹ️',
    colorClass: 'text-teal-700',
    borderColor: '#0891b2',
    order: 7,
    preview: 'Report type and effective date',
  },
}

function getPreview(content: string, defaultPreview: string): string {
  const cleaned = content.replace(/\*\*/g, '').replace(/[-•*]/g, '').trim()
  const firstLine = cleaned.split('\n')[0].trim()
  if (firstLine.length > 75) return firstLine.substring(0, 75) + '...'
  return firstLine || defaultPreview
}

function countItems(content: string): number {
  if (!content) return 0
  const nums = new Set<string>()
  const lines = content.split(/\n/)
  for (const line of lines) {
    if (!/(^\s*[-•*]|\bItem\b|\bItems\b)/i.test(line)) continue
    const rx = /#\s*(\d{1,3})/g
    let m: RegExpExecArray | null
    while ((m = rx.exec(line)) !== null) nums.add(m[1])
  }
  return nums.size
}

export function parsePrelimResponse(response: string): ParsedSection[] {
  const sections: ParsedSection[] = []
  const sectionRegex = /\*\*([A-Z][A-Z\s]+)\*\*([\s\S]*?)(?=\*\*[A-Z][A-Z\s]+\*\*|$)/g
  let match: RegExpExecArray | null

  while ((match = sectionRegex.exec(response)) !== null) {
    const title = match[1].trim()
    const content = match[2].trim()
    const config = SECTION_CONFIG[title]
    if (config) {
      sections.push({
        title,
        content,
        icon: config.icon,
        colorClass: config.colorClass,
        borderColor: config.borderColor,
        itemCount: countItems(content),
        preview: getPreview(content, config.preview),
        order: config.order,
      })
    }
  }

  // Sort by defined order
  sections.sort((a, b) => a.order - b.order)
  return sections
}
