import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Life of an Escrow | Pacific Coast Title Company",
  description:
    "Follow the complete escrow timeline from opening to closing and understand what happens at each phase of your real estate transaction.",
}

export default function LifeOfEscrowPage() {
  const phases = [
    {
      phase: "PHASE 1: OPENING ESCROW",
      days: "Days 1-3",
      tasks: [
        "Purchase agreement is signed",
        "Escrow instructions are prepared and distributed",
        "Initial deposit (earnest money) is collected",
        "Title search is ordered",
        "Demand for payoff is sent to seller's lender (if applicable)",
        "Natural hazard disclosures are ordered",
        "Buyer's lender receives escrow details",
      ],
    },
    {
      phase: "PHASE 2: DUE DILIGENCE",
      days: "Days 4-17",
      tasks: [
        "Preliminary title report is issued",
        "Property inspections are conducted (home, termite, roof, etc.)",
        "Seller provides required disclosures",
        "Buyer reviews all reports and disclosures",
        "Any necessary repairs are negotiated and scheduled",
        "Buyer's loan application is processed",
        "Property appraisal is completed",
      ],
    },
    {
      phase: "PHASE 3: LOAN PROCESSING",
      days: "Days 18-25",
      tasks: [
        "Lender orders final title policy",
        "Underwriting reviews all loan documentation",
        "Final loan conditions are cleared",
        "Homeowner's insurance is confirmed",
        "Loan documents are prepared",
        "Closing figures are calculated",
      ],
    },
    {
      phase: "PHASE 4: FINAL PREPARATIONS",
      days: "Days 26-30",
      tasks: [
        "Settlement statement (Closing Disclosure) is prepared",
        "Buyer receives Closing Disclosure for 3-day review",
        "Final walk-through is scheduled",
        "Signing appointment is scheduled",
        "Buyer submits closing funds (wire or cashier's check)",
        "Seller completes any final obligations",
      ],
    },
    {
      phase: "PHASE 5: CLOSING & RECORDING",
      days: "Days 30-31",
      tasks: [
        "Signing appointment completed",
        "Buyer signs loan documents and receives keys",
        "Seller signs deed and transfer documents",
        "Lender funds the loan",
        "Deed and other documents are recorded with county",
        "Funds are disbursed to all parties",
        "Title insurance policies are issued",
        "Congratulations—you've closed escrow!",
      ],
    },
  ]

  const timelineVariables = [
    {
      factor: "Financing type",
      description: "Cash purchases close faster; FHA/VA loans may take longer",
    },
    {
      factor: "Contingencies",
      description: "Inspection, appraisal, and financing contingencies affect timing",
    },
    {
      factor: "Property type",
      description: "Single-family homes close faster than commercial properties",
    },
    {
      factor: "Market conditions",
      description: "High-volume periods may extend processing times",
    },
    {
      factor: "Complexity",
      description: "REO, short sales, or probate transactions require additional steps",
    },
  ]

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
          <p className="text-primary font-semibold mb-3 uppercase tracking-wide pt-12">Your Escrow Timeline</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            Life of an Escrow
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Understanding the journey from opening to closing
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">The Escrow Journey</h2>
            <p className="text-lg text-muted-foreground">
              Understanding the escrow process helps you know what to expect during your real estate transaction. Here's
              a step-by-step look at a typical residential escrow timeline.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline Phases */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {phases.map((phase, index) => (
                <div key={index} className="bg-white p-8 rounded-lg border border-border">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary text-white rounded-full font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-foreground">{phase.phase}</h3>
                      <p className="text-primary font-semibold">{phase.days}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    {phase.tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-muted-foreground">{task}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Variables */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Timeline Variables</h2>
            <p className="text-lg text-muted-foreground mb-8">
              The timeline above represents a typical residential purchase. Your escrow may be longer or shorter
              depending on:
            </p>

            <div className="space-y-4">
              {timelineVariables.map((variable, index) => (
                <div key={index} className="bg-muted/30 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{variable.factor}</h3>
                  <p className="text-muted-foreground">{variable.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Communication Is Key */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Communication Is Key</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Throughout escrow, your escrow officer keeps all parties informed of progress, upcoming deadlines, and any
              issues requiring attention. Clear communication and timely response to requests help ensure a smooth,
              on-time closing.
            </p>

            <div className="p-6 bg-white rounded-lg border-l-4 border-primary">
              <p className="text-lg font-semibold text-foreground">
                Pacific Coast Title manages hundreds of escrows monthly. Our experienced team knows how to keep your
                transaction on track from opening to closing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Open Escrow?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Let Pacific Coast Title guide you through a smooth escrow process from start to finish.
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
              <Link href="/title-services/what-is-escrow">Learn About Escrow</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
