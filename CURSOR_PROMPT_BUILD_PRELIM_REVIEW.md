# Cursor Prompt: Build TESSA Prelim Review Page + Port Legacy Engine

## Context

TESSA is PCT's AI assistant for analyzing Preliminary Title Reports. The core analysis engine currently exists as a legacy jQuery script (`tessa/tessa-enhanced-script-3.3.0-guardrails.js`) running on the old site. We need to port this into the Next.js app and build a dedicated prelim review page.

The proxy at `tessa-proxy.onrender.com` has already been switched from OpenAI to Anthropic Claude. The proxy wraps the response in OpenAI's format, so the frontend still reads `data.choices[0].message.content`.

The existing Next.js app has:
- `contexts/TessaContext.tsx` — chat state, sendMessage, analyzePdf
- `components/tessa/TessaChatWidget.tsx` — floating chat button + panel
- Several older/alternate tessa components (tessa-chat.tsx, tessa-modal.tsx, etc.)

## What to Build

### 1. Create the file structure

```
lib/
├── tessa/
│   ├── tessa-api.ts              # API abstraction (calls proxy, parses response)
│   ├── tessa-pdf.ts              # PDF.js text extraction (client-side)
│   ├── tessa-prompts.ts          # System prompts (chat, prelim analysis, agent mode)
│   ├── tessa-pre-parser.ts       # Pre-parser: extracts structured facts from raw PDF text
│   ├── tessa-guardrails.ts       # Post-processing: validates + injects deterministic data
│   ├── tessa-section-parser.ts   # Parses AI markdown response into 7 structured sections
│   ├── tessa-cheat-sheet.ts      # Realtor cheat sheet builder
│   └── tessa-types.ts            # TypeScript interfaces for all data structures

components/tessa/
├── TessaChatWidget.tsx           # (existing — keep as-is for now)
├── TessaPrelimUploader.tsx       # Drag-and-drop PDF upload component
├── TessaPrelimResults.tsx        # The 7-section collapsible card layout
├── TessaSectionCard.tsx          # Individual collapsible section card
├── TessaSeverityBadge.tsx        # Blocker / Material / Informational badges
├── TessaRequirementItem.tsx      # Single requirement with severity + cheat sheet
├── TessaTaxBlock.tsx             # Structured tax display per Tax ID
├── TessaLienCard.tsx             # Individual lien sub-card
├── TessaCheatSheet.tsx           # Realtor cheat sheet section
└── TessaAgentToggle.tsx          # "Simplify for Agents" toggle

hooks/
├── usePrelimAnalysis.ts          # Hook for the full upload → parse → analyze → validate flow
└── useTransferTax.ts             # (existing if present)

app/tessa/prelim-review/
└── page.tsx                      # The dedicated prelim review page
```

### 2. Port the Pre-Parser (`lib/tessa/tessa-pre-parser.ts`)

This is the most critical piece. The legacy script has a `computeFacts()` function that extracts structured data from raw PDF text BEFORE sending to the AI. This data becomes "ground truth" that the AI cannot contradict.

Port these functions from the legacy JS file to TypeScript:

- `normalizeBullets(str)` — fixes PDF line break issues
- `splitNumberedItems(sectionText)` — splits numbered items from the prelim
- `extractBetweenInclusive(text, startPattern, endPattern)` — extracts text between patterns
- `parseTaxesFromItems(items)` — extracts property taxes, tax defaults, other assessments
- `parseRequirements(items, criticalText)` — extracts company-stated requirements
- `classifyRequirement(text)` — classifies each requirement (type + severity: blocker/material/informational)
- `parseDeedsOfTrust(items, fullText)` — extracts all deeds of trust with amounts, parties, recording refs
- `parseHOALiens(items)` — extracts HOA assessment liens
- `parseAssignmentOfRents(items)` — extracts assignment of rents
- `parseEasements(items, fullText)` — extracts easements and rights of way
- `parseCCRs(items)` — extracts CC&Rs and covenants
- `parseOwnershipStructure(fullText)` — detects trust/TIC/LLC/corporate ownership
- `parseRecentConveyances(fullText)` — detects recent conveyances (seasoning concerns)
- `parseForeclosureFlags(items)` — detects active foreclosure/trustee sale notices
- `detectPropertyState(fullText)` — detects CA/AZ/NV etc.
- `detectPropertyType(fullText)` — detects SFR/condo/commercial etc.
- `findScheduleASubjects(fullText)` — finds "SUBJECT TO ITEM NOS." references
- `computeFacts(fullText)` — the master function that calls all the above and returns a structured `PrelimFacts` object

The `computeFacts()` return type should be a TypeScript interface `PrelimFacts` containing all extracted data.

### 3. Port the Guardrails System (`lib/tessa/tessa-guardrails.ts`)

After the AI returns its response, the guardrails system:
1. **Injects deterministic data** — requirements and taxes are replaced with pre-parser data (AI can't omit or change them)
2. **Validates** the AI output against extracted facts (checks each section for missing items)
3. **Sends a repair prompt** if validation fails (one retry only)
4. **Re-injects deterministic data** after repair (final authority)

Port these functions:
- `renderTaxesMarkdown(facts)` — renders deterministic tax block
- `renderCompanyRequirementsMarkdown(facts)` — renders deterministic requirements
- `injectDeterministicRequirements(response, facts)` — injects into TITLE REQUIREMENTS section
- `injectPropertyInfoGuardrails(response, facts)` — adds missing property info (TIC, out-of-state, etc.)
- `injectLiensGuardrails(response, facts)` — ensures all DOTs and HOA liens appear
- `injectSummaryGuardrails(response, facts)` — adds missing summary notes (foreclosure, delinquent taxes, etc.)
- `injectOtherFindingsGuardrails(response, facts)` — placeholder (returns unchanged for now)
- `validatePrelimOutput(facts, outputText)` — validates ALL sections against facts
- `validateRequirementsInTitleSection(facts, fullOut)` — scoped validation within Title Requirements only
- `buildRepairPrompt(facts, missing)` — builds the one-shot repair prompt
- `getSectionBlock(text, header)` — extracts a section by header
- `replaceSectionBlock(original, header, newBlock)` — replaces a section by header

### 4. Port the Analysis Prompt (`lib/tessa/tessa-prompts.ts`)

The legacy file contains the full analysis prompt inside `analyzePdfWithTessa()`. Extract it into a function:

```typescript
export function buildPrelimAnalysisPrompt(
  fileName: string,
  pdfTextExcerpt: string,
  factsJson: string,
  propertyTaxesJson: string,
  taxDefaultsJson: string
): string
```

This prompt is ~3,500 words and extremely specific about output format. Copy it exactly from the legacy `analyzePdfWithTessa` function. It includes:
- The 7-section output format with exact field names
- NON-NEGOTIABLE rules (tax defaults, separation of requirements vs clearing items, dedup rule)
- SCOPE RULE, ACTION LIST RULE, FORECLOSURE enforcement
- GROUND TRUTH injection points for facts_json

Also extract:
- `SYSTEM_PROMPT` — the chat system prompt (already in TessaContext.tsx)
- `AGENT_MODE_PROMPT` — for the "Simplify for Agents" toggle reprompt

### 5. Port the Section Parser (`lib/tessa/tessa-section-parser.ts`)

The legacy `appendEnhancedAnalysis()` function parses the AI's markdown response into 7 sections using regex. Create a clean parser:

```typescript
interface ParsedSection {
  title: string
  content: string
  icon: string
  colorClass: string
  itemCount: number
  preview: string
}

export function parsePrelimResponse(response: string): ParsedSection[]
```

This splits on `**SECTION HEADER**` patterns and extracts each section's content.

### 6. Port the Cheat Sheet (`lib/tessa/tessa-cheat-sheet.ts`)

The legacy has `buildRealtorCheatSheet(facts)` and `buildRealtorCheatSheetContent(facts)` plus `agentExplanationByType(type)`. Port these to return structured data instead of HTML strings:

```typescript
interface CheatSheetItem {
  itemNumbers: number[]
  label: string
  severity: 'blocker' | 'material' | 'informational'
  whyItMatters: string
  who: string
  timing: string
  agentScript: string
}

export function buildCheatSheetItems(facts: PrelimFacts): CheatSheetItem[]
export function getAgentExplanation(type: string): string
```

### 7. Build the PDF Extraction (`lib/tessa/tessa-pdf.ts`)

Port the PDF.js extraction from the legacy `processPdfFile()`. Key points:
- Use `pdfjs-dist` npm package (not CDN)
- Set worker source correctly for Next.js: `pdfjsLib.GlobalWorkerOptions.workerSrc`
- Preserve EOL handling: check `item.hasEOL` for line breaks
- Apply bullet normalization heuristic: `pageText.replace(/(\s{2,})(\d{1,3})\.\s/g, '\n$2. ')`
- Truncate to 50,000 chars max
- Return extracted text as a string

```typescript
export async function extractPdfText(file: File): Promise<string>
```

Important: This runs client-side only. Use dynamic import or 'use client' directive.

### 8. Build the Analysis Hook (`hooks/usePrelimAnalysis.ts`)

This orchestrates the full flow:

```typescript
export function usePrelimAnalysis() {
  // States
  const [status, setStatus] = useState<'idle' | 'extracting' | 'analyzing' | 'validating' | 'complete' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<ParsedSection[] | null>(null)
  const [facts, setFacts] = useState<PrelimFacts | null>(null)
  const [rawResponse, setRawResponse] = useState<string>('')

  async function analyzePrelim(file: File) {
    // 1. Extract PDF text (client-side)
    setStatus('extracting')
    const pdfText = await extractPdfText(file)

    // 2. Run pre-parser to compute facts (client-side)
    const facts = computeFacts(pdfText)
    setFacts(facts)

    // 3. Build prompt with facts_json injection
    const prompt = buildPrelimAnalysisPrompt(file.name, pdfText, facts)

    // 4. Send to proxy API
    setStatus('analyzing')
    let response = await sendToTessaApi(prompt)

    // 5. Run guardrails: inject deterministic data, validate, repair if needed
    setStatus('validating')
    response = runGuardrails(response, facts)

    // 6. Parse into sections
    const sections = parsePrelimResponse(response)
    setResults(sections)
    setRawResponse(response)
    setStatus('complete')
  }

  return { analyzePrelim, status, progress, results, facts, rawResponse }
}
```

### 9. Build the Prelim Review Page (`app/tessa/prelim-review/page.tsx`)

A focused, single-purpose page. NOT a chat interface.

Layout:
```
┌─────────────────────────────────────────────────────────────┐
│   TESSA™ Prelim Review                                      │
│   Upload a Preliminary Title Report for instant analysis    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   [Drag-and-drop upload zone]                               │
│   Accepts .pdf — up to 10MB                                 │
│                                                             │
│   [ Analyze with TESSA ]                                    │
│                                                             │
│   [Agent Toggle: "Simplify for Agents"]                     │
│                                                             │
│   ── RESULTS (collapsible cards) ────────────────────────── │
│                                                             │
│   ▾ TITLE REQUIREMENTS (expanded by default)                │
│   ▸ SUMMARY                                                 │
│   ▸ PROPERTY INFORMATION                                    │
│   ▸ LIENS AND JUDGMENTS                                     │
│   ▸ TAXES AND ASSESSMENTS                                   │
│   ▸ OTHER FINDINGS                                          │
│   ▸ DOCUMENT STATUS                                         │
│   ▸ REALTOR CHEAT SHEET (if agent mode)                     │
│                                                             │
│   [ Analyze New File ]                                      │
│                                                             │
│   ────────────────────────────────────────────────────────  │
│   📞 Questions? Call PCT: (714) 516-6700                    │
│   Or speak with an escrow officer: pct.com/contact          │
│                                                             │
│   ⚠️ Disclaimer: AI-generated summary for informational     │
│   purposes only. Read the full prelim report. Contact your  │
│   title officer for guidance.                               │
└─────────────────────────────────────────────────────────────┘
```

### 10. Build the Section Card Components

Each section renders as a collapsible card with:
- Color-coded left border (green=requirements, red=liens, amber=taxes, etc.)
- Icon + title + item count badge
- Preview text when collapsed
- Expand/collapse animation

Section color scheme (from legacy CSS):
- TITLE REQUIREMENTS: Green (#059669)
- SUMMARY: Blue (#2563eb)
- PROPERTY INFORMATION: Purple (#7c3aed)
- LIENS AND JUDGMENTS: Red (#dc2626)
- TAXES AND ASSESSMENTS: Amber (#d97706)
- OTHER FINDINGS: Gray (#6b7280)
- DOCUMENT STATUS: Teal (#0891b2)
- REALTOR CHEAT SHEET: Amber/Gold (#f59e0b)

### 11. Severity Badge Component

```tsx
// Three states:
// 🔴 Blocker — red bg, stops closing
// 🟡 Material — amber bg, significant but manageable
// 🔵 Informational — blue bg, FYI only
```

### 12. Tax Block Component

For the TAXES AND ASSESSMENTS section, render structured tax data per Tax ID:
- Parcel header with number
- Structured rows for each field (fiscal year, installments, penalties, exemption, code area)
- Visual dividers between parcels
- Tax default section with redemption schedules highlighted in red
- Delinquent amounts called out prominently

## API Details

**Proxy endpoint:** `POST https://tessa-proxy.onrender.com/api/ask-tessa`

**Request:**
```json
{
  "messages": [
    { "role": "system", "content": "system prompt here" },
    { "role": "user", "content": "analysis prompt with PDF text" }
  ],
  "max_tokens": 2400,
  "temperature": 0.25
}
```

**Response (proxy wraps Anthropic in OpenAI format):**
```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "The AI's markdown response"
    }
  }]
}
```

For repair calls, use `max_tokens: 900` and `temperature: 0.1`.

## Key Behavioral Rules

1. **PDF never leaves the browser** for storage. Text is extracted client-side via PDF.js, sent to the AI API for analysis, and that's it. Privacy-safe by design.

2. **Pre-parser facts are ground truth.** The AI's response is post-processed to inject deterministic requirements and taxes. The AI cannot omit or change these.

3. **Closing-first mindset.** Title Requirements section is always first and expanded by default. It leads with what blocks funding.

4. **No invented data.** If a figure isn't in the document, display "Not stated" — never guess.

5. **Exact dollar amounts.** Always use `$` with commas. No rounding.

## Dependencies

```bash
npm install pdfjs-dist
```

For PDF.js worker in Next.js, you may need to configure the worker path. Common approach:
```typescript
import * as pdfjsLib from 'pdfjs-dist'
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
```

## Styling Notes

- Use Tailwind CSS classes matching PCT's design system
- The section cards should feel professional and clean — not like a chat interface
- Use PCT's brand orange (#f26b2b) for primary CTAs
- The disclaimer should be visible but not overwhelming
- Mobile responsive — cards should stack cleanly on small screens

## What NOT to Change

- The existing TessaChatWidget.tsx continues to work as the floating chat
- The proxy server is already updated (Anthropic Claude) — don't touch it
- Transfer tax lookup endpoint (`/data.json`) is unchanged
- The TessaContext.tsx can stay for the chat widget; the prelim page uses its own hook

## Priority Order

1. Set up `lib/tessa/` files — types, pre-parser, guardrails, prompts
2. Build `tessa-pdf.ts` — get PDF extraction working in Next.js
3. Build `usePrelimAnalysis.ts` hook — the full orchestration
4. Build the page and components — UI last, after the engine works
5. Test with real prelim PDFs
