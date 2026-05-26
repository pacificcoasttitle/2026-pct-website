# Signature Center — Phase 2 Backlog

Items deferred from Phase 1 Reviewer sign-off (2026-05-26).
Phase 1 shipped as production-ready with two pre-launch fixes applied.

## Important — Address In Phase 2

### 1. Persistent Send/Delete Audit Tables

Currently only console.log for signature sends and staff deletes. For
compliance lookups ("did Liz get her signature?", "who deleted Jerry?"),
console logs are insufficient.

Tables to create:

- `staff_signature_send_log` (mirrors `vcard_sms_send_logs` pattern)
- `staff_audit_log` (or soft-delete with `deleted_at`, `deleted_by` columns)

### 2. SendGrid Bounce / Failure Visibility

No webhook handler for SendGrid bounces. Admin sees "sent" with no signal
when SendGrid rejected, bounced, or deferred. Needs webhook endpoint +
delivery status table.

### 3. Office Location FK Constraint

`staff_members.office_location` is `TEXT`, not FK. Dangling slugs possible if
office is deleted. Either:

- Add FK constraint with `ON DELETE SET NULL`
- Document as soft reference (current state)

### 4. Server-Side Rate Limiting On Send Endpoint

Client has 30s cooldown but a script could spam the API directly. Add
rate limiting middleware or DB-backed throttle.

### 5. Soft-Delete Pattern For Staff

Hard delete loses audit history. Add `deleted_at`, `deleted_by` columns and
filter active rows from list queries.

## Minor — Backlog Items

### 6. CSV Import Performance

Replace N+1 `getStaffMemberByEmail` queries with single
`WHERE email = ANY($1)` batch query. Current: 500 round trips for 500 rows.

### 7. Cleanup Redundant Script

`scripts/update-corporate-signature-template.ts` is now redundant
(auto-sync handles it). Delete or document as emergency manual sync.

### 8. EMAIL_RE Validation Gap

PATCH skips `EMAIL_RE` check when email value is unchanged. Low risk.

### 9. URL Scheme Validation

`tel:`, `mailto:`, and `photo_url` fields could accept `javascript:` scheme.
Today unreachable (admin-only writes), but add validation if self-service
edit ever ships.

### 10. Orphan R2 Photo Cleanup

Replacing a photo doesn't delete the old R2 object. Orphaned blobs
accumulate. Add cleanup on photo replace.

### 11. CSV Failed-Rows Row Number Bug

`downloadFailedRowsCsv` may export wrong rows when batch has both
validation and DB errors. Edge case.

### 12. aria-describedby Linkage

Form error text not linked to input via `aria-describedby`. Screen readers
don't auto-announce errors.

### 13. Untracked Investigation Scripts

`scripts/investigate-*.ts`, `scripts/set-staff-photo.ts`, etc. — decide
whether to commit to `scripts/diagnostics/` or `.gitignore`.

### 14. signature_template_id PATCH Schema

Field exists in `StaffMemberInput` but not exposed in `PatchSchema`. Add when
UI for template selection ships.

### 15. /api/admin/* Middleware Gate

Middleware matcher is `/admin/:path*`, doesn't cover `/api/admin/*`. Per-route
checks do the work today. Consider middleware-level gate for
defense-in-depth.

## Out Of Scope For Phase 2 — Phase 3

- Multiple signature template variants (Sales Rep, Executive, Escrow)
- Social media icons (LinkedIn, Instagram)
- Outlook Graph API auto-install
- Self-service portal for employees
- Bulk regenerate / re-email signatures
- Photo cropping UI
- `vcard_employees` and `staff_members` consolidation

---

Last updated: 2026-05-26
Phase 1 sign-off: Reviewer (Cursor)
