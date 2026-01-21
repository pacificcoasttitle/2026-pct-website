"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { FileText, Download, ChevronRight, ChevronDown, Search, X } from "lucide-react"
import { formCategories } from "@/data/resources"

export default function FormsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<string[]>(
    formCategories.map(c => c.id) // All expanded by default
  )

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  // Filter forms based on search
  const filteredCategories = formCategories.map(category => ({
    ...category,
    forms: category.forms.filter(form =>
      form.name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.forms.length > 0)

  const totalForms = filteredCategories.reduce((acc, cat) => acc + cat.forms.length, 0)

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
            <span className="text-primary font-medium">Blank Forms</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="py-12 bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium mb-4">
              Forms Library
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              Blank Documents
            </h1>
            <p className="text-xl text-gray-600">
              Download the forms you need. All documents are available in PDF format for immediate use.
            </p>
          </div>

          {/* Search */}
          <div className="mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search forms..."
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
            {searchQuery && (
              <p className="mt-2 text-sm text-gray-500">
                Found <span className="font-semibold text-gray-700">{totalForms}</span> forms matching "{searchQuery}"
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Forms Categories */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-left">
                      <h2 className="text-xl font-bold text-secondary">{category.name}</h2>
                      <p className="text-sm text-gray-500">{category.forms.length} forms</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-6 h-6 text-gray-400 transition-transform ${
                      expandedCategories.includes(category.id) ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Forms List */}
                {expandedCategories.includes(category.id) && (
                  <div className="border-t border-gray-100 p-4">
                    <ul className="space-y-2">
                      {category.forms.map((form, index) => (
                        <li key={index}>
                          <a
                            href={`https://pct.com/assets/downloads/forms/${form.file}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 hover:bg-primary/5 transition-colors group"
                          >
                            <span className="text-gray-700 group-hover:text-primary transition-colors">
                              {form.name}
                            </span>
                            <span className="flex items-center gap-2 text-gray-400 group-hover:text-primary transition-colors">
                              <Download className="w-4 h-4" />
                              <span className="text-sm font-medium bg-gray-200 group-hover:bg-primary/10 px-2 py-0.5 rounded">PDF</span>
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}

            {filteredCategories.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No forms found</h3>
                <p className="text-gray-500">Try adjusting your search term</p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="mt-16 max-w-4xl mx-auto bg-gradient-to-br from-secondary to-secondary/90 rounded-2xl p-10 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Need a Specific Form?</h3>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Can't find the form you're looking for? Contact our team and we'll help you get the documents you need.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
