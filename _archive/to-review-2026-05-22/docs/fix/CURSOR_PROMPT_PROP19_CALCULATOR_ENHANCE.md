# Cursor Prompt: Enhance the Prop 19 Calculator

## Context

The current Prop 19 calculator at `/resources/prop-19-calculator` works but only covers the basic scenario. It takes three inputs (assessed value, sale price, replacement price) and computes the tax savings. This is fine for a simple case but misses several important Prop 19 rules that agents and clients need to understand — and that competing title company calculators already handle.

## What the Current Calculator Gets Right

- Basic formula: if new home ≤ sale price → full transfer; if new home > sale price → assessed + difference
- 1.2% estimated tax rate
- Side-by-side comparison (with vs. without Prop 19)
- "Explain My Scenario" plain-English breakdown
- Print button with PCT logo

## What's Missing (Based on BOE Rules)

### 1. The 100% / 105% / 110% Timing Rule

This is the biggest gap. Prop 19's "equal or lesser value" threshold depends on WHEN you buy the replacement relative to when you sell the original:

| Timing | Threshold |
|--------|-----------|
| Replacement bought **BEFORE** selling original | Replacement ≤ 100% of original sale price = full transfer |
| Replacement bought **within 1 year AFTER** selling | Replacement ≤ 105% of original sale price = full transfer |
| Replacement bought **within 2 years AFTER** selling | Replacement ≤ 110% of original sale price = full transfer |

**Impact on the formula:**
```
adjustedSalePrice = salePrice × timingMultiplier (1.00, 1.05, or 1.10)

if (replacementPrice <= adjustedSalePrice) {
  // FULL transfer — no adjustment
  newTaxableValue = assessedValue
} else {
  // PARTIAL transfer — difference added
  newTaxableValue = assessedValue + (replacementPrice - adjustedSalePrice)
}
```

This means a $500K sale with a $520K replacement bought within year 1 results in a FULL transfer (because $520K < $525K which is 105% of $500K) — but the current calculator would show it as a partial transfer with $20K added. That's wrong and misleading for agents.

**Add a 4th input:** A radio group or segmented control:
- "Buying BEFORE selling" (100%)
- "Buying within 1 year AFTER selling" (105%)  ← default
- "Buying within 2 years AFTER selling" (110%)

### 2. Eligibility Qualifier (Add Above the Calculator)

Prop 19 base year transfer is NOT available to everyone. Only:
- Homeowners age 55+
- Severely and permanently disabled persons
- Victims of a Governor-declared wildfire or natural disaster

**Add a simple eligibility check** at the top — NOT a full form, just a quick qualifier:

```
Do you qualify for Prop 19?
○ I am 55 or older
○ I am severely and permanently disabled
○ My home was damaged/destroyed by a declared disaster
○ I'm not sure / I want to explore
```

If they select one of the first three, show a green ✓ "You likely qualify" and proceed to calculator.
If "not sure", show a note: "Prop 19 base year value transfers require the homeowner to be 55+, severely disabled, or a disaster victim. Contact a tax advisor to confirm eligibility."
Let them use the calculator regardless — it's educational.

### 3. Parent-to-Child Transfer Mode (Second Tab or Toggle)

Prop 19 also changed inheritance rules. This is a HUGE deal for agents working with families. Add a second mode:

**Mode 1: Senior/Disabled Transfer** (current calculator, enhanced)
**Mode 2: Parent-Child Inheritance**

Parent-Child rules:
- Family home must have been parent's primary residence
- Child must move in within 1 year and claim homeowner's exemption
- Exclusion is limited to factored base year value + $1,044,586 (current 2025-2027 adjusted amount)
- If market value exceeds that limit, the excess is added to the taxable value

```
Inputs for Parent-Child mode:
- Parent's factored base year value (assessed value)
- Current market value of the home
- Will the child use this as their primary residence? (Y/N)

Formula:
exclusionLimit = assessedValue + 1044586  // $1,044,586 for 2025-2027
if (marketValue <= exclusionLimit) {
  newTaxableValue = assessedValue  // full exclusion
} else {
  newTaxableValue = assessedValue + (marketValue - exclusionLimit)  // partial
}

Without Prop 19 exclusion:
taxableValue = marketValue  // full reassessment
```

If child says "No" to primary residence → show: "Without primary residence use, the property will be fully reassessed to current market value. No Prop 19 exclusion applies."

### 4. Better Results Presentation

Currently shows a basic comparison. Enhance to show:

**Savings Summary Card:**
```
┌──────────────────────────────────────────┐
│  Your Prop 19 Tax Savings                │
│                                          │
│  Annual savings:     $8,400              │
│  Monthly savings:    $700                │
│  10-year savings:    $84,000             │
│  20-year savings:    $168,000            │
│                                          │
│  Without Prop 19:    $12,000/yr          │
│  With Prop 19:       $3,600/yr           │
│                                          │
│  New taxable value:  $300,000            │
│  (vs. $1,000,000 without transfer)       │
└──────────────────────────────────────────┘
```

**Visual bar comparison:**
Show a horizontal stacked bar or two side-by-side bars comparing annual tax amounts. The visual makes the savings visceral — agents can screenshot this for clients.

**Timing impact callout (if applicable):**
If the timing multiplier changes the outcome, show:
"Because you're buying within 1 year after selling, you get the 105% threshold. Your replacement home at $520,000 is within the $525,000 limit — so your FULL assessed value transfers with no adjustment."

### 5. Scenario Explainer Improvements

The existing "Explain My Scenario" button is good. Enhance the output to include:

- Which timing threshold was applied and why
- The exact BOE form they need to file (BOE-19-B for senior/disabled, BOE-19-P for parent-child)
- Filing deadline (within 3 years of replacement purchase)
- County assessor filing note ("File with the assessor in the county where your NEW home is located")
- Link to the BOE website: https://boe.ca.gov/prop19/

### 6. Disclaimer Enhancement

Current disclaimer mentions 1.2% is an estimate. Strengthen it:

"**Important:** This calculator provides estimates based on Proposition 19 rules as of 2025. Actual property tax rates vary by county and Tax Rate Area (typically 1.0%–1.25% base rate plus local assessments). This is not tax or legal advice. Consult with a qualified California tax advisor, your county assessor, or a real estate attorney before making decisions based on these estimates. PCT does not provide tax advice."

### 7. "Share with Client" / Print Improvements

The existing print button is good. Add:
- **Email results** — same SendGrid/Resend pattern used elsewhere
- **Copy link with prefilled values** — encode the inputs as URL params so agents can share a link: `/resources/prop-19-calculator?assessed=300000&sale=900000&replacement=700000&timing=105`
- **PDF download** — formatted one-pager with PCT branding, the scenario breakdown, and the savings summary. Agents hand this to clients at listing appointments.

## Implementation Notes

### Input Formatting
- All dollar inputs should auto-format with commas as the user types ($1,000,000 not 1000000)
- Allow both typed input and a slider for quick exploration
- Default the timing to "Within 1 year after selling" since that's the most common scenario

### URL State
- Store all inputs in URL search params so the page is shareable and bookmarkable
- When the page loads with params, auto-calculate and show results

### Mobile Responsiveness
- The calculator must work perfectly on phones — agents use this at kitchen tables during listing presentations
- Stack inputs vertically on mobile, show results in a scrollable card

### PCT Branding
- Use PCT orange (#f26b2b) for the savings highlight
- Dark blue (#0c2340) for headers
- Keep the same design system as the rest of the new site

## Files to Create/Modify

- `app/resources/prop-19-calculator/page.tsx` — enhanced calculator page
- `components/prop19/Prop19Calculator.tsx` — main calculator component
- `components/prop19/Prop19Results.tsx` — results display with savings card
- `components/prop19/Prop19Explainer.tsx` — scenario explanation
- `components/prop19/Prop19ParentChild.tsx` — parent-child mode
- `lib/prop19/calculations.ts` — all calculation logic (pure functions, testable)

## Competitive Reference

Consumer's Title Company has a Prop 19 calculator at ctccal.com/calc. Look at it for reference but make PCT's better — specifically by including the timing rule (they don't) and the parent-child mode (they don't).

## Key Accuracy Rules

1. The 105%/110% multiplier applies to the ORIGINAL home's sale price, not the assessed value
2. The comparison is: replacement price vs. (salePrice × timingMultiplier)
3. If replacement ≤ adjusted threshold → FULL transfer (assessedValue transfers completely)
4. If replacement > adjusted threshold → assessedValue + (replacementPrice - adjustedThreshold)
5. Parent-child exclusion limit for 2025-2027 is $1,044,586 (adjusted from $1M biennially)
6. The 2-year window for both transactions is a HARD requirement
7. Up to 3 transfers lifetime for senior/disabled; once per disaster for disaster victims
