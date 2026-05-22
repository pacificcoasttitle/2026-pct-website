# Cursor Prompt: Spacing, Modal Width & Summary Prominence

## Context

The TESSA prelim analysis modal and section cards are functionally complete and rendering structured data correctly. But the overall presentation feels cramped — the modal could be wider, the content needs more breathing room, and the Summary section (which is the most important section for agents and escrow officers) doesn't stand out enough from the supporting sections beneath it.

## Changes to Make

### 1. Widen the Modal — `TessaPrelimModal.tsx`

The modal is currently `max-w-5xl` (1024px). On modern screens this leaves too much dead space on the sides. Increase to `max-w-6xl` (1152px) or even `max-w-7xl` (1280px).

```tsx
// In TessaPrelimModal.tsx, find:
<div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col ...

// Change to:
<div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col ...
```

Also increase the body padding from `px-6` to `px-8` so content doesn't hug the edges:

```tsx
// Modal body:
<div ref={bodyRef} className="flex-1 overflow-y-auto tessa-modal-body px-8 py-6">

// Modal header:
<div className="flex-shrink-0 flex items-start justify-between px-8 pt-6 pb-4 ...

// Modal footer:
<div className="flex-shrink-0 px-8 py-4 border-t ...
```

### 2. Increase Spacing Between Section Cards — `TessaPrelimResults.tsx`

The section cards are in a `space-y-4` container. Increase to `space-y-5` or `space-y-6` so each card has more visual separation:

```tsx
// In TessaPrelimResults.tsx, find:
<div className="space-y-4">

// Change to:
<div className="space-y-5">
```

### 3. Section Card Internal Padding — `TessaSectionCard.tsx`

Increase the padding inside each section card body:

```tsx
// Find the expanded body div:
<div className="px-5 pb-5 pt-1 border-t border-gray-100">

// Change to:
<div className="px-6 pb-6 pt-3 border-t border-gray-100">
```

And the header button padding:

```tsx
// Find:
<button className="w-full flex items-center gap-3 px-5 py-4 ...

// Change to:
<button className="w-full flex items-center gap-4 px-6 py-4 ...
```

### 4. Make the Summary Section Visually Prominent

The Summary is the most important section — it's what an agent or escrow officer reads first to understand the file. It should look different from the supporting sections.

#### In `TessaSectionCard.tsx`:

Add a prop or check for the Summary section and give it a distinct treatment:

```tsx
// When section.title === 'SUMMARY', add a subtle background to the entire card:
const isSummary = section.title === 'SUMMARY'

// On the outer card div:
<div
  className={`rounded-xl border bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow
    ${isSummary ? 'border-blue-200 bg-blue-50/30 ring-1 ring-blue-100' : 'border-gray-200'}`}
>
```

This gives Summary a very subtle blue tint and ring that makes it stand out without being garish.

#### In `TessaSummaryContent.tsx`:

The risks box and narrative need more breathing room:

```tsx
// Increase padding in the risks container:
<div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
//                                       ^^^ was p-4

// Increase spacing between risk items:
<div className="space-y-3.5">
//                        ^^^ was space-y-3

// Increase risk text size slightly:
<div key={i} className="flex gap-3 text-sm">
// Change to:
<div key={i} className="flex gap-3">

// Risk title:
<span className="font-semibold text-gray-800 text-sm leading-relaxed">
// (add leading-relaxed for better line spacing)

// Risk explanation:
<span className="text-gray-600 text-sm leading-relaxed">

// Narrative paragraph — make it slightly larger:
<p className="text-sm text-gray-600 leading-relaxed">
// Change to:
<p className="text-[15px] text-gray-600 leading-relaxed">
```

#### Add a "File Summary" label above the risks:

Inside `TessaSummaryContent.tsx`, add a one-line property address + order number header above the risks box:

```tsx
// At the top of the return, before the risks div:
<div className="pt-4 space-y-4">
  {/* Quick file identifier */}
  <div className="flex items-center justify-between text-xs text-gray-400">
    <span>Transaction overview for the parties and their representatives</span>
  </div>

  {/* Top Closing Risks */}
  ...
```

### 5. Requirements Cards Spacing — `TessaRequirementsContent.tsx`

Each requirement card is in `space-y-3`. Increase:

```tsx
// Find:
<div className="space-y-3 pt-4">

// Change to:
<div className="space-y-4 pt-4">
```

And inside each requirement card, increase padding:

```tsx
// Find:
<div className={`border-l-4 ${borderFor[req.severity]} bg-gray-50 rounded-r-lg p-4`}>

// Change to:
<div className={`border-l-4 ${borderFor[req.severity]} bg-gray-50 rounded-r-lg p-5`}>
```

### 6. Liens Cards Spacing — `TessaLiensContent.tsx`

```tsx
// Find:
<div className="pt-4 space-y-4">

// Change to:
<div className="pt-4 space-y-5">
```

### 7. Tax Content Spacing — `TessaTaxContent.tsx`

The installment rows feel tight. Add more vertical padding:

```tsx
// Find the installment row divs:
<div className="flex items-center justify-between py-3 border-b border-gray-100">

// Change to:
<div className="flex items-center justify-between py-3.5 border-b border-gray-100">
```

### 8. KV Row Spacing — `TessaShared.tsx`

The key-value rows (used in Property Info, Liens, Doc Status) are in `py-2`. Increase slightly:

```tsx
// In the KV component, find:
<div className="flex justify-between items-baseline py-2 border-b border-gray-100 last:border-0 gap-4">

// Change to:
<div className="flex justify-between items-baseline py-2.5 border-b border-gray-100 last:border-0 gap-4">
```

And make the label text slightly less compressed:

```tsx
// Find:
<span className="text-xs uppercase tracking-wider text-gray-400 font-medium shrink-0">

// Change to:
<span className="text-xs uppercase tracking-widest text-gray-400 font-medium shrink-0 mr-6">
//                          ^^^^^^^^                                              ^^^^
// tracking-widest gives more letter spacing, mr-6 ensures gap between label and value
```

### 9. Complexity Score Card — `TessaComplexityScore.tsx`

Give it more internal padding:

```tsx
// Find:
<div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">

// Change to:
<div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
```

### 10. Action List in Requirements — `TessaRequirementsContent.tsx`

The action list box needs slightly more padding:

```tsx
// Find:
<div className="bg-slate-50 rounded-lg p-3 border border-slate-200 mb-2">

// Change to:
<div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-3">
```

## Summary of All Files to Touch

| File | Change |
|------|--------|
| `TessaPrelimModal.tsx` | max-w-5xl → max-w-6xl, px-6 → px-8, py-5 → py-6 |
| `TessaPrelimResults.tsx` | space-y-4 → space-y-5 |
| `TessaSectionCard.tsx` | px-5 → px-6, pb-5 → pb-6, summary card blue tint |
| `TessaSummaryContent.tsx` | p-4 → p-5, narrative text-[15px], add file intro line |
| `TessaRequirementsContent.tsx` | space-y-3 → space-y-4, p-4 → p-5, action list p-3 → p-4 |
| `TessaLiensContent.tsx` | space-y-4 → space-y-5 |
| `TessaTaxContent.tsx` | py-3 → py-3.5 on installment rows |
| `TessaShared.tsx` | KV py-2 → py-2.5, tracking-wider → tracking-widest, mr-6 |
| `TessaComplexityScore.tsx` | p-5 → p-6 |

## What NOT to Change

- The overall card structure and behavior (collapse/expand, icons, severity badges)
- The content renderer logic (parsers, data extraction)
- The modal open/close behavior
- The progress bar (that's a separate prompt)
- Any colors — the palette is good

These are all spacing-only changes. No new components, no logic changes. Just more room to breathe.
