# TESSA™ Preliminary Title Report Analysis — Complete Technical Reference

> **Last updated:** March 2026
> **Status:** Live in production at pct.com
> **Access:** Password-protected via `TESSA_ACCESS_CODE` environment variable

---

## Table of Contents

1. [What It Does](#1-what-it-does)
2. [User Entry Points](#2-user-entry-points)
3. [End-to-End Pipeline](#3-end-to-end-pipeline)
4. [Step-by-Step Breakdown](#4-step-by-step-breakdown)
5. [AI Prompts & LLM Configuration](#5-ai-prompts--llm-configuration)
6. [Data Types & Structures](#6-data-types--structures)
7. [Guardrails & Validation](#7-guardrails--validation)
8. [Results UI](#8-results-ui)
9. [Authentication](#9-authentication)
10. [File Map](#10-file-map)
11. [Legacy vs. Current Architecture](#11-legacy-vs-current-architecture)

---

## 1. What It Does

TESSA's Prelim Analysis takes a Preliminary Title Report PDF and produces a structured, plain-English breakdown of everything a real estate professional needs to close the deal. The output includes:

- **Complexity score** (0–100 gauge) with reasons
- **Top closing risks** ranked by severity
- **Title requirements** with item numbers, severity, who handles each, and why it matters
- **Property information** (APN, address, vesting, ownership structure)
- **Liens & judgments** with amounts, recording refs, and required actions
- **Taxes & assessments** with exact installment amounts, statuses, penalties, and defaults
- **Other findings** (easements, CC&Rs, HOA, solar, UCC filings)
- **Document status** (completeness, missing sections)

The entire analysis runs **client-side in the browser** — the PDF is never uploaded to any server for storage. Only the extracted text is sent to the AI proxy for analysis.

---

## 2. User Entry Points

There are **two distinct paths** for analyzing documents with TESSA:

### Path A: Structured JSON Pipeline (Primary — Hero "Analyze a Prelim" tab)

| Entry Point | Component | What Happens |
|---|---|---|
| Homepage hero → "Analyze a Prelim" tab | `components/hero-simple.tsx` | User drops/selects a PDF, clicks "Analyze Report" → auth check → opens `TessaPrelimModal` |
| `TessaPrelimModal` | `components/tessa/TessaPrelimModal.tsx` | Full-screen modal with progress bar, step indicator, and structured results via `TessaPrelimResults` |

This path uses the **multi-step JSON pipeline** in `hooks/usePrelimAnalysis.ts`. It's the primary, production-quality flow.

### Path B: Simple Chat Analysis (Floating Widget)

| Entry Point | Component | What Happens |
|---|---|---|
| Floating "Ask TESSA™" widget → Upload PDF button | `components/tessa/TessaChatWidget.tsx` | Extracts text with pdfjs inline, sends as a plain chat message to `/api/tessa` |

This path treats the PDF as a chat message. It uses `TessaContext.analyzePdf()` which wraps the text in a simple prompt and sends it through the chat API. **No pre-parser, no guardrails, no structured output.** It's a convenience feature, not the primary analysis tool.

---

## 3. End-to-End Pipeline

The structured pipeline (Path A) executes 6 steps entirely in the browser:

```
┌─────────────────────────────────────────────────────────────────┐
│  USER drops PDF                                                  │
│    ↓                                                             │
│  Step 1: extractPdfText(file)            [lib/tessa/tessa-pdf.ts]│
│    PDF.js extracts text (max 50K chars)                          │
│    ↓                                                             │
│  Step 2: computeFacts(pdfText)      [lib/tessa/tessa-pre-parser] │
│    Deterministic regex/heuristics → PrelimFacts (ground truth)   │
│    ↓                                                             │
│  Step 3: callTessaExtract(...)          [lib/tessa/tessa-api.ts] │
│    LLM Call #1 → structured JSON (ExtractedAnalysis)             │
│    ↓                                                             │
│  Step 4: validateAndRepairExtraction()  [lib/tessa/tessa-guardrails] │
│    Deterministic merge: inject missing facts, override taxes     │
│    ↓                                                             │
│  Step 5: callTessaSummarize(...)        [lib/tessa/tessa-api.ts] │
│    LLM Call #2 → plain-English summary with top closing risks    │
│    ↓                                                             │
│  Step 6: buildCheatSheetItems(facts)    [lib/tessa/tessa-cheat-sheet] │
│    Deterministic → agent-friendly cheat sheet data               │
│    ↓                                                             │
│  RENDER: TessaPrelimResults component                            │
└─────────────────────────────────────────────────────────────────┘
```

**Status progression:** `idle` → `extracting` → `computing_facts` → `analyzing` → `validating` → `summarizing` → `complete` (or `error`)

**Progress bar steps** are simulated with timed intervals during the LLM calls (which can take 15–60 seconds), showing contextual labels like "Identifying title requirements...", "Mapping liens and encumbrances...", etc.

---

## 4. Step-by-Step Breakdown

### Step 1: PDF Text Extraction

**File:** `lib/tessa/tessa-pdf.ts`

- Uses **PDF.js v3.11.174** (pinned — v4+ has worker loading issues with Next.js)
- Worker loaded from cdnjs CDN
- Respects `hasEOL` from PDF.js for proper line breaks
- Heuristic: re-inserts newlines before numbered items (`NN. `) that PDF flattening often removes
- **50,000 character cap** — truncated if larger
- Throws if extracted text is under 100 characters (likely image-based or corrupted PDF)
- PDF never leaves the browser — processed entirely client-side

### Step 2: Pre-Parser (Deterministic Ground Truth)

**File:** `lib/tessa/tessa-pre-parser.ts` (727 lines)

This is the most critical piece. Before the AI ever sees the document, the pre-parser extracts **hard facts** using regex and heuristics. These facts become ground truth that the AI cannot contradict.

The pre-parser extracts:

| Category | What It Finds |
|---|---|
| **Property Info** | Address, APN, effective date, proposed lender/loan amount, state (CA/AZ/NV), property type (SFR/condo/commercial/etc.) |
| **Taxes** | Tax IDs, fiscal years, installment amounts, payment statuses (PAID/OPEN/DELINQUENT), penalties, homeowner exemptions, code areas, total delinquent amounts |
| **Tax Defaults** | Default numbers, APNs, redemption schedules with exact amounts and deadlines |
| **Requirements** | Company-stated requirements classified by type: reconveyance, SOI, spousal joinder, trust docs, LLC/corp authority, suspended corp, HOA clearance, survey/inspection, underwriting review, etc. |
| **Deeds of Trust** | Position, amount, dated, trustor/trustee/beneficiary, loan number, recording info, assignments, substitutions, notices of default/trustee sale, sale date/time/location, fractional interests |
| **Foreclosure Flags** | Notice of Trustee Sale (with sale date/time/location), Trustee's Deed exceptions, US redemption rights |
| **HOA Liens** | Association name, amount, recording info, status |
| **Assignment of Rents** | Amount, assignee/assignor, recording info |
| **Easements** | Purpose, in favor of, affects, recording number |
| **CC&Rs** | Recording info, book/page, violation clauses, modifications |
| **Ownership Structure** | Vesting type (individual/trust/corporate/LLC/TIC), vestees, trust name/date, TIC interest percentages, spousal joinder requirements |
| **Recent Conveyances** | Grantor/grantee, recording date, days since (flags < 90 days as seasoning concern) |
| **Special Flags** | Solar/Sunrun, UCC filings, trust, easement estate, out-of-state, TIC ownership, multiple DOTs, fractional beneficiaries |

**How it works:** The parser first isolates the "critical section" of the prelim (between "AT THE DATE HEREOF...WOULD BE AS FOLLOWS:" and "END OF ITEMS"), then splits it into numbered items and runs targeted regex patterns against each.

### Step 3: LLM Call #1 — Structured Extraction

**Files:** `lib/tessa/tessa-prompts.ts` + `lib/tessa/tessa-api.ts`

The extraction call sends:
- **System prompt:** "You are a title document analysis engine. You extract structured data... respond with valid JSON only — no markdown, no backticks, no preamble."
- **User prompt:** The raw PDF text (up to 50K chars) plus the pre-parser's `factsJson` labeled as "GROUND TRUTH (pre-extracted facts — do NOT contradict these)"
- **JSON schema:** The exact structure of `ExtractedAnalysis` with all fields, types, and valid values

**LLM configuration:**
- Endpoint: `https://tessa-proxy.onrender.com/api/ask-tessa`
- `max_tokens: 4000`
- `temperature: 0` (deterministic — no creativity)
- `request_type: 'prelim_extract'`
- `response_format: 'json'`

The response is parsed as JSON (with markdown fence stripping as a safety net).

### Step 4: Guardrails — Validate & Repair

**File:** `lib/tessa/tessa-guardrails.ts`

After the LLM returns its JSON extraction, the guardrails system performs **deterministic validation and repair** against the pre-parser's ground truth:

1. **Requirements injection:** Any requirement found by the pre-parser but missing from the LLM output is added back
2. **Deeds of Trust injection:** Any DOT found by the pre-parser but missing from the LLM liens is added
3. **Tax override:** The LLM's tax data is **completely replaced** with the pre-parser's tax data (ground truth always wins for dollar amounts)
4. **Tax defaults injection:** Pre-parser defaults are injected if the LLM missed them
5. **Foreclosure flag enforcement:** If the pre-parser found a Notice of Trustee Sale, `foreclosure_detected` is forced to `true`

This is not an LLM call — it's pure code running deterministic merges and overrides.

### Step 5: LLM Call #2 — Plain-English Summary

**Files:** `lib/tessa/tessa-prompts.ts` + `lib/tessa/tessa-api.ts`

Takes the validated JSON extraction and generates a human-readable summary:
- **System prompt:** "You are a title industry expert writing a plain-English summary... Be concise. Lead with what matters most for closing."
- **User prompt:** Asks for: (1) "TOP CLOSING RISKS" — numbered list with risk + why it delays closing, max 5 items; (2) 2–3 sentence narrative of overall title condition

**LLM configuration:**
- `max_tokens: 1200`
- `temperature: 0.1` (very slight creativity for natural prose)
- `request_type: 'prelim_summarize'`
- `response_format: 'markdown'`

### Step 6: Cheat Sheet (Deterministic)

**File:** `lib/tessa/tessa-cheat-sheet.ts`

Builds agent-friendly cheat sheet items from the pre-parser facts. For each grouped requirement type, produces:
- **Item numbers** from the prelim
- **Label** (e.g., "Complete Statement of Information for named parties")
- **Severity** (blocker/material/informational)
- **Why it matters** — plain English explanation for the agent
- **Who handles it** — Seller, Escrow, Title, Agent, etc.
- **Timing** — estimated turnaround
- **Agent script** — what to say to the client

---

## 5. AI Prompts & LLM Configuration

### Proxy Architecture

All LLM calls go to `https://tessa-proxy.onrender.com/api/ask-tessa`. This proxy wraps Anthropic Claude in an OpenAI-compatible response format (`{ choices: [{ message: { content } }] }`).

### Extraction Prompt (Step 3)

**System prompt** (`EXTRACTION_SYSTEM_PROMPT`):
```
You are a title document analysis engine.
You extract structured data from Preliminary Title Reports.
You MUST respond with valid JSON only — no markdown, no backticks, no preamble.
Never invent data. If a value is not stated in the document, use null.
Use exact dollar amounts with $ and commas. Never round.
```

**User prompt** (`buildExtractionPrompt`): Contains the full JSON schema as an example, the pre-parser facts as "GROUND TRUTH", and the document text (50K chars max).

### Summary Prompt (Step 5)

**System prompt** (`SUMMARY_SYSTEM_PROMPT`):
```
You are a title industry expert writing a plain-English summary of a preliminary
title report analysis. Write for a real estate professional.
Be concise. Lead with what matters most for closing.
```

**User prompt** (`buildSummaryPrompt`): Asks for TOP CLOSING RISKS (numbered, max 5) and a 2–3 sentence narrative. Receives the full extracted JSON as input.

### Key Prompt Rules

- **STRICT MONEY RULE:** Exact dollar amounts with `$` and commas. Never round.
- **TRUST + FACTS RULE:** When `facts_json` is provided, it is ground truth. Never contradict.
- **CLOSING-FIRST MINDSET:** Think like a closer — what blocks funding/recording, who owns the next step.
- **TAX RATES:** Never provide tax rates. Redirect to pct.com/calculator.

---

## 6. Data Types & Structures

**File:** `lib/tessa/tessa-types.ts` (397 lines)

### PrelimFacts (Pre-Parser Output)

The deterministic ground truth object. Key sub-structures:

- `PropertyInfo` — address, APN, effective date, state, property type
- `TaxFacts` — property taxes (with installment statuses/amounts), tax defaults (with redemption schedules), other assessments, delinquent totals
- `Requirement[]` — each with item number, text, classification (summary, type, severity)
- `DeedOfTrust[]` — position, amount, parties, recording info, assignments, substitutions, foreclosure info, fractional interests
- `OwnershipStructure` — vesting type, trust/TIC/corporate/LLC detection, spousal joinder
- `SpecialFlags` — 18 boolean flags for solar, UCC, trust, easement estate, foreclosure, HOA, tax default, out-of-state, TIC, multiple DOTs, fractional beneficiaries, assignment of rents, easements, CC&Rs, recent conveyance
- `ForeclosureFlag[]` — Notice of Trustee Sale with sale date/time/location

### ExtractedAnalysis (LLM Output)

The JSON structure returned by the extraction LLM call:

- `title_requirements[]` — item number, description, action, severity, type, related instrument, assignee
- `property_info` — APN, address, legal description, vesting, property type, ownership structure
- `liens[]` — position, type, amount, beneficiary, trustor, recording ref/date, assigned to, action required
- `taxes[]` — tax ID, fiscal year, first/second installment (amount + status), exemption, code area, penalties
- `tax_defaults[]` — tax ID, default year, amount, redemption info
- `other_findings[]` — item number, type, description, impact, action, recording ref
- `document_status` — appears complete, document date, order number, missing sections, notes
- `schedule_a_subjects[]` — item numbers from Schedule A subject-to clause
- `foreclosure_detected` / `recent_conveyance_detected` — boolean flags

### RequirementType (Classification Taxonomy)

Each requirement is classified into one of these types:

| Type | Example |
|---|---|
| `reconveyance_confirmation` | Prove an old loan was released |
| `reconveyance_package` | Provide original note/DOT for reconveyance |
| `statement_of_information` | Complete SOI for named parties |
| `statement_of_information_hits` | SOI with name-search hits found |
| `spousal_joinder` | Spouse must join in conveyance |
| `corp_authority` | Corporation authority package |
| `llc_authority` | LLC authority/articles required |
| `trust_docs` | Trust certification per Prob. Code §18100.5 |
| `suspended_corp_cure` | Suspended corporation must be revived |
| `hoa_clearance` | HOA clearance letter required |
| `multi_beneficiary_demand` | Payoff demands from all beneficiaries |
| `survey_inspection` | ALTA/ACSM survey or inspection required |
| `underwriting_review` | Internal underwriting approval needed |
| `unrecorded_docs_review` | Provide unrecorded leases/agreements |
| `unspecified` | Other company-stated requirement |

### RequirementSeverity

| Severity | Meaning |
|---|---|
| `blocker` | Cannot close without resolving |
| `material` | Significant impact on closing |
| `informational` | Good to know, low risk |

---

## 7. Guardrails & Validation

The guardrails system (`lib/tessa/tessa-guardrails.ts`, 643 lines) has two generations:

### Current (JSON Pipeline) — `validateAndRepairExtraction()`

Used by `usePrelimAnalysis`. Runs deterministic merges on the extracted JSON:

1. **Requirements:** Loops through pre-parser requirements. If not found in LLM output (by text match or item number), injects it with proper severity and type.
2. **Deeds of Trust:** Loops through pre-parser DOTs. If not found in LLM liens (by recording number or amount+beneficiary match), injects it.
3. **Taxes:** Completely replaces LLM tax data with pre-parser ground truth (installment amounts, statuses, penalties, exemptions).
4. **Tax Defaults:** Replaces LLM tax defaults with pre-parser data.
5. **Foreclosure:** Forces `foreclosure_detected = true` if pre-parser found Notice of Trustee Sale.

### Legacy (Markdown Pipeline) — Not Currently Used

These functions exist but are NOT invoked by the current pipeline:

- `validatePrelimOutput()` — checks markdown output for 18+ categories of missing data
- `buildRepairPrompt()` — generates a prompt asking the LLM to fill in missing sections
- `callTessaRepair()` — makes a third LLM call to repair missing data
- `runGuardrailsStep1/2()` — full markdown injection pipeline (requirements, taxes, liens, property info, summary)
- `stitchRepairSections()` — merges repaired sections back into the original output
- `renderTaxesMarkdown()` — renders taxes as markdown (used by legacy flow)
- `renderCompanyRequirementsMarkdown()` — renders requirements as markdown
- Various `inject*Guardrails()` functions for each section

These represent the v3.3.0 architecture where the LLM returned markdown and guardrails post-processed the text. The current pipeline uses JSON extraction + deterministic repair instead.

---

## 8. Results UI

### TessaPrelimModal (`components/tessa/TessaPrelimModal.tsx`)

Full-screen modal with three states:

1. **Processing:** Progress bar (0–100%) with shimmer animation, 5-step indicator showing current pipeline stage, skeleton placeholder cards
2. **Error:** Error message with "Close & Try Again" button
3. **Complete:** Scrollable results via `TessaPrelimResults`

### TessaPrelimResults (`components/tessa/TessaPrelimResults.tsx`)

Renders results in collapsible section cards. Order:

1. **Complexity Score** — `TessaComplexityScore` (gauge SVG, 0–100, color-coded)
2. **Summary** — `TessaSummaryContent` (top closing risks + narrative, always open by default)
3. **Property Information** — `TessaPropertyContent`
4. **Title Requirements** — `TessaRequirementsContent` (with item count badge)
5. **Liens & Judgments** — `TessaLiensContent` (with count or "Clear" badge)
6. **Taxes & Assessments** — `TessaTaxContent` (with parcel count badge)
7. **Other Findings** — `TessaOtherFindingsContent` (with item count badge)
8. **Document Status** — `TessaDocStatusContent`
9. **CTA buttons:** "Talk to a Title Officer" + "Analyze Another Prelim"
10. **Disclaimer:** AI-generated analysis notice

### Complexity Score (`components/tessa/TessaComplexityScore.tsx`)

Calculates a 0–100 complexity score based on:

| Factor | Points |
|---|---|
| 1+ liens | +10 |
| 3+ liens | +10 |
| HOA lien | +5 |
| Judgment lien | +15 |
| Delinquent tax parcels | +20 |
| 5+ requirements | +10 |
| 10+ requirements | +10 |
| Blocking requirements | +15 |
| 3+ other findings | +10 |
| High-impact findings | +10 |
| Missing document sections | +8 |
| Foreclosure detected | +20 |
| Recent conveyance | +5 |
| 8+ exceptions (from facts) | +5 |
| 15+ exceptions | +5 |

Score ranges: **Low** (0–25, green), **Moderate** (26–50, yellow), **High** (51–75, orange), **Very High** (76–100, red)

Displayed as an SVG arc gauge with color-coded reasons listed as pill badges.

---

## 9. Authentication

**Files:** `lib/tessa-auth.ts`, `app/api/tessa/verify/route.ts`, `app/api/tessa/status/route.ts`, `contexts/TessaContext.tsx`

All Tessa interactions (including prelim analysis) require authentication when `TESSA_ACCESS_CODE` is set:

1. User triggers any Tessa action → `requireAuth()` checks if authenticated
2. If not, a branded password dialog appears (PCT dark blue header, orange submit button)
3. Password is verified server-side via `POST /api/tessa/verify`
4. On success, an HttpOnly/Secure/SameSite cookie (`tessa_session`) is set
5. Cookie value is a SHA-256 HMAC tied to the access code — changes if the code changes
6. Session lasts until the browser is closed
7. All API routes (`/api/tessa`, `/api/tessa/analyze`) also validate the cookie server-side

If `TESSA_ACCESS_CODE` is not set, authentication is bypassed entirely.

---

## 10. File Map

### Core Pipeline

| File | Lines | Role |
|---|---|---|
| `hooks/usePrelimAnalysis.ts` | 230 | Orchestrator — coordinates all 6 pipeline steps |
| `lib/tessa/tessa-pdf.ts` | 59 | PDF text extraction via PDF.js v3.11.174 |
| `lib/tessa/tessa-pre-parser.ts` | 727 | Deterministic fact extraction (regex/heuristics) |
| `lib/tessa/tessa-prompts.ts` | 378 | All LLM prompts (extraction, summary, legacy) |
| `lib/tessa/tessa-api.ts` | 120 | Proxy client (callTessaExtract, callTessaSummarize) |
| `lib/tessa/tessa-guardrails.ts` | 643 | Validation + repair (JSON + legacy markdown) |
| `lib/tessa/tessa-types.ts` | 397 | All TypeScript interfaces and types |
| `lib/tessa/tessa-cheat-sheet.ts` | 153 | Agent cheat sheet builder |

### UI Components

| File | Role |
|---|---|
| `components/hero-simple.tsx` | Homepage hero with "Analyze a Prelim" tab |
| `components/tessa/TessaPrelimModal.tsx` | Full-screen analysis modal |
| `components/tessa/TessaPrelimResults.tsx` | Results layout with collapsible sections |
| `components/tessa/TessaComplexityScore.tsx` | 0–100 complexity gauge |
| `components/tessa/TessaSectionCard.tsx` | Collapsible section card wrapper |
| `components/tessa/TessaSeverityBadge.tsx` | Blocker/Material/Informational badge |
| `components/tessa/content/TessaSummaryContent.tsx` | Summary section renderer |
| `components/tessa/content/TessaPropertyContent.tsx` | Property info renderer |
| `components/tessa/content/TessaRequirementsContent.tsx` | Requirements renderer |
| `components/tessa/content/TessaLiensContent.tsx` | Liens renderer |
| `components/tessa/content/TessaTaxContent.tsx` | Tax renderer |
| `components/tessa/content/TessaOtherFindingsContent.tsx` | Other findings renderer |
| `components/tessa/content/TessaDocStatusContent.tsx` | Document status renderer |
| `components/tessa/content/TessaShared.tsx` | Shared content utilities |

### Auth & API

| File | Role |
|---|---|
| `lib/tessa-auth.ts` | Server-side auth helpers (cookie signing/validation) |
| `app/api/tessa/route.ts` | Chat API route (cookie-protected) |
| `app/api/tessa/verify/route.ts` | Password verification endpoint |
| `app/api/tessa/status/route.ts` | Auth status check endpoint |
| `app/api/tessa/analyze/route.ts` | PDF analysis stub (not used by main pipeline) |
| `contexts/TessaContext.tsx` | Client context (auth state, chat, password gate UI) |

### Not Used (Legacy/Unused)

| File | Status |
|---|---|
| `lib/tessa/tessa-section-parser.ts` | Markdown section splitter — not used by JSON pipeline |
| `components/tessa/TessaCheatSheet.tsx` | Built but never rendered in results |
| `components/tessa/TessaAgentToggle.tsx` | UI-only toggle, not wired to anything |
| `components/tessa/TessaPrelimUploader.tsx` | Standalone uploader for a separate page |
| `app/tessa/prelim-review/page.tsx` | Standalone analysis page — out of sync with current hook |

---

## 11. Legacy vs. Current Architecture

### v3.3.0 Legacy (Markdown Pipeline)

```
PDF → pre-parser → single LLM call (markdown output) →
  guardrails inject/replace sections → validate → LLM repair call →
  guardrails re-inject → final markdown → section parser → render
```

- LLM returned markdown with `**SECTION HEADERS**`
- Guardrails replaced entire sections with deterministic markdown
- Validation checked for 18+ categories of missing data
- If validation failed, a repair LLM call filled in gaps
- `parsePrelimResponse()` split markdown into renderable sections

### Current (JSON Pipeline)

```
PDF → pre-parser → LLM Extract (JSON) →
  deterministic validate + repair → LLM Summarize (markdown) →
  cheat sheet builder → structured component render
```

- LLM returns structured JSON matching `ExtractedAnalysis`
- Guardrails merge/override at the data level (not string replacement)
- No repair LLM call needed — deterministic code handles all corrections
- Summary is a separate focused LLM call (top risks + narrative only)
- UI renders from typed data objects, not parsed markdown

### Why the change?

1. **Reliability:** JSON extraction is far more predictable than markdown formatting
2. **Accuracy:** Tax data and requirements are always ground truth (pre-parser wins)
3. **Speed:** Eliminated the repair LLM call (one less round trip)
4. **Maintainability:** Typed data structures vs. regex-based section parsing
5. **UI quality:** Rich, interactive components instead of rendered markdown blocks
