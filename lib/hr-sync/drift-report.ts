/**
 * HR-sync Stage 4 — the DRY-RUN DRIFT REPORT (read-only).
 *
 * Runs the Stage 3 engine (`syncHrEmployeeDown`, dryRun:true) across ALL
 * linked HR employees and aggregates what the sync WOULD change. This is
 * the Director's go/no-go tool BEFORE the sync is ever enabled.
 *
 * ⚠️ READ-ONLY BY CONSTRUCTION. It only ever calls the engine with
 * dryRun:true (Stage 3 proved dry-run writes nothing). There is NO apply
 * / enable / write path here. Enabling the sync is a LATER stage.
 *
 * Design references (docs/hr-master-rearchitecture-design.md):
 *   §6  initial reconciliation / the drift that exists today
 *   §4  the sync mechanism this consumes
 *
 * Consumes Stage 3's SyncDownResult AS-IS — no reimplementation. The only
 * NEW logic here is presentation: classifying each would-write as
 * substantive / formatting-only / fill-in, and aggregating.
 */
import { getPool, type HrEmployee } from '@/lib/admin-db'
import { syncHrEmployeeDown, type SyncDownResult, type FacetName } from './sync-down'

/** How a single field would change (beyond Stage 3's raw write). */
export type ChangeType =
  | 'substantive'      // genuinely different value (HR title ≠ facet title)
  | 'formatting-only'  // same content, different punctuation (phones)
  | 'fill-in'          // facet was blank → HR has a value
  | 'no-change'        // old === new (engine emitted a write but value matches)

export interface FieldChange {
  hrEmployeeId: number
  employeeName: string
  facet: FacetName
  facetId: number
  key: string
  column: string
  oldValue: unknown
  newValue: string | number | boolean
  changeType: ChangeType
}

export interface UnresolvedEntry {
  hrEmployeeId: number
  employeeName: string
  facet: FacetName
  field: string          // 'department' | 'office'
  reason: 'unresolved'
}

export interface PerEmployeeDrill {
  hrEmployeeId: number
  employeeName: string
  needsDedupReview: boolean
  changes: FieldChange[]  // only real (non-no-change) changes
}

export interface DriftReport {
  generatedAt: string
  summary: {
    totalLinked: number
    wouldChange: number          // employees with ≥1 real change
    alreadyMatch: number         // linked employees with 0 real changes
    withComputeErrors: number    // employees with ≥1 facet compute-error
    dedupFlaggedLinked: number   // linked employees flagged needs_dedup_review
    realChanges: number          // total real field changes across all
    substantive: number
    formattingOnly: number
    fillIn: number
  }
  /** Per shared-field: how many facets would really change, by type. */
  perField: Record<
    string,
    { substantive: number; formattingOnly: number; fillIn: number; total: number }
  >
  /** Each employee that would really change — fields, old→new, per facet. */
  perEmployee: PerEmployeeDrill[]
  /** Dedup-flagged employees holding facets (listed separately). */
  dedupFlagged: { hrEmployeeId: number; employeeName: string }[]
  /** Facets that errored during dry-run compute (resolver failure). */
  computeErrors: {
    hrEmployeeId: number
    employeeName: string
    facet: FacetName
    facetId: number
    error: string
  }[]
  /** Facets where dept/office didn't resolve (fail-closed skip). */
  unresolved: UnresolvedEntry[]
}

const PHONE_FIELDS = new Set(['mobile', 'office_phone'])

function digitsOnly(v: unknown): string {
  return String(v ?? '').replace(/\D+/g, '')
}

function normString(v: unknown): string {
  return String(v ?? '').trim()
}

/**
 * Classify a single would-write into a ChangeType by comparing the facet's
 * current value (old) to HR's value (new).
 */
export function classifyChange(
  key: string,
  oldValue: unknown,
  newValue: unknown,
): ChangeType {
  const oldBlank = oldValue === null || oldValue === undefined || normString(oldValue) === ''

  // fill-in: facet had nothing, HR supplies a value.
  if (oldBlank) return 'fill-in'

  // exact match (after trimming strings) → no real change.
  if (typeof newValue === 'boolean' || typeof oldValue === 'boolean') {
    if (oldValue === newValue) return 'no-change'
  }
  if (normString(oldValue) === normString(newValue)) return 'no-change'

  // formatting-only for phones: same digits, different punctuation.
  if (PHONE_FIELDS.has(key) && digitsOnly(oldValue) === digitsOnly(newValue) && digitsOnly(oldValue) !== '') {
    return 'formatting-only'
  }

  return 'substantive'
}

function nameOf(hr: HrEmployee): string {
  return `${hr.first_name ?? ''} ${hr.last_name ?? ''}`.trim() || `#${hr.id}`
}

/**
 * Build the dry-run drift report across every linked HR employee.
 *
 * ⚠️ Calls syncHrEmployeeDown ONLY with dryRun:true — writes NOTHING.
 */
export async function getHrSyncDriftReport(): Promise<DriftReport> {
  const db = getPool()

  // ALL hr_employees with at least one facet FK — the sync only affects
  // linked rows. Read-only SELECT.
  const rows = await db.query<HrEmployee>(
    `SELECT * FROM hr_employees
       WHERE vcard_employee_id IS NOT NULL OR staff_member_id IS NOT NULL
       ORDER BY id`,
  )
  const employees = rows.rows

  const perField: DriftReport['perField'] = {}
  const perEmployee: PerEmployeeDrill[] = []
  const dedupFlagged: DriftReport['dedupFlagged'] = []
  const computeErrors: DriftReport['computeErrors'] = []
  const unresolved: UnresolvedEntry[] = []

  let wouldChange = 0
  let alreadyMatch = 0
  let withComputeErrors = 0
  let dedupFlaggedLinked = 0
  let realChanges = 0
  let substantive = 0
  let formattingOnly = 0
  let fillIn = 0

  function bumpField(key: string, type: Exclude<ChangeType, 'no-change'>) {
    if (!perField[key]) perField[key] = { substantive: 0, formattingOnly: 0, fillIn: 0, total: 0 }
    if (type === 'substantive') perField[key].substantive++
    else if (type === 'formatting-only') perField[key].formattingOnly++
    else perField[key].fillIn++
    perField[key].total++
  }

  for (const hr of employees) {
    const name = nameOf(hr)
    const isDedup = !!hr.needs_dedup_review
    if (isDedup) {
      dedupFlagged.push({ hrEmployeeId: hr.id, employeeName: name })
      dedupFlaggedLinked++
    }

    // ⚠️ dryRun:true — writes NOTHING. Consume the structured result as-is.
    const result: SyncDownResult = await syncHrEmployeeDown(hr, { dryRun: true })

    let employeeHadError = false
    const empChanges: FieldChange[] = []

    for (const facet of result.facets) {
      if (facet.error) {
        employeeHadError = true
        computeErrors.push({
          hrEmployeeId: hr.id,
          employeeName: name,
          facet: facet.facet,
          facetId: facet.facetId,
          error: facet.error,
        })
      }

      // Unresolved dept/office (fail-closed skip) — surface separately.
      for (const skip of facet.skips) {
        if (skip.reason === 'unresolved') {
          unresolved.push({
            hrEmployeeId: hr.id,
            employeeName: name,
            facet: facet.facet,
            field: skip.key,
            reason: 'unresolved',
          })
        }
      }

      for (const w of facet.writes) {
        const changeType = classifyChange(w.key, w.oldValue, w.newValue)
        if (changeType === 'no-change') continue
        const change: FieldChange = {
          hrEmployeeId: hr.id,
          employeeName: name,
          facet: facet.facet,
          facetId: facet.facetId,
          key: w.key,
          column: w.column,
          oldValue: w.oldValue,
          newValue: w.newValue,
          changeType,
        }
        empChanges.push(change)
        bumpField(w.key, changeType)
        realChanges++
        if (changeType === 'substantive') substantive++
        else if (changeType === 'formatting-only') formattingOnly++
        else fillIn++
      }
    }

    if (employeeHadError) withComputeErrors++

    if (empChanges.length > 0) {
      wouldChange++
      perEmployee.push({
        hrEmployeeId: hr.id,
        employeeName: name,
        needsDedupReview: isDedup,
        changes: empChanges,
      })
    } else {
      alreadyMatch++
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalLinked: employees.length,
      wouldChange,
      alreadyMatch,
      withComputeErrors,
      dedupFlaggedLinked,
      realChanges,
      substantive,
      formattingOnly,
      fillIn,
    },
    perField,
    perEmployee,
    dedupFlagged,
    computeErrors,
    unresolved,
  }
}
