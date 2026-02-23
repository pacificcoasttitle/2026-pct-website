import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FinCENHero } from "@/components/fincen/fincen-hero"
import { CTABox } from "@/components/fincen/cta-box"
import { ArrowRight, Download, BookOpen, CheckCircle } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "FinCEN Resources & Glossary | PCT FinCEN Division",
  description:
    "Downloadable resources, a practical glossary, and quick links to help buyers, agents, and investors prepare for FinCEN real estate reporting starting March 1, 2026.",
}

const quickLinks = [
  { label: "Is it reportable?", href: "/fincen/is-it-reportable", desc: "Quick 3-question checker" },
  { label: "Agent Guidance", href: "/fincen/agents", desc: "What agents need to know" },
  { label: "Entity & Trust Buyers", href: "/fincen/entity-trust-buyers", desc: "Document preparation guide" },
  { label: "Trustee Sales", href: "/fincen/trustee-sales", desc: "Trustee sale buyer checklist" },
  { label: "FAQ", href: "/fincen/faq", desc: "Plain-English answers" },
]

const downloads = [
  { title: "FinCEN: What Agents Need to Know", type: "PDF", href: "#" },
  { title: "Is It Reportable? Flowchart", type: "PDF", href: "#" },
  { title: "Entity/Trust Buyer Checklist", type: "PDF", href: "#" },
  { title: "Trustee Sale Buyer Checklist", type: "PDF", href: "#" },
]

const glossary = [
  {
    term: "FinCEN",
    def: "The Financial Crimes Enforcement Network, a bureau of the U.S. Department of the Treasury focused on combating money laundering and financial crimes.",
  },
  {
    term: "RRE Rule / Residential Real Estate Reporting Rule",
    def: "A FinCEN rule requiring reporting for certain residential real estate transfers, effective for closings on or after March 1, 2026.",
  },
  {
    term: "Transferee",
    def: "The buyer receiving the property.",
  },
  {
    term: "Beneficial Owner",
    def: "The real individual(s) who own or control the purchasing entity or trust—often including 25%+ owners and/or those exercising substantial control (as applicable).",
  },
  {
    term: "Designation Agreement",
    def: "A signed agreement that can transfer reporting responsibility between parties in the reporting cascade, when allowed.",
  },
  {
    term: "Non-financed / Privately financed",
    def: "A transaction funded by cash or certain private money (as applicable), rather than traditional financing by a lender with an AML program.",
  },
  {
    term: "AML Program",
    def: "Anti-Money Laundering program used by certain financial institutions; when present in traditional financing it often reduces reportability likelihood (fact-specific).",
  },
]

const readyChecklist = [
  "Buyer vesting plan (individual vs entity/trust)",
  "Ownership/control details for entity/trust",
  "IDs for beneficial owners",
  "Entity/trust documents",
  "Funding/source of funds details (as applicable)",
]

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      <FinCENHero
        title="Resources, Checklists & Glossary"
        subtitle="Save, share, and keep your next closing moving."
      />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-16">

          {/* Quick Links */}
          <section>
            <h2 className="text-2xl font-bold text-secondary mb-6 flex items-center gap-3">
              <ArrowRight className="w-6 h-6 text-primary" />
              Quick Links
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-start gap-3 p-5 bg-white border border-gray-100 rounded-xl hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-secondary group-hover:text-primary transition-colors">{link.label}</p>
                    <p className="text-sm text-gray-500 mt-1">{link.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors mt-0.5 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </section>

          {/* Downloadables */}
          <section>
            <h2 className="text-2xl font-bold text-secondary mb-4 flex items-center gap-3">
              <Download className="w-6 h-6 text-primary" />
              Downloadables
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              {downloads.map((dl) => (
                <div
                  key={dl.title}
                  className="flex items-center gap-4 p-5 bg-gray-50 border border-gray-100 rounded-xl"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Download className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-secondary text-sm">{dl.title}</p>
                    <span className="text-xs text-gray-400 uppercase tracking-wide">{dl.type}</span>
                  </div>
                  <a
                    href={dl.href}
                    className="text-sm text-primary font-medium hover:underline"
                    aria-label={`Download ${dl.title}`}
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 bg-secondary/5 border border-secondary/10 rounded-xl p-4">
              Want these branded for your team? PCT can provide updated handouts as the rule approaches.
            </p>
          </section>

          {/* Glossary */}
          <section>
            <h2 className="text-2xl font-bold text-secondary mb-6 flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-primary" />
              Glossary
            </h2>
            <div className="space-y-4">
              {glossary.map((item) => (
                <div key={item.term} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <p className="font-bold text-primary mb-2">{item.term}</p>
                  <p className="text-gray-700 text-sm leading-relaxed">{item.def}</p>
                </div>
              ))}
            </div>
          </section>

          {/* What to Have Ready */}
          <section>
            <h2 className="text-2xl font-bold text-secondary mb-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-primary" />
              "What to Have Ready"
            </h2>
            <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-6">
              <p className="text-sm text-gray-600 mb-4">Short checklist for entity/trust buyers in non-financed transactions:</p>
              <ul className="space-y-3">
                {readyChecklist.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

      <CTABox
        heading="Want the Checklist Tailored to Your Deal?"
        body="Tell us how the buyer will take title and how the deal will be funded. We'll help you plan what's needed next."
        buttons={[
          { label: "Start FinCEN Intake", href: "/fincen/contact" },
          { label: "Talk to an Escrow Officer", href: "/fincen/contact", variant: "outline" },
        ]}
      />
      </div>

      <Footer />
    </main>
  )
}
