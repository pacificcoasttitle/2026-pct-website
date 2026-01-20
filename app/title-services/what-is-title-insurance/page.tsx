import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Clock, FileCheck, AlertTriangle, Home, Building } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "What is Title Insurance | Pacific Coast Title Company",
  description:
    "Understanding title insurance and how it protects your property investment from past defects and hidden risks.",
}

export default function WhatIsTitleInsurancePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

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
          <p className="text-primary font-semibold mb-3 uppercase tracking-wide pt-12">Understanding Title Insurance</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            What is Title Insurance
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Protecting your property ownership from hidden risks
          </p>
        </div>
      </section>

      {/* Understanding Title Insurance */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Understanding Title Insurance</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Title insurance protects property owners and lenders from financial loss due to defects in a property's
              title. Unlike other insurance that protects against future events, title insurance protects against past
              issues that may not have been discovered during the title search.
            </p>
          </div>
        </div>
      </section>

      {/* What Makes Title Insurance Unique */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">What Makes Title Insurance Unique</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: Clock,
                  title: "One-Time Premium",
                  description: "You pay once at closing for protection that lasts as long as you own the property.",
                },
                {
                  icon: Shield,
                  title: "Retroactive Protection",
                  description:
                    "Title insurance covers problems that occurred before you purchased the property but weren't discovered until later.",
                },
                {
                  icon: FileCheck,
                  title: "Defect Prevention",
                  description:
                    "Before issuing a policy, we work to identify and resolve title issues, preventing future claims.",
                },
                {
                  icon: AlertTriangle,
                  title: "Legal Defense",
                  description: "If a covered claim arises, we defend your ownership rights and cover legal costs.",
                },
              ].map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-border">
                  <item.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Common Title Problems */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Common Title Problems</h2>
            <p className="text-lg text-muted-foreground mb-8">Title defects can arise from many sources, including:</p>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Errors in public records or legal documents",
                "Unknown liens from previous owners",
                "Forged deeds or fraudulent documents",
                "Undisclosed heirs claiming ownership",
                "Mistakes in title abstracts or surveys",
                "Boundary disputes or conflicting wills",
                "Improper execution of documents",
              ].map((problem, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">{problem}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Two Types of Title Insurance */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">Two Types of Title Insurance</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-lg border border-border">
                <Home className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-semibold text-foreground mb-4">Owner's Policy</h3>
                <p className="text-muted-foreground">
                  Protects the property owner's equity and ownership rights. This is typically purchased during the
                  initial sale and protects you for as long as you or your heirs own the property.
                </p>
              </div>

              <div className="bg-white p-8 rounded-lg border border-border">
                <Building className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-semibold text-foreground mb-4">Lender's Policy</h3>
                <p className="text-muted-foreground">
                  Protects the mortgage lender's investment in the property. Required by most lenders, this policy
                  protects the lender's interest up to the amount of the loan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why You Need Title Insurance */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Why You Need Title Insurance</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Even with careful due diligence, hidden title defects can surface years after purchase. Title insurance
              provides financial protection and legal defense if:
            </p>

            <div className="space-y-4">
              {[
                "Someone claims ownership or interest in your property",
                "A lien from a previous owner resurfaces",
                "Fraud or forgery in the chain of title is discovered",
                "Errors in public records affect your ownership",
                "Boundary disputes emerge with neighbors",
              ].map((reason, index) => (
                <div key={index} className="flex items-start gap-3 bg-muted/30 p-4 rounded-lg">
                  <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">{reason}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-primary/10 rounded-lg border-l-4 border-primary">
              <p className="text-lg font-semibold text-foreground">
                Your home is likely your largest investment. Title insurance protects that investment with comprehensive
                coverage and expert support when you need it most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Protect Your Investment?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Contact Pacific Coast Title to learn more about title insurance and how we can protect your property
            ownership.
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
              <Link href="/title-services/benefits-title-insurance">Learn About Benefits</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
