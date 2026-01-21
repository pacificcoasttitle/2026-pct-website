import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Building2, TrendingUp, Shield, FileCheck, Briefcase } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Commercial Title Services | Pacific Coast Title Company",
  description:
    "Expert commercial title insurance and escrow services for complex real estate transactions in California.",
}

export default function CommercialTitlePage() {
  const capabilities = [
    "Multi-million dollar transaction experience",
    "Multi-parcel and portfolio acquisitions",
    "Multi-state transaction coordination",
    "Entity ownership structures (LLCs, partnerships, trusts, corporations)",
    "Construction and development projects",
    "1031 exchange coordination",
    "Leasehold and ground lease expertise",
    "Title commitment and policy negotiation",
    "Complex title issue resolution",
    "Sophisticated due diligence coordination",
  ]

  const clientTypes = [
    {
      icon: Building2,
      title: "Commercial Developers",
      description:
        "We handle complex development transactions with expertise in construction liens, subdivision requirements, and phased closings.",
    },
    {
      icon: TrendingUp,
      title: "Real Estate Investors",
      description:
        "From single acquisitions to portfolio purchases, we provide efficient title services and 1031 exchange coordination.",
    },
    {
      icon: Briefcase,
      title: "Attorneys & Brokers",
      description:
        "We work seamlessly with legal and brokerage professionals, providing detailed title products and responsive service.",
    },
    {
      icon: Shield,
      title: "Institutional Lenders",
      description:
        "We deliver compliant title products that meet stringent underwriting requirements and accommodate complex loan structures.",
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
          <p className="text-primary font-semibold mb-3 uppercase tracking-wide pt-12">Commercial Title Services</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            Keeping Business Moving
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Sophisticated title solutions for complex commercial transactions
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-muted-foreground mb-6">
              Commercial real estate transactions demand specialized expertise, rigorous due diligence, and seamless
              coordination among multiple parties. Whether you're acquiring a single property or a multi-billion dollar
              portfolio, Pacific Coast Title brings the sophistication and experience your transaction requires.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              Our commercial team has extensive experience handling complex transactions for attorneys, lenders,
              brokers, developers, and institutional investors. We understand the unique challenges of commercial real
              estate and provide title solutions that keep your business moving forward.
            </p>

            <div className="bg-primary/10 p-6 rounded-lg border-l-4 border-primary">
              <p className="text-lg font-semibold text-foreground">
                From office buildings to industrial complexes, retail centers to multi-family developments, Pacific
                Coast Title solves time-consuming title intricacies with unparalleled expertise—regardless of property
                size or transaction complexity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">Commercial Expertise</h2>

            <div className="grid md:grid-cols-2 gap-4">
              {capabilities.map((capability, index) => (
                <div key={index} className="flex items-start gap-3 bg-white p-4 rounded-lg border border-border">
                  <FileCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">{capability}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Client Types */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">Who We Serve</h2>

            <div className="grid md:grid-cols-2 gap-8">
              {clientTypes.map((client, index) => (
                <div key={index} className="bg-muted/30 p-8 rounded-lg border border-border">
                  <client.icon className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-2xl font-semibold text-foreground mb-3">{client.title}</h3>
                  <p className="text-muted-foreground">{client.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
              The Pacific Coast Title Difference
            </h2>

            <div className="space-y-6">
              {[
                {
                  title: "Experienced Team",
                  description:
                    "Our commercial title officers and underwriters have decades of combined experience handling sophisticated transactions across California.",
                },
                {
                  title: "Responsive Service",
                  description:
                    "We understand commercial timelines are tight. Our team provides prompt responses, proactive communication, and solutions-oriented service.",
                },
                {
                  title: "Thorough Due Diligence",
                  description:
                    "We conduct comprehensive title examinations and coordinate with all parties to identify and resolve issues efficiently.",
                },
                {
                  title: "Flexible Solutions",
                  description:
                    "Every commercial transaction is unique. We tailor our services to meet your specific requirements and transaction structure.",
                },
                {
                  title: "Technology Integration",
                  description:
                    "Secure online platforms, electronic document management, and real-time status updates keep your transaction moving forward.",
                },
              ].map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-border">
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Work With Us?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Let Pacific Coast Title provide the sophisticated commercial title services your transaction demands.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="group">
              <Link href="/contact">
                Contact Our Commercial Team
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white hover:bg-white/90 text-primary border-white"
            >
              <Link href="/1031-exchange">1031 Exchange Services</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
