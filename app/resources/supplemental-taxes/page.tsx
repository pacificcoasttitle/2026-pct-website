import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import Link from "next/link"
import { ChevronRight, ExternalLink, HelpCircle, Calculator, Calendar, DollarSign, AlertCircle } from "lucide-react"
import { supplementalTaxProrationFactors } from "@/data/resources"

export const metadata = {
  title: "Supplemental Property Taxes | Pacific Coast Title",
  description: "Understanding California supplemental property tax assessments. Learn what they are, how they're calculated, and when you'll be billed.",
}

export default function SupplementalTaxesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      <PageHero
        label="Tax Guide"
        title="Supplemental Taxes"
        subtitle="What are they and how they affect you? Everything you need to know about California's supplemental property tax system."
      />

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Alert Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-12 flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">Important for New Property Owners</h3>
                <p className="text-amber-800">
                  Supplemental tax bills are in addition to your regular annual property tax bill. 
                  They are NOT collected through your mortgage impound account.
                </p>
              </div>
            </div>

            {/* FAQ Sections */}
            <div className="space-y-12">
              {/* What Are Supplemental Taxes */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-secondary">What Are Supplemental Property Taxes?</h2>
                </div>
                <div className="prose prose-gray max-w-none">
                  <p>
                    Supplemental property taxes are additional property taxes that result from a reassessment of 
                    your property after a change in ownership or completion of new construction.
                  </p>
                  <p>
                    Under <strong>Proposition 13</strong> (passed in 1978), California properties are assessed at their 
                    purchase price and can only increase by a maximum of 2% per year. When a property is sold, 
                    it's reassessed at the new purchase price, which often creates a difference between the old 
                    assessment and the new one.
                  </p>
                </div>
              </div>

              {/* When Did This Come Into Effect */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-secondary">When Did This Tax Come Into Effect?</h2>
                </div>
                <div className="prose prose-gray max-w-none">
                  <p>
                    The supplemental property tax was established by <strong>Senate Bill 813</strong> in July 1983. 
                    This legislation required counties to immediately reassess property upon change of ownership 
                    or new construction, rather than waiting until the next fiscal year.
                  </p>
                </div>
              </div>

              {/* How Will It Affect Me */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-secondary">How Will Supplemental Taxes Affect Me?</h2>
                </div>
                <div className="prose prose-gray max-w-none">
                  <p>
                    As a new property owner, you will receive one or two supplemental tax bills in addition to 
                    your regular annual property tax bill:
                  </p>
                  <ul>
                    <li>
                      <strong>If the purchase results in a higher assessed value</strong> (which is typical), 
                      you'll owe additional taxes for the remainder of the current fiscal year.
                    </li>
                    <li>
                      <strong>If the purchase results in a lower assessed value</strong> (less common), 
                      you may receive a refund.
                    </li>
                  </ul>
                  <p>
                    Depending on when you close escrow, you may receive either one or two supplemental tax bills:
                  </p>
                  <ul>
                    <li><strong>Close between July 1 - December 31:</strong> You'll receive TWO supplemental bills</li>
                    <li><strong>Close between January 1 - June 30:</strong> You'll receive ONE supplemental bill</li>
                  </ul>
                </div>
              </div>

              {/* When Will I Be Billed */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-secondary">When and How Will I Be Billed?</h2>
                </div>
                <div className="prose prose-gray max-w-none">
                  <p>
                    Supplemental tax bills are typically mailed 60-90 days after the change of ownership is recorded. 
                    The bill will come directly from your county's tax collector.
                  </p>
                  <p>
                    <strong>Important:</strong> These bills are NOT included in your mortgage impound account. 
                    You are responsible for paying them directly to the county tax collector.
                  </p>
                </div>
              </div>

              {/* Installment Payments */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-secondary">Can I Pay in Installments?</h2>
                </div>
                <div className="prose prose-gray max-w-none">
                  <p>
                    Yes! Like regular property taxes, supplemental taxes can be paid in two installments:
                  </p>
                  <ul>
                    <li><strong>First Installment:</strong> Due upon receipt, delinquent 30 days after date on bill</li>
                    <li><strong>Second Installment:</strong> Due upon receipt, delinquent 30 days after first installment delinquency date</li>
                  </ul>
                </div>
              </div>

              {/* Proration Factor Table */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-secondary">How Is the Amount Determined?</h2>
                </div>
                <div className="prose prose-gray max-w-none mb-6">
                  <p>
                    The supplemental tax is prorated based on the month the property changes ownership. 
                    The county uses "proration factors" to calculate how much of the fiscal year's tax difference you owe.
                  </p>
                </div>

                {/* Proration Factor Table */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Monthly Proration Factors</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {supplementalTaxProrationFactors.map((item) => (
                      <div 
                        key={item.month}
                        className="bg-white rounded-lg p-3 border border-gray-100 text-center"
                      >
                        <p className="text-sm text-gray-500">{item.month}</p>
                        <p className="text-lg font-bold text-primary">{item.factor.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    * Factor of 0.00 in July means a full year's supplemental tax will be prorated into the next fiscal year's regular tax bill.
                  </p>
                </div>
              </div>
            </div>

            {/* External Calculator Links */}
            <div className="mt-16">
              <h2 className="text-xl font-bold text-secondary mb-6">County Supplemental Tax Calculators</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <a
                  href="https://assessor.lacounty.gov/supplemental-tax-estimator/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-primary hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary">Los Angeles County</h3>
                      <p className="text-sm text-gray-500">Assessor Calculator</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                  </div>
                </a>
                <a
                  href="https://www.ocgov.com/residents/property-taxes/supplemental-tax-calculator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-primary hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary">Orange County</h3>
                      <p className="text-sm text-gray-500">Assessor Calculator</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                  </div>
                </a>
                <a
                  href="https://www.asrclkrec.com/Assessor/SupplementalTaxEstimator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-primary hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-primary">Riverside County</h3>
                      <p className="text-sm text-gray-500">Assessor Calculator</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                  </div>
                </a>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-16 bg-gradient-to-br from-secondary to-secondary/90 rounded-2xl p-10 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Have Questions About Property Taxes?</h3>
              <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                Our escrow team can help you understand your tax obligations and ensure a smooth closing.
              </p>
              <Link
                href="/contact"
                className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
