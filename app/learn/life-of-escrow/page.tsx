import Link from "next/link"
import { Clock, ArrowRight, CheckCircle, User, Home, Building2, Landmark, Users } from "lucide-react"

export const metadata = {
  title: "Life of an Escrow | Pacific Coast Title",
  description: "Follow the complete escrow process from start to finish. Understand what the buyer, seller, escrow holder, and lender do at each stage.",
}

const buyerTasks = [
  "Open escrow by depositing earnest money",
  "Review and sign purchase agreement",
  "Apply for financing and provide lender documentation",
  "Order and review home inspection",
  "Review preliminary title report",
  "Provide proof of homeowner's insurance",
  "Review and sign loan documents",
  "Wire closing funds",
  "Final walkthrough of property",
  "Sign closing documents",
  "Receive keys to your new home",
]

const sellerTasks = [
  "Accept offer and sign purchase agreement",
  "Open escrow by signing instructions",
  "Provide property disclosures",
  "Complete required repairs (if any)",
  "Review and approve buyer's contingency removals",
  "Sign grant deed and other closing documents",
  "Cancel homeowner's insurance and utilities",
  "Provide keys and garage remotes",
  "Receive proceeds from sale",
]

const escrowHolderTasks = [
  "Open escrow and prepare instructions",
  "Order preliminary title report",
  "Receive and hold earnest money deposit",
  "Coordinate document collection from all parties",
  "Order payoff demands from existing lenders",
  "Calculate prorations for taxes, HOA, etc.",
  "Coordinate with lender for loan documents",
  "Prepare closing disclosure and settlement statement",
  "Conduct signing appointment",
  "Collect closing funds from buyer",
  "Record deed and loan documents",
  "Disburse funds to all parties",
  "Issue title insurance policies",
]

const lenderTasks = [
  "Receive loan application from buyer",
  "Order appraisal of property",
  "Verify buyer's income, assets, and credit",
  "Underwrite and approve loan",
  "Prepare loan documents",
  "Send documents to escrow for signing",
  "Review signed documents",
  "Fund the loan",
]

const processParties = [
  {
    id: "buyer",
    icon: User,
    title: "The Buyer",
    description: "What you'll do as a homebuyer",
    tasks: buyerTasks,
    color: "primary",
  },
  {
    id: "seller",
    icon: Home,
    title: "The Seller",
    description: "What the seller does during escrow",
    tasks: sellerTasks,
    color: "accent",
  },
  {
    id: "escrow",
    icon: Building2,
    title: "The Escrow Holder",
    description: "How we coordinate your transaction",
    tasks: escrowHolderTasks,
    color: "secondary",
  },
  {
    id: "lender",
    icon: Landmark,
    title: "The Lender",
    description: "What your lender does behind the scenes",
    tasks: lenderTasks,
    color: "green-600",
  },
]

export default function LifeOfEscrowPage() {
  return (
    <article className="max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="text-gray-300">/</span>
        <Link href="/learn" className="hover:text-primary">Learn</Link>
        <span className="text-gray-300">/</span>
        <span className="text-primary font-medium">Life of an Escrow</span>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">8 min read</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
          Life of an Escrow
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          Escrow is a three-sided arrangement involving a neutral third party (the escrow holder) 
          who handles the transfer of funds and documents between buyer and seller.
        </p>
      </header>

      {/* Introduction */}
      <div className="prose prose-lg prose-gray max-w-none mb-12">
        <h2 className="text-2xl font-bold text-secondary flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          Why Use Escrow?
        </h2>
        <p>
          Escrow protects both parties in a real estate transaction. The buyer knows their funds 
          won't be released until they receive clear title to the property. The seller knows they'll 
          receive payment once they've transferred ownership.
        </p>
        <p>
          The escrow holder acts as a neutral coordinator, ensuring all conditions are met before 
          the transaction closes. They don't represent either party—their job is to make sure 
          the deal happens fairly and efficiently.
        </p>
      </div>

      {/* Process by Party */}
      <section className="space-y-8 mb-12">
        <h2 className="text-2xl font-bold text-secondary">
          The Process by Party
        </h2>
        <p className="text-gray-600">
          Multiple parties work simultaneously during escrow. Here's what each party handles:
        </p>

        {processParties.map((party) => (
          <div
            key={party.id}
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
          >
            {/* Header */}
            <div className={`p-6 ${
              party.color === 'primary' ? 'bg-primary/5 border-b border-primary/10' :
              party.color === 'accent' ? 'bg-accent/5 border-b border-accent/10' :
              party.color === 'secondary' ? 'bg-secondary/5 border-b border-secondary/10' :
              'bg-green-50 border-b border-green-100'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  party.color === 'primary' ? 'bg-primary/10' :
                  party.color === 'accent' ? 'bg-accent/10' :
                  party.color === 'secondary' ? 'bg-secondary/10' :
                  'bg-green-100'
                }`}>
                  <party.icon className={`w-6 h-6 ${
                    party.color === 'primary' ? 'text-primary' :
                    party.color === 'accent' ? 'text-accent' :
                    party.color === 'secondary' ? 'text-secondary' :
                    'text-green-600'
                  }`} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-secondary">{party.title}</h3>
                  <p className="text-gray-600 text-sm">{party.description}</p>
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="p-6">
              <ul className="space-y-3">
                {party.tasks.map((task, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      party.color === 'primary' ? 'text-primary' :
                      party.color === 'accent' ? 'text-accent' :
                      party.color === 'secondary' ? 'text-secondary' :
                      'text-green-600'
                    }`} />
                    <span className="text-gray-700">{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </section>

      {/* Timeline Summary */}
      <section className="bg-gray-50 rounded-2xl p-8 mb-12">
        <h2 className="text-2xl font-bold text-secondary mb-4">
          Typical Timeline
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">30-45</div>
            <p className="text-gray-600">Days for a typical residential escrow</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">14-21</div>
            <p className="text-gray-600">Days for buyer contingencies</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">2-3</div>
            <p className="text-gray-600">Days for recording and funding</p>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-12">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">
          Tips for a Smooth Escrow
        </h2>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <span className="text-blue-800">
              <strong>Respond promptly</strong> to document requests—delays can push back your closing date.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <span className="text-blue-800">
              <strong>Don't make major purchases</strong> or open new credit accounts during escrow—it can affect your loan.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <span className="text-blue-800">
              <strong>Keep your escrow officer informed</strong> of any changes to your situation or timeline.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <span className="text-blue-800">
              <strong>Wire funds early</strong> on closing day—wire transfers can take hours to process.
            </span>
          </li>
        </ul>
      </section>

      {/* CTA Banner */}
      <div className="bg-gradient-to-br from-primary to-primary/90 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to Open Escrow?</h2>
        <p className="text-white/80 mb-6 max-w-xl mx-auto">
          Our experienced escrow team is here to guide you through every step of the process.
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
            href="/learn/what-is-escrow"
            className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-secondary group-hover:text-primary transition-colors">
                What is Escrow?
              </p>
              <p className="text-sm text-gray-500">Understanding the basics</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
          </Link>
          <Link
            href="/learn/escrow-terms"
            className="group flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <p className="font-medium text-secondary group-hover:text-primary transition-colors">
                Escrow Terms Glossary
              </p>
              <p className="text-sm text-gray-500">100+ escrow terms explained</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </article>
  )
}
