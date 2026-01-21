'use client'

import { FileText, FolderOpen, ArrowRight, Calculator } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { RateCalculator } from '@/components/calculator/rate-calculator'

export function ToolsSection() {
  return (
    <section id="tools" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Calculator className="w-4 h-4" />
            <span className="text-sm font-semibold">Instant Estimates</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary mb-4">
            Essential Tools for Your Transaction
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to estimate costs, access forms, and review title information
          </p>
        </div>

        {/* Main Calculator Card */}
        <div className="mb-12">
          <Card className="p-8 sm:p-10 bg-white border-2 border-primary/20 shadow-xl rounded-2xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-7 h-7 text-white"
                >
                  <rect x="4" y="2" width="16" height="20" rx="2" />
                  <line x1="8" y1="6" x2="16" y2="6" />
                  <line x1="16" y1="14" x2="16" y2="18" />
                  <path d="M16 10h.01" />
                  <path d="M12 10h.01" />
                  <path d="M8 10h.01" />
                  <path d="M12 14h.01" />
                  <path d="M8 14h.01" />
                  <path d="M12 18h.01" />
                  <path d="M8 18h.01" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-secondary">Rate Calculator</h3>
                <p className="text-gray-500">Estimate title insurance, escrow fees & transfer taxes</p>
              </div>
            </div>
            <RateCalculator />
          </Card>
        </div>

        {/* Additional Resources */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Title Flyers */}
          <Link href="/resources/title-flyers" className="block group">
            <Card className="p-8 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-gray-100 hover:border-secondary/30 rounded-2xl h-full">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-secondary group-hover:scale-110 transition-all">
                  <FileText className="w-8 h-8 text-secondary group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-secondary mb-2 group-hover:text-primary transition-colors">
                    Title Flyers
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Property-specific title information sheets with tax rates, fees, and local requirements for every California city.
                  </p>
                  <div className="flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
                    Browse Flyers
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          {/* Blank Forms */}
          <Link href="/resources/forms" className="block group">
            <Card className="p-8 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-gray-100 hover:border-accent/30 rounded-2xl h-full">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-accent group-hover:scale-110 transition-all">
                  <FolderOpen className="w-8 h-8 text-accent group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-secondary mb-2 group-hover:text-primary transition-colors">
                    Blank Forms
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Download escrow instructions, disclosure forms, and other essential documents for your transactions.
                  </p>
                  <div className="flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
                    Download Forms
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </section>
  )
}
