// ============================================================
// TESSA™ usePrelimAnalysis Hook — v4 (Multi-Step JSON Pipeline)
//
// Pipeline:
//   PDF text → pre-parser (facts) → LLM Extract (JSON) →
//   Guardrails validate → LLM Summarize (markdown) → render
// ============================================================

'use client'

import { useState, useCallback, useRef } from 'react'
import type {
  PrelimFacts,
  AnalysisStatus,
  CheatSheetItem,
  ExtractedAnalysis,
} from '@/lib/tessa/tessa-types'

export interface PrelimAnalysisState {
  status: AnalysisStatus
  progress: number
  progressLabel: string
  /** Structured JSON extracted by LLM Call 1 */
  extracted: ExtractedAnalysis | null
  /** Plain-English markdown summary from LLM Call 2 */
  summary: string
  /** Ground-truth facts from the deterministic pre-parser */
  facts: PrelimFacts | null
  cheatSheetItems: CheatSheetItem[]
  error: string | null
  fileName: string | null
}

// ── Simulated sub-steps for LLM Call 1 (Extraction) ─────────
const EXTRACTION_STEPS: { elapsed: number; progress: number; label: string }[] = [
  { elapsed: 0,  progress: 30, label: 'TESSA is reading your prelim...' },
  { elapsed: 4,  progress: 37, label: 'Identifying title requirements...' },
  { elapsed: 9,  progress: 44, label: 'Mapping liens and encumbrances...' },
  { elapsed: 15, progress: 51, label: 'Analyzing deeds of trust...' },
  { elapsed: 22, progress: 57, label: 'Processing tax information...' },
  { elapsed: 30, progress: 62, label: 'Evaluating exceptions and findings...' },
  { elapsed: 40, progress: 65, label: 'Finalizing extraction...' },
  { elapsed: 55, progress: 67, label: 'Still working — large document...' },
]

// ── Simulated sub-steps for LLM Call 2 (Summary) ─────────────
const SUMMARY_STEPS: { elapsed: number; progress: number; label: string }[] = [
  { elapsed: 0,  progress: 75, label: 'Generating plain-English summary...' },
  { elapsed: 5,  progress: 82, label: 'Assessing top closing risks...' },
  { elapsed: 12, progress: 88, label: 'Almost done...' },
]

export function usePrelimAnalysis() {
  const [state, setState] = useState<PrelimAnalysisState>({
    status: 'idle',
    progress: 0,
    progressLabel: '',
    extracted: null,
    summary: '',
    facts: null,
    cheatSheetItems: [],
    error: null,
    fileName: null,
  })

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)

  const setProgress = (progress: number, label: string) =>
    setState((s) => ({ ...s, progress, progressLabel: label }))

  function startTimer(
    steps: { elapsed: number; progress: number; label: string }[]
  ) {
    startTimeRef.current = Date.now()
    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      let current = steps[0]
      for (const step of steps) {
        if (elapsed >= step.elapsed) current = step
      }
      setState((s) => ({ ...s, progress: current.progress, progressLabel: current.label }))
    }, 1000)
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const analyzePrelim = useCallback(async (file: File) => {
    setState((s) => ({
      ...s,
      status: 'extracting',
      progress: 5,
      progressLabel: 'Loading PDF...',
      error: null,
      fileName: file.name,
    }))

    try {
      // ── Step 1: Extract PDF text (client-side, no LLM) ──────
      const { extractPdfText } = await import('@/lib/tessa/tessa-pdf')
      setProgress(15, 'Extracting text from PDF...')
      const pdfText = await extractPdfText(file)

      // ── Step 2: Pre-parser computes ground-truth facts ───────
      setState((s) => ({
        ...s,
        status: 'computing_facts',
        progress: 20,
        progressLabel: 'Analyzing document structure...',
      }))
      const { computeFacts } = await import('@/lib/tessa/tessa-pre-parser')
      const facts = computeFacts(pdfText)
      setState((s) => ({ ...s, facts }))

      // ── Step 3: LLM Call 1 — Structured Extraction ──────────
      setState((s) => ({
        ...s,
        status: 'analyzing',
        progress: 30,
        progressLabel: 'TESSA is reading your prelim...',
      }))
      startTimer(EXTRACTION_STEPS)

      const { buildExtractionPrompt, EXTRACTION_SYSTEM_PROMPT } = await import(
        '@/lib/tessa/tessa-prompts'
      )
      const { callTessaExtract } = await import('@/lib/tessa/tessa-api')

      const factsJson = JSON.stringify(facts, null, 2)
      const extractionPrompt = buildExtractionPrompt(pdfText, factsJson)
      const rawExtraction = await callTessaExtract(EXTRACTION_SYSTEM_PROMPT, extractionPrompt)

      stopTimer()

      // Parse the JSON response (strip any accidental markdown fences)
      let extracted: ExtractedAnalysis
      try {
        const cleaned = rawExtraction
          .replace(/^```json?\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim()
        extracted = JSON.parse(cleaned)
      } catch (parseErr) {
        console.error('[TESSA] JSON parse failed:', rawExtraction.slice(0, 400))
        throw new Error(
          'Failed to parse extraction response. The model may have returned non-JSON output.'
        )
      }

      // ── Step 4: Guardrails — validate against pre-parser facts
      setState((s) => ({
        ...s,
        status: 'validating',
        progress: 70,
        progressLabel: 'Validating against ground-truth data...',
      }))
      const { validateAndRepairExtraction } = await import('@/lib/tessa/tessa-guardrails')
      extracted = validateAndRepairExtraction(extracted, facts)

      // ── Step 5: LLM Call 2 — Generate plain-English summary ─
      setState((s) => ({
        ...s,
        status: 'summarizing',
        progress: 75,
        progressLabel: 'Generating plain-English summary...',
      }))
      startTimer(SUMMARY_STEPS)

      const { buildSummaryPrompt, SUMMARY_SYSTEM_PROMPT } = await import(
        '@/lib/tessa/tessa-prompts'
      )
      const { callTessaSummarize } = await import('@/lib/tessa/tessa-api')

      const summaryPrompt = buildSummaryPrompt(JSON.stringify(extracted, null, 2))
      const summary = await callTessaSummarize(SUMMARY_SYSTEM_PROMPT, summaryPrompt)

      stopTimer()

      // ── Step 6: Build cheat sheet (deterministic, no LLM) ───
      setProgress(95, 'Rendering results...')
      const { buildCheatSheetItems } = await import('@/lib/tessa/tessa-cheat-sheet')
      const cheatSheetItems = buildCheatSheetItems(facts)

      setState({
        status: 'complete',
        progress: 100,
        progressLabel: 'Analysis complete!',
        extracted,
        summary,
        facts,
        cheatSheetItems,
        error: null,
        fileName: file.name,
      })
    } catch (err) {
      stopTimer()
      const message = err instanceof Error ? err.message : 'Unknown error occurred'
      setState((s) => ({
        ...s,
        status: 'error',
        progress: 0,
        progressLabel: '',
        error: message,
      }))
    }
  }, [])

  const reset = useCallback(() => {
    stopTimer()
    setState({
      status: 'idle',
      progress: 0,
      progressLabel: '',
      extracted: null,
      summary: '',
      facts: null,
      cheatSheetItems: [],
      error: null,
      fileName: null,
    })
  }, [])

  return { ...state, analyzePrelim, reset }
}
