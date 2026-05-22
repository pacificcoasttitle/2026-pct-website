# PCT Website — System Architecture

**Last verified:** 2026-05-22 · **Maintained by:** Documentation Agent · **Source of truth:** `/docs/system/architecture.md`

## Overview

The 2026 PCT website is a single **Next.js 16 (App Router, React 19)** application deployed on **Vercel**. It serves the public marketing site plus a password-gated **Team Admin** command center, a client-side **Rate Calculator**, the **TESSA** AI assistant, and an **email/SMS marketing** suite. Persistent data lives in **PostgreSQL on Render**; rate data lives in committed **JSON files**. External work (Twilio SMS, the TESSA LLM) is delegated to **Render-hosted services**.

⚠️ ASSUMPTION: "Next.js 16" is read from `package.json` (`next: 16.0.10`). The task brief said "Next.js 15"; the repo is on 16.

## Architecture

```
                          ┌─────────────────────────────────────────────┐
        Public visitors → │            Next.js app (Vercel)              │
        Agents/admins   → │  app/  (App Router)   components/  lib/      │
                          └───────────────┬───────────────┬─────────────┘
                                          │               │
        ┌─────────────────┬───────────────┼───────────────┼──────────────┬───────────────┐
        ▼                 ▼               ▼               ▼              ▼               ▼
  Postgres (Render)  Cloudflare R2   Mailchimp        Render:         Render:        SendGrid
  vcard_* tables     image storage   (us-DC API)      tessa-proxy     main-website-  transactional
  admin/marketing/   sales-rep-      campaigns/       .onrender.com   files (Flask)  email
  sms/assessments    photos,         audiences        → LLM           → Twilio
                     marketing/sms                                     SMS/MMS
        ▲
        │  rate data is NOT in Postgres → committed JSON in data/calculator/*.json
```

### Major subsystems

| Subsystem | Entry points | Backed by | Doc |
|---|---|---|---|
| Public marketing site | `app/(public pages)`, `app/page.tsx` | static + Postgres reads | — |
| Team Admin | `app/admin/team/(protected)/**` | Postgres `vcard_*` | `admin-panel.md` |
| Email Marketing | `app/admin/team/(protected)/marketing`, `app/api/admin/marketing/**` | Postgres + Mailchimp | `marketing-center.md` |
| SMS Studio | `app/admin/team/(protected)/sms`, `app/api/admin/sms-studio/**`, `app/api/sms` | Render Flask → Twilio | `marketing-center.md`, `integrations.md` |
| Rate Calculator | `app/api/calculator/**`, `lib/calculator-engine.ts` | `data/calculator/*.json` | `calculator.md` |
| Rate admin | `app/api/admin/rates`, `app/api/admin/fees` | JSON via `fs` | `calculator.md` |
| TESSA AI | `components/tessa/**`, `contexts/TessaContext.tsx`, `app/api/tessa/**` | `tessa-proxy.onrender.com` | `tessa.md` |
| FinCEN checker | `app/api/fincen/**`, `lib/fincen-*.ts` | Postgres + SendGrid | — (out of scope this pass) |

## Authentication model

Two **independent** auth systems — there is no NextAuth in this repo.

1. **Admin** (`lib/admin-auth.ts`): username/password → `bcryptjs.compare` against `vcard_admin_users.password_hash` → signed **JWT (`jose`, HS256, 8h)** in an `httpOnly` cookie `pct_admin`. Enforced by `middleware.ts` (`matcher: /admin/:path*`), re-checked in the protected layout, and again in each API route via `isAuthenticated()`.
2. **TESSA** (`lib/tessa-auth.ts`): optional shared access code. If `TESSA_ACCESS_CODE` is set, a cookie `tessa_session = ok.<sha256("tessa:"+code)[:16]>` is required; if unset, TESSA is open.

## File organization principles

- `app/` — routes (pages + `route.ts` API handlers). Admin pages live under the `(protected)` route group.
- `lib/` — server logic, DB helpers, integration clients (one file per concern: `admin-db.ts`, `vcard-db.ts`, `render-sms.ts`, `marketing-mailchimp.ts`, `mailchimp-schedule.ts`, `calculator-engine.ts`, `tessa/*`).
- `components/` — UI; admin UI under `components/admin/**`, TESSA under `components/tessa/**`.
- `data/calculator/*.json` — the live rate tables (generated from the `pctc_*.sql` dumps in repo root).
- `types/` — shared TypeScript types (`types/employee.ts`).

## Code References

- `middleware.ts` — admin route guard
- `lib/admin-auth.ts:11` — JWT secret resolution (env fallback)
- `package.json:49` — `next` version
- `app/admin/team/(protected)/layout.tsx` — admin shell + server-side session re-check

## Common Tasks

- **Add a new admin page:** create under `app/admin/team/(protected)/<name>/page.tsx`; it's auto-guarded by middleware + layout. Add a nav entry in `components/admin/AdminSidebar.tsx`.
- **Add an integration:** put the client in `lib/<service>.ts`, read secrets from env (never hardcode), document in `integrations.md`.

## Gotchas / Notes

- **Two Postgres pools** point at the same DB: `lib/admin-db.ts` (writes/admin reads) and `lib/vcard-db.ts` (public-safe reads). Both use `ssl: { rejectUnauthorized: false }`.
- **Calculator data is not in the database.** It's committed JSON edited on the serverless filesystem — see `calculator.md` gotchas (Vercel persistence).
- The marketing/SMS/assessment Postgres tables are created lazily at runtime by `ensureExtraTables()` in `lib/admin-db.ts`, not by migration files.

---
*This document is maintained by the Documentation Agent. To regenerate or update, see `claude-skills.md` → Documentation Agent role.*
