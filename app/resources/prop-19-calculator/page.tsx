"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, Home, Users } from "lucide-react"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ContactButton } from "@/components/ContactButton"
import { Prop19SeniorCalc, type Prop19SeniorInitialValues } from "@/components/prop19/Prop19SeniorCalc"
import { Prop19ParentChildCalc, type Prop19ParentChildInitialValues } from "@/components/prop19/Prop19ParentChildCalc"
import type { TimingOption } from "@/lib/prop19/calculations"

type Mode = "senior" | "parent-child"

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Prop19Page() {
  const [mode, setMode] = useState<Mode>("senior")

  // URL-param initial values — resolved client-side to avoid SSR/window issues
  const [seniorInitial, setSeniorInitial] = useState<Prop19SeniorInitialValues | null>(null)
  const [pcInitial, setPcInitial] = useState<Prop19ParentChildInitialValues | null>(null)

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    if (p.get("mode") === "parent-child") setMode("parent-child")

    setSeniorInitial({
      assessed: p.get("assessed") ?? undefined,
      sale: p.get("sale") ?? undefined,
      replacement: p.get("replacement") ?? undefined,
      timing: (p.get("timing") as TimingOption | null) ?? undefined,
    })

    setPcInitial({
      assessed: p.get("assessed") ?? undefined,
      market: p.get("market") ?? undefined,
      occupy: p.has("occupy") ? p.get("occupy") !== "no" : undefined,
    })
  }, [])

  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      {/* ── Hero ── */}
      <section className="relative h-[42vh] min-h-[340px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center grayscale"
          style={{ backgroundImage: "url(/beautiful-modern-california-home-exterior-with-blu.jpg)" }}
        />
        <div className="absolute inset-0 bg-white/90" />
        <div className="relative container mx-auto px-4 text-center pt-12">
          <p className="text-primary font-semibold mb-3 uppercase tracking-wide text-sm">Agent Resources</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Prop 19 Calculator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Estimate property tax savings under California's Proposition 19
          </p>
        </div>
      </section>

      {/* ── About Prop 19 ── */}
      <section className="py-10 bg-gray-50 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-secondary mb-3">About Proposition 19</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              California's Proposition 19 (effective February 16, 2021) creates two separate programs:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-primary/5 rounded-xl p-4">
                <p className="font-semibold text-secondary text-sm mb-1">👤 Senior / Disabled / Disaster Transfer</p>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Homeowners 55+, severely disabled, or disaster victims may transfer their base year value to a
                  replacement primary residence <em>anywhere in California</em>, up to 3 times.
                </p>
              </div>
              <div className="bg-primary/5 rounded-xl p-4">
                <p className="font-semibold text-secondary text-sm mb-1">👨‍👩‍👧 Parent-Child Inheritance</p>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Children inheriting a parent's home can keep the low assessed value only if they use it as their
                  primary residence, and only up to the exclusion cap ($1,044,586 for 2025–2027).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mode Tabs + Calculator ── */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">

            {/* Tab switcher */}
            <div className="flex rounded-2xl bg-gray-100 p-1.5 mb-8 gap-1.5">
              <button
                type="button"
                onClick={() => setMode("senior")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                  mode === "senior"
                    ? "bg-white text-secondary shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Home className="w-4 h-4" />
                Senior / Disabled / Disaster Transfer
              </button>
              <button
                type="button"
                onClick={() => setMode("parent-child")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all ${
                  mode === "parent-child"
                    ? "bg-white text-secondary shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Users className="w-4 h-4" />
                Parent-Child Inheritance
              </button>
            </div>

            {/* Calculator — defer render until URL params are resolved */}
            {seniorInitial === null ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : mode === "senior" ? (
              <Prop19SeniorCalc key="senior" initial={seniorInitial} />
            ) : (
              <Prop19ParentChildCalc key="parent-child" initial={pcInitial ?? {}} />
            )}
          </div>
        </div>
      </section>

      {/* ── Enhanced Disclaimer ── */}
      <section className="py-8 bg-amber-50 border-y border-amber-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 font-semibold mb-1 text-sm">Important Disclaimer</p>
              <p className="text-amber-700 text-xs leading-relaxed">
                This calculator provides <strong>estimates only</strong> based on Proposition 19 rules as of 2025.
                Actual property tax rates vary by county and Tax Rate Area (typically 1.0%–1.25% base rate plus local
                bond assessments). The 1.2% rate used here is for illustration purposes only. This is{" "}
                <strong>not tax or legal advice</strong>. Consult with a qualified California tax advisor, your county
                assessor, or a real estate attorney before making financial decisions based on these estimates.
                Pacific Coast Title Company does not provide tax advice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Example Scenarios ── */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-secondary mb-2 text-center">Quick Reference Examples</h2>
            <p className="text-gray-500 text-sm text-center mb-8">
              These illustrate how the timing rule affects the calculation. Plug in your own numbers above.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Example A */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
                  Example A — Full Transfer
                </p>
                <p className="text-sm font-semibold text-secondary mb-4">
                  Buying within 1 year, replacement ≤ 105% of sale price
                </p>
                <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                  <p>Assessed value: <strong>$300,000</strong></p>
                  <p>Original sale price: <strong>$800,000</strong></p>
                  <p>Replacement price: <strong>$820,000</strong></p>
                  <p>105% threshold: <strong>$840,000</strong></p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-sm text-green-800">
                  $820K &lt; $840K → <strong>Full transfer.</strong> New taxable value = $300,000.{" "}
                  Annual tax ≈ <strong>$3,600</strong> vs. $9,840 without Prop 19.
                  Savings: <strong>$6,240/yr</strong>
                </div>
              </div>

              {/* Example B */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3">
                  Example B — Partial Transfer
                </p>
                <p className="text-sm font-semibold text-secondary mb-4">
                  Buying within 2 years, replacement &gt; 110% of sale price
                </p>
                <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                  <p>Assessed value: <strong>$400,000</strong></p>
                  <p>Original sale price: <strong>$1,200,000</strong></p>
                  <p>Replacement price: <strong>$1,500,000</strong></p>
                  <p>110% threshold: <strong>$1,320,000</strong></p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-800">
                  $1.5M exceeds $1.32M by $180K → <strong>Partial transfer.</strong>{" "}
                  New taxable value = $400K + $180K = <strong>$580,000</strong>.
                  Annual tax ≈ <strong>$6,960</strong> vs. $18,000 without Prop 19.
                  Savings: <strong>$11,040/yr</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-16 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/professional-title-company-office-team-meeting.jpg)" }}
        />
        <div className="absolute inset-0 bg-primary/90" />
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help with Your Transaction?</h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Our team can help you navigate property transfers, title, and escrow for a smooth closing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <ContactButton
              defaultType="general"
              title="Prop 19 Question"
              className="bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Ask Our Team a Question
            </ContactButton>
            <a
              href="tel:+18667241050"
              className="bg-[#f26b2b] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#f26b2b]/90 transition-colors"
            >
              Call (866) 724-1050
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
