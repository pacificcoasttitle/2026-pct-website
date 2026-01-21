import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Shield, Building2, Lock, FileCheck, ArrowLeftRight, Scale, Users, Home, ChevronRight } from "lucide-react"

const serviceLinks = [
  {
    title: "Residential Title",
    href: "/services/title",
    icon: Home,
    description: "Title insurance for homebuyers",
  },
  {
    title: "Commercial Title",
    href: "/services/commercial",
    icon: Building2,
    description: "Commercial real estate solutions",
  },
  {
    title: "Escrow Settlement",
    href: "/services/escrow",
    icon: FileCheck,
    description: "Full-service escrow",
  },
  {
    title: "1031 Exchange",
    href: "/services/1031-exchange",
    icon: ArrowLeftRight,
    description: "Tax-deferred exchanges",
  },
  {
    title: "TSG / REO Division",
    href: "/services/tsg",
    icon: Scale,
    description: "Foreclosure title services",
  },
  {
    title: "Credit Unions",
    href: "/services/credit-unions",
    icon: Users,
    description: "Credit union partnerships",
  },
]

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      
      {children}

      {/* Services Navigation Footer */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-secondary mb-2">Our Services</h2>
            <p className="text-gray-600">Explore all PCT service offerings</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {serviceLinks.map((service) => (
              <Link
                key={service.href}
                href={service.href}
                className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                  <service.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-semibold text-secondary group-hover:text-primary transition-colors">
                    {service.title}
                  </p>
                  <p className="text-sm text-gray-500">{service.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
