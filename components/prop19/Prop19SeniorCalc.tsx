"use client"

import { useState, useCallback } from "react"
import { CheckCircle, Copy, Check, ChevronDown, ChevronUp, Printer, ExternalLink } from "lucide-react"
import {
  calcSenior,
  fmt, fmtDec, parseCurrency,
  type TimingOption, TIMING_LABELS, TIMING_MULTIPLIERS,
  type SeniorResult,
} from "@/lib/prop19/calculations"

// ─── Types ────────────────────────────────────────────────────────────────────

type EligibilityOption = "senior" | "disabled" | "disaster" | "unsure"

export interface Prop19SeniorInitialValues {
  assessed?: string
  sale?: string
  replacement?: string
  timing?: TimingOption
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
      <div className="ml-0">{children}</div>
    </div>
  )
}

function SavingsCard({ result, assessed, sale, replacement, timing }: {
  result: SeniorResult
  assessed: number
  sale: number
  replacement: number
  timing: TimingOption
}) {
  const metrics = [
    { label: "Annual savings", value: `$${fmt(result.annualSavings)}` },
    { label: "Monthly savings", value: `$${fmt(result.monthlySavings)}` },
    { label: "10-year savings", value: `$${fmt(result.savings10yr)}` },
    { label: "20-year savings", value: `$${fmt(result.savings20yr)}` },
  ]

  return (
    <div className="bg-secondary rounded-2xl p-6 text-white">
      <h3 className="font-bold text-white/80 text-sm uppercase tracking-wider mb-5">Your Prop 19 Tax Savings</h3>

      {/* 4-up metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {metrics.map((m) => (
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
            <span className="text-white/70">Without Prop 19</span>
            <span className="font-bold text-red-300">${fmtDec(result.taxWithoutProp19)}/yr</span>
          </div>
          <div className="h-6 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-red-400/70 rounded-full w-full" />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-white/70">With Prop 19</span>
            <span className="font-bold text-green-300">${fmtDec(result.taxWithProp19)}/yr</span>
          </div>
          <div className="h-6 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#f26b2b] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${result.barPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Detail row */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10 text-sm">
        <div>
          <p className="text-white/50 text-xs">New taxable value</p>
          <p className="font-bold">${fmt(result.newTaxableValue)}</p>
        </div>
        <div>
          <p className="text-white/50 text-xs">Without Prop 19 (full reassessment)</p>
          <p className="font-bold">${fmt(replacement)}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Prop19SeniorCalc({ initial = {} }: { initial?: Prop19SeniorInitialValues }) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [eligibility, setEligibility] = useState<EligibilityOption | null>(null)
  const [timing, setTiming] = useState<TimingOption>(initial.timing ?? "within1")
  const [assessedRaw, setAssessedRaw] = useState(initial.assessed ?? "")
  const [saleRaw, setSaleRaw] = useState(initial.sale ?? "")
  const [replacementRaw, setReplacementRaw] = useState(initial.replacement ?? "")
  const [showExplainer, setShowExplainer] = useState(false)
  const [copied, setCopied] = useState(false)

  // ── Derived values ─────────────────────────────────────────────────────────
  const assessed = parseCurrency(assessedRaw)
  const sale = parseCurrency(saleRaw)
  const replacement = parseCurrency(replacementRaw)
  const hasAll = assessed > 0 && sale > 0 && replacement > 0
  const result: SeniorResult | null = hasAll ? calcSenior(assessed, sale, replacement, timing) : null

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCurrency = (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/[^0-9]/g, "")
      if (!digits) { setter(""); return }
      setter(parseInt(digits, 10).toLocaleString("en-US"))
    }

  const handleCopyLink = useCallback(async () => {
    const params = new URLSearchParams({ mode: "senior" })
    if (assessed) params.set("assessed", String(assessed))
    if (sale) params.set("sale", String(sale))
    if (replacement) params.set("replacement", String(replacement))
    params.set("timing", timing)
    const url = `${window.location.origin}${window.location.pathname}?${params}`
    window.history.replaceState({}, "", `?${params}`)
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }, [assessed, sale, replacement, timing])

  const handlePrint = useCallback(() => {
    if (!result) return
    const win = window.open("", "_blank")
    if (!win) return
    win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>Prop 19 Analysis — Pacific Coast Title</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 680px; margin: 0 auto; color: #1a1a1a; }
    h1 { color: #03374f; border-bottom: 3px solid #f26b2b; padding-bottom: 10px; font-size: 22px; }
    h2 { color: #03374f; font-size: 15px; margin-top: 20px; margin-bottom: 6px; }
    .badge { background: #f26b2b; color: white; padding: 2px 10px; border-radius: 99px; font-size: 11px; font-weight: bold; }
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
  <img src="/logo2-dark.png" alt="Pacific Coast Title" style="height:44px;">
</div>
<h1>Prop 19 — Senior / Disabled Transfer Analysis</h1>

<div class="card">
  <p><strong>Timing:</strong> ${TIMING_LABELS[timing].short} &nbsp;<span class="badge">${TIMING_LABELS[timing].pct} threshold</span></p>
  <p><strong>Adjusted Threshold:</strong> $${fmt(result.adjustedThreshold)}</p>
  <p><strong>Transfer Type:</strong> ${result.isFullTransfer ? "✅ Full Transfer — full assessed value transfers" : "⚡ Partial Transfer — difference added to assessed value"}</p>
</div>

<div class="card">
  <p><strong>Original Assessed Value:</strong> $${fmt(assessed)}</p>
  <p><strong>Original Home Sale Price:</strong> $${fmt(sale)}</p>
  <p><strong>Replacement Home Price:</strong> $${fmt(replacement)}</p>
  ${result.differenceAdded > 0 ? `<p><strong>Difference Added:</strong> $${fmt(result.differenceAdded)}</p>` : ""}
  <p><strong>New Taxable Value:</strong> $${fmt(result.newTaxableValue)}</p>
</div>

<div class="savings-grid">
  <div class="saving-box"><p>Annual Savings</p><span>$${fmt(result.annualSavings)}</span></div>
  <div class="saving-box"><p>Monthly Savings</p><span>$${fmt(result.monthlySavings)}</span></div>
  <div class="saving-box"><p>10-Year Savings</p><span>$${fmt(result.savings10yr)}</span></div>
  <div class="saving-box"><p>20-Year Savings</p><span>$${fmt(result.savings20yr)}</span></div>
</div>

<div class="card">
  <p>Without Prop 19: <span class="red">$${fmtDec(result.taxWithoutProp19)}/yr</span></p>
  <p>With Prop 19: <span class="green">$${fmtDec(result.taxWithProp19)}/yr</span></p>
</div>

<h2>📄 Filing Information</h2>
<div class="card">
  <p><strong>BOE Form:</strong> BOE-19-B (Claim for Transfer of Base Year Value — 55+ / Disabled)</p>
  <p><strong>Filing Deadline:</strong> Within 3 years of replacement property purchase date</p>
  <p><strong>File With:</strong> County Assessor where the NEW home is located</p>
  <p><strong>BOE Website:</strong> boe.ca.gov/prop19</p>
</div>

<div class="disclaimer">
  <strong>Disclaimer:</strong> This calculator provides estimates based on Proposition 19 rules as of 2025. Actual property tax rates vary by county and Tax Rate Area (typically 1.0%–1.25% base rate plus local assessments). This is not tax or legal advice. Consult with a qualified California tax advisor, your county assessor, or a real estate attorney before making decisions based on these estimates. PCT does not provide tax advice.<br><br>
  Generated: ${new Date().toLocaleDateString()} &nbsp;·&nbsp; Pacific Coast Title Company &nbsp;·&nbsp; (866) 724-1050
</div>
</body>
</html>`)
    win.document.close()
    win.print()
  }, [result, assessed, sale, replacement, timing])

  // ── Eligibility options ────────────────────────────────────────────────────
  const eligibilityOpts: { value: EligibilityOption; label: string }[] = [
    { value: "senior", label: "I am 55 or older" },
    { value: "disabled", label: "I am severely and permanently disabled" },
    { value: "disaster", label: "My home was damaged/destroyed by a declared disaster" },
    { value: "unsure", label: "I'm not sure / just exploring" },
  ]

  // ── Timing options ─────────────────────────────────────────────────────────
  const timingOpts: { value: TimingOption; sublabel: string }[] = [
    { value: "before", sublabel: "You already own the replacement before selling the original" },
    { value: "within1", sublabel: "Most common — purchase within 12 months of your sale" },
    { value: "within2", sublabel: "Gives you maximum flexibility to find the right home" },
  ]

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Step 1 — Eligibility */}
      <SectionCard
        step="1"
        title="Confirm Eligibility"
        subtitle="Prop 19 base year value transfers are limited to specific homeowners. Which applies to you?"
      >
        <div className="grid sm:grid-cols-2 gap-3">
          {eligibilityOpts.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setEligibility(opt.value)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                eligibility === opt.value
                  ? "border-primary bg-primary/5 text-secondary"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                eligibility === opt.value ? "border-primary bg-primary" : "border-gray-300"
              }`}>
                {eligibility === opt.value && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm font-medium leading-snug">{opt.label}</span>
            </button>
          ))}
        </div>

        {eligibility && (
          <div className={`mt-4 p-4 rounded-xl text-sm flex items-start gap-2.5 ${
            eligibility === "unsure"
              ? "bg-amber-50 text-amber-800 border border-amber-200"
              : "bg-green-50 text-green-800 border border-green-200"
          }`}>
            {eligibility !== "unsure" && <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            {eligibility === "unsure" ? (
              <p>
                <strong>Eligibility Note:</strong> Prop 19 base year value transfers require the homeowner to be 55+,
                severely disabled, or a disaster victim. Contact a tax advisor to confirm your eligibility. You can still
                use the calculator below for educational purposes.
              </p>
            ) : (
              <p><strong>You likely qualify.</strong> Proceed to the calculator below.</p>
            )}
          </div>
        )}
      </SectionCard>

      {/* Step 2 — Timing */}
      <SectionCard
        step="2"
        title="When Are You Buying the Replacement Home?"
        subtitle="Timing determines your price threshold. The later you buy, the more room you have."
      >
        <div className="space-y-3">
          {timingOpts.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTiming(opt.value)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                timing === opt.value
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                timing === opt.value ? "border-primary bg-primary" : "border-gray-300"
              }`}>
                {timing === opt.value && <Check className="w-3 h-3 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-secondary text-sm">{TIMING_LABELS[opt.value].short}</p>
                <p className="text-gray-500 text-xs mt-0.5">{opt.sublabel}</p>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg whitespace-nowrap flex-shrink-0">
                {TIMING_LABELS[opt.value].pct} threshold
              </span>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Step 3 — Inputs */}
      <SectionCard
        step="3"
        title="Enter Your Values"
        subtitle="All inputs are estimates — the calculator updates automatically as you type."
      >
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              label: "Original Home's Assessed Value",
              hint: "Current taxable value from your property tax bill — not market value",
              value: assessedRaw,
              setter: setAssessedRaw,
            },
            {
              label: "Original Home's Sales Price",
              hint: "What you're selling (or sold) your original home for",
              value: saleRaw,
              setter: setSaleRaw,
            },
            {
              label: "Replacement Home Purchase Price",
              hint: "What you're paying for the new home",
              value: replacementRaw,
              setter: setReplacementRaw,
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

      {/* ── Results ── */}
      {result && (
        <>
          {/* Timing callout banner */}
          <div className={`rounded-2xl p-5 border-l-4 ${
            result.isFullTransfer
              ? "bg-green-50 border-green-500"
              : "bg-amber-50 border-amber-500"
          }`}>
            <p className="font-bold text-secondary mb-1">
              {result.isFullTransfer ? "✅ Full Transfer Applies" : "⚡ Partial Transfer Applies"}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {result.isFullTransfer
                ? `Because you're ${TIMING_LABELS[timing].long.toLowerCase()}, your threshold is ${
                    TIMING_MULTIPLIERS[timing] * 100
                  }% of your sale price — <strong>$${fmt(result.adjustedThreshold)}</strong>. Your replacement home at $${fmt(
                    replacement
                  )} is within that limit, so your full assessed value of $${fmt(assessed)} transfers with no adjustment.`
                : `Because you're ${TIMING_LABELS[timing].long.toLowerCase()}, your threshold is ${
                    TIMING_MULTIPLIERS[timing] * 100
                  }% of your sale price — $${fmt(result.adjustedThreshold)}. Your replacement home exceeds this by $${fmt(
                    result.differenceAdded
                  )}, so that amount is added to your original assessed value.`}
            </p>
          </div>

          {/* Savings card */}
          <SavingsCard result={result} assessed={assessed} sale={sale} replacement={replacement} timing={timing} />

          {/* Expandable explainer */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setShowExplainer(!showExplainer)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-secondary">📋 Full Scenario Breakdown + Filing Information</span>
              {showExplainer
                ? <ChevronUp className="w-5 h-5 text-gray-400" />
                : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {showExplainer && (
              <div className="px-6 pb-6 border-t border-gray-100">
                {/* Step-by-step breakdown */}
                <div className="mt-5 space-y-2 text-sm text-gray-700">
                  <p><strong>1. Original Assessed Value:</strong> ${fmt(assessed)}</p>
                  <p><strong>2. Original Home Sale Price:</strong> ${fmt(sale)}</p>
                  <p>
                    <strong>3. Timing Threshold ({TIMING_LABELS[timing].pct}):</strong>{" "}
                    ${fmt(sale)} × {TIMING_MULTIPLIERS[timing]} = <strong>${fmt(result.adjustedThreshold)}</strong>
                  </p>
                  <p><strong>4. Replacement Home Price:</strong> ${fmt(replacement)}</p>
                </div>

                <div className={`mt-4 p-4 rounded-xl text-sm ${result.isFullTransfer ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"}`}>
                  {result.isFullTransfer ? (
                    <p>
                      Since $${fmt(replacement)} ≤ $${fmt(result.adjustedThreshold)} (the {TIMING_LABELS[timing].pct} threshold),
                      the <strong>full assessed value of $${fmt(assessed)} transfers</strong> to the replacement property.
                      Your new annual property tax is estimated at $${fmtDec(result.taxWithProp19)}.
                    </p>
                  ) : (
                    <p>
                      Since $${fmt(replacement)} exceeds the threshold of $${fmt(result.adjustedThreshold)} by $${fmt(result.differenceAdded)},
                      the new taxable value is $${fmt(assessed)} + $${fmt(result.differenceAdded)} = <strong>${fmt(result.newTaxableValue)}</strong>.
                      Your new estimated annual tax is $${fmtDec(result.taxWithProp19)}.
                    </p>
                  )}
                </div>

                {/* Filing info */}
                <div className="mt-5 bg-gray-50 rounded-xl p-5 text-sm space-y-2">
                  <p className="font-bold text-secondary mb-3">📄 Filing Information</p>
                  <p>
                    <strong>BOE Form:</strong>{" "}
                    <span className="text-primary font-medium">BOE-19-B</span>
                    {" "}— Claim for Transfer of Base Year Value to Replacement Primary Residence for Persons At Least 55 Years
                  </p>
                  <p><strong>Filing Deadline:</strong> Within 3 years of the date you purchased the replacement property</p>
                  <p><strong>Where to File:</strong> The Assessor's office in the county where your <em>new</em> home is located</p>
                  <p className="text-gray-500 text-xs">Note: Up to 3 lifetime transfers are allowed for senior/disabled homeowners.</p>
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

      {/* Empty state prompt */}
      {!hasAll && (
        <div className="text-center py-10 text-gray-400 text-sm">
          Enter all three dollar values above to see your Prop 19 savings estimate.
        </div>
      )}
    </div>
  )
}
