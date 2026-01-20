import Navigation from "@/components/navigation"
import Link from "next/link"
import { Building2, Shield, Users, Clock, CheckCircle2 } from "lucide-react"

export default function CreditUnionsPage() {
  const benefits = [
    {
      icon: Shield,
      title: "Compliance Expertise",
      description: "Deep understanding of credit union regulatory requirements and compliance standards",
    },
    {
      icon: Clock,
      title: "Fast Turnaround",
      description: "Streamlined processes designed to meet your lending timelines and member expectations",
    },
    {
      icon: Users,
      title: "Dedicated Support",
      description: "Assigned team members who understand your credit union's specific needs and procedures",
    },
    {
      icon: CheckCircle2,
      title: "Quality Assurance",
      description: "Rigorous quality control processes to ensure accuracy and protect your members",
    },
  ]

  const services = [
    "Residential Title Insurance",
    "Commercial Title Insurance",
    "Refinance Services",
    "HELOC Title Services",
    "Construction Loans",
    "Bulk Loan Portfolio Services",
    "Default Services",
    "Post-Closing Services",
  ]

  return (
    <>
      <Navigation />
      <div className="relative min-h-[40vh] flex items-center justify-center bg-white overflow-hidden">
        <img
          src="/beautiful-modern-california-home-exterior-with-blu.jpg"
          alt="California home"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "grayscale(100%)" }}
        />
        <div className="absolute inset-0 bg-white/90" />
        <div className="relative z-10 container mx-auto px-4 text-center py-20">
          <h1 className="text-5xl md:text-6xl font-bold text-[#03374f] mb-4">Credit Union Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Specialized title and escrow solutions for credit unions
          </p>
        </div>
      </div>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <Building2 className="w-16 h-16 text-[#f26b2b] mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-[#03374f] mb-6">Your Partner in Member Service</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Pacific Coast Title Company understands the unique needs of credit unions. We provide specialized title
                and escrow services that help you serve your members efficiently while maintaining the highest standards
                of compliance and quality.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-6">
                    <Icon className="w-12 h-12 text-[#f26b2b] mb-4" />
                    <h3 className="text-xl font-bold text-[#03374f] mb-3">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                )
              })}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-8 mb-16">
              <h3 className="text-2xl font-bold text-[#03374f] mb-6 text-center">Comprehensive Service Offerings</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#f26b2b] flex-shrink-0" />
                    <span className="text-gray-700">{service}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#03374f] text-white rounded-lg p-8 mb-16">
              <h3 className="text-2xl font-bold mb-4">Technology Integration</h3>
              <p className="text-gray-100 leading-relaxed mb-6">
                Our technology platform integrates seamlessly with your loan origination system, providing real-time
                order tracking, automated status updates, and comprehensive reporting. We offer API connectivity and
                secure data exchange to streamline your lending operations.
              </p>
              <ul className="space-y-2 text-gray-100">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#f26b2b]" />
                  Real-time order status tracking
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#f26b2b]" />
                  Automated notifications and updates
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#f26b2b]" />
                  Secure document delivery
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#f26b2b]" />
                  Comprehensive reporting and analytics
                </li>
              </ul>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-bold text-[#03374f] mb-4">Ready to Partner with Us?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Contact us to learn more about our credit union services and how we can help you serve your members more
                effectively.
              </p>
              <Link
                href="/contact"
                className="inline-block bg-[#f26b2b] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#03374f] transition-colors"
              >
                Schedule a Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
