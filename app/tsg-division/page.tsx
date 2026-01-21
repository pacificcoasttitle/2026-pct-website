import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, TrendingUp, Users, FileCheck } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "TSG Division | Pacific Coast Title Company",
  description:
    "Pacific Coast Title's Title Services Group specializes in 1031 exchanges and sophisticated commercial transactions.",
}

export default function TSGDivisionPage() {
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
          <p className="text-primary font-semibold mb-3 uppercase tracking-wide pt-12">Title Services Group</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">TSG Division</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Specialized expertise for complex transactions and 1031 exchanges
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-muted-foreground mb-6">
              Pacific Coast Title's Title Services Group (TSG) Division provides specialized services for sophisticated
              real estate transactions, including 1031 exchanges, commercial acquisitions, and complex investment
              transactions.
            </p>

            <p className="text-lg text-muted-foreground">
              Our TSG team brings decades of combined experience in tax-deferred exchanges, commercial title insurance,
              and investment property transactions. We serve real estate investors, attorneys, CPAs, and financial
              advisors throughout California.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">TSG Services</h2>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: TrendingUp,
                  title: "1031 Exchange Services",
                  description:
                    "Complete qualified intermediary services for tax-deferred exchanges, including delayed, reverse, improvement, and construction exchanges.",
                  features: [
                    "Qualified intermediary services",
                    "Exchange documentation and compliance",
                    "Secure holding of exchange funds",
                    "Coordination with all parties",
                    "Expert guidance through IRS requirements",
                  ],
                },
                {
                  icon: Shield,
                  title: "Commercial Title Services",
                  description: "Sophisticated title insurance for complex commercial transactions.",
                  features: [
                    "Multi-property portfolio acquisitions",
                    "Development and construction projects",
                    "Leasehold transactions",
                    "Title commitment negotiation",
                    "Complex title issue resolution",
                  ],
                },
                {
                  icon: Users,
                  title: "Investment Property Expertise",
                  description: "Specialized knowledge of investment property transactions and tax considerations.",
                  features: [
                    "Entity structuring guidance",
                    "Partnership and LLC transactions",
                    "Trust and estate planning transactions",
                    "Multi-party coordination",
                    "Investment strategy consultation",
                  ],
                },
                {
                  icon: FileCheck,
                  title: "Professional Services",
                  description: "Comprehensive support for attorneys, CPAs, and financial advisors.",
                  features: [
                    "Attorney collaboration",
                    "CPA coordination",
                    "Financial advisor support",
                    "Custom transaction structuring",
                    "Detailed reporting and documentation",
                  ],
                },
              ].map((service, index) => (
                <div key={index} className="bg-white p-8 rounded-lg border border-border">
                  <service.icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-2xl font-semibold text-foreground mb-3">{service.title}</h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose TSG */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">Why Choose TSG</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Specialized Expertise",
                  description:
                    "Dedicated team with extensive experience in 1031 exchanges and sophisticated commercial transactions",
                },
                {
                  title: "Compliance Focus",
                  description:
                    "Strict adherence to IRS regulations and best practices to protect your exchange qualification",
                },
                {
                  title: "Responsive Service",
                  description: "Prompt communication and proactive guidance throughout your transaction",
                },
                {
                  title: "Comprehensive Support",
                  description: "Full-service approach from pre-planning through closing and beyond",
                },
              ].map((item, index) => (
                <div key={index} className="bg-muted/30 p-6 rounded-lg border border-border">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Work With Our TSG Team</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Contact Pacific Coast Title's TSG Division for expert guidance on your next sophisticated transaction.
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
              <Link href="/1031-exchange">Learn About 1031 Exchanges</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
