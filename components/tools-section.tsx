'use client'

import { FileText, FolderOpen, ArrowRight, Calculator } from 'lucide-react'
import Link from 'next/link'
import { RateCalculator } from '@/components/calculator/rate-calculator'

export function ToolsSection() {
  return (
    <section id="tools" className="py-20 bg-[#f8f9fa]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Customer-benefit focused */}
        <div className="text-center mb-12">
          <p className="text-sm text-gray-500 italic mb-2">No Surprises at Closing</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary">
            KNOW YOUR COSTS UPFRONT
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto mt-4" />
        </div>

        {/* Main Calculator Card */}
        <div className="mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-secondary">See What You'll Pay</h3>
                <p className="text-gray-500">Get a clear estimate in 30 seconds—no account required</p>
              </div>
            </div>
            <RateCalculator />
          </div>
        </div>

        {/* Additional Resources - Customer-benefit focused */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Title Flyers */}
          <Link href="/resources/title-flyers" className="block group">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 h-full">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/90 transition-colors shadow-md">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-secondary mb-2 group-hover:text-primary transition-colors">
                    Look Up Any Property
                  </h3>
                  <p className="text-gray-500 leading-relaxed mb-3">
                    Get city-specific transfer tax rates, local requirements, and title information—before you quote your client.
                  </p>
                  <div className="flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
                    Find Property Info
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Blank Forms */}
          <Link href="/resources/forms" className="block group">
            <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6 border border-gray-100 h-full">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/90 transition-colors shadow-md">
                  <FolderOpen className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-secondary mb-2 group-hover:text-primary transition-colors">
                    Grab the Forms You Need
                  </h3>
                  <p className="text-gray-500 leading-relaxed mb-3">
                    Download escrow instructions, disclosures, and documents instantly—keep your transaction moving.
                  </p>
                  <div className="flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
                    Download Now
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
