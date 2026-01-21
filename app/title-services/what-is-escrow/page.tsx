import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, FileText, Users, CheckCircle, Clock, DollarSign } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "What is Escrow | Pacific Coast Title Company",
  description:
    "Learn how escrow services protect all parties in a real estate transaction by acting as a neutral third party.",
}

export default function WhatIsEscrowPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation variant="light" />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center grayscale"
          style={{
            backgroundImage: "url(/beautiful-modern-california-home-exterior-with-blu.jpg)",
          }}
        />
        <div className="absolute inset-0 bg-white/90" />

        <div className="relative container mx-auto px-4 text-center">
          <p className="text-primary font-semibold mb-3 uppercase tracking-wide pt-12">Understanding Escrow</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            What is Escrow
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            The secure holding zone for your real estate transaction
          </p>
        </div>
      </section>

      {/* Understanding Escrow */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Understanding Escrow</h2>
            <p className="text-lg text-muted-foreground">
              Escrow is a neutral third-party service that ensures all conditions of a real estate transaction are met
              before property and funds change hands. Think of it as a secure "holding zone" where documents and money
              remain until every requirement is satisfied.
            </p>
          </div>
        </div>
      </section>

      {/* How Escrow Works */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">How Escrow Works</h2>
            <p className="text-lg text-muted-foreground mb-8">
              When a real estate purchase agreement is signed, escrow begins. An escrow officer acts as a neutral
              stakeholder, following the instructions from both buyer and seller to:
            </p>

            <div className="space-y-4">
              {[
                {
                  icon: DollarSign,
                  text: "Receive and hold funds deposited by the buyer",
                },
                {
                  icon: FileText,
                  text: "Order and review the title search and title insurance",
                },
                {
                  icon: Users,
                  text: "Coordinate with lenders to ensure financing is in place",
                },
                {
                  icon: Clock,
                  text: "Calculate prorations for property taxes, HOA dues, and other costs",
                },
                {
                  icon: FileText,
                  text: "Prepare closing documents including deeds and settlement statements",
                },
                {
                  icon: CheckCircle,
                  text: "Ensure all conditions are met according to the purchase agreement",
                },
                {
                  icon: DollarSign,
                  text: "Disburse funds to the appropriate parties at closing",
                },
                {
                  icon: Shield,
                  text: "Record documents with the county to transfer legal ownership",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 bg-white p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-muted-foreground pt-1">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Escrow Officer's Role */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">The Escrow Officer's Role</h2>
            <p className="text-lg text-muted-foreground mb-8">Your escrow officer is a neutral party who:</p>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Follows instructions from both buyer and seller as outlined in the purchase agreement",
                "Maintains confidentiality and handles all parties' interests fairly",
                "Manages timelines to ensure a smooth, on-time closing",
                "Communicates clearly with all parties throughout the process",
                "Ensures compliance with real estate laws and regulations",
              ].map((role, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">{role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What Happens During Escrow */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">What Happens During Escrow</h2>
            <p className="text-lg text-muted-foreground mb-8">
              During the escrow period (typically 30-45 days for residential transactions), several important steps
              occur:
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-border">
                <h3 className="text-xl font-semibold text-foreground mb-4">Buyer Responsibilities</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Deposit earnest money</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Secure financing and complete loan application</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Conduct property inspections</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Review preliminary title report</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Obtain homeowner's insurance</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg border border-border">
                <h3 className="text-xl font-semibold text-foreground mb-4">Seller Responsibilities</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Provide required property disclosures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Complete any agreed-upon repairs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Clear title issues identified in preliminary report</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Prepare property for transfer</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg border border-border">
                <h3 className="text-xl font-semibold text-foreground mb-4">Escrow Coordinates</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Title search and insurance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Payoff of existing loans and liens</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Preparation of all closing documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Final walk-through arrangements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Closing and recording</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing Escrow */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Closing Escrow</h2>
            <p className="text-lg text-muted-foreground mb-6">
              When all conditions are met, escrow "closes." At closing:
            </p>

            <div className="space-y-3">
              {[
                "Buyer's loan funds are received and verified",
                "All documents are signed by appropriate parties",
                "Funds are disbursed according to settlement statement",
                "Deed and other documents are recorded with the county",
                "Keys are released to the new owner",
              ].map((step, index) => (
                <div key={index} className="flex items-start gap-3 bg-muted/30 p-4 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Escrow Protects Everyone */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Why Escrow Protects Everyone</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Escrow provides security and peace of mind by ensuring:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Funds are only released when all conditions are met",
                "Title is clear and insurable before ownership transfers",
                "All parties fulfill their contractual obligations",
                "Financial accounting is accurate and transparent",
                "Legal documents are properly executed and recorded",
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">{benefit}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-white rounded-lg border-l-4 border-primary">
              <p className="text-lg font-semibold text-foreground">
                Pacific Coast Title's escrow services provide experienced guidance through every step of your real
                estate transaction, ensuring a smooth, secure, and successful closing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Transaction?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Let Pacific Coast Title guide you through a smooth and secure escrow process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="group">
              <Link href="/contact">
                Contact Us
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="bg-white hover:bg-white/90 text-primary border-white"
            >
              <Link href="/title-services/life-of-escrow">View Escrow Timeline</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
