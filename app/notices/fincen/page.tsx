import Link from "next/link"
import { PageHero } from "@/components/page-hero"
import { 
  Shield, AlertTriangle, Building2, Users, Briefcase, DollarSign,
  ChevronRight, Phone, Mail, CheckCircle, XCircle, Clock, Scale,
  HelpCircle, FileWarning, CalendarCheck
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata = {
  title: "FinCEN Anti-Money Laundering Rule | Pacific Coast Title",
  description:
    "New FinCEN reporting requirements effective March 1, 2026 for certain residential property transfers to legal entities or trusts.",
}

const whoAffected = [
  {
    icon: Building2,
    title: "Title Companies",
    description: "Required to file reports for covered transactions involving non-financed purchases by legal entities.",
  },
  {
    icon: Users,
    title: "Settlement Agents",
    description: "Must collect and verify beneficial ownership information from purchasing entities.",
  },
  {
    icon: Briefcase,
    title: "Real Estate Professionals",
    description: "Should be aware of documentation requirements that may affect transaction timelines.",
  },
  {
    icon: DollarSign,
    title: "Cash Transaction Participants",
    description: "Buyers using legal entities or trusts for non-financed (cash) purchases.",
  },
]

const propertiesCovered = [
  "Single-family homes",
  "Condominiums",
  "Multi-unit residential properties (2-4 units)",
  "Vacant residential land",
  "Some commercial properties",
]

const exemptions = [
  "Easement transfers",
  "Death-related transfers",
  "Divorce-related transfers",
  "Bankruptcy estate transfers",
  "Court-supervised transfers",
  "Certain trust transfers",
  "1031 exchanges (with qualified intermediary)",
  "Transactions without reporting persons",
]

const faqs = [
  {
    question: "What information is required in the report?",
    answer: "Beneficial ownership information for the legal entity or trust purchasing the property, including names, addresses, and identification numbers of beneficial owners with 25% or greater ownership interest.",
  },
  {
    question: "Does this apply to financed transactions?",
    answer: "No, this rule specifically targets non-financed (cash) transactions to legal entities or trusts. Traditional mortgage transactions where a lender is involved are not covered by this reporting requirement.",
  },
  {
    question: "Who is responsible for filing?",
    answer: "The title company or settlement agent handling the transaction is typically responsible for filing the required reports with FinCEN within the specified timeline.",
  },
  {
    question: "How does this affect my closing timeline?",
    answer: "Additional documentation may be required from buyers using legal entities. We recommend providing entity documentation, including beneficial ownership information, early in the transaction to avoid closing delays.",
  },
  {
    question: "What if I can't identify all beneficial owners?",
    answer: "The rule requires reasonable efforts to identify beneficial owners. If ownership cannot be determined despite good faith efforts, this should be documented. Consult with legal counsel for specific guidance.",
  },
  {
    question: "Are LLCs always subject to this rule?",
    answer: "LLCs purchasing residential property with non-financed funds are generally subject to the reporting requirements. However, certain exemptions may apply based on the specific circumstances of the transaction.",
  },
]

export default function FinCENPage() {
  return (
    <>
      <PageHero
        label="Federal Compliance Requirement"
        title="FinCEN Anti-Money Laundering Rule"
        subtitle="Understanding the new reporting requirements for residential property transfers."
      />

      {/* Alert Banner */}
      <div className="bg-amber-500 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
            <p className="font-semibold text-center">
              Effective March 1, 2026 — New reporting requirements are now in effect.
            </p>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-secondary mb-6 flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              What is the FinCEN Rule?
            </h2>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p>
                The Financial Crimes Enforcement Network (FinCEN) has implemented new reporting 
                requirements for residential property transfers to legal entities or trusts that are 
                <strong> non-financed (cash transactions)</strong>.
              </p>
              <p>
                This rule is designed to increase transparency in real estate transactions and combat 
                money laundering through property purchases. Title companies and settlement agents are 
                now required to collect beneficial ownership information and file reports for covered 
                transactions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Is Affected */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-secondary mb-8 text-center">
              Who Does This Affect?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {whoAffected.map((item, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-secondary mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Properties Covered */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-secondary mb-8">Properties Covered</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {propertiesCovered.map((property, index) => (
                <div key={index} className="flex items-center gap-3 bg-green-50 rounded-xl p-4">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{property}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filing Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-secondary mb-8 flex items-center gap-3">
              <Clock className="w-8 h-8 text-primary" />
              Filing Timeline
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              Reports must be filed by the <strong>later</strong> of:
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border-2 border-primary rounded-xl p-6 text-center">
                <CalendarCheck className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-secondary mb-2">Option A</h3>
                <p className="text-gray-600">
                  Final day of the month <strong>following</strong> closing
                </p>
              </div>
              <div className="bg-white border-2 border-secondary rounded-xl p-6 text-center">
                <Clock className="w-10 h-10 text-secondary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-secondary mb-2">Option B</h3>
                <p className="text-gray-600">
                  <strong>30 calendar days</strong> after closing
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-semibold text-blue-900 mb-2">Example:</h4>
              <p className="text-blue-800">
                For a transaction closing on <strong>March 15, 2026</strong>, the report would be due by:
              </p>
              <ul className="mt-2 space-y-1 text-blue-800">
                <li>• <strong>April 30, 2026</strong> (end of following month), OR</li>
                <li>• <strong>April 14, 2026</strong> (30 days after closing)</li>
              </ul>
              <p className="mt-2 text-blue-800">
                Whichever is <strong>later</strong> — in this case, April 30, 2026.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Penalties Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-secondary mb-8 flex items-center gap-3">
              <Scale className="w-8 h-8 text-red-500" />
              Penalties for Non-Compliance
            </h2>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <FileWarning className="w-6 h-6 text-red-600" />
                    <h3 className="text-xl font-bold text-red-900">Civil Penalties</h3>
                  </div>
                  <p className="text-3xl font-bold text-red-700 mb-2">
                    $1,394 – $108,489
                  </p>
                  <p className="text-red-800">per violation</p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <h3 className="text-xl font-bold text-red-900">Criminal Penalties</h3>
                  </div>
                  <p className="text-red-800 mb-2">
                    Up to <strong className="text-red-700">$250,000</strong> fine
                  </p>
                  <p className="text-red-800">
                    and/or <strong className="text-red-700">5 years</strong> imprisonment
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-red-200">
                <p className="text-red-900 font-medium">
                  Compliance is mandatory. Pacific Coast Title is committed to meeting all FinCEN requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Exemptions Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-secondary mb-4">Exempt Transactions</h2>
            <p className="text-lg text-gray-600 mb-8">
              The following transaction types are generally exempt from FinCEN reporting:
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {exemptions.map((exemption, index) => (
                <div key={index} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                  <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-700">{exemption}</span>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Disclaimer:</strong> Exemptions may have specific requirements. Consult with 
                legal counsel for guidance on your specific situation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-secondary mb-8 flex items-center gap-3">
              <HelpCircle className="w-8 h-8 text-primary" />
              Frequently Asked Questions
            </h2>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`faq-${index}`}
                  className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm"
                >
                  <AccordionTrigger className="px-6 py-4 text-left hover:no-underline hover:bg-gray-50">
                    <span className="font-semibold text-secondary">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-br from-primary to-primary/90">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Questions About FinCEN Compliance?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Our compliance team is here to help you navigate the new requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+17145166700"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              <Phone className="w-5 h-5" />
              (714) 516-6700
            </a>
            <a
              href="mailto:info@pct.com"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-colors"
            >
              <Mail className="w-5 h-5" />
              info@pct.com
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
