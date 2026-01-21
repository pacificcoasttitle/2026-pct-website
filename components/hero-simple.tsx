'use client'

import { useState } from 'react'
import { Shield, ArrowDown } from 'lucide-react'
import { TessaSearch } from './tessa-search'
import { TessaModal } from './tessa-modal'

export function HeroSimple() {
  const [isTessaOpen, setIsTessaOpen] = useState(false)
  const [tessaQuery, setTessaQuery] = useState('')
  const [tessaMode, setTessaMode] = useState<'question' | 'analyze'>('question')
  const [tessaFile, setTessaFile] = useState<File | undefined>()

  const handleTessaSubmit = (query: string, mode: 'question' | 'analyze', file?: File) => {
    setTessaQuery(query)
    setTessaMode(mode)
    setTessaFile(file)
    setIsTessaOpen(true)
  }

  const scrollToTools = () => {
    document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Warm Gradient Background */}
        <div className="absolute inset-0">
          {/* Base warm gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#faf9f7] via-[#f8f6f3] to-[#f5f2ee]" />
          
          {/* Subtle texture overlay */}
          <div 
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(0, 61, 121, 0.03) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, rgba(180, 160, 140, 0.04) 0%, transparent 50%)`,
            }}
          />
          
          {/* Soft light accent */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-amber-50/30 via-transparent to-transparent -translate-y-1/4 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-blue-50/20 via-transparent to-transparent translate-y-1/4 -translate-x-1/4" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2.5 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100/80 shadow-sm">
              <Shield className="w-4 h-4 text-secondary/70" />
              <span className="text-sm font-medium text-gray-600 tracking-wide">Serving California Since 1980</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-secondary leading-tight tracking-tight">
              Title & Escrow Services
              <br />
              <span className="text-secondary/60">You Can Trust</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Residential and commercial title insurance with transparent pricing
              and expert guidance for every transaction.
            </p>

            {/* TESSA Search Bar */}
            <div className="pt-6 pb-2">
              <TessaSearch onSubmit={handleTessaSubmit} />
            </div>

            {/* Stats Bar - Refined */}
            <div className="pt-12">
              <div className="inline-flex items-center gap-3 sm:gap-6 bg-white/70 backdrop-blur-sm px-6 sm:px-8 py-4 rounded-2xl border border-gray-100/80 shadow-sm">
                <div className="text-center px-2 sm:px-4">
                  <span className="block text-xl sm:text-2xl font-semibold text-secondary">45+</span>
                  <span className="text-xs sm:text-sm text-gray-500">Years</span>
                </div>
                <div className="w-px h-10 bg-gray-200/80" />
                <div className="text-center px-2 sm:px-4">
                  <span className="block text-xl sm:text-2xl font-semibold text-secondary">100,000+</span>
                  <span className="text-xs sm:text-sm text-gray-500">Transactions</span>
                </div>
                <div className="w-px h-10 bg-gray-200/80" />
                <div className="text-center px-2 sm:px-4">
                  <span className="block text-xl sm:text-2xl font-semibold text-secondary">12</span>
                  <span className="text-xs sm:text-sm text-gray-500">Counties</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <button
            onClick={scrollToTools}
            className="mt-14 inline-flex flex-col items-center text-gray-400 hover:text-secondary/60 transition-colors group cursor-pointer"
          >
            <span className="text-sm mb-2">Calculate Your Rates</span>
            <ArrowDown className="w-4 h-4 animate-bounce" />
          </button>
        </div>
      </section>

      {/* TESSA Modal */}
      <TessaModal
        isOpen={isTessaOpen}
        onClose={() => setIsTessaOpen(false)}
        initialQuery={tessaQuery}
        initialMode={tessaMode}
        initialFile={tessaFile}
      />
    </>
  )
}
