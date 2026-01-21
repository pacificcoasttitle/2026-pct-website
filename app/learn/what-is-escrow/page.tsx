import Link from "next/link"
import { Lock, ArrowRight, CheckCircle, Shield, AlertCircle, Sparkles, FileText, DollarSign, Users, Calendar, ClipboardCheck, Scale, Phone, Mail } from "lucide-react"

export const metadata = {
  title: "What is Escrow? | Pacific Coast Title",
  description:
    "Escrow is a process where a neutral third party holds funds and documents until all conditions of a real estate transaction are met. Learn how escrow protects you.",
}

const responsibilities = [
  {
    icon: Users,
    title: "Coordinating with All Parties",
    description: "Acting as a neutral third party between buyer, seller, lenders, and agents to ensure everyone meets their obligations.",
  },
  {
    icon: FileText,
    title: "Preparing Documentation",
    description: "Compiling all necessary documents for review and signature, ensuring accuracy and completeness.",
  },
  {
    icon: ClipboardCheck,
    title: "Ordering Payoff Demands",
    description: "Requesting payoff statements from existing lenders to ensure all loans are properly satisfied at closing.",
  },
  {
    icon: Scale,
    title: "Processing Disbursements",
    description: "Calculating and processing payments for commissions, taxes, fees, and seller proceeds.",
  },
  {
    icon: Calendar,
    title: "Meeting Lender Requirements",
    description: "Ensuring all conditions required by the buyer's lender are satisfied before funding.",
  },
  {
    icon: DollarSign,
    title: "Prorating Expenses",
    description: "Calculating buyer and seller portions of property taxes, HOA dues, insurance, and other shared expenses.",
  },
]

const faqItems = [
  {
    question: "When does escrow begin?",
    answer: "Escrow begins when the buyer and seller reach a mutual agreement and the buyer deposits earnest money. This typically happens when the purchase contract is signed by both parties.",
  },
  {
    question: "How long does escrow take?",
    answer: "A typical escrow period is 30-45 days for a residential transaction, though this can vary based on the complexity of the transaction, lender requirements, and any issues that need to be resolved.",
  },
  {
    question: "What does the escrow holder do?",
    answer: "The escrow holder acts as a neutral third party, holding funds and documents, coordinating with all parties, and ensuring all conditions of the sale are met before closing.",
  },
  {
    question: "Is the escrow holder on my side?",
    answer: "Escrow holders are neutral parties—they don't represent either the buyer or seller. Their job is to ensure the transaction is completed fairly according to the agreed-upon terms.",
  },
]

export default function WhatIsEscrowPage() {
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
          <span className="text-primary font-medium">What is Escrow</span>
        </nav>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">5 min read</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
            What is Escrow?
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Escrow is a process where a neutral third party holds funds and documents on behalf of 
            the buyer and seller until all conditions of a real estate transaction are met.
          </p>
        </header>

        {/* Main Content */}
        <div className="prose prose-lg prose-gray max-w-none">
          {/* Definition Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-secondary flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              Understanding Escrow
            </h2>
            <p>
              Think of escrow as a secure handoff. When you're buying a home, you don't want to hand 
              over hundreds of thousands of dollars until you're sure you'll receive clear ownership. 
              The seller doesn't want to sign over the deed until they're sure they'll get paid.
            </p>
            <p>
              Escrow solves this problem by having a neutral third party—the escrow holder—manage 
              the exchange. They hold the buyer's funds and the seller's documents, then coordinate 
              the simultaneous exchange when all conditions are satisfied.
            </p>
          </section>

          {/* When Does Escrow Begin */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-secondary flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              When Does Escrow Begin?
            </h2>
            <p>
              Escrow officially begins when the buyer and seller sign a purchase agreement and the 
              buyer deposits earnest money. This deposit demonstrates the buyer's good faith intention 
              to complete the purchase.
            </p>
            <p>
              From this point, the escrow holder begins coordinating with all parties—buyers, sellers, 
              real estate agents, lenders, and title companies—to ensure everything comes together 
              for a successful closing.
            </p>
          </section>

          {/* Responsibilities Section */}
          <section className="mb-12 not-prose">
            <h2 className="text-2xl font-bold text-secondary flex items-center gap-3 mb-6">
              <ClipboardCheck className="w-6 h-6 text-primary" />
              What Your Escrow Holder Does for You
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {responsibilities.map((item, index) => (
                <div key={index} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-secondary mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Important Note */}
          <section className="mb-12 not-prose">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-lg font-semibold text-amber-900 mb-2">
                    Important to Know
                  </h2>
                  <p className="text-amber-800 mb-2">
                    Escrow holders are <strong>neutral parties</strong>. They don't represent either 
                    the buyer or seller, and they cannot offer legal, tax, or investment advice.
                  </p>
                  <p className="text-amber-800 mb-0">
                    For questions about your specific situation, consult with your real estate agent, 
                    attorney, or financial advisor.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12 not-prose">
            <h2 className="text-2xl font-bold text-secondary mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqItems.map((faq, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-secondary mb-3">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-8 text-center mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Have Questions About Escrow?</h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Our escrow team is here to guide you through the process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+17145166700"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              <Phone className="w-5 h-5" />
              (714) 516-6700
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors"
            >
              <Mail className="w-5 h-5" />
              Contact Us
            </Link>
          </div>
        </div>

        {/* Related Articles */}
        <div className="pt-8 border-t border-gray-100">
          <h3 className="text-lg font-semibold text-secondary mb-4">Continue Learning</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/learn/life-of-escrow"
              className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-secondary group-hover:text-primary transition-colors">
                  Life of an Escrow
                </p>
                <p className="text-sm text-gray-500">The complete escrow process explained</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </Link>
            <Link
              href="/learn/escrow-terms"
              className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-secondary group-hover:text-primary transition-colors">
                  Escrow Terms Glossary
                </p>
                <p className="text-sm text-gray-500">100+ escrow terms explained</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>
      </article>
    </>
  )
}
