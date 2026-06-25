/**
 * HR-sync Stage 4 — dry-run drift report runner (READ-ONLY).
 *
 * Usage:
 *   npx tsx scripts/hr-sync-drift-report.ts
 *
 * ⚠️ READ-ONLY. Runs the Stage 3 sync engine in dryRun:true across all
 * linked HR employees and prints what the sync WOULD change. Writes
 * NOTHING. No apply / enable / write path. The Director's go/no-go tool
 * before the sync is ever enabled.
 */
import { readFileSync } from 'node:fs'

// Minimal .env.local loader (no dotenv dependency installed).
try {
  const env = readFileSync('.env.local', 'utf8')
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
} catch {}

import { getPool } from '@/lib/admin-db'
import { getHrSyncDriftReport, type FieldChange } from '@/lib/hr-sync/drift-report'

function fmt(v: unknown): string {
  if (v === null || v === undefined) return '∅'
  return JSON.stringify(v)
}

function changeLine(c: FieldChange): string {
  const tag =
    c.changeType === 'substantive' ? 'SUBST' :
    c.changeType === 'formatting-only' ? 'FMT  ' :
    'FILL '
  return `      [${tag}] ${c.facet}.${c.column} (${c.key}): ${fmt(c.oldValue)} → ${fmt(c.newValue)}`
}

async function main() {
  const report = await getHrSyncDriftReport()
  const s = report.summary

  console.log('\n══════════════════════════════════════════════════════════')
  console.log('  HR-SYNC DRY-RUN DRIFT REPORT (read-only — wrote nothing)')
  console.log('  generated:', report.generatedAt)
  console.log('══════════════════════════════════════════════════════════')

  console.log('\n── SUMMARY ──────────────────────────────────────────────')
  console.log(`  Total linked employees:        ${s.totalLinked}`)
  console.log(`  Would change (≥1 real change): ${s.wouldChange}`)
  console.log(`  Already match (0 real change): ${s.alreadyMatch}`)
  console.log(`  With compute-errors:           ${s.withComputeErrors}`)
  console.log(`  Dedup-flagged (linked):        ${s.dedupFlaggedLinked}`)
  console.log(`  ── Total real field changes:   ${s.realChanges}`)
  console.log(`       substantive:              ${s.substantive}`)
  console.log(`       formatting-only:          ${s.formattingOnly}`)
  console.log(`       fill-in:                  ${s.fillIn}`)

  console.log('\n── PER-FIELD DRIFT (real changes only) ──────────────────')
  const fieldKeys = Object.keys(report.perField).sort()
  if (fieldKeys.length === 0) {
    console.log('  (no fields would change)')
  } else {
    console.log('  field            total  subst  fmt   fill')
    for (const k of fieldKeys) {
      const f = report.perField[k]
      console.log(
        `  ${k.padEnd(16)} ${String(f.total).padStart(4)}  ${String(f.substantive).padStart(4)}  ` +
        `${String(f.formattingOnly).padStart(4)}  ${String(f.fillIn).padStart(4)}`,
      )
    }
  }

  console.log('\n── PER-EMPLOYEE DRILL-DOWN (would change) ───────────────')
  if (report.perEmployee.length === 0) {
    console.log('  (no employees would change)')
  } else {
    for (const e of report.perEmployee) {
      const dedup = e.needsDedupReview ? '  ⚠️ needs_dedup_review' : ''
      console.log(`  #${e.hrEmployeeId} ${e.employeeName}${dedup}`)
      for (const c of e.changes) console.log(changeLine(c))
    }
  }

  console.log('\n── DEDUP-FLAGGED (linked, needs_dedup_review) ───────────')
  if (report.dedupFlagged.length === 0) {
    console.log('  (none)')
  } else {
    for (const d of report.dedupFlagged) {
      console.log(`  #${d.hrEmployeeId} ${d.employeeName}`)
    }
  }

  console.log('\n── COMPUTE-ERRORS (dry-run resolver failures) ───────────')
  if (report.computeErrors.length === 0) {
    console.log('  (none — expected)')
  } else {
    for (const c of report.computeErrors) {
      console.log(`  #${c.hrEmployeeId} ${c.employeeName} [${c.facet}#${c.facetId}]: ${c.error}`)
    }
  }

  console.log('\n── UNRESOLVED dept/office (fail-closed SKIP) ────────────')
  if (report.unresolved.length === 0) {
    console.log('  (none — all dept/office resolved)')
  } else {
    for (const u of report.unresolved) {
      console.log(`  #${u.hrEmployeeId} ${u.employeeName} [${u.facet}] ${u.field} → unresolved (sync would skip)`)
    }
  }

  console.log('\n══════════════════════════════════════════════════════════\n')

  await getPool().end()
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
