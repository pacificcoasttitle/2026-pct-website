import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Life of a Title Search | Pacific Coast Title Company",
  description:
    "Discover what happens behind the scenes during a comprehensive title search and how we protect your property investment.",
}

export default function LifeOfTitleSearchPage() {
  const steps = [
    {
      number: 1,
      title: "Initiating the Search",
      description:
        "When escrow opens, our title team immediately begins researching the property. Using the property's legal description and parcel number, we access multiple databases and record sources to build a complete title history.",
    },
    {
      number: 2,
      title: "Chain of Title Examination",
      description:
        'We trace the property\'s ownership history, often going back 30+ years. This "chain of title" reveals every transfer of ownership, ensuring each transaction was properly executed and recorded.',
      details: [
        "Each owner had legal authority to transfer the property",
        "Deeds were properly executed, acknowledged, and recorded",
        "No gaps or breaks exist in the ownership chain",
        "All prior transactions comply with legal requirements",
      ],
    },
    {
      number: 3,
      title: "Searching Public Records",
      description: "Our title examiners search numerous public record sources, including:",
      details: [
        "County Recorder's Office: Deeds, mortgages, liens, reconveyances, easements, restrictions, covenants",
        "Tax Assessor's Office: Property tax status, assessments, supplemental taxes",
        "County Clerk's Office: Court judgments, lis pendens, bankruptcies",
        "Federal & State Records: Federal tax liens, state tax liens, UCC filings",
        "Probate Court: Estate proceedings affecting the property",
        "Municipal Records: Code violations, unpaid utilities, special assessments",
      ],
    },
    {
      number: 4,
      title: "Identifying Title Issues",
      description:
        'During our search, we look for any "clouds on title"—issues that could affect marketability or ownership. Common findings include:',
      details: [
        "Unreleased mortgages or deeds of trust",
        "Outstanding liens (mechanic's, judgment, tax, HOA)",
        "Easements or rights-of-way affecting the property",
        "Restrictions or covenants limiting property use",
        "Boundary disputes or encroachments",
        "Clerical errors in legal descriptions",
        "Unreleased lis pendens or pending litigation",
        "Estate or probate matters requiring resolution",
      ],
    },
    {
      number: 5,
      title: "Preparing the Preliminary Report",
      description:
        'Once our search is complete, we prepare a Preliminary Title Report (also called a "prelim"). This report includes:',
      details: [
        "Current vested owner",
        "Legal description of the property",
        "Property tax information",
        "All liens, encumbrances, and exceptions to coverage",
        "Requirements that must be satisfied before closing",
        "Easements, restrictions, and conditions affecting the property",
      ],
    },
    {
      number: 6,
      title: "Clearing Title Defects",
      description:
        "If our search uncovers issues, we work diligently to resolve them before closing. This may involve:",
      details: [
        "Obtaining lien releases or reconveyances",
        "Correcting recording errors or legal descriptions",
        "Securing signatures from necessary parties",
        "Clearing judgments or satisfying outstanding debts",
        "Obtaining quitclaim deeds from interested parties",
      ],
    },
    {
      number: 7,
      title: "Final Title Update",
      description:
        'Just before closing, we conduct a final title search update to ensure no new liens or encumbrances have been recorded since the preliminary report. This "bring-down" search confirms the title remains clear and insurable.',
    },
    {
      number: 8,
      title: "Issuing Title Insurance",
      description:
        "Once escrow closes and documents are recorded, we issue the title insurance policy. This policy protects you from covered title defects, including those that may not have been discoverable during our search.",
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
          <p className="text-primary font-semibold mb-3 uppercase tracking-wide pt-12">Behind the Scenes</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            Life of a Title Search
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Understanding the comprehensive research process that protects your ownership
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Behind the Scenes of Your Title Search
            </h2>
            <p className="text-lg text-muted-foreground">
              Before you can close on a property purchase, Pacific Coast Title conducts a comprehensive title search to
              uncover any issues that could affect your ownership. Here's what happens during this critical process.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {steps.map((step) => (
                <div key={step.number} className="bg-white p-8 rounded-lg border border-border">
                  <div className="flex items-start gap-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary text-white rounded-full font-bold text-xl flex-shrink-0">
                      {step.number}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold text-foreground mb-3">
                        Step {step.number}: {step.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">{step.description}</p>

                      {step.details && (
                        <div className="space-y-2">
                          {step.details.map((detail, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground">{detail}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Value of Professional Title Examination */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              The Value of Professional Title Examination
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Title searching requires specialized knowledge of real estate law, recording practices, and public records
              systems. Pacific Coast Title's experienced examiners know what to look for and how to resolve complex
              title issues efficiently.
            </p>

            <div className="p-6 bg-primary/10 rounded-lg border-l-4 border-primary">
              <p className="text-lg font-semibold text-foreground">
                More than one-third of title searches reveal problems requiring resolution. Our thorough process ensures
                you close with clear, marketable, insurable title—protecting your investment for years to come.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Title Search?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Trust Pacific Coast Title's experienced professionals to conduct a thorough title search for your property.
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
              <Link href="/title-services/what-is-title-insurance">Learn About Title Insurance</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
