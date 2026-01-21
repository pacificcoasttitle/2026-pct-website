import Link from "next/link"
import { Shield, BookOpen, Search, AlertTriangle, FileCheck, Clock, List, ScrollText, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Learning Center | Pacific Coast Title",
  description: "Educational resources about title insurance, escrow, and the real estate closing process. Learn from California's trusted title experts.",
}

const articles = [
  {
    category: "Title Insurance",
    items: [
      {
        href: "/learn/what-is-title-insurance",
        title: "What is Title Insurance?",
        description: "Understand how title insurance protects your property investment from historical defects and hidden risks.",
        icon: Shield,
        readTime: "5 min read",
      },
      {
        href: "/learn/benefits-of-title-insurance",
        title: "Benefits of Title Insurance",
        description: "Discover why title insurance is the best investment you can make to protect your home.",
        icon: BookOpen,
        readTime: "4 min read",
      },
      {
        href: "/learn/life-of-title-search",
        title: "Life of a Title Search",
        description: "Follow the 12-step journey from order to policy delivery and understand what happens behind the scenes.",
        icon: Search,
        readTime: "6 min read",
      },
      {
        href: "/learn/top-10-title-problems",
        title: "Top 10 Title Problems",
        description: "Learn about the most common title issues we encounter and how title insurance protects you.",
        icon: AlertTriangle,
        readTime: "5 min read",
      },
      {
        href: "/learn/common-title-terms",
        title: "Common Title Terms",
        description: "200+ real estate and title industry terms explained in plain language.",
        icon: ScrollText,
        readTime: "Reference",
      },
    ],
  },
  {
    category: "Escrow",
    items: [
      {
        href: "/learn/what-is-escrow",
        title: "What is Escrow?",
        description: "Learn how escrow protects all parties in a real estate transaction as a neutral third party.",
        icon: FileCheck,
        readTime: "5 min read",
      },
      {
        href: "/learn/life-of-escrow",
        title: "Life of an Escrow",
        description: "A step-by-step guide through the escrow process from opening to closing.",
        icon: Clock,
        readTime: "7 min read",
      },
      {
        href: "/learn/escrow-terms",
        title: "Escrow Terms Glossary",
        description: "100+ escrow terms explained to help you get comfortable with the lingo.",
        icon: List,
        readTime: "Reference",
      },
    ],
  },
]

export default function LearnPage() {
  return (
    <div className="max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span className="text-gray-300">/</span>
        <span className="text-primary font-medium">Learn</span>
      </nav>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
          Learning Center
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          Your guide to understanding title insurance, escrow, and the real estate closing process. 
          We believe informed clients make confident decisions.
        </p>
      </div>

      {/* Articles Grid */}
      <div className="space-y-12">
        {articles.map((section) => (
          <div key={section.category}>
            <h2 className="text-2xl font-bold text-secondary mb-6 flex items-center gap-3">
              <span className="w-1 h-8 bg-primary rounded-full" />
              {section.category}
            </h2>
            <div className="grid gap-4">
              {section.items.map((article) => (
                <Link
                  key={article.href}
                  href={article.href}
                  className="group bg-white border border-gray-100 rounded-xl p-6 hover:border-primary/30 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                      <article.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-secondary group-hover:text-primary transition-colors mb-1">
                            {article.title}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {article.description}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                      </div>
                      <span className="inline-block mt-3 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        {article.readTime}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA Banner */}
      <div className="mt-16 bg-gradient-to-br from-secondary to-secondary/90 rounded-2xl p-8 md:p-10 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Have a Specific Question?</h2>
        <p className="text-white/80 mb-6 max-w-xl mx-auto">
          Our AI assistant TESSA can answer your title and escrow questions instantly, 24/7.
        </p>
        <button
          onClick={() => {
            const tessaButton = document.querySelector("[data-tessa-trigger]") as HTMLButtonElement
            if (tessaButton) tessaButton.click()
          }}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
        >
          Ask TESSA
        </button>
      </div>
    </div>
  )
}
