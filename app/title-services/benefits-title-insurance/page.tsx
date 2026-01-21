import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowRight, DollarSign, Shield, Scale, TrendingUp, CheckCircle, Users, Award, Clock } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Benefits of Title Insurance | Pacific Coast Title Company",
  description:
    "Discover the key benefits of title insurance and why it's essential for protecting your real estate investment.",
}

export default function BenefitsTitleInsurancePage() {
  const benefits = [
    {
      icon: DollarSign,
      title: "One-Time Premium, Lifetime Protection",
      description:
        "Unlike other insurance requiring annual premiums, you pay for title insurance once—at closing. That single premium provides continuous protection for as long as you or your heirs own the property.",
    },
    {
      icon: Shield,
      title: "Protects Against Hidden Risks",
      description: "Even the most thorough title search can't uncover certain defects:",
      details: [
        "Forged signatures on deeds or documents",
        "Undisclosed or unknown heirs claiming ownership",
        "False impersonation of previous owners",
        "Deeds executed by minors or individuals lacking mental capacity",
        "Fraud or duress in executing documents",
        "Recording errors or clerical mistakes",
      ],
      note: "Title insurance protects you financially if these issues emerge after purchase.",
    },
    {
      icon: Scale,
      title: "Legal Defense Included",
      description: "If someone challenges your ownership, your title insurance policy covers:",
      details: [
        "Legal fees to defend your title",
        "Court costs associated with covered claims",
        "Expert witness and investigation costs",
        "Settlement or resolution expenses",
      ],
      note: "You won't face these potentially enormous costs alone.",
    },
    {
      icon: TrendingUp,
      title: "Lender Protection & Requirement",
      description:
        "If you're financing your purchase, your lender will require a Lender's Title Insurance Policy to protect their investment. This policy:",
      details: [
        "Protects the lender's security interest in the property",
        "Remains in effect until the loan is paid off",
        "Costs significantly less than an Owner's Policy",
      ],
      note: "Most buyers also purchase an Owner's Policy to protect their own equity.",
    },
    {
      icon: CheckCircle,
      title: "Marketability Assurance",
      description:
        'Title insurance confirms your property has "marketable title"—meaning you can sell or refinance without title issues blocking the transaction. When you\'re ready to sell, your clear title makes the process smoother.',
    },
    {
      icon: Award,
      title: "Comprehensive Pre-Closing Work",
      description: "Your title insurance premium includes extensive pre-closing services:",
      details: [
        "Thorough public records research",
        "Title examination by trained professionals",
        "Resolution of discovered title defects",
        "Preparation of preliminary title report",
        "Coordination with all transaction parties",
      ],
      note: "Most title problems are resolved before closing—prevention that protects your investment.",
    },
    {
      icon: DollarSign,
      title: "Financial Recovery",
      description:
        "If a covered title claim results in financial loss, your title insurance policy compensates you up to the policy amount. This protection covers:",
      details: [
        "Loss of property ownership",
        "Loss of property value due to title defects",
        "Costs to remove encumbrances or liens",
        "Legal expenses in defending your rights",
      ],
    },
    {
      icon: Users,
      title: "Estate Planning Protection",
      description:
        "Title insurance continues to protect your heirs after your death. If title issues emerge during estate settlement, your policy still provides coverage—protecting the legacy you leave.",
    },
    {
      icon: Clock,
      title: "Peace of Mind",
      description:
        "Real estate transactions involve significant financial commitment. Title insurance lets you proceed with confidence, knowing:",
      details: [
        "Your ownership is protected",
        "Hidden defects won't derail your investment",
        "Expert support is available if issues arise",
        "Your equity is secure",
      ],
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
          <p className="text-primary font-semibold mb-3 uppercase tracking-wide pt-12">Value & Protection</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            Benefits of Title Insurance
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Why title insurance matters for your property investment
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Why Title Insurance Matters</h2>
            <p className="text-lg text-muted-foreground">
              Title insurance provides financial protection and peace of mind when purchasing real estate. Here's why
              it's essential for protecting your property investment.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white p-8 rounded-lg border border-border">
                  <div className="flex items-start gap-6">
                    <div className="flex items-center justify-center w-14 h-14 bg-primary/10 rounded-lg flex-shrink-0">
                      <benefit.icon className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold text-foreground mb-3">
                        {index + 1}. {benefit.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">{benefit.description}</p>

                      {benefit.details && (
                        <div className="space-y-2 mb-4">
                          {benefit.details.map((detail, detailIndex) => (
                            <div key={detailIndex} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                              <p className="text-sm text-muted-foreground">{detail}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {benefit.note && <p className="text-sm text-muted-foreground italic">{benefit.note}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* A Small Investment */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              A Small Investment for Major Protection
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Compared to your property's value and the potential cost of title defects, title insurance is a small,
              one-time expense that delivers enormous long-term value. It's protection you'll hope to never need—but
              will be grateful to have if a title problem emerges.
            </p>

            <div className="p-6 bg-primary/10 rounded-lg border-l-4 border-primary">
              <p className="text-lg font-semibold text-foreground">
                Pacific Coast Title provides comprehensive title insurance backed by expert service and claims support
                when you need it most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Protect Your Investment Today</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Contact Pacific Coast Title to learn more about title insurance and get a quote for your property.
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
              <Link href="/title-services/what-is-title-insurance">What is Title Insurance</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
