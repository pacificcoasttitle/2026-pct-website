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
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/beautiful-modern-california-home-exterior-with-blu.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Softer Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.97] via-white/[0.92] to-white/[0.97]" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            {/* Trust Badge - Subtle */}
            <div className="inline-flex items-center gap-2 text-gray-500">
              <Shield className="w-4 h-4 text-secondary/60" />
              <span className="text-sm font-medium tracking-wide">Serving California Since 2006</span>
            </div>

            {/* Headline - Softer, welcoming */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-secondary leading-tight tracking-tight">
              Title & Escrow Services
              <br />
              <span className="text-secondary/70">You Can Rely On</span>
            </h1>

            {/* Subheadline - Calm and professional */}
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Residential and commercial title insurance with transparent pricing
              and expert guidance for every transaction.
            </p>

            {/* TESSA Search Bar */}
            <div className="pt-6 pb-2">
              <TessaSearch onSubmit={handleTessaSubmit} />
            </div>

            {/* Stats Row - Understated */}
            <div className="pt-10 flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-gray-500">
              <div className="text-center">
                <span className="block text-2xl font-medium text-secondary">19+</span>
                <span className="text-sm">Years of Service</span>
              </div>
              <div className="hidden sm:block w-px h-10 bg-gray-200" />
              <div className="text-center">
                <span className="block text-2xl font-medium text-secondary">6</span>
                <span className="text-sm">California Offices</span>
              </div>
              <div className="hidden sm:block w-px h-10 bg-gray-200" />
              <div className="text-center">
                <span className="block text-2xl font-medium text-secondary">500K+</span>
                <span className="text-sm">Closings Completed</span>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <button
            onClick={scrollToTools}
            className="mt-14 inline-flex flex-col items-center text-gray-400 hover:text-secondary/70 transition-colors group cursor-pointer"
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
