"use client"

import { useState, useMemo } from "react"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import {
  Calculator,
  FileText,
  Wrench,
  DollarSign,
  GraduationCap,
  Calendar,
  Search,
  ExternalLink,
  Download,
  Sparkles,
  ArrowRight,
  Filter,
  X,
} from "lucide-react"
import { pinnedTools, resourceCategories } from "@/data/resources"

const categoryIcons: Record<string, typeof Calculator> = {
  calculators: Calculator,
  forms: FileText,
  tools: Wrench,
  fees: DollarSign,
  education: GraduationCap,
  calendars: Calendar,
}

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  // Filter resources based on search query and category filter
  const filteredCategories = useMemo(() => {
    return resourceCategories
      .filter((category) => !activeFilter || category.id === activeFilter)
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            !searchQuery ||
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((category) => category.items.length > 0)
  }, [searchQuery, activeFilter])

  // Count total results
  const totalResults = filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0)

  return (
    <main className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-secondary via-secondary/95 to-secondary overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-accent" />
              For Real Estate Professionals
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Agent Resource Center
            </h1>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Everything you need to close deals faster. Access calculators, forms, tools, and 
              educational resources — all in one place.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for calculators, forms, tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-14 py-5 rounded-2xl border-0 bg-white shadow-xl focus:ring-4 focus:ring-primary/20 outline-none transition-all text-lg text-gray-900 placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-5 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              )}
            </div>

            {/* Quick Filter Pills */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <button
                onClick={() => setActiveFilter(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !activeFilter
                    ? "bg-white text-secondary shadow-md"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                All Resources
              </button>
              {resourceCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveFilter(activeFilter === category.id ? null : category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeFilter === category.id
                      ? "bg-white text-secondary shadow-md"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                >
                  {category.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pinned Tools - Most Used */}
      {!searchQuery && !activeFilter && (
        <section className="py-12 bg-gray-50 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Quick Access Tools</h2>
                <p className="text-gray-500 mt-1">Most frequently used by agents</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {pinnedTools.map((tool, index) => {
                const Icon = tool.icon || Calculator
                return (
                  <a
                    key={tool.title}
                    href={tool.href}
                    target={tool.isExternal ? "_blank" : undefined}
                    rel={tool.isExternal ? "noopener noreferrer" : undefined}
                    className="group relative bg-white border border-gray-100 hover:border-primary/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4 group-hover:from-primary group-hover:to-primary transition-all duration-300">
                      <Icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-gray-500">{tool.description}</p>
                    {tool.isExternal && (
                      <ExternalLink className="absolute top-4 right-4 w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                    )}
                  </a>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Search Results Count */}
      {(searchQuery || activeFilter) && (
        <div className="bg-gray-50 border-b border-gray-100 py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{totalResults}</span> results
                {searchQuery && (
                  <span>
                    {" "}for "<span className="font-semibold text-primary">{searchQuery}</span>"
                  </span>
                )}
                {activeFilter && (
                  <span>
                    {" "}in{" "}
                    <span className="font-semibold text-primary">
                      {resourceCategories.find((c) => c.id === activeFilter)?.title}
                    </span>
                  </span>
                )}
              </p>
              {(searchQuery || activeFilter) && (
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setActiveFilter(null)
                  }}
                  className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> Clear filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resource Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchQuery("")
                  setActiveFilter(null)
                }}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCategories.map((category) => {
                const Icon = categoryIcons[category.id] || FileText
                return (
                  <div
                    key={category.id}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Category Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{category.title}</h3>
                          <p className="text-sm text-gray-500 mt-0.5">{category.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Category Items */}
                    <div className="p-4">
                      <ul className="space-y-1">
                        {category.items.map((item) => {
                          const linkContent = (
                            <span className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors group">
                              <span className="flex-1">
                                <span className="block text-gray-800 font-medium group-hover:text-primary transition-colors">
                                  {item.title}
                                </span>
                                <span className="block text-sm text-gray-500 mt-0.5">
                                  {item.description}
                                </span>
                              </span>
                              <span className="flex items-center gap-2 ml-4">
                                {item.downloadable && (
                                  <Download className="w-4 h-4 text-gray-400" />
                                )}
                                {item.isExternal ? (
                                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                                ) : (
                                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                )}
                              </span>
                            </span>
                          )

                          return item.isExternal ? (
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
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Portal Links Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Partner Portals</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Direct access to our suite of professional tools and platforms
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <a
              href="https://www.pct247.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-2xl p-8 text-center border border-gray-100 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">247</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">TitlePro 247</h3>
              <p className="text-gray-500 text-sm mb-4">24/7 online title ordering system</p>
              <span className="text-primary font-medium text-sm flex items-center justify-center gap-1">
                Open Portal <ExternalLink className="w-4 h-4" />
              </span>
            </a>

            <a
              href="https://www.pacificcoastagent.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-2xl p-8 text-center border border-gray-100 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">PCA</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pacific Coast Agent</h3>
              <p className="text-gray-500 text-sm mb-4">Agent-exclusive portal</p>
              <span className="text-primary font-medium text-sm flex items-center justify-center gap-1">
                Open Portal <ExternalLink className="w-4 h-4" />
              </span>
            </a>

            <a
              href="https://www.pcttitletoolbox.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-2xl p-8 text-center border border-gray-100 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">PCT Toolbox</h3>
              <p className="text-gray-500 text-sm mb-4">Comprehensive resource hub</p>
              <span className="text-primary font-medium text-sm flex items-center justify-center gap-1">
                Open Portal <ExternalLink className="w-4 h-4" />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary to-primary/90 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Assistance
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Our team is here to assist you. Contact us directly or ask TESSA, our AI assistant, for instant help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-primary px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Contact Us
            </Link>
            <button
              onClick={() => {
                const tessaButton = document.querySelector("[data-tessa-trigger]") as HTMLButtonElement
                if (tessaButton) tessaButton.click()
              }}
              className="bg-accent hover:bg-accent/90 text-white px-8 py-4 rounded-xl font-semibold transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Ask TESSA
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
