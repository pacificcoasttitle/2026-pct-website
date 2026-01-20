import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Shield, Users, Clock, FileCheck, Lock, Headphones, CheckCircle, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Escrow Settlement Services | Pacific Coast Title",
  description:
    "Professional escrow settlement services in California. Our experienced escrow officers guide every transaction to a smooth closing.",
}

const features = [
  {
    icon: Shield,
    title: "Neutral Third Party",
    description: "We act as an impartial intermediary, ensuring all conditions are met before funds and documents are exchanged.",
  },
  {
    icon: Users,
    title: "Experienced Officers",
    description: "Our escrow officers average 15+ years of experience handling complex real estate transactions.",
  },
  {
    icon: Clock,
    title: "Timely Closings",
    description: "We work diligently to meet your closing timeline while ensuring accuracy and compliance.",
  },
  {
    icon: FileCheck,
    title: "Document Management",
    description: "Secure handling of all transaction documents, from opening to recording and beyond.",
  },
  {
    icon: Lock,
    title: "Secure Fund Handling",
    description: "Your funds are protected in insured escrow accounts with strict accounting controls.",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    description: "Direct access to your escrow officer throughout the transaction for questions and updates.",
  },
]

const processSteps = [
  {
    step: "1",
    title: "Escrow Opens",
    description: "Once a purchase agreement is signed, escrow is opened and initial deposits are collected.",
  },
  {
    step: "2",
    title: "Title Search",
    description: "We conduct a thorough title search and issue a preliminary report for review.",
  },
  {
    step: "3",
    title: "Document Preparation",
    description: "All closing documents are prepared and reviewed for accuracy and compliance.",
  },
  {
    step: "4",
    title: "Signing",
    description: "Parties sign documents either in-office or with a mobile notary at their convenience.",
  },
  {
    step: "5",
    title: "Funding & Recording",
    description: "Loan funds are received, documents are recorded, and the transaction is finalized.",
  },
  {
    step: "6",
    title: "Closing",
    description: "Funds are disbursed to all parties and you receive your final closing package.",
  },
]

export default function EscrowServicesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium mb-6">
              Escrow Services
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              Professional Escrow Settlement Services
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Our experienced escrow officers provide expert guidance through every step of your real estate 
              transaction, ensuring a smooth and secure closing process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors text-center"
              >
                Open an Escrow
              </Link>
              <Link
                href="/title-services/what-is-escrow"
                className="bg-white border-2 border-primary text-primary px-8 py-4 rounded-xl font-semibold hover:bg-primary/5 transition-colors text-center"
              >
                Learn About Escrow
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Why Choose Our Escrow Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              With nearly two decades of experience, Pacific Coast Title delivers escrow services 
              that protect all parties and ensure successful closings.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">The Escrow Process</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Understanding what happens during escrow helps ensure a smooth transaction. 
              Here's how the process works.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid gap-6">
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
                Comprehensive Escrow Services
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Whether you're buying, selling, or refinancing, our escrow team handles all the details 
                so you can focus on your next chapter.
              </p>
              <div className="space-y-4">
                {[
                  "Residential Purchase Escrows",
                  "Residential Refinance Escrows",
                  "Commercial Transaction Escrows",
                  "For Sale By Owner (FSBO) Escrows",
                  "1031 Exchange Escrows",
                  "Mobile Notary Services",
                  "Document Preparation",
                  "Fund Disbursement",
                ].map((service) => (
                  <div key={service} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-gray-700">{service}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-primary rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Ready to Open Escrow?</h3>
              <p className="text-white/80 mb-6">
                Contact us to get started with your transaction. Our team will guide you through 
                every step of the process.
              </p>
              <div className="space-y-4">
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 w-full bg-white text-primary px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Open an Escrow
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="tel:+17145166700"
                  className="flex items-center justify-center w-full bg-accent text-white px-6 py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors"
                >
                  Call (714) 516-6700
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
