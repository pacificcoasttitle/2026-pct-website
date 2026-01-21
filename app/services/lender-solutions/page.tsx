import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Building2, Clock, Shield, FileCheck, Users, Zap, CheckCircle, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Lender Solutions | Pacific Coast Title",
  description:
    "Specialized title and escrow services for lenders. Fast turnaround, dedicated support, and seamless integration with your lending process.",
}

const benefits = [
  {
    icon: Clock,
    title: "Fast Turnaround",
    description: "Industry-leading closing times with our streamlined digital processes and experienced team.",
  },
  {
    icon: Shield,
    title: "Risk Mitigation",
    description: "Comprehensive title searches and insurance coverage to protect your lending investment.",
  },
  {
    icon: FileCheck,
    title: "Compliance Ready",
    description: "Full TRID, RESPA, and CFPB compliance with detailed documentation and audit trails.",
  },
  {
    icon: Users,
    title: "Dedicated Support",
    description: "Assigned account managers who understand your specific lending requirements and processes.",
  },
  {
    icon: Zap,
    title: "Technology Integration",
    description: "Seamless integration with major LOS systems and digital closing platforms.",
  },
  {
    icon: Building2,
    title: "Volume Capacity",
    description: "Scalable operations to handle high-volume lending without compromising quality or speed.",
  },
]

const services = [
  "Purchase Money Transactions",
  "Refinance Closings",
  "Home Equity Lines of Credit (HELOC)",
  "Construction Loans",
  "Commercial Lending",
  "Reverse Mortgages",
  "Warehouse Lines",
  "Correspondent Lending Support",
]

export default function LenderSolutionsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium mb-6">
              For Lenders
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              Lender Solutions Built for Speed and Compliance
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Partner with Pacific Coast Title for reliable, technology-driven title and escrow services 
              that keep your loans moving and your borrowers satisfied.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors text-center"
              >
                Become a Partner
              </Link>
              <a
                href="https://www.pct.com/lender-portal"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border-2 border-primary text-primary px-8 py-4 rounded-xl font-semibold hover:bg-primary/5 transition-colors text-center"
              >
                Access Lender Portal
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Why Lenders Choose Us</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We understand the unique challenges lenders face. Our solutions are designed to streamline 
              your closings and reduce risk.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <div key={benefit.title} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
                Comprehensive Lending Support
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                From purchase transactions to complex commercial deals, we provide full-service title 
                and escrow support for all your lending needs.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div key={service} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-gray-700">{service}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-primary mb-6">Lender Rate Portal</h3>
              <p className="text-gray-600 mb-6">
                Access our dedicated lender portal for instant rate quotes, order tracking, 
                and document management.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-gray-700">Real-time order status updates</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-gray-700">Instant preliminary reports</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-gray-700">Secure document exchange</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="text-gray-700">Customized reporting</span>
                </li>
              </ul>
              <a
                href="https://www.pct.com/lender-portal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Access Portal
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Streamline Your Lending Process?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Let's discuss how Pacific Coast Title can become your trusted title and escrow partner.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Our Lender Team
            </Link>
            <a
              href="tel:+17145166700"
              className="bg-accent text-white px-8 py-4 rounded-xl font-semibold hover:bg-accent/90 transition-colors"
            >
              Call (714) 516-6700
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
