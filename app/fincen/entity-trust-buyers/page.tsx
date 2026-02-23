import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FinCENHero } from "@/components/fincen/fincen-hero"
import { CTABox } from "@/components/fincen/cta-box"
import { CheckCircle, Home, UserCheck, Building2, Shield, DollarSign, Clock } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Entity & Trust Buyers: What You'll Need for FinCEN Reporting | PCT",
  description:
    "If you're buying residential property through an LLC, corporation, partnership, or trust in a non-financed transaction, prepare beneficial ownership info and documents early to avoid delays.",
}

export default function EntityTrustBuyersPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      <FinCENHero
        title="Buying in an Entity or Trust? Prepare Early."
        subtitle="If your residential purchase is non-financed and the buyer is an entity or trust, expect identity and ownership requests. The faster you provide them, the smoother the closing."
      />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-14">

          {/* Section 1: When This Usually Applies */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">When This Usually Applies</h2>
            </div>
            <p className="text-gray-700 mb-4">You&apos;re more likely to be impacted when:</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: Home, label: "Residential property", desc: "1–4 units, condo, co-op, or qualifying land" },
                { icon: DollarSign, label: "Cash or private financing", desc: "All-cash or privately financed (as applicable)" },
                { icon: Building2, label: "Entity or trust buyer", desc: "LLC, corporation, partnership, or trust" },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="bg-secondary/5 border border-secondary/10 rounded-xl p-5 text-center">
                    <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-5 h-5 text-secondary" />
                    </div>
                    <p className="font-semibold text-secondary text-sm mb-1">{item.label}</p>
                    <p className="text-xs text-gray-600">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Section 2: What You May Be Asked to Provide */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">What You May Be Asked to Provide</h2>
            </div>

            <div className="space-y-6">
              {/* BOI */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">A</span>
                  <h3 className="text-lg font-bold text-secondary">Beneficial Ownership Information (BOI)</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  Be prepared to provide information on the real people who own or control the purchasing entity or trust, including:
                </p>
                <ul className="space-y-2">
                  {[
                    "Legal name",
                    "Date of birth",
                    "Residential address",
                    "Taxpayer identification number (as required)",
                    "Copy of an unexpired government-issued ID",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Entity docs */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">B</span>
                  <h3 className="text-lg font-bold text-secondary">Entity Documents (LLC / Corp / Partnership)</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">Common requests include:</p>
                <ul className="space-y-2">
                  {[
                    "Formation documents (articles of organization/incorporation)",
                    "Operating agreement / partnership agreement (as applicable)",
                    "EIN (if applicable)",
                    "List of managers/officers/members and control persons (as applicable)",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trust docs */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">C</span>
                  <h3 className="text-lg font-bold text-secondary">Trust Documents (for Trust Buyers)</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">Common requests include:</p>
                <ul className="space-y-2">
                  {[
                    "Trustee and beneficiary information (as applicable)",
                    "Relevant portions of the trust instrument (as applicable)",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Funding */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">D</span>
                  <h3 className="text-lg font-bold text-secondary">Funding Information (Private Financing)</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">If privately financed, you may be asked for:</p>
                <ul className="space-y-2">
                  {[
                    "Source of funds details (as applicable)",
                    "Private lender details (as applicable)",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Timeline Reality */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">Timeline Reality</h2>
            </div>
            <p className="text-gray-700 mb-4">BOI collection can take time when:</p>
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              {[
                "There are multiple beneficial owners",
                "Ownership is layered across multiple entities",
                "Owners are out-of-state or hard to reach",
                "Trust structures require additional documentation",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
            <div className="bg-primary text-white rounded-2xl p-6 text-center">
              <p className="text-lg font-bold">
                If you want a smooth close, treat this like insurance: collect it before you need it.
              </p>
            </div>
          </section>

          {/* Section 4: How PCT Helps */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">How PCT Helps</h2>
            </div>
            <p className="text-gray-700 mb-4">PCT can help coordinate:</p>
            <ul className="space-y-3">
              {[
                "What documents are needed",
                "Who must provide identity information",
                "How to keep the process secure and organized",
                "How to avoid last-minute surprises",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

      <CTABox
        heading="Want a Head Start Checklist?"
        body="Tell us how the buyer plans to take title and how the purchase will be funded. We'll outline the likely next steps."
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
