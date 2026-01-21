import Link from "next/link"
import { BookOpen, Shield, Building2, Users, Briefcase, ArrowRight, Quote, CheckCircle } from "lucide-react"

export const metadata = {
  title: "Benefits of Title Insurance | Pacific Coast Title",
  description: "Discover the benefits of title insurance for buyers, sellers, lenders, and real estate professionals. Learn why it's the best investment for your home.",
}

const benefits = [
  {
    icon: Shield,
    title: "Benefits for the Purchaser",
    description: "For a single premium payment, buyers receive protection covering both claims arising out of title problems that could have been discovered in the public records, and those so-called 'non-record' defects that could not be discovered in the record, even with the most complete search.",
    highlights: [
      "One-time premium, lifetime coverage",
      "Protection against hidden defects",
      "Coverage extends to your heirs",
      "Legal defense costs included",
      "Protection even after you sell",
    ],
  },
  {
    icon: Building2,
    title: "Benefits for the Lender",
    description: "Title insurance protects mortgage lenders against security loss from title defects. The policy remains effective throughout the entire term of the loan, ensuring the lender's investment is secure regardless of what title issues may surface.",
    highlights: [
      "Protects the mortgage investment",
      "Coverage for the life of the loan",
      "Covers legal defense costs",
      "Ensures valid lien position",
      "Required for most mortgage transactions",
    ],
  },
  {
    icon: Users,
    title: "Benefits for the Seller",
    description: "Owners with title insurance receive assurance their property title remains marketable during sales transactions. This can expedite the sale process and provide confidence to potential buyers.",
    highlights: [
      "Demonstrates clear, marketable title",
      "Expedites the closing process",
      "Builds buyer confidence",
      "Reduces transaction complications",
      "Protection during the sale period",
    ],
  },
  {
    icon: Briefcase,
    title: "Benefits for the Real Estate Broker",
    description: "Title insurance facilitates efficient property transfers, enhancing client satisfaction and business reputation. A smooth closing process leads to happy clients and valuable referrals.",
    highlights: [
      "Smoother transaction process",
      "Fewer closing delays",
      "Enhanced client satisfaction",
      "Stronger business reputation",
      "More successful closings",
    ],
  },
]

export default function BenefitsOfTitleInsurancePage() {
  return (
    <article className="max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="text-gray-300">/</span>
        <Link href="/learn" className="hover:text-primary">Learn</Link>
        <span className="text-gray-300">/</span>
        <span className="text-primary font-medium">Benefits of Title Insurance</span>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">4 min read</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
          Benefits of Title Insurance
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          Title insurance provides valuable protection for everyone involved in a real estate transaction—from 
          buyers and sellers to lenders and real estate professionals.
        </p>
      </header>

      {/* Main Content */}
      <div className="space-y-12">
        {benefits.map((benefit, index) => (
          <section key={index} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <benefit.icon className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-secondary mb-2">{benefit.title}</h2>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            </div>
            
            <div className="ml-0 md:ml-18">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Key Benefits
              </h3>
              <ul className="grid sm:grid-cols-2 gap-3">
                {benefit.highlights.map((highlight, hIndex) => (
                  <li key={hIndex} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}

        {/* Key Takeaway */}
        <section className="bg-gradient-to-br from-secondary to-secondary/90 rounded-2xl p-8 text-white">
          <div className="flex items-start gap-4">
            <Quote className="w-10 h-10 text-white/30 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-4">The Bottom Line</h2>
              <p className="text-xl text-white/90 leading-relaxed mb-6">
                "Dollar for dollar, title insurance is the best investment you can make to protect 
                your interest in one of the most valuable assets you own: your home."
              </p>
              <p className="text-white/70">
                For a single, one-time premium paid at closing, you receive protection that lasts 
                for as long as you own the property—and even extends to your heirs.
              </p>
            </div>
          </div>
        </section>

        {/* Why One-Time Premium */}
        <section>
          <h2 className="text-2xl font-bold text-secondary mb-4">
            Why a One-Time Premium?
          </h2>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <p className="text-blue-800 mb-4">
              Unlike auto or health insurance where you pay ongoing premiums to cover future risks, 
              title insurance covers <strong>past events</strong>—things that happened before you owned the property.
            </p>
            <p className="text-blue-800 mb-0">
              Once the title search is complete and the policy is issued, the risk profile doesn't change. 
              That's why a single premium at closing provides protection for as long as you own the property.
            </p>
          </div>
        </section>
      </div>

      {/* CTA Banner */}
      <div className="mt-12 bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to Protect Your Investment?</h2>
        <p className="text-white/80 mb-6 max-w-xl mx-auto">
          Learn more about our comprehensive title insurance services and how we protect California homeowners.
        </p>
        <Link
          href="/services/title"
          className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
        >
          Our Title Services
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Related Articles */}
      <div className="mt-12 pt-8 border-t border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4">Continue Learning</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/learn/what-is-title-insurance"
            className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-secondary group-hover:text-primary transition-colors">
                What is Title Insurance?
              </p>
              <p className="text-sm text-gray-500">Understanding the basics</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
          </Link>
          <Link
            href="/learn/life-of-title-search"
            className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-secondary group-hover:text-primary transition-colors">
                Life of a Title Search
              </p>
              <p className="text-sm text-gray-500">The 12-step process explained</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </article>
  )
}
