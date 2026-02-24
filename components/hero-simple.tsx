'use client'

import { useState, useRef, useCallback } from 'react'
import { Sparkles, FileText, X } from 'lucide-react'
import { TessaModal } from './tessa-modal'
import { TessaPrelimModal } from './tessa/TessaPrelimModal'

type Mode = 'ask' | 'analyze'

export function HeroSimple() {
  // ── Ask mode ──────────────────────────────────────────────
  const [isTessaOpen, setIsTessaOpen]   = useState(false)
  const [tessaQuery, setTessaQuery]     = useState('')
  const [question, setQuestion]         = useState('')

  // ── Analyze mode ─────────────────────────────────────────
  const [isPrelimOpen, setIsPrelimOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileError, setFileError]       = useState<string | null>(null)
  const fileInputRef                    = useRef<HTMLInputElement>(null)

  // ── Mode toggle ───────────────────────────────────────────
  const [mode, setMode] = useState<Mode>('ask')

  const switchMode = (m: Mode) => {
    setMode(m)
    setQuestion('')
    setSelectedFile(null)
    setFileError(null)
  }

  // ── Handlers ──────────────────────────────────────────────
  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (question.trim()) {
      setTessaQuery(question)
      setIsTessaOpen(true)
    }
  }

  const handleFileChange = useCallback((file: File) => {
    if (file.type !== 'application/pdf') {
      setFileError('Please select a PDF file.')
      setSelectedFile(null)
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File too large — 10 MB maximum.')
      setSelectedFile(null)
      return
    }
    setFileError(null)
    setSelectedFile(file)
  }, [])

  const handleAnalyzeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFile) setIsPrelimOpen(true)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileChange(file)
  }, [handleFileChange])

  return (
    <>
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="/beautiful-modern-california-home-exterior-with-blu.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#03374f]/85" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-32">
          {/* Subheading */}
          <p className="text-primary font-semibold tracking-[0.25em] text-sm sm:text-base mb-4 uppercase">
            Residential / Commercial / Escrow
          </p>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight tracking-tight mb-8">
            CLOSE WITH CONFIDENCE
          </h1>

          {/* ── Input area ── */}
          <div className="max-w-3xl mx-auto">

            {/* Mode tabs — minimal, above the bar */}
            <div className="flex justify-center mb-3 gap-1">
              <button
                type="button"
                onClick={() => switchMode('ask')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all
                  ${mode === 'ask'
                    ? 'bg-white text-[#03374f]'
                    : 'text-white/70 hover:text-white hover:bg-white/10'}`}
              >
                ✨ Ask TESSA
              </button>
              <button
                type="button"
                onClick={() => switchMode('analyze')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all
                  ${mode === 'analyze'
                    ? 'bg-white text-[#03374f]'
                    : 'text-white/70 hover:text-white hover:bg-white/10'}`}
              >
                📄 Analyze a Prelim
              </button>
            </div>

            {/* ── Ask mode ── */}
            {mode === 'ask' && (
              <form onSubmit={handleAskSubmit}>
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
            )}

            {/* ── Analyze mode ── */}
            {mode === 'analyze' && (
              <form
                onSubmit={handleAnalyzeSubmit}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
              >
                {/* Same outer bar shape as Ask mode */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white rounded-lg p-2 shadow-2xl">
                  {/* File picker interior — replaces the text input */}
                  <div
                    className="flex-1 flex items-center gap-3 px-4 py-3 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileText className={`w-5 h-5 flex-shrink-0 ${selectedFile ? 'text-[#f26b2b]' : 'text-gray-300'}`} />
                    {selectedFile ? (
                      <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="text-sm font-medium text-gray-800 truncate">{selectedFile.name}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setFileError(null) }}
                          className="ml-2 p-0.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex-shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-base text-gray-400">
                        Drop a Prelim PDF here, or{' '}
                        <span className="text-[#f26b2b] font-semibold underline-offset-2 hover:underline">browse</span>
                      </span>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileChange(f) }}
                  />

                  <button
                    type="submit"
                    disabled={!selectedFile}
                    className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-4 rounded-md transition-colors flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📄 Analyze Report
                  </button>
                </div>

                {/* File error */}
                {fileError && (
                  <p className="mt-2 text-xs text-red-300 text-center">{fileError}</p>
                )}
              </form>
            )}
          </div>

          {/* Trust stats */}
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

        {/* Wave */}
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

      {/* TESSA Chat Modal */}
      <TessaModal
        isOpen={isTessaOpen}
        onClose={() => setIsTessaOpen(false)}
        initialQuery={tessaQuery}
        initialMode="question"
      />

      {/* TESSA Prelim Analysis Modal */}
      <TessaPrelimModal
        isOpen={isPrelimOpen}
        onClose={() => { setIsPrelimOpen(false); setSelectedFile(null) }}
        file={selectedFile}
      />
    </>
  )
}
