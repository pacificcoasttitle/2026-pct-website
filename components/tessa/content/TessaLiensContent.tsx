'use client'

import { KV, Dollar, Recording } from './TessaShared'
import type { PrelimFacts, DeedOfTrust } from '@/lib/tessa/tessa-types'

// ── Generic lien parsed from AI text (when facts aren't available) ────────────
interface LienBlock {
  priority: string
  type: string
  beneficiary: string
  recording: string
  amount: string
  status: string
  action: string
  foreclosure: string
}

function parseLienBlocks(content: string): LienBlock[] {
  const blocks: LienBlock[] = []
  // Each lien block starts with "- Priority:"
  const chunks = content.split(/(?=^-\s*Priority:)/im)
  for (const chunk of chunks) {
    if (!chunk.trim()) continue
    const kv: Record<string, string> = {}
    for (const line of chunk.split('\n')) {
      const m = line.trim().match(/^-\s*([^:]+):\s*(.+)$/)
      if (m) kv[m[1].trim().toLowerCase()] = m[2].trim()
    }
    if (kv['priority'] || kv['type']) {
      blocks.push({
        priority: kv['priority'] || 'Unclear',
        type: kv['type'] || 'Lien',
        beneficiary: kv['beneficiary/creditor'] || kv['beneficiary'] || kv['creditor'] || 'Not stated',
        recording: kv['recording ref'] || kv['recording'] || 'Not stated',
        amount: kv['amount'] || 'Not stated',
        status: kv['status'] || 'Open',
        action: kv['action'] || '',
        foreclosure: kv['foreclosure/default info'] || kv['foreclosure'] || 'None stated',
      })
    }
  }
  return blocks
}

const ORDINAL = ['1st', '2nd', '3rd', '4th', '5th', '6th']

// ── Structured DOT card (uses facts ground truth) ─────────────────────────────
function DotCard({ dot }: { dot: DeedOfTrust }) {
  const posLabel = ORDINAL[dot.position - 1] ?? `${dot.position}th`
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-red-50 px-4 py-3 flex items-center justify-between border-b border-red-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
            {posLabel} POSITION
          </span>
          <span className="text-sm font-semibold text-gray-900">Deed of Trust</span>
        </div>
        <span className="text-xs font-mono text-gray-400">Item #{dot.item_no}</span>
      </div>

      {/* Key-value rows */}
      <div className="p-4 divide-y divide-gray-100">
        {dot.amount && (
          <KV label="Amount">
            <Dollar amount={dot.amount} size="large" />
          </KV>
        )}
        {dot.beneficiary && (
          <KV label={dot.assignments.length > 0 ? 'Current Beneficiary' : 'Beneficiary'}>
            <span className="font-medium">{dot.beneficiary}</span>
          </KV>
        )}
        {dot.trustor && <KV label="Trustor">{dot.trustor}</KV>}
        {dot.trustee && <KV label="Trustee">{dot.trustee}</KV>}
        {dot.dated && <KV label="Dated">{dot.dated}</KV>}
        {dot.recording_no && (
          <KV label="Recording">
            <Recording num={dot.recording_no} date={dot.recording_date ?? undefined} />
          </KV>
        )}
      </div>

      {/* Chain of title */}
      {(dot.substitutions.length > 0 || dot.assignments.length > 0) && (
        <div className="px-4 pb-3 pt-1">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
            Chain of Title
          </p>
          <div className="relative pl-4 border-l-2 border-gray-200 space-y-2">
            {dot.substitutions.map((s, i) => (
              <div key={`sub-${i}`} className="relative">
                <span className="absolute -left-[1.3rem] top-1 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white" />
                <div className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">Substitution of Trustee</span> →{' '}
                  {s.new_trustee}
                  {s.recording_no && (
                    <>
                      <br />
                      <Recording num={s.recording_no} />
                    </>
                  )}
                </div>
              </div>
            ))}
            {dot.assignments.map((a, i) => (
              <div key={`asgn-${i}`} className="relative">
                <span className="absolute -left-[1.3rem] top-1 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white" />
                <div className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">Assignment</span> → {a.assignee}
                  {a.recording_no && (
                    <>
                      <br />
                      <Recording num={a.recording_no} />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Foreclosure alert */}
      {(dot.has_notice_of_trustee_sale || dot.has_notice_of_default) && (
        <div className="bg-red-100 px-4 py-2.5 border-t border-red-200 flex items-center gap-2">
          <span className="text-xs text-red-700 font-bold">🚨 FORECLOSURE ACTION ON RECORD</span>
          {dot.sale_date && (
            <span className="text-xs text-red-700"> — Sale Date: {dot.sale_date}</span>
          )}
        </div>
      )}

      {/* Action bar */}
      <div className="bg-orange-50 px-4 py-2.5 border-t border-orange-100 flex items-start gap-2">
        <span className="text-xs text-orange-700 font-semibold shrink-0">Action:</span>
        <span className="text-xs text-orange-800">
          Obtain payoff demand and record reconveyance
        </span>
      </div>
    </div>
  )
}

// ── Generic lien card (fallback parsed from AI text) ──────────────────────────
function GenericLienCard({ lien }: { lien: LienBlock }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-2">
          {lien.priority !== 'Unclear' && (
            <span className="text-xs font-bold text-gray-700 bg-gray-200 px-2 py-0.5 rounded">
              {lien.priority.toUpperCase()} POSITION
            </span>
          )}
          <span className="text-sm font-semibold text-gray-900">{lien.type}</span>
        </div>
        {lien.recording !== 'Not stated' && (
          <span className="text-xs font-mono text-gray-400">{lien.recording}</span>
        )}
      </div>
      <div className="p-4 divide-y divide-gray-100">
        {lien.amount !== 'Not stated' && (
          <KV label="Amount">
            <Dollar amount={lien.amount} size="large" />
          </KV>
        )}
        {lien.beneficiary !== 'Not stated' && (
          <KV label="Beneficiary / Creditor">
            <span className="font-medium">{lien.beneficiary}</span>
          </KV>
        )}
        <KV label="Status">
          <span
            className={
              lien.status?.toLowerCase() === 'open' ? 'text-amber-600 font-medium' : 'text-gray-600'
            }
          >
            {lien.status}
          </span>
        </KV>
        {lien.foreclosure && lien.foreclosure !== 'None stated' && (
          <KV label="Foreclosure Info">
            <span className="text-red-600 font-medium">{lien.foreclosure}</span>
          </KV>
        )}
      </div>
      {lien.action && (
        <div className="bg-orange-50 px-4 py-2.5 border-t border-orange-100 flex items-start gap-2">
          <span className="text-xs text-orange-700 font-semibold shrink-0">Action:</span>
          <span className="text-xs text-orange-800">{lien.action}</span>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function TessaLiensContent({
  content,
  facts,
}: {
  content: string
  facts?: PrelimFacts | null
}) {
  const dots = facts?.deeds_of_trust ?? []
  const hoaLiens = facts?.hoa_liens ?? []
  const lienBlocks = dots.length === 0 ? parseLienBlocks(content) : []

  const noLiens = content.toLowerCase().includes('no liens or judgments found')
  if (noLiens && dots.length === 0 && hoaLiens.length === 0 && lienBlocks.length === 0) {
    return (
      <p className="pt-4 text-sm text-gray-500 italic">
        No liens or judgments found in the critical section.
      </p>
    )
  }

  // Total from structured DOTs
  const totalAmount = dots.reduce((sum, d) => {
    if (!d.amount) return sum
    const n = parseFloat(d.amount.replace(/[$,]/g, ''))
    return isNaN(n) ? sum : sum + n
  }, 0)

  return (
    <div className="pt-4 space-y-4">
      {/* Structured DOT cards */}
      {dots.map((dot) => (
        <DotCard key={dot.item_no} dot={dot} />
      ))}

      {/* Generic AI-parsed lien cards (fallback) */}
      {lienBlocks.map((lien, i) => (
        <GenericLienCard key={i} lien={lien} />
      ))}

      {/* HOA liens */}
      {hoaLiens.map((lien) => (
        <div key={lien.item_no} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-amber-50 px-4 py-3 flex items-center justify-between border-b border-amber-100">
            <span className="text-sm font-semibold text-gray-900">HOA Assessment Lien</span>
            <span className="text-xs font-mono text-gray-400">Item #{lien.item_no}</span>
          </div>
          <div className="p-4 divide-y divide-gray-100">
            {lien.amount && (
              <KV label="Amount">
                <Dollar amount={lien.amount} size="large" />
              </KV>
            )}
            {lien.association_name && <KV label="Association">{lien.association_name}</KV>}
            <KV label="Status">{lien.status}</KV>
            {lien.recording_no && (
              <KV label="Recording">
                <Recording num={lien.recording_no} date={lien.recording_date ?? undefined} />
              </KV>
            )}
          </div>
          <div className="bg-orange-50 px-4 py-2.5 border-t border-orange-100 flex items-start gap-2">
            <span className="text-xs text-orange-700 font-semibold shrink-0">Action:</span>
            <span className="text-xs text-orange-800">
              Obtain payoff demand or demand package from HOA
            </span>
          </div>
        </div>
      ))}

      {/* Totals bar */}
      {totalAmount > 0 && (
        <div className="bg-gray-900 text-white rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Total Existing Liens
          </span>
          <span className="text-lg font-bold tabular-nums">
            ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      )}
    </div>
  )
}
