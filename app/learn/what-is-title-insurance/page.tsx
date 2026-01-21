import Link from "next/link"
import { Shield, CheckCircle, ArrowRight, Calculator, FileText, AlertTriangle, DollarSign, HelpCircle } from "lucide-react"

export const metadata = {
  title: "What is Title Insurance? | Pacific Coast Title",
  description: "Title insurance protects you from financial loss due to defects in your property's title. Learn how it differs from other insurance and what it covers.",
}

const coverageItems = [
  "Errors in document recording",
  "Fraudulent activities",
  "Undisclosed heirs",
  "Unpaid taxes or liens",
  "Unreleased mortgages",
  "Issues with grantor competency",
  "Ownership misrepresentation",
  "Recorded document issues",
  "Fraud and forgery",
  "Easements",
]

const faqItems = [
  {
    question: "Do I need title insurance?",
    answer: "Yes. Title insurance protects property owners after examination of public records. It eliminates risks and losses caused by faults in title from events that occurred before you owned the property. Most lenders require a lender's policy, but an owner's policy protects your personal investment.",
  },
  {
    question: "How much does title insurance cost?",
    answer: "Title insurance premiums vary by state and relate to your property's value. Unlike other insurance types, title insurance is paid as a single premium at closing—there are no ongoing monthly or annual payments. This one-time fee protects you for as long as you own the property.",
  },
  {
    question: "What's the difference between owner's and lender's policies?",
    answer: "An Owner's Policy protects your ownership interest in the property and lasts as long as you or your heirs own it. A Lender's Policy protects the lender's security interest in the property and only covers the loan amount. Both are typically purchased at closing.",
  },
  {
    question: "How long does title insurance coverage last?",
    answer: "An owner's title insurance policy remains in effect for as long as you or your heirs have an interest in the property. Even after you sell, you're still covered for any warranty claims that may arise from when you owned it.",
  },
]

export default function WhatIsTitleInsurancePage() {
  // FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <article className="max-w-3xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span className="text-gray-300">/</span>
          <Link href="/learn" className="hover:text-primary">Learn</Link>
          <span className="text-gray-300">/</span>
          <span className="text-primary font-medium">What is Title Insurance</span>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">5 min read</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
            What is Title Insurance?
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Title insurance is a way to protect yourself from financial loss and related legal expenses 
            in the event there is a defect in title to your property that is covered by the policy.
          </p>
        </header>

        {/* Main Content */}
        <div className="prose prose-lg prose-gray max-w-none">
          {/* Key Difference Section */}
          <section className="mb-12">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-blue-900 mt-0 mb-2">
                    How is Title Insurance Different from Other Insurance?
                  </h2>
                  <p className="text-blue-800 mb-0">
                    Unlike auto, life, and health insurance that protect against future events, 
                    title insurance focuses on <strong>prevention</strong> rather than assumption of risk. 
                    It addresses <strong>historical</strong> property issues—problems that occurred before 
                    you took ownership. And unlike other insurance, you pay a <strong>single premium</strong> at 
                    closing, not ongoing monthly payments.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Coverage Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-secondary flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              What Does Title Insurance Cover?
            </h2>
            <p className="text-gray-600">
              Title insurance protects against a wide range of issues that could threaten your ownership. 
              Here are the most common covered defects:
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mt-6 not-prose">
              {coverageItems.map((item, index) => (
                <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Policy Types Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-secondary flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              Types of Title Insurance Policies
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 mt-6 not-prose">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-secondary mb-2">Owner's Policy</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Protects <strong>your</strong> ownership interest in the property. Covers you for as long as 
                  you or your heirs own the property, even after you sell.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Protects your equity</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Covers legal defense costs</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Extends to heirs</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                  <DollarSign className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-secondary mb-2">Lender's Policy</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Protects the <strong>lender's</strong> security interest in the property. Required by most 
                  mortgage lenders and covers only the loan amount.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Protects lender's investment</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Coverage decreases with loan balance</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span>Required for most mortgages</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 mb-0">
                <strong>Important:</strong> A lender's policy does NOT protect you, the homeowner. 
                Only an owner's policy protects your personal investment in the property.
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-secondary mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4 not-prose">
              {faqItems.map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-3">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* CTA Banner */}
        <div className="mt-12 bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Get a Title Insurance Quote</h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Use our free calculator to estimate your title insurance costs in seconds.
          </p>
          <Link
            href="/#tools"
            className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            <Calculator className="w-5 h-5" />
            Get a Quote
          </Link>
        </div>

        {/* Related Articles */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <h3 className="text-lg font-semibold text-secondary mb-4">Continue Learning</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/learn/benefits-of-title-insurance"
              className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-secondary group-hover:text-primary transition-colors">
                  Benefits of Title Insurance
                </p>
                <p className="text-sm text-gray-500">Why it's the best investment for your home</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </Link>
            <Link
              href="/learn/top-10-title-problems"
              className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-secondary group-hover:text-primary transition-colors">
                  Top 10 Title Problems
                </p>
                <p className="text-sm text-gray-500">Common issues title insurance protects against</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>
      </article>
    </>
  )
}
