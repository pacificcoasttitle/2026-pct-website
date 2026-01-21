import Link from "next/link"
import { PageHero } from "@/components/page-hero"
import { Shield, Home, FileSearch, AlertTriangle, CheckCircle, ArrowRight, HelpCircle, DollarSign, ChevronRight } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata = {
  title: "Residential Title Insurance | Pacific Coast Title Company",
  description:
    "Protect your property investment with comprehensive title insurance. Learn what title insurance covers and why you need it.",
}

const coverageItems = [
  "Forged deeds, releases, or wills",
  "Undisclosed or missing heirs",
  "Mistakes in recording legal documents",
  "Fraud and impersonation",
  "Unpaid property taxes and special assessments",
  "Outstanding judgments and liens",
  "Invalid or voidable deeds",
  "Defective acknowledgments",
]

const faqs = [
  {
    question: "What is title?",
    answer: `When we talk about "title," we're talking about your legal right to own, use, and sell your property. Think of it as proof that the property is actually yours.

But here's the thing—property ownership has a history. That home you're buying might have been owned by dozens of people over the decades. Each time it changed hands, documents were signed and recorded. And sometimes, mistakes were made.

A title search examines this history to make sure you're getting clear ownership—free from other people's claims, liens, or legal problems that could affect your rights as the new owner.`,
  },
  {
    question: "What is title insurance?",
    answer: `Title insurance is a one-time purchase that protects you from problems in your property's past—things that might not show up even in a thorough title search.

Unlike car or health insurance (which protect against future events), title insurance protects against past issues: a forged signature from 30 years ago, an undisclosed heir, a recording error at the county office.

Here's what makes it a smart investment: You pay once, at closing. That single premium protects you for as long as you (or your heirs) own the property. No renewals. No ongoing payments. Just continuous protection.`,
  },
  {
    question: "What does title insurance cover?",
    answer: `Title insurance covers financial losses from defects in your property's title that existed before you bought it. This includes:

• Forged deeds or releases that void the transfer
• Undisclosed heirs who may have a claim to the property
• Mistakes in recording deeds or other documents
• Fraud or impersonation in previous transactions
• Outstanding liens from unpaid taxes, contractors, or judgments
• Defects that would prevent you from selling or refinancing

If a covered claim arises, the title insurer will either resolve the issue or compensate you for your financial loss—up to the policy amount.`,
  },
  {
    question: "Who needs title insurance?",
    answer: `Two types of policies exist, and you may need both:

**Lender's Policy (Required):** If you're financing your purchase, your lender will require this. It protects their investment in your property—specifically, the loan amount.

**Owner's Policy (Highly Recommended):** This protects YOUR equity and ownership rights. While technically optional, going without it means you're unprotected if a title defect surfaces later. Given that it's a one-time cost that protects your entire investment, most buyers consider it essential.

Bottom line: The lender's policy protects the bank. The owner's policy protects YOU.`,
  },
  {
    question: "How much does title insurance cost?",
    answer: `In California, title insurance rates are regulated by the Department of Insurance, so costs are similar across title companies. The premium is based on the property's sale price (for owner's policies) or loan amount (for lender's policies).

For a typical California home, expect the owner's policy to cost between $1,500 and $3,500—a one-time payment that provides protection for as long as you own the property.

When you consider that you're protecting an investment worth hundreds of thousands (or millions) of dollars, the cost represents a tiny fraction of your total transaction—usually less than 1%.

Use our Rate Calculator to get an instant estimate for your specific transaction.`,
  },
  {
    question: "What happens during a title search?",
    answer: `Before issuing your policy, we conduct a comprehensive search of public records. Here's what we're looking for:

**Ownership Chain:** We trace the property's ownership history to verify the seller actually has the right to sell it.

**Liens and Encumbrances:** We identify any mortgages, tax liens, mechanic's liens, or judgments that must be paid off at closing.

**Easements and Restrictions:** We uncover any rights others may have (like utility access) or restrictions on how you can use the property.

**Legal Descriptions:** We verify the property boundaries match what you think you're buying.

If we find issues, we work to resolve them before closing—so you know exactly what you're getting and aren't surprised later.`,
  },
]

export default function TitleServicesPage() {
  return (
    <>
      <PageHero
        label="Residential Title Insurance"
        title="Protect What's Yours"
        titleHighlight="Before Problems Arise"
        subtitle="One payment at closing. Protection for as long as you own your home. That's the peace of mind title insurance provides."
        backgroundImage="/beautiful-modern-california-home-exterior-with-blu.jpg"
      />

      {/* Why Title Insurance Matters */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-8 text-center">
              Why Your Home Needs Title Insurance
            </h2>
            
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                You're about to make one of the largest purchases of your life. You've done the inspections, 
                secured the financing, and negotiated the price. But there's one risk that's easy to overlook: 
                problems hidden in your property's past.
              </p>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl my-8">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-amber-800 mb-2">Did you know?</p>
                    <p className="text-amber-700 mb-0">
                      More than one-third of all title searches uncover issues that must be resolved before 
                      closing. Without title insurance, any problems discovered AFTER closing become YOUR problem.
                    </p>
                  </div>
                </div>
              </div>

              <p>
                Title insurance protects you from the financial consequences of these hidden defects—forged 
                signatures, undisclosed heirs, recording errors, and more. And unlike other insurance, you 
                pay just once at closing for protection that lasts as long as you own your home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Covered */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                What Title Insurance Covers
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Protection against problems you couldn't have known about
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {coverageItems.map((item) => (
                <div key={item} className="flex items-center gap-3 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Two Types of Policies */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                Two Policies, Complete Protection
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Understanding the difference between lender's and owner's coverage
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Lender's Policy */}
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-6">
                  <DollarSign className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-secondary mb-4">Lender's Policy</h3>
                <p className="text-gray-600 mb-6">
                  Required if you're financing your purchase. Protects the lender's investment 
                  (your loan amount) until the mortgage is paid off.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    Required by your mortgage lender
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    Coverage decreases as you pay down loan
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    Protects the bank, not you
                  </li>
                </ul>
              </div>

              {/* Owner's Policy */}
              <div className="bg-primary/5 border-2 border-primary rounded-2xl p-8 relative">
                <div className="absolute -top-3 right-6 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  RECOMMENDED
                </div>
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mb-6">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-secondary mb-4">Owner's Policy</h3>
                <p className="text-gray-600 mb-6">
                  Protects YOUR equity and ownership rights for as long as you or your heirs 
                  own the property. This is your personal protection.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    One-time premium, lifetime protection
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    Coverage stays at full purchase price
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    Protects YOU and your heirs
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <HelpCircle className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Common questions about title and title insurance
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-white border border-gray-100 rounded-xl px-6 shadow-sm"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="text-lg font-semibold text-secondary">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-6 whitespace-pre-line">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Know Your Costs Before You Commit
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/80">
            Use our instant Rate Calculator to see exactly what title insurance will cost for your transaction—no account required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#tools"
              className="bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2"
            >
              Calculate Your Rate
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="bg-white text-secondary px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Talk to an Expert
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
