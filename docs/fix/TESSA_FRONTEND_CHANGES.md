# TESSA Frontend/Engine Changes — Consistency Fix

## Repo: PCT Next.js App (Vercel)
## Files: lib/tessa/*, hooks/usePrelimAnalysis.ts, components/tessa/*

---

## Overview: What Changes and Why

The core problem is that one massive LLM call does everything — extraction, classification, 
summarization, and formatting — in a single pass. Every run, the model makes hundreds of 
micro-decisions differently. The fix is to split into focused steps where each call has 
a narrow job, and the factual extraction step returns structured JSON (not prose).

### The New Pipeline

```
CURRENT (one call):
  PDF text → [GIANT PROMPT: do everything] → markdown blob → regex parse → render

NEW (multi-step):
  PDF text → pre-parser (client, no LLM) → facts_json
                                              ↓
  Step 1: EXTRACT (LLM, temp=0, JSON output)
           → structured JSON of all findings
                                              ↓
  Step 2: SUMMARIZE (LLM, temp=0.1, markdown output)  
           → plain-English summary + risk assessment
                                              ↓
  Step 3 (optional): CHEAT SHEET (LLM, temp=0.2)
           → agent-friendly explanations
                                              ↓
  Guardrails: validate + inject deterministic data
                                              ↓
  Render structured components
```

---

## Phase 1: Immediate Fix (Do This First)

### File: `lib/tessa/tessa-api.ts`

Update `callTessaProxy` to pass `request_type` and `response_format` to the proxy:

```typescript
// lib/tessa/tessa-api.ts

interface TessaApiOptions {
  messages: Array<{ role: string; content: string }>;
  max_tokens?: number;
  temperature?: number;
  request_type?: 'prelim_extract' | 'prelim_summarize' | 'prelim_cheatsheet' | 'repair' | 'chat';
  response_format?: 'json' | 'markdown';
}

export async function callTessaProxy(options: TessaApiOptions): Promise<string> {
  const response = await fetch('https://tessa-proxy.onrender.com/api/ask-tessa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: options.messages,
      max_tokens: options.max_tokens,
      temperature: options.temperature,
      request_type: options.request_type || 'chat',
      response_format: options.response_format || 'markdown',
    }),
  });

  const data = await response.json();
  
  // Log metadata in development for debugging
  if (process.env.NODE_ENV === 'development' && data._meta) {
    console.log('[TESSA] API call metadata:', data._meta);
  }

  return data.choices?.[0]?.message?.content || '';
}

// Convenience wrappers for each pipeline step
export async function callTessaExtract(systemPrompt: string, userPrompt: string): Promise<string> {
  return callTessaProxy({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    request_type: 'prelim_extract',
    response_format: 'json',
  });
}

export async function callTessaSummarize(systemPrompt: string, userPrompt: string): Promise<string> {
  return callTessaProxy({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    request_type: 'prelim_summarize',
    response_format: 'markdown',
  });
}

export async function callTessaRepair(systemPrompt: string, userPrompt: string): Promise<string> {
  return callTessaProxy({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    request_type: 'repair',
    response_format: 'markdown',
  });
}
```

---

## Phase 2: JSON Extraction Prompt

### File: `lib/tessa/tessa-prompts.ts`

Add a new extraction-specific prompt that returns JSON instead of markdown. 
This replaces the giant analysis prompt for the EXTRACTION step only.

```typescript
// Add to lib/tessa/tessa-prompts.ts

export const EXTRACTION_SYSTEM_PROMPT = `You are a title document analysis engine. 
You extract structured data from Preliminary Title Reports.
You MUST respond with valid JSON only — no markdown, no backticks, no preamble.
Never invent data. If a value is not stated in the document, use null.
Use exact dollar amounts with $ and commas. Never round.`;

export function buildExtractionPrompt(
  pdfText: string, 
  factsJson: string
): string {
  return `Analyze this Preliminary Title Report and return a JSON object with the following structure.

GROUND TRUTH (pre-extracted facts — do NOT contradict these):
${factsJson}

REQUIRED JSON STRUCTURE:
{
  "title_requirements": [
    {
      "item_number": <number or null>,
      "description": "<exact text from document>",
      "action": "<short directive: Obtain, Record, Provide, etc.>",
      "severity": "blocker" | "material" | "informational",
      "type": "<payoff|reconveyance|trust_cert|soi|affidavit|lien_release|tax_clearance|other>",
      "related_instrument": "<recording number or null>",
      "assignee": "<who handles this: Escrow|Seller|Buyer|Lender|Title|null>"
    }
  ],
  "property_info": {
    "apn": "<string or null>",
    "address": "<string or null>",
    "legal_description": "<string or null>",
    "vesting": "<current owner names and manner of holding>",
    "property_type": "<SFR|condo|commercial|multi-unit|null>",
    "ownership_structure": "<individual|joint_tenants|community_property|trust|llc|tic|null>"
  },
  "liens": [
    {
      "position": <number>,
      "type": "deed_of_trust" | "tax_lien" | "mechanics_lien" | "judgment" | "hoa" | "ucc" | "other",
      "amount": "<exact dollar string or null>",
      "beneficiary": "<string>",
      "trustor": "<string or null>",
      "recording_ref": "<instrument number or null>",
      "recording_date": "<date string or null>",
      "assigned_to": "<current holder if assigned, or null>",
      "action_required": "<payoff|reconveyance|release|subordination|null>"
    }
  ],
  "taxes": [
    {
      "tax_id": "<parcel number>",
      "fiscal_year": "<string or null>",
      "first_installment": { "amount": "<string>", "status": "paid" | "open" | "delinquent" | "defaulted" },
      "second_installment": { "amount": "<string>", "status": "paid" | "open" | "delinquent" | "defaulted" },
      "exemption": "<string or null>",
      "code_area": "<string or null>",
      "total_tax": "<string or null>",
      "penalties": "<string or null>"
    }
  ],
  "tax_defaults": [
    {
      "tax_id": "<parcel number>",
      "default_year": "<string>",
      "amount": "<string>",
      "redemption_info": "<string or null>"
    }
  ],
  "other_findings": [
    {
      "item_number": <number or null>,
      "type": "easement" | "ccr" | "hoa" | "mineral_rights" | "restriction" | "other",
      "description": "<string>",
      "recording_ref": "<string or null>"
    }
  ],
  "document_status": {
    "appears_complete": true | false,
    "document_date": "<string or null>",
    "order_number": "<string or null>",
    "missing_sections": ["<string>"] | [],
    "notes": "<string or null>"
  },
  "schedule_a_subjects": [<list of item numbers referenced in Schedule A>],
  "foreclosure_detected": true | false,
  "recent_conveyance_detected": true | false
}

DOCUMENT TEXT:
${pdfText.slice(0, 50000)}`;
}
```

### Summary Prompt (Step 2)

```typescript
export const SUMMARY_SYSTEM_PROMPT = `You are a title industry expert writing a plain-English 
summary of a preliminary title report analysis. Write for a real estate professional.
Be concise. Lead with what matters most for closing.`;

export function buildSummaryPrompt(extractedJson: string): string {
  return `Based on this extracted analysis of a Preliminary Title Report, write:

1. A 3-5 sentence SUMMARY of the transaction and title condition. 
   Lead with the most critical issues. Mention the property address and vesting.
   
2. A list of CLOSING RISKS — numbered, each with a severity (high/medium/low) and 
   a one-sentence explanation of why it matters.

3. An ESTIMATED COMPLEXITY assessment: Simple / Moderate / Complex, with a brief reason.

Here is the extracted data:
${extractedJson}

Write in professional but accessible language. No legal jargon unless necessary.
Format as markdown with clear headers.`;
}
```

---

## Phase 3: Update the Analysis Hook

### File: `hooks/usePrelimAnalysis.ts`

Rewrite the orchestration to use the multi-step pipeline:

```typescript
// hooks/usePrelimAnalysis.ts

import { useState, useCallback } from 'react';
import { extractPdfText } from '@/lib/tessa/tessa-pdf';
import { computeFacts } from '@/lib/tessa/tessa-pre-parser';
import { 
  buildExtractionPrompt, 
  buildSummaryPrompt,
  EXTRACTION_SYSTEM_PROMPT,
  SUMMARY_SYSTEM_PROMPT 
} from '@/lib/tessa/tessa-prompts';
import { callTessaExtract, callTessaSummarize } from '@/lib/tessa/tessa-api';
import { validateAndRepair } from '@/lib/tessa/tessa-guardrails';
import type { PrelimFacts, ExtractedAnalysis } from '@/lib/tessa/tessa-types';

type AnalysisStatus = 
  | 'idle' 
  | 'extracting_text'      // PDF.js pulling text
  | 'computing_facts'       // Pre-parser running
  | 'extracting_findings'   // LLM Call 1: structured extraction
  | 'generating_summary'    // LLM Call 2: plain-English summary
  | 'validating'            // Guardrails check
  | 'complete' 
  | 'error';

interface AnalysisResult {
  extracted: ExtractedAnalysis;    // Structured JSON from LLM
  summary: string;                  // Plain-English summary markdown
  facts: PrelimFacts;              // Pre-parser facts (ground truth)
  cheatSheet?: string;             // Agent mode content (if requested)
}

export function usePrelimAnalysis() {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzePrelim = useCallback(async (file: File, agentMode: boolean = false) => {
    try {
      setError(null);
      setResult(null);

      // ── Step 1: Extract PDF text (client-side, no LLM) ──
      setStatus('extracting_text');
      setProgress(5);
      const pdfText = await extractPdfText(file);

      // ── Step 2: Pre-parser computes ground truth facts (client-side, no LLM) ──
      setStatus('computing_facts');
      setProgress(15);
      const facts = computeFacts(pdfText);
      const factsJson = JSON.stringify(facts, null, 2);

      // ── Step 3: LLM Call 1 — Structured Extraction (temp=0, JSON output) ──
      setStatus('extracting_findings');
      setProgress(25);
      const extractionPrompt = buildExtractionPrompt(pdfText, factsJson);
      const extractionResponse = await callTessaExtract(EXTRACTION_SYSTEM_PROMPT, extractionPrompt);
      
      // Parse the JSON response
      let extracted: ExtractedAnalysis;
      try {
        // Clean potential markdown backticks if Claude adds them despite instructions
        const cleaned = extractionResponse
          .replace(/^```json?\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();
        extracted = JSON.parse(cleaned);
      } catch (parseErr) {
        console.error('[TESSA] JSON parse failed, raw response:', extractionResponse.slice(0, 500));
        throw new Error('Failed to parse extraction response as JSON');
      }

      // ── Step 4: Guardrails — validate extraction against pre-parser facts ──
      setStatus('validating');
      setProgress(60);
      extracted = validateAndRepairExtraction(extracted, facts);

      // ── Step 5: LLM Call 2 — Generate Summary (temp=0.1, markdown output) ──
      setStatus('generating_summary');
      setProgress(75);
      const summaryPrompt = buildSummaryPrompt(JSON.stringify(extracted, null, 2));
      const summary = await callTessaSummarize(SUMMARY_SYSTEM_PROMPT, summaryPrompt);

      // ── Step 6 (optional): Agent Cheat Sheet ──
      let cheatSheet: string | undefined;
      if (agentMode) {
        setProgress(88);
        // Use existing buildCheatSheetItems from tessa-cheat-sheet.ts
        // OR make a third LLM call with the extracted data
        // For now, use the deterministic client-side cheat sheet builder
        cheatSheet = buildCheatSheetFromExtraction(extracted, facts);
      }

      // ── Done ──
      setProgress(100);
      setStatus('complete');
      setResult({ extracted, summary, facts, cheatSheet });

    } catch (err) {
      console.error('[TESSA] Analysis failed:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Analysis failed');
    }
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setProgress(0);
    setResult(null);
    setError(null);
  }, []);

  return { analyzePrelim, reset, status, progress, result, error };
}
```

---

## Phase 4: New Types for JSON Output

### File: `lib/tessa/tessa-types.ts`

Add types that match the JSON extraction schema:

```typescript
// Add to lib/tessa/tessa-types.ts

export interface ExtractedRequirement {
  item_number: number | null;
  description: string;
  action: string;
  severity: 'blocker' | 'material' | 'informational';
  type: string;
  related_instrument: string | null;
  assignee: string | null;
}

export interface ExtractedPropertyInfo {
  apn: string | null;
  address: string | null;
  legal_description: string | null;
  vesting: string | null;
  property_type: string | null;
  ownership_structure: string | null;
}

export interface ExtractedLien {
  position: number;
  type: string;
  amount: string | null;
  beneficiary: string;
  trustor: string | null;
  recording_ref: string | null;
  recording_date: string | null;
  assigned_to: string | null;
  action_required: string | null;
}

export interface ExtractedTaxInstallment {
  amount: string;
  status: 'paid' | 'open' | 'delinquent' | 'defaulted';
}

export interface ExtractedTax {
  tax_id: string;
  fiscal_year: string | null;
  first_installment: ExtractedTaxInstallment;
  second_installment: ExtractedTaxInstallment;
  exemption: string | null;
  code_area: string | null;
  total_tax: string | null;
  penalties: string | null;
}

export interface ExtractedTaxDefault {
  tax_id: string;
  default_year: string;
  amount: string;
  redemption_info: string | null;
}

export interface ExtractedOtherFinding {
  item_number: number | null;
  type: string;
  description: string;
  recording_ref: string | null;
}

export interface ExtractedDocumentStatus {
  appears_complete: boolean;
  document_date: string | null;
  order_number: string | null;
  missing_sections: string[];
  notes: string | null;
}

export interface ExtractedAnalysis {
  title_requirements: ExtractedRequirement[];
  property_info: ExtractedPropertyInfo;
  liens: ExtractedLien[];
  taxes: ExtractedTax[];
  tax_defaults: ExtractedTaxDefault[];
  other_findings: ExtractedOtherFinding[];
  document_status: ExtractedDocumentStatus;
  schedule_a_subjects: number[];
  foreclosure_detected: boolean;
  recent_conveyance_detected: boolean;
}
```

---

## Phase 5: Update Guardrails for JSON

### File: `lib/tessa/tessa-guardrails.ts`

The guardrails system currently works on markdown text (find section, replace section).
With JSON output, validation becomes much simpler — compare fields directly:

```typescript
// Add to lib/tessa/tessa-guardrails.ts

export function validateAndRepairExtraction(
  extracted: ExtractedAnalysis, 
  facts: PrelimFacts
): ExtractedAnalysis {
  
  // 1. Ensure all pre-parser requirements are present
  if (facts.requirements?.length) {
    for (const req of facts.requirements) {
      const found = extracted.title_requirements.some(r => 
        r.description.toLowerCase().includes(req.text.toLowerCase().slice(0, 30))
      );
      if (!found) {
        extracted.title_requirements.push({
          item_number: req.itemNumber || null,
          description: req.text,
          action: req.action || 'Review',
          severity: req.severity || 'material',
          type: req.type || 'other',
          related_instrument: null,
          assignee: null,
        });
      }
    }
  }

  // 2. Ensure all pre-parser DOTs are present
  if (facts.deedsOfTrust?.length) {
    for (const dot of facts.deedsOfTrust) {
      const found = extracted.liens.some(l => 
        l.recording_ref === dot.instrumentNo || 
        (l.amount === dot.amount && l.beneficiary?.includes(dot.beneficiary?.slice(0, 15) || ''))
      );
      if (!found) {
        extracted.liens.push({
          position: extracted.liens.length + 1,
          type: 'deed_of_trust',
          amount: dot.amount || null,
          beneficiary: dot.beneficiary || 'Unknown',
          trustor: dot.trustor || null,
          recording_ref: dot.instrumentNo || null,
          recording_date: dot.recordingDate || null,
          assigned_to: dot.assignedTo || null,
          action_required: 'payoff',
        });
      }
    }
  }

  // 3. Inject deterministic tax data from pre-parser
  // Pre-parser taxes are ground truth — replace AI's tax data entirely
  if (facts.propertyTaxes?.length) {
    extracted.taxes = facts.propertyTaxes.map(tax => ({
      tax_id: tax.taxId || tax.parcelNumber || '',
      fiscal_year: tax.fiscalYear || null,
      first_installment: {
        amount: tax.firstInstallmentAmount || 'Not stated',
        status: normalizeStatus(tax.firstInstallmentStatus),
      },
      second_installment: {
        amount: tax.secondInstallmentAmount || 'Not stated',
        status: normalizeStatus(tax.secondInstallmentStatus),
      },
      exemption: tax.exemption || null,
      code_area: tax.codeArea || null,
      total_tax: tax.totalTax || null,
      penalties: tax.penalties || null,
    }));
  }

  // 4. Inject tax defaults from pre-parser
  if (facts.taxDefaults?.length) {
    extracted.tax_defaults = facts.taxDefaults.map(td => ({
      tax_id: td.taxId || '',
      default_year: td.year || '',
      amount: td.amount || '',
      redemption_info: td.redemptionInfo || null,
    }));
  }

  // 5. Ensure foreclosure flag matches pre-parser
  if (facts.foreclosureFlags?.length) {
    extracted.foreclosure_detected = true;
  }

  return extracted;
}

function normalizeStatus(status: string | undefined): 'paid' | 'open' | 'delinquent' | 'defaulted' {
  if (!status) return 'open';
  const s = status.toLowerCase();
  if (s.includes('paid')) return 'paid';
  if (s.includes('delinquent')) return 'delinquent';
  if (s.includes('default')) return 'defaulted';
  return 'open';
}
```

---

## Phase 6: Update Section Renderers

### Your existing section-specific renderers (TessaRequirementsContent, TessaLiensContent, etc.) 
### currently parse markdown. With JSON, they receive typed data directly.

The renderers become MUCH simpler. Instead of:
```tsx
// OLD: Parse markdown to find liens
const liens = parseLiensFromMarkdown(sectionContent);
```

You get:
```tsx
// NEW: Typed data passed directly
<TessaLiensContent liens={result.extracted.liens} />
```

Each renderer just maps over the typed array and renders cards. No regex. No parsing.
The section content is deterministic because the data is structured.

---

## Migration Path (Do It In This Order)

### Week 1: Temperature Fix (Proxy only, no frontend changes)
1. Deploy the updated `server.js` to Render
2. Test: upload same prelim 3 times, compare results
3. This alone cuts variation by ~80%

### Week 2: JSON Extraction (Both repos)
1. Add the extraction prompt to `tessa-prompts.ts`
2. Add the new types to `tessa-types.ts`
3. Update `tessa-api.ts` with the new convenience wrappers
4. Update `usePrelimAnalysis.ts` to use the two-step pipeline
5. Update guardrails for JSON validation
6. Test: same prelim 3 times → structured data should be identical

### Week 3: Update Renderers
1. Update each section renderer to accept typed props instead of markdown
2. Remove markdown parsing logic from renderers
3. The Summary section still uses markdown (it's prose) — that's fine
4. Test: visual output should look the same but data is now structured

### Week 4: Polish
1. Add result caching by document hash (optional)
2. Tune the extraction prompt based on real prelim testing
3. Remove the old single-call prompt path once satisfied

---

## What NOT to Change

- The floating chat widget (TessaChatWidget) — still uses the old markdown path
- The transfer tax lookup — unrelated
- The TessaContext for general chat — stays as-is
- The pre-parser (tessa-pre-parser.ts) — this already works perfectly
- The cheat sheet builder — can stay client-side, no LLM needed

---

## File Change Summary

| File | Repo | Action |
|------|------|--------|
| `server.js` | tessa-proxy (Render) | Replace with v2.1 |
| `lib/tessa/tessa-api.ts` | PCT app (Vercel) | Add request_type + response_format + convenience wrappers |
| `lib/tessa/tessa-prompts.ts` | PCT app (Vercel) | Add EXTRACTION prompt + SUMMARY prompt |
| `lib/tessa/tessa-types.ts` | PCT app (Vercel) | Add ExtractedAnalysis types |
| `lib/tessa/tessa-guardrails.ts` | PCT app (Vercel) | Add JSON validation (keep markdown validation for fallback) |
| `hooks/usePrelimAnalysis.ts` | PCT app (Vercel) | Rewrite orchestration for multi-step pipeline |
| `components/tessa/Tessa*Content.tsx` | PCT app (Vercel) | Update renderers to accept typed props |

## Cost Impact

Two LLM calls instead of one, BUT:
- Extraction call uses JSON (fewer output tokens than verbose markdown)
- Summary call is short (3-5 sentences + risk list)
- Net token usage is roughly the same, possibly less
- Repair calls should drop significantly (JSON extraction is more reliable than markdown)
