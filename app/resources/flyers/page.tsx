"use client"

import { useState, useMemo } from "react"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { FileText, Download, ChevronRight, Search, X } from "lucide-react"
import { flyers } from "@/data/resources"

type FilterType = "all" | "title" | "escrow" | "propertyTax"

export default function FlyersPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const allFlyers = useMemo(() => {
    const combined = [
      ...flyers.title.map(f => ({ ...f, category: "title" as const })),
      ...flyers.escrow.map(f => ({ ...f, category: "escrow" as const })),
      ...flyers.propertyTax.map(f => ({ ...f, category: "propertyTax" as const })),
    ]
    return combined.sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  const filteredFlyers = useMemo(() => {
    return allFlyers
      .filter(flyer => activeFilter === "all" || flyer.category === activeFilter)
      .filter(flyer => 
        !searchQuery || flyer.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  }, [allFlyers, activeFilter, searchQuery])

  const filterCounts = {
    all: allFlyers.length,
    title: flyers.title.length,
    escrow: flyers.escrow.length,
    propertyTax: flyers.propertyTax.length,
  }

  const categoryLabels: Record<string, string> = {
    title: "Title",
    escrow: "Escrow",
    propertyTax: "Property Tax",
  }

  const categoryColors: Record<string, string> = {
    title: "bg-blue-100 text-blue-700",
    escrow: "bg-green-100 text-green-700",
    propertyTax: "bg-amber-100 text-amber-700",
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Breadcrumb */}
      <div className="pt-24 bg-gray-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/resources" className="hover:text-primary">Resources</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-primary font-medium">Flyers</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="py-12 bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium mb-4">
              95+ Flyers
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              Informational Flyers
            </h1>
            <p className="text-xl text-gray-600">
              Information at your fingertips. Printable one-page guides covering title, escrow, and property tax topics.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="mt-8 space-y-4">
            {/* Search */}
            <div className="max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search flyers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-gray-900"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {(["all", "title", "escrow", "propertyTax"] as FilterType[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeFilter === filter
                      ? "bg-primary text-white shadow-md"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                  }`}
                >
                  {filter === "all" ? "All" : filter === "propertyTax" ? "Property Tax" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  <span className="ml-2 text-xs opacity-75">({filterCounts[filter]})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Flyers Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Results Count */}
          <div className="mb-6 text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredFlyers.length}</span> flyers
            {searchQuery && <span> for "{searchQuery}"</span>}
          </div>

          {filteredFlyers.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFlyers.map((flyer, index) => (
                <a
                  key={index}
                  href={`https://pct.com/assets/downloads/flyers/${flyer.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white border border-gray-100 rounded-xl p-4 hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                      <FileText className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-2">
                        {flyer.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[flyer.category]}`}>
                          {categoryLabels[flyer.category]}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-primary">
                          <Download className="w-3 h-3" />
                          PDF
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No flyers found</h3>
              <p className="text-gray-500">Try adjusting your search or filter</p>
            </div>
          )}

          {/* CTA */}
          <div className="mt-16 bg-gradient-to-br from-secondary to-secondary/90 rounded-2xl p-10 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Looking for More Detailed Guides?</h3>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Our educational booklets provide comprehensive coverage of title and escrow topics.
            </p>
            <Link
              href="/resources/booklets"
              className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Browse Booklets
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
