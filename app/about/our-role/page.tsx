import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, FileSearch, Shield, Users, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Our Role in Title | Pacific Coast Title Company",
  description:
    "Understanding Pacific Coast Title Company's role in protecting your property investment through comprehensive title search and insurance.",
}

export default function OurRolePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation variant="light" />

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
          <p className="text-primary font-semibold mb-3 uppercase tracking-wide pt-12">Understanding Our Process</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            Your Partner in Property Ownership
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Protecting your investment from day one
          </p>
        </div>
      </section>

      {/* Our Role Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Our Role</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
              <p>
                When you purchase property, you're making one of life's most significant financial investments.
                Protecting that investment requires more than just enthusiasm—it requires expertise, diligence, and
                comprehensive title insurance.
              </p>
              <p>
                That's where Pacific Coast Title Company comes in. Our role is to ensure that the property you're
                purchasing has a clear, marketable title free from hidden risks or defects that could jeopardize your
                ownership.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Preliminary Report Process */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">The Preliminary Report Process</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Before your transaction closes, our experienced team conducts an in-depth title search and examination of
              public records. This comprehensive review reveals critical information about your property, including:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: FileSearch,
                  title: "Current Ownership Verification",
                  description: "Confirming the seller has legal authority to transfer the property",
                },
                {
                  icon: Shield,
                  title: "Outstanding Financial Obligations",
                  description: "Identifying unpaid mortgages, property taxes, or assessments that must be resolved",
                },
                {
                  icon: Users,
                  title: "Liens and Judgments",
                  description: "Discovering any claims against the property that could affect your ownership",
                },
                {
                  icon: CheckCircle2,
                  title: "Easements and Restrictions",
                  description: "Understanding any rights others may have to use portions of the property",
                },
              ].map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-lg border border-border">
                  <item.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-primary/10 rounded-lg border-l-4 border-primary">
              <p className="text-lg font-semibold text-foreground">
                More than one-third of all title searches uncover issues that require resolution—problems you'll know
                about before closing, not after.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Protecting Your Investment */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Protecting Your Investment</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Our commitment doesn't end at closing. When we issue your title insurance policy, we're providing
              protection for as long as you or your heirs own the property. If a covered claim arises—whether from a
              forged deed, undisclosed heir, or recording error—Pacific Coast Title stands ready to defend your
              ownership rights.
            </p>
          </div>
        </div>
      </section>

      {/* Collaborative Partnership */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Collaborative Partnership</h2>
            <p className="text-lg text-muted-foreground">
              Real estate transactions involve multiple professionals working together: real estate agents, lenders,
              escrow officers, attorneys, and title insurers. Pacific Coast Title coordinates seamlessly with all
              parties to ensure your transaction proceeds smoothly and efficiently. Our technology-driven processes and
              experienced team make complex transactions manageable.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Work With Us?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Let Pacific Coast Title protect your property investment with expert service and comprehensive coverage.
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
