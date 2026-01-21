import Link from "next/link"
import { PageHero } from "@/components/page-hero"
import { 
  ArrowLeftRight, Building, Home, Repeat, Shield, Users, 
  ChevronRight, Download, Mail, Phone, ArrowRight, Clock,
  HelpCircle, FileText, CheckCircle, AlertCircle
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata = {
  title: "1031 Exchange Services | PCT Exchange | Pacific Coast Title",
  description:
    "Defer capital gains taxes on your investment property with a 1031 exchange. PCT Exchange serves as your qualified intermediary for tax-deferred exchanges.",
}

const keyConcepts = [
  {
    icon: Building,
    title: "Relinquished Property",
    description: "The property you're selling in the exchange. This is the investment property you're disposing of to begin the 1031 exchange process.",
  },
  {
    icon: Home,
    title: "Replacement Property",
    description: "The property you're purchasing with exchange proceeds. This is the new investment property you're acquiring to complete the exchange.",
  },
  {
    icon: Repeat,
    title: "Like-Kind",
    description: "Most real estate qualifies as like-kind to other real estate—it doesn't need to be the same type of property. An apartment building can be exchanged for raw land, for example.",
  },
]

const faqs = [
  {
    question: "What is a qualified intermediary (QI)?",
    answer: "A qualified intermediary is a neutral third party that holds exchange funds and facilitates the transaction. The QI ensures you never have constructive receipt of funds, which would disqualify the exchange. Using a QI is required for a valid 1031 exchange.",
  },
  {
    question: "Can I do an exchange with more than one property?",
    answer: "Yes, you can exchange into multiple replacement properties or sell multiple relinquished properties as part of a single exchange. This is common when investors want to diversify their holdings or consolidate multiple properties.",
  },
  {
    question: "Does the name on the title for my replacement property matter?",
    answer: "Yes, the taxpayer on the replacement property title must match the taxpayer who sold the relinquished property for proper tax treatment. This means if you sold as an individual, you must acquire as an individual—not through a different entity.",
  },
  {
    question: "Can I refinance before or after the exchange?",
    answer: "Refinancing is possible but timing matters significantly. Refinancing too close to an exchange can create 'boot' (taxable proceeds) or raise IRS scrutiny. Consult with your tax advisor about the implications of refinancing near an exchange.",
  },
  {
    question: "Am I allowed to use exchange funds for improvements?",
    answer: "Yes, through an improvement exchange (also called a construction or build-to-suit exchange), you can use exchange funds for improvements on the replacement property. This requires careful structuring with your QI to ensure compliance.",
  },
  {
    question: "What is a reverse exchange?",
    answer: "A reverse exchange allows you to purchase the replacement property before selling your relinquished property—useful in competitive markets where you can't wait to find a buyer. The replacement property is 'parked' with an exchange accommodation titleholder until you sell.",
  },
  {
    question: "Can LLC members do individual exchanges?",
    answer: "Guidelines vary based on how the LLC is structured. Generally, the entity that holds title must be the same entity completing the exchange. However, there are strategies involving LLC interest transfers or 'drop and swap' transactions. Consult your tax advisor for specific situations.",
  },
  {
    question: "In a reverse exchange, does the accommodator collect rent?",
    answer: "During the accommodation period, rent collection and property management details are specified in the exchange agreement. Typically, the exchanger manages the property under a management agreement, with rent flowing through the accommodator for proper documentation.",
  },
]

const resources = [
  { title: "Sale vs. Exchange Comparison", href: "https://pct.com/assets/downloads/1031/sale-vs-exchange-comparison.pdf" },
  { title: "Exchange Basics Guide", href: "https://pct.com/assets/downloads/1031/exchange-basics-guide.pdf" },
  { title: "1031 Calculations Worksheet", href: "https://pct.com/assets/downloads/1031/1031-calculations-worksheet.pdf" },
  { title: "1031 Exchange Process Overview", href: "https://pct.com/assets/downloads/1031/1031-exchange-process-overview.pdf" },
  { title: "1031 FAQs", href: "https://pct.com/assets/downloads/1031/1031-faqs.pdf" },
]

export default function Exchange1031Page() {
  return (
    <>
      <PageHero
        label="Tax-Deferred Exchanges"
        title="PCT Exchange"
        subtitle="Defer capital gains taxes on your investment property. A 1031 exchange allows you to sell investment property and reinvest the proceeds into like-kind property while deferring capital gains taxes."
      />

      {/* Key Concepts */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {keyConcepts.map((concept, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <concept.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-2">{concept.title}</h3>
                <p className="text-gray-600">{concept.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why You Need a QI */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                Why You Need a Qualified Intermediary
              </h2>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 mb-8">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-lg text-blue-900 font-medium mb-4">
                    Neither the taxpayer, nor an agent of the taxpayer, can receive or control 
                    the funds from the sale.
                  </p>
                  <p className="text-blue-800">
                    A qualified intermediary (QI) is a neutral third party that holds your exchange 
                    funds, ensuring IRS compliance throughout the transaction.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-secondary mb-3">PCT Exchange — Your Qualified Intermediary</h3>
                  <p className="text-gray-600 leading-relaxed">
                    PCT Exchange serves as your qualified intermediary, handling all documentation 
                    and fund management throughout the exchange process. Our experienced team ensures 
                    your exchange meets all IRS requirements while providing the guidance you need 
                    for a successful transaction.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              1031 Exchange Timeline
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Critical deadlines you must meet for a successful exchange.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 hidden md:block" />
              
              <div className="grid md:grid-cols-3 gap-8">
                {/* Day 0 */}
                <div className="relative">
                  <div className="bg-white border-2 border-primary rounded-2xl p-6 shadow-md">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                      0
                    </div>
                    <div className="mt-4 text-center">
                      <h3 className="text-lg font-bold text-secondary mb-2">Day 0</h3>
                      <p className="text-gray-600 text-sm">
                        Close on relinquished property sale. Exchange funds transferred to QI.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Day 45 */}
                <div className="relative">
                  <div className="bg-white border-2 border-amber-500 rounded-2xl p-6 shadow-md">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      45
                    </div>
                    <div className="mt-4 text-center">
                      <h3 className="text-lg font-bold text-secondary mb-2">Day 45</h3>
                      <p className="text-gray-600 text-sm">
                        <strong>Identification deadline.</strong> Must identify replacement property(ies) in writing.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Day 180 */}
                <div className="relative">
                  <div className="bg-white border-2 border-green-500 rounded-2xl p-6 shadow-md">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      180
                    </div>
                    <div className="mt-4 text-center">
                      <h3 className="text-lg font-bold text-secondary mb-2">Day 180</h3>
                      <p className="text-gray-600 text-sm">
                        <strong>Exchange deadline.</strong> Must close on replacement property(ies).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> These deadlines are strict and cannot be extended, 
                even for weekends or holidays. Plan your exchange timeline carefully.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Common questions about 1031 exchanges and the exchange process.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
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

      {/* Resources Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Educational Resources
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Download guides and worksheets to help plan your exchange.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {resources.map((resource, index) => (
              <a
                key={index}
                href={resource.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                  <FileText className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-secondary group-hover:text-primary transition-colors">
                    {resource.title}
                  </p>
                  <p className="text-sm text-gray-500">PDF Download</p>
                </div>
                <Download className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/90 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Questions About Your 1031 Exchange?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Our 1031 exchange team is ready to guide you through the process.
          </p>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-lg">Analleli Ayala</p>
                <p className="text-white/70">1031 Exchange Specialist</p>
              </div>
            </div>
            <div className="space-y-3">
              <a
                href="tel:+17145166720"
                className="flex items-center justify-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors w-full"
              >
                <Phone className="w-5 h-5" />
                (714) 516-6720
              </a>
              <a
                href="mailto:aayala@pct.com"
                className="flex items-center justify-center gap-2 bg-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors w-full"
              >
                <Mail className="w-5 h-5" />
                aayala@pct.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
