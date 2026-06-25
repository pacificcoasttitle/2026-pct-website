/**
 * HR-sync Stage 3 — the sync-down ENGINE (standalone, UNCALLED).
 *
 * `syncHrEmployeeDown(hrEmployee, { dryRun })` is the core HR→facet sync:
 * it walks ACTIVE_SHARED_FIELDS (Stage 2's declarative map), asks
 * decideWrite (Stage 2's blank-guard + fail-closed resolvers) what to
 * write for each facet target, and builds ONE targeted UPDATE per linked
 * facet that touches ONLY shared columns.
 *
 * ⚠️ NOT WIRED INTO ANYTHING. Nothing calls this function this stage —
 * not updateHrEmployee, not setHrEmployeeActive, not finalizeHrOnboarding,
 * not any route/cron. Stage 4 exercises it READ-ONLY (dryRun:true) for a
 * drift report; a later stage wires the live path after Director review.
 * Live mode (dryRun:false) is invoked ONLY via maybeSyncHrEmployeeDown
 * (below), which is itself gated behind the HR_SYNC_ENABLED flag (default
 * OFF). With the flag off, nothing calls the engine in live mode.
 *
 * ⚠️ NEVER THROWS UPWARD on a facet failure. Both the COMPUTE path
 * (computeFacet → decideWrite → resolver DB SELECTs) and the EXECUTE
 * path (the targeted UPDATE) are wrapped per-facet: any exception is
 * recorded as a structured facet error (executed:false, no writes, an
 * `error` message, reason:'compute-error' for compute failures) and the
 * other facet is still processed. The ONLY allowed throw is a genuinely
 * missing HR row at load time (a precondition/programmer error, before
 * any facet work). This protects the eventual non-blocking contract
 * (§4f): the sync must never break the HR write that triggers it.
 *
 * Design references (hr-master-rearchitecture-design.md):
 *   §4   sync mechanism / declarative map driven
 *   §4c  FAIL-CLOSED — unresolved resolver = skip, never write a wrong id
 *   §4d  touch ONLY shared columns, never section-specific
 *   §4f  transaction posture — a facet UPDATE is atomic; the engine never
 *        throws upward (errors are caught + returned), so a future caller
 *        can't be broken by it
 *   §4g  audit — every field is recorded (written old→new / skipped+reason)
 *   §4i  never overwrite a real value with a blank (decideWrite enforces)
 *
 * Stage 2 contracts are consumed AS-IS — no reimplementation:
 *   - ACTIVE_SHARED_FIELDS  (pending fields already excluded)
 *   - decideWrite           (blank-guard + resolver fail-closed)
 *   - the resolvers         (invoked transitively via decideWrite)
 */
import { getPool, getHrEmployeeById, type HrEmployee } from '@/lib/admin-db'
import { ACTIVE_SHARED_FIELDS, type FacetTarget } from './shared-field-map'
import { decideWrite } from './guards'

/** Which facet a per-field outcome / UPDATE concerns. */
export type FacetName = 'vcard' | 'staff'

/** Per-facet physical table + id column the targeted UPDATE addresses. */
const FACET_TABLE: Record<FacetName, { table: string; idCol: string }> = {
  vcard: { table: 'vcard_employees', idCol: 'id' },
  staff: { table: 'staff_members', idCol: 'id' },
}

/** A field that WOULD be / WAS written on a facet (old→new for audit). */
export interface FieldWrite {
  key: string
  column: string
  oldValue: unknown
  newValue: string | number | boolean
}

/** A field that was skipped, with the Stage 2 reason. */
export interface FieldSkip {
  key: string
  column: string | null
  reason: 'blank' | 'unresolved' | 'no-target'
}

/**
 * Reason recorded on `FacetSyncResult.errorReason` when an exception is
 * caught for a facet (kept distinct from the per-field skip reasons so
 * Stage 4's report can render "couldn't compute/execute this facet").
 */
export type FacetErrorReason = 'compute-error' | 'execute-error'

/** The outcome for one facet (vcard or staff). */
export interface FacetSyncResult {
  facet: FacetName
  /** The facet row id (from the HR FK). */
  facetId: number
  /** Fields that would change / changed (old→new). */
  writes: FieldWrite[]
  /** Fields skipped + why (audit/report). */
  skips: FieldSkip[]
  /**
   * Whether the targeted UPDATE was actually EXECUTED. Always false in
   * dry-run. False in live mode too when there were zero writeable
   * fields (no UPDATE is issued for an empty change set).
   */
  executed: boolean
  /**
   * Populated if this facet's compute OR live UPDATE failed (errors are
   * caught, never thrown). The message + a coarse reason so Stage 4's
   * report can show "couldn't compute/execute this facet: <error>".
   */
  error?: string
  errorReason?: FacetErrorReason
}

/** The full structured result Stage 4's report (and a future audit) consume. */
export interface SyncDownResult {
  hrEmployeeId: number
  dryRun: boolean
  /** Per-facet outcomes for every facet that EXISTS (linked via FK). */
  facets: FacetSyncResult[]
  /** Facets skipped entirely because the HR FK was null (no-op, not an error). */
  skippedFacets: { facet: FacetName; reason: 'null-fk' }[]
}

/** Linked-facet descriptor: which facet, its row id, and the target picker. */
interface LinkedFacet {
  facet: FacetName
  facetId: number
  /** Pull THIS facet's target for a shared field (or undefined if none). */
  pickTarget: (sourceKey: string) => FacetTarget | undefined
}

/**
 * Read a facet's CURRENT value for a column (read-only) so the audit can
 * record old→new. Best-effort: a read failure yields `undefined` for the
 * old value and never aborts the sync.
 */
async function readCurrentValue(
  facet: FacetName,
  facetId: number,
  column: string,
): Promise<unknown> {
  const { table, idCol } = FACET_TABLE[facet]
  try {
    const db = getPool()
    // `column` is from the trusted, code-defined shared-field map — never
    // user input — so identifier interpolation here is safe.
    const res = await db.query(
      `SELECT "${column}" AS v FROM ${table} WHERE ${idCol} = $1 LIMIT 1`,
      [facetId],
    )
    return res.rows[0]?.v
  } catch {
    return undefined
  }
}

/**
 * Compute the write/skip decisions for ONE facet by walking
 * ACTIVE_SHARED_FIELDS and delegating each target to Stage 2's decideWrite.
 * Pure computation — issues NO UPDATE. Reads current values only for audit.
 */
async function computeFacet(
  hr: HrEmployee,
  linked: LinkedFacet,
): Promise<FacetSyncResult> {
  const writes: FieldWrite[] = []
  const skips: FieldSkip[] = []

  for (const field of ACTIVE_SHARED_FIELDS) {
    const target = linked.pickTarget(field.key)
    const hrValue = (hr as Record<string, unknown>)[field.source]

    // Stage 2 owns the rule: blank-guard + fail-closed resolver. We do
    // NOT bypass it; the returned value is already resolved (FK/slug).
    const decision = await decideWrite(target, hrValue)

    if (!decision.write) {
      skips.push({
        key: field.key,
        column: target?.column ?? null,
        reason: decision.reason,
      })
      continue
    }

    // target is guaranteed present when decision.write is true.
    const column = (target as FacetTarget).column
    const oldValue = await readCurrentValue(linked.facet, linked.facetId, column)
    writes.push({
      key: field.key,
      column,
      oldValue,
      newValue: decision.value,
    })
  }

  return {
    facet: linked.facet,
    facetId: linked.facetId,
    writes,
    skips,
    executed: false,
  }
}

/**
 * Execute the targeted UPDATE for one facet — ONE statement, ONLY the
 * write:true shared columns, scoped to the facet row id. Atomic per the
 * single-statement guarantee (§4f). Errors are CAUGHT and recorded on the
 * result, never thrown upward (a future caller must not be broken).
 *
 * Skips entirely if there are zero writeable fields (no empty UPDATE).
 */
async function executeFacet(result: FacetSyncResult): Promise<void> {
  if (result.writes.length === 0) {
    // Nothing writeable → no UPDATE issued. Not an error.
    return
  }

  const { table, idCol } = FACET_TABLE[result.facet]

  // Build SET only from the write:true SHARED columns. We never reference
  // a section-specific column — the column set comes solely from the
  // shared-field map's targets for this facet.
  const setClauses = result.writes.map((w, i) => `"${w.column}" = $${i + 1}`)
  const values = result.writes.map((w) => w.newValue)
  const idParam = `$${values.length + 1}`

  const sql =
    `UPDATE ${table} SET ${setClauses.join(', ')} WHERE ${idCol} = ${idParam}`

  try {
    const db = getPool()
    await db.query(sql, [...values, result.facetId])
    result.executed = true
  } catch (err) {
    // §4f: never throw upward. Record + move on.
    result.executed = false
    result.error = err instanceof Error ? err.message : String(err)
    result.errorReason = 'execute-error'
  }
}

/**
 * THE ENGINE. Sync an HR employee's shared identity DOWN into its linked
 * facets.
 *
 * @param hrEmployeeOrId  an hr_employees row, or its numeric id (loaded).
 * @param opts.dryRun     true  → compute would-change/skipped, write NOTHING.
 *                        false → execute the targeted UPDATEs (INVOKED BY
 *                                NOTHING this stage).
 *
 * Behaviour:
 *   - null facet FK → that facet is a NO-OP (recorded in skippedFacets),
 *     never an error (new HR-only hires have no facets).
 *   - per-facet, one targeted UPDATE touching ONLY shared columns; skipped
 *     if no writeable fields.
 *   - never throws upward — any live UPDATE failure is caught + returned.
 */
export async function syncHrEmployeeDown(
  hrEmployeeOrId: HrEmployee | number,
  opts: { dryRun: boolean },
): Promise<SyncDownResult> {
  const { dryRun } = opts

  // Resolve the HR row (load by id if a number was passed).
  let hr: HrEmployee | null
  if (typeof hrEmployeeOrId === 'number') {
    hr = await getHrEmployeeById(hrEmployeeOrId)
  } else {
    hr = hrEmployeeOrId
  }
  if (!hr) {
    throw new Error(`hr_employees row not found: ${String(hrEmployeeOrId)}`)
  }

  const facets: FacetSyncResult[] = []
  const skippedFacets: SyncDownResult['skippedFacets'] = []

  // Build the linked-facet list from the FKs. NULL FK = skip that facet.
  const linkedFacets: LinkedFacet[] = []

  if (hr.vcard_employee_id != null) {
    linkedFacets.push({
      facet: 'vcard',
      facetId: hr.vcard_employee_id,
      pickTarget: (key) =>
        ACTIVE_SHARED_FIELDS.find((f) => f.key === key)?.vcard,
    })
  } else {
    skippedFacets.push({ facet: 'vcard', reason: 'null-fk' })
  }

  if (hr.staff_member_id != null) {
    linkedFacets.push({
      facet: 'staff',
      facetId: hr.staff_member_id,
      pickTarget: (key) =>
        ACTIVE_SHARED_FIELDS.find((f) => f.key === key)?.staff,
    })
  } else {
    skippedFacets.push({ facet: 'staff', reason: 'null-fk' })
  }

  for (const linked of linkedFacets) {
    // ⚠️ Per-facet COMPUTE isolation (§4f review-F fix). computeFacet calls
    // decideWrite → the resolvers, which do DB SELECTs and CAN throw on an
    // infra failure. Catch it here so it becomes a recorded facet error
    // (compute-error) instead of propagating UP out of the engine — in
    // BOTH dry-run and live. The OTHER facet still gets its turn.
    let result: FacetSyncResult
    try {
      result = await computeFacet(hr, linked)
    } catch (err) {
      facets.push({
        facet: linked.facet,
        facetId: linked.facetId,
        writes: [],
        skips: [],
        executed: false,
        error: err instanceof Error ? err.message : String(err),
        errorReason: 'compute-error',
      })
      continue
    }

    if (!dryRun) {
      await executeFacet(result)
      // §4g audit: in live mode, log each write (employee, field, old→new,
      // facet, timestamp). Same structure the dry-run report consumes.
      if (result.executed) {
        for (const w of result.writes) {
          console.info(
            '[hr-sync] write',
            JSON.stringify({
              hrEmployeeId: hr.id,
              facet: result.facet,
              facetId: result.facetId,
              field: w.key,
              column: w.column,
              old: w.oldValue,
              new: w.newValue,
              at: new Date().toISOString(),
            }),
          )
        }
      }
    }

    facets.push(result)
  }

  return {
    hrEmployeeId: hr.id,
    dryRun,
    facets,
    skippedFacets,
  }
}

/**
 * Stage 5 — the NON-BLOCKING, FLAG-GATED sync trigger used at the HR
 * write fire points (§4e). Call this AFTER an HR write has committed.
 *
 * ⚠️ Contract (design §4f — the HR write must never be broken by sync):
 *   - If HR_SYNC_ENABLED !== 'true' → returns immediately, sync NOT run
 *     (default OFF / fail-safe; zero behavior change in prod today).
 *   - When ON → runs syncHrEmployeeDown(hr, { dryRun:false }) (LIVE).
 *   - The whole thing is wrapped in try/catch as DEFENSE-IN-DEPTH on top
 *     of the engine's own per-facet catches: a sync failure is LOGGED
 *     and swallowed — it NEVER throws upward, so the caller's HR write
 *     stays successful. This function returns void and never rejects.
 *   - Audit (§4g): the structured result (or the failure) is logged so
 *     there is a trail of every cross-table write.
 *
 * ⚠️ This must be called OUTSIDE the HR write's transaction (after the
 * commit), so a sync failure cannot roll back the HR write.
 */
export async function maybeSyncHrEmployeeDown(
  hr: HrEmployee,
  context: string,
): Promise<void> {
  // Lazy import keeps the engine module free of the flag dependency cycle
  // and makes the gate explicit at the call boundary.
  const { isHrSyncEnabled } = await import('./config')
  if (!isHrSyncEnabled()) return // flag OFF → never run (fail-safe default)

  try {
    const result = await syncHrEmployeeDown(hr, { dryRun: false })
    // §4g audit: a trail of every sync run (employee, facets, what changed).
    console.info(
      '[hr-sync] sync ran',
      JSON.stringify({ context, ...summarizeForAudit(result) }),
    )
  } catch (err) {
    // Defense-in-depth: the engine already catches per-facet failures,
    // but if anything unexpected throws (e.g. missing-HR-row precondition),
    // we swallow it here so the HR write the caller just did still
    // succeeds. Logged, never rethrown.
    console.error(
      '[hr-sync] sync FAILED (HR write unaffected)',
      JSON.stringify({
        context,
        hrEmployeeId: hr.id,
        error: err instanceof Error ? err.message : String(err),
      }),
    )
  }
}

/** Compact, log-friendly view of a sync result for the audit trail. */
function summarizeForAudit(result: SyncDownResult) {
  return {
    hrEmployeeId: result.hrEmployeeId,
    facets: result.facets.map((f) => ({
      facet: f.facet,
      facetId: f.facetId,
      executed: f.executed,
      written: f.writes.map((w) => w.key),
      skipped: f.skips.map((s) => `${s.key}:${s.reason}`),
      error: f.error,
      errorReason: f.errorReason,
    })),
    skippedFacets: result.skippedFacets,
  }
}
