"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FinCENHero } from "@/components/fincen/fincen-hero"
import { FinCENPageLayout } from "@/components/fincen/fincen-page-layout"
import { MiniDisclaimer } from "@/components/fincen/mini-disclaimer"
import { CheckCircle, XCircle, HelpCircle, AlertTriangle, ChevronDown } from "lucide-react"
import Link from "next/link"

const takeaways = [
  "Reporting is most common when the buyer is an <strong>entity or trust</strong>",
  "Reporting is focused on <strong>non-financed</strong> purchases",
  "Residential includes 1–4 units, condos/townhomes, co-ops, and certain land",
  "Exemptions exist—document them when applicable",
  "Use this as a <strong>starting point</strong>, not a legal conclusion",
]

type Answer = "yes" | "no" | "unsure" | null

export default function IsItReportablePage() {
  const [q1, setQ1] = useState<Answer>(null)
  const [q2, setQ2] = useState<Answer>(null)
  const [q3, setQ3] = useState<Answer>(null)
  const [showResult, setShowResult] = useState(false)

  const allAnswered = q1 !== null && q2 !== null && q3 !== null

  const isLikelyReportable =
    q1 === "yes" && (q2 === "yes" || q2 === "unsure") && q3 === "yes"

  function handleCheck() {
    if (allAnswered) setShowResult(true)
  }

  function handleReset() {
    setQ1(null)
    setQ2(null)
    setQ3(null)
    setShowResult(false)
  }

  const RadioGroup = ({
    value,
    onChange,
    options,
  }: {
    value: Answer
    onChange: (v: Answer) => void
    options: { label: string; value: Answer }[]
  }) => (
    <div className="flex flex-wrap gap-3 mt-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-5 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
            value === opt.value
              ? "border-primary bg-primary text-white"
              : "border-gray-200 bg-white text-gray-700 hover:border-primary/50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )

  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      <FinCENHero
        title="Is This Transaction Likely Reportable?"
        subtitle="Answer three questions for a directional read. Then confirm specifics with your escrow officer."
      />

      <FinCENPageLayout
        takeaways={takeaways}
        cta={{
          heading: "Want a Clean Answer Before You Write the Offer?",
          body: "Loop escrow in early—especially if the buyer plans to purchase in an entity or trust.",
          buttons: [
            { label: "Talk to an Escrow Officer", href: "/fincen/contact" },
            { label: "Guidance for agents", href: "/fincen/agents", variant: "outline" },
          ],
        }}
      >
        {/* Checker */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-secondary">Quick Checker</h2>
          </div>
          <p className="text-gray-600 mb-8 ml-14 text-sm">
            This checker is a simplified guide based on the rule&apos;s core triggers and common exemptions. Results are informational.
          </p>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
            {/* Q1 */}
            <div>
              <p className="font-semibold text-secondary">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs mr-2">1</span>
                Is the property residential?
              </p>
              <p className="text-sm text-gray-500 ml-8 mt-1">
                (1–4 units, condo/townhome, co-op, or qualifying land intended for residential construction)
              </p>
              <RadioGroup
                value={q1}
                onChange={setQ1}
                options={[
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                ]}
              />
            </div>

            {/* Q2 */}
            <div>
              <p className="font-semibold text-secondary">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs mr-2">2</span>
                Is the purchase non-financed (all-cash or certain private money), OR does the lender lack an anti-money laundering (AML) program?
              </p>
              <RadioGroup
                value={q2}
                onChange={setQ2}
                options={[
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
                  { label: "Not sure", value: "unsure" },
                ]}
              />
            </div>

            {/* Q3 */}
            <div>
              <p className="font-semibold text-secondary">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs mr-2">3</span>
                Is the buyer (transferee) a legal entity or trust (LLC, corporation, partnership, trust), rather than an individual?
              </p>
              <RadioGroup
                value={q3}
                onChange={setQ3}
                options={[
                  { label: "Yes", value: "yes" },
                  { label: "No", value: "no" },
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
                        ? "Based on your answers, this transaction may require FinCEN reporting. Plan for beneficial ownership information (BOI) collection and ID verification."
                        : "Based on your answers, this transaction is less likely to require FinCEN reporting. However, exemptions and details matter—confirm with escrow."}
                    </p>
                    {isLikelyReportable && (
                      <Link
                        href="/fincen/contact"
                        className="inline-flex items-center gap-2 mt-4 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Talk to an Escrow Officer →
                      </Link>
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

      </FinCENPageLayout>

      <Footer />
    </main>
  )
}
