'use client'

/**
 * SignaturePreviewModal — render + copy + email a single staff signature.
 *
 * Fetches POST /api/admin/signatures/generate/[staffId] on open and renders
 * the returned HTML into a real (live) DOM container. The container is what
 * `Copy Signature` selects — copying from rendered DOM produces rich
 * content that Outlook/Gmail paste correctly. Copying raw HTML source does
 * NOT work in Outlook (the original problem this UI exists to solve).
 *
 * `Email Signature to …` calls POST /api/admin/signatures/send/[staffId]
 * which sends a SendGrid email to the staff member with setup instructions.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Copy, CheckCircle2, Mail, Loader2, RefreshCw, AlertCircle, X,
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  staffId:    number | null
  staffName:  string
  staffEmail: string
  open:       boolean
  onClose:    () => void
}

interface GenerateResponse {
  staff_id:      number
  staff_name:    string
  staff_email:   string
  template_id:   number
  template_name: string
  html:          string
  generated_at:  string
}

interface SendResponse {
  staff_id:    number
  staff_email: string
  sent:        boolean
  sent_at:     string
}

const RESEND_COOLDOWN_MS = 30_000

export function SignaturePreviewModal({
  staffId, staffName, staffEmail, open, onClose,
}: Props) {
  const [loading,   setLoading]   = useState(false)
  const [html,      setHtml]      = useState<string>('')
  const [loadError, setLoadError] = useState<string | null>(null)

  const [copied,    setCopied]    = useState(false)
  const [copyError, setCopyError] = useState<string | null>(null)

  const [confirmSendOpen, setConfirmSendOpen] = useState(false)
  const [sending,         setSending]         = useState(false)
  const [sentAt,          setSentAt]          = useState<string | null>(null)
  const [sendError,       setSendError]       = useState<string | null>(null)
  const [cooldownLeft,    setCooldownLeft]    = useState(0)

  // Live rendered container — what Copy Signature selects.
  const signatureRef = useRef<HTMLDivElement | null>(null)

  /* ── Fetch on open ────────────────────────────────────────────── */

  const fetchSignature = useCallback(async () => {
    if (!staffId) return
    setLoading(true); setLoadError(null); setHtml('')
    try {
      const res = await fetch(`/api/admin/signatures/generate/${staffId}`, {
        method: 'POST',
      })
      if (res.status === 401) {
        window.location.href = '/admin'
        return
      }
      if (res.status === 404) {
        throw new Error('Staff member not found. They may have been deleted.')
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Could not generate signature. Try again or contact support.')
      }
      const data: GenerateResponse = await res.json()
      setHtml(data.html)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Could not generate signature.')
    } finally {
      setLoading(false)
    }
  }, [staffId])

  // Reset transient state when modal opens for a different staff member,
  // then trigger the initial fetch.
  useEffect(() => {
    if (!open) return
    setCopied(false); setCopyError(null)
    setSendError(null); setSentAt(null); setCooldownLeft(0)
    fetchSignature()
  }, [open, staffId, fetchSignature])

  /* ── Resend cooldown countdown ────────────────────────────────── */

  useEffect(() => {
    if (cooldownLeft <= 0) return
    const t = setTimeout(() => setCooldownLeft((s) => Math.max(0, s - 1000)), 1000)
    return () => clearTimeout(t)
  }, [cooldownLeft])

  /* ── Copy as rich content ─────────────────────────────────────── */

  const copySignature = useCallback(async () => {
    const node = signatureRef.current
    if (!node) {
      setCopyError('Signature is not ready yet. Wait a moment and try again.')
      return
    }
    setCopyError(null)

    // Method 1: modern Clipboard API with both text/html + text/plain
    try {
      if (
        typeof ClipboardItem !== 'undefined' &&
        navigator.clipboard?.write
      ) {
        const htmlPayload = node.innerHTML
        const textPayload = node.innerText
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html':  new Blob([htmlPayload], { type: 'text/html'  }),
            'text/plain': new Blob([textPayload], { type: 'text/plain' }),
          }),
        ])
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
        return
      }
    } catch {
      /* fall through to DOM-selection fallback */
    }

    // Method 2: Selection + execCommand('copy'). Firefox/older browsers
    // and some macOS contexts still rely on this for rich-content copy.
    try {
      const range = document.createRange()
      range.selectNodeContents(node)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
      const ok = document.execCommand('copy')
      selection?.removeAllRanges()
      if (!ok) throw new Error('execCommand returned false')
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      setCopyError(
        'Copy failed. Select the signature with your mouse and press Ctrl+C (Cmd+C on Mac).',
      )
    }
  }, [])

  /* ── Send email ───────────────────────────────────────────────── */

  const sendEmail = useCallback(async () => {
    if (!staffId) return
    setConfirmSendOpen(false)
    setSending(true)
    setSendError(null)
    try {
      const res = await fetch(`/api/admin/signatures/send/${staffId}`, {
        method: 'POST',
      })
      if (res.status === 401) {
        window.location.href = '/admin'
        return
      }
      if (res.status === 404) {
        throw new Error('Staff member not found.')
      }
      if (res.status === 503) {
        throw new Error('Email service is not configured. Contact admin.')
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Could not send email. Try again.')
      }
      const data: SendResponse = await res.json()
      setSentAt(data.sent_at)
      setCooldownLeft(RESEND_COOLDOWN_MS)
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'Could not send email.')
    } finally {
      setSending(false)
    }
  }, [staffId])

  /* ── Render ───────────────────────────────────────────────────── */

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
        <DialogContent className="max-w-[720px] p-0 overflow-hidden">
          <DialogHeader className="px-5 py-4 border-b border-gray-100">
            <DialogTitle className="flex items-center gap-2 text-[#03374f] text-base">
              <Mail className="w-4 h-4 text-[#f26b2b]" />
              Signature for {staffName}
            </DialogTitle>
          </DialogHeader>

          <div className="px-5 py-5 space-y-5 max-h-[80vh] overflow-y-auto">

            {/* ── Preview ─────────────────────────────────────── */}
            <div>
              <p className="text-[11px] uppercase tracking-wide font-semibold text-[#03374f] mb-2">
                Preview — how recipients will see your signature
              </p>

              {loading && (
                <div className="border rounded-lg p-6 bg-white space-y-2"
                     role="status" aria-live="polite" aria-label="Generating signature">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin text-[#f26b2b]" />
                    Generating signature…
                  </div>
                  <Skeleton className="h-3 w-1/3 bg-gray-200" />
                  <Skeleton className="h-3 w-1/2 bg-gray-200" />
                  <Skeleton className="h-3 w-2/3 bg-gray-200" />
                </div>
              )}

              {!loading && loadError && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="flex items-center justify-between gap-3">
                    <span>{loadError}</span>
                    <Button size="sm" variant="outline" onClick={fetchSignature}>
                      <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {!loading && !loadError && html && (
                <div className="border rounded-lg p-4 bg-white overflow-x-auto">
                  {/*
                    The signature MUST be rendered into the real DOM (not an
                    iframe) so the Copy button can select it as rich content.
                    Backend HTML is admin-generated from a fixed template
                    file, so dangerouslySetInnerHTML is safe here.
                  */}
                  <div ref={signatureRef}
                       dangerouslySetInnerHTML={{ __html: html }} />
                </div>
              )}
            </div>

            {/* ── Outlook paste instructions ──────────────────── */}
            {!loading && !loadError && html && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 text-amber-600 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold">How to copy into Outlook</p>
                    <p>
                      Modern Outlook blocks raw HTML paste. Use the button below — it
                      copies the <em>rendered signature</em> (rich content), not the
                      HTML source.
                    </p>
                    <ol className="list-decimal list-inside space-y-0.5 mt-1">
                      <li>Click <strong>Copy Signature</strong> below.</li>
                      <li>Open Outlook → Settings → Signatures.</li>
                      <li>Create a new signature and paste with Ctrl+V (Cmd+V).</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {copyError && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{copyError}</AlertDescription>
              </Alert>
            )}

            {/* ── Action buttons ──────────────────────────────── */}
            {!loading && !loadError && html && (
              <div className="space-y-2">
                <Button
                  onClick={copySignature}
                  aria-label={copied ? 'Signature copied to clipboard' : 'Copy signature to clipboard'}
                  className="w-full bg-[#f26b2b] hover:bg-[#d85a20] text-white">
                  {copied ? (
                    <><CheckCircle2 className="w-4 h-4 mr-2" /> Copied! Paste into Outlook</>
                  ) : (
                    <><Copy className="w-4 h-4 mr-2" /> Copy Signature</>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setConfirmSendOpen(true)}
                  disabled={sending || cooldownLeft > 0}
                  className="w-full">
                  {sending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</>
                  ) : sentAt ? (
                    cooldownLeft > 0 ? (
                      <><CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                        Email Sent · Resend in {Math.ceil(cooldownLeft / 1000)}s</>
                    ) : (
                      <><Mail className="w-4 h-4 mr-2" /> Resend Signature to {staffName.split(' ')[0]}</>
                    )
                  ) : (
                    <><Mail className="w-4 h-4 mr-2" /> Email Signature to {staffName.split(' ')[0]}</>
                  )}
                </Button>

                {sentAt && !sendError && (
                  <div role="status" aria-live="polite"
                       className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Email sent to <code className="font-mono">{staffEmail}</code>
                  </div>
                )}

                {sendError && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription className="flex items-center justify-between gap-3">
                      <span>{sendError}</span>
                      <Button size="sm" variant="outline"
                              onClick={() => setConfirmSendOpen(true)}>
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4 mr-1.5" /> Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Send confirmation ─────────────────────────────────── */}
      <AlertDialog open={confirmSendOpen} onOpenChange={setConfirmSendOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Email this signature?</AlertDialogTitle>
            <AlertDialogDescription>
              We&apos;ll email the signature plus Outlook setup instructions to{' '}
              <code className="font-mono">{staffEmail}</code>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={sendEmail}
              className="bg-[#f26b2b] hover:bg-[#d85a20] text-white">
              Send Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
