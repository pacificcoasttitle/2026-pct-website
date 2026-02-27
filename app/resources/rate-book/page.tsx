import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import Link from "next/link"
import { Download, ChevronRight, FileText, Calculator, RefreshCw } from "lucide-react"

export const metadata = {
  title: "Rate Book | Pacific Coast Title",
  description: "Download our Schedule of Title Fees and Refinance Ratesheet. Complete rate information for all transaction types.",
}

export default function RateBookPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      <PageHero
        label="Rate Information"
        title="Rate Book"
        subtitle="Our rates at your fingertips. Download our complete Schedule of Title Fees and quick reference Refinance Ratesheet."
      />

      {/* Downloads */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Schedule of Title Fees */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-secondary to-secondary/90 p-8 text-white">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                  <FileText className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Schedule of Title Fees</h2>
                <p className="text-white/80">2024 Ratebook</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <Calculator className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Complete fee schedule for all transaction types</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Calculator className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Rate calculations and policy comparison charts</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Calculator className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Purchase and refinance rates side-by-side</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Calculator className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Endorsement pricing reference</span>
                  </li>
                </ul>
                <a
                  href="https://documents.pct.com/industry-documents/2024-Ratebook.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-semibold transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </a>
              </div>
            </div>

            {/* Refinance Ratesheet */}
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-primary to-primary/90 p-8 text-white">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                  <RefreshCw className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Refinance Ratesheet</h2>
                <p className="text-white/80">Quick Reference Guide</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <Calculator className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Streamlined refinance transaction fees</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Calculator className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Quick rate lookup by loan amount</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Calculator className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Lender policy premiums at a glance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Calculator className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Perfect for quick client estimates</span>
                  </li>
                </ul>
                <a
                  href="https://documents.pct.com/industry-documents/RefinanceRate.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-secondary hover:bg-secondary/90 text-white py-4 rounded-xl font-semibold transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </a>
              </div>
            </div>
          </div>

          {/* Online Calculator CTA */}
          <div className="mt-16 max-w-4xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-10 text-center border border-gray-200">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calculator className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-secondary mb-4">Need a Quick Estimate?</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Use our online rate calculator to get instant estimates for title, escrow, and closing costs.
            </p>
            <Link
              href="/#tools"
              className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Open Rate Calculator
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
