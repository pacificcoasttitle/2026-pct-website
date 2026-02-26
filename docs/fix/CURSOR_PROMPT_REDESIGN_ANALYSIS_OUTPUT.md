# Cursor Prompt: Redesign TESSA Analysis Output Rendering

## Context

The TESSA prelim analysis modal and collapsible section cards look beautiful. But the actual content INSIDE the cards — the analysis output — looks like raw markdown dumped into a div. The structured data (requirements, liens, taxes, etc.) deserves proper component-level rendering, not just formatted text.

## The Problem

Right now, the AI returns markdown-ish text with `**SECTION HEADERS**` and bullet points. The section parser splits this into 7 sections, but the content within each card is rendered as formatted HTML strings — not as structured, designed components. This means:
- Requirements look like bullet-point lists instead of actionable cards
- Liens look like text paragraphs instead of structured data rows
- Taxes are hard to scan — installments, penalties, and statuses blur together
- Severity indicators (Blocker/Material/Informational) are just text labels, not visual signals
- Dollar amounts don't stand out
- Item numbers are plain text

## What to Build

Redesign the rendering INSIDE each section card. Each section type gets its own specialized renderer component. The section card wrapper (collapse/expand, header, icon) stays the same — only the inner content changes.

### 1. TITLE REQUIREMENTS — `TessaRequirementsContent.tsx`

This is the most important section. Each requirement should be its own mini-card:

```
┌─────────────────────────────────────────────────────────┐
│  🔴 BLOCKER                                    Item #1  │
│  ──────────────────────────────────────────────────────  │
│  Statement of Information — All Parties                  │
│                                                          │
│  Complete SOI to clear name-index hits. Title needs      │
│  this to eliminate false matches.                        │
│                                                          │
│  Next step: Seller completes; Escrow collects            │
│  Owner: Escrow / Seller           Impact: Blocker        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  🟡 MATERIAL                                   Item #6  │
│  ──────────────────────────────────────────────────────  │
│  Affidavit required — Uninsured Deed                     │
│                                                          │
│  Company will not insure without affidavit from Isaac     │
│  Nunez-Imperial certifying no defects between effective   │
│  date and recording.                                     │
│                                                          │
│  Next step: Obtain signed affidavit                      │
│  Owner: Escrow / Seller           Impact: Material       │
└─────────────────────────────────────────────────────────┘
```

Design details:
- Each requirement is a card with a left border color matching severity (red=Blocker, amber=Material, blue=Info)
- Severity badge in top-left (use TessaSeverityBadge component), item number top-right
- Requirement title/summary in bold
- Detail text in normal weight, muted color
- "Next step" and "Owner" as subtle key-value pairs at the bottom
- If there's an ACTION LIST at the top, render it as a numbered checklist with checkboxes (visual only, not interactive)

### 2. SUMMARY — `TessaSummaryContent.tsx`

The summary has two parts: TOP CLOSING RISKS and the narrative summary.

```
┌─────────────────────────────────────────────────────────┐
│  ⚡ TOP CLOSING RISKS                                    │
│                                                          │
│  1. 🔴 Uninsured deed requires affidavit — blocks       │
│     insuring until resolved                              │
│                                                          │
│  2. 🟡 Two existing DOTs need payoff demands —           │
│     $266,000 (Countrywide) + $17,200 (Prominent)        │
│                                                          │
│  3. 🟡 Solar panel UCC filing (Sunnova) — confirm       │
│     lease/PPA terms and impact on title                  │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  This is a refinance of a single-family residence at     │
│  4657 Merced Avenue, Baldwin Park. Title is vested in    │
│  Gabriel Nieto and Isaac Nunez as joint tenants...       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

Design details:
- Closing risks as numbered items with colored dots matching severity
- Narrative paragraph below a subtle divider
- Dollar amounts highlighted with a distinct color (green or bold)
- Clean, readable typography

### 3. PROPERTY INFORMATION — `TessaPropertyContent.tsx`

Structured key-value pairs in a clean two-column layout:

```
┌─────────────────────────────────────────────────────────┐
│  Property Address    4657 Merced Avenue, Baldwin Park,   │
│                      CA 91706                            │
│  ─────────────────────────────────────────────────────── │
│  APN                 8542-006-077                        │
│  ─────────────────────────────────────────────────────── │
│  Effective Date      February 6, 2026 at 8:00am         │
│  ─────────────────────────────────────────────────────── │
│  Current Vesting     Gabriel Nieto, a married man and    │
│                      Isaac Nunez, a single man as        │
│                      joint tenants                       │
│  ─────────────────────────────────────────────────────── │
│  Estate Type         Fee Simple                          │
│  ─────────────────────────────────────────────────────── │
│  Proposed Loan       $385,000.00                         │
│  ─────────────────────────────────────────────────────── │
│  Title Order No.     20014370-GLT                        │
└─────────────────────────────────────────────────────────┘
```

Design details:
- Label on left in muted/small text, value on right in normal weight
- Subtle horizontal dividers between rows
- Dollar amounts in green/bold
- APN as a monospace-style font

### 4. LIENS AND JUDGMENTS — `TessaLiensContent.tsx`

Each lien as its own structured card:

```
┌─────────────────────────────────────────────────────────┐
│  1st Position                              Item #7      │
│  DEED OF TRUST                                          │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│  Amount          $266,000.00                             │
│  Beneficiary     U.S. Bank Trust, N.A. (assigned)       │
│  Original        Countrywide Home Loans via MERS         │
│  Trustor         Gabriel Nieto                           │
│  Recording       2006-961091 (May 2, 2006)               │
│                                                          │
│  📋 Substitution of Trustee: The Mortgage Law Firm, PLC  │
│     Recording: 20171302924 (Nov 14, 2017)                │
│                                                          │
│  📋 Assignment to: U.S. Bank Trust, N.A.                 │
│     Recording: 20181257799 (Dec 12, 2018)                │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Action: Obtain payoff demand and reconveyance     │  │
│  │  Status: Open                                      │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  2nd Position                              Item #9      │
│  DEED OF TRUST                                          │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│  Amount          $17,200.00                              │
│  Beneficiary     Thieu V. Nguyen and Hoa Thi Nguyen     │
│  Original        Prominent Investment Solutions           │
│  Trustor         Gabriel Nieto                           │
│  Recording       20080577328 (Apr 3, 2008)               │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Action: Obtain payoff demand and reconveyance     │  │
│  │  Status: Open                                      │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

Design details:
- Each lien is its own card with a subtle border
- Position badge (1st, 2nd) in top-left, item number top-right
- Type label (DEED OF TRUST, JUDGMENT, etc.) as a bold header
- Key-value pairs for structured data
- Dollar amounts large and bold with $ formatting
- Assignment/substitution history as indented sub-items with a timeline feel
- Action box at bottom with distinct background color (light orange or light blue)

### 5. TAXES AND ASSESSMENTS — `TessaTaxContent.tsx`

Per-parcel display with clear status indicators:

```
┌─────────────────────────────────────────────────────────┐
│  📍 TAX ID: 8542-006-077                                │
│  Fiscal Year: 2025-2026                                 │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│  1st Installment   $2,129.89         ✅ PAID            │
│  Penalty           $0.00                                 │
│  ──────────────────────────────────────────────────────  │
│  2nd Installment   $2,129.89         ⏳ OPEN            │
│  Penalty           Not stated                            │
│  ──────────────────────────────────────────────────────  │
│                                                          │
│  Land Value        $158,904.00                           │
│  Improvements      $123,815.00                           │
│  Exemption         $0.00                                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

Design details:
- Each Tax ID gets its own card/section
- Installment rows with amount on left, status badge on right
- Status badges: ✅ PAID (green), ⏳ OPEN (amber), 🔴 DELINQUENT (red)
- Dollar amounts right-aligned and bold
- If there are tax defaults/redemptions, show them in a red-bordered alert box
- Values section (land, improvements) in a subtle footer area

### 6. OTHER FINDINGS — `TessaOtherFindingsContent.tsx`

Each finding as a categorized row:

```
┌─────────────────────────────────────────────────────────┐
│  ⚡ UCC FILING                               Item #10   │
│  Sunnova TE Management II LLC — Solar panel financing    │
│  Recording: 20230294669 (May 5, 2023)                    │
│  Impact: Medium   Action: Confirm lease/PPA terms        │
├─────────────────────────────────────────────────────────┤
│  ☀️ SOLAR NOTICE                              Item #11   │
│  Independent Solar Energy System Producer Contract        │
│  Recording: 20230295116 (May 5, 2023)                    │
│  Impact: Medium   Action: Review contract terms           │
├─────────────────────────────────────────────────────────┤
│  🏛️ REDEVELOPMENT AREA                       Item #8    │
│  Irwindale Community Redevelopment Agency                 │
│  Recording: 20071677750 (Jul 16, 2007)                   │
│  Impact: Low      Action: Review for active assessments   │
└─────────────────────────────────────────────────────────┘
```

Design details:
- Each finding as a row with icon, type label, item number
- Brief description, recording reference
- Impact level as a colored dot (Low=green, Medium=amber, High=red)
- Action as a subtle directive

### 7. DOCUMENT STATUS — `TessaDocStatusContent.tsx`

Simple, clean info display:

```
┌─────────────────────────────────────────────────────────┐
│  Report Type       Preliminary Title Report (CLTA)       │
│  Effective Date    February 6, 2026 at 8:00am           │
│  Title Order       20014370-GLT                          │
│  Underwriter       Westcor Land Title Insurance Co.      │
│  Title Officer     Eddie LasMarias                       │
│  Status            Complete — no missing pages detected   │
└─────────────────────────────────────────────────────────┘
```

## Implementation Approach

**The key challenge:** The AI returns markdown text, not structured JSON. The section parser (`tessa-section-parser.ts`) currently splits the response into sections but preserves the raw text content. You need to either:

**Option A (Recommended): Parse the markdown into structured data per section.**
Create sub-parsers for each section that extract structured objects from the markdown text. For example, the liens parser would extract `{ position, type, amount, beneficiary, recording, ... }` from the bullet-point format. Then render using typed components.

**Option B: Use regex/patterns to enhance the rendering.**
Keep the text-based approach but use smart regex patterns to identify and wrap specific data types (dollar amounts, recording numbers, item numbers, status badges) in styled spans/components.

Option A produces cleaner results. The AI follows a strict output format (we enforce it in the prompt), so parsing is reliable.

## Styling Guidelines

- Use Tailwind CSS throughout
- Match PCT brand colors: orange (#f26b2b) for CTAs, dark blue (#0c2340) for headers
- Section card colors from legacy CSS:
  - Requirements: Green (#059669) 
  - Summary: Blue (#2563eb)
  - Property: Purple (#7c3aed)
  - Liens: Red (#dc2626)
  - Taxes: Amber (#d97706)
  - Other: Gray (#6b7280)
  - Status: Teal (#0891b2)
- Dollar amounts: Bold, slightly larger, green (#059669) or dark text
- "Not stated" values: Italic, muted gray
- Severity badges: Use existing TessaSeverityBadge component
- Recording references: Monospace-style font, muted
- Generous whitespace between items — don't cram data together
- On mobile: Stack key-value pairs vertically instead of side-by-side

## Files to Create/Update

```
components/tessa/
├── content/
│   ├── TessaRequirementsContent.tsx
│   ├── TessaSummaryContent.tsx
│   ├── TessaPropertyContent.tsx
│   ├── TessaLiensContent.tsx
│   ├── TessaTaxContent.tsx
│   ├── TessaOtherFindingsContent.tsx
│   └── TessaDocStatusContent.tsx
├── TessaSectionCard.tsx  (update to use section-specific renderers)
└── TessaPrelimResults.tsx (update if needed)

lib/tessa/
└── tessa-section-parser.ts (enhance to extract structured data per section)
```

## Test Case

Use this prelim to validate the output (4657 Merced Avenue, Baldwin Park):
- 2 DOTs: $266,000 (Countrywide → U.S. Bank Trust) and $17,200 (Prominent → Nguyen)
- Solar panel UCC + Notice (Sunnova)
- Redevelopment area (Irwindale)
- Uninsured deed requiring affidavit (Item #6)
- 2 SOI requirements
- Tax ID 8542-006-077, 1st installment PAID, 2nd OPEN
- Proposed loan: $385,000
- Vested in joint tenants (Gabriel Nieto + Isaac Nunez)
