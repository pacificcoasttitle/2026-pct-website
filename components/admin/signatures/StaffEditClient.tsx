'use client'

/**
 * StaffEditClient — form for updating a staff_members row.
 *
 * Fields are grouped (Photo / Identity / Role / Contact / Office /
 * Compliance / Status). Photo upload posts to /api/admin/signatures/upload (R2);
 * the returned URL is stashed in the form state but not persisted until
 * the user clicks Save. The form PATCHes /api/admin/signatures/staff/[id]
 * with only the fields the user changed (no full overwrites) so concurrent
 * edits are less destructive.
 */
import { useCallback, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Loader2, Upload, Trash2, AlertCircle, Save, X, FileImage, Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { StaffMember, OfficeLocation } from '@/lib/admin-db'

interface Props {
  staff:   StaffMember
  offices: OfficeLocation[]
}

interface FormState {
  first_name:      string
  last_name:       string
  full_legal_name: string
  title:           string
  department:      string
  email:           string
  office_direct:   string
  cell_phone:      string
  fax:             string
  office_location: string  // '' = none, otherwise a slug
  photo_url:       string  // '' = remove
  license_number:  string
  linkedin_url:    string
  instagram_url:   string
  group_email:     string
  active:          boolean
  part_time:       boolean
}

const NO_OFFICE = '__none__'  // shadcn Select doesn't allow empty value

// HR-sync Stage 7 (design §5): the SHARED identity fields managed in HR.
// These are read-only in this form, stripped from the PATCH body, and
// excluded from validation (a blank legacy shared value must not block a
// section-only save). Section fields (fax, group_email, linkedin_url,
// instagram_url, part_time) stay fully editable.
const SHARED_FIELDS: ReadonlySet<keyof FormState> = new Set([
  'first_name', 'last_name', 'full_legal_name', 'title', 'department',
  'email', 'office_direct', 'cell_phone', 'office_location',
  'license_number', 'active', 'photo_url',
])

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024  // 5 MB

function initialForm(s: StaffMember): FormState {
  return {
    first_name:      s.first_name,
    last_name:       s.last_name,
    full_legal_name: s.full_legal_name || '',
    title:           s.title,
    department:      s.department || '',
    email:           s.email,
    office_direct:   s.office_direct || '',
    cell_phone:      s.cell_phone || '',
    fax:             s.fax || '',
    office_location: s.office_location || '',
    photo_url:       s.photo_url || '',
    license_number:  s.license_number || '',
    linkedin_url:    s.linkedin_url || '',
    instagram_url:   s.instagram_url || '',
    group_email:     s.group_email || '',
    active:          s.active,
    part_time:       s.part_time,
  }
}

export function StaffEditClient({ staff, offices }: Props) {
  const router = useRouter()
  const original = useMemo(() => initialForm(staff), [staff])
  const [form, setForm] = useState<FormState>(original)

  const [saving,    setSaving]    = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [uploading,    setUploading]    = useState(false)
  const [uploadError,  setUploadError]  = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const fullName = `${staff.first_name} ${staff.last_name}`

  /* ── Field setters ────────────────────────────────────────────── */

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    if (fieldErrors[key as string]) {
      setFieldErrors((fe) => {
        const next = { ...fe }; delete next[key as string]; return next
      })
    }
  }

  /* ── Photo upload ─────────────────────────────────────────────── */

  const handleFile = useCallback(async (file: File | null | undefined) => {
    if (!file) return
    setUploadError(null)

    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      setUploadError('Photo must be a PNG, JPG, or WebP image.')
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError(`Photo is ${(file.size / 1024 / 1024).toFixed(1)} MB. Maximum is 5 MB.`)
      return
    }

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/signatures/upload', { method: 'POST', body: fd })
      if (res.status === 401) { window.location.href = '/admin'; return }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || `Upload failed (${res.status})`)
      }
      const data = await res.json() as { url: string }
      if (!data.url) throw new Error('Upload succeeded but no URL returned.')
      set('photo_url', data.url)
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }, [])

  /* ── Save ─────────────────────────────────────────────────────── */

  // HR-sync Stage 7: the previously-required fields (first_name, last_name,
  // title, email) are now SHARED + read-only, so they're no longer
  // validated here — a blank legacy shared value must NOT block a
  // section-only save (HR owns those fields). There are no required
  // EDITABLE section fields, so validation is a no-op pass; kept as a hook
  // for any future section-field rules.
  function validate(): boolean {
    setFieldErrors({})
    return true
  }

  // Build a Partial payload containing only fields that changed. This
  // matches the PATCH endpoint's "skip undefined" behavior and minimises
  // the surface area for collisions when two admins edit the same row.
  function buildPatch(): Record<string, unknown> {
    const patch: Record<string, unknown> = {}
    const keys = Object.keys(form) as (keyof FormState)[]
    for (const k of keys) {
      // ⚠️ HR-sync Stage 7: NEVER send a shared key, even if its state
      // changed (e.g. via a photo upload that mutated photo_url, or a
      // stale value). HR is the sole editor; the server PATCH allowlist
      // also strips these, but we keep the wire clean here.
      if (SHARED_FIELDS.has(k)) continue
      const cur = form[k]
      const old = original[k]
      if (cur === old) continue
      // Normalize empty strings on nullable section fields → null.
      // (part_time is boolean; the rest of the editable section fields are
      // nullable strings.)
      if (k !== 'part_time') {
        patch[k] = typeof cur === 'string' && cur.trim() === '' ? null : cur
      } else {
        patch[k] = cur
      }
    }
    return patch
  }

  const handleSave = useCallback(async () => {
    setSaveError(null)
    if (!validate()) return

    const patch = buildPatch()
    if (Object.keys(patch).length === 0) {
      router.push(`/admin/team/signatures/${staff.id}`)
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/signatures/staff/${staff.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(patch),
      })
      if (res.status === 401) { window.location.href = '/admin'; return }
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (data?.field) {
          setFieldErrors({ [data.field]: data.error || 'Invalid value' })
        }
        throw new Error(data?.error || `Save failed (${res.status})`)
      }
      router.push(`/admin/team/signatures/${staff.id}?saved=1`)
      router.refresh()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed.')
      setSaving(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, original, router, staff.id])

  /* ── Photo preview source ─────────────────────────────────────── */

  const photoPreviewSrc = form.photo_url ||
    `https://ui-avatars.com/api/?${new URLSearchParams({
      name:       `${form.first_name} ${form.last_name}`.trim() || 'Staff Member',
      size:       '160',
      background: '03374f',
      color:      'ffffff',
      bold:       'true',
      format:     'png',
      rounded:    'true',
    }).toString()}`

  /* ── Render ───────────────────────────────────────────────────── */

  return (
    <div className="space-y-5 pt-2 lg:pt-0 max-w-3xl">
      <Link href={`/admin/team/signatures/${staff.id}`}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#f26b2b]">
        <ArrowLeft className="w-3 h-3" /> Back to Detail
      </Link>

      <header>
        <h1 className="text-2xl font-bold text-[#03374f]">
          Edit: {fullName}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Changes are saved when you click Save. Photo uploads to R2 immediately
          but the URL is only persisted on save.
        </p>
      </header>

      {saveError && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      {/* ── Photo ────────────────────────────────────────────── */}
      <Card className="p-5 space-y-3">
        <SectionHeader title="Photo" />
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoPreviewSrc}
            alt="Photo preview"
            className="w-20 h-20 rounded-full object-cover border border-gray-200 bg-gray-50"
          />
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files?.[0])
                e.target.value = ''
              }}
            />
            {/* HR-sync Stage 7: photo is a SHARED field managed in HR — the
                whole control set (upload, remove, file input) is disabled
                as a unit. The photo still displays for context. */}
            <div className="flex gap-2">
              <Button type="button" variant="outline" disabled title="Managed in HR">
                <Upload className="w-4 h-4 mr-2" /> Upload New Photo
              </Button>
              {form.photo_url && (
                <Button type="button" variant="outline" disabled title="Managed in HR"
                        className="text-gray-400 border-gray-200">
                  <Trash2 className="w-4 h-4 mr-2" /> Remove Photo
                </Button>
              )}
            </div>
            <ManagedInHr />
            <p className="text-xs text-gray-500 inline-flex items-center gap-1">
              <FileImage className="w-3 h-3" />
              The headshot is managed in HR and syncs here automatically.
            </p>
            {!form.photo_url && (
              <p className="text-xs text-gray-500">
                No photo set — initials avatar will be used.
              </p>
            )}
          </div>
        </div>
        {uploadError && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}
      </Card>

      {/* ── Identity ─────────────────────────────────────────── */}
      <Card className="p-5 space-y-3">
        <SectionHeader title="Identity" />
        {/* HR-sync Stage 7: name + full legal name are SHARED → read-only. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldInput label="First name" readOnly
                      value={form.first_name}
                      onChange={(v) => set('first_name', v)} />
          <FieldInput label="Last name" readOnly
                      value={form.last_name}
                      onChange={(v) => set('last_name', v)} />
        </div>
        <FieldInput label="Full legal name" readOnly
                    value={form.full_legal_name}
                    onChange={(v) => set('full_legal_name', v)} />
      </Card>

      {/* ── Role ─────────────────────────────────────────────── */}
      <Card className="p-5 space-y-3">
        <SectionHeader title="Role" />
        {/* HR-sync Stage 7: title + department are SHARED → read-only. */}
        <FieldInput label="Title" readOnly
                    value={form.title}
                    onChange={(v) => set('title', v)} />
        <FieldInput label="Department" readOnly
                    value={form.department}
                    onChange={(v) => set('department', v)} />
      </Card>

      {/* ── Contact ──────────────────────────────────────────── */}
      <Card className="p-5 space-y-3">
        <SectionHeader title="Contact" />
        {/* HR-sync Stage 7: email + phones are SHARED → read-only.
            Fax + group email are SECTION fields → stay editable. */}
        <FieldInput label="Email" readOnly type="email"
                    value={form.email}
                    onChange={(v) => set('email', v)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldInput label="Office direct" readOnly
                      value={form.office_direct}
                      onChange={(v) => set('office_direct', v)} />
          <FieldInput label="Cell phone" readOnly
                      value={form.cell_phone}
                      onChange={(v) => set('cell_phone', v)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldInput label="Fax"
                      value={form.fax}
                      onChange={(v) => set('fax', v)} />
          <FieldInput label="Group email"
                      value={form.group_email}
                      onChange={(v) => set('group_email', v)} />
        </div>
      </Card>

      {/* ── Office ───────────────────────────────────────────── */}
      <Card className="p-5 space-y-3">
        <SectionHeader title="Office" />
        <div className="space-y-1.5">
          <Label htmlFor="office_location" className="text-xs text-gray-600">
            Office location
          </Label>
          {/* HR-sync Stage 7: office is a SHARED field → read-only. */}
          <Select
            disabled
            value={form.office_location === '' ? NO_OFFICE : form.office_location}
            onValueChange={(v) => set('office_location', v === NO_OFFICE ? '' : v)}>
            <SelectTrigger id="office_location" title="Managed in HR" className="bg-gray-100 text-gray-500 cursor-not-allowed">
              <SelectValue placeholder="Select an office" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_OFFICE}>— None —</SelectItem>
              {offices.map((o) => (
                <SelectItem key={o.slug} value={o.slug}>
                  {o.display_name} ({o.city}, {o.state})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ManagedInHr />
        </div>
      </Card>

      {/* ── Compliance ───────────────────────────────────────── */}
      <Card className="p-5 space-y-3">
        <SectionHeader title="Compliance" />
        {/* HR-sync Stage 7: license number is SHARED → read-only.
            LinkedIn + Instagram are SECTION fields → stay editable. */}
        <FieldInput label="License number (DRE / NMLS)" readOnly
                    value={form.license_number}
                    onChange={(v) => set('license_number', v)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FieldInput label="LinkedIn URL"
                      value={form.linkedin_url}
                      onChange={(v) => set('linkedin_url', v)} />
          <FieldInput label="Instagram URL"
                      value={form.instagram_url}
                      onChange={(v) => set('instagram_url', v)} />
        </div>
      </Card>

      {/* ── Status ───────────────────────────────────────────── */}
      <Card className="p-5 space-y-3">
        <SectionHeader title="Status" />
        {/* HR-sync Stage 7: active is a SHARED field → read-only. */}
        <div className="flex items-center gap-2" title="Managed in HR">
          <Checkbox id="active"
                    checked={form.active}
                    disabled
                    onCheckedChange={(c) => set('active', c === true)} />
          <Label htmlFor="active" className="cursor-not-allowed text-gray-500">
            Active
            <span className="ml-2"><ManagedInHr /></span>
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="part_time"
                    checked={form.part_time}
                    onCheckedChange={(c) => set('part_time', c === true)} />
          <Label htmlFor="part_time" className="cursor-pointer">Part-time</Label>
        </div>
      </Card>

      {/* ── Footer actions ───────────────────────────────────── */}
      <div className="flex justify-between sticky bottom-0 bg-white border-t border-gray-100 -mx-1 px-1 py-3">
        <Link href={`/admin/team/signatures/${staff.id}`}>
          <Button variant="ghost" disabled={saving}>
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
        </Link>
        <Button onClick={handleSave}
                disabled={saving}
                className="bg-[#f26b2b] hover:bg-[#d85a20] text-white">
          {saving
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…</>
            : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
        </Button>
      </div>
    </div>
  )
}

/* ─── Tiny field primitives ────────────────────────────────────── */

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wide text-[#03374f]">
      {title}
    </h2>
  )
}

function FieldInput({
  label, value, onChange, required, type, error, readOnly,
}: {
  label:    string
  value:    string
  onChange: (v: string) => void
  required?: boolean
  type?:     string
  error?:    string
  /** HR-sync Stage 7: shared field managed in HR — disabled + hinted. */
  readOnly?: boolean
}) {
  const id = `f-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-gray-600">
        {label} {required && !readOnly && <span className="text-[#f26b2b]">*</span>}
      </Label>
      <Input id={id} type={type || 'text'} value={value}
             onChange={(e) => onChange(e.target.value)}
             disabled={readOnly}
             readOnly={readOnly}
             aria-invalid={!!error}
             title={readOnly ? 'Managed in HR' : undefined}
             className={
               readOnly
                 ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                 : error ? 'border-red-300 focus-visible:ring-red-200' : ''
             } />
      {readOnly
        ? <ManagedInHr />
        : error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

/** Small "Managed in HR" hint shown beneath each read-only shared field. */
function ManagedInHr() {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#03374f]/60">
      <Lock className="w-3 h-3" />
      Managed in HR
    </span>
  )
}
