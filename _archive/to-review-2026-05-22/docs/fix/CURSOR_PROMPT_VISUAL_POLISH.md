# Cursor Prompt: Visual Polish — Match Prototype Aesthetic

## Context

The TESSA analysis components are architecturally correct — structured renderers, severity badges, KV rows, DOT cards, tax parcels all work. But the overall output feels busier than the prototype. These are small CSS/styling tweaks, not architectural changes.

## Changes to Make

### 1. `TessaSectionCard.tsx` — Soften the section card headers

**Current:** Each card has a 4px colored left border (`borderLeft: 4px solid ${section.borderColor}`). When 7 cards are stacked, the rainbow effect is visually noisy.

**Change:** Replace the colored left border with a small colored square icon (like the prototype). The card itself stays neutral white.

```tsx
// REMOVE this from the outer div:
style={{ borderLeft: `4px solid ${section.borderColor}` }}

// REPLACE the emoji icon span with a colored square:
// Before:
<span className="text-xl flex-shrink-0">{section.icon}</span>

// After:
<span
  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
  style={{ backgroundColor: section.borderColor }}
>
  {SECTION_ICON_LETTERS[section.title] || section.title[0]}
</span>

// Add this map at the top of the file:
const SECTION_ICON_LETTERS: Record<string, string> = {
  'TITLE REQUIREMENTS': '✓',
  'SUMMARY': 'Σ',
  'PROPERTY INFORMATION': 'P',
  'LIENS AND JUDGMENTS': '$',
  'TAXES AND ASSESSMENTS': 'T',
  'OTHER FINDINGS': '!',
  'DOCUMENT STATUS': 'i',
}
```

### 2. `TessaSectionCard.tsx` — Clean up the badge styling

**Current:** The item count badges use section-specific colors (`bg-green-100 text-green-800` for requirements, `bg-red-100 text-red-800` for liens).

**Change:** Use a uniform neutral badge for all sections:

```tsx
// Replace the badgeBg variable and its usage with:
<span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
  {section.itemCount}
</span>
```

Also, for sections like LIENS where we have dollar totals from facts, add that to the badge area. In TessaSectionCard, accept an optional `subtitle` prop:

For LIENS AND JUDGMENTS, compute the total from `facts.deeds_of_trust` and display like: `2 DOTs · $283,200`
For TAXES AND ASSESSMENTS: `1 parcel`

### 3. `TessaCheatSheet.tsx` — Match section card style

**Current:** Has its own styling with `borderLeft: 4px solid #f59e0b` and emoji 🧭.

**Change:** Use the same section card wrapper pattern (colored square icon, no left border):

```tsx
// Replace the outer div style:
// REMOVE: style={{ borderLeft: '4px solid #f59e0b' }}
// The card should look like the other section cards

// Replace the emoji with a colored square:
<span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-amber-500">
  🧭
</span>
```

### 4. `tessa-section-parser.ts` — Update icons to match

Since we're switching to letter-based icons on colored squares, update the SECTION_CONFIG icons to single letters (these are now used as fallbacks only since the card renders the icon itself):

```typescript
'TITLE REQUIREMENTS': { icon: '✓', ... },
'SUMMARY': { icon: 'Σ', ... },
'PROPERTY INFORMATION': { icon: 'P', ... },
'LIENS AND JUDGMENTS': { icon: '$', ... },
'TAXES AND ASSESSMENTS': { icon: 'T', ... },
'OTHER FINDINGS': { icon: '!', ... },
'DOCUMENT STATUS': { icon: 'i', ... },
```

### 5. `TessaComplexityScore.tsx` — Add the address from facts

**Current:** Shows just the filename.

**Change:** If `facts.property.address` is available, show it alongside the file name:

```tsx
<span className="text-xs text-gray-400 truncate max-w-[280px]">
  {facts?.property?.address || fileName}
  {facts?.property?.address && ` · ${facts.property.apn || ''}`}
</span>
```

This requires passing `facts` as a prop (currently it only receives `sections` and `fileName`).

### 6. Global: Add smooth transition on card expand/collapse

Add a subtle height transition when cards expand:

```css
/* In globals.css or a tessa-specific CSS file */
.tessa-card-body-enter {
  animation: tessa-expand 200ms ease-out;
}

@keyframes tessa-expand {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

Apply `tessa-card-body-enter` to the body div in `TessaSectionCard.tsx` when `expanded` is true.

## Files to Update

- `components/tessa/TessaSectionCard.tsx` — Icon squares, neutral badges, expand animation
- `components/tessa/TessaCheatSheet.tsx` — Match section card style
- `components/tessa/TessaComplexityScore.tsx` — Accept facts prop, show address
- `components/tessa/TessaPrelimResults.tsx` — Pass facts to ComplexityScore
- `lib/tessa/tessa-section-parser.ts` — Update icon characters
- `app/globals.css` — Add expand animation keyframe

## What NOT to Change

- The content renderers (TessaRequirementsContent, TessaLiensContent, etc.) — these are good
- The TessaShared.tsx utility components — these are solid
- The section card collapse/expand behavior — just add subtle animation
- The modal wrapper — already looks great
