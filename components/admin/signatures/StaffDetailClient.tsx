'use client'

/**
 * StaffDetailClient — read-only view of one staff member.
 *
 * Left column: every staff_members field rendered with clear "(not set)"
 * fallbacks. Right column: a live inline signature preview that uses the
 * same generate API as the modal, with Copy + Email actions reused via
 * SignaturePreviewModal triggered from a button. Delete is a confirmation
 * dialog → DELETE → router push back to the list.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Pencil, Trash2, Mail, Phone, Smartphone, Printer,
  Building2, IdCard, Linkedin, Instagram, AtSign, Loader2,
  AlertCircle, RefreshCw, Copy, CheckCircle2, FileImage,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { SignaturePreviewModal } from '@/components/admin/signatures/SignaturePreviewModal'
import type { StaffMember, OfficeLocation } from '@/lib/admin-db'

interface Props {
  staff:  StaffMember
  office: OfficeLocation | null
}

interface GenerateResponse {
  html: string
}

export function StaffDetailClient({ staff, office }: Props) {
  const router = useRouter()

  // Inline signature preview
  const [loading,   setLoading]   = useState(true)
  const [html,      setHtml]      = useState('')
  const [loadError, setLoadError] = useState<string | null>(null)
  const signatureRef = useRef<HTMLDivElement | null>(null)

  // Copy state
  const [copied,    setCopied]    = useState(false)
  const [copyError, setCopyError] = useState<string | null>(null)

  // Modal trigger (reuses Email + Copy from SignaturePreviewModal)
  const [modalOpen, setModalOpen] = useState(false)

  // Delete state
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deleting,    setDeleting]    = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  /* ── Fetch inline signature ───────────────────────────────────── */

  const fetchSignature = useCallback(async () => {
    setLoading(true); setLoadError(null); setHtml('')
    try {
      const res = await fetch(`/api/admin/signatures/generate/${staff.id}`, {
        method: 'POST',
      })
      if (res.status === 401) { window.location.href = '/admin'; return }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Could not generate signature.')
      }
      const data: GenerateResponse = await res.json()
      setHtml(data.html)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Could not generate signature.')
    } finally {
      setLoading(false)
    }
  }, [staff.id])

  useEffect(() => { fetchSignature() }, [fetchSignature])

  /* ── Copy as rich content (same technique as modal) ───────────── */

  const copySignature = useCallback(async () => {
    const node = signatureRef.current
    if (!node) return
    setCopyError(null)
    try {
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html':  new Blob([node.innerHTML], { type: 'text/html'  }),
            'text/plain': new Blob([node.innerText], { type: 'text/plain' }),
          }),
        ])
        setCopied(true); setTimeout(() => setCopied(false), 3000)
        return
      }
    } catch { /* fall through */ }
    try {
      const range = document.createRange()
      range.selectNodeContents(node)
      const sel = window.getSelection()
      sel?.removeAllRanges(); sel?.addRange(range)
      const ok = document.execCommand('copy')
      sel?.removeAllRanges()
      if (!ok) throw new Error('execCommand failed')
      setCopied(true); setTimeout(() => setCopied(false), 3000)
    } catch {
      setCopyError('Copy failed. Select the signature and press Ctrl+C (Cmd+C).')
    }
  }, [])

  /* ── Delete ───────────────────────────────────────────────────── */

  const runDelete = useCallback(async () => {
    setConfirmDeleteOpen(false)
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch(`/api/admin/signatures/staff/${staff.id}`, {
        method: 'DELETE',
      })
      if (res.status === 401) { window.location.href = '/admin'; return }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || 'Delete failed.')
      }
      router.push('/admin/team/signatures?deleted=1')
      router.refresh()
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Delete failed.')
      setDeleting(false)
    }
  }, [staff.id, router])

  /* ── Render ───────────────────────────────────────────────────── */

  const fullName = `${staff.first_name} ${staff.last_name}`

  return (
    <div className="space-y-5 pt-2 lg:pt-0 max-w-6xl">
      <Link href="/admin/team/signatures"
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#f26b2b]">
        <ArrowLeft className="w-3 h-3" /> Back to Staff List
      </Link>

      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#03374f]">{fullName}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {staff.title}{staff.department ? ` · ${staff.department}` : ''}
            {!staff.active && (
              <span className="ml-2 text-[10px] uppercase tracking-wide bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                Inactive
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/team/signatures/${staff.id}/edit`}>
            <Button variant="outline">
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </Button>
          </Link>
          <Button variant="outline"
                  onClick={() => setConfirmDeleteOpen(true)}
                  disabled={deleting}
                  className="text-red-700 border-red-200 hover:bg-red-50 hover:text-red-700">
            {deleting
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting…</>
              : <><Trash2 className="w-4 h-4 mr-2" /> Delete</>}
          </Button>
        </div>
      </header>

      {deleteError && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{deleteError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ── Employee info ─────────────────────────────────────── */}
        <Card className="p-5 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-[#03374f]">
            Employee Information
          </h2>

          <Field icon={<AtSign className="w-3.5 h-3.5" />} label="Email">
            <a href={`mailto:${staff.email}`} className="text-[#f26b2b] hover:underline">
              {staff.email}
            </a>
          </Field>

          <Field icon={<Smartphone className="w-3.5 h-3.5" />} label="Cell phone" value={staff.cell_phone} />
          <Field icon={<Phone     className="w-3.5 h-3.5" />} label="Office direct" value={staff.office_direct} />
          <Field icon={<Printer   className="w-3.5 h-3.5" />} label="Fax"           value={staff.fax} />

          <Field icon={<Building2 className="w-3.5 h-3.5" />} label="Office">
            {office ? (
              <div className="space-y-0.5">
                <div className="text-[#03374f] font-medium">{office.display_name}</div>
                <div className="text-xs text-gray-500">{office.address_line1}</div>
                {office.address_line2 && (
                  <div className="text-xs text-gray-500">{office.address_line2}</div>
                )}
                <div className="text-xs text-gray-500">
                  {office.city}, {office.state} {office.zip}
                </div>
                {office.main_phone && (
                  <div className="text-xs text-gray-500">Main: {office.main_phone}</div>
                )}
              </div>
            ) : staff.office_location ? (
              <span className="text-amber-700 text-xs">
                Unknown slug: <code className="font-mono">{staff.office_location}</code>
              </span>
            ) : (
              <NotSet />
            )}
          </Field>

          {staff.full_legal_name && (
            <Field icon={<IdCard className="w-3.5 h-3.5" />} label="Full legal name">
              {staff.full_legal_name}
            </Field>
          )}

          <Field icon={<IdCard className="w-3.5 h-3.5" />} label="License #" value={staff.license_number} />

          {staff.linkedin_url && (
            <Field icon={<Linkedin className="w-3.5 h-3.5" />} label="LinkedIn">
              <a href={staff.linkedin_url} target="_blank" rel="noopener noreferrer"
                 className="text-[#f26b2b] hover:underline break-all">
                {staff.linkedin_url}
              </a>
            </Field>
          )}
          {staff.instagram_url && (
            <Field icon={<Instagram className="w-3.5 h-3.5" />} label="Instagram">
              <a href={staff.instagram_url} target="_blank" rel="noopener noreferrer"
                 className="text-[#f26b2b] hover:underline break-all">
                {staff.instagram_url}
              </a>
            </Field>
          )}

          <Field icon={<Mail className="w-3.5 h-3.5" />} label="Group email" value={staff.group_email} />

          <div className="pt-3 mt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-gray-500 uppercase tracking-wide text-[10px]">Status</div>
              <div className={staff.active ? 'text-green-700 font-medium' : 'text-gray-600'}>
                {staff.active ? 'Active' : 'Inactive'}
                {staff.part_time && ' · Part-time'}
              </div>
            </div>
            <div>
              <div className="text-gray-500 uppercase tracking-wide text-[10px]">Template</div>
              <div className="text-[#03374f] font-medium">Corporate Standard</div>
            </div>
          </div>

          <Field icon={<FileImage className="w-3.5 h-3.5" />} label="Photo">
            {staff.photo_url ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={staff.photo_url} alt={fullName}
                     className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                <span className="text-xs text-gray-500">Has photo</span>
              </div>
            ) : (
              <span className="text-xs text-gray-500">No photo — initials avatar used</span>
            )}
          </Field>
        </Card>

        {/* ── Signature preview ────────────────────────────────── */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[#03374f]">
              Signature Preview
            </h2>
            {!loading && !loadError && (
              <button onClick={fetchSignature}
                      className="text-xs text-gray-500 hover:text-[#f26b2b] inline-flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            )}
          </div>

          {loading && (
            <div className="border rounded-lg p-4 bg-white space-y-2"
                 role="status" aria-live="polite">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin text-[#f26b2b]" />
                Generating…
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
              <div ref={signatureRef}
                   dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          )}

          {copyError && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{copyError}</AlertDescription>
            </Alert>
          )}

          {!loading && !loadError && html && (
            <div className="space-y-2">
              <Button onClick={copySignature}
                      aria-label={copied ? 'Signature copied to clipboard' : 'Copy signature'}
                      className="w-full bg-[#f26b2b] hover:bg-[#d85a20] text-white">
                {copied
                  ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Copied! Paste into Outlook</>
                  : <><Copy className="w-4 h-4 mr-2" /> Copy Signature</>}
              </Button>
              <Button variant="outline" onClick={() => setModalOpen(true)} className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Email Signature to {staff.first_name}
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Reuse the modal for the Email flow (and as a full-screen Copy fallback). */}
      <SignaturePreviewModal
        open={modalOpen}
        staffId={staff.id}
        staffName={fullName}
        staffEmail={staff.email}
        onClose={() => setModalOpen(false)}
      />

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {fullName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the staff member row from the database.
              They will no longer appear in the Signature Center and any
              future signature generations will fail for this person.
              You can re-create them by uploading a CSV that contains their email.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={runDelete}
              className="bg-red-600 hover:bg-red-700 text-white">
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/* ─── Helpers ─────────────────────────────────────────────────────── */

function Field({
  icon, label, value, children,
}: {
  icon:     React.ReactNode
  label:    string
  value?:   string | null
  children?: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
      <div className="text-gray-500 flex items-center gap-1.5 text-xs pt-0.5">
        {icon}{label}
      </div>
      <div className="text-[#03374f] break-words">
        {children ?? (value ? value : <NotSet />)}
      </div>
    </div>
  )
}

function NotSet() {
  return <span className="text-gray-400 italic text-xs">(not set)</span>
}
