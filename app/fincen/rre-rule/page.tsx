import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FinCENHero } from "@/components/fincen/fincen-hero"
import { CTABox } from "@/components/fincen/cta-box"
import { CheckCircle, Home, List, FileText, Users, GitBranch, Archive, AlertTriangle, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Residential Real Estate Reporting Rule (RRE Rule) | PCT FinCEN Division",
  description:
    "Overview of FinCEN's Residential Real Estate Reporting Rule effective March 1, 2026—what triggers reporting, what's collected, and how reporting responsibility is determined.",
}

export default function RREPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      <FinCENHero
        title="FinCEN's Residential Real Estate Reporting Rule — The Practical Version"
        subtitle="What triggers reporting, what gets collected, and why early coordination matters."
      />

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-14">

          {/* Section 1: What the Rule Covers */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">What the Rule Covers</h2>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              The rule targets certain residential real estate transfers, including:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {["1–4 family dwellings", "Condominiums and townhomes", "Co-ops", "Vacant land intended for residential construction"].map((item) => (
                <div key={item} className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Three-Part Trigger */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <List className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">The "Three-Part Trigger"</h2>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
              A transaction is typically subject to mandatory reporting when <strong>all</strong> of the following are true:
            </p>
            <div className="space-y-4">
              {[
                { num: 1, text: "The property is <strong>residential</strong>" },
                { num: 2, text: "The transaction is <strong>non-financed</strong> (all-cash or certain private money), or otherwise not covered by a lender AML program" },
                { num: 3, text: "The buyer (transferee) is a <strong>legal entity or trust</strong>" },
              ].map((step) => (
                <div key={step.num} className="flex items-start gap-4 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {step.num}
                  </span>
                  <p className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: step.text }} />
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4">
              If any part doesn&apos;t apply, reporting may not be required—but exemptions and facts matter.
            </p>
          </section>

          {/* Section 3: What Must Be Collected */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">What Must Be Collected</h2>
            </div>
            <p className="text-gray-700 mb-4">For impacted transactions, information collected may include:</p>
            <ul className="space-y-3">
              {[
                "Beneficial ownership information (BOI) for the purchasing entity or trust",
                "Legal names, addresses, dates of birth, and taxpayer identification numbers (as required)",
                "Copies of <strong>unexpired government-issued identification</strong>",
                "Entity formation and control documentation (as applicable)",
                "Trust-related information and relevant portions of trust documentation (as applicable)",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-gray-700" dangerouslySetInnerHTML={{ __html: item }} />
                </li>
              ))}
            </ul>
          </section>

          {/* Section 4: Reporting Cascade */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">Who Files — The Reporting "Cascade"</h2>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Reporting responsibility is determined by a <strong>cascade of responsibility</strong>. When no designation
              agreement exists, the default reporting person is typically the party listed as the closing/settlement agent
              on the closing statement.
            </p>
          </section>

          {/* Section 5: Designation Agreements */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <GitBranch className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">Designation Agreements</h2>
            </div>
            <p className="text-gray-700 mb-4 leading-relaxed">
              A valid <strong>designation agreement</strong> can transfer reporting responsibility between parties (for
              example, a title company, attorney, or other party). When used, parties should:
            </p>
            <ul className="space-y-2">
              {[
                "Ensure it is properly executed (signed by both parties)",
                "<strong>Retain copies</strong> as part of the record file",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700" dangerouslySetInnerHTML={{ __html: item }} />
                </li>
              ))}
            </ul>
          </section>

          {/* Section 6: Record Retention */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Archive className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">Record Retention</h2>
            </div>
            <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-6">
              <p className="text-gray-700 mb-3">Copies of:</p>
              <ul className="space-y-2 mb-4">
                {["The filed report", "Any designation agreement", "Supporting documentation"].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-gray-700">
                …must be retained for <strong className="text-secondary">five (5) years from the date of filing</strong>.
              </p>
            </div>
          </section>

          {/* Section 7: Why This Matters */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-secondary">Why This Matters</h2>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Noncompliance can carry significant consequences, so the best strategy is simple:
            </p>
            <div className="bg-primary text-white rounded-2xl p-8 text-center">
              <p className="text-xl font-bold">Identify it early. Collect early. Close clean.</p>
            </div>
          </section>

          {/* Quick nav back */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/fincen"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline text-sm"
            >
              ← Back to FinCEN Overview
            </Link>
            <Link
              href="/fincen/is-it-reportable"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline text-sm"
            >
              Check if it's reportable →
            </Link>
          </div>
        </div>

      <CTABox
        heading="Want to Know If Your Deal Triggers Reporting?"
        body="Use the quick checker to get a directional answer, then confirm with escrow."
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
