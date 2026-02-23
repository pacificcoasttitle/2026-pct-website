import Link from "next/link"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PageHero } from "@/components/page-hero"
import {
  Shield,
  Search,
  FileCheck,
  AlertTriangle,
  Lock,
  Scale,
  CheckCircle,
  ArrowRight,
  Eye,
  UserCheck,
  FileText,
  Gavel,
} from "lucide-react"

export const metadata = {
  title: "How We Protect You | Pacific Coast Title Company",
  description:
    "Learn how Pacific Coast Title protects your property investment through thorough title searches, comprehensive insurance policies, and expert escrow services.",
}

const protectionSteps = [
  {
    icon: Search,
    title: "Thorough Title Search",
    description:
      "We examine decades of public records—deeds, mortgages, court records, tax records, and more—to uncover any issues that could affect your ownership rights.",
    detail: "Our title examiners review an average of 50+ years of property history per transaction.",
  },
  {
    icon: Eye,
    title: "Expert Examination",
    description:
      "Trained title professionals carefully examine every document in the chain of title, looking for gaps, errors, and potential claims that could surface later.",
    detail: "Issues are caught and resolved before closing, not after.",
  },
  {
    icon: AlertTriangle,
    title: "Issue Resolution",
    description:
      "If our search uncovers liens, encumbrances, or other defects, we work proactively to resolve them before your transaction closes.",
    detail: "Common issues include unpaid taxes, unsatisfied mortgages, and recording errors.",
  },
  {
    icon: FileCheck,
    title: "Preliminary Report",
    description:
      "You receive a detailed preliminary title report showing exactly what we found, so you can make informed decisions before closing.",
    detail: "Full transparency—no surprises at the closing table.",
  },
  {
    icon: Shield,
    title: "Title Insurance Policy",
    description:
      "Your policy protects against both known and unknown defects in title, including fraud, forgery, and recording errors that even the most thorough search might not reveal.",
    detail: "A one-time premium provides lifetime protection for property owners.",
  },
  {
    icon: Gavel,
    title: "Legal Defense",
    description:
      "If someone challenges your ownership, your title insurance policy covers the legal costs to defend your title, up to the policy amount.",
    detail: "You're never alone if a claim arises—your insurer handles the defense.",
  },
]

const commonThreats = [
  { icon: FileText, title: "Forged Documents", description: "Fraudulent deeds or releases that appear legitimate in the public record." },
  { icon: UserCheck, title: "Undisclosed Heirs", description: "Unknown relatives who may have a legal claim to the property." },
  { icon: Lock, title: "Hidden Liens", description: "Tax liens, mechanics' liens, or judgment liens not immediately visible." },
  { icon: Scale, title: "Boundary Disputes", description: "Survey errors or encroachments that affect property boundaries." },
]

export default function HowWeProtectYouPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      <PageHero
        label="Your Protection"
        title="How We Protect You"
        subtitle="Your home is likely the biggest investment you'll ever make. Here's how Pacific Coast Title works behind the scenes to make sure your ownership is secure from day one."
      />

      {/* Protection Steps */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-secondary mb-12 text-center">
              Our Multi-Layer Protection Process
            </h2>

            <div className="space-y-8">
              {protectionSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={step.title} className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center relative">
                        <Icon className="w-7 h-7 text-primary" />
                        <span className="absolute -top-2 -right-2 w-6 h-6 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                      </div>
                      {index < protectionSteps.length - 1 && (
                        <div className="w-px h-8 bg-gray-200 mx-auto mt-2" />
                      )}
                    </div>
                    <div className="pb-4">
                      <h3 className="text-xl font-bold text-secondary mb-2">{step.title}</h3>
                      <p className="text-gray-600 mb-2">{step.description}</p>
                      <p className="text-sm text-primary font-medium">{step.detail}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Common Threats */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary mb-4">
                What Are We Protecting You From?
              </h2>
              <p className="text-xl text-gray-600">
                These are real threats that can jeopardize your property ownership—even years after closing.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {commonThreats.map((threat) => {
                const Icon = threat.icon
                return (
                  <div key={threat.title} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-red-500" />
                      </div>
                      <div>
                        <h3 className="font-bold text-secondary mb-1">{threat.title}</h3>
                        <p className="text-gray-600 text-sm">{threat.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Key Takeaway */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-secondary mb-6">
              Peace of Mind, For Life
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Unlike other types of insurance, title insurance requires only a single premium payment at closing 
              and protects you for as long as you (or your heirs) own the property. It&apos;s one of the smartest 
              investments you can make when purchasing real estate.
            </p>

            <div className="grid sm:grid-cols-3 gap-6 mb-12">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="text-3xl font-bold text-primary mb-2">1x</div>
                <div className="text-sm text-gray-600">One-time premium payment</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="text-3xl font-bold text-primary mb-2">∞</div>
                <div className="text-sm text-gray-600">Lifetime coverage</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="text-3xl font-bold text-primary mb-2">100%</div>
                <div className="text-sm text-gray-600">Legal defense included</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/#tools"
                className="bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2"
              >
                Get a Rate Estimate
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/learn/what-is-title-insurance"
                className="bg-gray-100 text-secondary px-8 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Learn About Title Insurance
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
