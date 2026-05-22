# TESSA™ — AI Title & Escrow Assistant

**Last verified:** 2026-05-22 · **Maintained by:** Documentation Agent · **Source of truth:** `/docs/system/tessa.md`

## Overview

TESSA™ ("Title & Escrow Smart Support Assistant") is an in-site AI chat assistant for California title/escrow questions and **Preliminary Title Report (PDF) analysis**. It is gated behind an optional shared access code and proxies all LLM calls to a Render-hosted service so no model key lives in this repo.

## Architecture

```
 Browser
   │  TessaContext (client state, system prompt, auth gate)
   │
   ├─ GET  /api/tessa/status   → { authenticated }   (lib/tessa-auth)
   ├─ POST /api/tessa/verify   → sets tessa_session cookie
   └─ POST /api/tessa          → proxy
                                   │
                                   ▼
                    https://tessa-proxy.onrender.com/api/ask-tessa
                       { messages, max_tokens:1500, temperature:0.7 }
                                   │  (LLM lives behind the proxy)
                                   ▼
                       returns OpenAI-shaped { choices[0].message.content }
```

## Proxy endpoint

- `app/api/tessa/route.ts` POSTs `{ messages, max_tokens: 1500, temperature: 0.7 }` to **`https://tessa-proxy.onrender.com/api/ask-tessa`** and reads `data.choices[0].message.content`.
- The proxy URL is **hardcoded** in the route (not an env var).
- ⚠️ NEEDS REVIEW: The response is parsed in OpenAI's `choices[].message.content` shape, but `TESSA_INTEGRATION_GUIDE` (now archived) described an Anthropic swap. The **actual model** behind `tessa-proxy.onrender.com` is not in this repo — confirm with whoever owns the Render service. There is also `app/api/tessa/analyze` and `app/api/tessa/verify`/`status` routes plus `lib/tessa/*` parsers I did not fully trace this pass (see Code References).

## PDF analysis flow

- `TessaPrelimUploader.tsx` collects a PDF; text is extracted client-side (the repo depends on `pdfjs-dist`).
- `TessaContext.analyzePdf(text, fileName)` builds a fixed analysis prompt, **slices the document text to 50,000 chars**, and calls `sendMessage()` (same `/api/tessa` path).
- Results render through structured components: `TessaPrelimResults`, `TessaSectionCard`, and `content/Tessa*Content.tsx` (Requirements, Summary, Property, Liens, Tax, Other Findings, Doc Status) — mirroring the system prompt's mandated output order.
- ⚠️ ASSUMPTION: deeper structured parsing/severity scoring (`TessaSeverityBadge`, `TessaComplexityScore`, `lib/tessa/tessa-section-parser.ts`) was inferred from filenames, not line-by-line review.

## Component locations

- Widget/UI: `components/tessa/TessaChatWidget.tsx`, `TessaAgentToggle.tsx`, `TessaCheatSheet.tsx`, `TessaPrelimModal.tsx`, `TessaPrelimUploader.tsx`, `TessaPrelimResults.tsx`, `TessaSectionCard.tsx`, `content/Tessa*Content.tsx`
- State/prompt: `contexts/TessaContext.tsx`
- Server: `app/api/tessa/route.ts` (chat), `app/api/tessa/analyze`, `app/api/tessa/verify`, `app/api/tessa/status`
- Libs: `lib/tessa-auth.ts`, `lib/tessa/tessa-*.ts` (prompts, parsers, guardrails, PDF, cheat-sheet, types)

## System prompt strategy (not reproduced in full)

The client-side system prompt (`contexts/TessaContext.tsx`) frames TESSA as a California title/escrow expert for PCT and enforces, among other rules:
- **Title requirements first** — always lead document analysis with the must-do actions to close.
- **Fixed output order** for document analysis (Requirements → Summary → Property → Liens → Taxes → Other → Doc Status).
- **Ground-truth rule** — when `facts_json` is supplied, never contradict it; never invent amounts/parties/recording refs.
- **No tax-rate answers** — deflect transfer/property tax-rate questions to the Rate Calculator / office phone.

⚠️ Note: the prompt currently ships to the browser (client component). The proxy service likely applies its own server-side prompt as well.

## Available features

- Conversational chat (title/escrow Q&A), with a tool-mention list (Rate Calculator, Prop 19 calculator, Title Toolbox, TitlePro 247).
- PDF Preliminary Title Report analysis with structured results.
- Cheat sheets (`TessaCheatSheet.tsx`, `lib/tessa/tessa-cheat-sheet.ts`).
- Transfer-tax questions are intentionally **refused** and redirected to the calculator.

## Integration touchpoints

- Auth: `TESSA_ACCESS_CODE` env (if set → gate on). Cookie `tessa_session`.
- Calculator + Prop 19: referenced in-prompt as the canonical source for tax/fee numbers (TESSA must not compute them).

## Code References

- `app/api/tessa/route.ts:17` — proxy URL + request shape; `:32` — response parsing
- `lib/tessa-auth.ts:11` — session value `ok.<sha256("tessa:"+code)[:16]>`
- `contexts/TessaContext.tsx:32` — system prompt; `:229` — `analyzePdf` (50k slice)

## Common Tasks

- **Disable the gate:** unset `TESSA_ACCESS_CODE` (then `isAuthRequired()` returns false and all sessions validate).
- **Rotate the access code:** change `TESSA_ACCESS_CODE`; existing `tessa_session` cookies become invalid automatically (hash is derived from the code).
- **Point at a different LLM/proxy:** edit the hardcoded URL in `app/api/tessa/route.ts` (consider moving to an env var).

## Gotchas / Notes

- Render free-tier **cold starts**: the UI explicitly messages users to retry after a pause — the proxy may take seconds to wake.
- The proxy URL is hardcoded; there's no failover.
- System prompt is client-visible.

---
*This document is maintained by the Documentation Agent. To regenerate or update, see `claude-skills.md` → Documentation Agent role.*
