'use client'

import { FileText, FolderOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { RateCalculator } from '@/components/calculator/rate-calculator'

export function ToolsSection() {
  return (
    <section id="tools" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-3">
            Essential Tools for Your Transaction
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to estimate costs, access forms, and review title information
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Rate Calculator - Takes prominent position */}
          <Card className="lg:col-span-2 p-6 bg-white border-2 border-primary/20 hover:border-primary/40 transition-colors shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-primary"
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
                <h3 className="text-xl font-bold text-secondary">Rate Calculator</h3>
                <p className="text-sm text-gray-500">Estimate title, escrow & transfer tax fees</p>
              </div>
            </div>
            <RateCalculator />
          </Card>

          {/* Side Tools Stack */}
          <div className="space-y-6">
            {/* Title Flyers */}
            <Link href="/resources/title-flyers" className="block group">
              <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-secondary/40">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-secondary group-hover:scale-110 transition-all">
                    <FileText className="w-7 h-7 text-secondary group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-secondary mb-1 group-hover:text-primary transition-colors">
                      Title Flyers
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      Property-specific title information sheets with tax rates, fees, and local requirements
                    </p>
                    <div className="flex items-center text-primary font-semibold text-sm group-hover:gap-2 transition-all">
                      Browse Flyers
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>

            {/* Blank Forms */}
            <Link href="/resources/forms" className="block group">
              <Card className="p-6 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-secondary/40">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-accent group-hover:scale-110 transition-all">
                    <FolderOpen className="w-7 h-7 text-accent group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-secondary mb-1 group-hover:text-primary transition-colors">
                      Blank Forms
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      Download escrow instructions, disclosure forms, and other essential documents
                    </p>
                    <div className="flex items-center text-primary font-semibold text-sm group-hover:gap-2 transition-all">
                      Download Forms
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>

            {/* Quick Stats */}
            <div className="bg-secondary rounded-xl p-5 text-white">
              <p className="text-sm text-white/70 mb-1">Trusted by professionals</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">500K+</span>
                <span className="text-white/80 text-sm">successful closings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
