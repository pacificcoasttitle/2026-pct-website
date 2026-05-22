# Admin Panel

**Last verified:** 2026-05-22 · **Maintained by:** Documentation Agent · **Source of truth:** `/docs/system/admin-panel.md`

## Overview

The admin panel ("Team Admin") at `/admin/team` is a JWT-gated control center for managing the employee/rep roster, running email + SMS marketing, and triaging inbound farm-list requests and tool-competency assessments. Rate management also lives under admin APIs (`calculator.md`).

⚠️ Correction to brief: auth is **custom `jose` JWT + `bcryptjs`**, not NextAuth.js. There is no `lib/auth.ts` and no NextAuth in `package.json`.

## Architecture

```
 /admin/login ──POST /api/admin/login──▶ bcrypt.compare(vcard_admin_users.password_hash)
                                        └─▶ jose JWT (HS256, 8h) → cookie pct_admin (httpOnly)
 every /admin/* request:
   middleware.ts (matcher /admin/:path*) ─ verify cookie ─ redirect /admin/login?from=… if bad
   (protected)/layout.tsx ─ re-verify server-side ─ render AdminSidebar
   each /api/admin/* route ─ isAuthenticated() ─ 401 if absent
```

## Authentication

- **Login:** `app/api/admin/login/route.ts` → `getAdminByUsername()` (`vcard_admin_users`) → `bcrypt.compare`. `bcryptjs` verifies both `$2y$` (PHP-migrated) and `$2b$` (Node) hashes. On success: `createAdminToken({userId, username, role, officeId})`, cookie `pct_admin` (`httpOnly`, `sameSite=lax`, `secure` in prod, `maxAge` 8h). `last_login` updated fire-and-forget.
- **Token:** `lib/admin-auth.ts` — `jose` SignJWT/jwtVerify, HS256, 8h expiry. Secret = `NEXTAUTH_SECRET` → `ADMIN_SECRET` → ⚠️ **hardcoded dev fallback `'dev-secret-change-me-in-env'`** (see Gotchas).
- **Logout:** `POST /api/admin/logout` clears the cookie.
- **Guards:** `middleware.ts`, the protected `layout.tsx`, and per-route `isAuthenticated()` — three layers.

## Admin roles and access

- `vcard_admin_users.role`: `top_level` ("Super Admin") and `manager` ("Manager") — labelled in `components/admin/AdminSidebar.tsx`.
- Session carries `officeId`, **but no server-side office/role scoping is enforced** — any authenticated admin can read/edit any employee and send to anyone. ⚠️ See Gotchas.

## Major sections (`app/admin/team/(protected)/**`)

| Page | What it does | Data |
|---|---|---|
| `page.tsx` (Dashboard) | counts, by-office/by-dept breakdowns, top-viewed, pending farm count | `getDashboardStats()` |
| `employees/` + `[slug]` + `new` | list / edit / create reps; toggle `active`, `website_active`, set `sms_code`, `mailchimp_audience_id` | `getAllEmployeesAdmin`, `updateEmployee`, `createEmployee` |
| `marketing/` | template builder + batch campaigns | see `marketing-center.md` |
| `sms/` | SMS Studio + send history | see `marketing-center.md`, `integrations.md` |
| `farms/` | triage farm requests; PATCH status | `getAllFarmRequests`, `updateFarmStatus` |
| `assessments/` | review competency surveys | `getAssessments` |

### Employee create/edit specifics
- `createEmployee` (`lib/admin-db.ts`): auto-`slugify` with dedupe; optional case-insensitive `sms_code` uniqueness check (app-level, not DB-enforced → 409); defaults `bio`/`website_bio` from `DEFAULT_EMPLOYEE_BIO`.
- `PATCH /api/admin/employees/[slug]`: **field whitelist** (name, title, contact, bio, photo, office/dept, active/featured/website_active, website_*, mailchimp_audience_id/form_code); dynamic `SET` + `updated_at = NOW()`; `revalidatePath('/admin/team/employees')`.

## Audit logging

⚠️ NEEDS REVIEW: The brief asks for an `audit_logs` table. **No `audit_logs` table or generic audit-log writer exists** in this repo. The closest things are: SMS sends recorded in `vcard_sms_send_logs` (+ `_recipients`) with an `actor` (admin username from JWT); email campaigns in `vcard_email_campaigns` (with `created_by`/`notes` carrying the actor); and `vcard_employee_activity` for SMS opt-ins. There is no centralized admin action log.

## Session management

- Stateless JWT in `pct_admin` cookie; no server-side session store. Expiry 8h; no refresh — re-login required after expiry. Invalid/expired cookie is deleted by middleware on the redirect.

## Code References

- `lib/admin-auth.ts:8` — `ADMIN_COOKIE`; `:11` secret fallback; `:24` token create
- `middleware.ts:9` — guard logic; `:33` matcher
- `app/api/admin/login/route.ts:20` — bcrypt dual-prefix note
- `components/admin/AdminSidebar.tsx:31` — role labels

## Common Tasks

- **Add an admin user:** insert into `vcard_admin_users` with a bcrypt hash (`$2b$`) and `active=true`. (No UI for this in-repo — done via DB.)
- **Add a protected page:** create under `(protected)/`; it inherits all three guard layers.

## Gotchas / Notes

- ⚠️ **JWT secret fallback:** if neither `NEXTAUTH_SECRET` nor `ADMIN_SECRET` is set in prod, tokens are signed with a public string and could be forged. Verify these are set in Vercel.
- ⚠️ **No office/role enforcement** server-side despite `officeId`/`role` in the session.
- `secure` cookie flag is only on when `NODE_ENV==='production'`.

---
*This document is maintained by the Documentation Agent. To regenerate or update, see `claude-skills.md` → Documentation Agent role.*
