'use client'

import { FileText, FolderOpen, ArrowRight, Calculator } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { RateCalculator } from '@/components/calculator/rate-calculator'

export function ToolsSection() {
  return (
    <section id="tools" className="py-20 bg-[#f8f9fa]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            Resources
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-secondary mb-3">
            Tools for Your Transaction
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Estimate costs, access forms, and find the information you need
          </p>
        </div>

        {/* Main Calculator Card */}
        <div className="mb-10">
          <Card className="p-6 sm:p-8 bg-white border border-gray-100 shadow-sm rounded-2xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-secondary/5 rounded-xl flex items-center justify-center">
                <Calculator className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary">Rate Calculator</h3>
                <p className="text-sm text-gray-500">Estimate title, escrow & transfer tax fees</p>
              </div>
            </div>
            <RateCalculator />
          </Card>
        </div>

        {/* Additional Resources */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Title Flyers */}
          <Link href="/resources/title-flyers" className="block group">
            <Card className="p-6 bg-white hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-gray-200 rounded-xl h-full">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-secondary/5 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/10 transition-colors">
                  <FileText className="w-6 h-6 text-secondary/70" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-secondary mb-1 group-hover:text-secondary/80 transition-colors">
                    Title Flyers
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">
                    Property-specific title information with tax rates and local requirements.
                  </p>
                  <div className="flex items-center text-secondary/70 text-sm font-medium group-hover:text-secondary transition-colors">
                    Browse Flyers
                    <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>

          {/* Blank Forms */}
          <Link href="/resources/forms" className="block group">
            <Card className="p-6 bg-white hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-gray-200 rounded-xl h-full">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-secondary/5 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/10 transition-colors">
                  <FolderOpen className="w-6 h-6 text-secondary/70" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-secondary mb-1 group-hover:text-secondary/80 transition-colors">
                    Blank Forms
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">
                    Download escrow instructions, disclosures, and essential documents.
                  </p>
                  <div className="flex items-center text-secondary/70 text-sm font-medium group-hover:text-secondary transition-colors">
                    Download Forms
                    <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
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
