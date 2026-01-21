"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import Navigation from "@/components/navigation"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ChevronRight, Search, X, BookOpen } from "lucide-react"
import { glossaryTerms } from "@/data/resources"

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeLetter, setActiveLetter] = useState<string | null>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Group terms by first letter
  const groupedTerms = useMemo(() => {
    const groups: Record<string, typeof glossaryTerms> = {}
    
    let filtered = glossaryTerms
    if (searchQuery) {
      filtered = glossaryTerms.filter(term =>
        term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    filtered.forEach(term => {
      const letter = term.term[0].toUpperCase()
      if (!groups[letter]) {
        groups[letter] = []
      }
      groups[letter].push(term)
    })

    return groups
  }, [searchQuery])

  // Available letters (ones that have terms)
  const availableLetters = useMemo(() => {
    return alphabet.filter(letter => groupedTerms[letter]?.length > 0)
  }, [groupedTerms])

  const scrollToLetter = (letter: string) => {
    const element = sectionRefs.current[letter]
    if (element) {
      const yOffset = -120 // Account for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })
      setActiveLetter(letter)
    }
  }

  // Update active letter on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150

      for (const letter of availableLetters) {
        const element = sectionRefs.current[letter]
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveLetter(letter)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [availableLetters])

  const totalTerms = Object.values(groupedTerms).flat().length

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
            <span className="text-primary font-medium">Glossary</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="py-12 bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium mb-4">
              200+ Terms
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4">
              Common Title Terminology
            </h1>
            <p className="text-xl text-gray-600">
              Real estate and title industry terms explained in plain language. Use the search or jump to any letter to find what you need.
            </p>
          </div>

          {/* Search */}
          <div className="mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search terms or definitions..."
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
                Found <span className="font-semibold text-gray-700">{totalTerms}</span> terms matching "{searchQuery}"
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Alphabet Navigation */}
      <div className="sticky top-20 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-1 py-3">
            {alphabet.map(letter => {
              const hasTerms = groupedTerms[letter]?.length > 0
              return (
                <button
                  key={letter}
                  onClick={() => hasTerms && scrollToLetter(letter)}
                  disabled={!hasTerms}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                    activeLetter === letter
                      ? "bg-primary text-white"
                      : hasTerms
                      ? "bg-gray-100 text-gray-700 hover:bg-primary/10 hover:text-primary"
                      : "bg-gray-50 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {letter}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Terms */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Disclaimer */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> These descriptions are general and are not intended to be complete legal definitions. 
                We suggest you consult a real estate professional or an attorney for additional details.
              </p>
            </div>

            {availableLetters.length > 0 ? (
              <div className="space-y-12">
                {availableLetters.map(letter => (
                  <div
                    key={letter}
                    ref={el => { sectionRefs.current[letter] = el }}
                    className="scroll-mt-40"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <span className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center text-2xl font-bold">
                        {letter}
                      </span>
                      <div className="h-px bg-gray-200 flex-1" />
                    </div>
                    <div className="space-y-4">
                      {groupedTerms[letter].map((item, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100/70 transition-colors"
                        >
                          <h3 className="text-lg font-semibold text-secondary mb-2">{item.term}</h3>
                          <p className="text-gray-600 leading-relaxed">{item.definition}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No terms found</h3>
                <p className="text-gray-500">Try adjusting your search term</p>
              </div>
            )}

            {/* CTA */}
            <div className="mt-16 bg-gradient-to-br from-secondary to-secondary/90 rounded-2xl p-10 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Still Have Questions?</h3>
              <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                Our team is here to help explain any title or escrow concepts you need clarified.
              </p>
              <Link
                href="/contact"
                className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
