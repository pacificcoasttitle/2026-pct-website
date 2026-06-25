# HR Master Re-Architecture + Unified Onboarding — Design Doc

**Status:** Design (build fresh, staged, against this doc)
**Author context:** Director/Claude, grounded on three read-only investigations
**Hard constraint:** The Marketing Center is working perfectly and must have **ZERO interruption of service.** Every decision below is subordinate to this.
**Date:** drafted current session, for execution in a fresh session.

---

## 0. The Vision (what we're actually building)

Today, the same person's identity lives in **three tables that don't talk to each other** — `hr_employees` (HR), `vcard_employees` (Marketing), `staff_members` (Signatures). Change a title in Marketing and HR never knows. This is *drift*, and it's measurable (see §7).

The end state is a two-layer system:

- **Layer 1 — Identity Unification.** `hr_employees` becomes the **single master** for shared identity (name, email, title, dept, office, active, dates, phones). The other tables keep their own section-specific data and keep being read exactly as today — HR **syncs values down** into them. One source of truth per shared field. No drift.

- **Layer 2 — Unified Onboarding Orchestration.** HR is the **control point** for the entire employee lifecycle. HR adds a new employee or sales rep → the person receives the **onboarding form designated for their role** (a sales rep gets the marketing section; a CS rep doesn't) → **status and task completion flow back to HR.** Each department (HR, Marketing, Customer Service) owns *its portion* of onboarding; HR sees the whole.

**Layer 1 is the foundation. Layer 2 is the payoff.** You cannot orchestrate onboarding across departments until the identity underneath is unified. This doc specifies Layer 1 in build-ready detail and scopes Layer 2 as the vision Layer 1 unlocks.

---

## 1. Core Principle: each module keeps what was built for it

This is the line that resolves every tension in the design:

> **HR owns shared *identity*. Each module owns its *function*.**

- HR is the master for the **facts that are the same person's same facts everywhere** — your name, email, title, department, office, whether you're active, your phone numbers.
- Marketing keeps everything that makes Marketing *Marketing* — bio, slug, photo styling, vCard theme, Mailchimp, social, SMS codes, SEO copy, view counts.
- Signatures keep everything signature-specific — template, license, group email, fax.
- Customer Service (future) keeps its portion.

Nobody loses power over their own function. We are **removing duplicate edit points for shared facts**, not taking away module capability. Marketing was never *supposed* to be the authority on someone's job title — HR is. Marketing is the authority on their vCard, and stays that.

---

## 2. The Approach: HR Syncs DOWN (the zero-interruption choice)

Two ways to unify were considered:

| Approach | What changes | Risk to Marketing |
|---|---|---|
| **Marketing reads FROM HR** | ~30 vCard + ~9 signature read sites, including the **live public website** (`pct.com/{slug}`, VCF, SEO, Mailchimp) | **High** — touches live read paths |
| **HR syncs DOWN to facets** ✅ | Only HR's write path; facet tables get their shared columns updated | **None to reads** — Marketing code is untouched |

**Decision: HR Syncs DOWN.** When a shared field changes in `hr_employees`, HR writes the new value down into the linked `vcard_employees` / `staff_members` row via the stable FK. Marketing & Signature **keep their columns and keep reading them exactly as today.** Their read code never changes, so it cannot break.

**Why this is provably safe (from investigation):**
- **No triggers** on any of the three tables — a targeted `UPDATE … SET (shared cols) WHERE id = …` fires no side effects.
- **Link integrity is perfect** — `vcard_employee_id` 35 linked / 0 orphans / 0 dup; `staff_member_id` 99 linked / 0 orphans / 0 dup; 0 HR rows with neither facet. Every facet can be reached from its master via FK.
- The sync touches **only the shared columns** and leaves every section-specific column untouched.

---

## 3. Field Classification (LOCKED decisions + OPEN flags)

### 3a. SHARED — HR is master, syncs down (LOCKED)

| Field | HR column | → vCard | → Signature |
|---|---|---|---|
| First name | `first_name` | `first_name` | `first_name` |
| Last name | `last_name` | `last_name` | `last_name` |
| Email | `email` | `email` | `email` |
| Title | `title` | `title` | `title` |
| Department | `department` (text) | `department_id` (FK — resolve) | `department` (text) |
| Office | `office` (text) | `office_id` (FK — resolve) | `office_location` (slug — resolve) |
| Active | `active` | `active` | `active` |
| Birthday | `birthday` | — (HR only) | — (HR only) |
| Start date | `start_date` | — (HR only) | — (HR only) |
| **All phone numbers** | `mobile`, `office_phone` (+ any added) | `phone`, `mobile` | `office_direct`, `cell_phone` |
| **Photo / headshot** | `photo_url` | `photo_url` | `photo_url` |
| **Full legal name** | `full_legal_name` | — | `full_legal_name` |
| **License number** | (add to HR) | — | `license_number` |

**Phone — the elegant rule (LOCKED):** HR owns the phone **number values** (all of them). Each module **chooses which number it displays** from HR's available set. The *numbers* are shared identity (one source of truth — change a cell once in HR, correct everywhere); *which number a signature vs. a vCard shows* is a presentation choice that stays the module's. (Phase 1 syncs the numbers into the existing facet phone columns — zero module change. A per-module "which phone to display" picker is a **deferred enhancement**, §10.)

### 3b. SECTION-SPECIFIC — stays on its table, module keeps full edit control (LOCKED)

- **vCard / Marketing:** `slug`, `bio`, `languages`, `specialties`, `linkedin`, `facebook`, `instagram`, `twitter`, `website`, `background_image`, `theme_color`, `featured`, `show_qr`, `show_social`, `show_bio`, `analytics_enabled`, `view_count`, `save_count`, `website_*` (all SEO/profile), `mailchimp_form_code`, `mailchimp_audience_id`, `sms_code`.
- **Signature:** `signature_template_id`, `part_time`, `fax`, `group_email`, branding/template fields, import metadata.

### 3c. Resolved since first draft (now LOCKED shared, top-down)

- **`photo_url` → shared.** Same concept as all employee info — one person, one headshot, HR owns it, flows down. (Optional later: a module *may* override with its own styled image; default is the shared HR headshot.)
- **`full_legal_name` → shared.** Legal identity is an HR/legal fact, controlled top-down.
- **`license_number` → shared.** A real employee credential (matters for title/escrow); HR-mastered, flows down to signatures. Add the column on the HR side.

### 3d. Still genuinely OPEN

| Field | The question | Recommendation |
|---|---|---|
| `employment_status` (HR) | How does it relate to `active`? | **Keep HR-only.** `active` (boolean) syncs; `employment_status` (text: on-leave, terminated, pending) is HR-internal lifecycle, does **not** sync. |
| `sales_manager` (vCard) | Marketing-recap flag or real role attribute? | **Keep Marketing-section** for now (recap-recipient flag). |

---

## 4. The Sync Mechanism (build spec)

### 4a. The declarative field map (EXTENSIBILITY — first-class requirement)

Per your directive — *"make sure we can expand the fields on the HR side"* — the shared-field set is **NOT hard-coded across the codebase.** It is **one declared map** (e.g. `lib/hr-sync/shared-field-map.ts`) that states, for each shared field: the HR column, the vCard target (+ resolver if FK), the staff target (+ resolver if slug). The sync engine reads this map.

**Adding a shared field later = add one entry to the map.** No surgery. This is the difference between a design that ages well and one you fight. The map is the single source of truth for "what is shared and how does it flow down."

### 4b. Dept / Office / phone resolution (the one real wrinkle)

HR stores dept/office as **text**; vCard stores **FK ids**; signatures store office as a **slug**. The sync must *resolve*, not copy:

- `hr.department` (text) → `vcard.department_id` via `vcard_departments.name` match.
- `hr.office` (text) → `vcard.office_id` via `vcard_offices.name` match.
- `hr.office` (display label) → `staff.office_location` (slug) via an explicit mapping table, e.g. `Glendale Office → glendale`, `Orange County Office → orange-hq`, `Inland Empire Branch → ontario`, `Porterville → porterville`, `Las Vegas (TSG) → las-vegas-tsg`, `Livermore (TSG) → livermore-tsg`.

**Current state:** all currently-linked rows resolve cleanly (0 unmapped). **Risk:** HR has departments beyond vCard's 5 options, so a *future* employee could have a dept vCard doesn't know.

### 4c. ⚠️ FAIL-CLOSED guardrail (non-negotiable)

> **If a dept/office/slug cannot be resolved, the sync SKIPS that field for that facet — it never writes a wrong id, never nulls a field.** The unresolved value is reported (drift/exception report), not guessed. A bad write into Marketing's table is the one thing we must never do.

### 4d. What the sync touches vs. never touches

- **vCard — touches ONLY:** `first_name`, `last_name`, `title`, `email`, `active`, `department_id`, `office_id`, phone columns, (`updated_at` bumps naturally). **Never touches** any §3b Marketing field.
- **Signature — touches ONLY:** `first_name`, `last_name`, `title`, `email`, `active`, `department`, `office_location`, phone columns, (`updated_at`/`updated_by`). **Never touches** any §3b Signature field.

### 4e. Sync fire points (where it hooks)

| HR write site | Fires sync? | Notes |
|---|---|---|
| `updateHrEmployee()` | **Yes** — primary hook | the main shared-field edit path |
| `setHrEmployeeActive()` (deactivate/reactivate) | **Yes** | the active cascade — symmetric on/off |
| `finalizeHrOnboarding()` | **Yes**, if facets linked | sync after the HR write |
| `createHrEmployee()` | **No-op** | new HR-only hire has null FKs → nothing to sync (correct) |

**Null facet FK = no-op, never an error.** Required so new HR-only hires don't error, and so we never accidentally email-join to the wrong facet.

### 4f. ⚠️ Transaction posture (added guardrail)

> **The HR write is the source of truth and must succeed independently.** The sync-down should **not block or roll back** the HR write. Sequence: HR write commits → sync fires → per-field fail-closed → any failure is **logged + surfaced in the drift report**, never silent. A vCard dept-resolution failure must **never** prevent HR from saving an employee. (This avoids the trap where a facet problem locks HR.)

### 4g. ⚠️ Audit trail (added requirement)

HR is now writing into Marketing's and Signatures' tables. Every sync-down write is **logged** (employee, field, old→new, target facet, actor, timestamp). This is the trust mechanism — if Marketing ever asks "why did this change," there's a trail. Without it, cross-table writes are a black box.

### 4h. ⚠️ Idempotency (added requirement)

The sync must be **safe to re-run** — running it twice produces the same result (it only ever *corrects facet shared fields to match HR*). This makes the reconciliation job, the dry-run, and any repair re-runnable without fear.

### 4i. ⚠️ NEVER overwrite a real value with a blank (core guardrail)

> **If HR's value for a shared field is null/empty, the sync SKIPS that field — it leaves the facet's existing value untouched.** The sync only ever *fills in* or *corrects* with a real value; it never *erases*.

This is critical and applies to **every** shared field, most visibly **photo_url**: HR's photo is authoritative *when HR has one*, but where HR's photo is blank, the facet keeps its existing (working) photo. **This is what prevents broken photos on the live public site** — a vCard with a valid R2 photo URL never gets nulled because HR happens to be empty for that person. Combined with §6a (populate HR's photos UP from vCard first), photos become safely shared with zero risk of a broken link.

### 4j. Photo handling — populate UP before syncing DOWN

`photo_url` is shared (§3a), but HR is currently sparse on photos while vCard has 35 valid R2 URLs. **Before HR is authoritative on photos**, a one-time backfill pulls the working vCard photos UP into `hr_employees.photo_url` (same pattern as §6's "correct the master first"). Then HR genuinely owns the right photo, and syncing down just writes back the correct value. The §4i guardrail protects the gap in the meantime.

---

## 5. Reverse-Drift Decision (the one honest limitation)

The sync is **one-directional (HR → facet).** So a *direct* edit to a shared field in the Marketing or Signature admin would not flow back up to HR → reverse drift until HR re-syncs.

**Decision (per "HR is the final say"):** make the **shared fields read-only in the Marketing & Signature *edit forms*.** They display (so the user sees the value) with an **"edit in HR" affordance**, but can't be changed there.

**Scope of this change — important for the zero-interruption rule:**
- This touches **only admin edit-form inputs** (`EmployeeEditForm.tsx`, `StaffEditClient.tsx`) + the server-side allowlists on their PATCH routes (`/api/admin/employees/[slug]`, `/api/admin/signatures/staff/[staffId]`) + the CSV import (must not overwrite shared fields).
- It does **NOT** touch any read path — the public site, campaigns, sends, signature rendering all keep reading exactly as today.
- Disabling a few inputs is **far** lower risk than changing reads, but it IS a Marketing/Signature-side change — flagged and accepted as the price of true authority.

**Server-side enforcement (added guardrail):** read-only must be enforced at the **API allowlist**, not just hidden in the UI. The PATCH routes must **reject** shared-field changes (strip them from the allowlist), so the authority holds even if someone calls the API directly.

---

## 6. Initial Reconciliation — the drift that exists TODAY

The three tables **already disagree** (this is proof your instinct was right — the drift is real, not theoretical):

- **vCard mismatches vs HR:** first_name 2, title 6, active 1, department 4, office 5; last_name 0, email 0.
- **Staff mismatches vs HR:** department 10; (office is slug-vs-label formatting — expected, handled by the resolver, not real drift); name/title/email/active 0.

So **~18 real mismatches** exist before we start. Step one is a **one-time reconciliation to a clean baseline** — the sync keeps them aligned *going forward*, but we must start aligned.

**⚠️ The elegant resolution — correct HR once, let the sync trickle down.** The sync's only job is "make the facet match HR." So the 18 mismatches are corrected by the *normal* sync — **as long as HR holds the *right* value.** The one risk: for a few of the 18, Marketing may have the *newer/correct* value while HR is stale (e.g. a promotion Marketing recorded but HR's backfill predates). Blindly syncing would overwrite Marketing's correct value with HR's stale one.

So the one-time reconciliation is:
1. **Dry-run report** — list the ~18, both values side-by-side ("HR says X, Marketing says Y").
2. **Review (~5 min)** — for the handful where HR is stale, **correct the value IN HR.** Now HR genuinely holds the right value for all 18.
3. **Run the sync** — it trickles HR's now-correct values down. All 18 align. Correct everywhere.

The elegance: **you never fix the 18 facets directly — you fix HR (the one place) and the sync distributes it.** That's the master pattern: only ever correct the master; it flows down. The 18 today and every change forever after work identically. The review step isn't special cleanup — it's just *confirming HR is right before crowning it the source of truth.*

---

## 7. Staged Rollout (safe, reversible, each stage gated)

Each stage ships and is verified before the next. Nothing is irreversible until the very end.

1. **Verify links & add indexes.** Confirm 0 orphans / 0 dup (done — re-verify at build). Index the FK join paths.
2. **Build the declarative shared-field map** (§4a) + the dept/office/slug **resolvers** (§4b) with fail-closed (§4c).
3. **Build the sync-down helper** — touches only linked facets, only shared columns, fail-closed, idempotent, logged. **Not wired to anything yet.**
4. **Dry-run drift report** (§6) — read-only, shows current mismatches + what the sync *would* change. **You review.**
5. **Reconcile to baseline** — align the ~18 (HR-wins default, hand-corrected per your review).
6. **Enable the sync on HR writes** (§4e) — now HR edits flow down. Marketing reads still untouched.
7. **Make shared fields read-only** in Marketing/Signature edit forms + API allowlists + CSV import guard (§5).
8. **Keep old facet columns populated** (they ARE the columns being synced) — no drops yet. Run the **drift report on a schedule** as an ongoing audit (should stay at zero once §6–7 done).
9. **(Far later, optional)** Only after public pages, sends, imports, and admin forms have all shipped clean for a full release — consider whether to drop anything. *Likely we never drop* — the facet columns are what Marketing reads; we just keep them HR-maintained. **Dropping is not required for the vision** and carries the most risk, so it's explicitly out of the initial scope.

**Reversibility:** through stage 8, every step can be turned off. The sync is additive (only corrects facets to match HR). If anything looks wrong, disable the sync hook and the system reverts to "facets hold their own values" — exactly today's behavior.

---

## 8. Risks & Guardrails (bulletproofing)

| Risk | Guardrail |
|---|---|
| Bad dept/office FK or slug written into Marketing | **Fail-closed** — unresolved → skip + report, never write a wrong id |
| Sync failure blocks HR from saving | **HR write commits independently**; sync is after-commit, non-blocking (§4f) |
| Silent sync failures | **Logged + scheduled drift report** as ongoing audit (§4g, §7.8) |
| Nulling a facet field | Sync only ever **sets to HR's non-null value**; never writes null from a missing HR value (§4i — never overwrite a real value with a blank; protects live photos especially) |
| Re-run corrupts data | **Idempotent** — re-run = same result (§4h) |
| Direct API call bypasses read-only UI | **Server-side allowlist rejects** shared fields, not just UI hiding (§5) |
| CSV import overwrites shared fields | Import guard — shared fields stripped from upsert (§5) |
| `needs_dedup_review` (12 rows) thrashing | Each facet links to exactly **one** HR row (0 dup links), so a facet syncs from one master only; dedup is an HR-internal merge concern, doesn't affect sync direction. Note: resolve dedup before merging HR rows. |
| Email change breaks email-based lookups (asset-delivery send, signature-by-email, import) | Email syncs down too, so facet email stays correct; lookups still resolve. Verify after enabling. |
| Public site regression | **No read path changes** in this design — the public site is structurally untouched. This is the whole point of sync-down. |

**Verification gates (run at each relevant stage):**
- Every vCard facet & every staff facet resolves to its HR master (FK).
- Public `pct.com/{slug}` pages render identical name/title/email/photo before vs. after (they read the same columns — must be unchanged).
- Signature HTML before/after diff is empty (or intended).
- Asset-delivery upload-by-sms_code and send-by-email resolve the **same** person.
- No PATCH/import route can mutate a shared field after stage 7.

---

## 9. Layer 2 — Unified Onboarding Orchestration (the vision Layer 1 unlocks)

> *"HR adds a new employee or sales rep → the person receives their designated onboarding form → updates flow back to HR about status and tasks completed/pending."*

This is where it comes together. Today there are **two separate onboarding systems**:
- The **HR onboarding wizard** we just built (Phase 4) — token invite, public form, documents, HR review, finalize. Built as an HR function. ✅
- The **legacy rep onboarding** (`app/onboarding/[token]/*`) — bio, photo, client-list upload. Built as a **Marketing** function. Has other components (the asset pieces).

**The vision unifies them under HR as orchestrator**, with department-owned sections:

- **HR owns** the agreements & administration portion (the packet, documents, legal name, dates — what Phase 4 already does).
- **Marketing owns** its portion (the rep's bio, photo, slug, vCard setup — what the legacy rep onboarding does).
- **Customer Service owns** its portion (future).

### 9a. Role-designated onboarding forms

"Their designated onboarding form" = the onboarding is **composed of department sections, selected by role:**
- A **sales rep** gets HR's packet **+ Marketing's vCard section** (bio/photo/slug).
- A **CS rep** gets HR's packet **+ CS's section**, no Marketing.
- An **admin/back-office** hire gets just HR's packet.

The onboarding form becomes **modular** — HR defines the role, the role determines which department sections appear.

### 9b. Status & task tracking back to HR

"Updates sent back to HR about status and tasks completed/pending" = a **per-onboarding task/checklist model**, where each department's section contributes tasks, and completion **rolls up to HR's view.** Today we have coarse status (`invited/in_progress/submitted/finalized`); Layer 2 adds **per-department, per-task** progress so HR sees: *"Marketing section: photo uploaded ✓, bio pending; HR section: documents complete ✓; agreement: signed ✓."*

### 9c. HR-initiated facet creation (the "HR adds a new sales rep" path)

Critical new capability Layer 1 enables: today a new HR employee has **no** vCard/signature facet (FKs null). The vision needs HR to **add a sales rep** — which means HR (or the finalize step) can **create and link a `vcard_employees` row** for a new rep, then the sync keeps it maintained. This is *HR-initiated facet creation* — currently finalize makes HR-only rows; Layer 2 lets HR spin up the Marketing facet when the role calls for it. (Depends entirely on Layer 1's link + sync being solid first.)

### 9d. Layer 2 is scoped, not specified here

Layer 2 is a **larger project** that builds on a completed, proven Layer 1. This doc names the vision and the pieces so Layer 1 is built with Layer 2 in mind (the modular sections, the role concept, HR-facet-creation). **Layer 2 gets its own design pass once Layer 1 is shipped and stable.** Do not build Layer 2 until the identity foundation is unified and verified.

---

## 10. Deferred Enhancements (named, not now)

- **Per-module phone-display picker** (§3a) — let each module choose *which* HR number it shows. Phase 1 just keeps all numbers correct; the picker is additive later.
- **HR canonical photo** with module override (§3c) — if you decide photo should be shared.
- **Dropping redundant facet columns** (§7.9) — likely never; highest risk, not required.
- **Dedup-merge tooling** for the 12 `needs_dedup_review` rows — independent of sync, but resolve before any HR-row merges.

---

## 11. Decisions Locked vs. Still Open

**LOCKED:**
- HR is the single master for shared identity.
- Approach: HR syncs DOWN (zero Marketing read-path interruption).
- Shared set: name, email, title, dept, office, active, dates, **all phone numbers, photo_url, full_legal_name, license_number**.
- Each module keeps its section-specific fields + full edit control of them.
- Shared fields become read-only in Marketing/Signature edit forms (HR-authoritative), enforced server-side.
- The shared-field set is a **declared, expandable map** (extensibility is first-class).
- Fail-closed, non-blocking, logged, idempotent sync.
- Reconcile by **correcting HR once** (review the ~18 dry-run, fix stale HR values), then let the sync trickle down.

**STILL OPEN (minor, non-blocking):**
- `employment_status`: keep HR-only (rec, §3d). `sales_manager`: keep Marketing-section (rec, §3d).
- Layer 2 scope & sequencing (§9) — its own design pass after Layer 1 ships.

---

## 12. Why This Is Safe (the one-paragraph summary for any reviewer)

We make `hr_employees` the master and have it **write shared values down** into the Marketing and Signature tables through stable, verified FKs. Those tables keep their columns and keep being read exactly as they are today, so **no read path — including the live public website — changes or can break.** The sync touches only shared columns, fails closed on any unresolved mapping, runs after the HR write so it can never block HR, is logged and idempotent, and is reversible at every stage before any (optional, likely-never) column drop. The only deliberate change to Marketing/Signature is making a handful of shared identity inputs read-only in their **edit forms** — never their reads. We start by *seeing* the drift that already exists, reconcile to a clean baseline, then keep it clean automatically. That's how HR becomes the single control point with zero interruption to anything that's working today.
