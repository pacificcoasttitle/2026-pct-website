'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { TessaModal } from './tessa-modal'

export function HeroSimple() {
  const [isTessaOpen, setIsTessaOpen] = useState(false)
  const [tessaQuery, setTessaQuery] = useState('')
  const [question, setQuestion] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (question.trim()) {
      setTessaQuery(question)
      setIsTessaOpen(true)
    }
  }

  return (
    <>
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Blue Overlay */}
        <div className="absolute inset-0">
          <img
            src="/beautiful-modern-california-home-exterior-with-blu.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          {/* Blue Overlay - matching pct.com */}
          <div className="absolute inset-0 bg-[#03374f]/85" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-32">
          {/* Subheading */}
          <p className="text-primary font-semibold tracking-[0.25em] text-sm sm:text-base mb-4 uppercase">
            Residential / Commercial / Escrow
          </p>

          {/* Main Headline - Customer-focused */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight tracking-tight mb-8">
            CLOSE WITH CONFIDENCE
          </h1>

          {/* TESSA Search Bar */}
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white rounded-lg p-2 shadow-2xl">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Have a question about your transaction?"
                className="flex-1 px-4 py-4 text-base text-gray-700 placeholder-gray-400 focus:outline-none bg-transparent"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-md transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                Get Answers
              </button>
            </div>
          </form>

          {/* Trust Stats - Customer-benefit focused */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-16 text-white/90">
            <div className="text-center">
              <span className="block text-3xl sm:text-4xl font-bold text-white">45+</span>
              <span className="text-sm text-white/70">Years of On-Time Closings</span>
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/20" />
            <div className="text-center">
              <span className="block text-3xl sm:text-4xl font-bold text-white">100K+</span>
              <span className="text-sm text-white/70">Families in Their Homes</span>
            </div>
            <div className="hidden sm:block w-px h-12 bg-white/20" />
            <div className="text-center">
              <span className="block text-3xl sm:text-4xl font-bold text-white">12</span>
              <span className="text-sm text-white/70">Counties, One Call Away</span>
            </div>
          </div>
        </div>

        {/* Wave/Curve at Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V120Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* TESSA Modal */}
      <TessaModal
        isOpen={isTessaOpen}
        onClose={() => setIsTessaOpen(false)}
        initialQuery={tessaQuery}
        initialMode="question"
      />
    </>
  )
}
