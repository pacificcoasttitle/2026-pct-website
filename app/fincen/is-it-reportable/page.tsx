"use client"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FinCENHero } from "@/components/fincen/fincen-hero"
import { CTABox } from "@/components/fincen/cta-box"
import { MiniDisclaimer } from "@/components/fincen/mini-disclaimer"
import { CheckCircle, XCircle, HelpCircle, AlertTriangle, ChevronDown, Loader2 } from "lucide-react"
import Link from "next/link"

type Answer = string | null

// Inner component that reads search params (requires Suspense wrapper)
function IsItReportableContent() {
  const params = useSearchParams()
  const [q1, setQ1] = useState<Answer>(null)
  const [q2, setQ2] = useState<Answer>(null)
  const [q3, setQ3] = useState<Answer>(null)
  const [showResult, setShowResult] = useState(false)

  const allAnswered = q1 !== null && q2 !== null && q3 !== null

  // Likely reportable when: residential + (cash/private/unsure financing) + (entity or trust buyer)
  const isLikelyReportable =
    q1 === "yes" &&
    (q2 === "cash" || q2 === "private" || q2 === "unsure") &&
    (q3 === "entity" || q3 === "trust")

  // Plain-English reason when NOT reportable — used in the result card
  function notReportableReason(): string {
    if (q1 === "no") return "The FinCEN rule only applies to residential property (1–4 units, condos, co-ops). Commercial and industrial transfers are not covered."
    if (q3 === "individual") return "The FinCEN rule only applies when a legal entity or trust is the buyer. Purchases in an individual's personal name are not subject to these reporting requirements."
    if (q2 === "bank") return "When a bank or credit union is providing the mortgage, that lender's existing anti-money laundering program satisfies the rule. The transfer is typically exempt."
    return "Based on your answers, this transaction does not appear to meet all three triggers for FinCEN reporting."
  }

  function handleCheck() {
    if (allAnswered) setShowResult(true)
  }

  function handleReset() {
    setQ1(null)
    setQ2(null)
    setQ3(null)
    setShowResult(false)
  }

  // Build intake URL forwarding both checker answers and all prefill params from email
  function buildIntakeUrl() {
    const p = new URLSearchParams()
    p.set("result", "likely_reportable")
    p.set("residential", q1 ?? "yes")
    p.set("financing", q2 === "bank" ? "financed" : "cash")
    p.set("buyerType", q3 === "trust" ? "trust" : q3 === "entity" ? "entity" : "individual")
    const PREFILL_KEYS = ["escrow","street","city","state","zip","county","price","closing","officer","email","phone","branch","proptype"]
    PREFILL_KEYS.forEach(key => { const v = params.get(key); if (v) p.set(key, v) })
    return `/fincen/intake?${p.toString()}`
  }

  const RadioGroup = ({
    value,
    onChange,
    options,
  }: {
    value: Answer
    onChange: (v: Answer) => void
    options: { label: string; sublabel?: string; value: string }[]
  }) => (
    <div className="flex flex-col gap-2 mt-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`text-left px-5 py-3 rounded-xl border-2 text-sm transition-all ${
            value === opt.value
              ? "border-primary bg-primary/5 text-secondary"
              : "border-gray-200 bg-white text-gray-700 hover:border-primary/40 hover:bg-gray-50"
          }`}
        >
          <span className={`font-semibold ${value === opt.value ? "text-primary" : ""}`}>
            {value === opt.value ? "● " : "○ "}{opt.label}
          </span>
          {opt.sublabel && (
            <span className="block text-xs text-gray-500 mt-0.5 ml-4">{opt.sublabel}</span>
          )}
        </button>
      ))}
    </div>
  )

  // ── Order context from prefill params ───────────────────────────────────────
  const orderEscrow   = params.get("escrow")   ? decodeURIComponent(params.get("escrow")!)   : null
  const orderStreet   = params.get("street")   ? decodeURIComponent(params.get("street")!)   : null
  const orderCity     = params.get("city")     ? decodeURIComponent(params.get("city")!)     : null
  const orderState    = params.get("state")    ? params.get("state")!.toUpperCase()          : null
  const orderOfficer  = params.get("officer")  ? decodeURIComponent(params.get("officer")!)  : null
  const orderRawPrice = params.get("price")
  const orderPrice    = orderRawPrice
    ? (() => { const n = parseFloat(orderRawPrice.replace(/[,$]/g,"")); return isNaN(n) ? null : `$${n.toLocaleString("en-US")}` })()
    : null

  const hasOrderContext = !!(orderEscrow || orderStreet)

  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      <FinCENHero
        title="Is This Transaction Likely Reportable?"
        subtitle="Answer three questions for a directional read. Then confirm specifics with your escrow officer."
      />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Checker */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-secondary">Quick Checker</h2>
          </div>
          <p className="text-gray-600 mb-6 ml-14 text-sm">
            This checker is a simplified guide based on the rule&apos;s core triggers and common exemptions. Results are informational.
          </p>

          {/* Order context banner — shown when arriving via a prefill link */}
          {hasOrderContext && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl px-5 py-4 flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-green-900 mb-1">
                  We have your transaction on file ✓
                </p>
                <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-green-800 mb-2">
                  {orderEscrow && (
                    <span><span className="text-green-600 font-medium">Escrow #</span> {orderEscrow}</span>
                  )}
                  {orderStreet && (
                    <span>
                      <span className="text-green-600 font-medium">Property </span>
                      {orderStreet}{orderCity ? `, ${orderCity}` : ""}{orderState ? `, ${orderState}` : ""}
                    </span>
                  )}
                  {orderPrice && (
                    <span><span className="text-green-600 font-medium">Price </span> {orderPrice}</span>
                  )}
                  {orderOfficer && (
                    <span><span className="text-green-600 font-medium">Officer </span> {orderOfficer}</span>
                  )}
                </div>
                <p className="text-xs text-green-700">
                  We just need to confirm whether this transaction requires a FinCEN filing. Answer the three questions below — if a filing is needed, your order details will be pre-filled into the intake form automatically.
                </p>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
            {/* Q1 */}
            <div>
              <p className="font-semibold text-secondary">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs mr-2">1</span>
                What type of property is being transferred?
              </p>
              <p className="text-xs text-gray-500 ml-8 mt-1">
                The FinCEN rule only covers residential real property.
              </p>
              <RadioGroup
                value={q1}
                onChange={setQ1}
                options={[
                  { label: "Residential", sublabel: "Single family home, condo, townhome, co-op, 2–4 units, or vacant land intended for residential construction", value: "yes" },
                  { label: "Commercial, industrial, or 5+ units", sublabel: "Office, retail, warehouse, apartment building with 5+ units, or other non-residential", value: "no" },
                ]}
              />
            </div>

            {/* Q2 */}
            <div>
              <p className="font-semibold text-secondary">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs mr-2">2</span>
                How is the buyer financing the purchase?
              </p>
              <p className="text-xs text-gray-500 ml-8 mt-1">
                Transactions financed through a bank or credit union are typically exempt — the lender's own compliance program covers it.
              </p>
              <RadioGroup
                value={q2}
                onChange={setQ2}
                options={[
                  { label: "All cash — no mortgage or loan", sublabel: "Wire, cashier's check, cryptocurrency, or any combination not involving a lender", value: "cash" },
                  { label: "Mortgage from a bank or credit union", sublabel: "Conventional, FHA, VA, jumbo, or other loan from a regulated financial institution", value: "bank" },
                  { label: "Hard money, private lender, or seller carry-back", sublabel: "Non-institutional financing — private individual, fund, or seller-financed note", value: "private" },
                  { label: "Not sure", sublabel: "Financing details haven't been confirmed yet", value: "unsure" },
                ]}
              />
            </div>

            {/* Q3 */}
            <div>
              <p className="font-semibold text-secondary">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs mr-2">3</span>
                Who is taking title as the buyer?
              </p>
              <p className="text-xs text-gray-500 ml-8 mt-1">
                The rule applies when a legal entity or trust — not a person — is on title.
              </p>
              <RadioGroup
                value={q3}
                onChange={setQ3}
                options={[
                  { label: "An individual (buying in their own name)", sublabel: "Natural person — no entity, no trust", value: "individual" },
                  { label: "An LLC, corporation, or partnership", sublabel: "Any business entity, including LLPs, LLCs, S-corps, C-corps, etc.", value: "entity" },
                  { label: "A trust", sublabel: "Living trust, family trust, irrevocable trust, land trust, or other trust arrangement", value: "trust" },
                ]}
              />
            </div>

            {/* Check Button */}
            {!showResult && (
              <button
                onClick={handleCheck}
                disabled={!allAnswered}
                className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Check My Transaction
              </button>
            )}

            {/* Result */}
            {showResult && (
              <div className={`rounded-2xl p-6 border-2 ${
                isLikelyReportable
                  ? "bg-red-50 border-red-200"
                  : "bg-green-50 border-green-200"
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isLikelyReportable ? "bg-red-100" : "bg-green-100"
                  }`}>
                    {isLikelyReportable
                      ? <AlertTriangle className="w-6 h-6 text-red-600" />
                      : <CheckCircle className="w-6 h-6 text-green-600" />
                    }
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold mb-2 ${
                      isLikelyReportable ? "text-red-800" : "text-green-800"
                    }`}>
                      {isLikelyReportable ? "Likely Reportable" : "Likely Not Reportable"}
                    </h3>
                    <p className={`text-sm leading-relaxed ${
                      isLikelyReportable ? "text-red-700" : "text-green-700"
                    }`}>
                      {isLikelyReportable
                        ? "Based on your answers, this transaction appears to require FinCEN reporting. You'll need to collect beneficial ownership information (BOI) and ID verification for the buyer. Use the intake form below to start."
                        : notReportableReason()}
                    </p>
                    {isLikelyReportable && (
                      <div className="mt-4 flex flex-col sm:flex-row gap-3">
                        <Link
                          href={buildIntakeUrl()}
                          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                        >
                          Continue — Start FinCEN Intake Form →
                        </Link>
                        <a
                          href="tel:+18667241050"
                          className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          Or call us: (866) 724-1050
                        </a>
                      </div>
                    )}
                    {!isLikelyReportable && showResult && (
                      <p className="mt-4 text-xs text-gray-500">
                        Think this might be wrong?{" "}
                        <Link href="/fincen/intake" className="text-primary underline">
                          Start the intake form anyway
                        </Link>
                      </p>
                    )}
                  </div>
                </div>
                <MiniDisclaimer />
                <button
                  onClick={handleReset}
                  className="mt-4 text-sm text-gray-500 hover:text-primary underline"
                >
                  Start over
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Common Stop Scenarios */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <XCircle className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-secondary">Common "Stop" Scenarios</h2>
          </div>
          <p className="text-gray-700 mb-4">If any of these apply, reporting may not be required:</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: "Not residential", desc: "The transaction is not a residential property" },
              { label: "Individual buyer", desc: "The buyer is an individual purchasing in their personal name" },
              { label: "AML lender", desc: "Financed by a lender with an AML program (as applicable)" },
            ].map((item) => (
              <div key={item.label} className="bg-green-50 border border-green-100 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-800 text-sm">{item.label}</span>
                </div>
                <p className="text-sm text-green-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Common Exemptions */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <ChevronDown className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-secondary">Common Exemptions</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Certain transfers may be exempt. When an exemption applies, it&apos;s important to{" "}
            <strong>document the exemption</strong> in the file.
          </p>
          <ul className="space-y-3 mb-6">
            {[
              "Easement transfers",
              "Transfers due to <strong>death, divorce, or dissolution</strong>",
              "Transfers to a <strong>bankruptcy estate</strong>",
              "<strong>Court-supervised</strong> transfers",
              "<strong>No-consideration</strong> transfer by an individual (alone or with spouse) to a trust where that individual/spouse are the settlors or grantors (as applicable)",
              "1031 exchange transfers to a <strong>qualified intermediary</strong> in some contexts (note: the sale out of the exchange may still be reportable depending on facts)",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm" dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl p-4">
            Exemptions can be technical—when in doubt, confirm with escrow and counsel.
          </p>
        </section>

        {/* Entity/Trust Exemption Categories */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-secondary">Entity/Trust Exemption Categories (High-Level)</h2>
          </div>
          <p className="text-gray-700 mb-4">
            Some entities and trusts may fall into exemption categories. Determining exemption status can require documentation.
          </p>
          <div className="space-y-3">
            {[
              "Certain regulated financial institutions and registered entities (as applicable)",
              "Governmental authorities (as applicable)",
              "Certain securities reporting issuers and entities wholly owned by them (as applicable)",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </section>

      <CTABox
        heading="Want a Clean Answer Before You Write the Offer?"
        body="Loop escrow in early—especially if the buyer plans to purchase in an entity or trust."
        buttons={[
          { label: "Talk to an Escrow Officer", modal: "escrow" },
          { label: "Guidance for agents", href: "/fincen/agents", variant: "outline" },
        ]}
      />
      </div>

      <Footer />
    </main>
  )
}

export default function IsItReportablePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    }>
      <IsItReportableContent />
    </Suspense>
  )
}
