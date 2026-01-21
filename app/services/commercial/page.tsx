import Link from "next/link"
import { PageHero } from "@/components/page-hero"
import { 
  Shield, FileCheck, Building, FileText, Lock, ArrowLeftRight, 
  Leaf, Briefcase, Landmark, Heart, Hotel, Home, Hammer, Building2, 
  Zap, Store, ChevronRight, Download, Mail, Phone, ArrowRight,
  BookOpen
} from "lucide-react"

export const metadata = {
  title: "Commercial Title Services | Pacific Coast Title",
  description:
    "Comprehensive commercial real estate support across Southern California. Title, escrow, closing, and post-closing services for complex transactions.",
}

const services = [
  {
    icon: Shield,
    title: "Title Insurance",
    description: "Evidence of title and property ownership insurance for commercial transactions.",
  },
  {
    icon: FileCheck,
    title: "Closing & Escrow",
    description: "Fund disbursements and ownership transfer management for complex deals.",
  },
  {
    icon: Building,
    title: "Construction Disbursing",
    description: "Financial management and cash flow oversight for construction projects.",
  },
  {
    icon: FileText,
    title: "Recording Special Projects",
    description: "Document recording and foreclosure services for unique situations.",
  },
  {
    icon: Lock,
    title: "UCCPlus Insurance",
    description: "Lender security interest protection for non-real estate collateral.",
  },
  {
    icon: ArrowLeftRight,
    title: "1031 Exchange",
    description: "Tax-deferred property exchanges for investment properties.",
    link: "/services/1031-exchange",
  },
]

const industries = [
  {
    icon: Leaf,
    title: "Agriculture / Land",
    description: "Cultivatable land, raw development land, improved parcels, local through national transactions.",
  },
  {
    icon: Briefcase,
    title: "Corporate Transactions",
    description: "Major corporate sales, portfolio refinancing, debt restructuring, multi-site transactions.",
  },
  {
    icon: Landmark,
    title: "Government",
    description: "Government-owned properties requiring specialized legal knowledge.",
  },
  {
    icon: Heart,
    title: "Healthcare",
    description: "Medical facilities, hospitals, nursing homes, healthcare REITs.",
  },
  {
    icon: Hotel,
    title: "Hospitality",
    description: "Hotels, public houses, sports facilities, single to multi-state projects.",
  },
  {
    icon: Home,
    title: "Multifamily Housing",
    description: "Apartment complexes, townhouses, condos, mixed-use buildings.",
  },
  {
    icon: Hammer,
    title: "New Construction",
    description: "Comprehensive services for ground-up construction projects.",
  },
  {
    icon: Building2,
    title: "Office / Industrial",
    description: "Office buildings, warehouses, distribution centers, industrial parks.",
  },
  {
    icon: Zap,
    title: "Power & Energy",
    description: "Wind, solar, natural gas projects including financing and acquisitions.",
  },
  {
    icon: Store,
    title: "Retail / Restaurant",
    description: "Retail stores, shopping centers, restaurants, multi-site transactions.",
  },
]

const resources = [
  {
    title: "Commercial Guide to Title & Escrow",
    description: "In-depth guide for commercial transactions",
    downloads: [
      { label: "PDF", href: "https://pct.com/assets/downloads/booklets/commercial-guidebook-title-escrow.pdf" },
      { label: "Digital Book", href: "https://pct.com/assets/downloads/booklets/commercial-guidebook-title-escrow-digital.pdf" },
    ],
  },
  {
    title: "Commercial Endorsement Guide",
    description: "Understanding commercial title endorsements",
    downloads: [
      { label: "PDF", href: "https://pct.com/assets/downloads/guides/commercial-endorsement-guide.pdf" },
    ],
  },
  {
    title: "Real Estate Laws & Customs",
    description: "State-specific guide for real estate professionals",
    downloads: [
      { label: "PDF", href: "https://pct.com/assets/downloads/guides/real-estate-laws-customs.pdf" },
    ],
  },
]

export default function CommercialServicesPage() {
  return (
    <>
      <PageHero
        label="Commercial Division"
        title="Commercial Title Services"
        subtitle="We partner with attorneys, lenders, brokers, and developers to handle time-consuming title intricacies that our competitors rarely take on."
      />

      {/* Service Description */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-xl text-gray-700 leading-relaxed">
              Comprehensive commercial real estate support across Southern California, including 
              title, escrow, closing, and post-closing services plus electronic document delivery 
              and recording capabilities.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Service Offerings
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Full-service commercial title and escrow solutions for transactions of any complexity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                  <service.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-secondary mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                {service.link && (
                  <Link
                    href={service.link}
                    className="inline-flex items-center gap-2 text-primary font-medium hover:text-primary/80 transition-colors"
                  >
                    Learn More <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Industries We Serve
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Deep expertise across all commercial real estate sectors.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 max-w-7xl mx-auto">
            {industries.map((industry, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mb-3">
                  <industry.icon className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="font-semibold text-secondary mb-2">{industry.title}</h3>
                <p className="text-sm text-gray-600">{industry.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Commercial Resources
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Educational materials for commercial real estate professionals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {resources.map((resource, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-secondary mb-2">{resource.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                <div className="space-y-2">
                  {resource.downloads.map((download, dIndex) => (
                    <a
                      key={dIndex}
                      href={download.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-primary/5 transition-colors group"
                    >
                      <span className="text-sm text-gray-700 group-hover:text-primary transition-colors">
                        {download.label}
                      </span>
                      <Download className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
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
            Ready to Discuss Your Commercial Transaction?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Our commercial team is ready to partner with you on your next deal.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <a
              href="mailto:commercial@pct.com"
              className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              <Mail className="w-5 h-5" />
              commercial@pct.com
            </a>
            <a
              href="tel:+17145166700"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/20 transition-colors"
            >
              <Phone className="w-5 h-5" />
              (714) 516-6700
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
