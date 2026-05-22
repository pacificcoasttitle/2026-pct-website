# Cursor Prompt: Progress Bar UX — Simulated Sub-Steps During Analysis

## Problem

When TESSA analyzes a prelim, the progress bar jumps to the "analyzing" step within 2-3 seconds, then sits there for 40-60 seconds with no visible movement. Users think it's frozen. The actual API call is a single long request — there's no server-sent progress — but we can simulate granular progress on the frontend to keep users engaged.

## What to Build

Update the `usePrelimAnalysis` hook (and the progress display in `TessaPrelimModal.tsx` and `page.tsx`) to show **simulated sub-steps** during the `analyzing` status. The progress bar and status text should creep forward on a timer while the API call is in flight.

## Simulated Steps (during `analyzing` status only)

The hook currently sets progress to a fixed value during `analyzing`. Instead, start a timer interval when `analyzing` begins that advances through these sub-steps:

```
Time offset    Progress    Label
──────────────────────────────────────────────────────
0 sec          25%         "TESSA is reading your prelim..."
4 sec          32%         "Identifying title requirements..."
9 sec          40%         "Analyzing liens and encumbrances..."
15 sec         48%         "Reviewing deeds of trust..."
22 sec         55%         "Parsing tax information..."
30 sec         62%         "Checking Schedule B exceptions..."
38 sec         70%         "Evaluating CC&Rs and easements..."
46 sec         77%         "Building your structured report..."
55 sec         83%         "Almost there — finalizing analysis..."
65 sec         88%         "Still working — complex file..."
80 sec         90%         "Wrapping up..."
```

**Rules:**
- Progress NEVER reaches 100% from the timer — only from the actual response
- When the real API response arrives, snap immediately to 92% → "Validating results..." → then proceed to the existing `validating` step which goes to 100%
- Clear the interval when the API responds (success or error)
- The labels should feel like real work descriptions, not generic "please wait"
- Use `setInterval` at ~1 second, checking elapsed time against the step thresholds

## Implementation

### Option A: Update `usePrelimAnalysis` hook directly

Find where the hook sets `status = 'analyzing'` and `progress = XX`. Replace the static progress with a ref-based timer:

```typescript
// Inside the hook, when entering 'analyzing' status:
const analysisStartTime = useRef<number>(0)
const analysisTimer = useRef<ReturnType<typeof setInterval> | null>(null)

const ANALYSIS_STEPS = [
  { elapsed: 0,  progress: 25, label: 'TESSA is reading your prelim...' },
  { elapsed: 4,  progress: 32, label: 'Identifying title requirements...' },
  { elapsed: 9,  progress: 40, label: 'Analyzing liens and encumbrances...' },
  { elapsed: 15, progress: 48, label: 'Reviewing deeds of trust...' },
  { elapsed: 22, progress: 55, label: 'Parsing tax information...' },
  { elapsed: 30, progress: 62, label: 'Checking Schedule B exceptions...' },
  { elapsed: 38, progress: 70, label: 'Evaluating CC&Rs and easements...' },
  { elapsed: 46, progress: 77, label: 'Building your structured report...' },
  { elapsed: 55, progress: 83, label: 'Almost there — finalizing analysis...' },
  { elapsed: 65, progress: 88, label: 'Still working — complex file...' },
  { elapsed: 80, progress: 90, label: 'Wrapping up...' },
]

// When starting analysis:
function startAnalysisProgress() {
  analysisStartTime.current = Date.now()
  analysisTimer.current = setInterval(() => {
    const elapsed = (Date.now() - analysisStartTime.current) / 1000
    // Find the latest step we've passed
    let currentStep = ANALYSIS_STEPS[0]
    for (const step of ANALYSIS_STEPS) {
      if (elapsed >= step.elapsed) currentStep = step
    }
    setProgress(currentStep.progress)
    setProgressLabel(currentStep.label)
  }, 1000)
}

// When API responds (success or error):
function stopAnalysisProgress() {
  if (analysisTimer.current) {
    clearInterval(analysisTimer.current)
    analysisTimer.current = null
  }
}
```

### Changes to the Modal / Page

No changes needed to `TessaPrelimModal.tsx` or `page.tsx` — they already read `progress` and `progressLabel` from the hook. The improvement is entirely inside the hook.

### Transition to `validating`

When the API call resolves successfully:
1. Call `stopAnalysisProgress()`
2. Set progress to 92%, label to "Validating results..."
3. Set status to `validating`
4. Run guardrails (this is fast, <1 second)
5. Set progress to 100%, label to "Complete ✅"
6. Set status to `complete`

### On error:
1. Call `stopAnalysisProgress()`
2. Set status to `error` with the error message
3. Progress stays wherever it was

## Bonus: Add a subtle pulse/shimmer to the progress bar fill

In the existing `ProgressBar` component (both in the modal and the page), the bar already has a shimmer class `tessa-progress-shimmer`. Make sure this CSS exists and animates while `isActive`:

```css
@keyframes tessa-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.tessa-progress-shimmer {
  background: linear-gradient(
    90deg,
    #f26b2b 0%,
    #ff8f5c 30%,
    #f26b2b 60%,
    #e05a1f 100%
  );
  background-size: 200% 100%;
  animation: tessa-shimmer 2s ease-in-out infinite;
}
```

## Files to Update

- `hooks/usePrelimAnalysis.ts` — Add timer-based progress simulation
- `app/globals.css` (or wherever shimmer CSS lives) — Add shimmer keyframe if not present
- NO changes needed to modal or page components (they already consume progress/progressLabel)

## Testing

1. Upload the Baldwin Park prelim (20014370-GLT)
2. Watch the progress bar — it should advance smoothly through sub-steps
3. Status text should change every 4-8 seconds with descriptive labels
4. When the response arrives (~40-60 sec), it should snap to "Validating..." then "Complete"
5. If you cancel or get an error, the timer should stop cleanly
