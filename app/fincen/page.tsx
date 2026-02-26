import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FinCENHero } from "@/components/fincen/fincen-hero"
import { CTABox } from "@/components/fincen/cta-box"
import { Shield, AlertCircle, Users, ClipboardList, CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FinCEN Division | Pacific Coast Title",
  description:
    "Learn how FinCEN's Residential Real Estate Reporting Rule may affect certain non-financed residential closings starting March 1, 2026. PCT helps you prepare and avoid closing delays.",
}

const sections = [
  {
    icon: AlertCircle,
    title: "What's Changing",
    body: `FinCEN (Financial Crimes Enforcement Network, U.S. Treasury) has issued a national rule designed to reduce money laundering risks in U.S. real estate by requiring reporting for certain residential purchases.`,
    bullets: [
      "<strong>Residential</strong>",
      "<strong>Non-financed</strong> (all-cash or certain private money, or not covered by a lender AML program)",
      "Purchased by an <strong>entity or trust</strong> (not an individual)",
    ],
    bulletIntro: "This rule does <strong>not</strong> apply to every deal. It's focused on transactions that are:",
  },
  {
    icon: Users,
    title: "Who This Impacts",
    body: "This will show up most often in:",
    bullets: [
      "All-cash buyers purchasing with an LLC, corporation, or partnership",
      "Trust purchases (depending on the trust structure and exemptions)",
      "Private money / hard-money / seller-financed situations (where applicable)",
      "Trustee sale purchases using entities or trusts",
    ],
    note: "If your buyer is using an entity or trust, expect additional identity and document requests during escrow.",
  },
  {
    icon: Shield,
    title: "How PCT Helps",
    body: "PCT's role is to help you:",
    bullets: [
      "Identify likely reportable transactions early",
      "Collect the information that may be required (BOI + entity/trust docs + IDs)",
      "Coordinate timelines so closing doesn't stall at the finish line",
      "Document exemptions when applicable and maintain required records",
    ],
  },
  {
    icon: ClipboardList,
    title: "What You Can Do Now",
    subsections: [
      {
        heading: "For Agents",
        bullets: [
          "Set expectations early when buyers plan to use an entity or trust",
          "Encourage fast response to identity and document requests",
        ],
      },
      {
        heading: "For Buyers",
        bullets: [
          "Gather beneficial owner details and IDs in advance",
          "Have entity/trust documents ready before opening escrow",
        ],
      },
    ],
  },
]

export default function FinCENLandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      <FinCENHero
        title="FinCEN Reporting Is Coming to Residential Real Estate"
        subtitle="Starting March 1, 2026, certain <strong>non-financed</strong> residential purchases—especially when the buyer is an <strong>entity or trust</strong>—may require reporting to FinCEN. PCT helps you spot reportable deals early and keep closings on track."
        quickLinks={[
          { label: "Check if it's reportable", href: "/fincen/is-it-reportable" },
          { label: "Guidance for agents", href: "/fincen/agents" },
          { label: "Entity & trust buyers", href: "/fincen/entity-trust-buyers" },
          { label: "Trustee sales", href: "/fincen/trustee-sales" },
        ]}
      />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-16">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <section key={section.title}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-secondary">{section.title}</h2>
                </div>

                {"body" in section && section.body && (
                  <p
                    className="text-gray-700 mb-4 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: section.body }}
                  />
                )}

                {"bulletIntro" in section && section.bulletIntro && (
                  <p
                    className="text-gray-700 mb-3 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: section.bulletIntro }}
                  />
                )}

                {"bullets" in section && section.bullets && (
                  <ul className="space-y-2 mb-4">
                    {section.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <span className="text-gray-700" dangerouslySetInnerHTML={{ __html: b }} />
                      </li>
                    ))}
                  </ul>
                )}

                {"note" in section && section.note && (
                  <p className="text-gray-600 mt-3 bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm">
                    {section.note}
                  </p>
                )}

                {"subsections" in section && section.subsections && (
                  <div className="grid md:grid-cols-2 gap-6 mt-4">
                    {section.subsections.map((sub) => (
                      <div key={sub.heading} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <h3 className="font-bold text-secondary mb-3">{sub.heading}</h3>
                        <ul className="space-y-2">
                          {sub.bullets.map((b, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </div>

        {/* Quick nav cards */}
        <div className="mt-16 grid sm:grid-cols-2 gap-4">
          {[
            { label: "Rule Overview", href: "/fincen/rre-rule", desc: "How the rule works, what triggers reporting, and who must file." },
            { label: "Is It Reportable?", href: "/fincen/is-it-reportable", desc: "Quick 3-question checker for a directional answer." },
            { label: "Agent Guidance", href: "/fincen/agents", desc: "Set the right expectations and protect closing timelines." },
            { label: "Entity & Trust Buyers", href: "/fincen/entity-trust-buyers", desc: "What documents and info to prepare before escrow." },
            { label: "Trustee Sales", href: "/fincen/trustee-sales", desc: "Cash buyers at trustee sales — what to have ready." },
            { label: "FAQ", href: "/fincen/faq", desc: "Common questions answered in plain English." },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex items-start gap-4 p-5 bg-white border border-gray-100 rounded-xl hover:border-primary/30 hover:shadow-md transition-all"
            >
              <div className="flex-1">
                <p className="font-semibold text-secondary group-hover:text-primary transition-colors">{card.label}</p>
                <p className="text-sm text-gray-500 mt-1">{card.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors mt-1" />
            </Link>
          ))}
        </div>

      <CTABox
        heading="Keep the Deal Moving — Don't Let FinCEN Surprise You"
        body="If a purchase looks like it may fall under FinCEN reporting, we'll help you understand what's needed and when."
        buttons={[
          { label: "Check if it's reportable", href: "/fincen/is-it-reportable" },
          { label: "Talk to an Escrow Officer", modal: "escrow", variant: "outline" },
        ]}
      />
      </div>

      <Footer />
    </main>
  )
}
