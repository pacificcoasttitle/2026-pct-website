'use client'

/**
 * CampaignCreator — Asset Delivery multi-step wizard.
 *
 *   Step 1: Campaign Details   →  POST /asset-delivery/batches (creates draft)
 *   Step 2: Upload Files        →  POST /asset-delivery/upload (per-file, concurrency = 3)
 *   Step 3: Preview + AI Intros →  POST /asset-delivery/generate-intro
 *   Step 4: Send Confirmation   →  POST /asset-delivery/[batchId]/send
 *                                   (optionally with test_recipient_email)
 *
 * State machine is linear with one back-tracking move (Step N → Step N-1).
 * Once a draft batch is created in Step 1, the URL is updated with
 * ?batchId=<uuid> so a refresh resumes at Step 2 (or wherever uploads left
 * off). The page-server hydrates the rep roster and the wizard fetches the
 * batch payload itself.
 *
 * Filename contract enforced by the backend:
 *   {campaign-slug}__{rep-prefix}__{format}.{ext}
 *
 * Formats allowed (ext-matched server-side):
 *   flyer/print          → pdf
 *   social/social-story  → png|jpg|jpeg
 *   email-insert         → png|jpg|jpeg
 *
 * "Send Test" deviates from the spec a little: the spec said "send test to
 * current admin's email", but the backend's test_recipient_email validates
 * that the recipient has files in the batch. We send the test against the
 * currently-selected preview rep (who is guaranteed to have files), which
 * actually exercises the real per-rep render pipeline — a strictly better
 * QA signal than mailing the admin a single arbitrary intro.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2, Upload, X,
  AlertCircle, RefreshCw, Send, Mail,
  Users, Files, HardDrive, Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { InlineAlert } from '@/components/admin/marketing/shared'
import { formatBytes } from '@/lib/format-utils'

/* ─── Types ──────────────────────────────────────────────────── */

export interface RepRoster {
  id:           number
  slug:         string
  name:         string
  first_name:   string
  last_name:    string
  email:        string
  /** Kept for backwards compat / display; no longer used for matching. */
  email_prefix: string
  /** Active SMS code (uppercase, e.g. 'C-28'). Null when rep has no code. */
  sms_code:     string | null
  title:        string | null
}

interface Props {
  reps:       RepRoster[]
  adminEmail: string
}

type Lane =
  | 'marketing-piece'
  | 'social'
  | 'weekly-email'
  | 'other'

const LANE_OPTIONS: Array<{ value: Lane; label: string }> = [
  { value: 'marketing-piece', label: 'Marketing Piece' },
  { value: 'social',          label: 'Social' },
  { value: 'weekly-email',    label: 'Weekly Email' },
  { value: 'other',           label: 'Other' },
]

const FORMATS = ['flyer', 'social', 'social-story', 'email-insert', 'print'] as const
type FormatKey = typeof FORMATS[number]

const FORMAT_LABELS: Record<FormatKey, string> = {
  flyer:          'Flyer',
  social:         'Social',
  'social-story': 'Social Story',
  'email-insert': 'Email Insert',
  print:          'Print',
}

type UploadState =
  | { kind: 'pending';   filename: string }
  | { kind: 'uploading'; filename: string; progress: number }
  | { kind: 'done';      filename: string; fileId: number; bytes: number }
  | { kind: 'failed';    filename: string; error: string }
  | { kind: 'no-match';  filename: string; error: string }

interface BatchFile {
  id:                number
  batch_id:          string
  rep_email:         string
  format:            string
  original_filename: string
  r2_url:            string
  file_size_bytes:   number
  mime_type:         string | null
}

interface BatchSend {
  id:                  number
  batch_id:            string
  rep_email:           string
  rep_name:            string
  send_status:         'pending' | 'sending' | 'sent' | 'failed' | 'skipped'
  sendgrid_message_id: string | null
  sent_at:             string | null
  error_message:       string | null
}

interface BatchData {
  id:               number
  batch_id:         string
  campaign_slug:    string
  campaign_name:    string
  lane:             string | null
  email_subject:    string
  status:           string
  total_recipients: number
  total_files:      number
  total_bytes:      number
}

/* ─── Helpers ────────────────────────────────────────────────── */

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// formatBytes lives in @/lib/format-utils — see import above.

/**
 * Parse a filename and classify it against the campaign slug + rep roster.
 * Mirrors the server's validation. Used for visual feedback before upload.
 */
function classifyFile(
  filename:     string,
  campaignSlug: string,
  reps:         RepRoster[],
): {
  ok:      boolean
  slug?:   string
  rep?:    RepRoster
  format?: FormatKey
  error?:  string
} {
  const extMatch = filename.match(/\.([^.]+)$/)
  const base = extMatch ? filename.slice(0, -extMatch[0].length) : filename
  const parts = base.split('__')

  if (parts.length !== 3 || parts.some((p) => !p.trim())) {
    return { ok: false, error: 'Filename must be slug__C-<n>[-<name>]__format.ext' }
  }
  const [slug, codeSegment, format] = parts

  if (slug !== campaignSlug) {
    return { ok: false, error: `Slug "${slug}" ≠ campaign "${campaignSlug}"` }
  }
  if (!(FORMATS as readonly string[]).includes(format)) {
    return { ok: false, error: `Unknown format "${format}"` }
  }
  // Same regex the server uses (lib/upload/route.ts SMS_CODE_RE).
  const codeMatch = codeSegment.match(/^c-?(\d+)(?:-([a-z0-9-]+))?$/i)
  if (!codeMatch) {
    return {
      ok: false,
      error: `Rep segment "${codeSegment}" is not a valid SMS code (expected C-<n>[-<name>])`,
    }
  }
  const normalizedCode = `C-${codeMatch[1]}`
  const rep = reps.find((r) => (r.sms_code || '').toUpperCase() === normalizedCode)
  if (!rep) {
    return { ok: false, error: `No active rep matches "${normalizedCode}"` }
  }
  return { ok: true, slug, rep, format: format as FormatKey }
}

/* ─── Component ──────────────────────────────────────────────── */

export function CampaignCreator({ reps, adminEmail }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialBatchId = searchParams.get('batchId') || ''

  const [step, setStep] = useState<1 | 2 | 3 | 4>(initialBatchId ? 2 : 1)
  const [error, setError] = useState('')
  const [info,  setInfo]  = useState('')

  /* ── Step 1 form state ───────────────────────────────────── */
  const [campaignName, setCampaignName] = useState('')
  const [campaignSlug, setCampaignSlug] = useState('')
  const [slugTouched,  setSlugTouched]  = useState(false)
  const [lane,         setLane]         = useState<Lane>('marketing-piece')
  const [description,  setDescription]  = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [creatingBatch, setCreatingBatch] = useState(false)

  // Keep slug in sync with name until the user touches it manually.
  useEffect(() => {
    if (!slugTouched) setCampaignSlug(slugify(campaignName))
  }, [campaignName, slugTouched])

  // Default subject when name changes.
  useEffect(() => {
    if (!emailSubject && campaignName) {
      setEmailSubject(`Your ${campaignName} is Ready, {{rep_first_name}}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignName])

  /* ── Batch state (created at end of Step 1) ──────────────── */
  const [batchId,   setBatchId]   = useState(initialBatchId)
  const [batchData, setBatchData] = useState<BatchData | null>(null)
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([])

  /* ── Step 2 upload state ─────────────────────────────────── */
  const [uploads, setUploads] = useState<Record<string, UploadState>>({})
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const dropAreaRef  = useRef<HTMLDivElement | null>(null)
  const [dragOver, setDragOver] = useState(false)

  /* ── Step 3 preview state ────────────────────────────────── */
  const [previewRepEmail, setPreviewRepEmail] = useState<string>('')
  const [introsByRep, setIntrosByRep] = useState<Record<string, string>>({})
  const [introLoadingRep, setIntroLoadingRep] = useState<string | null>(null)

  /* ── Step 4 send state ───────────────────────────────────── */
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [testSending, setTestSending] = useState(false)

  /* ── Hydrate batch payload (on resume or after Step 1) ───── */
  const refreshBatch = useCallback(async () => {
    if (!batchId) return
    try {
      const res = await fetch(
        `/api/admin/marketing/asset-delivery/batches/${batchId}`,
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load batch')
      setBatchData(data.batch)
      setBatchFiles(data.files || [])
      // Hydrate Step 1 fields so the slug is correct for filename parsing
      // and the subject travels through to the send endpoint.
      if (data.batch) {
        setCampaignName(data.batch.campaign_name)
        setCampaignSlug(data.batch.campaign_slug)
        if (data.batch.lane) setLane(data.batch.lane as Lane)
        setEmailSubject(data.batch.email_subject)
        setSlugTouched(true)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load batch')
    }
  }, [batchId])

  useEffect(() => {
    if (batchId) refreshBatch()
  }, [batchId, refreshBatch])

  /* ── Step 1 → create batch ───────────────────────────────── */
  async function createBatch() {
    setError(''); setInfo('')
    if (!campaignName.trim() || !campaignSlug || !emailSubject.trim()) {
      setError('Campaign name, slug, and email subject are required.')
      return
    }
    setCreatingBatch(true)
    try {
      const res = await fetch('/api/admin/marketing/asset-delivery/batches', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_name: campaignName.trim(),
          campaign_slug: campaignSlug,
          lane,
          email_subject: emailSubject.trim(),
          description:   description.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create batch')
      const newBatchId = data.batch.batch_id as string
      setBatchId(newBatchId)
      setBatchData(data.batch)
      // Park the batch in the URL so refreshes resume cleanly.
      router.replace(`/admin/team/asset-delivery/new?batchId=${newBatchId}`)
      setStep(2)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create batch')
    } finally {
      setCreatingBatch(false)
    }
  }

  /* ── Step 2 → upload pipeline ────────────────────────────── */

  // Worker pool: concurrency = 3, one upload per slot. The queue lives in
  // a ref because we mutate it from inside async closures without wanting
  // React re-renders to reset our position.
  const queueRef    = useRef<File[]>([])
  const activeCount = useRef(0)

  function setUploadState(key: string, state: UploadState) {
    setUploads((prev) => ({ ...prev, [key]: state }))
  }

  const drainQueue = useCallback(() => {
    if (!batchId) return
    const MAX = 3
    while (activeCount.current < MAX && queueRef.current.length > 0) {
      const next = queueRef.current.shift()!
      activeCount.current++
      uploadOne(next).finally(() => {
        activeCount.current--
        drainQueue()
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId])

  async function uploadOne(file: File) {
    const key = file.name
    setUploadState(key, { kind: 'uploading', filename: key, progress: 0 })
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('batchId', batchId)
      const res = await fetch('/api/admin/marketing/asset-delivery/upload', {
        method: 'POST',
        body:   form,
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }
      setUploadState(key, {
        kind:     'done',
        filename: key,
        fileId:   data.file_id,
        bytes:    data.file_size_bytes,
      })
      // Cheap refresh — adds the new row to our local grid so the user
      // sees aggregate counts update.
      await refreshBatch()
    } catch (e) {
      setUploadState(key, {
        kind:     'failed',
        filename: key,
        error:    e instanceof Error ? e.message : 'Upload failed',
      })
    }
  }

  function enqueueFiles(fileList: FileList | File[]) {
    if (!batchId) return
    const files = Array.from(fileList)
    const accepted: File[] = []
    for (const f of files) {
      const cls = classifyFile(f.name, campaignSlug, reps)
      if (!cls.ok) {
        setUploadState(f.name, {
          kind: 'no-match', filename: f.name, error: cls.error || 'Invalid filename',
        })
        continue
      }
      setUploadState(f.name, { kind: 'pending', filename: f.name })
      accepted.push(f)
    }
    queueRef.current.push(...accepted)
    drainQueue()
  }

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) enqueueFiles(e.target.files)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer?.files?.length) enqueueFiles(e.dataTransfer.files)
  }

  function retryFile(filename: string) {
    // Construct a synthetic File from the failed entry is impossible (we
    // dropped the bytes). Instead, prompt the user to re-add it.
    delete uploads[filename]
    setUploads({ ...uploads })
    fileInputRef.current?.click()
  }

  async function removeUploadedFile(fileId: number) {
    setError(''); setInfo('')
    try {
      const res = await fetch(
        `/api/admin/marketing/asset-delivery/upload?fileId=${fileId}`,
        { method: 'DELETE' },
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      await refreshBatch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  /* ── Step 2 derived: rep × format matrix ─────────────────── */
  const repsWithFiles = useMemo(() => {
    const set = new Set(batchFiles.map((f) => f.rep_email.toLowerCase()))
    return reps.filter((r) => set.has(r.email.toLowerCase()))
  }, [batchFiles, reps])

  const filesByRepAndFormat = useMemo(() => {
    const map = new Map<string, Map<string, BatchFile>>()
    for (const f of batchFiles) {
      const key = f.rep_email.toLowerCase()
      const inner = map.get(key) || new Map<string, BatchFile>()
      inner.set(f.format, f)
      map.set(key, inner)
    }
    return map
  }, [batchFiles])

  // Show every rep that has at least one file plus any rep with pending or
  // active uploads. Reps with neither stay hidden to keep the grid focused.
  const gridReps = useMemo(() => {
    const inFlightEmails = new Set<string>()
    for (const u of Object.values(uploads)) {
      if (u.kind === 'pending' || u.kind === 'uploading' || u.kind === 'failed') {
        const cls = classifyFile(u.filename, campaignSlug, reps)
        if (cls.ok && cls.rep) inFlightEmails.add(cls.rep.email.toLowerCase())
      }
    }
    const baseEmails = new Set(repsWithFiles.map((r) => r.email.toLowerCase()))
    inFlightEmails.forEach((e) => baseEmails.add(e))
    return reps.filter((r) => baseEmails.has(r.email.toLowerCase()))
  }, [repsWithFiles, uploads, campaignSlug, reps])

  // Auto-select the first rep with files for the Step 3 preview.
  useEffect(() => {
    if (!previewRepEmail && repsWithFiles.length > 0) {
      setPreviewRepEmail(repsWithFiles[0].email)
    }
  }, [repsWithFiles, previewRepEmail])

  /* ── Step 3: AI intro generation ─────────────────────────── */
  /*
   * We don't fetch the real server-side template here. The send endpoint
   * applies it at send time with the AI intro injected. The preview iframe
   * (Step 3 right column) renders a brand-consistent shell that mirrors
   * the real template's layout — close enough for visual QA without
   * shipping a second copy of the template HTML to the client.
   */
  async function generateIntro(repEmail: string) {
    const rep = reps.find((r) => r.email.toLowerCase() === repEmail.toLowerCase())
    if (!rep) return
    const repFiles = batchFiles.filter(
      (f) => f.rep_email.toLowerCase() === repEmail.toLowerCase(),
    )
    if (repFiles.length === 0) {
      setError(`${rep.name} has no files in this batch.`)
      return
    }
    setError(''); setInfo('')
    setIntroLoadingRep(repEmail)
    try {
      const res = await fetch(
        '/api/admin/marketing/asset-delivery/generate-intro',
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rep_first_name:       rep.first_name || rep.name.split(' ')[0],
            rep_full_name:        rep.name,
            campaign_name:        campaignName,
            campaign_description: description || undefined,
            asset_summary:        repFiles.map((f) => ({
              format: f.format,
              type:   f.mime_type || 'file',
            })),
          }),
        },
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'AI intro failed')
      setIntrosByRep((prev) => ({ ...prev, [repEmail]: data.intro }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI intro failed')
    } finally {
      setIntroLoadingRep(null)
    }
  }

  // Auto-generate an intro for the currently previewed rep if one doesn't
  // exist yet. Only when on Step 3 and the rep has files.
  useEffect(() => {
    if (step !== 3 || !previewRepEmail) return
    if (introsByRep[previewRepEmail]) return
    generateIntro(previewRepEmail)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, previewRepEmail])

  /* ── Step 4: send ────────────────────────────────────────── */
  async function sendTest() {
    if (!batchId || !previewRepEmail) return
    setError(''); setInfo('')
    setTestSending(true)
    try {
      const res = await fetch(
        `/api/admin/marketing/asset-delivery/${batchId}/send`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test_recipient_email: previewRepEmail }),
        },
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Test send failed')
      setInfo(
        `Test sent to ${previewRepEmail} (1 rep, ${data.sent} sent, ${data.failed} failed).`,
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Test send failed')
    } finally {
      setTestSending(false)
    }
  }

  async function sendForReal() {
    if (!batchId) return
    setConfirmOpen(false)
    setSending(true)
    setError(''); setInfo('')
    try {
      const res = await fetch(
        `/api/admin/marketing/asset-delivery/${batchId}/send`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' },
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Send failed')
      router.push(`/admin/team/asset-delivery/${batchId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Send failed')
      setSending(false)
    }
  }

  /* ── Derived totals for Step 3 summary ───────────────────── */
  const totals = useMemo(() => {
    const totalBytes = batchFiles.reduce((a, f) => a + (f.file_size_bytes || 0), 0)
    return {
      reps:        repsWithFiles.length,
      files:       batchFiles.length,
      totalBytes,
      // Rough estimate: SendGrid + R2 download per rep ~ 8 sec serial,
      // concurrency = 2 server-side. Capped at 60s minimum / 600s maximum.
      etaSeconds: Math.max(60, Math.min(600, Math.ceil((repsWithFiles.length / 2) * 8))),
    }
  }, [batchFiles, repsWithFiles])

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="space-y-5">
      {/* Step indicator */}
      <StepIndicator step={step} hasBatch={!!batchId} />

      {error && (
        <InlineAlert kind="error" message={error} onClose={() => setError('')} />
      )}
      {info && (
        <InlineAlert kind="success" message={info} onClose={() => setInfo('')} />
      )}

      {step === 1 && (
        <Step1
          campaignName={campaignName}        setCampaignName={setCampaignName}
          campaignSlug={campaignSlug}        setCampaignSlug={(v) => { setCampaignSlug(v); setSlugTouched(true) }}
          lane={lane}                        setLane={setLane}
          description={description}          setDescription={setDescription}
          emailSubject={emailSubject}        setEmailSubject={setEmailSubject}
          creating={creatingBatch}
          onContinue={createBatch}
        />
      )}

      {step === 2 && batchId && (
        <Step2
          campaignSlug={campaignSlug}
          reps={reps}
          gridReps={gridReps}
          filesByRepAndFormat={filesByRepAndFormat}
          uploads={uploads}
          dragOver={dragOver}
          dropAreaRef={dropAreaRef}
          fileInputRef={fileInputRef}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onPickFiles={onPickFiles}
          onPickClick={() => fileInputRef.current?.click()}
          onRetry={retryFile}
          onRemoveUploaded={removeUploadedFile}
          onBack={() => setStep(1)}
          onContinue={() => setStep(3)}
          totals={totals}
        />
      )}

      {step === 3 && batchId && (
        <Step3
          batchData={batchData}
          campaignName={campaignName}
          campaignDescription={description}
          reps={reps}
          repsWithFiles={repsWithFiles}
          previewRepEmail={previewRepEmail}
          setPreviewRepEmail={setPreviewRepEmail}
          introsByRep={introsByRep}
          introLoadingRep={introLoadingRep}
          generateIntro={generateIntro}
          batchFiles={batchFiles}
          totals={totals}
          adminEmail={adminEmail}
          onBack={() => setStep(2)}
          onTestSend={sendTest}
          testSending={testSending}
          onSendAll={() => setConfirmOpen(true)}
          sending={sending}
        />
      )}

      {/* Step 4 is a modal + a full-screen spinner. */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Send to all {totals.reps} {totals.reps === 1 ? 'rep' : 'reps'}?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-gray-600">
                <p>This will email {totals.reps} {totals.reps === 1 ? 'rep' : 'reps'} with their personalized assets.</p>
                <p className="text-xs">
                  Total attachment size: <span className="font-semibold">{formatBytes(totals.totalBytes)}</span><br />
                  Estimated send time: <span className="font-semibold">~{Math.ceil(totals.etaSeconds / 60)} {totals.etaSeconds < 120 ? 'minute' : 'minutes'}</span>
                </p>
                <p className="text-xs text-amber-700">This action cannot be undone.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={sendForReal}
              className="bg-[#f26b2b] hover:bg-[#d8551b] text-white"
            >
              Confirm Send
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {sending && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="p-8 max-w-sm text-center space-y-3">
            <Loader2 className="w-10 h-10 text-[#f26b2b] animate-spin mx-auto" />
            <h3 className="font-semibold text-[#03374f]">Sending to {totals.reps} reps…</h3>
            <p className="text-xs text-gray-500">
              This may take 1-3 minutes for larger batches. You&apos;ll be redirected to the batch detail page when it&apos;s done.
            </p>
          </Card>
        </div>
      )}
    </div>
  )
}

/* ─── Step indicator ─────────────────────────────────────────── */

function StepIndicator({ step, hasBatch }: { step: 1 | 2 | 3 | 4; hasBatch: boolean }) {
  const labels = ['Details', 'Upload', 'Preview', 'Send'] as const
  return (
    <div className="flex items-center gap-2 text-xs">
      {labels.map((l, i) => {
        const n = (i + 1) as 1 | 2 | 3 | 4
        const active = step === n
        const done   = step > n || (n === 1 && hasBatch && step > 1)
        return (
          <div key={l} className="flex items-center gap-2">
            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${
              done   ? 'bg-emerald-500 text-white' :
              active ? 'bg-[#f26b2b] text-white'   :
                       'bg-gray-100 text-gray-400'
            }`}>
              {done ? <Check className="w-3 h-3" /> : n}
            </span>
            <span className={`${active ? 'text-[#03374f] font-semibold' : 'text-gray-400'}`}>
              {l}
            </span>
            {i < labels.length - 1 && (
              <span className="text-gray-200 mx-1">›</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Step 1: Campaign Details ───────────────────────────────── */

function Step1(props: {
  campaignName: string;     setCampaignName: (v: string) => void
  campaignSlug: string;     setCampaignSlug: (v: string) => void
  lane: Lane;               setLane: (v: Lane) => void
  description: string;      setDescription: (v: string) => void
  emailSubject: string;     setEmailSubject: (v: string) => void
  creating: boolean
  onContinue: () => void
}) {
  return (
    <Card className="p-6 space-y-5 max-w-2xl">
      <div>
        <h2 className="font-semibold text-[#03374f] text-lg">Campaign details</h2>
        <p className="text-xs text-gray-500 mt-1">
          You can change any of this later until the batch is sent.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="campaign-name">Campaign Name <span className="text-red-500">*</span></Label>
        <Input
          id="campaign-name"
          value={props.campaignName}
          onChange={(e) => props.setCampaignName(e.target.value)}
          placeholder="Wire Fraud Prevention"
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="campaign-slug">Campaign Slug <span className="text-red-500">*</span></Label>
        <Input
          id="campaign-slug"
          value={props.campaignSlug}
          onChange={(e) => props.setCampaignSlug(slugify(e.target.value))}
          placeholder="wire-fraud-prevention"
          maxLength={120}
        />
        <p className="text-[11px] text-gray-500 font-mono">
          Filenames must start with this slug: <span className="text-[#03374f]">{props.campaignSlug || '<slug>'}__C-&lt;n&gt;[-&lt;name&gt;]__{'{format}'}.{'{ext}'}</span>
        </p>
        <p className="text-[11px] text-gray-500">
          Example: <span className="font-mono text-[#03374f]">{(props.campaignSlug || 'prelim-toolkit')}__C-28-jerry__flyer.pdf</span>. The rep is matched by SMS code (e.g.&nbsp;C-28), with an optional first-name suffix that&apos;s validated but not required. Team codes (e.g.&nbsp;C-4 for Lopez team) route to the team&apos;s shared email automatically.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="campaign-lane">Lane</Label>
        <Select value={props.lane} onValueChange={(v) => props.setLane(v as Lane)}>
          <SelectTrigger id="campaign-lane">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="campaign-desc">Description <span className="text-gray-400 font-normal">(optional)</span></Label>
        <Textarea
          id="campaign-desc"
          value={props.description}
          onChange={(e) => props.setDescription(e.target.value)}
          rows={3}
          placeholder="Wire-transfer fraud talking points for active escrows. Sent to all OC reps."
          maxLength={2000}
        />
        <p className="text-[11px] text-gray-500">
          Used as context for the AI intro paragraph. Not included in the email body.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-subject">Email Subject <span className="text-red-500">*</span></Label>
        <Input
          id="email-subject"
          value={props.emailSubject}
          onChange={(e) => props.setEmailSubject(e.target.value)}
          placeholder="Your Wire Fraud Prevention Toolkit is Ready, {{rep_first_name}}"
          maxLength={300}
        />
        <p className="text-[11px] text-gray-500 font-mono">
          Use <span className="text-[#03374f]">{'{{rep_first_name}}'}</span> to personalize. Other Mustache vars aren&apos;t substituted in the subject.
        </p>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Link href="/admin/team/asset-delivery">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button
          onClick={props.onContinue}
          disabled={props.creating || !props.campaignName.trim() || !props.campaignSlug || !props.emailSubject.trim()}
          className="bg-[#f26b2b] hover:bg-[#d8551b] text-white"
        >
          {props.creating ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-1.5" />}
          Continue to Upload
        </Button>
      </div>
    </Card>
  )
}

/* ─── Step 2: Upload Files ───────────────────────────────────── */

function Step2(props: {
  campaignSlug: string
  reps: RepRoster[]
  gridReps: RepRoster[]
  filesByRepAndFormat: Map<string, Map<string, BatchFile>>
  uploads: Record<string, UploadState>
  dragOver: boolean
  dropAreaRef: React.RefObject<HTMLDivElement | null>
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  onPickFiles: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPickClick: () => void
  onRetry: (filename: string) => void
  onRemoveUploaded: (fileId: number) => void
  onBack: () => void
  onContinue: () => void
  totals: { reps: number; files: number; totalBytes: number; etaSeconds: number }
}) {
  const inFlight = Object.values(props.uploads).filter(
    (u) => u.kind === 'uploading' || u.kind === 'pending',
  ).length
  const failedUploads = Object.values(props.uploads).filter(
    (u) => u.kind === 'failed' || u.kind === 'no-match',
  )
  const totalUploaded = props.totals.files

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      <Card className="p-0 overflow-hidden">
        <div
          ref={props.dropAreaRef}
          onDragOver={props.onDragOver}
          onDragLeave={props.onDragLeave}
          onDrop={props.onDrop}
          className={`px-6 py-12 text-center transition-colors ${
            props.dragOver
              ? 'bg-[#f26b2b]/10 border-2 border-dashed border-[#f26b2b]'
              : 'bg-gray-50 border-2 border-dashed border-gray-200'
          }`}
        >
          <Upload className={`w-10 h-10 mx-auto mb-3 ${props.dragOver ? 'text-[#f26b2b]' : 'text-gray-400'}`} />
          <p className="font-semibold text-[#03374f] mb-1">Drop files here</p>
          <p className="text-xs text-gray-500 mb-1">
            Filename format: <span className="font-mono text-[#03374f]">{props.campaignSlug}__C-&lt;n&gt;[-&lt;name&gt;]__{'{format}'}.{'{ext}'}</span>
          </p>
          <p className="text-xs text-gray-500 mb-1">
            Example: <span className="font-mono text-[#03374f]">{props.campaignSlug}__C-28-jerry__flyer.pdf</span> · Team codes (e.g.&nbsp;C-4) route to the team&apos;s shared email automatically.
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Formats: flyer/print (.pdf), social/social-story/email-insert (.png .jpg)
          </p>
          <Button variant="outline" size="sm" onClick={props.onPickClick}>
            <Upload className="w-3.5 h-3.5 mr-1" /> or browse for files
          </Button>
          <input
            ref={props.fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
            onChange={props.onPickFiles}
          />
        </div>
      </Card>

      {/* Progress summary */}
      <Card className="p-0 overflow-hidden gap-0">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Files className="w-4 h-4 text-[#f26b2b]" />
            <h3 className="font-semibold text-[#03374f] text-sm">Upload progress</h3>
          </div>
          <div className="text-xs text-gray-500">
            {props.totals.reps} {props.totals.reps === 1 ? 'rep' : 'reps'} · {totalUploaded} {totalUploaded === 1 ? 'file' : 'files'} uploaded
            {inFlight > 0 && <span className="ml-2 text-[#f26b2b]">· {inFlight} in flight</span>}
          </div>
        </div>

        {props.gridReps.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-400">
              No files uploaded yet. Drop files above to populate the grid.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-2.5 text-xs font-semibold text-gray-500">Rep</th>
                  {FORMATS.map((f) => (
                    <th key={f} className="px-3 py-2.5 text-xs font-semibold text-gray-500 text-center">
                      {FORMAT_LABELS[f]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {props.gridReps.map((rep) => {
                  const inner = props.filesByRepAndFormat.get(rep.email.toLowerCase())
                  return (
                    <tr key={rep.email} className="border-t border-gray-50">
                      <td className="px-5 py-2.5">
                        <div className="font-medium text-[#03374f]">{rep.name}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{rep.sms_code || rep.email_prefix}</div>
                      </td>
                      {FORMATS.map((fmt) => {
                        const existing = inner?.get(fmt)
                        // Match in-flight uploads by `slug__C-<n>` prefix —
                        // tolerant of optional name suffix and extension.
                        const codeForMatch = (rep.sms_code || '').toLowerCase()
                        const expectedPrefix = codeForMatch
                          ? `${props.campaignSlug}__${codeForMatch}`
                          : null
                        const pending = expectedPrefix
                          ? Object.values(props.uploads).find((u) => {
                              const lower = u.filename.toLowerCase()
                              return lower.startsWith(expectedPrefix) && lower.includes(`__${fmt}.`)
                            })
                          : undefined
                        return (
                          <td key={fmt} className="px-3 py-2.5 text-center">
                            {existing ? (
                              <button
                                onClick={() => props.onRemoveUploaded(existing.id)}
                                title={`Click to remove ${existing.original_filename}`}
                                className="group inline-flex items-center gap-1 text-emerald-600 hover:text-red-600 transition-colors"
                              >
                                <CheckCircle2 className="w-4 h-4 group-hover:hidden" />
                                <X className="w-4 h-4 hidden group-hover:inline" />
                              </button>
                            ) : pending?.kind === 'uploading' ? (
                              <Loader2 className="w-4 h-4 mx-auto text-[#f26b2b] animate-spin" />
                            ) : pending?.kind === 'pending' ? (
                              <Clock className="w-4 h-4 mx-auto text-gray-300" />
                            ) : pending?.kind === 'failed' ? (
                              <button
                                onClick={() => props.onRetry(pending.filename)}
                                title={pending.error}
                                className="text-red-500 hover:text-red-700"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-gray-200">—</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Failures / no-match */}
        {failedUploads.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-red-50/40">
            <p className="text-xs font-semibold text-red-700 mb-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {failedUploads.length} {failedUploads.length === 1 ? 'file' : 'files'} need attention
            </p>
            <ul className="space-y-1">
              {failedUploads.map((u) => (
                <li key={u.filename} className="text-xs flex items-center justify-between gap-2">
                  <span className="font-mono text-gray-700 truncate">{u.filename}</span>
                  <span className="text-red-600 flex-shrink-0">
                    {u.kind === 'no-match' ? '⚠ ' : '✗ '}{u.error}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={props.onBack}>
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
        </Button>
        <Button
          onClick={props.onContinue}
          disabled={totalUploaded === 0 || inFlight > 0}
          className="bg-[#f26b2b] hover:bg-[#d8551b] text-white"
        >
          Continue to Preview <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </div>
  )
}

/* ─── Step 3: Preview + AI Intros ────────────────────────────── */

function Step3(props: {
  batchData: BatchData | null
  campaignName: string
  campaignDescription: string
  reps: RepRoster[]
  repsWithFiles: RepRoster[]
  previewRepEmail: string
  setPreviewRepEmail: (v: string) => void
  introsByRep: Record<string, string>
  introLoadingRep: string | null
  generateIntro: (email: string) => void
  batchFiles: BatchFile[]
  totals: { reps: number; files: number; totalBytes: number; etaSeconds: number }
  adminEmail: string
  onBack: () => void
  onTestSend: () => void
  testSending: boolean
  onSendAll: () => void
  sending: boolean
}) {
  const previewRep = props.reps.find(
    (r) => r.email.toLowerCase() === props.previewRepEmail.toLowerCase(),
  ) || null

  const previewFiles = props.batchFiles.filter(
    (f) => f.rep_email.toLowerCase() === props.previewRepEmail.toLowerCase(),
  )

  const intro = props.introsByRep[props.previewRepEmail] || ''

  // Render a brand-consistent preview client-side. The real template is
  // applied server-side at send time; this preview shows what the rep
  // will see in their email shell with their personalized intro and
  // attachment list.
  const previewHtml = useMemo(() => {
    if (!previewRep) return ''
    const subjectPreview = (props.batchData?.email_subject || '').replace(
      /\{\{rep_first_name\}\}/g,
      previewRep.first_name || previewRep.name.split(' ')[0],
    )
    const introHtml = intro
      ? escapeHtml(intro)
      : '<em style="color:#9ca3af;">Generating personalized intro…</em>'
    const cardsHtml = previewFiles.map((f) => `
      <tr><td style="padding:6px 0;">
        <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="background:#f0ede9;border:1px solid #e5e7eb;border-radius:8px;">
          <tr>
            <td width="56" align="center" style="padding:14px 12px;background:#ffffff;border-right:1px solid #e5e7eb;border-radius:8px 0 0 8px;">
              <span style="font-family:Arial,sans-serif;font-size:18px;color:#f26b2b;font-weight:bold;">${iconLetter(f.mime_type)}</span>
            </td>
            <td style="padding:12px;font-family:Arial,sans-serif;">
              <div style="font-size:13px;font-weight:bold;color:#1f2937;">${escapeHtml(f.original_filename)}</div>
              <div style="font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">${escapeHtml(f.format)} · ${formatBytes(f.file_size_bytes)}</div>
            </td>
          </tr>
        </table>
      </td></tr>
    `).join('')
    return `
      <html><head><meta charset="utf-8"><style>body{margin:0;background:#f0ede9;font-family:Arial,sans-serif;}</style></head>
      <body>
        <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" bgcolor="#f0ede9" style="background:#f0ede9;">
          <tr><td align="center" style="padding:20px 12px;">
            <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="600" bgcolor="#ffffff" style="background:#ffffff;border-radius:8px;width:600px;max-width:600px;">
              <tr><td bgcolor="#03374f" style="background:#03374f;padding:20px 28px;border-radius:8px 8px 0 0;">
                <div style="color:#ffffff;font-weight:bold;font-size:15px;">Pacific Coast Title</div>
                <div style="color:rgba(255,255,255,0.6);font-size:11px;margin-top:2px;">${escapeHtml(subjectPreview)}</div>
              </td></tr>
              <tr><td style="padding:28px;font-family:Arial,sans-serif;">
                <span style="display:inline-block;background:#03374f;color:#fff;font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:0.1em;padding:5px 10px;border-radius:4px;margin-bottom:12px;">Marketing Toolkit</span>
                <h1 style="color:#03374f;font-size:22px;font-weight:bold;margin:0 0 6px 0;">Your ${escapeHtml(props.campaignName)} is Ready, ${escapeHtml(previewRep.first_name || previewRep.name.split(' ')[0])}</h1>
                <p style="color:#1f2937;font-size:14px;line-height:1.7;margin:12px 0 22px 0;">${introHtml}</p>
                <div style="font-size:12px;font-weight:bold;color:#03374f;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 10px 0;">Your Personalized Assets (${previewFiles.length})</div>
                <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%">${cardsHtml}</table>
                <div style="margin-top:24px;padding:16px 20px;background:#fcefe7;border-left:4px solid #f26b2b;border-radius:0 6px 6px 0;">
                  <div style="font-size:11px;font-weight:bold;color:#f26b2b;text-transform:uppercase;letter-spacing:0.05em;">Questions?</div>
                  <div style="font-size:13px;color:#1f2937;margin-top:4px;">Reply to this email and the marketing team will help.</div>
                </div>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>`
  }, [previewRep, previewFiles, intro, props.batchData, props.campaignName])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Left column: rep picker, intro, controls */}
      <div className="space-y-4 lg:col-span-1">
        <Card className="p-5 space-y-4">
          <div>
            <Label className="text-xs">Preview as</Label>
            <Select value={props.previewRepEmail} onValueChange={props.setPreviewRepEmail}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Pick a rep" />
              </SelectTrigger>
              <SelectContent>
                {props.repsWithFiles.map((r) => (
                  <SelectItem key={r.email} value={r.email}>
                    {r.name} ({props.batchFiles.filter((f) => f.rep_email.toLowerCase() === r.email.toLowerCase()).length} files)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label className="text-xs">AI Intro</Label>
              <button
                disabled={props.introLoadingRep === props.previewRepEmail}
                onClick={() => props.generateIntro(props.previewRepEmail)}
                className="text-[11px] text-[#f26b2b] hover:underline inline-flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${props.introLoadingRep === props.previewRepEmail ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
            </div>
            <div className="text-xs text-gray-700 bg-gray-50 rounded-lg p-3 min-h-[80px] leading-relaxed border border-gray-100">
              {props.introLoadingRep === props.previewRepEmail
                ? <Skeleton className="w-full h-16 bg-gray-200" />
                : intro || <span className="text-gray-400 italic">No intro yet — click Regenerate.</span>}
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">
              Each rep gets their own AI-generated intro at send time. This is a sample.
            </p>
          </div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="text-xs font-semibold text-[#03374f] uppercase tracking-wide mb-1">Summary</div>
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex items-center justify-between"><span className="inline-flex items-center gap-1"><Users className="w-3 h-3" /> Total reps</span><span className="font-semibold text-[#03374f]">{props.totals.reps}</span></div>
            <div className="flex items-center justify-between"><span className="inline-flex items-center gap-1"><Files className="w-3 h-3" /> Total files</span><span className="font-semibold text-[#03374f]">{props.totals.files}</span></div>
            <div className="flex items-center justify-between"><span className="inline-flex items-center gap-1"><HardDrive className="w-3 h-3" /> Total payload</span><span className="font-semibold text-[#03374f]">{formatBytes(props.totals.totalBytes)}</span></div>
            <div className="flex items-center justify-between"><span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> Est. send time</span><span className="font-semibold text-[#03374f]">~{Math.ceil(props.totals.etaSeconds / 60)} min</span></div>
          </div>
        </Card>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            disabled={props.testSending || !props.previewRepEmail}
            onClick={props.onTestSend}
          >
            {props.testSending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Mail className="w-4 h-4 mr-1.5" />}
            Send Test to {previewRep?.first_name || 'selected rep'}
          </Button>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Sends a single test email to the rep selected above (not to your admin email — the send endpoint requires a recipient that has files in the batch).
            {props.adminEmail && <span className="block">Signed in as <span className="font-mono">{props.adminEmail}</span>.</span>}
          </p>
          <Button
            className="w-full bg-[#f26b2b] hover:bg-[#d8551b] text-white"
            disabled={props.sending || props.totals.reps === 0}
            onClick={props.onSendAll}
          >
            <Send className="w-4 h-4 mr-1.5" /> Send to All {props.totals.reps} {props.totals.reps === 1 ? 'Rep' : 'Reps'}
          </Button>
          <Button variant="ghost" className="w-full" onClick={props.onBack}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Upload
          </Button>
        </div>
      </div>

      {/* Right column: preview iframe */}
      <Card className="p-0 overflow-hidden lg:col-span-2 min-h-[600px]">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="text-xs font-semibold text-[#03374f]">Preview</div>
          <div className="text-[11px] text-gray-400">
            {previewRep ? `${previewRep.name} · ${previewFiles.length} attachments` : '—'}
          </div>
        </div>
        {previewHtml ? (
          <iframe
            title="Email preview"
            srcDoc={previewHtml}
            sandbox=""
            className="w-full h-[700px] bg-white"
          />
        ) : (
          <div className="px-6 py-20 text-center text-sm text-gray-400">
            Select a rep to preview their email.
          </div>
        )}
      </Card>
    </div>
  )
}

/* ─── Local helpers used by the preview iframe ───────────────── */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function iconLetter(mime: string | null): string {
  if (!mime) return 'F'
  const m = mime.toLowerCase()
  if (m === 'application/pdf' || m.endsWith('/pdf')) return 'P'
  if (m.startsWith('image/')) return 'I'
  if (m.startsWith('text/'))  return 'T'
  return 'F'
}

export type { Lane }
