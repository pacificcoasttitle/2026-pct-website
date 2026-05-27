'use client'

/**
 * RecipientsManager — CRUD UI for marketing_recap_recipients + a read-only
 * view of the dynamic Sales Managers list pulled from vcard_employees.
 *
 * Two sources of recipients live side by side here so admins always see
 * the full audience that the weekly recap will reach:
 *
 *   1. Static list (this table). Add / edit / soft-delete via this UI.
 *   2. Sales managers (read-only panel below). Managed via the
 *      "Sales Manager" toggle on each employee profile.
 *
 * Conventions matched from existing admin pages:
 *   - Inline `InlineAlert` for success/error (no toast lib in this app).
 *   - Optimistic updates with rollback on API failure.
 *   - Modal-style edit/create via shadcn Dialog.
 *   - shadcn AlertDialog for the soft-delete confirmation.
 *   - Orange (#f26b2b) primary, navy (#03374f) text, green/gray status pills.
 */

import { useEffect, useMemo, useState } from 'react'
import {
  UserPlus, Pencil, Trash2, Loader2, Mail, Users, RotateCcw, Info, ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { InlineAlert } from '@/components/admin/marketing/shared'
import type { RecapRecipient, ActiveSalesManager } from '@/lib/admin-db'

/* ─── Types ──────────────────────────────────────────────────── */

interface Props {
  initialRecipients:    RecapRecipient[]
  initialSalesManagers: ActiveSalesManager[]
}

interface FormState {
  email: string
  name:  string
  role:  string
  notes: string
}

const EMPTY_FORM: FormState = { email: '', name: '', role: '', notes: '' }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/* ─── Helpers ────────────────────────────────────────────────── */

function validate(form: FormState): string | null {
  if (!form.name.trim())  return 'Name is required.'
  if (!form.email.trim()) return 'Email is required.'
  if (!EMAIL_RE.test(form.email.trim())) return 'Email format is invalid.'
  if (!form.role.trim())  return 'Role is required.'
  return null
}

function fromRecipient(r: RecapRecipient): FormState {
  return {
    email: r.email,
    name:  r.name,
    role:  r.role,
    notes: r.notes ?? '',
  }
}

/* ─── Component ──────────────────────────────────────────────── */

export function RecipientsManager({
  initialRecipients,
  initialSalesManagers,
}: Props) {
  const [recipients,    setRecipients]    = useState<RecapRecipient[]>(initialRecipients)
  const [salesManagers, setSalesManagers] = useState<ActiveSalesManager[]>(initialSalesManagers)
  const [salesLoading,  setSalesLoading]  = useState(false)

  const [error, setError] = useState('')
  const [info,  setInfo]  = useState('')

  // Modal state: null = closed; otherwise the recipient being edited (or
  // `{ id: 0 }` sentinel for "new recipient").
  type Editing =
    | null
    | { mode: 'new' }
    | { mode: 'edit'; recipient: RecapRecipient }
  const [editing, setEditing] = useState<Editing>(null)
  const [form,    setForm]    = useState<FormState>(EMPTY_FORM)
  const [saving,  setSaving]  = useState(false)

  // Toggle (active) inline state — tracks which row's checkbox is in
  // flight so we can disable just that one button.
  const [togglingId, setTogglingId] = useState<number | null>(null)

  // Delete confirmation state.
  const [confirmDelete, setConfirmDelete] = useState<RecapRecipient | null>(null)
  const [deleting,      setDeleting]      = useState(false)

  /* ── Refresh sales managers from API on mount ────────────── */
  // The server passes in an initial snapshot; if the user navigates back
  // from changing a Sales Manager toggle in the employee form, a
  // background refresh keeps the panel current without a hard reload.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setSalesLoading(true)
      try {
        const res = await fetch('/api/admin/marketing/recap/sales-managers')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to load sales managers')
        if (!cancelled) setSalesManagers(data.sales_managers || [])
      } catch (e) {
        // Non-fatal — initial snapshot is still shown.
        console.warn('[recipients] sales-manager refresh failed:', e)
      } finally {
        if (!cancelled) setSalesLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  /* ── Derived: active vs inactive split, dedup against managers ─ */
  const { active, inactive } = useMemo(() => {
    const a: RecapRecipient[] = []
    const i: RecapRecipient[] = []
    for (const r of recipients) (r.active ? a : i).push(r)
    return { active: a, inactive: i }
  }, [recipients])

  const salesManagerEmails = useMemo(
    () => new Set(salesManagers.map((m) => m.email.toLowerCase())),
    [salesManagers],
  )

  /* ── Modal open/close ────────────────────────────────────── */
  function openNew() {
    setForm(EMPTY_FORM)
    setError(''); setInfo('')
    setEditing({ mode: 'new' })
  }

  function openEdit(r: RecapRecipient) {
    setForm(fromRecipient(r))
    setError(''); setInfo('')
    setEditing({ mode: 'edit', recipient: r })
  }

  function closeModal() {
    if (saving) return
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  /* ── Create / update ─────────────────────────────────────── */
  async function submitForm() {
    if (!editing) return
    const validationErr = validate(form)
    if (validationErr) {
      setError(validationErr)
      return
    }
    setSaving(true)
    setError(''); setInfo('')

    try {
      if (editing.mode === 'new') {
        const res = await fetch('/api/admin/marketing/recap/recipients', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email.trim().toLowerCase(),
            name:  form.name.trim(),
            role:  form.role.trim(),
            notes: form.notes.trim() || undefined,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Create failed')
        setRecipients((prev) => [...prev, data.recipient].sort(byName))
        setInfo(`Added ${data.recipient.name}.`)
      } else {
        const id = editing.recipient.id
        // Optimistic local update — patch the row first, roll back on error.
        const prevSnapshot = recipients
        setRecipients((prev) => prev.map((r) =>
          r.id === id
            ? { ...r, email: form.email.trim().toLowerCase(), name: form.name.trim(), role: form.role.trim(), notes: form.notes.trim() || null }
            : r,
        ).sort(byName))
        try {
          const res = await fetch(`/api/admin/marketing/recap/recipients/${id}`, {
            method:  'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: form.email.trim().toLowerCase(),
              name:  form.name.trim(),
              role:  form.role.trim(),
              notes: form.notes.trim() || null,
            }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Update failed')
          // Replace with server-truth row (date columns etc.).
          setRecipients((prev) => prev.map((r) => r.id === id ? data.recipient : r).sort(byName))
          setInfo(`Updated ${data.recipient.name}.`)
        } catch (e) {
          setRecipients(prevSnapshot)
          throw e
        }
      }
      setEditing(null)
      setForm(EMPTY_FORM)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  /* ── Active toggle (optimistic + rollback) ───────────────── */
  async function toggleActive(r: RecapRecipient) {
    const nextActive = !r.active
    setTogglingId(r.id)
    setError(''); setInfo('')
    const prevSnapshot = recipients
    setRecipients((prev) => prev.map((x) => x.id === r.id ? { ...x, active: nextActive } : x))
    try {
      const res = await fetch(`/api/admin/marketing/recap/recipients/${r.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextActive }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Toggle failed')
      setRecipients((prev) => prev.map((x) => x.id === r.id ? data.recipient : x))
      setInfo(`${r.name} is now ${nextActive ? 'active' : 'inactive'}.`)
    } catch (e) {
      setRecipients(prevSnapshot)
      setError(e instanceof Error ? e.message : 'Toggle failed')
    } finally {
      setTogglingId(null)
    }
  }

  /* ── Soft-delete ─────────────────────────────────────────── */
  async function confirmSoftDelete() {
    if (!confirmDelete) return
    const r = confirmDelete
    setDeleting(true)
    setError(''); setInfo('')
    const prevSnapshot = recipients
    setRecipients((prev) => prev.map((x) => x.id === r.id ? { ...x, active: false } : x))
    try {
      const res = await fetch(`/api/admin/marketing/recap/recipients/${r.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Delete failed')
      setInfo(`${r.name} archived (set inactive).`)
      setConfirmDelete(null)
    } catch (e) {
      setRecipients(prevSnapshot)
      setError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="space-y-5">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          {active.length} active · {inactive.length} inactive
        </p>
        <Button
          onClick={openNew}
          className="bg-[#f26b2b] hover:bg-[#d8551b] text-white"
        >
          <UserPlus className="w-4 h-4 mr-1.5" /> Add Recipient
        </Button>
      </div>

      {error && <InlineAlert kind="error"   message={error} onClose={() => setError('')} />}
      {info  && <InlineAlert kind="success" message={info}  onClose={() => setInfo('')} />}

      {/* Active table */}
      <Card className="p-0 overflow-hidden gap-0">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#f26b2b]" />
            <h2 className="font-semibold text-[#03374f] text-sm">Static Recipients</h2>
          </div>
          <span className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">
            Managed here
          </span>
        </div>

        {recipients.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-500 mb-1">No recipients yet.</p>
            <p className="text-xs text-gray-400">
              Click <span className="font-semibold">Add Recipient</span> above to start.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-2.5 text-xs font-semibold text-gray-500">Name</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500">Email</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500">Role</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500">Status</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...active, ...inactive].map((r) => {
                  const dupOfManager = r.active && salesManagerEmails.has(r.email.toLowerCase())
                  return (
                    <tr
                      key={r.id}
                      className={`border-t border-gray-50 ${r.active ? 'hover:bg-gray-50/60' : 'bg-gray-50/40 text-gray-400'}`}
                    >
                      <td className="px-5 py-2.5">
                        <div className={`font-medium ${r.active ? 'text-[#03374f]' : 'text-gray-400'}`}>{r.name}</div>
                        {r.notes && <div className="text-[11px] text-gray-400 mt-0.5">{r.notes}</div>}
                        {dupOfManager && (
                          <div className="text-[11px] text-amber-700 mt-0.5 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            Also a Sales Manager — they&apos;ll be deduped at send time.
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[12px]">{r.email}</td>
                      <td className="px-3 py-2.5">{r.role}</td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => toggleActive(r)}
                          disabled={togglingId === r.id}
                          className="inline-flex items-center gap-2 group disabled:opacity-50"
                          title={r.active ? 'Click to deactivate' : 'Click to reactivate'}
                        >
                          <div className={`w-9 h-5 rounded-full transition-all relative flex-shrink-0 ${
                            r.active ? 'bg-[#f26b2b]' : 'bg-gray-300'
                          }`}>
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                              r.active ? 'left-[18px]' : 'left-0.5'
                            }`} />
                          </div>
                          <span className={`text-[11px] font-medium ${
                            r.active ? 'text-emerald-700' : 'text-gray-400'
                          }`}>
                            {togglingId === r.id ? '…' : r.active ? 'Active' : 'Inactive'}
                          </span>
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEdit(r)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-[#03374f] hover:bg-gray-100"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {r.active && (
                            <button
                              onClick={() => setConfirmDelete(r)}
                              className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50"
                              title="Archive (soft-delete)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {!r.active && (
                            <button
                              onClick={() => toggleActive(r)}
                              disabled={togglingId === r.id}
                              className="p-1.5 rounded-md text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                              title="Reactivate"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Sales Managers — read-only panel */}
      <Card className="p-0 overflow-hidden gap-0">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#f26b2b]" />
            <h2 className="font-semibold text-[#03374f] text-sm">Sales Managers (from flag)</h2>
          </div>
          <span className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">
            Read only
          </span>
        </div>
        <div className="px-5 py-3 bg-amber-50/40 border-b border-amber-100 text-[11px] text-amber-800 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>
            Sales Managers are added or removed via the <span className="font-semibold">Sales Manager</span> toggle on each employee&apos;s profile. To change this list, edit the rep&apos;s employee record.
          </span>
        </div>

        {salesLoading && salesManagers.length === 0 ? (
          <div className="px-5 py-4 space-y-2">
            <Skeleton className="h-6 w-full bg-gray-200" />
            <Skeleton className="h-6 w-full bg-gray-200" />
          </div>
        ) : salesManagers.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <Users className="w-6 h-6 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-1">No Sales Managers flagged.</p>
            <p className="text-xs text-gray-400">
              Set <span className="font-semibold">Sales Manager</span> = on for any rep in their employee profile to add them here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-2.5 text-xs font-semibold text-gray-500">Name</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500">Email</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500">SMS Code</th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 text-right">Source</th>
                </tr>
              </thead>
              <tbody>
                {salesManagers.map((m) => (
                  <tr key={m.email} className="border-t border-gray-50 hover:bg-gray-50/60">
                    <td className="px-5 py-2.5 font-medium text-[#03374f]">
                      {`${m.first_name} ${m.last_name}`.trim() || m.email}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[12px]">{m.email}</td>
                    <td className="px-3 py-2.5 text-gray-500">{m.sms_code || '—'}</td>
                    <td className="px-3 py-2.5 text-right text-[11px] text-gray-400">
                      Set via Employee profile
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Create / Edit modal ─────────────────────────────────── */}
      <Dialog open={editing !== null} onOpenChange={(open) => { if (!open) closeModal() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing?.mode === 'new' ? 'Add Recipient' : 'Edit Recipient'}
            </DialogTitle>
            <DialogDescription>
              {editing?.mode === 'new'
                ? 'Add someone to the static recipients list for the weekly recap email.'
                : 'Update this recipient. Changes save when you click Save.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="recip-name">Name <span className="text-red-500">*</span></Label>
              <Input
                id="recip-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Rudy Hernandez"
                maxLength={120}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recip-email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="recip-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="rudy@pct.com"
                maxLength={254}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recip-role">Role <span className="text-red-500">*</span></Label>
              <Input
                id="recip-role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="CEO, Operations, etc."
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="recip-notes">Notes <span className="text-gray-400 font-normal">(optional)</span></Label>
              <Textarea
                id="recip-notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                placeholder="Internal note about why this person is on the list."
                maxLength={2000}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={submitForm}
              disabled={saving}
              className="bg-[#f26b2b] hover:bg-[#d8551b] text-white"
            >
              {saving && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {editing?.mode === 'new' ? 'Add Recipient' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Soft-delete confirmation ───────────────────────────── */}
      <AlertDialog open={confirmDelete !== null} onOpenChange={(open) => { if (!open) setConfirmDelete(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {confirmDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This sets the recipient to <span className="font-semibold">inactive</span> — they won&apos;t receive the recap, but the record is preserved and can be reactivated later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSoftDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/* ─── Sort helper ────────────────────────────────────────────── */

function byName(a: RecapRecipient, b: RecapRecipient): number {
  return a.name.localeCompare(b.name)
}
