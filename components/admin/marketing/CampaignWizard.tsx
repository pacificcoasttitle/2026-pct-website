'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft, ArrowRight, Check, ChevronRight, Loader2, Search, Send, Save, Zap,
  ExternalLink, Upload, X, AlertCircle, CheckCircle2, Eye, Mail,
} from 'lucide-react'
import {
  replaceMergeTags, resolveHeroImage, type MergeTagRep,
} from '@/lib/marketing-mailchimp'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  InlineAlert, StatusPill, formatDate, formatTime, categoryIcon,
} from './shared'

/* ── Types ─────────────────────────────────────────────────── */
export interface RepLite {
  slug:               string
  name:               string
  email:              string | null
  title:              string | null
  active:             boolean
  website_active:     boolean
  mailchimp_audience_id: string | null
  /** Subscriber count for the rep's audience (0 if not loaded / no audience). */
  subscribers:        number
  /** Free-form region label derived from office name (optional). */
  region:             string | null
}

interface Template {
  id:           number
  name:         string
  subject:      string
  preheader:    string | null
  html_content: string
  category:     string | null
  updated_at:   string
}

interface BatchCampaignResult {
  repSlug:     string
  repName:     string | null
  success:     boolean
  status:      'draft' | 'scheduled' | 'sent' | 'failed' | 'skipped'
  campaignId?: string
  webId?:      string
  editUrl?:    string | null
  error?:      string
}

interface BatchResponse {
  batchId:      string
  scheduleTime: string | null
  total:        number
  successful:   number
  failed:       number
  campaigns:    BatchCampaignResult[]
}

type Action = 'draft' | 'schedule' | 'send'

/* Generic sample rep for the on-screen resolved preview — mirrors the
 * SAMPLE_REP used by the preview-to-reps route. That one is a server-side
 * route-local const (not exported), so we define the same shape here for
 * the client preview rather than importing across the server boundary. */
const SAMPLE_REP: MergeTagRep = {
  name:      'Your Name',
  title:     'Sales Representative',
  email:     'you@pct.com',
  phone:     '(866) 724-1050',
  photo_url: '',
}

interface Props {
  reps:             RepLite[]
  mailchimpServer:  string
  /** Distinct region labels found in the rep list (for quick filter buttons). */
  regions:          string[]
}

/* ── Component ─────────────────────────────────────────────── */
export function CampaignWizard({ reps, mailchimpServer, regions }: Props) {
  const searchParams = useSearchParams()
  const initialTemplateId = Number(searchParams.get('templateId') || '') || null

  /* ── Templates ──────────────────────────────────────────── */
  const [templates, setTemplates] = useState<Template[] | null>(null)
  const [loadError, setLoadError] = useState('')
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/marketing/studio')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load templates')
        setTemplates(data.templates || [])
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : 'Failed to load templates')
      }
    })()
  }, [])

  /* ── Step state ─────────────────────────────────────────── */
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(initialTemplateId)
  const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set())
  const [previewOpen, setPreviewOpen] = useState(false)

  /* ── Step 3 fields ──────────────────────────────────────── */
  const [namePrefix, setNamePrefix] = useState('')
  const [subject, setSubject]       = useState('')
  const [preheader, setPreheader]   = useState('')
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [heroUploading, setHeroUploading] = useState(false)
  const [fromName, setFromName] = useState('Pacific Coast Title')
  const [replyToMode, setReplyToMode] = useState<'rep' | 'global'>('rep')
  const [replyToGlobal, setReplyToGlobal] = useState('info@pct.com')

  /* ── Submission ─────────────────────────────────────────── */
  const [submitting, setSubmitting] = useState<Action | null>(null)
  // Step 3 send controls: the three actions are now a selection
  // (Schedule pre-selected) → one Finalize button → a confirm modal that
  // executes the chosen action. Replaces the old instant-fire cards and
  // the Send-Now-only confirm dialog.
  const [chosenAction, setChosenAction] = useState<Action>('schedule')
  const [confirmFinalize, setConfirmFinalize] = useState(false)
  const [batchResult, setBatchResult] = useState<BatchResponse | null>(null)
  const [submitError, setSubmitError] = useState('')

  /* ── On-screen resolved email preview (Step 3, sends nothing) ─── */
  const [previewEmailOpen, setPreviewEmailOpen] = useState(false)

  /* ── Preview-to-reps (SendGrid side-channel) ────────────── */
  // Separate loading + message state so the preview button never
  // collides with the draft/schedule/send buttons.
  const [sendingPreview, setSendingPreview] = useState(false)
  const [previewMessage, setPreviewMessage] = useState('')

  /* ── Helpers ────────────────────────────────────────────── */
  const selectedTemplate = useMemo(
    () => templates?.find((t) => t.id === selectedTemplateId) || null,
    [templates, selectedTemplateId],
  )

  // Resolved email HTML for the on-screen preview: hero filled + a generic
  // sample rep merged in, using the SAME transforms the real send path
  // uses (replaceMergeTags + resolveHeroImage). The empty sample photo's
  // <img> is stripped first so it doesn't render broken. In-memory only —
  // this never sends anything.
  const resolvedPreviewHtml = useMemo(() => {
    if (!selectedTemplate) return ''
    let html = selectedTemplate.html_content
    if (!SAMPLE_REP.photo_url) {
      html = html.replace(/<img\b[^>]*\{\{rep_photo_url\}\}[^>]*\/?>/gi, '')
    }
    html = replaceMergeTags(html, SAMPLE_REP)
    html = resolveHeroImage(html, heroImageUrl)
    return html
  }, [selectedTemplate, heroImageUrl])

  // When user picks a template, prefill subject/preheader/namePrefix (only if blank).
  useEffect(() => {
    if (!selectedTemplate) return
    setSubject((s) => s || selectedTemplate.subject)
    setPreheader((p) => p || selectedTemplate.preheader || '')
    setNamePrefix((n) => n || `${selectedTemplate.name} — ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`)
  }, [selectedTemplate])

  const eligibleReps = reps.filter((r) => r.mailchimp_audience_id)

  const selectedReps = reps.filter((r) => selectedSlugs.has(r.slug) && r.mailchimp_audience_id)
  const totalSubscribers = selectedReps.reduce((sum, r) => sum + (r.subscribers || 0), 0)

  function toggleRep(slug: string, on: boolean) {
    setSelectedSlugs((prev) => {
      const next = new Set(prev)
      if (on) next.add(slug); else next.delete(slug)
      return next
    })
  }

  function selectAllEligible() {
    setSelectedSlugs(new Set(eligibleReps.map((r) => r.slug)))
  }
  function clearSelection() { setSelectedSlugs(new Set()) }
  function selectRegion(region: string) {
    const slugs = eligibleReps.filter((r) => r.region === region).map((r) => r.slug)
    setSelectedSlugs((prev) => {
      const next = new Set(prev)
      slugs.forEach((s) => next.add(s))
      return next
    })
  }

  /* ── Hero image upload ──────────────────────────────────── */
  const heroFileRef = useRef<HTMLInputElement>(null)
  async function uploadHero(file: File) {
    if (!file.type.startsWith('image/')) {
      setSubmitError('Hero image must be an image file.'); return
    }
    setHeroUploading(true); setSubmitError('')
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setHeroImageUrl(data.url)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Upload failed')
    } finally { setHeroUploading(false) }
  }

  /* ── Submit batch ──────────────────────────────────────── */
  async function submitBatch(action: Action) {
    if (!selectedTemplate) { setSubmitError('Select a template first.'); return }
    if (selectedReps.length === 0) { setSubmitError('Select at least one rep.'); return }
    if (!subject.trim()) { setSubmitError('Subject is required.'); return }
    if (!namePrefix.trim()) { setSubmitError('Campaign name prefix is required.'); return }
    if (replyToMode === 'global' && !replyToGlobal.trim()) {
      setSubmitError('Reply-To email is required when using the global option.'); return
    }

    setSubmitting(action); setSubmitError('')
    try {
      const res = await fetch('/api/admin/marketing/campaigns/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId:         selectedTemplate.id,
          repSlugs:           selectedReps.map((r) => r.slug),
          subject,
          preheader,
          heroImageUrl,
          campaignNamePrefix: namePrefix.trim(),
          fromName,
          replyToMode,
          replyToGlobal,
          action,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Batch failed')
      setBatchResult(data)
      setStep(4)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Batch failed')
    } finally {
      setSubmitting(null)
      setConfirmFinalize(false)
    }
  }

  /* ── Send preview to reps (SendGrid, not Mailchimp) ────── */
  async function sendPreviewToReps() {
    if (!selectedTemplate) { setSubmitError('Select a template first.'); return }
    if (!subject.trim()) { setSubmitError('Subject is required.'); return }

    setSendingPreview(true); setSubmitError(''); setPreviewMessage('')
    try {
      const res = await fetch('/api/admin/marketing/campaigns/preview-to-reps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId:   selectedTemplate.id,
          subject,
          heroImageUrl: heroImageUrl || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Preview send failed')
      const parts = [`Preview sent to ${data.sent} ${data.sent === 1 ? 'rep' : 'reps'}`]
      if (data.skipped_no_email > 0) parts.push(`${data.skipped_no_email} skipped (no email)`)
      if (data.failed > 0) parts.push(`${data.failed} failed`)
      setPreviewMessage(parts.join(' · '))
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Preview send failed')
    } finally {
      setSendingPreview(false)
    }
  }

  /* ── Cancel batch (success screen) ─────────────────────── */
  const [cancelling, setCancelling] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelMessage, setCancelMessage] = useState('')
  async function cancelBatch() {
    if (!batchResult) return
    setCancelling(true); setCancelMessage('')
    try {
      const res = await fetch(`/api/admin/marketing/campaigns/batch/${batchResult.batchId}/cancel`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Cancel failed')
      setCancelMessage(`${data.cancelled} cancelled · ${data.failed} failed · ${data.skipped} already settled.`)
    } catch (e) {
      setCancelMessage(e instanceof Error ? e.message : 'Cancel failed')
    } finally {
      setCancelling(false)
      setCancelOpen(false)
    }
  }

  /* ── Render ────────────────────────────────────────────── */
  return (
    <div className="space-y-5 max-w-5xl">
      <ProgressBar step={step} />

      {loadError && <InlineAlert kind="error" message={loadError} />}
      {submitError && <InlineAlert kind="error" message={submitError} onClose={() => setSubmitError('')} />}
      {previewMessage && <InlineAlert kind="success" message={previewMessage} onClose={() => setPreviewMessage('')} />}

      {step === 1 && (
        <Step1
          templates={templates}
          selectedId={selectedTemplateId}
          onSelect={setSelectedTemplateId}
          onPreview={() => setPreviewOpen(true)}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <Step2
          reps={reps}
          regions={regions}
          selected={selectedSlugs}
          onToggle={toggleRep}
          onSelectAll={selectAllEligible}
          onClear={clearSelection}
          onSelectRegion={selectRegion}
          totalSubscribers={totalSubscribers}
          eligibleCount={eligibleReps.length}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && selectedTemplate && (
        <Step3
          template={selectedTemplate}
          selectedReps={selectedReps}
          namePrefix={namePrefix} setNamePrefix={setNamePrefix}
          subject={subject} setSubject={setSubject}
          preheader={preheader} setPreheader={setPreheader}
          heroImageUrl={heroImageUrl} setHeroImageUrl={setHeroImageUrl}
          heroUploading={heroUploading}
          onPickHero={() => heroFileRef.current?.click()}
          fromName={fromName} setFromName={setFromName}
          replyToMode={replyToMode} setReplyToMode={setReplyToMode}
          replyToGlobal={replyToGlobal} setReplyToGlobal={setReplyToGlobal}
          submitting={submitting}
          sendingPreview={sendingPreview}
          onSendPreview={sendPreviewToReps}
          chosenAction={chosenAction}
          setChosenAction={setChosenAction}
          onFinalize={() => setConfirmFinalize(true)}
          onPreviewEmail={() => setPreviewEmailOpen(true)}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && batchResult && (
        <Step4
          result={batchResult}
          mailchimpServer={mailchimpServer}
          cancelOpen={cancelOpen} setCancelOpen={setCancelOpen}
          cancelling={cancelling}
          cancelMessage={cancelMessage}
          onCancel={cancelBatch}
        />
      )}

      {/* Hidden file input for hero upload */}
      <input ref={heroFileRef} type="file" accept="image/*" hidden
             onChange={(e) => {
               const f = e.target.files?.[0]
               if (f) uploadHero(f)
               e.target.value = ''
             }} />

      {/* Step 1 preview dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.name || 'Template preview'}</DialogTitle>
          </DialogHeader>
          {selectedTemplate ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Subject: <span className="text-gray-800 font-medium">{selectedTemplate.subject}</span></p>
              <iframe title="preview"
                      srcDoc={selectedTemplate.html_content}
                      sandbox="allow-same-origin"
                      className="w-full bg-white border border-gray-200 rounded-xl" style={{ height: 540 }} />
            </div>
          ) : (
            <p className="text-sm text-gray-500">Select a template first.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Resolved email preview (Step 3) — hero + sample rep merged.
          Sends nothing; on-screen only. Separate from the Step 1 raw
          template dialog above. */}
      <Dialog open={previewEmailOpen} onOpenChange={setPreviewEmailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Email preview (with sample rep)</DialogTitle>
          </DialogHeader>
          {selectedTemplate ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">
                Subject: <span className="text-gray-800 font-medium">{subject || selectedTemplate.subject}</span>
              </p>
              <p className="text-[11px] text-gray-400">
                Rep details shown are a sample; each rep&apos;s real info merges at send.
              </p>
              <iframe title="resolved-preview"
                      srcDoc={resolvedPreviewHtml}
                      sandbox="allow-same-origin"
                      className="w-full bg-white border border-gray-200 rounded-xl" style={{ height: 540 }} />
            </div>
          ) : (
            <p className="text-sm text-gray-500">Select a template first.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Finalize confirmation — generalized over the chosen action. */}
      <AlertDialog open={confirmFinalize} onOpenChange={setConfirmFinalize}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {chosenAction === 'send'  ? 'Send immediately?'
               : chosenAction === 'draft' ? 'Save as draft?'
               : 'Schedule this campaign?'}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold ${
                  chosenAction === 'send'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-[#03374f]/10 text-[#03374f]'
                }`}>
                  {chosenAction === 'send' ? 'SEND IMMEDIATELY'
                   : chosenAction === 'draft' ? 'SAVE AS DRAFT'
                   : 'SCHEDULE'}
                </div>
                <dl className="space-y-1 text-gray-600">
                  <div className="flex gap-2"><dt className="text-gray-400 w-24 shrink-0">Template</dt><dd className="font-medium text-[#03374f]">{selectedTemplate?.name}</dd></div>
                  <div className="flex gap-2"><dt className="text-gray-400 w-24 shrink-0">Subject</dt><dd className="font-medium text-[#03374f]">{subject || selectedTemplate?.subject}</dd></div>
                  <div className="flex gap-2"><dt className="text-gray-400 w-24 shrink-0">Recipients</dt><dd className="font-medium text-[#03374f]">{selectedReps.length} {selectedReps.length === 1 ? 'rep' : 'reps'} · ~{totalSubscribers.toLocaleString()} subscribers</dd></div>
                  {chosenAction === 'schedule' && (
                    <div className="flex gap-2"><dt className="text-gray-400 w-24 shrink-0">Goes out</dt><dd className="font-medium text-[#03374f]">~{scheduleEtaLabel()} (about 30 min from now)</dd></div>
                  )}
                </dl>
                {chosenAction === 'send' && (
                  <p className="text-red-600 font-medium">This sends right away — there is no cancel window once sent.</p>
                )}
                {chosenAction === 'draft' && (
                  <p className="text-gray-500">Drafts are created in Mailchimp for you to review and send manually.</p>
                )}
                {chosenAction === 'schedule' && (
                  <p className="text-gray-500">You can cancel any time before the send time from the results screen.</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => submitBatch(chosenAction)}
              className={chosenAction === 'send'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-[#03374f] hover:bg-[#03374f]/90 text-white'}
            >
              {submitting === chosenAction
                ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Working…</>
                : chosenAction === 'send' ? 'Yes, send now'
                  : chosenAction === 'draft' ? 'Save draft'
                  : 'Schedule it'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/** Local-time label ~30 min from now for the schedule confirmation. */
function scheduleEtaLabel(): string {
  return new Date(Date.now() + 30 * 60 * 1000).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  })
}

/* ══════════════════════════════════════════════════════════════ */
/* PROGRESS BAR                                                    */
/* ══════════════════════════════════════════════════════════════ */
function ProgressBar({ step }: { step: 1 | 2 | 3 | 4 }) {
  const steps = [
    { n: 1, label: 'Template' },
    { n: 2, label: 'Recipients' },
    { n: 3, label: 'Review' },
  ]
  return (
    <div className="flex items-center justify-center gap-2 text-xs font-medium">
      {steps.map((s, i) => {
        const active   = step === s.n
        const complete = step > s.n || step === 4
        return (
          <div key={s.n} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
              active ? 'bg-[#03374f] text-white' :
              complete ? 'bg-emerald-100 text-emerald-700' :
              'bg-gray-100 text-gray-400'
            }`}>
              <span className="w-5 h-5 rounded-full bg-white/20 inline-flex items-center justify-center">
                {complete ? <Check className="w-3 h-3" /> : s.n}
              </span>
              <span>{s.label}</span>
            </div>
            {i < steps.length - 1 && <ChevronRight className="w-3 h-3 text-gray-400" />}
          </div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════ */
/* STEP 1 — Choose Template                                        */
/* ══════════════════════════════════════════════════════════════ */
function Step1({
  templates, selectedId, onSelect, onPreview, onNext,
}: {
  templates: Template[] | null
  selectedId: number | null
  onSelect: (id: number) => void
  onPreview: () => void
  onNext: () => void
}) {
  return (
    <Card className="p-6 space-y-5">
      <div>
        <h2 className="font-semibold text-[#03374f]">Choose a template</h2>
        <p className="text-xs text-gray-500 mt-1">Pick the email design you want to send.</p>
      </div>

      {templates === null ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl bg-gray-200" />)}
        </div>
      ) : templates.length === 0 ? (
        <p className="text-sm text-gray-500">No templates yet. <Link href="/admin/team/marketing/templates" className="text-[#f26b2b] hover:underline">Create one →</Link></p>
      ) : (
        <RadioGroup value={selectedId ? String(selectedId) : ''}
                    onValueChange={(v) => onSelect(Number(v))}
                    className="space-y-2">
          {templates.map((t) => {
            const isSel = t.id === selectedId
            return (
              <label key={t.id}
                     className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                       isSel ? 'border-[#f26b2b] bg-[#f26b2b]/5 shadow-sm'
                             : 'border-gray-200 hover:border-gray-300'
                     }`}>
                <RadioGroupItem value={String(t.id)} className="mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span>{categoryIcon(t.category)}</span>
                    <p className="font-semibold text-[#03374f]">{t.name}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{t.subject}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Updated {formatDate(t.updated_at)}</p>
                </div>
              </label>
            )
          })}
        </RadioGroup>
      )}

      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" disabled={!selectedId} onClick={onPreview}>
          <Eye className="w-4 h-4 mr-1.5" /> Preview template
        </Button>
        <div className="flex items-center gap-2">
          <Link href="/admin/team/marketing"><Button variant="outline">Cancel</Button></Link>
          <Button disabled={!selectedId} onClick={onNext}
                  className="bg-[#03374f] hover:bg-[#03374f]/90 text-white">
            Next: Recipients <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════ */
/* STEP 2 — Recipients                                             */
/* ══════════════════════════════════════════════════════════════ */
function Step2({
  reps, regions, selected, onToggle, onSelectAll, onClear, onSelectRegion,
  totalSubscribers, eligibleCount, onBack, onNext,
}: {
  reps: RepLite[]
  regions: string[]
  selected: Set<string>
  onToggle: (slug: string, on: boolean) => void
  onSelectAll: () => void
  onClear: () => void
  onSelectRegion: (region: string) => void
  totalSubscribers: number
  eligibleCount: number
  onBack: () => void
  onNext: () => void
}) {
  const [search, setSearch] = useState('')
  const filtered = reps.filter((r) =>
    !search ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.title || '').toLowerCase().includes(search.toLowerCase()),
  )
  const selectedCount = [...selected].filter((s) => reps.find((r) => r.slug === s && r.mailchimp_audience_id)).length

  return (
    <Card className="p-6 space-y-5">
      <div>
        <h2 className="font-semibold text-[#03374f]">Choose recipients</h2>
        <p className="text-xs text-gray-500 mt-1">One campaign will be created per selected rep, targeting their Mailchimp audience.</p>
      </div>

      {/* Quick selections */}
      <div className="space-y-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quick selections</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onSelectAll}>
            All Active Reps ({eligibleCount})
          </Button>
          {regions.map((r) => {
            const count = reps.filter((x) => x.region === r && x.mailchimp_audience_id).length
            return (
              <Button key={r} variant="outline" size="sm" onClick={() => onSelectRegion(r)}>
                {r} ({count})
              </Button>
            )
          })}
          {selected.size > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear} className="text-gray-500">
              Clear selection
            </Button>
          )}
        </div>
      </div>

      {/* Search + list */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search reps…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <div className="max-h-[400px] overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 p-4">No reps match your search.</p>
          ) : filtered.map((r) => {
            const eligible = !!r.mailchimp_audience_id
            const isSel    = selected.has(r.slug)
            return (
              <label key={r.slug}
                     className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                       eligible ? 'hover:bg-gray-50/60 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                     }`}>
                <Checkbox checked={isSel} disabled={!eligible}
                          onCheckedChange={(v) => onToggle(r.slug, v === true)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#03374f] truncate">{r.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">
                    {r.title || '—'}
                    {r.region && <> · {r.region}</>}
                  </p>
                </div>
                <p className="text-xs text-gray-500 whitespace-nowrap">
                  {eligible ? `${r.subscribers.toLocaleString()} subs` : 'no audience'}
                </p>
              </label>
            )
          })}
        </div>

        <p className="text-xs text-gray-500">
          Selected: <span className="font-semibold text-[#03374f]">{selectedCount}</span> {selectedCount === 1 ? 'rep' : 'reps'} ·{' '}
          <span className="font-semibold text-[#03374f]">{totalSubscribers.toLocaleString()}</span> total subscribers
        </p>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
        </Button>
        <Button disabled={selectedCount === 0} onClick={onNext}
                className="bg-[#03374f] hover:bg-[#03374f]/90 text-white">
          Next: Review <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </Card>
  )
}

/* ══════════════════════════════════════════════════════════════ */
/* STEP 3 — Review & Send                                          */
/* ══════════════════════════════════════════════════════════════ */
function Step3({
  template, selectedReps,
  namePrefix, setNamePrefix,
  subject, setSubject,
  preheader, setPreheader,
  heroImageUrl, setHeroImageUrl,
  heroUploading, onPickHero,
  fromName, setFromName,
  replyToMode, setReplyToMode,
  replyToGlobal, setReplyToGlobal,
  submitting,
  sendingPreview, onSendPreview,
  chosenAction, setChosenAction, onFinalize, onPreviewEmail,
  onBack,
}: {
  template: Template
  selectedReps: RepLite[]
  namePrefix: string; setNamePrefix: (v: string) => void
  subject: string; setSubject: (v: string) => void
  preheader: string; setPreheader: (v: string) => void
  heroImageUrl: string; setHeroImageUrl: (v: string) => void
  heroUploading: boolean; onPickHero: () => void
  fromName: string; setFromName: (v: string) => void
  replyToMode: 'rep' | 'global'; setReplyToMode: (v: 'rep' | 'global') => void
  replyToGlobal: string; setReplyToGlobal: (v: string) => void
  submitting: Action | null
  sendingPreview: boolean
  onSendPreview: () => void
  chosenAction: Action
  setChosenAction: (a: Action) => void
  onFinalize: () => void
  onPreviewEmail: () => void
  onBack: () => void
}) {
  const previewCount = 5
  const extraNames   = Math.max(0, selectedReps.length - previewCount)

  return (
    <div className="space-y-5">
      {/* Summary */}
      <Card className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-semibold text-[#03374f]">Campaign details</h2>
          {/* On-screen resolved preview of the piece being reviewed. Sends
              nothing — distinct from "Send preview to reps" in the footer. */}
          <Button variant="outline" size="sm" onClick={onPreviewEmail} disabled={!template}
                  className="border-[#03374f] text-[#03374f] hover:bg-[#03374f]/5 shrink-0">
            <Eye className="w-4 h-4 mr-1.5" /> Preview email
          </Button>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <Field label="Template" value={template.name} />
          <Field label="Recipients" value={`${selectedReps.length} ${selectedReps.length === 1 ? 'rep' : 'reps'}`} />
          <Field label="Subscribers"
                 value={selectedReps.reduce((s, r) => s + r.subscribers, 0).toLocaleString()} />
        </dl>
      </Card>

      {/* Campaign Settings */}
      <Card className="p-5 space-y-5">
        <h2 className="font-semibold text-[#03374f]">Campaign settings</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="cn-prefix" className="text-xs text-gray-500">Campaign Name Prefix *</Label>
            <Input id="cn-prefix" value={namePrefix} onChange={(e) => setNamePrefix(e.target.value)}
                   placeholder="Spring 2026 Update" className="mt-1" />
            <p className="text-[11px] text-gray-400 mt-1">
              Each rep&apos;s campaign will be named: <code className="font-mono">{namePrefix || 'PREFIX'} — Rep Name</code>
            </p>
          </div>
          <div>
            <Label htmlFor="cn-subject" className="text-xs text-gray-500">Subject *</Label>
            <Input id="cn-subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="cn-preheader" className="text-xs text-gray-500">Preheader</Label>
            <Input id="cn-preheader" value={preheader} onChange={(e) => setPreheader(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="cn-from" className="text-xs text-gray-500">From Name</Label>
            <Input id="cn-from" value={fromName} onChange={(e) => setFromName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-gray-500">Reply-To</Label>
            <RadioGroup value={replyToMode} onValueChange={(v: 'rep' | 'global') => setReplyToMode(v)}
                        className="mt-1 space-y-1.5">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <RadioGroupItem value="rep" />
                Each rep&apos;s email
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <RadioGroupItem value="global" />
                <span className="flex items-center gap-2">
                  <Input value={replyToGlobal} onChange={(e) => setReplyToGlobal(e.target.value)}
                         placeholder="info@pct.com"
                         disabled={replyToMode !== 'global'} className="h-8 w-44" />
                </span>
              </label>
            </RadioGroup>
          </div>
        </div>

        {/* Hero image */}
        <div>
          <Label className="text-xs text-gray-500">
            Hero Image <span className="text-gray-400">(replaces <code className="font-mono">{'{{HERO_IMAGE}}'}</code> in template)</span>
          </Label>
          {heroImageUrl ? (
            <div className="mt-2 flex items-start gap-3">
              <img src={heroImageUrl} alt="Hero preview" className="w-48 h-28 object-cover rounded-lg border border-gray-200" />
              <div className="space-y-1">
                <p className="text-xs text-gray-500 break-all max-w-md">{heroImageUrl}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onPickHero}>Replace</Button>
                  <Button variant="ghost" size="sm" onClick={() => setHeroImageUrl('')} className="text-red-600">
                    <X className="w-3.5 h-3.5 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <button type="button" onClick={onPickHero} disabled={heroUploading}
                    className="mt-2 w-full rounded-xl border-2 border-dashed border-gray-200 bg-[#f8f6f3] hover:border-[#f26b2b] hover:bg-[#f26b2b]/5 transition-colors py-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              {heroUploading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</>
                : <><Upload className="w-4 h-4" /> Click to upload hero image</>}
            </button>
          )}
        </div>
      </Card>

      {/* Campaign preview list */}
      <Card className="p-5 space-y-2">
        <h2 className="font-semibold text-[#03374f] text-sm">Campaigns to be created</h2>
        <ul className="text-sm text-gray-600 space-y-1">
          {selectedReps.slice(0, previewCount).map((r) => (
            <li key={r.slug} className="flex items-center gap-2">
              <span className="text-gray-400">•</span>
              <code className="font-mono text-xs">{namePrefix || 'PREFIX'} — {r.name}</code>
            </li>
          ))}
          {extraNames > 0 && (
            <li className="text-xs text-gray-400 pl-4">… and {extraNames} more</li>
          )}
        </ul>
      </Card>

      {/* Send action selection — pick one, then Finalize to confirm. The
          cards no longer fire on click; only the confirm modal sends. */}
      <div>
        <h2 className="font-semibold text-[#03374f] text-sm mb-2">Choose what happens on finalize</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SendOption
            icon={<Save className="w-5 h-5" />}
            title="Save as Draft"
            desc="Create drafts in Mailchimp. Review and send manually from there."
            selected={chosenAction === 'draft'}
            onSelect={() => setChosenAction('draft')}
          />
          <SendOption
            icon={<Send className="w-5 h-5" />}
            title="Schedule (recommended)"
            desc="Schedule for ~30 minutes from now. Cancel anytime before send."
            selected={chosenAction === 'schedule'}
            onSelect={() => setChosenAction('schedule')}
            recommended
          />
          <SendOption
            icon={<Zap className="w-5 h-5" />}
            title="Send Immediately"
            desc="Sends right away. No cancel window."
            selected={chosenAction === 'send'}
            onSelect={() => setChosenAction('send')}
            danger
          />
        </div>
      </div>

      {/* Finalize — opens the confirmation modal for the chosen action. */}
      <div className="flex justify-end">
        <Button
          onClick={onFinalize}
          disabled={submitting !== null}
          className="bg-[#03374f] hover:bg-[#03374f]/90 text-white"
        >
          <Check className="w-4 h-4 mr-1.5" />
          {chosenAction === 'send' ? 'Finalize & Send Now'
           : chosenAction === 'draft' ? 'Finalize & Save Draft'
           : 'Finalize & Schedule'}
        </Button>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-gray-100 mt-1">
        <Button variant="outline" onClick={onBack} disabled={submitting !== null || sendingPreview} className="mt-3">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
        </Button>

        {/* Secondary action — SendGrid preview to the sales team. Mail icon
            + footer placement keep it distinct from the top "Preview email"
            (Eye, on-screen only) and from the Mailchimp finalize flow. */}
        <Button
          variant="outline"
          onClick={onSendPreview}
          disabled={!template || sendingPreview || submitting !== null}
          className="border-[#03374f] text-[#03374f] hover:bg-[#03374f]/5 mt-3"
          title="Email this campaign piece to the sales team via SendGrid (not Mailchimp)"
        >
          {sendingPreview
            ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Sending preview…</>
            : <><Mail className="w-4 h-4 mr-1.5" /> Send preview to reps</>}
        </Button>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] text-gray-400 uppercase tracking-wider">{label}</dt>
      <dd className="text-sm font-semibold text-[#03374f] mt-0.5">{value}</dd>
    </div>
  )
}

function SendOption({
  icon, title, desc, selected, onSelect, recommended, danger,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  selected: boolean
  onSelect: () => void
  recommended?: boolean
  danger?: boolean
}) {
  const accent = recommended
    ? 'border-[#f26b2b] bg-[#f26b2b]/5 hover:bg-[#f26b2b]/10'
    : danger
      ? 'border-red-200 hover:border-red-300 hover:bg-red-50/40'
      : 'border-gray-200 hover:bg-gray-50'
  // Selection wins over the base accent: a navy ring marks the chosen card.
  const selRing = selected ? 'ring-2 ring-[#03374f] border-[#03374f] bg-[#03374f]/5' : accent
  return (
    <button type="button" onClick={onSelect} aria-pressed={selected}
            className={`relative text-left rounded-xl border p-4 transition-all ${selRing}`}>
      <div className={`flex items-center gap-2 mb-2 ${
        recommended ? 'text-[#f26b2b]' : danger ? 'text-red-600' : 'text-[#03374f]'
      }`}>
        {icon}
        <p className="font-semibold text-sm">{title}</p>
        {recommended && (
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wide bg-[#f26b2b] text-white px-1.5 py-0.5 rounded">
            Recommended
          </span>
        )}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
      {selected && !recommended && (
        <span className="absolute top-2.5 right-2.5 text-[#03374f]">
          <Check className="w-4 h-4" />
        </span>
      )}
    </button>
  )
}

/* ══════════════════════════════════════════════════════════════ */
/* STEP 4 — Success                                                */
/* ══════════════════════════════════════════════════════════════ */
function Step4({
  result, mailchimpServer,
  cancelOpen, setCancelOpen, cancelling, cancelMessage, onCancel,
}: {
  result: BatchResponse
  mailchimpServer: string
  cancelOpen: boolean
  setCancelOpen: (v: boolean) => void
  cancelling: boolean
  cancelMessage: string
  onCancel: () => void
}) {
  const failed   = result.campaigns.filter((c) => !c.success)
  const ok       = result.campaigns.filter((c) =>  c.success)
  const scheduledTime = result.scheduleTime

  return (
    <div className="space-y-5">
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-[#03374f]">
              {result.successful} of {result.total} campaigns created
            </h2>
            {scheduledTime && (
              <p className="text-sm text-gray-600 mt-1">
                Scheduled for {formatDate(scheduledTime)} at {formatTime(scheduledTime)}. Cancel anytime before that.
              </p>
            )}
          </div>
        </div>

        {cancelMessage && (
          <div className="mt-4">
            <InlineAlert kind="info" message={cancelMessage} />
          </div>
        )}
      </Card>

      {/* Per-rep results */}
      <Card className="p-0 gap-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#03374f]">Campaigns</h3>
          <Link href={`/admin/team/marketing/history/${result.batchId}`}
                className="text-xs text-[#f26b2b] hover:underline">View batch details →</Link>
        </div>
        <ul className="divide-y divide-gray-50 max-h-[420px] overflow-y-auto">
          {ok.map((c) => (
            <li key={c.repSlug} className="flex items-center justify-between px-5 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <StatusPill status={c.status} size="xs" />
                <span className="text-sm text-[#03374f] truncate">{c.repName || c.repSlug}</span>
              </div>
              {c.editUrl && (
                <a href={c.editUrl} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-1 text-xs text-[#f26b2b] hover:underline whitespace-nowrap">
                  Edit in Mailchimp <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </li>
          ))}
          {failed.map((c) => (
            <li key={c.repSlug} className="flex items-start justify-between px-5 py-2.5 bg-red-50/30">
              <div className="flex items-start gap-2 min-w-0">
                <StatusPill status={c.status} size="xs" />
                <div className="min-w-0">
                  <p className="text-sm text-[#03374f] truncate">{c.repName || c.repSlug}</p>
                  {c.error && <p className="text-[11px] text-red-600 mt-0.5">{c.error}</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        {result.campaigns.some((c) => c.status === 'scheduled') && (
          <Button variant="outline" onClick={() => setCancelOpen(true)} disabled={cancelling}
                  className="text-red-600 border-red-200 hover:bg-red-50">
            {cancelling
              ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Cancelling…</>
              : <>Cancel this batch</>}
          </Button>
        )}
        <Link href={`/admin/team/marketing/history/${result.batchId}`}>
          <Button variant="outline">View in History</Button>
        </Link>
        <Link href="/admin/team/marketing/campaigns/new">
          <Button className="bg-[#03374f] hover:bg-[#03374f]/90 text-white">
            Create another campaign
          </Button>
        </Link>
      </div>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel scheduled campaigns?</AlertDialogTitle>
            <AlertDialogDescription>
              Any campaigns still scheduled in this batch will be unscheduled in Mailchimp and marked cancelled. Already-sent campaigns are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep them</AlertDialogCancel>
            <AlertDialogAction onClick={onCancel} className="bg-red-600 hover:bg-red-700 text-white">
              Cancel batch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unused mailchimpServer suppress (still passed for future use) */}
      <span className="hidden">{mailchimpServer}</span>
    </div>
  )
}
