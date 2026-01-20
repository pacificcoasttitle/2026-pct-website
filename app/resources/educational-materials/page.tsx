import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { BookOpen, Download, FileText, ChevronRight, Video, FileSpreadsheet } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Educational Materials | Pacific Coast Title",
  description:
    "Educational resources about title insurance and escrow. Download guides, checklists, and infographics to share with your clients.",
}

const materials = [
  {
    title: "Understanding Title Insurance",
    description:
      "Comprehensive guide to title insurance basics, coverage, and benefits for your clients",
    type: "PDF Guide",
    pages: "12 pages",
    icon: BookOpen,
  },
  {
    title: "The Escrow Process Explained",
    description: "Step-by-step walkthrough of the escrow timeline and what to expect",
    type: "PDF Guide",
    pages: "8 pages",
    icon: FileText,
  },
  {
    title: "Top 10 Title Problems",
    description: "Common title issues that can delay or derail a transaction",
    type: "Infographic",
    pages: "2 pages",
    icon: FileSpreadsheet,
  },
  {
    title: "1031 Exchange Basics",
    description:
      "Essential information about like-kind exchanges and tax deferral strategies",
    type: "PDF Guide",
    pages: "10 pages",
    icon: BookOpen,
  },
  {
    title: "Home Buyer Checklist",
    description: "Complete checklist for first-time and experienced home buyers",
    type: "Checklist",
    pages: "4 pages",
    icon: FileText,
  },
  {
    title: "Seller Guide",
    description: "What sellers need to know about title and escrow",
    type: "PDF Guide",
    pages: "6 pages",
    icon: BookOpen,
  },
  {
    title: "California Property Tax Guide",
    description: "Understanding property taxes, supplemental taxes, and Prop 19",
    type: "PDF Guide",
    pages: "8 pages",
    icon: FileSpreadsheet,
  },
  {
    title: "Wire Fraud Prevention",
    description: "Protect your clients from real estate wire fraud scams",
    type: "Infographic",
    pages: "1 page",
    icon: FileText,
  },
]

export default function EducationalMaterialsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Breadcrumb */}
      <div className="pt-24 bg-gray-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/resources" className="hover:text-primary">
              Resources
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-primary font-medium">Educational Materials</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              Educational Materials
            </h1>
            <p className="text-xl text-gray-600">
              Resources to help you educate your clients about title insurance and escrow. Download and share these
              materials to make transactions smoother for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Materials Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {materials.map((material, index) => {
                const Icon = material.icon
                return (
                  <div
                    key={index}
                    className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                          <Icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-secondary mb-2 group-hover:text-primary transition-colors">
                            {material.title}
                          </h3>
                          <p className="text-gray-600 mb-3">{material.description}</p>
                          <div className="flex gap-4 text-sm text-gray-500">
                            <span className="bg-gray-100 px-3 py-1 rounded-full">
                              {material.type}
                            </span>
                            <span className="bg-gray-100 px-3 py-1 rounded-full">
                              {material.pages}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Online Learning */}
            <div className="mt-16 grid md:grid-cols-2 gap-6">
              <Link
                href="/title-services/what-is-title-insurance"
                className="bg-secondary rounded-2xl p-8 text-white hover:bg-secondary/90 transition-colors group"
              >
                <BookOpen className="w-10 h-10 text-accent mb-4" />
                <h3 className="text-xl font-bold mb-2">What is Title Insurance?</h3>
                <p className="text-white/70 mb-4">
                  Learn the fundamentals of title insurance and why it's essential
                </p>
                <span className="text-accent font-medium group-hover:underline">
                  Read More &rarr;
                </span>
              </Link>

              <Link
                href="/title-services/what-is-escrow"
                className="bg-primary rounded-2xl p-8 text-white hover:bg-primary/90 transition-colors group"
              >
                <FileText className="w-10 h-10 text-white/80 mb-4" />
                <h3 className="text-xl font-bold mb-2">What is Escrow?</h3>
                <p className="text-white/80 mb-4">
                  Understand the escrow process and how it protects all parties
                </p>
                <span className="text-white font-medium group-hover:underline">
                  Read More &rarr;
                </span>
              </Link>
            </div>

            {/* CTA */}
            <div className="mt-16 bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl p-10 text-center border border-accent/20">
              <h3 className="text-2xl font-bold text-secondary mb-4">
                Need Custom Materials?
              </h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                We can create customized educational materials for your brokerage or team. Contact us to discuss
                your specific needs.
              </p>
              <Link
                href="/contact"
                className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Request Custom Materials
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
