import Link from "next/link"
import { Search, ArrowRight, CheckCircle, FileSearch, FileText, FileCheck, Scale, Send, Stamp, FileBadge, ClipboardCheck, Users, PenTool, Building, BookOpen } from "lucide-react"

export const metadata = {
  title: "Life of a Title Search | Pacific Coast Title",
  description: "Follow the 12-step journey of a title search from start to finish. Understand how title professionals protect your property purchase.",
}

const steps = [
  {
    number: 1,
    icon: FileSearch,
    title: "Verify Property Description",
    description: "The title search begins with verifying the legal description of the property. This ensures we're examining the correct parcel and establishes the foundation for an accurate search.",
    benefit: "Ensures your search is accurate from the start",
  },
  {
    number: 2,
    icon: FileText,
    title: "Open Preliminary Order",
    description: "A preliminary title order is opened in our system. This initiates the official search process and assigns the file to a title examiner.",
    benefit: "Your transaction is officially in progress",
  },
  {
    number: 3,
    icon: Search,
    title: "Conduct Title Search",
    description: "Our examiners search public records including deeds, mortgages, liens, judgments, easements, and other recorded documents affecting the property.",
    benefit: "All recorded issues are identified",
  },
  {
    number: 4,
    icon: FileCheck,
    title: "Examine Records",
    description: "The examiner reviews all discovered documents to identify the current owner, existing liens, and any potential issues that could affect your ownership.",
    benefit: "Hidden problems are uncovered before closing",
  },
  {
    number: 5,
    icon: ClipboardCheck,
    title: "Write Report",
    description: "A preliminary title report is compiled, listing the current ownership, legal description, and all exceptions—items not covered by the policy.",
    benefit: "You receive a clear picture of title status",
  },
  {
    number: 6,
    icon: Users,
    title: "Review Documents",
    description: "The title officer reviews the preliminary report with all parties, explaining any exceptions and addressing concerns.",
    benefit: "Everyone understands what's covered",
  },
  {
    number: 7,
    icon: Scale,
    title: "Clear Conditions",
    description: "Any title defects or issues must be resolved before closing. This may involve paying off liens, obtaining releases, or correcting recording errors.",
    benefit: "Problems are resolved before you take ownership",
  },
  {
    number: 8,
    icon: PenTool,
    title: "Prepare Final Documents",
    description: "Once conditions are cleared, final closing documents are prepared including the deed, settlement statement, and title policies.",
    benefit: "Your documents are ready for signing",
  },
  {
    number: 9,
    icon: Users,
    title: "Coordinate Signing",
    description: "The signing appointment is scheduled and coordinated with all parties. A notary witnesses the execution of all documents.",
    benefit: "A professional guides you through signing",
  },
  {
    number: 10,
    icon: Stamp,
    title: "Complete Recording",
    description: "Signed documents are recorded with the county recorder's office, making the transfer of ownership part of the public record.",
    benefit: "Your ownership is officially recorded",
  },
  {
    number: 11,
    icon: FileBadge,
    title: "Prepare Policies",
    description: "Final title insurance policies are prepared based on the recorded documents and final settlement figures.",
    benefit: "Your protection is being finalized",
  },
  {
    number: 12,
    icon: Send,
    title: "Release Policies",
    description: "Title insurance policies are issued and delivered to the appropriate parties—the owner's policy to you, the lender's policy to your lender.",
    benefit: "You're now fully protected",
  },
]

export default function LifeOfTitleSearchPage() {
  return (
    <article className="max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="text-gray-300">/</span>
        <Link href="/learn" className="hover:text-primary">Learn</Link>
        <span className="text-gray-300">/</span>
        <span className="text-primary font-medium">Life of a Title Search</span>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Search className="w-6 h-6 text-primary" />
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">7 min read</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
          Life of a Title Search
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          A title search is a thorough examination of public records to determine the legal ownership 
          of a property and identify any claims, liens, or other issues that could affect your ownership.
        </p>
      </header>

      {/* Introduction */}
      <div className="prose prose-lg prose-gray max-w-none mb-12">
        <h2 className="text-2xl font-bold text-secondary flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-primary" />
          What is a Title Search?
        </h2>
        <p>
          A title search examines the chain of ownership for a piece of real property, tracing it back 
          through decades of transfers to verify the seller has the legal right to sell. This process 
          uncovers any issues that could prevent you from having clear ownership.
        </p>
        <p>
          The title search is typically initiated by the title company at the request of the buyer's 
          lender, real estate agent, or the buyer themselves. It's a critical step that protects everyone 
          involved in the transaction.
        </p>
      </div>

      {/* Timeline */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-secondary mb-8">
          The 12-Step Process
        </h2>
        
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 hidden md:block" />
          
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.number} className="relative flex gap-6">
                {/* Step Number */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                    {step.number}
                  </div>
                </div>
                
                {/* Step Content */}
                <div className="flex-1 bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-secondary mb-2">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 mb-3">
                        {step.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg w-fit">
                        <CheckCircle className="w-4 h-4" />
                        <span>{step.benefit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="bg-gray-50 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-secondary mb-4">
          How Long Does a Title Search Take?
        </h2>
        <p className="text-gray-600 mb-4">
          A typical title search takes 3-5 business days, though complex properties with lengthy 
          ownership histories may take longer. Rush orders can often be completed in 24-48 hours 
          when needed.
        </p>
        <p className="text-gray-600 mb-0">
          The title company will keep you informed throughout the process and alert you to any 
          issues that need resolution before closing.
        </p>
      </section>

      {/* CTA Banner */}
      <div className="bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Have Questions About Your Title Search?</h2>
        <p className="text-white/80 mb-6 max-w-xl mx-auto">
          Our team is here to guide you through every step of the title process.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
        >
          Contact Us
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Related Articles */}
      <div className="mt-12 pt-8 border-t border-gray-100">
        <h3 className="text-lg font-semibold text-secondary mb-4">Continue Learning</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/learn/what-is-title-insurance"
            className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-secondary group-hover:text-primary transition-colors">
                What is Title Insurance?
              </p>
              <p className="text-sm text-gray-500">Understanding the basics</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
          </Link>
          <Link
            href="/learn/top-10-title-problems"
            className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-secondary group-hover:text-primary transition-colors">
                Top 10 Title Problems
              </p>
              <p className="text-sm text-gray-500">Common issues title insurance protects against</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </article>
  )
}
