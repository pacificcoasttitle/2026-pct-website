/**
 * scripts/backfill-hr-employees.ts
 *
 * BACKFILL (3a — written for review, NOT run in this ticket; 3b runs it).
 *
 * Populates the canonical `hr_employees` table from the ~109-person union
 * of `vcard_employees` + `staff_members`, joined by LOWER(TRIM(email)).
 *
 * ⚠️ READ-ONLY ON THE SOURCE TABLES.
 *   - vcard_employees : SELECT only.  Never UPDATE / DELETE / INSERT.
 *   - staff_members   : SELECT only.  Never UPDATE / DELETE / INSERT.
 *   - hr_employees    : INSERT only (idempotent via ON CONFLICT (email)).
 * Signatures + marketing keep working untouched — this is purely additive.
 *
 * POPULATIONS (computed live — counts NOT hardcoded):
 *   - staff-only  → insert (staff_member_id set, vcard null)
 *   - vcard-only  → insert (vcard_employee_id set, staff null; carry active)
 *   - both        → ONE row, BOTH FKs, 'staff wins' on field conflicts,
 *                   EXCEPT photo from vcard, mobile = staff.cell_phone ||
 *                   vcard.mobile, office_phone = staff.office_direct.
 *
 * DEDUP (NO auto-merge):
 *   Same-PERSON-different-EMAIL pairs are detected heuristically
 *   (normalized full name match across two distinct emails) and FLAGGED
 *   needs_dedup_review=true + a note naming the suspected match. They are
 *   STILL inserted as separate rows — Jerry merges them in-app later.
 *
 * MAPS:
 *   - Department: keep staff's 12 verbatim EXCEPT 'Admin' → 'Administration'.
 *   - Office (slug/display → canonical name): see OFFICE_MAP.
 *
 * IDEMPOTENT: INSERT ... ON CONFLICT (email) DO NOTHING. Re-running does
 * not double-insert (already-present emails are skipped). Existing rows
 * are NOT updated by a re-run (this is a one-way backfill, not a sync).
 *
 * Usage (DRY RUN — computes + prints what it WOULD insert, writes nothing):
 *   npm run backfill:hr
 *   # or: npx tsx scripts/backfill-hr-employees.ts
 *
 * Usage (EXECUTE — inserts into hr_employees; 3b only, after review):
 *   npm run backfill:hr -- --confirm
 *   # or: npx tsx scripts/backfill-hr-employees.ts --confirm
 *
 * Per docs/claude_skills/claude-skills.md: loads DATABASE_URL from
 * .env.local (no chat-prompt for creds); requires --confirm for writes;
 * dry-run is the default.
 */

/* eslint-disable no-console */

import { Client } from 'pg'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// ── Tiny .env loader (mirrors the other scripts) ──────────────────
function loadEnvFile(path: string) {
  if (!existsSync(path)) return false
  const raw = readFileSync(path, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i)
    if (!m) continue
    const [, key, rawVal] = m
    if (process.env[key]) continue
    let val = rawVal
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    process.env[key] = val
  }
  return true
}
const cwd = process.cwd()
const envLocalPath = resolve(cwd, '.env.local')
const loadedEnvLocal = loadEnvFile(envLocalPath)

// ── CLI flags ──────────────────────────────────────────────────────
const argv = process.argv.slice(2)
const CONFIRM = argv.includes('--confirm')

// ── Maps (locked inputs) ───────────────────────────────────────────

// DEPARTMENT: keep staff's values verbatim, EXCEPT 'Admin' → 'Administration'.
// Everything else passes through unchanged.
function mapDepartment(raw: string | null | undefined): string | null {
  const v = (raw ?? '').trim()
  if (!v) return null
  if (v.toLowerCase() === 'admin') return 'Administration'
  return v
}

// OFFICE: map both the staff slug (staff_members.office_location) AND the
// vcard display name (vcard_offices.name) onto ONE canonical name. Keyed
// case-insensitively. Unmapped values pass through raw (never dropped) and
// are surfaced in the dry-run summary for review.
const OFFICE_MAP: Record<string, string> = {
  // slugs (staff_members.office_location)
  'glendale': 'Glendale Office',
  'orange-hq': 'Orange County Office',
  'ontario': 'Inland Empire Branch',
  'las-vegas-tsg': 'Las Vegas (TSG)',
  'livermore-tsg': 'Livermore (TSG)',
  'porterville': 'Porterville',
  // vcard_offices.name display names (seeded in lib/admin-db.ts).
  // 'Ontario' / 'Glendale' / 'Porterville' display names equal their
  // slugs case-insensitively, so they're already covered above.
  'orange hq': 'Orange County Office',
  'livermore (tsg norcal)': 'Livermore (TSG)',
  'las vegas (tsg nv)': 'Las Vegas (TSG)',
}

function mapOffice(raw: string | null | undefined): {
  canonical: string | null
  unmapped: boolean
} {
  const v = (raw ?? '').trim()
  if (!v) return { canonical: null, unmapped: false }
  const hit = OFFICE_MAP[v.toLowerCase()]
  if (hit) return { canonical: hit, unmapped: false }
  return { canonical: v, unmapped: true } // pass through raw, flag for review
}

// ── Email normalization (the join key) ─────────────────────────────
function normEmail(raw: string | null | undefined): string | null {
  const v = (raw ?? '').trim().toLowerCase()
  return v || null
}

// ── Name normalization (dedup heuristic key) ───────────────────────
function normName(first: string | null, last: string | null): string {
  return `${(first ?? '').trim().toLowerCase()} ${(last ?? '').trim().toLowerCase()}`
    .replace(/\s+/g, ' ')
    .trim()
}

// ── Source row shapes (only the columns we read) ───────────────────
interface VcardRow {
  id: number
  first_name: string | null
  last_name: string | null
  title: string | null
  email: string | null
  phone: string | null
  mobile: string | null
  photo_url: string | null
  active: boolean | null
  office_name: string | null // via vcard_offices FK
  dept_name: string | null   // via vcard_departments FK
}

interface StaffRow {
  id: number
  first_name: string | null
  last_name: string | null
  full_legal_name: string | null
  title: string | null
  department: string | null
  email: string | null
  office_direct: string | null
  cell_phone: string | null
  office_location: string | null // slug
  photo_url: string | null
  active: boolean | null
}

// ── The resolved row we will insert ────────────────────────────────
interface HrRow {
  first_name: string
  last_name: string
  full_legal_name: string | null
  email: string // normalized
  mobile: string | null
  office_phone: string | null
  title: string | null
  department: string | null
  office: string | null
  photo_url: string | null
  active: boolean
  vcard_employee_id: number | null
  staff_member_id: number | null
  needs_dedup_review: boolean
  dedup_review_note: string | null
  population: 'staff-only' | 'vcard-only' | 'both'
  office_unmapped: boolean
}

function header(t: string) {
  console.log(`\n\x1b[1m\x1b[36m── ${t} ${'─'.repeat(Math.max(0, 60 - t.length))}\x1b[0m`)
}

async function main() {
  header('Backfill hr_employees (union of vcard_employees + staff_members)')
  console.log(`mode: ${CONFIRM ? '\x1b[1m\x1b[33mEXECUTE (will INSERT)\x1b[0m' : '\x1b[1mDRY RUN (no writes)\x1b[0m'}`)

  if (!loadedEnvLocal) {
    console.error(`\n❌ .env.local not found at: ${envLocalPath}`)
    console.error(`   Create it with: DATABASE_URL=postgresql://...`)
    process.exit(1)
  }
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
    console.error(`\n❌ DATABASE_URL is empty in .env.local. Add a value and retry.`)
    process.exit(1)
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()

  try {
    // ── 1. READ sources (SELECT ONLY) ──────────────────────────────
    header('Step 1 — Read source tables (READ-ONLY: SELECT only)')

    const vcardRes = await client.query<VcardRow>(`
      SELECT e.id, e.first_name, e.last_name, e.title, e.email,
             e.phone, e.mobile, e.photo_url, e.active,
             o.name AS office_name,
             d.name AS dept_name
        FROM vcard_employees e
        LEFT JOIN vcard_offices     o ON o.id = e.office_id
        LEFT JOIN vcard_departments d ON d.id = e.department_id
       ORDER BY e.id ASC
    `)
    const staffRes = await client.query<StaffRow>(`
      SELECT id, first_name, last_name, full_legal_name, title, department,
             email, office_direct, cell_phone, office_location, photo_url, active
        FROM staff_members
       ORDER BY id ASC
    `)

    const vcardRows = vcardRes.rows
    const staffRows = staffRes.rows
    console.log(`  vcard_employees : ${vcardRows.length} rows`)
    console.log(`  staff_members   : ${staffRows.length} rows`)

    // Index vcard rows by normalized email for the overlap join.
    const vcardByEmail = new Map<string, VcardRow>()
    const vcardNoEmail: VcardRow[] = []
    for (const v of vcardRows) {
      const e = normEmail(v.email)
      if (e) vcardByEmail.set(e, v)
      else vcardNoEmail.push(v)
    }
    const staffByEmail = new Map<string, StaffRow>()
    const staffNoEmail: StaffRow[] = []
    for (const s of staffRows) {
      const e = normEmail(s.email)
      if (e) staffByEmail.set(e, s)
      else staffNoEmail.push(s)
    }
    if (vcardNoEmail.length || staffNoEmail.length) {
      console.log(
        `  ⚠️  rows with NO email (skipped — email is the join key + NOT NULL): ` +
          `vcard=${vcardNoEmail.length}, staff=${staffNoEmail.length}`,
      )
    }

    // ── 2. Build the union → resolved HrRows ───────────────────────
    header('Step 2 — Build union by LOWER(TRIM(email)) + resolve conflicts')

    const resolved: HrRow[] = []
    const allEmails = new Set<string>([...vcardByEmail.keys(), ...staffByEmail.keys()])

    for (const email of allEmails) {
      const v = vcardByEmail.get(email)
      const s = staffByEmail.get(email)

      if (s && v) {
        // BOTH → one row. 'staff wins' on name/title/dept/office/status.
        // EXCEPT: photo from vcard; mobile = staff.cell_phone || vcard.mobile;
        // office_phone = staff.office_direct.
        const office = mapOffice(s.office_location)
        resolved.push({
          first_name: (s.first_name ?? '').trim(),
          last_name: (s.last_name ?? '').trim(),
          full_legal_name: s.full_legal_name?.trim() || null,
          email,
          mobile: (s.cell_phone?.trim() || v.mobile?.trim()) || null,
          office_phone: s.office_direct?.trim() || null,
          title: s.title?.trim() || null,
          department: mapDepartment(s.department),
          office: office.canonical,
          photo_url: v.photo_url?.trim() || null, // exception: photo from vcard
          active: s.active ?? true,               // staff wins on status
          vcard_employee_id: v.id,
          staff_member_id: s.id,
          needs_dedup_review: false,
          dedup_review_note: null,
          population: 'both',
          office_unmapped: office.unmapped,
        })
      } else if (s) {
        // STAFF-ONLY
        const office = mapOffice(s.office_location)
        resolved.push({
          first_name: (s.first_name ?? '').trim(),
          last_name: (s.last_name ?? '').trim(),
          full_legal_name: s.full_legal_name?.trim() || null,
          email,
          mobile: s.cell_phone?.trim() || null,
          office_phone: s.office_direct?.trim() || null,
          title: s.title?.trim() || null,
          department: mapDepartment(s.department),
          office: office.canonical,
          photo_url: s.photo_url?.trim() || null, // staff-only: keep staff photo if any
          active: s.active ?? true,
          vcard_employee_id: null,
          staff_member_id: s.id,
          needs_dedup_review: false,
          dedup_review_note: null,
          population: 'staff-only',
          office_unmapped: office.unmapped,
        })
      } else if (v) {
        // VCARD-ONLY — office comes from the vcard FK display name.
        const office = mapOffice(v.office_name)
        resolved.push({
          first_name: (v.first_name ?? '').trim(),
          last_name: (v.last_name ?? '').trim(),
          full_legal_name: null,
          email,
          mobile: v.mobile?.trim() || null,
          office_phone: v.phone?.trim() || null,
          title: v.title?.trim() || null,
          department: mapDepartment(v.dept_name),
          office: office.canonical,
          photo_url: v.photo_url?.trim() || null,
          active: v.active ?? true,               // carry vcard active flag
          vcard_employee_id: v.id,
          staff_member_id: null,
          needs_dedup_review: false,
          dedup_review_note: null,
          population: 'vcard-only',
          office_unmapped: office.unmapped,
        })
      }
    }

    // ── 3. DEDUP FLAG (NO merge) ───────────────────────────────────
    // Same-PERSON-different-EMAIL: group resolved rows by normalized
    // full name. Any name shared by >1 distinct email is a suspected
    // dup. Flag every member (still separate rows) with a note naming
    // the other email(s). High- vs lower-confidence is left to Jerry's
    // in-app review; we flag conservatively (exact normalized-name match).
    header('Step 3 — Detect + FLAG same-person-different-email (no merge)')

    const byName = new Map<string, HrRow[]>()
    for (const r of resolved) {
      const key = normName(r.first_name, r.last_name)
      if (!key.trim()) continue
      const arr = byName.get(key) ?? []
      arr.push(r)
      byName.set(key, arr)
    }
    let flaggedCount = 0
    for (const [key, group] of byName) {
      const emails = new Set(group.map((g) => g.email))
      if (group.length > 1 && emails.size > 1) {
        for (const r of group) {
          const others = group
            .filter((g) => g.email !== r.email)
            .map((g) => g.email)
          r.needs_dedup_review = true
          r.dedup_review_note =
            `Possible same person ("${key}") as: ${others.join(', ')} ` +
            `— flagged for in-app review, NOT auto-merged.`
          flaggedCount++
        }
      }
    }

    // ── 4. SUMMARY ─────────────────────────────────────────────────
    header('Step 4 — Summary (what WOULD be inserted)')
    const byPop = {
      'staff-only': resolved.filter((r) => r.population === 'staff-only').length,
      'vcard-only': resolved.filter((r) => r.population === 'vcard-only').length,
      both: resolved.filter((r) => r.population === 'both').length,
    }
    const unmappedOffices = [
      ...new Set(
        resolved
          .filter((r) => r.office_unmapped)
          .map((r) => r.office)
          .filter((o): o is string => !!o),
      ),
    ]
    const deptsSeen = [...new Set(resolved.map((r) => r.department).filter((d): d is string => !!d))].sort()

    console.log(`  total resolved rows   : ${resolved.length}`)
    console.log(`    staff-only          : ${byPop['staff-only']}`)
    console.log(`    vcard-only          : ${byPop['vcard-only']}`)
    console.log(`    both (one row each) : ${byPop.both}`)
    console.log(`  flagged needs_dedup   : ${flaggedCount} row(s)`)
    console.log(`  inactive rows         : ${resolved.filter((r) => !r.active).length}`)
    console.log(`  departments (canonical): ${deptsSeen.join(', ') || '(none)'}`)
    if (unmappedOffices.length) {
      console.log(`  ⚠️  UNMAPPED offices (passed through raw — review): ${unmappedOffices.join(', ')}`)
    } else {
      console.log(`  offices               : all mapped to canonical names ✓`)
    }

    if (flaggedCount > 0) {
      console.log('\n  Flagged dedup pairs:')
      const seen = new Set<string>()
      for (const r of resolved.filter((r) => r.needs_dedup_review)) {
        const k = normName(r.first_name, r.last_name)
        if (seen.has(k)) continue
        seen.add(k)
        const group = byName.get(k) ?? []
        console.log(`    • "${k}": ${group.map((g) => g.email).join('  ↔  ')}`)
      }
    }

    // ── 5. WRITE (only with --confirm) ─────────────────────────────
    if (!CONFIRM) {
      console.log(
        '\n⚠️  DRY RUN — no rows were written.\n' +
          '   Re-run to EXECUTE (3b, after review): npm run backfill:hr -- --confirm',
      )
      process.exit(0)
    }

    header('Step 5 — INSERT into hr_employees (idempotent: ON CONFLICT (email) DO NOTHING)')
    let inserted = 0
    let skipped = 0
    for (const r of resolved) {
      if (!r.first_name || !r.last_name) {
        console.log(`  ⚠️  skipping row with blank name (email=${r.email})`)
        skipped++
        continue
      }
      const res = await client.query(
        `INSERT INTO hr_employees (
           first_name, last_name, full_legal_name, email,
           mobile, office_phone, title, department, office, photo_url,
           active, vcard_employee_id, staff_member_id,
           needs_dedup_review, dedup_review_note, created_by, updated_by
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$16
         )
         ON CONFLICT (email) DO NOTHING`,
        [
          r.first_name,
          r.last_name,
          r.full_legal_name,
          r.email,
          r.mobile,
          r.office_phone,
          r.title,
          r.department,
          r.office,
          r.photo_url,
          r.active,
          r.vcard_employee_id,
          r.staff_member_id,
          r.needs_dedup_review,
          r.dedup_review_note,
          'backfill-hr-employees',
        ],
      )
      if (res.rowCount === 1) inserted++
      else skipped++
    }

    console.log(`\n✅ INSERT complete.`)
    console.log(`   inserted: ${inserted}`)
    console.log(`   skipped (already present / blank): ${skipped}`)

    const total = await client.query<{ c: string }>(`SELECT COUNT(*)::text AS c FROM hr_employees`)
    const flagged = await client.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM hr_employees WHERE needs_dedup_review = true`,
    )
    console.log(`   hr_employees total rows now: ${total.rows[0].c}`)
    console.log(`   needs_dedup_review = true:   ${flagged.rows[0].c}`)
    process.exit(0)
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('\n❌ Fatal error:', err instanceof Error ? err.message : String(err))
  process.exit(1)
})
