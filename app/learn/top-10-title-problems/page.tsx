import Link from "next/link"
import { AlertTriangle, ArrowRight, Download, FileWarning, FileX, Users, Scale, PenTool, Eye, MapPin, ScrollText, Ghost, UserX, Shield } from "lucide-react"

export const metadata = {
  title: "Top 10 Title Problems | Pacific Coast Title",
  description: "More than 1/3 of all title searches reveal a problem. Learn about the top 10 title concerns that title insurance protects against.",
}

const titleProblems = [
  {
    number: 1,
    icon: FileWarning,
    title: "Errors in Public Records",
    description: "Clerical or filing errors can affect the deed or survey of your property. These administrative mistakes can create serious legal issues with your ownership that are difficult and expensive to correct.",
    impact: "Could invalidate your deed or affect property boundaries",
  },
  {
    number: 2,
    icon: Scale,
    title: "Unknown Liens",
    description: "Previous owners may have failed to pay taxes, contractor bills, or other debts. When these debts go unpaid, the creditor can place a lien against the property—which you inherit when you purchase.",
    impact: "You could be responsible for the previous owner's debts",
  },
  {
    number: 3,
    icon: FileX,
    title: "Illegal Deeds",
    description: "While the chain of title may appear perfect, a prior deed may have been made by an undocumented immigrant, a minor, a person of unsound mind, or someone reported to be single but actually married.",
    impact: "The entire chain of ownership could be invalid",
  },
  {
    number: 4,
    icon: Users,
    title: "Missing Heirs",
    description: "When someone dies, their property may pass to their heirs or those named in their will. Missing or unknown heirs may appear later to claim ownership of your property.",
    impact: "Unknown heirs could legally claim your home",
  },
  {
    number: 5,
    icon: PenTool,
    title: "Forgeries",
    description: "Forged or fabricated documents may be filed in public records, obscuring the rightful ownership of the property. These documents can be very difficult to detect without professional examination.",
    impact: "Your deed could be completely invalid",
  },
  {
    number: 6,
    icon: Eye,
    title: "Undiscovered Encumbrances",
    description: "Third parties may have claims against the property due to former owners. These claims could include unpaid alimony, child support, or other court-ordered obligations.",
    impact: "Others could have legal claims against your property",
  },
  {
    number: 7,
    icon: MapPin,
    title: "Unknown Easements",
    description: "You may own your property free and clear, but someone else could have the right to use all or part of it. Utility companies, neighbors, or government entities may have undisclosed easement rights.",
    impact: "Your property use could be restricted without your knowledge",
  },
  {
    number: 8,
    icon: MapPin,
    title: "Boundary/Survey Disputes",
    description: "Conflicting surveys could show that a neighbor's fence, driveway, or structure encroaches on your property—or that your home is actually on someone else's land.",
    impact: "You may own less land than you think, or face legal disputes",
  },
  {
    number: 9,
    icon: ScrollText,
    title: "Undiscovered Wills",
    description: "A property owner may have died without a known will, and the estate is distributed by the state. Years later, a will could surface naming a different heir to the property.",
    impact: "The rightful heir could reclaim the property from you",
  },
  {
    number: 10,
    icon: Ghost,
    title: "False Impersonation of Previous Owner",
    description: "A common type of real estate fraud involves someone impersonating the true owner. This is especially common with vacant land or investment properties where the owner may not be vigilant.",
    impact: "You could purchase property from someone who doesn't own it",
  },
]

export default function Top10TitleProblemsPage() {
  return (
    <article className="max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="text-gray-300">/</span>
        <Link href="/learn" className="hover:text-primary">Learn</Link>
        <span className="text-gray-300">/</span>
        <span className="text-primary font-medium">Top 10 Title Problems</span>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">6 min read</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
          Top 10 Title Problems
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          More than one-third of all title searches reveal a problem that needs to be resolved 
          before closing. Here are the most common title concerns—and how title insurance protects you.
        </p>
      </header>

      {/* Intro Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-12">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-amber-900 mb-2">
              Why This Matters to You
            </h2>
            <p className="text-amber-800 mb-0">
              Any of these issues can cost you your home, your investment, or tens of thousands in 
              legal fees. Title insurance is your protection against financial loss from title defects 
              that existed before your purchase—even ones that couldn't be found in public records.
            </p>
          </div>
        </div>
      </div>

      {/* Problems List */}
      <section className="space-y-6 mb-12">
        {titleProblems.map((problem) => (
          <div
            key={problem.number}
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex">
              {/* Number Badge */}
              <div className="w-16 bg-secondary flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-bold text-white">{problem.number}</span>
              </div>
              
              {/* Content */}
              <div className="flex-1 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <problem.icon className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary mb-2">
                      {problem.title}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {problem.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-3 py-1.5 rounded-lg w-fit">
                      <AlertTriangle className="w-4 h-4" />
                      <span><strong>Risk:</strong> {problem.impact}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Bottom Line */}
      <section className="bg-gradient-to-br from-secondary to-secondary/90 rounded-2xl p-8 text-white mb-12">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">The Bottom Line</h2>
            <p className="text-lg text-white/90 leading-relaxed mb-4">
              Title insurance protects you from all of these issues—and more. For a single premium 
              paid at closing, you receive protection that lasts as long as you or your heirs own 
              the property.
            </p>
            <p className="text-white/70">
              If a covered title problem surfaces after closing, your title insurance company will 
              defend your ownership and cover your financial losses, up to the policy amount.
            </p>
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center mb-12">
        <h2 className="text-xl font-bold text-secondary mb-3">Want a Printable Version?</h2>
        <p className="text-gray-600 mb-6">
          Download our "Top 10 Title Concerns" flyer to share with clients.
        </p>
        <a
          href="https://documents.pct.com/assets/downloads/flyers/top-10-title-concerns.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          <Download className="w-5 h-5" />
          Download PDF
        </a>
      </div>

      {/* CTA Banner */}
      <div className="bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Protect Your Investment</h2>
        <p className="text-white/80 mb-6 max-w-xl mx-auto">
          Get a title insurance quote today and secure your ownership for life.
        </p>
        <Link
          href="/#tools"
          className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
        >
          Get a Quote
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
            href="/learn/life-of-title-search"
            className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-secondary group-hover:text-primary transition-colors">
                Life of a Title Search
              </p>
              <p className="text-sm text-gray-500">The 12-step process explained</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </article>
  )
}
