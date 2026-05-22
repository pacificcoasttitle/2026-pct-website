'use client'

/**
 * AI content generation modal for the Template Editor.
 *
 * Calls POST /api/admin/marketing/ai/generate (server-side OpenAI proxy)
 * and lets the user preview the result before inserting into TinyMCE.
 */

import { useEffect, useMemo, useState } from 'react'
import { Sparkles, Loader2, RefreshCw, Pencil, ArrowRight, AlertCircle } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { InlineAlert } from './shared'

type Mode   = 'insert' | 'rewrite'
type Length = 'short' | 'medium' | 'long'

interface GenerateResponse {
  content:    string
  tokensUsed: number
  model:      string
}

interface Props {
  open:         boolean
  onClose:      () => void
  onInsert:     (html: string, mode: Mode) => void
  hasSelection: boolean
  selectedText?: string
}

const PROMPT_MAX = 2000
const PROMPT_MIN = 10

const LENGTH_HINTS: Record<Length, string> = {
  short:  '~80–150 words',
  medium: '~200–350 words',
  long:   '~400–600 words',
}

export function AiGenerateModal({
  open, onClose, onInsert, hasSelection, selectedText,
}: Props) {
  const [prompt, setPrompt]                   = useState('')
  const [mode, setMode]                       = useState<Mode>('insert')
  const [length, setLength]                   = useState<Length>('medium')
  const [isGenerating, setIsGenerating]       = useState(false)
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)
  const [tokensUsed, setTokensUsed]           = useState<number | null>(null)
  const [error, setError]                     = useState<string | null>(null)
  const [showEditPrompt, setShowEditPrompt]   = useState(false)

  /* Reset state every time the modal re-opens; pre-select "rewrite" if
     the user opened it with text selected. */
  useEffect(() => {
    if (!open) return
    setError(null)
    setGeneratedContent(null)
    setTokensUsed(null)
    setIsGenerating(false)
    setShowEditPrompt(false)
    setMode(hasSelection ? 'rewrite' : 'insert')
  }, [open, hasSelection])

  const charCount    = prompt.length
  const tooShort     = charCount < PROMPT_MIN
  const tooLong      = charCount > PROMPT_MAX
  const canGenerate  = !tooShort && !tooLong && !isGenerating

  /* Render the AI HTML inside a sandboxed iframe via srcDoc so any
     styles in the generated content can't leak into the admin UI. */
  const previewSrcDoc = useMemo(() => {
    if (!generatedContent) return ''
    return `<!DOCTYPE html><html><head><meta charset="utf-8" /><style>
      body { font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #333; padding: 16px; margin: 0; }
      h2 { color: #03374f; font-size: 18px; margin: 0 0 8px; }
      h3 { color: #03374f; font-size: 15px; margin: 16px 0 6px; }
      p  { margin: 0 0 12px; }
      a  { color: #f26b2b; }
      ul { padding-left: 20px; margin: 0 0 12px; }
      li { margin-bottom: 4px; }
    </style></head><body>${generatedContent}</body></html>`
  }, [generatedContent])

  async function generate() {
    setError(null); setIsGenerating(true); setGeneratedContent(null); setTokensUsed(null)
    try {
      const res = await fetch('/api/admin/marketing/ai/generate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          mode,
          length,
          ...(mode === 'rewrite' && selectedText ? { existingContent: selectedText } : {}),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || `Generation failed (${res.status})`)
      const payload = data as GenerateResponse
      if (!payload.content) throw new Error('Empty response from AI service.')
      setGeneratedContent(payload.content)
      setTokensUsed(payload.tokensUsed ?? null)
      setShowEditPrompt(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed. Try again in a moment.')
    } finally {
      setIsGenerating(false)
    }
  }

  function handleInsert() {
    if (!generatedContent) return
    onInsert(generatedContent, mode)
  }

  /* While preview is showing AND user hasn't clicked "Edit Prompt", we
     collapse the form to keep focus on the preview + actions. */
  const showFormFull = !generatedContent || showEditPrompt

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#03374f]">
            <Sparkles className="w-5 h-5 text-[#f26b2b]" />
            Create with AI
          </DialogTitle>
          <DialogDescription>
            Describe what you want to write and we&apos;ll draft brand-aligned HTML you can preview before inserting.
          </DialogDescription>
        </DialogHeader>

        {/* ── Selected-text indicator ───────────────────────────── */}
        {hasSelection && selectedText && (
          <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-3 py-2 text-xs text-blue-900">
            <p className="font-semibold mb-1">You have text selected ({selectedText.length} chars)</p>
            <p className="text-blue-800 italic line-clamp-2">
              “{selectedText.slice(0, 200)}{selectedText.length > 200 ? '…' : ''}”
            </p>
          </div>
        )}

        {/* ── Prompt + options ─────────────────────────────────── */}
        {showFormFull && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="ai-prompt" className="text-xs text-gray-500">
                What should we write about?
              </Label>
              <Textarea
                id="ai-prompt"
                rows={6}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to write about..."
                maxLength={PROMPT_MAX + 200}
                className="mt-1 resize-y"
              />
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">
                  e.g., <em>Announce our new digital closing service. Focus on speed and convenience for real estate agents.</em>
                </span>
                <span className={tooLong ? 'text-red-600' : 'text-gray-400'}>
                  {charCount.toLocaleString()} / {PROMPT_MAX.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Mode (only when selection exists) */}
            {hasSelection && (
              <div>
                <Label className="text-xs text-gray-500">Action</Label>
                <RadioGroup value={mode} onValueChange={(v: Mode) => setMode(v)}
                            className="mt-1.5 space-y-1.5">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <RadioGroupItem value="rewrite" className="mt-0.5" />
                    <div>
                      <p className="text-sm text-[#03374f]">Replace selected text</p>
                      <p className="text-[11px] text-gray-400">The AI will rewrite your highlighted text using the prompt.</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <RadioGroupItem value="insert" className="mt-0.5" />
                    <div>
                      <p className="text-sm text-[#03374f]">Insert new content</p>
                      <p className="text-[11px] text-gray-400">Add fresh content at the cursor; selection stays untouched.</p>
                    </div>
                  </label>
                </RadioGroup>
              </div>
            )}

            {/* Length */}
            <div>
              <Label className="text-xs text-gray-500">Length</Label>
              <RadioGroup value={length} onValueChange={(v: Length) => setLength(v)}
                          className="mt-1.5 grid grid-cols-3 gap-2">
                {(['short', 'medium', 'long'] as Length[]).map((L) => {
                  const active = length === L
                  return (
                    <label key={L}
                           className={`flex flex-col items-start gap-1 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                             active ? 'border-[#f26b2b] bg-[#f26b2b]/5' : 'border-gray-200 hover:border-gray-300'
                           }`}>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value={L} />
                        <span className="text-sm font-semibold capitalize text-[#03374f]">{L}</span>
                      </div>
                      <span className="text-[11px] text-gray-500 pl-6">{LENGTH_HINTS[L]}</span>
                    </label>
                  )
                })}
              </RadioGroup>
            </div>

            {/* Generate button */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="outline" onClick={onClose} disabled={isGenerating}>
                Cancel
              </Button>
              <Button onClick={generate}
                      disabled={!canGenerate}
                      className="bg-[#f26b2b] hover:bg-[#e05d1e] text-white">
                {isGenerating
                  ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Generating…</>
                  : <><Sparkles className="w-4 h-4 mr-1.5" /> {generatedContent ? 'Generate again' : 'Generate Content'}</>}
              </Button>
            </div>
            {tooShort && charCount > 0 && (
              <p className="text-[11px] text-amber-600">
                Add a bit more detail — at least {PROMPT_MIN} characters.
              </p>
            )}
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────────── */}
        {error && (
          <InlineAlert
            kind="error"
            message={`${error} You can adjust your prompt and try again.`}
            onClose={() => setError(null)}
          />
        )}

        {/* ── Loading ───────────────────────────────────────────── */}
        {isGenerating && (
          <div className="space-y-3">
            <Skeleton className="h-5 w-1/2 bg-gray-200" />
            <Skeleton className="h-4 w-full bg-gray-200" />
            <Skeleton className="h-4 w-full bg-gray-200" />
            <Skeleton className="h-4 w-5/6 bg-gray-200" />
            <Skeleton className="h-32 w-full bg-gray-200" />
            <p className="text-xs text-gray-500 inline-flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating content…
            </p>
          </div>
        )}

        {/* ── Preview ───────────────────────────────────────────── */}
        {generatedContent && !isGenerating && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Preview</p>
              {tokensUsed !== null && (
                <p className="text-[11px] text-gray-400">
                  {tokensUsed.toLocaleString()} tokens · gpt-4o-mini
                </p>
              )}
            </div>
            <iframe
              title="AI preview"
              srcDoc={previewSrcDoc}
              sandbox=""
              className="w-full bg-white border border-gray-200 rounded-xl block"
              style={{ height: 360 }}
            />
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={generate} disabled={isGenerating}>
                  <RefreshCw className="w-3.5 h-3.5 mr-1" /> Regenerate
                </Button>
                <Button variant="outline" size="sm"
                        onClick={() => setShowEditPrompt((v) => !v)}>
                  <Pencil className="w-3.5 h-3.5 mr-1" />
                  {showEditPrompt ? 'Hide prompt' : 'Edit prompt'}
                </Button>
              </div>
              <Button onClick={handleInsert}
                      className="bg-[#03374f] hover:bg-[#03374f]/90 text-white">
                Insert into Editor <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
            <p className="text-[11px] text-gray-400 inline-flex items-start gap-1">
              <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              Always review AI-generated content for accuracy before sending.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
