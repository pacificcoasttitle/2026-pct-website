'use client'

import type { ReactNode } from 'react'
import { KV, Dollar } from './TessaShared'
import type { PrelimFacts } from '@/lib/tessa/tessa-types'

function parseKVs(content: string): Record<string, string> {
  const kvs: Record<string, string> = {}
  for (const line of content.split('\n')) {
    const m = line.trim().match(/^-\s*([^:]+):\s*(.+)$/)
    if (m) kvs[m[1].trim().toLowerCase()] = m[2].trim()
  }
  return kvs
}

const NS = (v: string | null | undefined) =>
  v && v !== 'Not stated' && v !== 'Unclear' ? v : null

export function TessaPropertyContent({
  content,
  facts,
}: {
  content: string
  facts?: PrelimFacts | null
}) {
  const kvs = parseKVs(content)
  const prop = facts?.property

  // Helper: prefer facts value, then fall back to parsed AI kvs
  const pick = (factVal: string | null | undefined, ...keys: string[]): string | null => {
    const fv = NS(factVal)
    if (fv) return fv
    for (const k of keys) {
      const v = NS(kvs[k])
      if (v) return v
    }
    return null
  }

  const address = pick(prop?.address, 'property address', 'address')
  const apn = pick(prop?.apn, 'apn')
  const effectiveDate = pick(prop?.effective_date, 'effective date')
  const loanAmount = pick(prop?.proposed_loan_amount, 'transaction details', 'proposed loan amount')
  const lender = pick(prop?.proposed_lender, 'proposed lender')
  const vesting = pick(null, 'current owner/vesting', 'current vesting', 'vesting')

  const rows: { label: string; value: ReactNode; mono?: boolean }[] = []
  if (address) rows.push({ label: 'Property Address', value: <span className="font-medium">{address}</span> })
  if (apn) rows.push({ label: 'APN', value: apn, mono: true })
  if (effectiveDate) rows.push({ label: 'Effective Date', value: effectiveDate })
  if (vesting) rows.push({ label: 'Current Vesting', value: vesting })

  // Add remaining parsed kvs (skip already shown + financial fields)
  const skipKeys = new Set([
    'property address', 'address', 'apn', 'effective date',
    'current owner/vesting', 'current vesting', 'vesting',
    'transaction details', 'proposed loan amount', 'proposed lender',
  ])
  for (const [key, val] of Object.entries(kvs)) {
    if (skipKeys.has(key)) continue
    const v = NS(val)
    if (v) rows.push({ label: key.charAt(0).toUpperCase() + key.slice(1), value: v })
  }

  if (loanAmount) rows.push({ label: 'Proposed Loan Amount', value: <Dollar amount={loanAmount} /> })
  if (lender && lender !== loanAmount) rows.push({ label: 'Proposed Lender', value: lender })

  if (rows.length === 0) {
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
      <div className="divide-y divide-gray-100">
        {rows.map(({ label, value, mono }, i) => (
          <KV key={i} label={label} mono={mono}>
            {value}
          </KV>
        ))}
      </div>
    </div>
  )
}
