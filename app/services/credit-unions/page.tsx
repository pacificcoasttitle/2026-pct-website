import Link from "next/link"
import { PageHero } from "@/components/page-hero"
import { 
  Users, Award, DollarSign, CheckCircle, Monitor, Shield, 
  TrendingUp, ChevronRight, Mail, Phone, MapPin, Building2,
  FileCheck, Home, ArrowRight
} from "lucide-react"

export const metadata = {
  title: "Credit Union & Major Accounts | Pacific Coast Title",
  description:
    "The premier provider of title insurance and escrow services to California's credit union community. Personal service, competitive pricing, and operational efficiency.",
}

const valueProps = [
  {
    icon: Award,
    title: "Expertise",
    description: "Deep knowledge of credit union lending requirements and regulations. We understand the unique needs of your members.",
  },
  {
    icon: DollarSign,
    title: "Cost Savings",
    description: "Competitive pricing designed for credit union volume. Our fee structures help you provide value to your members.",
  },
  {
    icon: CheckCircle,
    title: "Regulatory Compliance",
    description: "Support navigating title and escrow compliance requirements, keeping your transactions on track and audit-ready.",
  },
  {
    icon: Monitor,
    title: "Technology Access",
    description: "Modern tools for order management and tracking. Real-time status updates and document access for your team.",
  },
  {
    icon: Shield,
    title: "Risk Mitigation",
    description: "Proactive title review to identify and resolve issues early, reducing delays and protecting your lending portfolio.",
  },
  {
    icon: TrendingUp,
    title: "Competitive Advantages",
    description: "Help your credit union stand out with superior closing experiences that keep members coming back.",
  },
]

const services = [
  {
    icon: Shield,
    title: "Title Insurance",
    description: "Comprehensive coverage for residential and commercial loans, protecting your credit union and your members.",
  },
  {
    icon: FileCheck,
    title: "Escrow Services",
    description: "Full-service escrow for purchase and refinance transactions with dedicated account management.",
  },
  {
    icon: Home,
    title: "Closing Services",
    description: "Coordinated closings with flexible scheduling to accommodate your members' needs.",
  },
]

const coverageStates = [
  { name: "California", description: "Statewide coverage" },
  { name: "Nevada", description: "Full coverage" },
  { name: "Arizona", description: "Full coverage" },
]

export default function CreditUnionsPage() {
  return (
    <>
      <PageHero
        label="CUSO Division"
        title="Credit Union & Major Accounts"
        subtitle="The premier provider of title insurance and escrow services to California's credit union community. Personal service, competitive pricing, and operational efficiency."
      />

      {/* Value Propositions */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Why Credit Unions Choose PCT
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We understand the unique needs of credit unions and their members.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {valueProps.map((prop, index) => (
              <div
                key={index}
                className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                  <prop.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-2">{prop.title}</h3>
                <p className="text-gray-600">{prop.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Services for Credit Unions
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive title and escrow solutions designed for credit union lending.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm text-center"
              >
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <service.icon className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-3">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Area */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Serving Credit Unions Throughout
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-6 max-w-3xl mx-auto">
            {coverageStates.map((state, index) => (
              <div
                key={index}
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-8 py-6 shadow-sm"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-secondary">{state.name}</p>
                  <p className="text-gray-500">{state.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-secondary mb-6">
                Partnership Benefits
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  "Dedicated account representative",
                  "Custom fee schedules",
                  "Priority processing",
                  "Online order tracking",
                  "Direct lender communication",
                  "Same-day document delivery",
                  "Flexible closing locations",
                  "Member satisfaction focus",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
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
            Partner With Us
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Ready to provide your members with exceptional title and escrow services?
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <a
              href="tel:+18667241050"
              className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              <Phone className="w-5 h-5" />
              (866) 724-1050
            </a>
            <a
              href="mailto:info@pct.com"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-colors"
            >
              <Mail className="w-5 h-5" />
              info@pct.com
            </a>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white font-medium"
          >
            Contact Our Credit Union Team <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
