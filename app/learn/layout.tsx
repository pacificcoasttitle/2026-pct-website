import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ChevronRight, BookOpen, Shield, Search, FileText, AlertTriangle, FileCheck, Clock, List, ScrollText } from "lucide-react"

const sidebarLinks = [
  {
    title: "Title Insurance",
    items: [
      { href: "/learn/what-is-title-insurance", label: "What is Title Insurance", icon: Shield },
      { href: "/learn/benefits-of-title-insurance", label: "Benefits of Title Insurance", icon: BookOpen },
      { href: "/learn/life-of-title-search", label: "Life of a Title Search", icon: Search },
      { href: "/learn/top-10-title-problems", label: "Top 10 Title Problems", icon: AlertTriangle },
      { href: "/learn/common-title-terms", label: "Common Title Terms", icon: ScrollText },
    ],
  },
  {
    title: "Escrow",
    items: [
      { href: "/learn/what-is-escrow", label: "What is Escrow", icon: FileCheck },
      { href: "/learn/life-of-escrow", label: "Life of an Escrow", icon: Clock },
      { href: "/learn/escrow-terms", label: "Escrow Terms", icon: List },
    ],
  },
]

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      
      <div className="pt-24">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-72 flex-shrink-0">
              <div className="lg:sticky lg:top-28">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-bold text-secondary">Learning Center</h2>
                      <p className="text-xs text-gray-500">Educational Resources</p>
                    </div>
                  </div>
                  
                  <nav className="space-y-6">
                    {sidebarLinks.map((section) => (
                      <div key={section.title}>
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                          {section.title}
                        </h3>
                        <ul className="space-y-1">
                          {section.items.map((item) => (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:text-primary hover:bg-white transition-colors text-sm"
                              >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </nav>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {children}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
