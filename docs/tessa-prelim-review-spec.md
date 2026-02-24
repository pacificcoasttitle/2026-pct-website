# TESSA™ Prelim Review — Feature Exploration & Build Spec

> **Pacific Coast Title — Internal Planning Document**
> Date: February 24, 2026
> Status: Exploration / Pre-Build

---

## What Is Tessa's Prelim Review?

A **Preliminary Title Report (prelim)** is the foundational document in every California real estate transaction. It discloses the condition of title — liens, easements, encumbrances, and the requirements a buyer and seller must satisfy before the title company will insure the property.

Reading a prelim correctly is a skill. For a seasoned escrow officer it's second nature. For a real estate agent, lender, or first-time buyer — it's dense, legal, and easy to misread.

**TESSA's Prelim Review** solves this. A user uploads a Preliminary Title Report PDF, and TESSA reads it, extracts the critical information, and returns a structured, plain-English summary — leading with the actions that must be taken to close.

---

## Current State (What Already Works)

TESSA's prelim analysis is **already live** in the floating chat widget on the PCT website. Here's what it does today:

### How It Works Technically

```
User uploads PDF (up to 10MB)
    │
    ▼
PDF.js extracts text client-side
(no document ever leaves the browser to a storage server)
    │
    ▼
Text (up to 50,000 chars) is sent to:
POST https://tessa-proxy.onrender.com/api/ask-tessa
    │
    ▼
OpenAI GPT processes text against Tessa's system prompt
    │
    ▼
Structured analysis returned in the chat panel
```

### Current Entry Point

- User opens the "Ask TESSA™" floating button (bottom-right of every page)
- Clicks the 📎 upload icon next to the text input
- Selects a PDF (must be under 10MB)
- Clicks **Analyze**
- Result appears in the chat conversation

### What TESSA Outputs — The 7-Section Report

TESSA always returns results in this exact order:

| # | Section | What It Contains |
|---|---------|-----------------|
| 1 | **TITLE REQUIREMENTS** | The action list — what must happen before close. Formatted as directives: "Obtain payoff demand," "Record reconveyance," "Provide trust certification." Includes severity tags: **Blocker**, **Material**, or **Informational**. |
| 2 | **SUMMARY** | 3–5 sentence plain-English overview of the transaction and title condition |
| 3 | **PROPERTY INFORMATION** | APN, legal description, vesting, current title holder, Schedule A details |
| 4 | **LIENS AND JUDGMENTS** | All deeds of trust, tax liens, mechanic's liens, judgments — with exact dollar amounts, recording references, and beneficiary info |
| 5 | **TAXES AND ASSESSMENTS** | Per Tax ID: fiscal year, 1st/2nd installment amounts and status, penalties, homeowners exemption, code area, supplemental assessments |
| 6 | **OTHER FINDINGS** | Easements, CC&Rs, restrictions, HOA, mineral rights, Schedule B exceptions |
| 7 | **DOCUMENT STATUS** | Whether the prelim appears complete, any missing pages, document date |

### Key Behavioral Rules Baked Into TESSA

- **Closing-First Mindset**: Always leads with what blocks funding. Doesn't bury the lede.
- **No Invented Data**: If a figure isn't stated in the document, TESSA writes "Not stated" — never guesses.
- **Exact Amounts**: Uses precise dollar figures with $ and commas. No rounding.
- **Schedule A Priority**: If Schedule A says "SUBJECT TO ITEM NOS. 4, 7, 11" — those items are elevated to top of requirements.
- **Tax Block Parsing**: Structured per Tax ID with every installment status parsed separately.

---

## Who Uses This & Why It Matters

### 1. Real Estate Agents
> *"I got the prelim. What do I need to do?"*

Agents receive prelims but often lack the training to identify what's critical. TESSA gives them an instant action list so they can brief their clients and not miss a step.

**Value**: Reduces back-and-forth calls to the escrow officer. Agents feel more confident and refer more business to PCT.

### 2. Escrow Officers
> *"I need a fast first-read before I build the requirements list."*

Even experienced officers use TESSA as a quick first pass — especially on complex files with multiple liens, trusts, or deferred taxes.

**Value**: Speed. TESSA reads the whole prelim in 10–15 seconds and surfaces the structure instantly.

### 3. Lenders / Loan Officers
> *"Is there anything on title that affects my loan?"*

Lenders care about specific items: priority of their deed of trust, existing liens that must be paid off, HOA super-priority lien status, property tax delinquencies.

**Value**: TESSA highlights these without the lender having to read 30 pages of Schedule B exceptions.

### 4. Buyers & Sellers (Consumer-Facing)
> *"Can someone explain this in plain English?"*

Buyers receiving a prelim for the first time are often overwhelmed. TESSA's plain-English summary section is purpose-built for this.

**Value**: PCT differentiates as the company that actually explains the process.

---

## What's Missing — The Gap Between Today and a Full Feature

The prelim analysis works today, but it's **buried inside a general chat widget**. There is no dedicated experience, no promotion, no clear entry point for agents or lenders. This is the core gap to address.

### Gap Summary

| What Exists | What's Missing |
|-------------|----------------|
| PDF upload in chat widget | Dedicated `/tessa/prelim-review` page |
| 7-section structured output | Formatted result cards (collapsible, printable) |
| Plain-English summary | "Realtor Cheat Sheet" mode |
| Chat conversation continues | Email / copy / save results |
| Works for any PDF | Guidance on what a prelim actually looks like |
| Hidden inside general chat | Prominent entry point on agent-facing pages |

---

## Proposed: Dedicated Prelim Review Page

**Route:** `/tessa/prelim-review`

### Page Design

A focused, single-purpose page — not a chat interface. Upload → Analyze → Structured Results.

```
┌─────────────────────────────────────────────────────────────┐
│   TESSA™ Prelim Review                                      │
│   Upload a Preliminary Title Report for instant analysis    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │   📄 Drop your Prelim PDF here, or click to browse  │  │
│   │      Accepts .pdf — up to 10MB                      │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   [  Analyze with TESSA  ]                                  │
│                                                             │
│   ── RESULTS ────────────────────────────────────────────── │
│                                                             │
│   ▸ TITLE REQUIREMENTS (4 items)          [Expand]          │
│   ▸ SUMMARY                               [Expand]          │
│   ▸ PROPERTY INFORMATION                  [Expand]          │
│   ▸ LIENS AND JUDGMENTS (2 items)         [Expand]          │
│   ▸ TAXES AND ASSESSMENTS                 [Expand]          │
│   ▸ OTHER FINDINGS                        [Expand]          │
│   ▸ DOCUMENT STATUS                       [Expand]          │
│                                                             │
│   [  Email Results  ]  [  Copy  ]  [  Analyze New File  ]  │
│                                                             │
│   ─────────────────────────────────────────────────────── │
│   📞 Questions about this prelim? Call PCT: (714) 516-6700 │
│      Or speak with an escrow officer: pct.com/contact      │
└─────────────────────────────────────────────────────────────┘
```

### Result Cards (Collapsible)

Each of the 7 sections renders as a collapsible card:

- **Title Requirements** card: each requirement shown as a checklist item with severity badge (🔴 Blocker / 🟡 Material / 🔵 Informational)
- **Taxes** card: per Tax ID with structured table rows
- **Liens** card: each lien as its own sub-card with amount, holder, recording ref
- All other sections: clean paragraph + bullet format

### Realtor Cheat Sheet Mode (Toggle)

A "Simplify for Agents" toggle that re-prompts TESSA with the same document content but a different instruction:

> *"Re-explain this prelim analysis as if talking to a real estate agent with 2 years experience. Use plain English. Replace legal terms with everyday words. Focus on what the agent needs to tell their client and what actions are needed before close."*

Output changes from technical directives to agent-friendly language:
- Instead of: *"Record Request for Reconveyance — Beneficiary: Wells Fargo Bank NA — Instrument No. 2019-112345"*
- Becomes: *"There's an old mortgage on this property that needs to be officially removed from county records. The seller's lender will need to sign off once their loan is paid off at closing."*

### Email Results

A simple form: *"Send these results to my email"* — sends the full structured report to the agent/officer so they have it for their file.

Uses the same SendGrid/Resend setup already in the project.

---

## Additional Feature Ideas to Explore

### 1. Multi-File / Compare Mode
Allow uploading a prelim + a policy or previous prelim. TESSA compares them and highlights what changed.

*Use case*: An updated prelim came in. What's different from the original?

### 2. Ask Follow-Up Questions About This Prelim
After the analysis appears, the user can type follow-up questions in context:
- *"Is the HOA lien a super-priority lien in California?"*
- *"What does 'Declaration of Covenants' on item 14 actually restrict?"*
- *"How do I get the judgment on the seller removed?"*

This is already possible in the chat widget (since it maintains conversation history). The dedicated page should surface this clearly.

### 3. Requirement Checklist Export
Export the **Title Requirements** section as a checklist PDF or Google Doc link — one requirement per line, checkbox, assignee field, due date field.

*Use case*: Escrow officer uses it as their working checklist for the file.

### 4. Pre-Fill Deep Link from TitlePro 247
When PCT opens an order in TitlePro 247 (pct247.com), a link in the confirmation email could auto-launch the prelim review with the escrow number pre-filled — similar to the FinCEN pipeline.

*Similar to the FinCEN email link we already built.*

### 5. Severity Scoring / File Risk Dashboard
TESSA assigns each requirement a severity: Blocker, Material, Informational. Sum them up:

```
File Complexity Score:
🔴 Blockers: 2   🟡 Material: 4   🔵 Informational: 3
→ "This is a moderately complex file. Estimated clearance time: 5–10 business days."
```

This gives the escrow officer and agent a quick gut-check on how involved the file will be.

---

## How to Promote the Prelim Review

### On the PCT Website

1. **Agent Tools page** — Add "Prelim Review" as a featured tool alongside the Rate Calculator
2. **Lender Solutions page** — "Understand title quickly. Upload your prelim, get a plain-English summary."
3. **QuickAccess Toolbar** — Add a "Prelim Review" link (📄 icon) to the floating side menu
4. **Homepage Hero** — Add a suggestion button in Tessa's chat: *"Analyze a Prelim PDF →"*

### For Agents & Lenders (Email / Marketing)

> **Subject: Your prelim just got a lot easier to read**
>
> Getting a 30-page Preliminary Title Report and wondering where to start?
>
> Upload it to TESSA, PCT's AI assistant, and get back:
> - A plain-English summary in under 30 seconds
> - The complete action list — what needs to happen before closing
> - Every lien, tax, and restriction — parsed and organized
>
> No login required. No data stored. Just answers.
>
> **[Try Prelim Review →]** pct.com/tessa/prelim-review

### For Escrow Officers (Internal Use)

> "Use TESSA for your first read. Upload the prelim when it comes in — have a structured requirements list before you finish your coffee."
>
> Works alongside your existing workflow. TESSA is not replacing your judgment — she's doing the first pass so you can focus on the parts that need human expertise.

---

## Technical Notes

### What Already Works (No Build Needed)
- PDF text extraction via PDF.js ✅
- TESSA analysis via tessa-proxy.onrender.com ✅
- Chat widget on every page ✅
- 7-section system prompt ✅

### What Needs to Be Built
| Feature | Complexity | Priority |
|---------|------------|----------|
| Dedicated `/tessa/prelim-review` page | Low | P1 |
| Collapsible result cards with severity badges | Medium | P1 |
| "Simplify for Agents" toggle | Low | P1 |
| Email results | Low | P2 |
| Realtor Cheat Sheet mode | Low | P2 |
| QuickAccess toolbar link | Low | P1 |
| Requirement checklist export (PDF) | High | P3 |
| Multi-file compare | High | P3 |

### Constraints
- **PDF size limit**: 10MB (current) — sufficient for typical prelims (2–10 pages)
- **Text limit**: 50,000 characters sent to OpenAI — sufficient for most prelims; very large files (40+ pages) may be truncated
- **No server storage**: Documents are never stored — text is extracted in the browser and sent directly to the AI. Privacy-safe by design.
- **Cold start**: The tessa-proxy on Render.com free tier may take 15–30 seconds on the first request of the day. Consider upgrading to paid tier before promoting heavily.

---

## Open Questions for Discussion

1. **Dedicated page vs. enhanced widget**: Should prelim review live at `/tessa/prelim-review` as a standalone experience, or should we enhance the existing chat widget with a better upload UX?

2. **Agent-facing vs. professional-facing**: Do we want one mode for agents (plain English, cheat sheet) and a separate mode for escrow officers (technical, full detail)?

3. **Storing results**: Should we offer users the ability to save/revisit past analyses? This would require authentication and a database — significant scope increase.

4. **Branding**: Is this "TESSA Prelim Review", "TESSA Document Analysis", "PCT Prelim Analyzer"? The name matters for how we promote it.

5. **Disclaimer language**: All analysis is AI-generated and for informational purposes only. What level of disclaimer is appropriate? Should we require a checkbox acknowledgment before viewing results?

---

## Suggested Next Steps

1. **Build the dedicated page** at `/tessa/prelim-review` with drag-and-drop upload and collapsible result cards
2. **Add a QuickAccess toolbar link** so it's reachable from every page (📄 Prelim Review)
3. **Add "Simplify for Agents" toggle** — easy win, high value for agent adoption
4. **Add the page to the Agent Tools section** of the website
5. **Test with real prelims** — upload 5–10 actual PCT prelims and review output quality; tune the system prompt based on results
6. **Soft launch to agents** via email (use the copy above)

---

*Pacific Coast Title — TESSA™ AI Division*
*Questions: Contact the digital team or Gerard directly*
