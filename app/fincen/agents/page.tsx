import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FinCENHero } from "@/components/fincen/fincen-hero"
import { CTABox } from "@/components/fincen/cta-box"
import { Users, FileText, ClipboardList, Calendar, MessageSquare, CheckCircle } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FinCEN Reporting: What Real Estate Agents Need to Know | PCT",
  description:
    "Agents don't file FinCEN reports, but your buyers and sellers will be impacted starting March 1, 2026. Learn how to set expectations and protect timelines.",
}

const steps = [
  {
    num: 1,
    title: "Notify clients early",
    desc: "If they plan to buy in an entity or trust and the deal may be non-financed, set expectations before the offer is written.",
  },
  {
    num: 2,
    title: "Prepare entity/trust buyers",
    desc: "Explain that escrow/title may request personal identifying information for all beneficial owners—not just the signatory.",
  },
  {
    num: 3,
    title: "Manage timelines",
    desc: "BOI collection can take time for complex entities or out-of-state owners. Factor this into your closing timeline.",
  },
  {
    num: 4,
    title: "Avoid contract delays",
    desc: "Encourage rapid response to escrow/title requests. Slow responses are the most common source of FinCEN-related delays.",
  },
]

export default function AgentsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      <FinCENHero
        title="Real Estate Agents: Your Buyers Will Feel This"
        subtitle="You're not the filer—but you can prevent the most common FinCEN-driven delays with one simple move: set expectations early."
      />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-14">

          {/* Section 1: Who Is Affected */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">Who Is Affected</h2>
            </div>
            <p className="text-gray-700 mb-4">A closing is subject to mandatory FinCEN reporting if <strong>all three</strong> criteria apply:</p>
            <div className="space-y-3">
              {[
                { num: 1, label: "Non-financed purchase", desc: "Cash or certain private-money loans" },
                { num: 2, label: "Buyer is an entity or trust", desc: "LLCs, corporations, partnerships, and many trusts" },
                { num: 3, label: "Residential property", desc: "1–4 family, condo/townhome, duplex, etc." },
              ].map((item) => (
                <div key={item.num} className="flex items-start gap-4 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {item.num}
                  </span>
                  <div>
                    <p className="font-semibold text-secondary">{item.label}</p>
                    <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: What Will Be Required */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">What Will Be Required</h2>
            </div>
            <p className="text-gray-700 mb-4">
              For impacted transactions, the title/settlement company may need to collect and report:
            </p>
            <ul className="space-y-3">
              {[
                "Beneficial ownership information (BOI) for the purchasing entity or trust",
                "Legal names, addresses, dates of birth, and taxpayer identification numbers (as required)",
                "Copies of unexpired government-issued identification",
                "Entity formation documents and control person information (as applicable)",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 3: Agent Playbook */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">What Agents Should Do — The Agent Playbook</h2>
            </div>
            <div className="space-y-4">
              {steps.map((step) => (
                <div key={step.num} className="flex gap-4 bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <span className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold flex-shrink-0">
                    {step.num}
                  </span>
                  <div>
                    <p className="font-bold text-secondary">{step.title}</p>
                    <p className="text-gray-600 text-sm mt-1">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Contract & Timeline Tips */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">Contract & Timeline Tips</h2>
            </div>
            <p className="text-gray-700 mb-4">Consider building in:</p>
            <ul className="space-y-3">
              {[
                "Time for BOI collection/verification (especially with multiple beneficial owners)",
                "Clear responsibility for providing requested ID and documents quickly",
                "Early escrow opening when entity/trust structure is known",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 5: What to Say to Clients */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">What to Say to Clients</h2>
            </div>
            <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-6">
              <p className="text-sm font-semibold text-secondary mb-3 uppercase tracking-wide">Suggested Plain-English Script</p>
              <blockquote className="text-gray-700 italic leading-relaxed text-lg border-l-4 border-primary pl-5">
                &ldquo;Because you&apos;re buying with an LLC/trust and this may be a non-financed deal, escrow may need additional
                identity and ownership information for FinCEN reporting. If you respond quickly to requests, we can keep the
                closing timeline intact.&rdquo;
              </blockquote>
            </div>
          </section>
        </div>

      <CTABox
        heading="Want Help Spotting Reportable Deals?"
        body="Send us the scenario early—property type, buyer type, and financing. We'll help you set the right expectations."
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
