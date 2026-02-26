"use client"

import { useState, useCallback } from "react"
import { Copy, Check, ChevronDown, ChevronUp, Printer, ExternalLink, AlertTriangle } from "lucide-react"
import {
  calcParentChild,
  fmt, fmtDec, parseCurrency,
  PARENT_CHILD_EXCLUSION_2025,
  type ParentChildResult,
} from "@/lib/prop19/calculations"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Prop19ParentChildInitialValues {
  assessed?: string
  market?: string
  occupy?: boolean
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function SectionCard({ step, title, subtitle, children }: {
  step: string
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-1">
        <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          {step}
        </span>
        <h3 className="text-lg font-bold text-secondary">{title}</h3>
      </div>
      {subtitle && <p className="text-sm text-gray-500 mb-5 ml-10">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      <div>{children}</div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Prop19ParentChildCalc({ initial = {} }: { initial?: Prop19ParentChildInitialValues }) {
  const [assessedRaw, setAssessedRaw] = useState(initial.assessed ?? "")
  const [marketRaw, setMarketRaw] = useState(initial.market ?? "")
  const [childWillOccupy, setChildWillOccupy] = useState<boolean | null>(
    initial.occupy !== undefined ? initial.occupy : null,
  )
  const [showExplainer, setShowExplainer] = useState(false)
  const [copied, setCopied] = useState(false)

  const assessed = parseCurrency(assessedRaw)
  const market = parseCurrency(marketRaw)
  const hasAll = assessed > 0 && market > 0 && childWillOccupy !== null
  const result: ParentChildResult | null = hasAll
    ? calcParentChild(assessed, market, childWillOccupy!)
    : null

  const handleCurrency = (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/[^0-9]/g, "")
      if (!digits) { setter(""); return }
      setter(parseInt(digits, 10).toLocaleString("en-US"))
    }

  const handleCopyLink = useCallback(async () => {
    const params = new URLSearchParams({ mode: "parent-child" })
    if (assessed) params.set("assessed", String(assessed))
    if (market) params.set("market", String(market))
    if (childWillOccupy !== null) params.set("occupy", childWillOccupy ? "yes" : "no")
    const url = `${window.location.origin}${window.location.pathname}?${params}`
    window.history.replaceState({}, "", `?${params}`)
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }, [assessed, market, childWillOccupy])

  const handlePrint = useCallback(() => {
    if (!result) return
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Prop 19 Parent-Child Analysis — Pacific Coast Title</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 680px; margin: 0 auto; color: #1a1a1a; }
    h1 { color: #03374f; border-bottom: 3px solid #f26b2b; padding-bottom: 10px; font-size: 22px; }
    h2 { color: #03374f; font-size: 15px; margin-top: 20px; margin-bottom: 6px; }
    .card { background: #f5f5f5; padding: 14px 18px; border-radius: 8px; margin: 10px 0; }
    .savings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 14px 0; }
    .saving-box { background: #03374f; color: white; padding: 14px; border-radius: 8px; }
    .saving-box p { color: rgba(255,255,255,0.6); font-size: 11px; margin: 0 0 4px; }
    .saving-box span { color: #f26b2b; font-size: 22px; font-weight: bold; }
    .green { color: #16a34a; font-weight: bold; }
    .red { color: #dc2626; font-weight: bold; }
    .disclaimer { font-size: 11px; color: #888; margin-top: 28px; padding-top: 14px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
<div style="text-align:center;margin-bottom:28px;">
  <img src="https://pct.com/assets/media/general/logo2-dark.png" alt="Pacific Coast Title" style="height:44px;">
</div>
<h1>Prop 19 — Parent-Child Inheritance Analysis</h1>
<div class="card">
  <p><strong>Parent's Assessed Value:</strong> $${fmt(assessed)}</p>
  <p><strong>Current Market Value:</strong> $${fmt(market)}</p>
  <p><strong>Child Primary Residence:</strong> ${childWillOccupy ? "Yes — exclusion applies" : "No — full reassessment"}</p>
  <p><strong>Exclusion Limit (2025–2027):</strong> $${fmt(assessed)} + $${fmt(PARENT_CHILD_EXCLUSION_2025)} = $${fmt(result.exclusionLimit)}</p>
  <p><strong>New Taxable Value:</strong> $${fmt(result.newTaxableValue)}</p>
</div>
${result.eligible ? `
<div class="savings-grid">
  <div class="saving-box"><p>Annual Savings</p><span>$${fmt(result.annualSavings)}</span></div>
  <div class="saving-box"><p>Monthly Savings</p><span>$${fmt(result.monthlySavings)}</span></div>
  <div class="saving-box"><p>10-Year Savings</p><span>$${fmt(result.savings10yr)}</span></div>
  <div class="saving-box"><p>20-Year Savings</p><span>$${fmt(result.savings20yr)}</span></div>
</div>
<div class="card">
  <p>Without Prop 19 exclusion: <span class="red">$${fmtDec(result.taxWithoutExclusion)}/yr</span></p>
  <p>With Prop 19 exclusion: <span class="green">$${fmtDec(result.taxWithExclusion)}/yr</span></p>
</div>` : `
<div class="card" style="border-left:4px solid #dc2626;">
  <p style="color:#dc2626;font-weight:bold;">No Prop 19 Exclusion — Full Reassessment</p>
  <p>Without primary residence use, the property will be fully reassessed to market value of $${fmt(market)}.</p>
  <p>Estimated annual tax: <span class="red">$${fmtDec(result.taxWithoutExclusion)}/yr</span></p>
</div>`}
<h2>📄 Filing Information</h2>
<div class="card">
  <p><strong>BOE Form:</strong> BOE-19-P (Claim for Parent-Child Transfer Exclusion)</p>
  <p><strong>Filing Deadline:</strong> Within 3 years of the date of transfer/death</p>
  <p><strong>Child must:</strong> Occupy home within 1 year and file for Homeowners' Exemption</p>
  <p><strong>File With:</strong> County Assessor where the property is located</p>
  <p><strong>BOE Website:</strong> boe.ca.gov/prop19</p>
</div>
<div class="disclaimer">
  <strong>Disclaimer:</strong> Estimates based on Prop 19 rules as of 2025–2027. Actual property tax rates vary by county. This is not tax or legal advice. Consult with a qualified California tax advisor, estate attorney, or county assessor. PCT does not provide tax advice.<br><br>
  Generated: ${new Date().toLocaleDateString()} · Pacific Coast Title Company · (866) 724-1050
</div>
</body></html>`)
    win.document.close()
    win.print()
  }, [result, assessed, market, childWillOccupy])

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Explainer */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-sm text-blue-900">
        <p className="font-bold mb-2">How Prop 19 Changed Inheritance Rules</p>
        <p className="leading-relaxed">
          Before Prop 19, children could inherit a parent's home and keep the parent's low assessed value regardless of
          price or use. Prop 19 changed this: the exclusion now <strong>only applies if the child uses the home as their
          primary residence</strong>, and it's capped at the parent's assessed value plus{" "}
          <strong>${fmt(PARENT_CHILD_EXCLUSION_2025)}</strong> (the 2025–2027 limit, adjusted biennially).
        </p>
      </div>

      {/* Step 1 — Inputs */}
      <SectionCard
        step="1"
        title="Enter the Property Details"
        subtitle="Use the values from the parent's most recent property tax bill and a current appraisal or listing price."
      >
        <div className="grid md:grid-cols-2 gap-5">
          {[
            {
              label: "Parent's Current Assessed Value",
              hint: "From the parent's property tax bill — NOT the market value",
              value: assessedRaw,
              setter: setAssessedRaw,
            },
            {
              label: "Current Fair Market Value",
              hint: "What the home would sell for today (appraisal or current listing)",
              value: marketRaw,
              setter: setMarketRaw,
            },
          ].map((field) => (
            <div key={field.label}>
              <label className="block text-sm font-semibold text-gray-800 mb-1">{field.label}</label>
              <p className="text-xs text-gray-400 mb-2 leading-snug">{field.hint}</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg select-none">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={field.value}
                  onChange={handleCurrency(field.setter)}
                  placeholder="0"
                  className="w-full pl-8 pr-4 py-3 text-lg font-bold border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-colors placeholder:text-gray-300"
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Step 2 — Primary Residence */}
      <SectionCard
        step="2"
        title="Will the Child Use This as Their Primary Residence?"
        subtitle="This is the single most important factor. Without primary residence use, no exclusion applies."
      >
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            {
              value: true as const,
              label: "Yes — the child will move in and make it their primary home",
              color: "green",
            },
            {
              value: false as const,
              label: "No — the child will rent it out or use it as a second home",
              color: "red",
            },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => setChildWillOccupy(opt.value)}
              className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                childWillOccupy === opt.value
                  ? opt.value
                    ? "border-green-500 bg-green-50"
                    : "border-red-400 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                childWillOccupy === opt.value
                  ? opt.value ? "border-green-500 bg-green-500" : "border-red-500 bg-red-500"
                  : "border-gray-300"
              }`}>
                {childWillOccupy === opt.value && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm font-medium text-gray-800 leading-snug">{opt.label}</span>
            </button>
          ))}
        </div>

        {childWillOccupy === true && (
          <p className="mt-3 text-xs text-green-700 bg-green-50 px-4 py-2 rounded-lg">
            <strong>Reminder:</strong> The child must file for the Homeowners' Exemption and establish primary residency
            within 1 year of the date of transfer/death.
          </p>
        )}
        {childWillOccupy === false && (
          <div className="mt-3 flex items-start gap-2 text-xs text-red-700 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              <strong>No exclusion applies.</strong> Without primary residence use, the property will be fully
              reassessed to current market value. Consider consulting an estate attorney about options.
            </p>
          </div>
        )}
      </SectionCard>

      {/* ── Results ── */}
      {result && (
        <>
          {/* Exclusion limit callout */}
          <div className={`rounded-2xl p-5 border-l-4 ${
            !result.eligible
              ? "bg-red-50 border-red-500"
              : result.isFullExclusion
              ? "bg-green-50 border-green-500"
              : "bg-amber-50 border-amber-500"
          }`}>
            <p className="font-bold text-secondary mb-1">
              {!result.eligible
                ? "❌ No Exclusion — Full Reassessment"
                : result.isFullExclusion
                ? "✅ Full Exclusion Applies"
                : "⚡ Partial Exclusion Applies"}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {!result.eligible
                ? `Without primary residence use, the home is fully reassessed to its market value of $${fmt(market)}. Estimated annual tax: $${fmtDec(result.taxWithoutExclusion)}/yr.`
                : result.isFullExclusion
                ? `The market value ($${fmt(market)}) is within the exclusion limit of $${fmt(result.exclusionLimit)} (parent's assessed value + $${fmt(PARENT_CHILD_EXCLUSION_2025)} cap). The full assessed value of $${fmt(assessed)} transfers — no adjustment needed.`
                : `The market value ($${fmt(market)}) exceeds the exclusion limit of $${fmt(result.exclusionLimit)} by $${fmt(market - result.exclusionLimit)}. That excess is added to the parent's assessed value, resulting in a new taxable value of $${fmt(result.newTaxableValue)}.`}
            </p>
          </div>

          {/* Savings card — only when eligible */}
          {result.eligible && (
            <div className="bg-secondary rounded-2xl p-6 text-white">
              <h3 className="font-bold text-white/80 text-sm uppercase tracking-wider mb-5">
                Estimated Tax Savings with Prop 19 Exclusion
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Annual savings", value: `$${fmt(result.annualSavings)}` },
                  { label: "Monthly savings", value: `$${fmt(result.monthlySavings)}` },
                  { label: "10-year savings", value: `$${fmt(result.savings10yr)}` },
                  { label: "20-year savings", value: `$${fmt(result.savings20yr)}` },
                ].map((m) => (
                  <div key={m.label} className="bg-white/10 rounded-xl p-4 text-center">
                    <p className="text-white/60 text-xs mb-1">{m.label}</p>
                    <p className="text-xl font-bold text-[#f26b2b]">{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Bar chart */}
              <div className="space-y-3 mb-5">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-white/70">Without Prop 19 (full reassessment)</span>
                    <span className="font-bold text-red-300">${fmtDec(result.taxWithoutExclusion)}/yr</span>
                  </div>
                  <div className="h-6 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400/70 rounded-full w-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-white/70">With Prop 19 exclusion</span>
                    <span className="font-bold text-green-300">${fmtDec(result.taxWithExclusion)}/yr</span>
                  </div>
                  <div className="h-6 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#f26b2b] rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${result.barPct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-sm">
                <div>
                  <p className="text-white/50 text-xs">New taxable value</p>
                  <p className="font-bold">${fmt(result.newTaxableValue)}</p>
                </div>
                <div>
                  <p className="text-white/50 text-xs">Exclusion limit (2025–2027)</p>
                  <p className="font-bold">${fmt(result.exclusionLimit)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Expandable explainer */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setShowExplainer(!showExplainer)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-secondary">📋 Full Breakdown + Filing Information</span>
              {showExplainer
                ? <ChevronUp className="w-5 h-5 text-gray-400" />
                : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {showExplainer && (
              <div className="px-6 pb-6 border-t border-gray-100">
                <div className="mt-5 space-y-2 text-sm text-gray-700">
                  <p><strong>1. Parent's Assessed Value:</strong> ${fmt(assessed)}</p>
                  <p><strong>2. Exclusion Cap (2025–2027):</strong> ${fmt(PARENT_CHILD_EXCLUSION_2025)}</p>
                  <p><strong>3. Total Exclusion Limit:</strong> ${fmt(assessed)} + ${fmt(PARENT_CHILD_EXCLUSION_2025)} = <strong>${fmt(result.exclusionLimit)}</strong></p>
                  <p><strong>4. Current Market Value:</strong> ${fmt(market)}</p>
                  <p><strong>5. Child Uses as Primary Residence:</strong> {childWillOccupy ? "Yes" : "No"}</p>
                </div>

                <div className={`mt-4 p-4 rounded-xl text-sm ${
                  !result.eligible ? "bg-red-50 text-red-800"
                  : result.isFullExclusion ? "bg-green-50 text-green-800"
                  : "bg-amber-50 text-amber-800"
                }`}>
                  {!result.eligible
                    ? "Without primary residence, there is no Prop 19 exclusion. The property is fully reassessed to market value."
                    : result.isFullExclusion
                    ? `Since $${fmt(market)} ≤ the exclusion limit of $${fmt(result.exclusionLimit)}, the parent's full assessed value of $${fmt(assessed)} transfers to the child.`
                    : `Since $${fmt(market)} exceeds the limit of $${fmt(result.exclusionLimit)}, the child's new taxable value is $${fmt(assessed)} + ($${fmt(market)} − $${fmt(result.exclusionLimit)}) = $${fmt(result.newTaxableValue)}.`}
                </div>

                <div className="mt-5 bg-gray-50 rounded-xl p-5 text-sm space-y-2">
                  <p className="font-bold text-secondary mb-3">📄 Filing Information</p>
                  <p>
                    <strong>BOE Form:</strong>{" "}
                    <span className="text-primary font-medium">BOE-19-P</span>
                    {" "}— Claim for Parent-Child Transfer Exclusion from Property Tax Reassessment
                  </p>
                  <p><strong>Filing Deadline:</strong> Within 3 years of the date of transfer or date of death</p>
                  <p><strong>Child's Requirement:</strong> Must occupy the home as primary residence within 1 year and file for the Homeowners' Exemption</p>
                  <p><strong>File With:</strong> The Assessor's office in the county where the property is located</p>
                  <p className="text-gray-500 text-xs">Note: Only one property per family can qualify at a time. The exclusion limit ($1,044,586) is adjusted every two years by the BOE.</p>
                  <a
                    href="https://boe.ca.gov/prop19/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary font-semibold mt-1 hover:underline"
                  >
                    BOE Official Prop 19 Website <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-2 bg-secondary text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-secondary/90 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "Link Copied!" : "Copy Shareable Link"}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3.5 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Results
            </button>
          </div>
        </>
      )}

      {!hasAll && (
        <div className="text-center py-10 text-gray-400 text-sm">
          Enter the property values and answer the residency question above to see the Prop 19 exclusion estimate.
        </div>
      )}
    </div>
  )
}
