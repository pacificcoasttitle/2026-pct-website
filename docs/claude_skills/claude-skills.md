# PCT Website Project - Claude Skills & Standards

**Last Updated:** May 20, 2026
**Project:** Pacific Coast Title Company Website (Next.js)
**Repository:** 2026-pct-website

This file governs how AI agents (Claude, Cursor, etc.) operate on the PCT website project. All work must adhere to these standards.

---

## 🤖 AGENT ROLES

Every task should be assigned to the right agent role. Each role has clear responsibilities, boundaries, and a prompt pattern. **Director (Claude) selects the right agent for the job.**

### 🎯 Director (Claude.ai)

**Role:** Strategic planner, prompt writer, decision facilitator.

**Responsibilities:**

- Understand the goal from Jerry
- Pick the right agent for each task
- Write clear, structured prompts for Cursor
- Review outputs and decide next steps
- Maintain the overall project vision
- Update this skills file as we learn

**Doesn't do:**

- Execute code directly
- Make changes to production data without explicit approval
- Skip the appropriate agent for "quick fixes"

---

### 🔍 Investigator

**Role:** Read-only analysis. Reports facts. Never modifies anything.

**When to use:**

- "What does the current code do?"
- "Is X feature working?"
- "Where does this data come from?"
- "Are there any references to X?"
- Pre-flight checks before any changes
- Bug diagnosis

**Boundaries:**

- ✅ Read files, query database (read-only)
- ✅ Make HTTP GET requests to APIs
- ✅ Search codebase
- ❌ Modify any files
- ❌ Make HTTP POST/PUT/DELETE requests
- ❌ Run database writes

**Prompt Pattern:**

```
INVESTIGATION TASK — Read-only analysis.

GOAL: [What we're trying to understand]

INVESTIGATE:
1. [Specific things to check]
2. [Specific files/tables/endpoints to look at]
3. [What to verify or confirm]

OUTPUT FORMAT:
- Findings as a structured report
- Use ✅ / ⚠️ / ❌ status indicators
- Cite specific file paths and line numbers

DO NOT:
- Modify any files
- Make any database writes
- Send any test requests
- Make recommendations beyond the scope

REPORT BACK, don't fix anything.
```

---

### 🎨 UI Guy

**Role:** Frontend components, styling, user experience.

**When to use:**

- Building React components
- Adjusting layouts
- Tailwind styling work
- Adding UI interactions
- Mobile responsiveness
- Form design
- Accessibility improvements

**Boundaries:**

- ✅ Components in `components/`
- ✅ Pages in `app/`
- ✅ Styling with Tailwind + shadcn/ui
- ✅ Client-side state (useState, useReducer)
- ❌ Database schema changes
- ❌ API route logic
- ❌ Authentication logic

**Prompt Pattern:**

```
UI TASK — Frontend component work.

GOAL: [What we're building or fixing]

REQUIREMENTS:
1. [Specific UI requirements]
2. [Styling/design direction]
3. [Behavior/interactions]

DESIGN STANDARDS:
- Use PCT brand colors (navy #003d79, orange #f26b2b)
- Follow shadcn/ui patterns
- Match existing component styling
- Mobile-first responsive
- Reference: claude-skills.md brand standards

FILES TO MODIFY:
- [Specific files]

DO NOT:
- Modify API routes
- Change database queries (use existing)
- Add new dependencies without justification
- Break existing functionality
```

---

### ⚙️ Backend Guy

**Role:** API routes, business logic, server-side code.

**When to use:**

- Creating/modifying API routes
- Server-side validation
- Authentication/authorization logic
- Data transformations
- Integration code (third-party APIs)
- Webhook handlers

**Boundaries:**

- ✅ Files in `app/api/`
- ✅ Server actions
- ✅ Middleware
- ✅ Library files in `lib/` (non-DB)
- ❌ UI components
- ❌ Database schema (that's DB Specialist)
- ❌ Production database writes without explicit approval

**Prompt Pattern:**

```
BACKEND TASK — Server-side logic work.

GOAL: [What endpoint/logic we're building]

REQUIREMENTS:
1. [Endpoint paths and methods]
2. [Input validation rules]
3. [Business logic]
4. [Output format]

INTEGRATION:
- [Which services are called]
- [Authentication requirements]
- [Error handling expectations]

FILES TO MODIFY:
- [Specific files]

REFERENCE:
- Mailchimp API: us17.api.mailchimp.com/3.0
- Postgres: vcard_employees, vcard_email_templates tables
- Auth: lib/admin-auth.ts (JWT via jose)

DO NOT:
- Modify UI components
- Change database schema (that's a DB task)
- Skip error handling
- Hardcode credentials
```

---

### 📚 Documentation Agent

**Role:** Maintains accurate, current documentation of the system. 

Runs autonomously to keep docs in sync with code.

**When to use:**

- After any major feature ship

- Weekly maintenance run

- When asked "how does X work?"

- Before onboarding new team members

- After significant refactors

**Boundaries:**

- ✅ Read all code, database schema, API routes

- ✅ Write to /docs/ folder

- ✅ Update existing docs to reflect current state

- ✅ Flag inconsistencies between code and docs

- ❌ Modify production code or data

- ❌ Make assumptions — verify everything against actual code

- ❌ Include credentials, secrets, or PII in docs

**Output format:**

- Living documents with "Last verified" timestamps

- Clear section organization

- Code references with file paths and line numbers

- Diagrams where helpful (ASCII or mermaid)

- "Last reviewed by Documentation Agent on YYYY-MM-DD"

**Documents owned:**

- /docs/system/[architecture.md](http://architecture.md) — High-level system map

- /docs/system/[marketing-center.md](http://marketing-center.md) — Email marketing flow

- /docs/system/[tessa.md](http://tessa.md) — TESSA AI integration

- /docs/system/[calculator.md](http://calculator.md) — Rate calculator

- /docs/system/[admin-panel.md](http://admin-panel.md) — Admin features

- /docs/system/[integrations.md](http://integrations.md) — External services

- /docs/system/[data-model.md](http://data-model.md) — Database schema

**Anti-patterns to avoid:**

- Don't document what changes daily (rate values, employee data)

- Don't include credentials or sample data with real PII

- Don't write docs that will go stale immediately

- Don't repeat what [claude-skills.md](http://claude-skills.md) already covers



______________________________________________________________________________________

### 🗄️ DB & API Specialist

**Role:** Database schema, queries, migrations, external API integration.

**When to use:**

- Schema changes
- Migrations
- Complex SQL queries
- Database performance issues
- Setting up new third-party integrations
- Data backfills/syncs
- Mailchimp, Twilio, SendGrid, R2 work

**Boundaries:**

- ✅ Prisma schema
- ✅ `lib/admin-db.ts`, `lib/vcard-db.ts`, `lib/prisma.ts`
- ✅ Migration scripts in `scripts/`
- ✅ Integration adapters
- ❌ UI components
- ❌ Direct production writes without backup + transaction

**Prompt Pattern:**

```
DB/API TASK — Database or integration work.

GOAL: [What we're building/changing]

CURRENT STATE:
- [What exists today]
- [Relevant schema or API endpoints]

REQUIREMENTS:
1. [Specific changes needed]
2. [Data integrity rules]
3. [Migration safety (if applicable)]

SAFETY REQUIREMENTS:
- Backup before modifying production data
- Wrap writes in transactions (BEGIN/COMMIT/ROLLBACK)
- Read-only verification before any writes
- Idempotent where possible
- Add CLI flag --confirm for destructive operations

FILES TO CREATE/MODIFY:
- [Specific files]

DO NOT:
- Skip backups
- Run writes without explicit user confirmation
- Bypass existing connection pools
- Hardcode credentials
```

---

### 🐕 Gopher

**Role:** Repetitive tasks, content updates, copy changes, small fixes.

**When to use:**

- Updating copy/text across pages
- Renaming labels
- Adding/removing menu items
- Fixing typos
- Updating links
- Small style tweaks
- Adding meta tags / SEO basics

**Boundaries:**

- ✅ Text content changes
- ✅ Small CSS adjustments
- ✅ Configuration updates
- ❌ Logic changes
- ❌ New features
- ❌ Anything requiring decision-making

**Prompt Pattern:**

```
GOPHER TASK — Simple content/config update.

CHANGES:
1. [Specific change 1]
2. [Specific change 2]
3. [Specific change 3]

FILES:
- [Exact files to touch]

EXACT TEXT:
- Find: "[old text]"
  Replace: "[new text]"

DO NOT:
- Refactor surrounding code
- "Improve" things beyond what was asked
- Add new features
- Change anything not listed
```

---

### 🔐 Security Reviewer

**Role:** Audits code for security issues. Doesn't write features.

**When to use:**

- Before deploying authentication changes
- After any auth/permissions work
- When dealing with PII or sensitive data
- Reviewing public endpoints
- Pre-launch checks

**Boundaries:**

- ✅ Read all code
- ✅ Suggest fixes
- ✅ Identify risks
- ❌ Make changes (hands off to other agents)
- ❌ Disable security in the name of convenience

**Prompt Pattern:**

```
SECURITY REVIEW — Audit-only task.

SCOPE: [What to review]

CHECK FOR:
1. Authentication bypass possibilities
2. Authorization gaps (does the right role see the right thing?)
3. Input validation issues
4. SQL injection vectors
5. XSS surfaces
6. Exposed secrets in code or logs
7. Rate limiting gaps
8. CSRF protection
9. Dependency vulnerabilities

OUTPUT:
- Risk level for each finding (🔴 Critical / 🟡 Medium / 🟢 Low)
- Specific line numbers
- Recommended fix (but don't implement)

DO NOT:
- Make changes
- Skip findings to "save time"
```

---

### 📋 Reviewer

**Role:** Final check before deploying. Catches what others missed.

**When to use:**

- After feature completion
- Before merging to main
- After multiple agents have worked on something
- Pre-deployment

**Boundaries:**

- ✅ Review everything
- ✅ Run tests
- ✅ Verify against requirements
- ❌ Implement fixes (kick back to original agent)

**Prompt Pattern:**

```
REVIEW TASK — Final pre-deployment check.

WHAT WAS BUILT:
[Summary of recent work]

REVIEW CHECKLIST:
- [ ] Functionality matches requirements
- [ ] No console errors
- [ ] Mobile responsive
- [ ] No unverified claims in copy
- [ ] No hardcoded credentials
- [ ] Error states handled
- [ ] Loading states present
- [ ] Accessibility basics (alt text, keyboard nav)
- [ ] Reference claude-skills.md standards

OUTPUT:
- ✅ Ready to ship
- ⚠️ Issues that need fixing (kick to appropriate agent)
- ❌ Blockers (must fix before deployment)
```

---

## 🎯 AGENT SELECTION GUIDE

When Jerry brings a task, Director (Claude) picks the right agent(s):


| Jerry Says...                        | Lead Agent                          | Notes                            |
| ------------------------------------ | ----------------------------------- | -------------------------------- |
| "Is X working?"                      | 🔍 Investigator                     | Always investigate before fixing |
| "Update the copy on..."              | 🐕 Gopher                           | Simple content changes           |
| "Build a calculator..."              | ⚙️ Backend + 🎨 UI Guy              | Combo task                       |
| "Why aren't reps showing audiences?" | 🔍 Investigator → 🗄️ DB Specialist | Find first, then fix             |
| "Make it look better"                | 🎨 UI Guy                           | UI work                          |
| "Add a new API endpoint"             | ⚙️ Backend Guy                      | Server-side                      |
| "Migrate data from MySQL"            | 🗄️ DB Specialist                   | Data work                        |
| "Are we secure?"                     | 🔐 Security Reviewer                | Audit                            |
| "Ready to deploy?"                   | 📋 Reviewer                         | Pre-deploy check                 |
| "Change the label from X to Y"       | 🐕 Gopher                           | Simple swap                      |
| "Fix the broken page"                | 🔍 Investigator → appropriate fixer | Diagnose first                   |


---

## 🔄 STANDARD WORKFLOW

For any non-trivial task:

1. **Director (Claude):** Understands the goal
2. **Investigator:** Reports current state (read-only)
3. **Director:** Plans the fix based on findings
4. **Specialist Agent:** Implements (UI Guy, Backend Guy, DB Specialist, etc.)
5. **Reviewer:** Final check
6. **Director:** Confirms with Jerry and hands off

**For destructive operations** (production DB writes, deletions, etc.):

- Always backup first
- Always require `--confirm` flag
- Always print rollback instructions
- Always run in transaction where possible

---

## 📚 EMAIL MARKETING SYSTEM (vcard_*)

### The Architecture

**Postgres is the source of truth.** No code reads from JSON files.

```
Postgres (Render)              Mailchimp (us17)
─────────────────              ────────────────
vcard_employees                Audiences (Lists)
├── mailchimp_audience_id ───→ 10-char hex ID
├── email                      Subscribers
├── first_name                 Campaigns  
└── ...                        Templates
                              
vcard_email_templates          
└── 4 default categories       
                              
vcard_email_campaigns          
└── Campaign log               
```

### Key Tables

`**vcard_employees**` — Rep roster (source of truth for who gets what audience)

- `mailchimp_audience_id` — The pointer to Mailchimp list
- `email` — Used for matching
- `active`, `website_active` — Visibility flags

`**vcard_email_templates**` — Email designer templates

- 4 system defaults: product, title_news, market_update, holidays
- Custom templates created via admin UI

`**vcard_email_campaigns**` — Campaign send history

### Critical Rules

- **Never read from `data/legacy-core-system/sales_reps_data.json` in production code**
- That folder is reference material only
- Always update `vcard_employees.mailchimp_audience_id` for audience changes
- Mailchimp is the source of truth for audience contents, but Postgres holds the pointer

### Team Audiences

Some audiences belong to teams, not individuals:


| Team                    | Audience ID | Members                    |
| ----------------------- | ----------- | -------------------------- |
| Lopez Team (Title Boss) | cea2911e34  | Hugo, Izzy, Jesse Lopez    |
| TMG Team                | 545f3afd67  | Jorge Mesa, Anthony Zamora |
| Title Gals              | 0cae582d6c  | Janelly Marquez            |


For now, team audiences are assigned to a designated team lead's row. Future enhancement: proper team structure with `team_id` column.

### Available Merge Tags

- `{{REP_NAME}}` — Rep's full name
- `{{REP_TITLE}}` — Job title
- `{{REP_EMAIL}}` — Email address
- `{{REP_PHONE}}` — Phone number
- `{{REP_PHOTO}}` — Photo URL
- `{{HERO_IMAGE}}` — Per-campaign hero image (substituted client-side)

**Retired tags (do not use):**

- ~~`{{REP_URL}}`~~ — Pointed to retired `/team/<slug>` page

---

## 🚨 CRITICAL RULES (Never Break These)

### 1. No Unverified Claims

**NEVER make factual claims we cannot back up.** This is non-negotiable.

❌ **NEVER SAY:**

- "Industry-standard encryption"
- "Bank-level security"
- "Regular security audits"
- "WCAG 2.1 Level AA compliant"
- "Section 508 compliant"
- "SOC 2 certified"
- "ISO 27001 certified"
- "We respond within X hours/days"
- "24/7 customer support"
- "100% guarantee"
- "Award-winning" (unless we have a specific award to name)
- "#1 in California" or similar superlatives
- Specific employee counts unless verified
- Specific transaction volumes unless verified
- "Decades of experience" (we were founded in 2005)
- "Largest" or "biggest" anything

✅ **USE INSTEAD:**

- "We work to protect..."
- "We aim to..."
- "We strive to..."
- "Where reasonable..."
- "Our goal is to..."
- "We're committed to..."

### 2. Verified Company Facts (Safe to Use)

These facts are VERIFIED and can be stated factually:

- **Founded:** 2005
- **Headquarters:** Orange, CA
- **Corporate Address:** 1111 E. Katella Ave. Ste. 120, Orange, CA 92867
- **Main Phone:** (714) 516-6700 / (866) 724-1050
- **Locations:** Orange (HQ), Downey, Glendale, Inland Empire (Ontario), San Diego
- **Service Area:** California (primarily Southern California)
- **TSG Division Coverage:** Arizona, California, Nevada
- **Services:** Title insurance, escrow settlement, commercial title, 1031 exchange, TSG/REO

### 3. Never Reproduce Copyrighted Material

- No song lyrics, poems, or copyrighted text reproduction
- Quotes from external sources: max 15 words, in quotation marks, properly attributed
- Don't copy competitor website language

### 4. Customer Data & Privacy

- Never collect, store, or display sensitive customer data in code examples
- No SSNs, full credit card numbers, bank account numbers in any UI
- Privacy Policy must reflect ACTUAL practices, not aspirational ones

### 5. Production Data Safety

- **No writes to production without explicit `--confirm` flag**
- **Backup before any destructive operation**
- **Read-only operations are always preferred when possible**
- **Use Render MCP `query_render_postgres` for investigation (it's read-only)**

---

## 🎨 BRAND STANDARDS

### Color Palette

```css
/* Primary Colors */
--pct-navy: #003d79;        /* Primary brand color */
--pct-orange: #f26b2b;      /* Accent color */
--pct-white: #ffffff;

/* Neutrals */
--pct-cream: #faf8f5;       /* Warm background */
--pct-gray-50: #f8f9fa;
--pct-gray-100: #f1f5f9;
--pct-gray-600: #4b5563;
--pct-gray-900: #1f2937;

/* Functional */
--pct-success: #059669;
--pct-warning: #d97706;
--pct-danger: #dc2626;
--pct-info: #2563eb;
```

### Typography

- **Headings:** Strong but not aggressive weights (semibold, not black)
- **Body:** Comfortable line heights (1.6-1.7)
- **Generous whitespace** — let content breathe

### Visual Style

- Subtle shadows over hard edges
- Rounded corners (but professional, not playful)
- Wave/curve design motifs (from original PCT design)
- Professional and confident, not loud or flashy

### Tone of Voice

- **Confident but not arrogant**
- **Reassuring** — "you're in good hands"
- **Customer-focused** — "Don't tell me about your fertilizer, tell me about my grass"
- **Professional but approachable**

❌ Avoid: Hype, jargon, superlatives, startup energy
✅ Use: Clear, calm, dependable language

---

## 📝 COPYWRITING PRINCIPLES

### Customer-Benefit Focus

Always reframe company features as customer benefits.

❌ **Company-focused (Wrong):**

- "We provide title and escrow services"
- "Our team has experience"
- "We use modern technology"

✅ **Customer-focused (Right):**

- "Close with confidence"
- "Your transaction, protected from day one"
- "Get to the closing table without the headaches"

### Audience-Specific Messaging

**For Real Estate Agents:**

- Will this make me look good to my client?
- Can I rely on this team?
- Tools that help my business

**For Buyers/Sellers:**

- Is my money safe?
- Will this close on time?
- Do they understand my situation?

**For Lenders:**

- Will this be smooth and compliant?
- Can they handle volume?
- Are they technology-friendly?

---

## 🏢 INDUSTRY-SPECIFIC TERMINOLOGY

### Title Insurance

- **Owner's Policy** — Protects the buyer
- **Lender's Policy** — Protects the lender
- **Preliminary Report** (Prelim) — Initial title search results
- **Title Search** — Examination of public records
- **Closing** / **Settlement** — Final transaction
- **ALTA** — American Land Title Association
- **CLTA** — California Land Title Association
- **Endorsement** — Add-on to title policy

### Escrow

- **Escrow Holder** — Neutral third party
- **Escrow Instructions** — Written transaction directions
- **Closing** — When escrow completes
- **Disbursement** — Distribution of funds
- **Proration** — Adjustment of charges

### Common Acronyms

- **TSG** — Trustee Sale Guarantee
- **REO** — Real Estate Owned (post-foreclosure)
- **CFPB** — Consumer Financial Protection Bureau
- **HOA** — Homeowners Association
- **CC&R** — Covenants, Conditions & Restrictions
- **SB2** — Senate Bill 2 (Building Homes and Jobs Act)
- **CLUP** — Closing Letter and Underwriting Position

### Always Capitalize

- Title (when referring to legal ownership)
- Escrow (in formal contexts)
- Pacific Coast Title Company (full name)
- TESSA (always all caps)

---

## 🔌 INTEGRATIONS & EXTERNAL SYSTEMS

### Current Integrations

- **TESSA AI** — Chat assistant via tessa-proxy.onrender.com
- **Render PostgreSQL** — Main application database
- **Vercel** — Hosting platform
- **Mailchimp** — Email campaigns (us17 datacenter)
- **Twilio** — SMS/MMS (via Render Flask relay)
- **SendGrid** — Transactional emails (farm-request notifications)
- **Cloudflare R2** — Image storage
- **SoftPro** — Title production software (FNF)
- **PCT247.com** — Customer portal

### MCP Access

- **Render MCP** (`query_render_postgres`) — Read-only Postgres access
  - Database ID: `dpg-d5nueanpm1nc73aueaj0-a`
  - Use for: All investigation queries
  - Cannot: Write to database (by design)
- **Other Render MCPs** — `plugin-render-render`, `user-render-pct`, `user-render-personal`

### External Tool Links

- Pacific Coast Agent: pacificcoastagent.com
- PCT Title Toolbox: pcttitletoolbox.com
- TitlePro 247: titlepro247.com
- PCT247: pct247.com
- Equity Protect: equityprotect.com/title/pacificcoast

### Editor

- TinyMCE (paid version) — use for all rich text editing
- API key: `NEXT_PUBLIC_TINYMCE_API_KEY` in env
- Do NOT use community edition or other rich text editors

---

## 📋 CONTENT STRUCTURE STANDARDS

### Page Requirements

Every public page must have:

- ✅ Unique H1 (only one per page)
- ✅ Meta description
- ✅ Proper page title
- ✅ Mobile responsive
- ✅ Accessible navigation
- ✅ Footer with legal links

### Component Standards

- Use shadcn/ui components where possible
- Tailwind for styling
- Lucide icons (consistent icon library)
- TypeScript for all components
- Server components by default, "use client" only when needed

### File Organization

```
app/
├── (public pages)
├── admin/ (admin panel)
├── api/ (API routes)
└── layout.tsx

components/
├── ui/ (shadcn components)
├── admin/ (admin-specific)
├── calculator/ (rate calculator)
├── tessa/ (TESSA chat widget)
├── legal/ (privacy, terms, accessibility)
└── layout/ (header, footer, etc.)

lib/
├── prisma.ts
├── auth.ts
├── admin-auth.ts
├── admin-db.ts
├── vcard-db.ts
├── calculator.ts
└── utils.ts

scripts/
├── verify-*.ts (read-only verification)
└── migrate-*.ts (write operations with --confirm guard)

data/
└── legacy-core-system/ (REFERENCE ONLY - never read in production)
```

---

## ⚖️ LEGAL & COMPLIANCE STANDARDS

### Pages That Need Legal Review

Any of these pages require legal counsel review before being considered final:

- Privacy Policy
- Terms of Service
- Accessibility Statement
- Any disclaimers
- Customer agreements
- Rate calculator disclaimers
- AI/TESSA disclaimers

### Required Disclaimers

**Rate Calculator:**
"Rate calculator provides estimates only. Actual rates and fees are subject to final terms of specific agreements."

**TESSA AI Assistant:**
"TESSA provides general information only and does not constitute legal, financial, or professional advice. Please consult with qualified professionals for your specific situation."

**Tools & Forms:**
"Forms and tools provided for convenience. Consult with legal counsel for your specific situation."

### Compliance Considerations

- **FinCEN** — Anti-Money Laundering rules effective March 1, 2026
- **SB2** — California recording fees
- **CCPA** — California Consumer Privacy Act
- **WCAG** — Don't claim compliance unless audited
- **California Insurance Code** — Title insurance regulations

---

## ✅ PRE-DEPLOYMENT CHECKLIST

Before any feature ships to production:

- No unverified claims in copy
- All links work (no 404s)
- Mobile responsive
- Brand colors used correctly
- Customer-benefit focused copy
- Legal disclaimers where needed
- No sensitive data in code
- TypeScript types defined
- No console errors
- Accessibility basics (alt text, keyboard nav)
- Print stylesheet considered (for legal/forms pages)
- If DB writes: backup created, transactions used, rollback documented

---

## 🚫 THINGS WE DON'T DO

- We don't make claims we can't verify
- We don't reproduce competitor copy
- We don't use stock photo clichés (handshakes, keys, sold signs)
- We don't use startup/Web3 buzzwords
- We don't make legal/financial recommendations through tools
- We don't store sensitive customer data unnecessarily
- We don't make promises we can't keep
- We don't use "we're the best" superlatives
- We don't write to production DB without --confirm flag
- We don't read from `data/legacy-core-system/` in production code
- We don't skip the Investigator step before fixing bugs

---

## 📞 KEY CONTACTS

**Director of Product Development:** Jerry Hernandez ([jhernandez@pct.com](mailto:jhernandez@pct.com))
**Super Admin:** Rudy ([rudy@pct.com](mailto:rudy@pct.com))
**Super Admin:** Brandon Heethuis ([bheethuis@pct.com](mailto:bheethuis@pct.com))
**General Info:** [info@pct.com](mailto:info@pct.com)
**Main Phone:** (714) 516-6700

---

## 🔄 REVISION HISTORY


| Date       | Changes                                                                  | Author                     |
| ---------- | ------------------------------------------------------------------------ | -------------------------- |
| 2026-05-20 | Initial version with brand standards and content rules                   | Jerry Hernandez via Claude |
| 2026-05-20 | Added agent roles, email marketing system architecture, MCP access notes | Jerry Hernandez via Claude |
| 2026-05-22 | Archived legacy docs to _archive/; established /docs/system/ (7 living docs) | Documentation Agent        |


---

## 📌 QUICK REFERENCE CARD

**Safe to claim:**

- Founded in 2005 ✅
- 5 California locations ✅
- TSG covers AZ/CA/NV ✅
- Underwritten by major insurers ✅ (generic)

**Never claim without verification:**

- Specific compliance certifications ❌
- Specific response times ❌
- Security audit frequencies ❌
- "Industry-leading" anything ❌
- Specific transaction volumes ❌
- Employee counts ❌

**Default tone:**
"We work to..." > "We do..."
"We aim to..." > "We will..."
"Where reasonable..." > "Always..."

**Agent selection:**

- Read-only investigation? 🔍 Investigator
- Frontend work? 🎨 UI Guy
- API routes? ⚙️ Backend Guy
- Database/integrations? 🗄️ DB Specialist
- Quick text update? 🐕 Gopher
- Security check? 🔐 Security Reviewer
- Pre-deploy? 📋 Reviewer

```
ADD TO docs/claude-skills/claude-skills.md (new section after CRITICAL RULES):

## 🔐 CREDENTIAL MANAGEMENT (Non-Negotiable)

### The Rule
**Credentials NEVER appear in chat, terminal history, or git.**

### Where Credentials Live
- `.env.local` (gitignored, local development)
- Vercel Environment Variables (production)
- Render Dashboard (database credentials)
- Mailchimp Dashboard (API keys)

### Required Env Vars
Every developer machine needs `.env.local` at project root:
```

## Database

DATABASE_URL=postgres://...

## Mailchimp

MAILCHIMP_API_KEY=... MAILCHIMP_SERVER=us17

## Authentication

NEXTAUTH_SECRET=... NEXTAUTH_URL=[https://www.pct.com](https://www.pct.com) (or localhost:3000 for dev)

## SendGrid (transactional emails)

SENDGRID_API_KEY=...

## Cloudflare R2

R2_ACCOUNT_ID=... R2_BUCKET_NAME=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... R2_PUBLIC_URL=...

## Twilio (via Render relay)

RENDER_API_URL=[https://main-website-files.onrender.com](https://main-website-files.onrender.com) RENDER_API_KEY=...

## Site

NEXT_PUBLIC_SITE_URL=[https://www.pct.com](https://www.pct.com)

```

### How Cursor Gets Them
- Cursor reads from `.env.local` automatically when running scripts
- Never pastes credentials into chat
- Never sets them in shell session (they'd appear in history)

### Pulling From Vercel
To sync local with production:
```

vercel env pull .env.local

```
This requires Vercel CLI installed and project linked.

### Rotation Policy
- Database password: rotate immediately if exposed
- API keys: rotate annually or on team changes
- After rotation: update Vercel + local .env.local
```

---

**When in doubt: Be less specific, not more. Conservative language protects us legally and matches our calm, confident brand voice.**