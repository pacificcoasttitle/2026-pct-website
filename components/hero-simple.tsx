'use client'

import { useState } from 'react'
import { Shield, Award, MapPin, ArrowDown } from 'lucide-react'
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
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/beautiful-modern-california-home-exterior-with-blu.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/85 to-white/95" />
        </div>

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(rgba(3,55,79,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(3,55,79,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Decorative Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-secondary/20 px-5 py-2.5 rounded-full shadow-sm">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-secondary">California's Trusted Title Partner Since 2006</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-secondary leading-tight tracking-tight">
              Title & Escrow Services
              <br />
              <span className="text-primary">You Can Count On</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Residential & Commercial Title Insurance and Escrow Services
              <br />
              <span className="text-lg text-gray-500">Expert guidance for every California real estate transaction</span>
            </p>

            {/* TESSA Search Bar */}
            <div className="pt-4 pb-4">
              <TessaSearch onSubmit={handleTessaSubmit} />
            </div>

            {/* Stats Row */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-5 py-3 rounded-xl border border-gray-200/50">
                <Award className="w-6 h-6 text-primary" />
                <div className="text-left">
                  <span className="font-bold text-2xl text-secondary">19+</span>
                  <span className="text-sm text-gray-600 ml-1">Years</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-5 py-3 rounded-xl border border-gray-200/50">
                <MapPin className="w-6 h-6 text-primary" />
                <div className="text-left">
                  <span className="font-bold text-2xl text-secondary">6</span>
                  <span className="text-sm text-gray-600 ml-1">Offices</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-5 py-3 rounded-xl border border-gray-200/50">
                <Shield className="w-6 h-6 text-primary" />
                <div className="text-left">
                  <span className="font-bold text-2xl text-secondary">500K+</span>
                  <span className="text-sm text-gray-600 ml-1">Closings</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <button
            onClick={scrollToTools}
            className="mt-12 inline-flex flex-col items-center text-gray-500 hover:text-primary transition-colors group cursor-pointer"
          >
            <span className="text-sm font-medium mb-2">Calculate Your Rates</span>
            <ArrowDown className="w-5 h-5 animate-bounce" />
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
