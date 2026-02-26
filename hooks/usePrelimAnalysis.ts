// ============================================================
// TESSA™ usePrelimAnalysis Hook
// Orchestrates: PDF extract → pre-parse → AI analyze → guardrails → parse sections
// ============================================================

'use client'

import { useState, useCallback, useRef } from 'react'
import type { ParsedSection, PrelimFacts, AnalysisStatus, CheatSheetItem } from '@/lib/tessa/tessa-types'

export interface PrelimAnalysisState {
  status: AnalysisStatus
  progress: number
  progressLabel: string
  sections: ParsedSection[] | null
  facts: PrelimFacts | null
  cheatSheetItems: CheatSheetItem[]
  rawResponse: string
  error: string | null
  fileName: string | null
}

// ── Simulated sub-steps during the AI API call ───────────────
const ANALYSIS_STEPS: { elapsed: number; progress: number; label: string }[] = [
  { elapsed: 0,  progress: 25, label: 'TESSA is reading your prelim...' },
  { elapsed: 4,  progress: 32, label: 'Identifying title requirements...' },
  { elapsed: 9,  progress: 40, label: 'Analyzing liens and encumbrances...' },
  { elapsed: 15, progress: 48, label: 'Reviewing deeds of trust...' },
  { elapsed: 22, progress: 55, label: 'Parsing tax information...' },
  { elapsed: 30, progress: 62, label: 'Checking Schedule B exceptions...' },
  { elapsed: 38, progress: 70, label: 'Evaluating CC&Rs and easements...' },
  { elapsed: 46, progress: 77, label: 'Building your structured report...' },
  { elapsed: 55, progress: 83, label: 'Almost there — finalizing analysis...' },
  { elapsed: 65, progress: 88, label: 'Still working — complex file...' },
  { elapsed: 80, progress: 90, label: 'Wrapping up...' },
]

export function usePrelimAnalysis() {
  const [state, setState] = useState<PrelimAnalysisState>({
    status: 'idle',
    progress: 0,
    progressLabel: '',
    sections: null,
    facts: null,
    cheatSheetItems: [],
    rawResponse: '',
    error: null,
    fileName: null,
  })

  // Timer refs for simulated analysis progress
  const analysisStartTime = useRef<number>(0)
  const analysisTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const setProgress = (progress: number, label: string) =>
    setState((s) => ({ ...s, progress, progressLabel: label }))

  function startAnalysisProgress() {
    analysisStartTime.current = Date.now()
    analysisTimer.current = setInterval(() => {
      const elapsed = (Date.now() - analysisStartTime.current) / 1000
      // Find the latest step we've passed
      let current = ANALYSIS_STEPS[0]
      for (const step of ANALYSIS_STEPS) {
        if (elapsed >= step.elapsed) current = step
      }
      setState((s) => ({ ...s, progress: current.progress, progressLabel: current.label }))
    }, 1000)
  }

  function stopAnalysisProgress() {
    if (analysisTimer.current) {
      clearInterval(analysisTimer.current)
      analysisTimer.current = null
    }
  }

  const analyzePrelim = useCallback(async (file: File) => {
    setState((s) => ({ ...s, status: 'extracting', progress: 5, progressLabel: 'Loading PDF...', error: null, fileName: file.name }))

    try {
      // ── Step 1: Extract PDF text (client-side) ──────────────
      const { extractPdfText } = await import('@/lib/tessa/tessa-pdf')
      setProgress(20, 'Extracting text from PDF...')
      const pdfText = await extractPdfText(file)

      // ── Step 2: Run pre-parser ──────────────────────────────
      setProgress(40, 'Analyzing document structure...')
      const { computeFacts } = await import('@/lib/tessa/tessa-pre-parser')
      const facts = computeFacts(pdfText)

      setState((s) => ({ ...s, facts }))

      // ── Step 3: Build analysis prompt ───────────────────────
      const { buildPrelimAnalysisPrompt, TESSA_SYSTEM_PROMPT } = await import('@/lib/tessa/tessa-prompts')
      const analysisPrompt = buildPrelimAnalysisPrompt(file.name, pdfText, facts)

      // ── Step 4: Send to proxy (with simulated sub-step progress) ──
      setState((s) => ({
        ...s,
        status: 'analyzing',
        progress: 25,
        progressLabel: 'TESSA is reading your prelim...',
      }))
      startAnalysisProgress()

      const { callTessaProxy, callTessaRepair } = await import('@/lib/tessa/tessa-api')

      const history = [
        { role: 'system' as const, content: TESSA_SYSTEM_PROMPT },
        { role: 'user' as const, content: analysisPrompt },
      ]

      let tessaResponse = await callTessaProxy(history)

      // API responded — stop simulation and snap to validating
      stopAnalysisProgress()

      // ── Step 5: Guardrails ──────────────────────────────────
      setState((s) => ({ ...s, status: 'validating', progress: 92, progressLabel: 'Validating results...' }))
      const {
        runGuardrailsStep1,
        runGuardrailsStep2,
        validatePrelimOutput,
        buildRepairPrompt,
        stitchRepairSections,
      } = await import('@/lib/tessa/tessa-guardrails')

      tessaResponse = runGuardrailsStep1(tessaResponse, facts)

      const validation = validatePrelimOutput(facts, tessaResponse)

      if (!validation.ok) {
        setProgress(82, 'Repairing missing sections...')
        try {
          const repairPrompt = buildRepairPrompt(facts, validation.missing)
          const repairText = await callTessaRepair(history, repairPrompt)
          tessaResponse = stitchRepairSections(tessaResponse, repairText)
        } catch {
          // Repair failed — continue with what we have
          console.warn('TESSA repair call failed; continuing with original response')
        }
      }

      tessaResponse = runGuardrailsStep2(tessaResponse, facts)

      // ── Step 6: Parse into sections ─────────────────────────
      setProgress(92, 'Rendering results...')
      const { parsePrelimResponse } = await import('@/lib/tessa/tessa-section-parser')
      const sections = parsePrelimResponse(tessaResponse)

      // ── Step 7: Build cheat sheet ───────────────────────────
      const { buildCheatSheetItems } = await import('@/lib/tessa/tessa-cheat-sheet')
      const cheatSheetItems = buildCheatSheetItems(facts)

      setState({
        status: 'complete',
        progress: 100,
        progressLabel: 'Analysis complete!',
        sections,
        facts,
        cheatSheetItems,
        rawResponse: tessaResponse,
        error: null,
        fileName: file.name,
      })
    } catch (err) {
      stopAnalysisProgress()
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
    setState({
      status: 'idle',
      progress: 0,
      progressLabel: '',
      sections: null,
      facts: null,
      cheatSheetItems: [],
      rawResponse: '',
      error: null,
      fileName: null,
    })
  }, [])

  return { ...state, analyzePrelim, reset }
}
