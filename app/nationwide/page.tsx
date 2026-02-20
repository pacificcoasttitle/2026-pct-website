import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import Link from "next/link"
import {
  Globe,
  Shield,
  Users,
  Building2,
  CheckCircle,
  ArrowRight,
  Phone,
  MapPin,
  Zap,
  FileCheck,
} from "lucide-react"

export const metadata = {
  title: "Nationwide Services | Pacific Coast Title Company",
  description:
    "Pacific Coast Title provides nationwide title and escrow services through our network of trusted partners. Get consistent quality from coast to coast.",
}

const capabilities = [
  {
    icon: Globe,
    title: "50-State Coverage",
    description:
      "Through our national network of trusted title partners, we can coordinate title and escrow services for transactions in all 50 states.",
  },
  {
    icon: Users,
    title: "Single Point of Contact",
    description:
      "No matter where your transaction is located, you work with one dedicated PCT representative who manages everything from start to close.",
  },
  {
    icon: Shield,
    title: "Major Underwriter Backing",
    description:
      "Every policy is backed by nationally recognized title insurers including First American, Fidelity National, Old Republic, and Stewart Title.",
  },
  {
    icon: Zap,
    title: "Streamlined Process",
    description:
      "Our technology platform and established processes ensure efficient, consistent closings regardless of property location.",
  },
  {
    icon: FileCheck,
    title: "Consistent Quality",
    description:
      "All partner offices adhere to PCT's rigorous quality standards, ensuring you get the same level of service and accuracy nationwide.",
  },
  {
    icon: Building2,
    title: "Commercial & Residential",
    description:
      "From single-family homes to multi-state commercial portfolios, we handle transactions of every size and complexity across the country.",
  },
]

const idealFor = [
  "Lenders with nationwide loan portfolios",
  "National real estate brokerages and franchises",
  "Commercial investors with multi-state holdings",
  "REO and asset management companies",
  "Relocation companies needing consistent closings",
  "Credit unions serving members across state lines",
]

export default function NationwidePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      <PageHero
        label="Coast to Coast"
        title="Nationwide Title &"
        titleHighlight="Escrow Services"
        subtitle="California roots, national reach. Get the same trusted PCT service for transactions across all 50 states."
      />

      {/* Overview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p className="text-xl">
                While Pacific Coast Title is proudly headquartered in California, our clients don&apos;t stop at state lines—and 
                neither do we. Through our extensive network of vetted partner offices and national underwriter relationships, 
                we coordinate title and escrow services for transactions anywhere in the United States.
              </p>
              
              <div className="bg-gray-50 p-6 rounded-xl border-l-4 border-primary my-8">
                <p className="text-lg font-medium text-secondary mb-0">
                  &ldquo;One call, one contact, one consistent experience—no matter where your next closing takes you.&rdquo;
                </p>
              </div>

              <p>
                Whether you&apos;re a lender closing loans in multiple states, a commercial investor building a portfolio 
                across the country, or a relocation company that needs seamless transitions, PCT&apos;s nationwide service 
                gives you the simplicity of a single partner with the power of a national network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              How Our Nationwide Service Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We combine local expertise with centralized coordination for consistent, reliable closings.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {capabilities.map((cap) => {
              const Icon = cap.icon
              return (
                <div key={cap.title} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-3">{cap.title}</h3>
                  <p className="text-gray-600">{cap.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Ideal For */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                Ideal For
              </h2>
              <p className="text-xl text-gray-600">
                Our nationwide service is designed for organizations that need reliable, consistent closings across state lines.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {idealFor.map((item) => (
                <div key={item} className="flex items-center gap-3 bg-gray-50 p-5 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <Globe className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Need Title Services Outside California?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/80">
            Contact our nationwide services team to discuss how we can support your multi-state transactions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Contact Nationwide Team
            </Link>
            <Link
              href="/services/title"
              className="bg-white text-secondary px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2"
            >
              View California Services
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
