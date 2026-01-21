'use client'

import { Shield, Clock, Award } from 'lucide-react'

export function HeroSimple() {
  return (
    <section className="relative bg-white pt-24 pb-12 overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(3,55,79,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(3,55,79,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-secondary/5 border border-secondary/10 px-4 py-2 rounded-full mb-6">
            <Shield className="w-4 h-4 text-secondary" />
            <span className="text-sm font-semibold text-secondary">California's Trusted Title Partner Since 2006</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary leading-tight tracking-tight mb-6">
            Title & Escrow Services
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Residential and commercial title insurance with transparent pricing. 
            Use our calculator below to estimate your closing costs instantly.
          </p>

          {/* Quick Stats Row */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-gray-600">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">
                <strong className="text-secondary">19+</strong> Years Experience
              </span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-300" />
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">
                <strong className="text-secondary">6</strong> California Offices
              </span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-300" />
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">
                <strong className="text-secondary">500K+</strong> Closings
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
