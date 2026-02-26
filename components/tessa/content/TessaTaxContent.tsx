'use client'

import { StatusBadge, Dollar } from './TessaShared'
import type { PrelimFacts, PropertyTax } from '@/lib/tessa/tessa-types'

// ── Per-parcel card ───────────────────────────────────────────────────────────
function TaxParcel({ tax }: { tax: PropertyTax }) {
  const NS = (v: string | null | undefined) =>
    v && v !== 'Not stated' && v !== 'Unclear' ? v : null

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-amber-50 px-4 py-3 border-b border-amber-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Tax ID</span>
          <span className="text-sm font-mono font-semibold text-gray-900">{tax.tax_id}</span>
        </div>
        {NS(tax.fiscal_year) && (
          <span className="text-xs text-gray-500">FY {tax.fiscal_year}</span>
        )}
      </div>

      <div className="p-4">
        {/* Installment rows */}
        <div>
          {tax.first_installment_amount && (
            <div className="flex items-center justify-between py-3.5 border-b border-gray-100">
              <div>
                <div className="text-sm font-medium text-gray-800">1st Installment</div>
                {NS(tax.first_penalty) && (
                  <div className="text-xs text-gray-400">Penalty: {tax.first_penalty}</div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Dollar amount={tax.first_installment_amount} />
                <StatusBadge status={tax.first_installment_status?.toLowerCase()} />
              </div>
            </div>
          )}
          {tax.second_installment_amount && (
            <div className="flex items-center justify-between py-3.5">
              <div>
                <div className="text-sm font-medium text-gray-800">2nd Installment</div>
                {NS(tax.second_penalty) && (
                  <div className="text-xs text-gray-400">Penalty: {tax.second_penalty}</div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Dollar amount={tax.second_installment_amount} />
                <StatusBadge status={tax.second_installment_status?.toLowerCase()} />
              </div>
            </div>
          )}
        </div>

        {/* Homeowners exemption / code area footer */}
        {(NS(tax.homeowners_exemption) || NS(tax.code_area)) && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-6 text-xs text-gray-500">
            {NS(tax.homeowners_exemption) && (
              <span>
                Homeowners Exemption:{' '}
                <span className="font-medium text-gray-700">{tax.homeowners_exemption}</span>
              </span>
            )}
            {NS(tax.code_area) && (
              <span>
                Code Area:{' '}
                <span className="font-medium font-mono text-gray-700">{tax.code_area}</span>
              </span>
            )}
          </div>
        )}

        {/* Supplemental note */}
        <div className="mt-3 bg-blue-50 rounded-lg px-3 py-2 text-xs text-blue-700 border border-blue-100">
          <span className="font-semibold">Note:</span> Supplemental taxes may be assessed upon
          change of ownership or new construction (Rev. &amp; Tax Code §75 et seq.). Prorate or
          pay at closing.
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function TessaTaxContent({
  content,
  facts,
}: {
  content: string
  facts?: PrelimFacts | null
}) {
  const taxes = facts?.taxes?.property_taxes ?? []
  const defaults = facts?.taxes?.tax_defaults ?? []
  const hasDelinquent = facts?.taxes?.has_delinquent_taxes ?? false

  // No structured data — fall back to formatted AI text
  if (taxes.length === 0) {
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
            )
            .replace(
              /(For Tax Defaults \/ Redemptions:)/gi,
              '<div class="mt-4 pt-3 border-t-2 border-red-300"><strong class="text-red-700 text-sm">🚨 $1</strong></div>'
            ),
        }}
      />
    )
  }

  return (
    <div className="pt-4 space-y-4">
      {/* Delinquent alert banner */}
      {hasDelinquent && (
        <div className="bg-red-50 border border-red-300 rounded-lg px-4 py-3 flex items-center gap-2">
          <span className="text-red-600 font-bold text-sm">🚨 Delinquent Taxes on Record</span>
          <span className="text-red-600 text-xs">— Must be paid off before closing</span>
        </div>
      )}

      {/* Parcel cards */}
      {taxes.map((tax, i) => (
        <TaxParcel key={i} tax={tax} />
      ))}

      {/* Tax default / redemption schedules */}
      {defaults.length > 0 && (
        <div className="border-2 border-red-300 rounded-lg overflow-hidden">
          <div className="bg-red-50 px-4 py-3 border-b border-red-200">
            <h4 className="text-sm font-bold text-red-800">🚨 Tax Defaults / Redemptions</h4>
          </div>
          <div className="p-4 space-y-4">
            {defaults.map((d, i) => (
              <div key={i}>
                {d.default_no && (
                  <p className="font-medium text-gray-800 text-sm mb-1">
                    Default No. {d.default_no}
                  </p>
                )}
                <p className="text-gray-600 text-xs mb-2">{d.message}</p>
                {d.redemption_schedule.length > 0 && (
                  <div className="space-y-0.5">
                    {d.redemption_schedule.map((r, j) => (
                      <div key={j} className="flex justify-between text-xs text-red-700">
                        <span>{r.by}</span>
                        <span className="font-semibold tabular-nums">{r.amount}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
