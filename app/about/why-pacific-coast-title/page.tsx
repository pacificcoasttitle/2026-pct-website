import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Award, Zap, Users, Shield, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Why Pacific Coast Title | Pacific Coast Title Company",
  description:
    "Discover why Pacific Coast Title Company is the trusted choice for title insurance and escrow services in California.",
}

export default function WhyPacificCoastTitlePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation variant="light" />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center grayscale"
          style={{
            backgroundImage: "url(/professional-title-company-office-team-meeting.jpg)",
          }}
        />
        <div className="absolute inset-0 bg-white/90" />

        <div className="relative container mx-auto px-4 text-center">
          <p className="text-primary font-semibold mb-3 uppercase tracking-wide pt-12">Your Trusted Partner</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            Why Pacific Coast Title
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Experience, service, and protection you can trust
          </p>
        </div>
      </section>

      {/* More Than a Policy */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">More Than a Policy</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Selecting a title company is about more than finding the lowest rate. It's about choosing a partner you'll
              rely on throughout your property ownership—a company with the expertise, resources, and commitment to
              protect your investment.
            </p>
            <p className="text-lg text-muted-foreground">
              At Pacific Coast Title, we provide comprehensive protection backed by exceptional service and deep
              industry expertise.
            </p>
          </div>
        </div>
      </section>

      {/* Expert Guidance */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Expert Guidance Every Step</h2>
            </div>

            <p className="text-lg text-muted-foreground mb-8">
              Real estate transactions are complex, with multiple parties, tight timelines, and significant financial
              stakes. From your first conversation through closing and beyond, you'll work with experienced title
              professionals who understand the intricacies of California real estate law and the title insurance
              industry.
            </p>

            <h3 className="text-2xl font-semibold text-foreground mb-6">Our team includes:</h3>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Licensed Title Officers",
                  description: "Extensive transaction experience",
                },
                {
                  title: "Skilled Title Examiners",
                  description: "Trained to identify complex title issues",
                },
                {
                  title: "Professional Underwriters",
                  description: "Ensure accurate risk assessment",
                },
                {
                  title: "Dedicated Escrow Officers",
                  description: "Manage your transaction details",
                },
              ].map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-border">
                  <h4 className="text-xl font-semibold text-foreground mb-2">{item.title}</h4>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>

            <p className="text-lg text-muted-foreground mt-8">
              We maintain high standards for our team, recruiting professionals with proven knowledge and skill in title
              insurance, escrow services, and real estate transactions.
            </p>
          </div>
        </div>
      </section>

      {/* Technology-Driven Efficiency */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Technology-Driven Efficiency</h2>
            </div>

            <p className="text-lg text-muted-foreground mb-8">
              Modern real estate demands modern solutions. Pacific Coast Title combines experienced professionals with
              advanced technology to deliver:
            </p>

            <div className="space-y-4">
              {[
                "Fast, accurate title searches using comprehensive databases",
                "Secure online document signing and collaboration",
                "Real-time transaction tracking and communication",
                "Streamlined processes that meet stringent compliance standards",
                "Clear explanations that demystify the settlement process",
              ].map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-lg text-muted-foreground">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Service for Every Client */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Service for Every Client</h2>
            </div>

            <p className="text-lg text-muted-foreground mb-8">
              Whether you're a first-time homebuyer, seasoned real estate professional, residential builder, commercial
              developer, or lender, Pacific Coast Title provides solutions designed for your specific needs.
            </p>

            <div className="grid gap-6">
              {[
                {
                  icon: Shield,
                  title: "Homeowners and Buyers",
                  description:
                    "We guide you through the title and escrow process with clear communication and responsive service.",
                },
                {
                  icon: TrendingUp,
                  title: "Real Estate Agents",
                  description:
                    "We provide the tools, resources, and support you need to close transactions smoothly and keep your clients informed.",
                },
                {
                  icon: Award,
                  title: "Lenders",
                  description:
                    "We deliver compliant, accurate title products that meet your underwriting requirements and closing schedules.",
                },
                {
                  icon: Clock,
                  title: "Commercial Clients",
                  description:
                    "We handle complex commercial transactions with specialized expertise and attention to detail.",
                },
              ].map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-border">
                  <div className="flex items-start gap-4">
                    <item.icon className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
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

      {/* Trusted Since 2005 */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Trusted Since 2005</h2>
            <p className="text-lg text-muted-foreground mb-6">
              For nearly two decades, Pacific Coast Title has served California real estate professionals and property
              owners with integrity, expertise, and dedication. Our reputation is built on one transaction at a time,
              one relationship at a time.
            </p>
            <p className="text-xl font-semibold text-foreground">
              When you choose Pacific Coast Title, you're choosing a partner committed to your success and protection
              throughout your property ownership journey.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Work With Us?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Experience the Pacific Coast Title difference—expertise, technology, and service working together for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="group">
              <Link href="/contact">
                Contact Us
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white hover:bg-white/90 text-primary border-white"
            >
              <Link href="/title-services">Explore Services</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
