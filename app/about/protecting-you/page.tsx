import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Search, FileCheck, Gavel, Users } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Protecting You | Pacific Coast Title Company",
  description:
    "Learn how Pacific Coast Title Company protects your property ownership before and after closing with comprehensive title insurance.",
}

export default function ProtectingYouPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center grayscale"
          style={{
            backgroundImage: "url(/professional-title-company-office-team-meeting.jpg)",
          }}
        />
        <div className="absolute inset-0 bg-white/90" />

        <div className="relative container mx-auto px-4 text-center">
          <p className="text-primary font-semibold mb-3 uppercase tracking-wide pt-12">Our Commitment to You</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            Protection Beyond the Policy
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">We're here for the long run</p>
        </div>
      </section>

      {/* Comprehensive Protection */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Comprehensive Protection</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Your title insurance policy is more than a document—it's a promise. Pacific Coast Title's commitment to
              protecting your property ownership extends well beyond the closing table.
            </p>
          </div>
        </div>
      </section>

      {/* Before Closing: Due Diligence */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Search className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Before Closing: Due Diligence</h2>
            </div>

            <p className="text-lg text-muted-foreground mb-8">
              Before you finalize your purchase, our title professionals conduct extensive research into your property's
              history. We examine decades of land records, court documents, and public filings to uncover potential
              issues that could affect your ownership.
            </p>

            <h3 className="text-2xl font-semibold text-foreground mb-4">
              Common issues we identify and resolve before closing include:
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Unpaid contractor liens from previous owner's improvements",
                "Delinquent property taxes or HOA assessments",
                "Boundary disputes or conflicting legal descriptions",
                "Unreleased mortgages from prior refinances",
                "Clerical errors in public records",
                "Unknown heirs or estate claims",
                "Fraudulent conveyances or forged documents",
              ].map((issue, index) => (
                <div key={index} className="flex items-start gap-3 bg-white p-4 rounded-lg border border-border">
                  <FileCheck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">{issue}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-primary/10 rounded-lg border-l-4 border-primary">
              <p className="text-lg font-semibold text-foreground">
                More than one-third of title searches reveal problems that require attention. By identifying these
                issues early, we ensure you close with confidence, knowing your title is clear and insurable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* After Closing: Ongoing Protection */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">After Closing: Ongoing Protection</h2>
            </div>

            <p className="text-lg text-muted-foreground mb-8">
              Once your transaction closes and we issue your title policy, our protection continues throughout your
              ownership. Title insurance is unique—it protects against past defects in title that may not have been
              discoverable during our search.
            </p>

            <h3 className="text-2xl font-semibold text-foreground mb-6">
              If a covered claim is filed against your property, Pacific Coast Title will:
            </h3>

            <div className="space-y-4">
              {[
                {
                  icon: Search,
                  title: "Investigate the claim thoroughly and promptly",
                },
                {
                  icon: Gavel,
                  title: "Defend your ownership rights in court, if necessary",
                },
                {
                  icon: FileCheck,
                  title: "Cover legal costs associated with covered claims",
                },
                {
                  icon: Shield,
                  title: "Resolve valid claims to protect your ownership",
                },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4 bg-muted/30 p-6 rounded-lg">
                  <item.icon className="w-8 h-8 text-primary flex-shrink-0" />
                  <p className="text-lg font-semibold text-foreground">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Peace of Mind for Generations */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Peace of Mind for Generations</h2>
            </div>

            <p className="text-lg text-muted-foreground mb-6">
              Your title insurance policy continues to protect you and your heirs for as long as you hold an interest in
              the property. This one-time premium provides ongoing security, with no annual renewals or additional
              costs.
            </p>

            <p className="text-lg text-muted-foreground">
              Real estate is more than a financial transaction—it's your home, your business, your future. Pacific Coast
              Title provides the security you need to invest with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Work With Us?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Experience the peace of mind that comes with comprehensive title insurance protection.
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
              <Link href="/title-services">Explore Services</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
