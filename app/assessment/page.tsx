"use client"

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { ASSESSMENT_SECTIONS } from '@/lib/assessment-config'

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

  function setAnswer(sectionKey: string, q: string, value: boolean) {
    setResponses((prev) => ({ ...prev, [sectionKey]: { ...(prev[sectionKey] || {}), [q]: value } }))
  }

  function setConfidenceRating(sectionKey: string, key: string, value: number) {
    setConfidence((prev) => ({ ...prev, [sectionKey]: { ...(prev[sectionKey] || {}), [key]: value } }))
  }

  function sectionComplete(sectionKey: string, count: number) {
    const r = responses[sectionKey] || {}
    for (let i = 1; i <= count; i++) {
      if (typeof r[`q${i}`] !== 'boolean') return false
    }
    const c = confidence[sectionKey] || {}
    for (const key of ['awareness', 'access', 'setup', 'usage', 'needTraining']) {
      if (!c[key]) return false
    }
    return true
  }

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

  if (done) {
    return (
      <main className="min-h-screen bg-[#f8f6f3] py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h1 className="text-2xl font-bold text-[#03374f]">Assessment Submitted</h1>
          <p className="text-gray-600">Thanks! Your responses were received.</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Capability Score</p>
              <p className="text-2xl font-bold text-[#03374f]">{done.capability.toFixed(1)}%</p>
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Avg Confidence</p>
              <p className="text-2xl font-bold text-[#03374f]">{done.confidence.toFixed(2)} / 5</p>
            </div>
          </div>
          <Link href="/" className="inline-block text-sm text-[#f26b2b] hover:underline">Return to pct.com</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f8f6f3] py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-[#03374f]">PCT Tool Competency Assessment</h1>
          <p className="text-sm text-gray-500 mt-1">Step {Math.min(step + 1, ASSESSMENT_SECTIONS.length + 1)} of {ASSESSMENT_SECTIONS.length + 1}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          {!isContactStep ? (
            <>
              <h2 className="text-lg font-semibold text-[#03374f]">{current.label}</h2>
              <p className="text-sm text-gray-500">Answer each statement with Yes or No, then rate confidence from 1 (low) to 5 (high).</p>

              <div className="space-y-3">
                {Array.from({ length: current.questions }).map((_, i) => {
                  const q = `q${i + 1}`
                  const val = responses[current.key]?.[q]
                  return (
                    <div key={q} className="rounded-xl border border-gray-100 p-3">
                      <p className="text-sm text-gray-700">Question {i + 1}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button type="button" onClick={() => setAnswer(current.key, q, true)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${val === true ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>Yes</button>
                        <button type="button" onClick={() => setAnswer(current.key, q, false)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${val === false ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'}`}>No</button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  ['awareness', 'Awareness'],
                  ['access', 'Access'],
                  ['setup', 'Setup'],
                  ['usage', 'Usage'],
                  ['needTraining', 'Need Training'],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label} (1-5)</label>
                    <select
                      value={confidence[current.key]?.[key] || ''}
                      onChange={(e) => setConfidenceRating(current.key, key, Number(e.target.value))}
                      className="w-full h-11 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm"
                    >
                      <option value="">Select</option>
                      {[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-[#03374f]">Contact Information</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-11 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-11 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-11 px-4 bg-[#f8f6f3] border border-gray-200 rounded-xl text-sm" />
              </div>
            </>
          )}

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="px-4 h-10 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4 inline mr-1" /> Back
            </button>

            {!isContactStep ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!sectionComplete(current.key, current.questions)}
                className="px-4 h-10 rounded-xl bg-[#03374f] text-white text-sm font-semibold disabled:opacity-40"
              >
                Next <ChevronRight className="w-4 h-4 inline ml-1" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !name || !email}
                className="px-4 h-10 rounded-xl bg-[#f26b2b] text-white text-sm font-semibold disabled:opacity-40"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-1" />Submitting...</> : 'Submit Assessment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

