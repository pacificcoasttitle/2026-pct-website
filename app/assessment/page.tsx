"use client"

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { ASSESSMENT_SECTIONS, CONFIDENCE_CATEGORIES, CONFIDENCE_SCALE, TOTAL_QUESTIONS } from '@/lib/assessment-config'

type BoolMap = Record<string, boolean>
type NumMap = Record<string, number>

export default function AssessmentPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<{ capability: number; confidence: number } | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [responses, setResponses] = useState<Record<string, BoolMap>>({})
  const [confidence, setConfidence] = useState<Record<string, NumMap>>({})

  const repCode = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const params = new URLSearchParams(window.location.search)
    return params.get('rep') || ''
  }, [])

  const current = ASSESSMENT_SECTIONS[step]
  const isContactStep = step === ASSESSMENT_SECTIONS.length

  function setAnswer(sectionKey: string, qKey: string, value: boolean) {
    setResponses((prev) => ({ ...prev, [sectionKey]: { ...(prev[sectionKey] || {}), [qKey]: value } }))
  }

  function setConfidenceRating(sectionKey: string, key: string, value: number) {
    setConfidence((prev) => ({ ...prev, [sectionKey]: { ...(prev[sectionKey] || {}), [key]: value } }))
  }

  function sectionComplete(sectionKey: string, questionCount: number) {
    const r = responses[sectionKey] || {}
    for (let i = 1; i <= questionCount; i++) {
      if (typeof r[`q${i}`] !== 'boolean') return false
    }
    const c = confidence[sectionKey] || {}
    for (const cat of CONFIDENCE_CATEGORIES) {
      if (!c[cat.key]) return false
    }
    return true
  }

  /* progress bar */
  const progress = Math.round(((step) / (ASSESSMENT_SECTIONS.length + 1)) * 100)

  async function handleSubmit() {
    if (!name || !email) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          respondentName: name,
          respondentEmail: email,
          respondentPhone: phone,
          repCode,
          responses,
          confidenceRatings: confidence,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit assessment')
      setDone({
        capability: Number(data.capability_score || 0),
        confidence: Number(data.avg_confidence_score || 0),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  /* ------------- DONE SCREEN ------------- */
  if (done) {
    return (
      <main className="min-h-screen bg-[#f8f6f3] py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-5">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h1 className="text-2xl font-bold text-[#03374f]">Assessment Submitted</h1>
          <p className="text-gray-600">Thank you! Your responses have been received and will be reviewed by your PCT representative.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-5">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Capability Score</p>
              <p className="text-3xl font-bold text-[#03374f]">{done.capability.toFixed(1)}%</p>
              <p className="text-xs text-gray-400 mt-1">Based on {TOTAL_QUESTIONS} questions</p>
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-5">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Avg Confidence</p>
              <p className="text-3xl font-bold text-[#03374f]">{done.confidence.toFixed(2)} / 5</p>
              <p className="text-xs text-gray-400 mt-1">Across {ASSESSMENT_SECTIONS.length} tools</p>
            </div>
          </div>
          <Link href="/" className="inline-block text-sm text-[#f26b2b] hover:underline mt-2">
            ← Return to pct.com
          </Link>
        </div>
      </main>
    )
  }

  /* ------------- MAIN FORM ------------- */
  return (
    <main className="min-h-screen bg-[#f8f6f3] py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#03374f]">PCT Tool Competency Assessment</h1>
          <p className="text-sm text-gray-500 mt-1">
            Step {Math.min(step + 1, ASSESSMENT_SECTIONS.length + 1)} of {ASSESSMENT_SECTIONS.length + 1}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-[#03374f] h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step pills */}
        <div className="flex flex-wrap gap-2">
          {ASSESSMENT_SECTIONS.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setStep(i)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                i === step
                  ? 'bg-[#03374f] text-white'
                  : sectionComplete(s.key, s.questions.length)
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {s.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setStep(ASSESSMENT_SECTIONS.length)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              isContactStep ? 'bg-[#03374f] text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            Contact Info
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
          {!isContactStep ? (
            <>
              {/* Section title */}
              <div>
                <h2 className="text-xl font-semibold text-[#03374f]">{current.label}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Answer each statement with <span className="font-medium text-emerald-600">Yes</span> or{' '}
                  <span className="font-medium text-rose-500">No</span>, then rate your confidence below.
                </p>
              </div>

              {/* Questions */}
              <div className="space-y-3">
                {current.questions.map((q, i) => {
                  const val = responses[current.key]?.[q.key]
                  return (
                    <div
                      key={q.key}
                      className={`rounded-xl border p-4 transition-colors ${
                        val === true
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : val === false
                          ? 'border-rose-200 bg-rose-50/40'
                          : 'border-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm text-gray-800 leading-relaxed">
                          <span className="font-semibold text-[#03374f] mr-1.5">{i + 1}.</span>
                          {q.text}
                        </p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => setAnswer(current.key, q.key, true)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              val === true
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setAnswer(current.key, q.key, false)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              val === false
                                ? 'bg-rose-500 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Confidence Ratings */}
              <div className="pt-2 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-[#03374f] mb-1">
                  Confidence Ratings for {current.label}
                </h3>
                <p className="text-xs text-gray-400 mb-3">
                  Rate from 1 (No Knowledge) to 5 (Expert Level)
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {CONFIDENCE_CATEGORIES.map((cat) => (
                    <div key={cat.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {cat.label}
                      </label>
                      <select
                        value={confidence[current.key]?.[cat.key] || ''}
                        onChange={(e) => setConfidenceRating(current.key, cat.key, Number(e.target.value))}
                        className="w-full h-11 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#03374f]/20 focus:border-[#03374f]"
                      >
                        <option value="">Select...</option>
                        {CONFIDENCE_SCALE.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.value} — {s.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-gray-400 mt-0.5">{cat.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* --------- CONTACT INFO STEP --------- */
            <>
              <div>
                <h2 className="text-xl font-semibold text-[#03374f]">Contact Information</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Your results will be shared with your PCT representative.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#03374f]/20 focus:border-[#03374f]"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-11 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#03374f]/20 focus:border-[#03374f]"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#03374f]/20 focus:border-[#03374f]"
                  placeholder="(555) 123-4567"
                />
              </div>

              {/* Summary */}
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Assessment Summary</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  {ASSESSMENT_SECTIONS.map((s) => {
                    const r = responses[s.key] || {}
                    const yesCount = s.questions.filter((q) => r[q.key] === true).length
                    return (
                      <div key={s.key} className="rounded-lg bg-white border border-gray-100 p-2">
                        <p className="text-[10px] text-gray-400 truncate">{s.label}</p>
                        <p className="text-sm font-bold text-[#03374f]">
                          {yesCount}/{s.questions.length}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="px-5 h-10 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 inline mr-1" /> Back
            </button>

            {!isContactStep ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!sectionComplete(current.key, current.questions.length)}
                className="px-5 h-10 rounded-xl bg-[#03374f] text-white text-sm font-semibold hover:bg-[#03374f]/90 disabled:opacity-40 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4 inline ml-1" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !name || !email}
                className="px-5 h-10 rounded-xl bg-[#f26b2b] text-white text-sm font-semibold hover:bg-[#f26b2b]/90 disabled:opacity-40 transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                    Submitting...
                  </>
                ) : (
                  'Submit Assessment'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400">
          Pacific Coast Title Company — Tool Competency Assessment
        </p>
      </div>
    </main>
  )
}
