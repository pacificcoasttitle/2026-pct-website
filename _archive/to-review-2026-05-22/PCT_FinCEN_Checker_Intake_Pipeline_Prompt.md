# FinCEN Quick Checker → Intake Form Pipeline

> **Cursor Prompt — Build Spec for PCT Website**
> Target: Next.js site at `2026-pct-website` (Vercel)
> Date: February 23, 2026

---

## Context

Pacific Coast Title (PCT) is launching a FinCEN Reporting Division on March 1, 2026. New federal rules require certain real estate transactions to be reported to FinCEN (Financial Crimes Enforcement Network).

**The user flow:**
1. Escrow officer receives an **Open Order Confirmation email** from PCT
2. The email includes a brief checklist of FinCEN reporting criteria
3. If any criteria might apply, the officer clicks a link that takes them to the **Quick Checker** on the PCT website
4. The Quick Checker asks 3 yes/no questions to determine if the transaction is likely reportable
5. If **Likely Reportable** → the officer is guided directly into an **Intake Form** to collect transaction details
6. If **Likely Not Reportable** → green confirmation with reminder to confirm with escrow
7. Completed intake submissions are **emailed to fincen@pct.com** AND **stored in a database** for tracking

**The existing Quick Checker** lives at `/fincen/is-it-reportable` and already works (3 questions, red/green result). We are extending it to flow into a multi-step intake form when the result is "Likely Reportable."

---

## Architecture Overview

```
Open Order Confirmation Email
    │
    ▼
/fincen/is-it-reportable (Quick Checker)
    │
    ├── Likely NOT Reportable → Green result + "Confirm with escrow" message
    │
    └── Likely Reportable → Red result + "Continue to Intake Form" button
                                │
                                ▼
                    /fincen/intake (Multi-Step Intake Form)
                        │
                        ├── Step 1: Transaction Details
                        ├── Step 2: Buyer Information
                        ├── Step 3: Seller Information
                        └── Step 4: Review & Submit
                                │
                                ▼
                        POST /api/fincen/intake
                            │
                            ├── Store in database (Supabase/Postgres)
                            ├── Send email notification to fincen@pct.com
                            ├── Send confirmation email to submitter
                            └── Return success with reference number
```

---

## Page 1: Quick Checker (UPDATE existing page)

**Route:** `/fincen/is-it-reportable`

### Current behavior (keep):
- 3 yes/no questions (residential? non-financed/no AML? entity/trust buyer?)
- Green result for "Likely Not Reportable"
- Red result for "Likely Reportable"

### Changes needed:

**When result is "Likely Reportable":**
- Replace the current "Talk to an Escrow Officer" button with a primary CTA:
  - **"Continue — Start FinCEN Intake Form"** → navigates to `/fincen/intake`
- Pass the checker answers as URL params or state so the intake form knows:
  - `?residential=yes&financing=cash&buyerType=entity`
  - This pre-populates relevant intake fields and avoids re-asking questions
- Add secondary link: "Or call us: (866) 724-1050"

**When result is "Likely Not Reportable":**
- Keep green confirmation
- Add small link: "Think this might be wrong? Start the intake form anyway" → `/fincen/intake`
- Keep disclaimer about confirming with escrow

---

## Page 2: Intake Form (NEW page)

**Route:** `/fincen/intake`

### Design Requirements
- Clean, professional, PCT branding (navy #1E2761, gold #D4A843)
- Multi-step wizard with progress indicator (Step 1 of 4, Step 2 of 4, etc.)
- Mobile responsive — escrow officers may use phones
- Each step has a "Back" and "Next" button
- Form state persists across steps (React state, no page reloads)
- Final step is Review → Submit
- All fields should have clear labels and helper text where needed
- Required fields clearly marked with asterisk
- Validation on each step before allowing "Next"

### Step 1: Transaction Details

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Escrow Officer Name | text | Yes | Person submitting |
| Escrow Officer Email | email | Yes | For confirmation email |
| Escrow Officer Phone | tel | No | |
| PCT Branch / Office | text | Yes | Which PCT office |
| Escrow Number / File Number | text | Yes | Internal reference |
| Property Address | text | Yes | Street address |
| Property City | text | Yes | |
| Property State | select | Yes | Default to California |
| Property ZIP | text | Yes | 5-digit |
| Property County | text | No | |
| Property Type | select | Yes | Options: Single Family, Condo/Townhome, 2-4 Unit, Co-op, Vacant Land (Residential), Other |
| Estimated Closing Date | date | Yes | |
| Purchase Price | currency | Yes | Dollar amount |

### Step 2: Buyer Information

Display logic note: If the checker passed `buyerType=entity`, default the buyer type to "Entity/Trust". If coming directly to the form without checker, ask the question.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Buyer Type | select | Yes | Options: Individual, LLC, Corporation, Partnership, Trust, Other Entity |
| **If Individual:** | | | |
| → First Name | text | Yes | |
| → Middle Name | text | No | |
| → Last Name | text | Yes | |
| → Date of Birth | date | Yes | |
| → SSN or ITIN | text | Conditional | Show note: "Will be collected securely by PCT staff if needed" — do NOT collect SSN on this form. Instead show: "PCT will contact the buyer directly to collect identification." |
| → Buyer Address | text | Yes | Street, City, State, ZIP |
| → Buyer Phone | tel | No | |
| → Buyer Email | email | No | |
| **If Entity (LLC/Corp/Partnership/Other):** | | | |
| → Entity Legal Name | text | Yes | |
| → Entity Type | select | Yes | LLC, Corporation, Partnership, Other |
| → State of Formation | select | Yes | |
| → EIN | text | No | Show note: "If not available, PCT will request directly" |
| → Entity Address | text | Yes | Street, City, State, ZIP |
| → Entity Contact Name | text | Yes | Primary contact at the entity |
| → Entity Contact Phone | tel | No | |
| → Entity Contact Email | email | No | |
| → Beneficial Owners Known? | radio | Yes | Yes / No / Not Sure |
| → If Yes: How many? | number | Conditional | |
| → BO Names (if known) | textarea | No | "List names of anyone with 25%+ ownership or control. PCT will collect full details directly." |
| **If Trust:** | | | |
| → Trust Name | text | Yes | |
| → Trust Type | select | No | Revocable, Irrevocable, Other |
| → Trustee Name | text | Yes | |
| → Trustee Phone | tel | No | |
| → Trustee Email | email | No | |
| → Trust Address | text | Yes | Street, City, State, ZIP |
| → Settlor/Grantor Name | text | No | |
| → Trust EIN | text | No | |

**IMPORTANT — SENSITIVE DATA POLICY:**
- Do **NOT** collect SSNs, passport numbers, or full TINs on this web form
- Show a clear note wherever ID would normally be needed: _"For security, Pacific Coast Title will collect identification information directly from the parties involved."_
- This form collects enough to start the file; PCT staff follows up for sensitive data through secure channels

### Step 3: Seller Information

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Number of Sellers | number | Yes | Default 1, max 4 on form (note: "If more than 4 sellers, PCT will collect additional details") |
| **Per Seller (repeat block):** | | | |
| → Seller Type | select | Yes | Individual, Entity, Trust |
| → If Individual: First Name, Last Name | text | Yes | |
| → If Entity: Entity Name | text | Yes | |
| → If Trust: Trust Name, Trustee Name | text | Yes | |
| → Seller Address | text | No | Street, City, State, ZIP |
| → Seller Phone | tel | No | |
| → Seller Email | email | No | |

Keep seller collection simpler than buyer — FinCEN reporting focuses on the buyer side. Seller info is supplementary.

**NOTE: No payment/financing step.** PCT staff collects payment details, financial institution info, and AML status directly during the filing process. This intake form focuses on identifying the transaction and collecting party contact information so PCT can reach them.

### Step 4: Review & Submit

- Display all entered data in a clean, organized summary (read-only)
- Group by section: Transaction, Buyer, Seller(s)
- "Edit" link next to each section header to jump back to that step
- Checkbox (required): "I confirm the information provided is accurate to the best of my knowledge. I understand this is not a final filing — Pacific Coast Title will verify all details and contact parties as needed."
- **Submit button**: "Submit to FinCEN Reporting Desk"
- On submit: show loading spinner, then success screen

### Success Screen

After successful submission, show:

```
✅ Submission Received

Reference Number: PCT-FINCEN-2026-XXXX

Your submission has been received by the Pacific Coast Title FinCEN Reporting Desk.

What happens next:
1. A compliance coordinator will review your submission within 1 business day
2. We will contact the buyer and seller directly for any additional information needed
3. You will receive updates at [officer email] as the filing progresses

Questions?
Email: fincen@pct.com
Phone: (866) 724-1050

[Submit Another Transaction]  [Return to PCT Home]
```

---

## Pre-Fill via URL Parameters (Order Confirmation Deep Link)

PCT's open order confirmation emails already contain transaction details (escrow number, property address, etc.). Instead of making the officer re-type this info, embed it in the Quick Checker link as URL parameters. The system parses them and pre-fills the intake form automatically.

### URL Format

```
https://pacificcoasttitle.com/fincen/is-it-reportable
  ?escrow=ESC-2026-1234
  &street=123+Main+St
  &city=Los+Angeles
  &state=CA
  &zip=90001
  &county=Los+Angeles
  &price=1250000
  &closing=2026-03-15
  &officer=Jennifer+Walsh
  &email=jennifer@example.com
  &branch=Irvine
  &proptype=single_family
```

### Supported Parameters

| Param | Maps To | Example |
|-------|---------|---------|
| `escrow` | Escrow Number / File Number | `ESC-2026-1234` |
| `street` | Property Street Address | `123 Main St` |
| `city` | Property City | `Los Angeles` |
| `state` | Property State | `CA` |
| `zip` | Property ZIP | `90001` |
| `county` | Property County | `Los Angeles` |
| `price` | Purchase Price (whole dollars) | `1250000` |
| `closing` | Estimated Closing Date (YYYY-MM-DD) | `2026-03-15` |
| `officer` | Escrow Officer Name | `Jennifer Walsh` |
| `email` | Escrow Officer Email | `jennifer@example.com` |
| `phone` | Escrow Officer Phone | `5551234567` |
| `branch` | PCT Branch / Office | `Irvine` |
| `proptype` | Property Type | `single_family` |

### Implementation

**On the Quick Checker page (`/fincen/is-it-reportable`):**

```typescript
"use client";
import { useSearchParams } from "next/navigation";

export default function QuickChecker() {
  const searchParams = useSearchParams();

  // Parse all pre-fill params into an object
  const prefill = {
    escrow_number: searchParams.get("escrow") || "",
    property_address: {
      street: searchParams.get("street") || "",
      city: searchParams.get("city") || "",
      state: searchParams.get("state") || "CA",
      zip: searchParams.get("zip") || "",
      county: searchParams.get("county") || "",
    },
    purchase_price: searchParams.get("price") ? Number(searchParams.get("price")) : null,
    estimated_closing_date: searchParams.get("closing") || "",
    officer_name: searchParams.get("officer") || "",
    officer_email: searchParams.get("email") || "",
    officer_phone: searchParams.get("phone") || "",
    branch_office: searchParams.get("branch") || "",
    property_type: searchParams.get("proptype") || "",
  };

  // When "Likely Reportable" → navigate to intake with prefill in state
  function handleContinueToIntake() {
    // Option A: Pass via URL params (simpler, works if user refreshes)
    const params = new URLSearchParams();
    Object.entries(flattenPrefill(prefill)).forEach(([k, v]) => {
      if (v) params.set(k, String(v));
    });
    router.push(`/fincen/intake?${params.toString()}`);

    // Option B: Pass via sessionStorage (cleaner URL, but lost on refresh)
    // sessionStorage.setItem("fincen_prefill", JSON.stringify(prefill));
    // router.push("/fincen/intake");
  }
}
```

**On the Intake Form page (`/fincen/intake`):**

```typescript
"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function IntakeForm() {
  const searchParams = useSearchParams();

  // Initialize form state from URL params (pre-filled) or empty
  const [formData, setFormData] = useState({
    officer_name: searchParams.get("officer") || "",
    officer_email: searchParams.get("email") || "",
    officer_phone: searchParams.get("phone") || "",
    branch_office: searchParams.get("branch") || "",
    escrow_number: searchParams.get("escrow") || "",
    property_address: {
      street: searchParams.get("street") || "",
      city: searchParams.get("city") || "",
      state: searchParams.get("state") || "CA",
      zip: searchParams.get("zip") || "",
      county: searchParams.get("county") || "",
    },
    property_type: searchParams.get("proptype") || "",
    estimated_closing_date: searchParams.get("closing") || "",
    purchase_price: searchParams.get("price") || "",
    // ... remaining fields start empty
  });

  // Show "pre-filled from your order" badge on populated fields
  const isPrefilled = (field: string) => searchParams.has(field);

  return (
    // Step 1 renders with fields already populated
    // Show subtle badge: "✓ Pre-filled from your order" on populated fields
    // Officer can still edit any pre-filled value
  );
}
```

### UX Details

- **Pre-filled fields show a subtle badge:** A small green "✓ Pre-filled from order" indicator next to fields that were populated from URL params. This builds confidence that the system is connected to their actual transaction.
- **All pre-filled fields are editable.** The officer can correct anything.
- **If no URL params are present**, the form starts blank — works for direct access too.
- **Step 1 may be mostly complete** if the email link included all params. Officer just verifies and clicks "Next" — takes 10 seconds instead of 2 minutes.
- **Price formatting:** The URL passes cents-free whole dollars (`1250000`). The form displays it formatted (`$1,250,000`) and lets the officer edit.

### Updated Email Snippet

Replace the original open order confirmation HTML snippet with this version that includes the pre-fill params:

```html
<!-- FinCEN Reporting Checklist — Open Order Confirmation Email -->
<!-- PCT email system: replace {{variables}} with order data -->
<div style="border: 2px solid #D4A843; border-radius: 8px; padding: 20px; margin: 20px 0; background: #F8F6F0;">
  <h3 style="color: #1E2761; margin-top: 0;">⚠️ FinCEN Reporting — Quick Check</h3>
  <p style="color: #475569; font-size: 14px;">
    Effective March 1, 2026, certain transactions must be reported to FinCEN.
    Does this transaction meet <strong>any</strong> of the following?
  </p>
  <ul style="color: #475569; font-size: 14px;">
    <li>Purchase price of <strong>$300,000 or more</strong></li>
    <li>All-cash, wire, or non-traditional financing (no AML-regulated lender)</li>
    <li>Buyer is a <strong>legal entity or trust</strong> (LLC, Corp, Partnership, Trust)</li>
  </ul>
  <p style="color: #475569; font-size: 14px;">
    <strong>If none apply:</strong> No action needed.<br>
    <strong>If any apply:</strong> Click below to check and start the intake process.
  </p>
  <a href="https://pacificcoasttitle.com/fincen/is-it-reportable?escrow={{ESCROW_NUMBER}}&street={{PROPERTY_STREET}}&city={{PROPERTY_CITY}}&state={{PROPERTY_STATE}}&zip={{PROPERTY_ZIP}}&county={{PROPERTY_COUNTY}}&price={{PURCHASE_PRICE}}&closing={{CLOSING_DATE}}&officer={{OFFICER_NAME}}&email={{OFFICER_EMAIL}}&branch={{BRANCH_NAME}}"
     style="display: inline-block; background: #1E2761; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
    Check This Transaction →
  </a>
  <p style="color: #999; font-size: 12px; margin-bottom: 0;">
    Questions? Contact the FinCEN Reporting Desk: fincen@pct.com | (866) 724-1050
  </p>
</div>
```

**Template variables** (PCT email system replaces these with real order data):
- `{{ESCROW_NUMBER}}` — the file/escrow number
- `{{PROPERTY_STREET}}`, `{{PROPERTY_CITY}}`, `{{PROPERTY_STATE}}`, `{{PROPERTY_ZIP}}`, `{{PROPERTY_COUNTY}}`
- `{{PURCHASE_PRICE}}` — whole dollars, no commas or dollar sign
- `{{CLOSING_DATE}}` — format: YYYY-MM-DD
- `{{OFFICER_NAME}}`, `{{OFFICER_EMAIL}}` — the assigned escrow officer
- `{{BRANCH_NAME}}` — PCT office name

**Important:** URL-encode values that may contain spaces or special characters. Most email template engines handle this automatically, but verify. Spaces should become `+` or `%20`.

---

## API Endpoint

### POST `/api/fincen/intake`

**Request body:** JSON object with all form fields, structured as:

```typescript
interface FinCENIntakeSubmission {
  // Meta
  reference_number: string;       // Auto-generated: PCT-FINCEN-YYYY-XXXX
  submitted_at: string;           // ISO timestamp
  checker_result: string | null;  // "likely_reportable" | "likely_not_reportable" | null (direct access)
  checker_answers: {              // null if accessed directly
    residential: boolean | null;
    non_financed: boolean | null;
    entity_buyer: boolean | null;
  } | null;

  // Step 1: Transaction
  officer_name: string;
  officer_email: string;
  officer_phone: string | null;
  branch_office: string;
  escrow_number: string;
  property_address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    county: string | null;
  };
  property_type: string;
  estimated_closing_date: string; // YYYY-MM-DD
  purchase_price: number;         // In cents or dollars — be consistent

  // Step 2: Buyer
  buyer_type: "individual" | "llc" | "corporation" | "partnership" | "trust" | "other_entity";
  buyer: {
    // Individual fields
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    date_of_birth?: string;
    // Entity fields
    entity_name?: string;
    entity_type?: string;
    state_of_formation?: string;
    ein?: string;
    contact_name?: string;
    contact_phone?: string;
    contact_email?: string;
    beneficial_owners_known?: "yes" | "no" | "not_sure";
    beneficial_owner_count?: number;
    beneficial_owner_names?: string;
    // Trust fields
    trust_name?: string;
    trust_type?: string;
    trustee_name?: string;
    trustee_phone?: string;
    trustee_email?: string;
    settlor_name?: string;
    trust_ein?: string;
    // Common
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
    phone?: string;
    email?: string;
  };

  // Step 3: Sellers
  sellers: Array<{
    seller_type: "individual" | "entity" | "trust";
    name: string;          // Full name or entity name
    trustee_name?: string; // If trust
    address?: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
    phone?: string;
    email?: string;
  }>;

  // No payment step — PCT staff collects financial details directly

  // Certification
  certified: boolean;
  certified_at: string;
}
```

### API behavior:

1. **Validate** all required fields server-side (don't trust client validation alone)
2. **Generate reference number**: `PCT-FINCEN-{YEAR}-{sequential 4-digit}` (e.g., PCT-FINCEN-2026-0001)
3. **Store in database** — create a `fincen_intake_submissions` table (schema below)
4. **Send notification email** to `fincen@pct.com` with:
   - Subject: `[FinCEN Intake] New Submission — {escrow_number} — {property_address.street}`
   - Body: Formatted summary of all submitted data
   - Reference number prominently displayed
   - Buyer type highlighted (entity/trust/individual)
   - Officer contact info for follow-up
5. **Send confirmation email** to officer at `officer_email` with:
   - Subject: `FinCEN Submission Received — {reference_number}`
   - Body: Confirmation with reference number, summary of what happens next, contact info for questions
6. **Return** `{ success: true, reference_number: "PCT-FINCEN-2026-XXXX" }`

---

## Database Schema

### Table: `fincen_intake_submissions`

```sql
CREATE TABLE fincen_intake_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number VARCHAR(30) UNIQUE NOT NULL,   -- PCT-FINCEN-2026-0001
  status VARCHAR(30) DEFAULT 'new',               -- new, in_review, processing, completed, cancelled

  -- Checker context
  checker_result VARCHAR(30),                      -- likely_reportable, likely_not_reportable, null
  checker_answers JSONB,                           -- {residential, non_financed, entity_buyer}

  -- Officer / Submitter
  officer_name VARCHAR(255) NOT NULL,
  officer_email VARCHAR(255) NOT NULL,
  officer_phone VARCHAR(50),
  branch_office VARCHAR(255) NOT NULL,
  escrow_number VARCHAR(100) NOT NULL,

  -- Transaction
  property_address JSONB NOT NULL,                 -- {street, city, state, zip, county}
  property_type VARCHAR(100) NOT NULL,
  estimated_closing_date DATE NOT NULL,
  purchase_price NUMERIC(12,2) NOT NULL,

  -- Buyer
  buyer_type VARCHAR(50) NOT NULL,
  buyer_data JSONB NOT NULL,                       -- All buyer fields

  -- Sellers
  sellers_data JSONB NOT NULL,                     -- Array of seller objects

  -- No payment columns — PCT staff collects financial details directly

  -- Certification
  certified BOOLEAN NOT NULL DEFAULT false,
  certified_at TIMESTAMPTZ,

  -- Tracking
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by VARCHAR(255),
  notes TEXT,                                      -- Internal notes by PCT staff

  -- Email tracking
  notification_sent_at TIMESTAMPTZ,
  confirmation_sent_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX idx_fincen_intake_status ON fincen_intake_submissions(status);
CREATE INDEX idx_fincen_intake_escrow ON fincen_intake_submissions(escrow_number);
CREATE INDEX idx_fincen_intake_submitted ON fincen_intake_submissions(submitted_at DESC);
CREATE INDEX idx_fincen_intake_officer_email ON fincen_intake_submissions(officer_email);
```

### Reference Number Generation

```typescript
// Get next sequential number for the year
async function generateReferenceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `PCT-FINCEN-${year}-`;

  // Query for highest existing number this year
  const result = await db.query(
    `SELECT reference_number FROM fincen_intake_submissions
     WHERE reference_number LIKE $1
     ORDER BY reference_number DESC LIMIT 1`,
    [`${prefix}%`]
  );

  let next = 1;
  if (result.rows.length > 0) {
    const last = result.rows[0].reference_number;
    const lastNum = parseInt(last.split('-').pop(), 10);
    next = lastNum + 1;
  }

  return `${prefix}${String(next).padStart(4, '0')}`;
}
```

---

## Email Templates

### Notification Email (to fincen@pct.com)

```
Subject: [FinCEN Intake] New Submission — ESC-2026-1234 — 123 Main St, Los Angeles

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 NEW FINCEN INTAKE SUBMISSION
Reference: PCT-FINCEN-2026-0042
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUBMITTED BY
  Officer: Jennifer Walsh
  Email: jennifer@example.com
  Phone: (555) 123-4567
  Branch: PCT — Irvine Office
  Escrow #: ESC-2026-1234

TRANSACTION
  Property: 123 Main St, Los Angeles, CA 90001
  Type: Single Family
  Closing Date: 2026-03-15
  Purchase Price: $1,250,000

BUYER ⚠️ Entity
  Type: LLC
  Name: Sunrise Holdings LLC
  State of Formation: Delaware
  Contact: John Smith (john@sunrise.com)
  Beneficial Owners Known: Yes (2)
  BO Names: John Smith, Jane Smith

SELLER
  Type: Individual
  Name: Robert Johnson
  Phone: (555) 987-6543
  Email: robert@email.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Quick Checker Result: Likely Reportable
Submitted: 2026-02-23 at 2:45 PM PT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Use ⚠️ flags next to Buyer section when entity/trust. This helps the PCT coordinator quickly identify the key triggers and who to contact first.

### Confirmation Email (to officer)

```
Subject: FinCEN Submission Received — PCT-FINCEN-2026-0042

Hi Jennifer,

Your FinCEN intake submission has been received.

Reference Number: PCT-FINCEN-2026-0042
Escrow Number: ESC-2026-1234
Property: 123 Main St, Los Angeles, CA 90001

What happens next:
  1. A compliance coordinator will review your submission within 1 business day
  2. We will contact the buyer and seller directly for any additional information
  3. You will receive updates at this email as the filing progresses

You don't need to do anything else at this time.

Questions?
  Email: fincen@pct.com
  Phone: (866) 724-1050

Thank you,
Pacific Coast Title — FinCEN Reporting Division
```

---

## Admin View (Phase 2 — future)

For now, submissions are tracked via database + email. In a future phase, build an admin dashboard at `/admin/fincen-intake` that shows:

- List of all submissions with filters (status, date range, branch)
- Status workflow: New → In Review → Processing → Completed / Cancelled
- Click into a submission to see full details
- Add internal notes
- Mark as reviewed
- Link to FinClear platform (if/when PCT transitions to their own filing system)

This is NOT needed for March 1 launch. Email + database storage is sufficient for Day 1.

---

## Technical Notes

### Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS — matches existing PCT site
- **Database:** Whatever the PCT site already uses (likely Supabase or Vercel Postgres)
- **Email:** Use existing email service (Resend, SendGrid, or whatever's configured)
- **Hosting:** Vercel (already deployed there)

### Form State Management
- Use React `useState` or `useReducer` for multi-step form state
- Do NOT use localStorage (data is potentially sensitive)
- State lives in memory only — if user closes tab, they start over
- Consider `sessionStorage` only if you need tab-persistence, but clear on submit

### Validation Rules
- Email: standard email regex
- Phone: accept any format, strip to digits for storage
- ZIP: 5 digits
- Purchase price / amounts: positive numbers, no negatives
- Closing date: must be today or future
- Required fields: validate per-step before allowing "Next"
- Final validation on submit (server-side)

### Security
- Rate limit the submit endpoint (e.g., 5 submissions per IP per hour)
- CSRF protection (Next.js handles this with server actions)
- No SSNs, no passport numbers, no full TINs collected on this form — EVER
- Sanitize all text inputs before storage and email rendering
- HTTPS only (Vercel default)

### Accessibility
- All form fields have labels
- Error messages associated with fields via aria-describedby
- Keyboard navigation works through all steps
- Focus management on step transitions (focus first field of new step)

---

## URL Structure Summary

| Route | Purpose |
|-------|---------|
| `/fincen` | FinCEN information landing page |
| `/fincen/is-it-reportable` | Quick Checker (existing, updated) |
| `/fincen/intake` | Intake Form (new) |
| `/fincen/intake/success` | Success / confirmation screen (or inline on same page) |
| `/fincen/contact` | Contact the FinCEN Reporting Desk |
| `/api/fincen/intake` | POST endpoint for form submission |

---

## Open Order Confirmation Email Snippet

This is the text/HTML block that gets added to PCT's existing open order confirmation emails. It's what starts the whole funnel.

```html
<!-- FinCEN Reporting Checklist — Add to Open Order Confirmation Email -->
<div style="border: 2px solid #D4A843; border-radius: 8px; padding: 20px; margin: 20px 0; background: #F8F6F0;">
  <h3 style="color: #1E2761; margin-top: 0;">⚠️ FinCEN Reporting — Quick Check</h3>
  <p style="color: #475569; font-size: 14px;">
    Effective March 1, 2026, certain transactions must be reported to FinCEN.
    Does this transaction meet <strong>any</strong> of the following?
  </p>
  <ul style="color: #475569; font-size: 14px;">
    <li>Purchase price of <strong>$300,000 or more</strong></li>
    <li>All-cash, wire, or non-traditional financing (no AML-regulated lender)</li>
    <li>Buyer is a <strong>legal entity or trust</strong> (LLC, Corp, Partnership, Trust)</li>
  </ul>
  <p style="color: #475569; font-size: 14px;">
    <strong>If none apply:</strong> No action needed.<br>
    <strong>If any apply:</strong> Click below to check and start the intake process.
  </p>
  <a href="https://pacificcoasttitle.com/fincen/is-it-reportable"
     style="display: inline-block; background: #1E2761; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
    Check This Transaction →
  </a>
  <p style="color: #999; font-size: 12px; margin-bottom: 0;">
    Questions? Contact the FinCEN Reporting Desk: fincen@pct.com | (866) 724-1050
  </p>
</div>
```

---

## Deliverables Checklist

- [ ] Update `/fincen/is-it-reportable` — "Likely Reportable" result flows to intake form
- [ ] Build `/fincen/intake` — 4-step multi-step form with validation (Transaction, Buyer, Seller, Review)
- [ ] Build `POST /api/fincen/intake` — server-side validation, DB storage, email sending
- [ ] Create `fincen_intake_submissions` database table
- [ ] Notification email template (to fincen@pct.com)
- [ ] Confirmation email template (to submitter)
- [ ] Success screen with reference number
- [ ] Mobile responsive across all steps
- [ ] Open order confirmation email HTML snippet ready for PCT email system
- [ ] Test: submit form end-to-end, verify DB storage, verify both emails arrive

---

## Timeline

- **Needed by:** March 1, 2026
- **Priority:** P0 — this is the primary intake mechanism for launch day
- **Dependencies:** Email service configured, database access, Vercel deployment

---

*Pacific Coast Title — FinCEN Reporting Division*
