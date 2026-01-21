import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Suspense } from "react"
import Loading from "./loading"
import {
  Calculator,
  FileText,
  Wrench,
  DollarSign,
  GraduationCap,
  Calendar,
  Search,
  ExternalLink,
  BookOpen,
} from "lucide-react"

export const metadata = {
  title: "Agent Resource Center | Pacific Coast Title",
  description:
    "Access calculators, forms, tools, and educational resources to help you close deals faster. Everything real estate professionals need in one place.",
}

const pinnedTools = [
  {
    icon: Calculator,
    title: "Rate Calculator",
    description: "Get instant title & escrow quotes",
    href: "https://www.pct.com/calculators/rate-calculator",
    external: true,
  },
  {
    icon: Calculator,
    title: "Prop 19 Calculator",
    description: "Calculate property tax savings",
    href: "https://www.pct.com/calculators/prop-19-calculator",
    external: true,
  },
  {
    icon: FileText,
    title: "Blank Forms",
    description: "Downloadable transaction forms",
    href: "/agent-resources/blank-forms",
    external: false,
  },
  {
    icon: Wrench,
    title: "PCT Toolbox",
    description: "Comprehensive agent toolkit",
    href: "https://www.pct.com/pct-title-toolbox",
    external: true,
  },
  {
    icon: BookOpen,
    title: "Rate Book",
    description: "Complete rate information",
    href: "https://www.pct.com/rate-book",
    external: true,
  },
]

const categories = [
  {
    icon: Calculator,
    title: "Calculators",
    description: "Estimate costs and savings instantly",
    items: [
      { title: "Rate Calculator", href: "https://www.pct.com/calculators/rate-calculator", external: true },
      { title: "Prop 19 Calculator", href: "https://www.pct.com/calculators/prop-19-calculator", external: true },
      { title: "Lender Rate Portal", href: "https://www.pct.com/lender-portal", external: true },
    ],
  },
  {
    icon: FileText,
    title: "Forms & Documents",
    description: "Downloadable forms and client materials",
    items: [
      { title: "Blank Forms", href: "/agent-resources/blank-forms", external: false },
      { title: "Educational Booklets", href: "/agent-resources/educational-materials", external: false },
      { title: "Informational Flyers", href: "/agent-resources/educational-materials", external: false },
    ],
  },
  {
    icon: Wrench,
    title: "Digital Tools",
    description: "Online tools and portals",
    items: [
      { title: "PCT Title Toolbox", href: "https://www.pct.com/pct-title-toolbox", external: true },
      { title: "TitlePro 247", href: "https://www.titlepro247.com", external: true },
      { title: "Pacific Coast Agent Portal", href: "https://portal.pct.com", external: true },
      { title: "Instant Profile", href: "https://www.pct.com/instant-profile", external: true },
    ],
  },
  {
    icon: DollarSign,
    title: "Fees & Taxes Reference",
    description: "Recording fees, transfer taxes, and more",
    items: [
      { title: "Recording Fees by County", href: "https://www.pct.com/recording-fees", external: true },
      { title: "City Transfer Tax", href: "https://www.pct.com/city-transfer-tax", external: true },
      { title: "Supplemental Taxes Info", href: "https://www.pct.com/supplemental-taxes", external: true },
      { title: "Rate Book", href: "https://www.pct.com/rate-book", external: true },
    ],
  },
  {
    icon: GraduationCap,
    title: "Education & Training",
    description: "Learn about title and escrow",
    items: [
      { title: "Training Videos", href: "https://www.pct.com/videos", external: true },
      { title: "What is Title Insurance", href: "/title-services/what-is-title-insurance", external: false },
      { title: "What is Escrow", href: "/title-services/what-is-escrow", external: false },
      { title: "Life of a Title Search", href: "/title-services/life-of-title-search", external: false },
      { title: "Common Title Terms", href: "https://www.pct.com/glossary", external: true },
    ],
  },
  {
    icon: Calendar,
    title: "Important Calendars",
    description: "Key dates and holidays",
    items: [
      { title: "2026 Recorders Holiday Calendar", href: "https://www.pct.com/recorders-calendar", external: true },
      { title: "2026 Rescission Calendar", href: "https://www.pct.com/rescission-calendar", external: true },
    ],
  },
]

export default function AgentResourcesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">Agent Resource Center</h1>
            <p className="text-xl text-gray-600 mb-8">
              Everything you need to close deals faster. Access calculators, forms, tools, and educational
              resources all in one place.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pinned Tools */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Most Used Tools</h2>
          <Suspense fallback={<Loading />}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {pinnedTools.map((tool, index) => {
                const Icon = tool.icon
                const content = (
                  <div key={index} className="group bg-gray-50 hover:bg-primary/5 border border-gray-100 hover:border-primary/20 rounded-xl p-5 transition-all">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6 text-primary group-hover:text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{tool.title}</h3>
                    <p className="text-sm text-gray-500">{tool.description}</p>
                    {tool.external && <ExternalLink className="w-4 h-4 text-gray-400 mt-2" />}
                  </div>
                )

                return tool.external ? (
                  <a key={tool.title} href={tool.href} target="_blank" rel="noopener noreferrer">
                    {content}
                  </a>
                ) : (
                  <Link key={tool.title} href={tool.href}>
                    {content}
                  </Link>
                )
              })}
            </div>
          </Suspense>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <div key={category.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{category.title}</h3>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {category.items.map((item) => {
                      const linkContent = (
                        <span className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group">
                          <span className="text-gray-700 group-hover:text-primary">{item.title}</span>
                          {item.external ? (
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          ) : (
                            <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                              &rarr;
                            </span>
                          )}
                        </span>
                      )

                      return item.external ? (
                        <li key={item.title}>
                          <a href={item.href} target="_blank" rel="noopener noreferrer">
                            {linkContent}
                          </a>
                        </li>
                      ) : (
                        <li key={item.title}>
                          <Link href={item.href}>{linkContent}</Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Need Help Finding Something?</h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Our team is here to assist you. Contact us or ask TESSA, our AI assistant, for instant help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </Link>
            <button className="bg-accent text-white px-8 py-4 rounded-lg font-semibold hover:bg-accent/90 transition-colors">
              Ask TESSA
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
