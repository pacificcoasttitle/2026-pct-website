import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, DollarSign, Clock, FileText, TrendingUp, Shield, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata = {
  title: "1031 Exchange Services | Pacific Coast Title Company",
  description:
    "Expert 1031 exchange services and qualified intermediary support for real estate investors deferring capital gains taxes.",
}

export default function Exchange1031Page() {
  const requirements = [
    {
      icon: FileText,
      title: "Like-Kind Property",
      description:
        "Both relinquished (sold) and replacement properties must be held for investment or business use—not personal use.",
    },
    {
      icon: Shield,
      title: "Qualified Intermediary",
      description:
        "You cannot receive sale proceeds directly. A qualified intermediary must hold funds during the exchange.",
    },
    {
      icon: Clock,
      title: "45-Day Identification",
      description: "You have 45 days from the sale to identify potential replacement properties in writing.",
    },
    {
      icon: Clock,
      title: "180-Day Closing",
      description: "You must close on replacement property within 180 days of selling your relinquished property.",
    },
    {
      icon: TrendingUp,
      title: "Equal or Greater Value",
      description:
        "To defer all capital gains, your replacement property must be equal to or greater in value than the property sold.",
    },
    {
      icon: DollarSign,
      title: "Reinvest All Equity",
      description: "To achieve complete tax deferral, you must reinvest all net proceeds from the sale.",
    },
  ]

  const exchangeTypes = [
    {
      title: "Delayed Exchange (Forward)",
      description:
        "The most common type. You sell your relinquished property first, then identify and acquire replacement property within the required timeframes.",
    },
    {
      title: "Reverse Exchange",
      description:
        "You acquire replacement property before selling your relinquished property. This requires more complex structuring and holding arrangements.",
    },
    {
      title: "Improvement/Construction Exchange",
      description:
        "You use exchange proceeds to improve or construct on your replacement property before taking ownership.",
    },
    {
      title: "Partial Exchange",
      description:
        'You receive some cash at closing ("boot"), paying tax on that portion while deferring tax on the remainder.',
    },
  ]

  const process = [
    {
      step: 1,
      title: "Pre-Planning",
      description:
        "Consult with tax advisors and engage a qualified intermediary before listing your property for sale.",
    },
    {
      step: 2,
      title: "List and Market",
      description: "Sell your relinquished property. Sale contracts should include 1031 exchange language.",
    },
    {
      step: 3,
      title: "Open Exchange",
      description: "At closing, sale proceeds transfer to qualified intermediary (not to you).",
    },
    {
      step: 4,
      title: "45-Day Identification",
      description: "Identify potential replacement properties in writing within 45 days.",
    },
    {
      step: 5,
      title: "Due Diligence",
      description: "Inspect and evaluate identified replacement properties.",
    },
    {
      step: 6,
      title: "Closing on Replacement",
      description: "Close on chosen replacement property within 180 days. Intermediary uses held funds for purchase.",
    },
    {
      step: 7,
      title: "Exchange Complete",
      description: "You now own replacement property, having deferred capital gains taxes.",
    },
  ]

  const faqs = [
    {
      question: "What is a qualified intermediary (QI)?",
      answer:
        "A qualified intermediary is a neutral third party who facilitates the 1031 exchange by holding the proceeds from your relinquished property sale and using those funds to acquire your replacement property. The QI ensures the exchange complies with IRS regulations. Pacific Coast Title's TSG Division serves as a qualified intermediary.",
    },
    {
      question: "Can I do an exchange with more than one property?",
      answer:
        "Yes. You can sell one property and purchase multiple replacement properties, or sell multiple properties and purchase one or more replacement properties. The total value and equity requirements still apply—your replacement properties must equal or exceed the total value of properties sold to defer all capital gains.",
    },
    {
      question: "Does the name of the title matter?",
      answer:
        "Yes, the titleholder of the relinquished property must be the same as the titleholder of the replacement property. For example, if John Smith sells the relinquished property, John Smith must acquire the replacement property. Variations in how title is held can disqualify the exchange.",
    },
    {
      question: "Can I refinance before or after an exchange?",
      answer:
        "Refinancing before the exchange is generally acceptable and can provide cash without triggering taxable boot. Refinancing after completing the exchange is also permissible. However, refinancing during the exchange period or structuring a refinance as part of the exchange can create complications. Consult with tax advisors.",
    },
    {
      question: "Am I allowed to use exchange funds for improvements?",
      answer:
        "Yes, in an improvement or construction exchange. Exchange funds can be used to improve the replacement property before you take title. However, this requires careful structuring to ensure the property value meets requirements and improvements are completed within the 180-day period.",
    },
    {
      question: "What is a reverse exchange?",
      answer:
        "A reverse exchange allows you to acquire replacement property before selling your relinquished property. This is useful when you find an ideal replacement property but haven't yet sold your current property. The qualified intermediary acquires and holds the replacement property until you sell your relinquished property and complete the exchange.",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation variant="light" />

      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center grayscale"
          style={{
            backgroundImage: "url(/professional-title-company-office-team-meeting.jpg)",
          }}
        />
        <div className="absolute inset-0 bg-white/90" />

        <div className="relative container mx-auto px-4 text-center">
          <p className="text-primary font-semibold mb-3 uppercase tracking-wide pt-12">
            Tax-Deferred Real Estate Exchanges
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            1031 Exchange Services
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Build wealth while deferring capital gains taxes
          </p>
        </div>
      </section>

      {/* Understanding 1031 Exchanges */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Understanding 1031 Exchanges</h2>
            <p className="text-lg text-muted-foreground mb-6">
              A 1031 exchange (named after Section 1031 of the Internal Revenue Code) allows real estate investors to
              defer capital gains taxes when selling investment property by reinvesting proceeds into "like-kind"
              replacement property.
            </p>
          </div>
        </div>
      </section>

      {/* Why Use a 1031 Exchange */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Why Use a 1031 Exchange</h2>
            <p className="text-lg text-muted-foreground mb-6">
              When you sell appreciated investment real estate, you normally owe:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {[
                "Federal capital gains tax",
                "State capital gains tax",
                "Depreciation recapture tax",
                "Net investment income tax (potentially)",
              ].map((tax, index) => (
                <div key={index} className="flex items-start gap-2 bg-white p-4 rounded-lg border border-border">
                  <DollarSign className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">{tax}</p>
                </div>
              ))}
            </div>

            <div className="bg-primary/10 p-6 rounded-lg border-l-4 border-primary">
              <p className="text-lg font-semibold text-foreground">
                Together, these taxes can consume 30-40% or more of your profit. A properly executed 1031 exchange
                defers these taxes, allowing you to reinvest your full equity into replacement property—significantly
                increasing your purchasing power and long-term wealth building.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Basic Requirements */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">Basic Requirements</h2>
            <p className="text-lg text-muted-foreground mb-8 text-center">To qualify for 1031 exchange treatment:</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requirements.map((req, index) => (
                <div key={index} className="bg-muted/30 p-6 rounded-lg border border-border">
                  <req.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">{req.title}</h3>
                  <p className="text-muted-foreground">{req.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Types of 1031 Exchanges */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Types of 1031 Exchanges</h2>

            <div className="space-y-6">
              {exchangeTypes.map((type, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-border">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{type.title}</h3>
                  <p className="text-muted-foreground">{type.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The 1031 Exchange Process */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
              The 1031 Exchange Process
            </h2>

            <div className="space-y-6">
              {process.map((item) => (
                <div key={item.step} className="bg-muted/30 p-6 rounded-lg border-l-4 border-primary">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary text-white rounded-full font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pacific Coast Title's TSG Division */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Pacific Coast Title's TSG Division</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Our Title Services Group (TSG) Division specializes in 1031 exchanges and sophisticated investment
              transactions. We provide:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Qualified intermediary services",
                "Expert guidance through the exchange process",
                "Strict compliance with IRS regulations",
                "Secure holding of exchange proceeds",
                "Coordination with all transaction parties",
                "Clear documentation and reporting",
              ].map((service, index) => (
                <div key={index} className="flex items-start gap-2 bg-white p-4 rounded-lg border border-border">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">{service}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
              Frequently Asked Questions
            </h2>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-muted/30 border border-border rounded-lg px-6"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="text-lg font-semibold text-foreground">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Important Considerations */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Important Considerations</h2>
            <p className="text-lg text-muted-foreground mb-6">
              1031 exchanges offer substantial tax benefits but require strict compliance with IRS regulations.
              Consider:
            </p>

            <div className="space-y-4">
              {[
                {
                  title: "Tax and legal advice",
                  description: "Always consult qualified tax and legal advisors before proceeding",
                },
                {
                  title: "Strict deadlines",
                  description: "Missing the 45-day or 180-day deadlines disqualifies the exchange",
                },
                {
                  title: "Property identification",
                  description: "Choose identification targets carefully; you're limited to specific properties",
                },
                {
                  title: "Financing",
                  description: "Arrange replacement property financing well in advance",
                },
                {
                  title: "Market conditions",
                  description: "Plan for changing market conditions that may affect available properties",
                },
              ].map((consideration, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-1">{consideration.title}</h3>
                  <p className="text-muted-foreground">{consideration.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
              <p className="text-sm text-muted-foreground italic">
                Note: This is general information, not tax advice. Consult qualified tax professionals before proceeding
                with any exchange.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Your 1031 Exchange</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Pacific Coast Title's TSG Division has facilitated hundreds of successful 1031 exchanges for California
            investors. Contact us to discuss how a 1031 exchange can help you build wealth while deferring capital gains
            taxes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="group">
              <Link href="/contact">
                Contact TSG Division
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white hover:bg-white/90 text-primary border-white"
            >
              <Link href="/tsg-division">Learn About TSG</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
