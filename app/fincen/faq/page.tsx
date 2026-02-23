"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FinCENHero } from "@/components/fincen/fincen-hero"
import { CTABox } from "@/components/fincen/cta-box"
import { ChevronDown, HelpCircle } from "lucide-react"

const faqs = [
  {
    q: "When does the rule take effect?",
    a: "The rule applies to transactions closing on or after <strong>March 1, 2026</strong>.",
  },
  {
    q: "Does this apply to every residential sale?",
    a: "No. It is targeted at certain <strong>non-financed</strong> residential transfers, often when the buyer is a <strong>legal entity or trust</strong>.",
  },
  {
    q: 'What types of properties are considered "residential"?',
    a: "Residential generally includes <strong>1–4 family</strong> dwellings, <strong>condos/townhomes</strong>, <strong>co-ops</strong>, and certain <strong>vacant land intended for residential construction</strong>.",
  },
  {
    q: 'What does "non-financed" mean?',
    a: 'It typically includes <strong>all-cash</strong> purchases and certain private-money situations (as applicable). Traditional financing by a lender with an AML program is generally less likely to be reportable.',
  },
  {
    q: "Do real estate agents file the report?",
    a: "Agents typically do <strong>not</strong> have the reporting obligation. However, agents play a critical role in setting expectations early so the transaction timeline stays intact.",
  },
  {
    q: "What information might be collected?",
    a: "For impacted transactions, information may include <strong>beneficial ownership information (BOI)</strong> for the entity/trust, personal details for beneficial owners, and copies of unexpired government-issued identification.",
  },
  {
    q: 'Who is a "beneficial owner"?',
    a: "Generally, beneficial owners include individuals with <strong>25% or more ownership</strong> and/or those who exercise <strong>substantial control</strong>, as applicable.",
  },
  {
    q: "Can reporting responsibility be transferred?",
    a: "Reporting responsibility is determined by a <strong>cascade</strong>. In some situations, a <strong>designation agreement</strong> can transfer responsibility between parties. Copies should be retained.",
  },
  {
    q: "Are there exemptions?",
    a: "Yes—examples may include transfers due to <strong>death/divorce/dissolution</strong>, certain <strong>court-supervised</strong> transfers, transfers to a <strong>bankruptcy estate</strong>, and certain no-consideration trust transfers (as applicable). Exemptions can be technical; confirm with escrow.",
  },
  {
    q: "How long must records be retained?",
    a: "Records such as the filed report, designation agreement (if any), and supporting documentation must be retained for <strong>five years from the date of filing</strong>.",
  },
  {
    q: "Can this delay closing?",
    a: "It can if ownership information and IDs are gathered late. Early preparation is the best way to avoid delays.",
  },
  {
    q: "What should I do if I'm not sure?",
    a: "Use the checker for a directional read and confirm with escrow. When in doubt, start early.",
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      <FinCENHero
        title="FinCEN Reporting FAQ"
        subtitle="The questions we're hearing most—answered in plain English."
      />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-secondary">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-gray-100 rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-start justify-between gap-4 p-5 text-left bg-white hover:bg-gray-50 transition-colors"
                  aria-expanded={openIndex === i}
                >
                  <span className="font-semibold text-secondary pr-4">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-primary flex-shrink-0 mt-0.5 transition-transform duration-200 ${
                      openIndex === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === i && (
                  <div className="px-5 pb-5 bg-white border-t border-gray-50">
                    <p
                      className="text-gray-700 leading-relaxed pt-3"
                      dangerouslySetInnerHTML={{ __html: faq.a }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      <CTABox
        heading="Still Unsure? We'll Walk You Through It."
        body="Send us the basics (property type, buyer type, and financing). We'll help you plan next steps."
        buttons={[
          { label: "Check if it's reportable", href: "/fincen/is-it-reportable" },
          { label: "Talk to an Escrow Officer", href: "/fincen/contact", variant: "outline" },
        ]}
      />
      </div>

      <Footer />
    </main>
  )
}
