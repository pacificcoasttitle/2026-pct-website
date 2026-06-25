'use client'

/**
 * CsvImporter — client-side staff CSV import wizard.
 *
 * Steps:
 *   1. select  — drop zone + template download
 *   2. preview — parsed rows + recognized vs. ignored columns
 *   3. validate — POST mode=preview, show counts/errors/conflicts
 *   4. done    — POST mode=commit, show results
 *
 * Backend only accepts already-parsed rows (papaparse runs here).
 * All branching happens off `step` state; no router changes.
 */
import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Papa from 'papaparse'
import {
  Upload, FileText, ArrowLeft, ArrowRight, Download, CheckCircle2,
  XCircle, AlertTriangle, Info, Loader2, RefreshCw, Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import type { OfficeLocation } from '@/lib/admin-db'

/* ─── Schema constants (mirror /api/admin/marketing/signatures/import) ─── */

const REQUIRED_COLUMNS = ['first_name', 'last_name', 'title', 'email'] as const

const OPTIONAL_COLUMNS = [
  'full_legal_name', 'department', 'office_direct', 'cell_phone', 'fax',
  'office_location', 'license_number', 'linkedin_url', 'instagram_url',
  'group_email', 'photo_url', 'active', 'part_time',
] as const

const RECOGNIZED_COLUMNS = new Set<string>([...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS])
const REQUIRED_SET       = new Set<string>(REQUIRED_COLUMNS)

const MAX_FILE_BYTES = 5 * 1024 * 1024  // 5 MB
const MAX_ROWS       = 500

type Step = 'select' | 'preview' | 'validate' | 'done'

type ParsedRow = Record<string, string>

interface ValidationError {
  row_number: number
  email:      string | null
  field:      string
  error:      string
}

interface ApiResponse {
  mode:                       'preview' | 'commit'
  total_rows:                 number
  valid_rows:                 number
  invalid_rows:               number
  duplicate_emails_in_batch:  string[]
  emails_already_in_db:       string[]
  validation_errors:          ValidationError[]
  invalid_office_locations:   string[]
  // commit-only:
  imported?: number
  updated?:  number
  failed?:   number
  errors?:   Array<{ row_number: number; error: string }>
}

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function normaliseHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, '_')
}

// Strip booleans down to the row payload the API expects. Booleans get
// coerced from common truthy/falsy strings; everything else stays string.
function coerceForApi(rows: ParsedRow[]): Array<Record<string, string | boolean>> {
  return rows.map((r) => {
    const out: Record<string, string | boolean> = {}
    for (const [k, v] of Object.entries(r)) {
      if (!RECOGNIZED_COLUMNS.has(k)) continue
      if (k === 'active' || k === 'part_time') {
        const s = String(v ?? '').trim().toLowerCase()
        if (s === '') continue
        out[k] = s === 'true' || s === 'yes' || s === '1' || s === 'y'
      } else {
        out[k] = String(v ?? '')
      }
    }
    return out
  })
}

function buildTemplateCsv(): string {
  const headers = [
    'first_name', 'last_name', 'full_legal_name', 'title', 'department',
    'email', 'office_direct', 'cell_phone', 'fax', 'office_location',
    'license_number', 'linkedin_url', 'instagram_url', 'group_email',
  ]
  const exampleRow = [
    'Jerry', 'Hernandez', 'Gerardo Hernandez',
    'Manager of Product Development', 'Marketing',
    'ghernandez@pct.com', '818.662.6727', '', '', 'glendale',
    '', '', '', '',
  ]
  const placeholderRow = [
    'Example Row 2 (delete this row before uploading)',
    ...Array(headers.length - 1).fill(''),
  ]
  const esc = (s: string) =>
    /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  return [headers, exampleRow, placeholderRow]
    .map((row) => row.map(esc).join(','))
    .join('\n') + '\n'
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/* ─── Component ───────────────────────────────────────────────────────── */

export function CsvImporter({ offices }: { offices: OfficeLocation[] }) {
  const [step, setStep] = useState<Step>('select')

  // Step 1 → 2
  const [fileName, setFileName] = useState('')
  const [rows,     setRows]     = useState<ParsedRow[]>([])
  const [headers,  setHeaders]  = useState<string[]>([])
  const [fileError, setFileError] = useState<string | null>(null)
  const [parsing,   setParsing]   = useState(false)
  const [dragOver,  setDragOver]  = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Step 2 → 3
  const [validating, setValidating] = useState(false)
  const [previewResult, setPreviewResult] = useState<ApiResponse | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  // Step 3 → 4
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [committing,  setCommitting]  = useState(false)
  const [commitResult, setCommitResult] = useState<ApiResponse | null>(null)

  /* ── Step 1: file selection ───────────────────────────────────── */

  function resetAll() {
    setFileName(''); setRows([]); setHeaders([])
    setFileError(null); setPreviewResult(null); setCommitResult(null)
    setApiError(null); setStep('select')
  }

  function handleFile(file: File | undefined | null) {
    if (!file) return
    setFileError(null)

    if (file.size > MAX_FILE_BYTES) {
      setFileError(`File is ${(file.size / 1024 / 1024).toFixed(1)} MB. Maximum is 5 MB. Try splitting it into smaller files.`)
      return
    }
    const looksLikeCsv = /\.csv$/i.test(file.name) ||
      file.type === 'text/csv' || file.type === 'application/vnd.ms-excel'
    if (!looksLikeCsv) {
      setFileError('File does not look like a CSV. Save your spreadsheet as .csv (UTF-8) and try again.')
      return
    }

    setFileName(file.name)
    setParsing(true)

    Papa.parse<ParsedRow>(file, {
      header:           true,
      skipEmptyLines:   true,
      transformHeader:  normaliseHeader,
      complete: (results) => {
        setParsing(false)
        const data = (results.data || []).filter(
          (r) => r && Object.values(r).some((v) => String(v ?? '').trim() !== ''),
        )
        if (data.length === 0) {
          setFileError('No data rows found. Check your file.')
          setFileName('')
          return
        }
        if (data.length > MAX_ROWS) {
          setFileError(`Found ${data.length} rows. Maximum is ${MAX_ROWS} per upload. Split your file and upload in batches.`)
          setFileName('')
          return
        }
        setRows(data)
        setHeaders(results.meta.fields || [])
        setStep('preview')
      },
      error: (err) => {
        setParsing(false)
        setFileError(`Could not parse CSV: ${err.message}`)
        setFileName('')
      },
    })
  }

  /* ── Step 2 → 3: validate ─────────────────────────────────────── */

  async function runPreview() {
    setApiError(null)
    setValidating(true)
    try {
      const res = await fetch('/api/admin/marketing/signatures/import', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ mode: 'preview', rows: coerceForApi(rows) }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || `Server returned ${res.status}`)
      }
      const data: ApiResponse = await res.json()
      setPreviewResult(data)
      setStep('validate')
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Could not reach the server. Please try again.')
    } finally {
      setValidating(false)
    }
  }

  /* ── Step 3 → 4: commit ───────────────────────────────────────── */

  async function runCommit() {
    setConfirmOpen(false)
    setApiError(null)
    setCommitting(true)
    try {
      const res = await fetch('/api/admin/marketing/signatures/import', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ mode: 'commit', rows: coerceForApi(rows) }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error || `Server returned ${res.status}. Please try again or contact an admin.`)
      }
      const data: ApiResponse = await res.json()
      setCommitResult(data)
      setStep('done')
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Import failed. Please try again.')
    } finally {
      setCommitting(false)
    }
  }

  function downloadFailedRowsCsv() {
    if (!commitResult || !commitResult.errors?.length) return
    const failedRowNums = new Set(commitResult.errors.map((e) => e.row_number))
    const failedRows    = rows.filter((_r, i) => failedRowNums.has(i + 1))
    const cols          = headers.length ? headers : Object.keys(failedRows[0] || {})
    const esc = (s: string) => /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    const csv = [
      cols.join(','),
      ...failedRows.map((r) => cols.map((c) => esc(String(r[c] ?? ''))).join(',')),
    ].join('\n') + '\n'
    downloadCsv('failed-rows.csv', csv)
  }

  /* ── Render dispatch ─────────────────────────────────────────── */

  return (
    <div className="space-y-5">
      <Stepper step={step} />

      {apiError && (
        <Alert variant="destructive">
          <XCircle className="w-4 h-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            {apiError}
            <div className="mt-2">
              <Button size="sm" variant="outline" onClick={() => setApiError(null)}>
                Dismiss
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {step === 'select' && (
        <SelectStep
          offices={offices}
          dragOver={dragOver}
          parsing={parsing}
          fileError={fileError}
          onPickFile={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            handleFile(e.dataTransfer.files?.[0])
          }}
          onDownloadTemplate={() => downloadCsv('pct-staff-template.csv', buildTemplateCsv())}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          // reset value so re-uploading the same file fires onChange
          e.target.value = ''
        }}
      />

      {step === 'preview' && (
        <PreviewStep
          fileName={fileName}
          rows={rows}
          headers={headers}
          validating={validating}
          onBack={resetAll}
          onContinue={runPreview}
        />
      )}

      {step === 'validate' && previewResult && (
        <ValidateStep
          result={previewResult}
          committing={committing}
          onBack={() => setStep('preview')}
          onConfirm={() => setConfirmOpen(true)}
        />
      )}

      {step === 'done' && commitResult && (
        <DoneStep
          result={commitResult}
          onDownloadFailures={downloadFailedRowsCsv}
          onImportAnother={resetAll}
        />
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import staff members?</AlertDialogTitle>
            <AlertDialogDescription>
              {previewResult && (
                <>
                  Import {previewResult.valid_rows} staff{previewResult.valid_rows === 1 ? '' : ' members'}?{' '}
                  {Math.max(0, previewResult.valid_rows - previewResult.emails_already_in_db.length)} will be created,{' '}
                  {previewResult.emails_already_in_db.length} will be updated.
                  This action cannot be easily undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={runCommit}
              className="bg-[#f26b2b] hover:bg-[#d85a20] text-white">
              Confirm Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/* ─── Subviews ────────────────────────────────────────────────────────── */

function Stepper({ step }: { step: Step }) {
  const order: Step[] = ['select', 'preview', 'validate', 'done']
  const labels: Record<Step, string> = {
    select:   'Select File',
    preview:  'Preview',
    validate: 'Validate',
    done:     'Done',
  }
  const activeIdx = order.indexOf(step)
  return (
    <div className="flex items-center gap-2 text-xs">
      {order.map((s, i) => {
        const isActive = i === activeIdx
        const isDone   = i < activeIdx
        return (
          <div key={s} className="flex items-center gap-2">
            <span
              className={[
                'w-6 h-6 rounded-full flex items-center justify-center font-semibold',
                isActive ? 'bg-[#f26b2b] text-white' :
                isDone   ? 'bg-[#03374f] text-white' :
                           'bg-gray-200 text-gray-500',
              ].join(' ')}>
              {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
            </span>
            <span className={isActive ? 'font-medium text-[#03374f]' : 'text-gray-500'}>
              {labels[s]}
            </span>
            {i < order.length - 1 && (
              <span className={`w-8 h-px ${isDone ? 'bg-[#03374f]' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function SelectStep(props: {
  offices:            OfficeLocation[]
  dragOver:           boolean
  parsing:            boolean
  fileError:          string | null
  onPickFile:         () => void
  onDragOver:         (e: React.DragEvent) => void
  onDragLeave:        () => void
  onDrop:             (e: React.DragEvent) => void
  onDownloadTemplate: () => void
}) {
  const { offices, dragOver, parsing, fileError,
          onPickFile, onDragOver, onDragLeave, onDrop, onDownloadTemplate } = props

  return (
    <div className="space-y-5">
      <Card className="p-6 space-y-4">
        <div
          onClick={onPickFile}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={[
            'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors',
            dragOver
              ? 'border-[#f26b2b] bg-[#f26b2b]/5'
              : 'border-gray-300 hover:border-[#f26b2b] hover:bg-gray-50',
          ].join(' ')}>
          {parsing ? (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin text-[#f26b2b]" />
              <p className="text-sm">Parsing CSV…</p>
              <Skeleton className="h-3 w-40 bg-gray-200" />
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 mx-auto text-[#f26b2b] mb-3" />
              <p className="text-sm font-medium text-[#03374f]">
                Drop CSV file here or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Maximum {MAX_ROWS} rows · UTF-8 encoded · 5 MB max
              </p>
            </>
          )}
        </div>

        {fileError && (
          <Alert variant="destructive">
            <XCircle className="w-4 h-4" />
            <AlertDescription>{fileError}</AlertDescription>
          </Alert>
        )}

        <Button variant="outline" onClick={onDownloadTemplate}>
          <Download className="w-4 h-4 mr-2" />
          Download Template CSV
        </Button>

        {/* HR-sync Stage 7: shared identity columns are ignored for EXISTING
            staff on import (managed in HR). Server enforces this. */}
        <p className="text-[11px] text-[#03374f]/60 leading-relaxed">
          Note: for staff that already exist, identity columns (name, title,
          department, email, phones, office, license number) are <strong>managed in HR</strong>{' '}
          and are <strong>ignored</strong> on import — only signature fields
          (fax, group email, LinkedIn, Instagram, part-time) are updated.
        </p>
      </Card>

      <Card className="p-5 space-y-4 text-sm">
        <div>
          <p className="font-semibold text-[#03374f] mb-1">Required columns</p>
          <p className="text-xs text-gray-600">
            {REQUIRED_COLUMNS.join(', ')}
          </p>
        </div>
        <div>
          <p className="font-semibold text-[#03374f] mb-1">Optional columns</p>
          <p className="text-xs text-gray-600">
            {OPTIONAL_COLUMNS.join(', ')}
          </p>
        </div>
        <div>
          <p className="font-semibold text-[#03374f] mb-1">
            Office locations available
          </p>
          {offices.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No offices loaded.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {offices.map((o) => (
                <code key={o.slug}
                      className="text-[11px] bg-gray-100 px-1.5 py-0.5 rounded font-mono text-[#03374f]"
                      title={o.display_name}>
                  {o.slug}
                </code>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

function PreviewStep(props: {
  fileName:   string
  rows:       ParsedRow[]
  headers:    string[]
  validating: boolean
  onBack:     () => void
  onContinue: () => void
}) {
  const { fileName, rows, headers, validating, onBack, onContinue } = props

  const recognized   = headers.filter((h) => RECOGNIZED_COLUMNS.has(h))
  const unrecognized = headers.filter((h) => !RECOGNIZED_COLUMNS.has(h))
  const missingReq   = [...REQUIRED_COLUMNS].filter((c) => !headers.includes(c))

  const sample = rows.slice(0, 5)
  const sampleCols = ['first_name', 'last_name', 'email', 'title', 'office_location']
    .filter((c) => headers.includes(c))

  return (
    <Card className="p-5 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#03374f]">
            <FileText className="w-4 h-4 text-[#f26b2b]" />
            Parsed CSV Preview
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {rows.length} {rows.length === 1 ? 'row' : 'rows'} detected · file: <span className="font-mono">{fileName}</span>
          </p>
        </div>
      </div>

      {missingReq.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="w-4 h-4" />
          <AlertTitle>Missing required columns</AlertTitle>
          <AlertDescription>
            Your CSV is missing: <code>{missingReq.join(', ')}</code>. Validation will fail.
            Add the columns or download the template CSV.
          </AlertDescription>
        </Alert>
      )}

      <div>
        <p className="text-xs font-semibold text-[#03374f] mb-2 uppercase tracking-wide">
          Columns found in your CSV
        </p>
        <div className="space-y-1 text-xs">
          {recognized.map((h) => (
            <div key={h} className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              <code className="font-mono">{h}</code>
              {REQUIRED_SET.has(h) && (
                <span className="text-[10px] uppercase tracking-wide bg-[#f26b2b]/10 text-[#f26b2b] px-1.5 py-0.5 rounded">
                  required
                </span>
              )}
            </div>
          ))}
          {unrecognized.map((h) => (
            <div key={h} className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5" />
              <code className="font-mono">{h}</code>
              <span className="text-gray-500">→ not recognized, will be ignored</span>
            </div>
          ))}
        </div>
      </div>

      {sample.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#03374f] mb-2 uppercase tracking-wide">
            Preview (first {sample.length} {sample.length === 1 ? 'row' : 'rows'})
          </p>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  {sampleCols.map((c) => (
                    <TableHead key={c} className="text-[#03374f]">{c}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sample.map((r, i) => (
                  <TableRow key={i}>
                    {sampleCols.map((c) => (
                      <TableCell key={c} className="text-xs">{r[c] || '—'}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Choose Different File
        </Button>
        <Button onClick={onContinue}
                disabled={validating || missingReq.length > 0}
                className="bg-[#f26b2b] hover:bg-[#d85a20] text-white">
          {validating ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Validating…</>
          ) : (
            <><Eye className="w-4 h-4 mr-2" /> Validate Data <ArrowRight className="w-4 h-4 ml-2" /></>
          )}
        </Button>
      </div>
    </Card>
  )
}

function ValidateStep(props: {
  result:     ApiResponse
  committing: boolean
  onBack:     () => void
  onConfirm:  () => void
}) {
  const { result, committing, onBack, onConfirm } = props
  const willCreate = Math.max(0, result.valid_rows - result.emails_already_in_db.length)
  const willUpdate = result.emails_already_in_db.length

  return (
    <Card className="p-5 space-y-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-[#03374f]">
        <CheckCircle2 className="w-4 h-4 text-[#f26b2b]" />
        Validation Results
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="Total rows"   value={result.total_rows}   tone="neutral" />
        <Stat label="Valid"        value={result.valid_rows}   tone="good" />
        <Stat label="Invalid"      value={result.invalid_rows} tone={result.invalid_rows > 0 ? 'bad' : 'neutral'} />
        <Stat label="Will update"  value={willUpdate} tone="neutral" />
        <Stat label="Will create"  value={willCreate} tone="good" />
      </div>

      {result.invalid_office_locations.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>Unknown office slugs</AlertTitle>
          <AlertDescription>
            These office values aren&apos;t in the database:{' '}
            {result.invalid_office_locations.map((s) => (
              <code key={s} className="bg-white/40 px-1 rounded font-mono mr-1">{s}</code>
            ))}
            <div className="mt-1">
              Fix the CSV or add the office on the office locations page.
            </div>
          </AlertDescription>
        </Alert>
      )}

      {result.duplicate_emails_in_batch.length > 0 && (
        <Alert>
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>Duplicate emails in this batch</AlertTitle>
          <AlertDescription>
            {result.duplicate_emails_in_batch.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {result.validation_errors.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-amber-700 mb-2 uppercase tracking-wide flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Validation Errors ({result.validation_errors.length})
          </p>
          <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Row</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.validation_errors.map((e, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-mono">{e.row_number}</TableCell>
                    <TableCell className="text-xs"><code>{e.field}</code></TableCell>
                    <TableCell className="text-xs text-red-700">{e.error}</TableCell>
                    <TableCell className="text-xs text-gray-500">{e.email || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {result.emails_already_in_db.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#03374f] mb-2 uppercase tracking-wide flex items-center gap-1">
            <Info className="w-3.5 h-3.5" />
            Already in Database ({result.emails_already_in_db.length}) — these will be updated
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {result.emails_already_in_db.map((e) => (
              <code key={e}
                    className="text-[11px] bg-gray-100 px-2 py-0.5 rounded font-mono text-[#03374f]">
                {e}
              </code>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={onConfirm}
                disabled={committing || result.valid_rows === 0}
                className="bg-[#f26b2b] hover:bg-[#d85a20] text-white">
          {committing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Importing…</>
          ) : (
            <><CheckCircle2 className="w-4 h-4 mr-2" /> Import {result.valid_rows} Valid {result.valid_rows === 1 ? 'Row' : 'Rows'}</>
          )}
        </Button>
      </div>
    </Card>
  )
}

function DoneStep(props: {
  result:             ApiResponse
  onDownloadFailures: () => void
  onImportAnother:    () => void
}) {
  const { result, onDownloadFailures, onImportAnother } = props
  const failed = result.failed || 0

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center gap-2 text-lg font-semibold text-[#03374f]">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        Import Complete
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Created" value={result.imported || 0} tone="good" />
        <Stat label="Updated" value={result.updated  || 0} tone="neutral" />
        <Stat label="Failed"  value={failed}              tone={failed > 0 ? 'bad' : 'neutral'} />
      </div>

      {failed > 0 && result.errors && result.errors.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
            Failed rows
          </p>
          <div className="border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Row</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.errors.map((e, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-mono">{e.row_number}</TableCell>
                    <TableCell className="text-xs text-red-700">{e.error}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button size="sm" variant="outline" onClick={onDownloadFailures}>
            <Download className="w-4 h-4 mr-2" />
            Download Failed Rows CSV
          </Button>
        </div>
      )}

      <div className="flex justify-between pt-2 flex-wrap gap-2">
        <Link href="/admin/team/signatures">
          <Button className="bg-[#03374f] hover:bg-[#022838] text-white">
            View Staff List
          </Button>
        </Link>
        <Button variant="outline" onClick={onImportAnother}>
          <RefreshCw className="w-4 h-4 mr-2" /> Import Another CSV
        </Button>
      </div>
    </Card>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone: 'good' | 'bad' | 'neutral' }) {
  const colors =
    tone === 'good' ? 'text-green-700 bg-green-50 border-green-200' :
    tone === 'bad'  ? 'text-red-700 bg-red-50 border-red-200' :
                      'text-[#03374f] bg-gray-50 border-gray-200'
  return (
    <div className={`border rounded-lg p-3 ${colors}`}>
      <div className="text-2xl font-bold leading-none">{value}</div>
      <div className="text-[11px] uppercase tracking-wide mt-1 opacity-75">{label}</div>
    </div>
  )
}
