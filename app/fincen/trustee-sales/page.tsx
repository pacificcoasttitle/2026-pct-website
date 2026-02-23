import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FinCENHero } from "@/components/fincen/fincen-hero"
import { CTABox } from "@/components/fincen/cta-box"
import { CheckCircle, Gavel, HelpCircle, UserCheck, Users, Shield, XCircle } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Trustee Sale Purchases & FinCEN Reporting | PCT FinCEN Division",
  description:
    "Many trustee sale purchases may be impacted starting March 1, 2026 when buyers use entities or trusts and purchase all-cash or with private financing. Learn what to prepare.",
}

export default function TrusteeSalesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      <FinCENHero
        title="Trustee Sale Buyers: Don't Let FinCEN Slow You Down"
        subtitle="If you buy trustee sales using an entity or trust—and you're paying cash or using private funds—your purchase may trigger FinCEN reporting. Preparation is everything."
      />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-14">

          {/* Section 1: Quick Overview */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Gavel className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">Quick Overview</h2>
            </div>
            <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                A nationwide rule from FinCEN requires reporting of certain residential real estate purchases—including many
                trustee sale purchases—when:
              </p>
              <ul className="space-y-3">
                {[
                  "The property is residential",
                  "The buyer uses a legal entity or trust",
                  "The purchase is all-cash or privately financed (as applicable)",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 2: Is Your Trustee Sale Reportable? */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">Is Your Trustee Sale Purchase Reportable?</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Likely reportable */}
              <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                <h3 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-red-600" />
                  Likely reportable if ALL apply:
                </h3>
                <ul className="space-y-3">
                  {[
                    "Property is residential real estate (1–4 units, condo, co-op, or qualifying land)",
                    "Buyer is a legal entity or trust (LLC, corporation, partnership, trust)",
                    "Purchase is all-cash or financed by a private/non-regulated lender (including many hard-money or seller-financed loans)",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                      <CheckCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Likely not reportable */}
              <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
                <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-green-600" />
                  Likely NOT reportable if:
                </h3>
                <div className="flex items-start gap-2 text-sm text-green-700 mb-4">
                  <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>You buy as an <strong>individual (personal name)</strong></span>
                </div>
                <p className="text-xs text-green-600 bg-green-100 rounded-lg p-3">
                  Always confirm facts with escrow.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: What Buyers Must Provide */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">What Buyers Must Provide</h2>
            </div>
            <div className="space-y-4">
              {[
                {
                  num: 1,
                  title: "Beneficial Ownership Information (BOI)",
                  items: ["Legal name", "Date of birth", "Residential address", "Government-issued ID (unexpired)"],
                },
                {
                  num: 2,
                  title: "Entity Documents (LLC, Corp, Partnership)",
                  items: [
                    "Articles of organization/incorporation",
                    "Operating or partnership agreement",
                    "EIN",
                    "List of managers/officers/members (as applicable)",
                  ],
                },
                {
                  num: 3,
                  title: "Trust Documents",
                  items: [
                    "Trustee and beneficiary information (as applicable)",
                    "Relevant portions of the trust instrument",
                  ],
                },
                {
                  num: 4,
                  title: "Funding Information (Private Financing)",
                  items: ["Source of funds (as applicable)", "Private lender details (as applicable)"],
                },
              ].map((group) => (
                <div key={group.num} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {group.num}
                    </span>
                    <h3 className="font-bold text-secondary">{group.title}</h3>
                  </div>
                  <ul className="space-y-2 ml-10">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Who Files */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">Who Files?</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              FinCEN uses a <strong>reporting cascade</strong> to determine who must file. If a settlement/escrow or closing
              agent is involved, they may be responsible for filing the report (depending on cascade/designation agreement).
            </p>
          </section>

          {/* Section 5: PCT Can Help */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">PCT Can Help You Move Fast</h2>
            </div>
            <p className="text-gray-700 mb-4">Trustee sale timelines are tight. We can help you:</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                "Understand likely requirements early",
                "Gather BOI and documents in an organized way",
                "Reduce the risk of avoidable closing delays",
              ].map((item, i) => (
                <div key={i} className="bg-secondary/5 border border-secondary/10 rounded-xl p-5 text-center">
                  <CheckCircle className="w-6 h-6 text-primary mx-auto mb-3" />
                  <p className="text-gray-700 text-sm font-medium">{item}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

      <CTABox
        heading="Buying Trustee Sales with an LLC or Trust?"
        body="Start the process early—especially if you're purchasing residential property with cash or private funds."
        buttons={[
          { label: "Start FinCEN Intake", href: "/fincen/contact" },
          { label: "Check if it's reportable", href: "/fincen/is-it-reportable", variant: "outline" },
        ]}
      />
      </div>

      <Footer />
    </main>
  )
}
