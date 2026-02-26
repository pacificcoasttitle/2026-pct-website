import Link from "next/link"
import { PageHero } from "@/components/page-hero"
import { Shield, Users, Clock, FileCheck, Lock, Headphones, CheckCircle, ArrowRight, ChevronRight } from "lucide-react"

export const metadata = {
  title: "Escrow Settlement Services | Pacific Coast Title",
  description:
    "Professional escrow services that keep your transaction on track. From opening to closing, we handle the details so you can focus on your next chapter.",
}

const whatWeHandle = [
  {
    icon: Shield,
    title: "We're the Neutral Party",
    description: "We hold funds and documents securely until everyone has met their obligations. No playing favorites—just fair, impartial service.",
  },
  {
    icon: FileCheck,
    title: "We Track Every Detail",
    description: "Dozens of documents, multiple deadlines, various parties. We keep everything organized so nothing falls through the cracks.",
  },
  {
    icon: Lock,
    title: "Your Money Is Protected",
    description: "Funds are held in insured escrow accounts with strict controls. Your earnest money and closing funds are safeguarded at every step.",
  },
  {
    icon: Clock,
    title: "We Keep Things Moving",
    description: "Proactive communication with all parties means issues get resolved quickly. We work to meet your closing date, not push it back.",
  },
  {
    icon: Users,
    title: "One Person Knows Your File",
    description: "Your dedicated escrow officer handles your transaction from start to finish. No getting bounced between departments.",
  },
  {
    icon: Headphones,
    title: "You Can Always Reach Us",
    description: "Questions don't wait for business hours. You have direct access to your escrow officer for updates and answers.",
  },
]

const processSteps = [
  {
    step: "1",
    title: "Escrow Opens",
    what: "We receive the purchase agreement and open your file",
    benefit: "You get a single point of contact who will guide the entire transaction",
  },
  {
    step: "2",
    title: "Title Search Begins",
    what: "We examine public records to verify ownership and uncover any issues",
    benefit: "Problems are found early—while there's still time to solve them",
  },
  {
    step: "3",
    title: "Documents Are Prepared",
    what: "We prepare and coordinate all closing documents",
    benefit: "Everything is reviewed for accuracy before you ever pick up a pen",
  },
  {
    step: "4",
    title: "Signing Day",
    what: "All parties sign their documents (in-office or via mobile notary)",
    benefit: "We explain what you're signing in plain English—no confusion",
  },
  {
    step: "5",
    title: "Funding & Recording",
    what: "Loan funds arrive; documents are recorded at the county",
    benefit: "You're officially on record as the new owner",
  },
  {
    step: "6",
    title: "Closing & Disbursement",
    what: "Funds are distributed to all parties; you receive your final package",
    benefit: "You get the keys. The seller gets paid. Everyone's happy.",
  },
]

const services = [
  "Residential Purchase Escrows",
  "Refinance Escrows",
  "Commercial Transaction Escrows",
  "For Sale By Owner (FSBO) Escrows",
  "1031 Exchange Escrows",
  "Short Sale Escrows",
  "Mobile Notary Services",
  "Document Preparation",
]

export default function EscrowServicesPage() {
  return (
    <>
      <PageHero
        label="Escrow Services"
        title="Get to Closing Day"
        titleHighlight="Without the Stress"
        subtitle="We handle the paperwork, coordinate the parties, and protect everyone's interests—so you can focus on your next chapter."
      />

      {/* What Is Escrow - Customer Focused */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-8 text-center">
              What Escrow Does For You
            </h2>
            
            <div className="prose prose-lg max-w-none text-gray-600 space-y-6">
              <p>
                Real estate transactions involve a lot of moving parts: buyers, sellers, agents, lenders, 
                inspectors, appraisers—all with their own deadlines and requirements. Escrow is the 
                neutral third party that keeps everything organized and protects everyone's interests.
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl my-8">
                <p className="font-semibold text-blue-800 mb-2">Think of it this way:</p>
                <p className="text-blue-700 mb-0">
                  The seller doesn't want to hand over the deed until they're sure they'll get paid. 
                  The buyer doesn't want to hand over their money until they're sure they'll get clear title. 
                  Escrow makes sure both happen simultaneously—so everyone's protected.
                </p>
              </div>

              <p>
                From the moment your purchase agreement is signed until the day you get your keys, your 
                escrow officer coordinates every step, manages every document, and keeps every party 
                informed. When closing day arrives, you're not scrambling to figure out what's missing—
                everything's already in place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Handle */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              What We Handle For You
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              So you can focus on what matters—your move, your investment, your next chapter
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {whatWeHandle.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* The Process - Customer Benefit */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              The Journey to Your Closing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Here's what happens at each step—and what it means for you
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {processSteps.map((item, index) => (
                <div key={item.step} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                      {item.step}
                    </div>
                    {index < processSteps.length - 1 && (
                      <div className="w-0.5 h-full bg-primary/20 mx-auto mt-2" />
                    )}
                  </div>
                  <div className="pb-8">
                    <h3 className="text-xl font-bold text-secondary mb-2">{item.title}</h3>
                    <p className="text-gray-600 mb-2"><strong>What happens:</strong> {item.what}</p>
                    <p className="text-gray-600"><strong>Your benefit:</strong> {item.benefit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services List + CTA */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
                Escrow Services We Provide
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Whether you're buying your first home, selling an investment property, or refinancing 
                to lower your rate—we've handled transactions like yours thousands of times.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div key={service} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-gray-700">{service}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-secondary rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Open Escrow?</h3>
              <p className="text-white/80 mb-6">
                Starting your transaction is easy. Contact us and we'll assign a dedicated 
                escrow officer to guide you through every step.
              </p>
              <div className="space-y-4">
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 w-full bg-white text-secondary px-6 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Open an Escrow
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="tel:+18667241050"
                  className="flex items-center justify-center w-full bg-primary text-white px-6 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                >
                  Call (866) 724-1050
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-12 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            <strong className="text-secondary">Since 2005</strong>, we've handled over 100,000 escrow 
            transactions across California. Your closing is in experienced hands.
          </p>
        </div>
      </section>
    </>
  )
}
