# External Integrations

**Last verified:** 2026-05-22 · **Maintained by:** Documentation Agent · **Source of truth:** `/docs/system/integrations.md`

## Overview

The app integrates six external services. Secrets are read from environment variables (names only below — never commit values). All outbound integrations are server-side; API keys never reach the browser.

## Architecture

```
 Next.js (Vercel)
   ├─ Mailchimp  (https://<server>.api.mailchimp.com/3.0)   email campaigns/audiences
   ├─ Render: main-website-files.onrender.com  (Flask)  ──▶ Twilio  SMS/MMS
   ├─ Render: tessa-proxy.onrender.com                  ──▶ LLM     TESSA chat
   ├─ SendGrid (api.sendgrid.com/v3)                         transactional email
   ├─ Cloudflare R2 (<account>.r2.cloudflarestorage.com)     image storage
   └─ Render PostgreSQL (DATABASE_URL)                        primary datastore
```

## Mailchimp

- **What:** one audience (list) per sales rep; the app creates/sets/schedules/sends **campaigns** (1 per rep per batch) and reads audience stats.
- **Where:** `lib/marketing-mailchimp.ts`, `lib/mailchimp-schedule.ts`, `app/api/admin/marketing/**`, `app/api/admin/mailchimp/route.ts`, `app/admin/team/(protected)/marketing/page.tsx`.
- **Auth:** HTTP Basic `any:<API_KEY>` (base64). Datacenter in the key suffix and `MAILCHIMP_SERVER` (e.g. `us17`).
- **Env:** `MAILCHIMP_API_KEY`, `MAILCHIMP_SERVER`.
- **Constraints:** scheduled sends must be on a **quarter-hour UTC boundary** (handled by `computeScheduleTime`); audience ID per rep stored in `vcard_employees.mailchimp_audience_id`; reps without one are skipped.

## Twilio (via Render Flask relay)

- **What:** outbound SMS/MMS to reps' phones; inbound SMS webhook (text a rep code → get their vCard).
- **Where:** `lib/render-sms.ts` (client), `app/api/admin/sms-studio/**`, `app/api/admin/sms-health`, `app/api/sms/route.ts` (inbound TwiML). The app never calls Twilio directly — it POSTs to the Flask service which holds Twilio creds.
- **Endpoints (relay):** `/api/send-single`, `/api/send-batch`, `/api/send-text-batch`, `/api/health`.
- **Env:** `RENDER_API_URL` (default `https://main-website-files.onrender.com`), `RENDER_API_KEY` (optional `X-API-Key`), `RENDER_SMS_PREVIEW_MODE`, `RENDER_SMS_TEST_PHONE`.
- **Constraints:** MMS routing keys off the rep's `sms_code` embedded in the uploaded image filename (`sms/<CODE>_…`); preview mode redirects all sends to the test phone. ⚠️ The relay reads its own rep roster (legacy MySQL per archived docs) — a **drift risk** vs. Postgres `vcard_employees`. ⚠️ If `RENDER_API_KEY` is unset the relay endpoints are unauthenticated.

## SendGrid

- **What:** transactional email — farm-request notifications (to rep + confirmation to agent); FinCEN emails.
- **Where:** `app/api/farm-request/route.ts` (`@sendgrid/mail`), `lib/fincen-email.ts`.
- **Env:** `SENDGRID_API_KEY`. From addresses use `no-reply@pct.com`.
- **Constraints:** key needs `mail.send` scope (checked by `scripts/verify-marketing.ts`). ⚠️ Email HTML is built by string interpolation of user input → sanitize before trusting in any HTML-rendering surface.

## Cloudflare R2

- **What:** image storage — rep photos (`sales-rep-photos/WebThumb/<First>.png`), marketing hero images (`marketing/`), SMS images (`sms/<CODE>_…`).
- **Where:** `app/api/admin/upload/route.ts` — hand-rolled **AWS SigV4** (Node `crypto`), no AWS SDK.
- **Env:** `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_PUBLIC_URL`.
- **Constraints:** images only, ≤10 MB; returns public CDN URL `R2_PUBLIC_URL/<key>`.

## TESSA proxy (Render-hosted LLM wrapper)

- **What:** wraps the LLM for TESSA chat/PDF analysis. See `tessa.md`.
- **Where:** `app/api/tessa/route.ts` → `https://tessa-proxy.onrender.com/api/ask-tessa` (**hardcoded URL**).
- **Env:** `TESSA_ACCESS_CODE` (gate on/off) — the model key lives on the Render side, not here.
- **Constraints:** Render cold starts; OpenAI-shaped response. ⚠️ Underlying model unconfirmed in-repo.

## Vercel (hosting)

- **What:** hosts the Next.js app; provides `@vercel/analytics`. Serverless runtime for `route.ts` handlers (several pin `runtime = 'nodejs'`).
- **Constraints:** ⚠️ ephemeral/read-only filesystem — `fs.writeFileSync` in `/api/admin/rates` won't persist (see `calculator.md`). All env vars configured in the Vercel project.

## Render PostgreSQL (database)

- **What:** primary datastore for all `vcard_*` tables. See `data-model.md`.
- **Where:** `lib/admin-db.ts`, `lib/vcard-db.ts` (`pg.Pool`).
- **Env:** `DATABASE_URL`.
- **Constraints:** `ssl: { rejectUnauthorized: false }` (no cert verification); pool `max: 5` each.

## Configuration env vars (names only)

`DATABASE_URL` · `NEXTAUTH_SECRET` / `ADMIN_SECRET` · `MAILCHIMP_API_KEY` · `MAILCHIMP_SERVER` · `RENDER_API_URL` · `RENDER_API_KEY` · `RENDER_SMS_PREVIEW_MODE` · `RENDER_SMS_TEST_PHONE` · `SENDGRID_API_KEY` · `R2_ACCOUNT_ID` · `R2_BUCKET_NAME` · `R2_ACCESS_KEY_ID` · `R2_SECRET_ACCESS_KEY` · `R2_PUBLIC_URL` · `TESSA_ACCESS_CODE` · `NEXT_PUBLIC_SITE_URL`

## Code References

- `lib/render-sms.ts:12` — relay base URL; `app/api/admin/sms-health/route.ts` — health proxy
- `app/api/admin/upload/route.ts:36` — R2 SigV4 upload
- `lib/marketing-mailchimp.ts:53` — Mailchimp auth header

## Common Tasks

- **Verify all integrations:** `node`/tsx `scripts/verify-marketing.ts` (read-only; checks env, Mailchimp, SendGrid, Postgres).
- **Rotate a key:** update the env var in Vercel; redeploy. For the TESSA/SMS relays, also update on the Render side.

## Gotchas / Notes

- Two Render services (`main-website-files` for SMS, `tessa-proxy` for AI) are separate deployments owned outside this repo.
- ⚠️ Archived legacy docs (`_archive/to-review-2026-05-22/`) contain a real DB password and possible PII still present in git history — flagged for separate rotation/scrub.

---
*This document is maintained by the Documentation Agent. To regenerate or update, see `claude-skills.md` → Documentation Agent role.*
