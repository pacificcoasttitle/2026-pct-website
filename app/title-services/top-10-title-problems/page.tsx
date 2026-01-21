import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  AlertTriangle,
  FileX,
  Scale,
  Users,
  FileWarning,
  MapPin,
  Grid,
  FileQuestion,
  UserX,
  HelpCircle,
} from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Top 10 Title Problems | Pacific Coast Title Company",
  description: "Learn about the most common title issues and how title insurance protects you from these hidden risks.",
}

export default function Top10TitleProblemsPage() {
  const problems = [
    {
      icon: FileX,
      title: "Errors in Public Records",
      problem:
        "Clerks, recorders, and other government officials occasionally make filing or recording mistakes that can affect your property title.",
      risk: "Incorrect legal descriptions, wrong property identifications, or misfiled documents can cloud your title.",
      protection: "Covers losses from recording errors and provides legal defense to correct official records.",
    },
    {
      icon: AlertTriangle,
      title: "Unknown Liens",
      problem:
        "Previous owners may have unpaid debts that resulted in liens against the property—mechanic's liens, judgment liens, tax liens, or HOA liens.",
      risk: "These liens can become your responsibility if not discovered and cleared before closing.",
      protection:
        "Our title search identifies most liens before closing. If a lien wasn't discoverable, your policy covers the cost to remove it.",
    },
    {
      icon: Scale,
      title: "Illegal Deeds",
      problem: "A previous deed may have been executed by someone who was:",
      details: [
        "A minor",
        "Mentally incompetent",
        "Under duress or undue influence",
        "Acting under expired or invalid power of attorney",
        "A falsely identified person",
      ],
      risk: "An invalid deed in the chain of title can invalidate all subsequent transfers, including yours.",
      protection: "Defends your ownership and covers financial loss if a prior deed is deemed invalid.",
    },
    {
      icon: Users,
      title: "Missing Heirs",
      problem:
        "When a property owner dies, unknown or missing heirs may surface later claiming ownership interest in the property.",
      risk: "If a will is contested or an heir appears who wasn't part of the estate settlement, your ownership could be challenged.",
      protection: "Covers claims from undisclosed or missing heirs and provides legal defense.",
    },
    {
      icon: FileWarning,
      title: "Forgery or Fraud",
      problem:
        "Criminals may forge signatures on deeds, create fraudulent documents, or impersonate property owners to illegally transfer property.",
      risk: "A forged document in the chain of title can invalidate your ownership.",
      protection: "Protects against losses from forged deeds, mortgages, releases, and other fraudulent documents.",
    },
    {
      icon: MapPin,
      title: "Undisclosed Easements",
      problem:
        "Easements give others the right to use portions of your property (utility access, shared driveways, access to landlocked parcels).",
      risk: "An undiscovered easement can limit how you use your property or reduce its value.",
      protection:
        "Our title search reveals recorded easements. If an unrecorded easement emerges, your policy may provide coverage.",
    },
    {
      icon: Grid,
      title: "Boundary and Survey Disputes",
      problem:
        "Incorrect boundary lines, conflicting surveys, or encroachments from neighboring structures can create ownership disputes.",
      risk: "Disputes over fence lines, driveways, or building setbacks can be costly to resolve.",
      protection: "Covers legal costs to defend boundary claims and financial loss from covered boundary disputes.",
    },
    {
      icon: FileQuestion,
      title: "Unreleased Mortgages",
      problem:
        "When a previous owner paid off their mortgage, the lender should have recorded a reconveyance. Sometimes this doesn't happen, leaving the old mortgage appearing on record.",
      risk: "An unreleased mortgage clouds your title and may need legal action to remove.",
      protection:
        "We identify and clear most unreleased mortgages before closing. If one surfaces later, your policy covers removal costs.",
    },
    {
      icon: HelpCircle,
      title: "Interpretation Issues",
      problem:
        "Wills, trusts, deeds, and legal documents sometimes contain ambiguous language or conflicting provisions.",
      risk: "Different interpretations can lead to disputes over who rightfully owns the property.",
      protection: "Covers legal defense costs and financial loss from disputes over document interpretation.",
    },
    {
      icon: UserX,
      title: "False Impersonation",
      problem: "Someone may falsely impersonate the true property owner to fraudulently sell or mortgage the property.",
      risk: "If discovered later, the true owner may reclaim the property, leaving you without ownership despite paying for it.",
      protection:
        "Protects against loss from false impersonation and provides legal defense to protect your ownership.",
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
          <p className="text-primary font-semibold mb-3 uppercase tracking-wide pt-12">Common Title Issues</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
            Top 10 Title Problems
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
            Understanding the risks title insurance protects against
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Common Title Issues We Protect You Against
            </h2>
            <p className="text-lg text-muted-foreground">
              During title searches, Pacific Coast Title frequently encounters problems that could jeopardize property
              ownership. Here are the 10 most common title issues—and how title insurance protects you.
            </p>
          </div>
        </div>
      </section>

      {/* Problems List */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-8">
              {problems.map((problem, index) => (
                <div key={index} className="bg-white p-8 rounded-lg border border-border">
                  <div className="flex items-start gap-6">
                    <div className="flex items-center justify-center w-14 h-14 bg-red-50 rounded-lg flex-shrink-0">
                      <problem.icon className="w-7 h-7 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold text-foreground mb-4">
                        {index + 1}. {problem.title}
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground mb-1">The Problem:</p>
                          <p className="text-muted-foreground">{problem.problem}</p>
                          {problem.details && (
                            <ul className="mt-2 space-y-1">
                              {problem.details.map((detail, detailIndex) => (
                                <li key={detailIndex} className="flex items-start gap-2 ml-4">
                                  <span className="text-primary mt-1">-</span>
                                  <span className="text-sm text-muted-foreground">{detail}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-foreground mb-1">The Risk:</p>
                          <p className="text-muted-foreground">{problem.risk}</p>
                        </div>

                        <div className="bg-primary/10 p-4 rounded-lg">
                          <p className="text-sm font-semibold text-foreground mb-1">Title Insurance Protection:</p>
                          <p className="text-sm text-muted-foreground">{problem.protection}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Prevention and Protection */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Prevention and Protection</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Pacific Coast Title's comprehensive title search identifies and resolves most issues before closing. For
              problems that can't be discovered despite diligent searching, your title insurance policy provides
              financial protection and legal defense.
            </p>

            <div className="p-6 bg-primary/10 rounded-lg border-l-4 border-primary">
              <p className="text-lg font-semibold text-foreground">
                Real estate is complex, and title defects can arise from decades-old transactions. Title insurance
                ensures that problems from the past don't derail your future.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Protect Yourself from Title Problems</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Contact Pacific Coast Title to learn how comprehensive title insurance protects your property investment.
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
              <Link href="/title-services/benefits-title-insurance">View Benefits</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
