import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Shield, Users, Laptop, Award, CheckCircle, MapPin, ArrowRight, Building2 } from "lucide-react"

export const metadata = {
  title: "About Us | Pacific Coast Title Company",
  description:
    "Serving California since 2005. Pacific Coast Title provides technology-forward title and escrow services backed by major national underwriters.",
}

const stats = [
  { value: "2005", label: "Serving California Since" },
  { value: "100K+", label: "Transactions Protected" },
  { value: "5", label: "California Offices" },
  { value: "45+", label: "Combined Years Experience" },
]

const underwriters = [
  "First American Title Insurance Company",
  "Fidelity National Title Insurance Company",
  "Old Republic National Title Insurance Company",
  "Stewart Title Guaranty Company",
]

const values = [
  {
    icon: Shield,
    title: "Your Investment, Protected",
    description:
      "Every transaction we handle is backed by major national title insurers. Your protection isn't just a promise—it's guaranteed.",
  },
  {
    icon: Users,
    title: "Real People, Real Answers",
    description:
      "No phone trees. No runaround. When you call, you reach your dedicated escrow officer who knows your file inside and out.",
  },
  {
    icon: Laptop,
    title: "Technology That Saves You Time",
    description:
      "From AI-powered document analysis to instant rate quotes, our tools help you close faster without sacrificing accuracy.",
  },
  {
    icon: Award,
    title: "Experience That Shows",
    description:
      "Nearly two decades of handling California transactions means we've seen every curveball. Your deal closes on schedule.",
  },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/professional-title-company-office-team-meeting.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-secondary/90" />
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center pt-24 pb-16">
          <p className="text-primary font-semibold tracking-wide uppercase mb-4">About Pacific Coast Title</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 max-w-4xl mx-auto">
            Your Transaction Deserves
            <br />
            <span className="text-primary">Experienced Hands</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Since 2005, California families and real estate professionals have trusted us to protect 
            their investments and close their deals on time.
          </p>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-secondary mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story - Customer Focused */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-8 text-center">
              What This Means For You
            </h2>
            
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                When you're in the middle of a real estate transaction, the last thing you need is uncertainty. 
                Will the title search uncover problems? Will closing happen on time? Is your investment protected?
              </p>
              
              <p>
                That's where nearly two decades of experience makes a difference. Since 2005, we've handled 
                over 100,000 transactions across California—from first-time homebuyers in Orange County to 
                commercial developers in San Diego. We've seen every type of title issue, lien complication, 
                and last-minute curveball. And we've resolved them.
              </p>

              <div className="bg-white p-6 rounded-xl border-l-4 border-primary my-8">
                <p className="text-lg font-medium text-secondary mb-0">
                  "We don't just process transactions. We protect people's biggest investments—and we take that seriously."
                </p>
              </div>

              <p>
                Our team combines old-school service values with modern technology. You get a dedicated 
                escrow officer who knows your file (not a call center). You get AI-powered tools that 
                catch issues early (not surprises at closing). And you get the backing of America's 
                largest title insurers (not just promises).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values - Customer Benefit Focused */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Why Clients Choose PCT
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              What you get when you work with us
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <div key={value.title} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Underwriters Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Your Policy Is Backed By The Best
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              We partner with America's largest and most financially secure title insurers, 
              so your protection is rock-solid.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {underwriters.map((underwriter) => (
                <div key={underwriter} className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-100">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{underwriter}</span>
                </div>
              ))}
            </div>

            <p className="text-sm text-gray-500 mt-8">
              Each underwriter is rated A or higher by major rating agencies, ensuring your policy 
              is backed by companies with proven financial strength.
            </p>
          </div>
        </div>
      </section>

      {/* Locations Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Building2 className="w-12 h-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Local Offices, Statewide Reach
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              With offices in Orange, Glendale, Downey, Ontario, and San Diego, help is never far away. 
              Each office is staffed by escrow professionals who know your local market.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Find Your Nearest Office
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Close with Confidence?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/80">
            Whether you're an agent, lender, buyer, or seller—we're here to make your transaction smooth and your closing successful.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2"
            >
              Contact Us
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/#tools"
              className="bg-white text-secondary px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Get a Rate Estimate
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
