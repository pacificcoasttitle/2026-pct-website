'use client'

import { useState } from 'react'
import Navigation from '@/components/navigation'
import { Footer } from '@/components/footer'
import { TessaPrelimUploader } from '@/components/tessa/TessaPrelimUploader'
import { TessaPrelimResults } from '@/components/tessa/TessaPrelimResults'
import { TessaAgentToggle } from '@/components/tessa/TessaAgentToggle'
import { usePrelimAnalysis } from '@/hooks/usePrelimAnalysis'

// ─── Progress bar ─────────────────────────────────────────────
function ProgressBar({ progress, label }: { progress: number; label: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className="text-gray-500">{progress}%</span>
      </div>
      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#f26b2b] to-[#e05a1f] rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// ─── Status icon ──────────────────────────────────────────────
function StatusIcon({ status }: { status: string }) {
  const icons: Record<string, string> = {
    extracting: '📄',
    analyzing:  '🤖',
    validating: '✅',
    complete:   '🎉',
    error:      '❌',
  }
  return <span className="text-2xl">{icons[status] ?? '⏳'}</span>
}

// ─── Main Page ────────────────────────────────────────────────
export default function TessaPrelimReviewPage() {
  const {
    status,
    progress,
    progressLabel,
    sections,
    facts,
    cheatSheetItems,
    error,
    fileName,
    analyzePrelim,
    reset,
  } = usePrelimAnalysis()

  const [agentMode, setAgentMode] = useState(false)

  const isProcessing = status === 'extracting' || status === 'analyzing' || status === 'validating'
  const isComplete   = status === 'complete'
  const hasError     = status === 'error'

  return (
    <main className="min-h-screen bg-white">
      <Navigation variant="light" />

      {/* Hero banner */}
      <section className="bg-gray-900 text-white pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#f26b2b] flex items-center justify-center text-white font-black text-lg">
              T
            </div>
            <span className="text-sm font-semibold tracking-widest uppercase text-orange-400">
              TESSA™ AI
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3">
            Preliminary Title Report Analyzer
          </h1>
          <p className="text-gray-300 max-w-2xl text-base leading-relaxed">
            Upload a Preliminary Title Report PDF. TESSA™ extracts the facts, runs structured
            analysis, and delivers a 7-section review — in plain English.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="container mx-auto max-w-4xl px-4 py-10">

        {/* Idle: show uploader */}
        {status === 'idle' && (
          <div className="space-y-6">
            {/* Feature badges */}
            <div className="flex flex-wrap gap-2 mb-2">
              {[
                '🔒 PDF never leaves your browser',
                '⚡ Guardrails prevent hallucination',
                '🏡 Closing-first analysis',
                '📋 7-section structured report',
              ].map((badge) => (
                <span
                  key={badge}
                  className="bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-3 py-1 text-xs font-semibold"
                >
                  {badge}
                </span>
              ))}
            </div>

            <TessaPrelimUploader onFile={analyzePrelim} disabled={false} />

            {/* What TESSA analyzes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {[
                { icon: '🏠', label: 'Property Info', desc: 'Address, APN, Effective date' },
                { icon: '💰', label: 'Taxes & Liens', desc: 'Delinquencies, defaults' },
                { icon: '📋', label: 'Requirements', desc: 'Blockers, materials, info' },
                { icon: '📜', label: 'Encumbrances', desc: 'Easements, CC&Rs, DOTs' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-center"
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing: show progress */}
        {isProcessing && (
          <div className="max-w-lg mx-auto text-center space-y-8 py-8">
            <StatusIcon status={status} />
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {status === 'extracting' && 'Reading your prelim…'}
                {status === 'analyzing'  && 'TESSA™ is analyzing…'}
                {status === 'validating' && 'Running guardrails…'}
              </h2>
              <p className="text-gray-500 text-sm">
                {fileName && <span className="font-medium text-gray-700">{fileName}</span>}
              </p>
            </div>
            <ProgressBar progress={progress} label={progressLabel} />
            <p className="text-xs text-gray-400">
              This usually takes 20–40 seconds for a typical prelim.
            </p>
          </div>
        )}

        {/* Error */}
        {hasError && (
          <div className="max-w-lg mx-auto text-center space-y-5 py-8">
            <p className="text-4xl">😕</p>
            <div>
              <h2 className="text-xl font-bold text-red-700 mb-2">Analysis Failed</h2>
              <p className="text-sm text-gray-600 bg-red-50 border border-red-200 rounded-xl px-5 py-3">
                {error}
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              className="py-2.5 px-6 rounded-xl bg-[#f26b2b] text-white font-bold text-sm hover:bg-[#e05a1f] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Complete: show results */}
        {isComplete && sections && (
          <div className="space-y-6">
            {/* Controls row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Analysis Complete</h2>
                <p className="text-sm text-gray-500">
                  {sections.length} sections &nbsp;·&nbsp;{' '}
                  {facts?.requirements?.length ?? 0} requirements found
                </p>
              </div>
              <TessaAgentToggle
                agentMode={agentMode}
                onChange={setAgentMode}
              />
            </div>

            {/* Results */}
            <TessaPrelimResults
              sections={sections}
              facts={facts}
              cheatSheetItems={cheatSheetItems}
              fileName={fileName ?? 'Prelim Report'}
              onReset={reset}
            />
          </div>
        )}
      </section>

      {/* Bottom info strip */}
      {status === 'idle' && (
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-6">
          <div className="container mx-auto max-w-4xl">
            <p className="text-xs text-gray-500 text-center">
              <strong className="text-gray-700">Privacy:</strong> Your PDF is processed entirely in
              your browser. The text content is sent to TESSA™&apos;s AI analysis service, but the
              original file is never uploaded or stored.{' '}
              <a href="/about/how-we-protect-you" className="text-[#f26b2b] hover:underline">
                Learn how we protect you.
              </a>
            </p>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
