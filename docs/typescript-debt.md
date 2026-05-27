# TypeScript Debt - Pre-Existing Issues

These errors have been in the codebase for some time. Production builds
succeed because Next.js build is lenient. Should be cleaned up eventually
but not blocking.

## Known Issues (as of 2026-05-27)

### app/api/admin/upload/route.ts
- Error: "Buffer not assignable to BodyInit"
- Cause: R2 SDK type quirk with fetch body
- Workaround in production: build succeeds despite error
- Pattern fix exists in lib/r2-upload.ts (uses typed cast)
- Action: Refactor upload route to use lib/r2-upload.ts helper

### app/resources/booklets/page.tsx
- Error: "Property 'file' does not exist"
- Likely cause: type drift on a data structure
- Action: Audit data type for booklets, update interface

### app/tessa/prelim-review/page.tsx
- Error: "Property 'sections' does not exist"
- Likely cause: TESSA response shape mismatch
- Action: Update TESSA response type

### components/team/FarmRequestForm.tsx
- Error: "value/label object not assignable to Key"
- Likely cause: dropdown options shape doesn't match Select component
- Action: Cast to string or update Select usage

### components/team/TeamMemberPage.tsx
- Error: "Window cast issue"
- Likely cause: window.X property access without proper typing
- Action: Add proper window type extension or use type assertion

### .next/types/validator.ts
- Error: "Cannot find module '../../app/team/[slug]/page.js'"
- Likely cause: stale Next.js build artifact
- Workaround: Clear .next folder and rebuild
- Action: Add .next to .gitignore if not already there (verify)

## Cleanup Strategy

These don't need to be fixed all at once. Whenever someone touches one
of these files for another reason, fix the TypeScript error as part of
that work.

Tracking issue: TBD (link if created in a tracker)
