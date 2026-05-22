# Data Model

**Last verified:** 2026-05-22 · **Maintained by:** Documentation Agent · **Source of truth:** `/docs/system/data-model.md`

## Overview

Persistent application data lives in **PostgreSQL on Render**, in tables prefixed `vcard_`. **Calculator rate data is NOT in the database** — it's committed JSON (`data/calculator/*.json`, see `calculator.md`). There is **no Prisma** (`prisma/schema.prisma` does not exist); schema is defined partly by the seed script (`scripts/seed-vcard-db.js`) and partly created at runtime by `ensureExtraTables()` in `lib/admin-db.ts`.

⚠️ Corrections to brief: the calculator `counties/title_rates/escrow_*/transfer_taxes/fees/endorsement_fees` are **JSON files, not tables**. The admin table is **`vcard_admin_users`**, not `admins`. There is **no `audit_logs`** table (see `admin-panel.md`).

## Connection

- `DATABASE_URL` (Render Postgres), `ssl: { rejectUnauthorized: false }`, pool `max: 5`.
- `lib/admin-db.ts` — admin/write pool + all marketing/SMS/assessment helpers.
- `lib/vcard-db.ts` — public-safe read pool (active employees, office/dept joins).

## Schema overview

| Table | Created by | Purpose |
|---|---|---|
| `vcard_employees` | seed | canonical rep roster (the hub) |
| `vcard_offices` | seed | office lookup |
| `vcard_departments` | seed | department lookup |
| `vcard_admin_users` | seed/migrated | admin logins |
| `vcard_employee_activity` | seed | activity log (SMS opt-ins) |
| `vcard_farm_requests` | seed | inbound farm-list requests |
| `vcard_email_templates` | `ensureExtraTables()` | email templates |
| `vcard_email_campaigns` | `ensureExtraTables()` | per-rep campaign log (+ batch cols) |
| `vcard_assessments` | `ensureExtraTables()` | competency surveys |
| `vcard_sms_send_logs` | `ensureExtraTables()` | SMS send history |
| `vcard_sms_send_log_recipients` | `ensureExtraTables()` | per-recipient SMS detail |

## Tables

### `vcard_employees` (hub)
- **Purpose:** every subsystem keys off this row.
- **Key columns:** `id`, `slug` (URL key), `first_name`, `last_name`, `title`, `email`, `phone`, `mobile`, `sms_code` (SMS routing), `bio`, `photo_url`, `languages`, `specialties`, socials, `theme_color`, `active`, `featured`, `view_count`, `save_count`, website fields (`website_active`, `website_bio`, `website_specialties`, `website_hero_image`, `website_custom_title`, `website_meta_description`), `mailchimp_audience_id`, `mailchimp_form_code`, `office_id`, `department_id`, `created_at`, `updated_at`.
- **Relationships:** `office_id → vcard_offices`, `department_id → vcard_departments`; referenced by SMS logs (`rep_slug`/`sms_code`), campaigns (`rep_slug`), farm requests & assessments (`rep_id` = sms_code or slug, by value not FK).
- **Used in:** `lib/vcard-db.ts`, `lib/admin-db.ts`, all admin pages, vCard endpoint, marketing batch, SMS routing.

### `vcard_offices`
- `id, name, street, city, state, zip, phone, region`. Used for dashboards, vCard address, dropdowns.

### `vcard_departments`
- `id, name, color`. `color` drives the dashboard dept chart.

### `vcard_admin_users`
- `id, username, email, password_hash, role('top_level'|'manager'), office_id, first_name, last_name, active, last_login`.
- **Used in:** `getAdminByUsername`, login route.

### `vcard_employee_activity`
- `employee_id → vcard_employees, activity_type, ip_address, metadata, created_at`. Currently `activity_type='sms_optin'`. Joined in `getSmsEmployees()` to count opt-ins / last activity.

### `vcard_farm_requests`
- `id, list_type, city_area, property_address, radius, list_size, output_formats(JSONB), notes, contact_name, contact_email, contact_phone, rep_id, rep_name, rep_email, source_channel, status('pending' default), notification_sent, submitted_at, updated_at`.
- Written by public `POST /api/farm-request`; read/updated in `/admin/team/farms`.

### `vcard_email_templates`
- `id, name, subject, preheader, html_content, thumbnail_url, category, created_by, updated_by, created_at, updated_at`. Four defaults seeded by category.

### `vcard_email_campaigns`
- `id, name, subject, audience_id, template_id → vcard_email_templates (ON DELETE SET NULL), mailchimp_campaign_id, mailchimp_web_id, status, scheduled_at, notes, created_at` **+ `batch_id UUID`, `rep_slug`, `reply_to_mode`** (ALTER-added; indexed on `batch_id`).
- One row per rep-campaign; grouped by `batch_id`.

### `vcard_assessments`
- `id, respondent_name, respondent_email, respondent_phone, rep_id, rep_name, source_channel, capability_score NUMERIC(5,2), avg_confidence_score NUMERIC(3,2), responses_json JSONB, confidence_json JSONB, user_agent, submitted_at`.
- Answers stored as JSONB blobs (not flat columns). Indexed on `rep_id` and `submitted_at`.

### `vcard_sms_send_logs` / `vcard_sms_send_log_recipients`
- Logs: `id, mode('mms'|'text'|'single-text'), send_mode, preview_mode, test_phone, message, image_urls(JSONB), total, successful, failed, success, error, raw_response(JSONB), actor, created_at`.
- Recipients: `id, log_id → vcard_sms_send_logs (CASCADE), rep_slug, rep_name, sms_code, phone_last4, status, error, created_at`. **Only last-4 of phone stored** (`last4()`).

## Calculator data (JSON, for completeness)
`data/calculator/`: `title-rates.json`, `escrow-resale.json`, `escrow-refinance.json`, `fees.json`, `endorsements.json`, `transfer-taxes.json`, `counties.json`. Generated from `pctc_*.sql` / `pctc_title_rates.csv` in repo root. See `calculator.md`.

## Code References

- `scripts/seed-vcard-db.js` — DDL for core tables (offices, departments, employees, …)
- `lib/admin-db.ts:498` — `ensureExtraTables()` (templates, campaigns + batch cols, assessments, SMS logs)
- `lib/admin-db.ts:1117` — `getEmailCampaignBatches`; `:1194` — `getBatchCampaigns`
- `lib/vcard-db.ts:27` — public column list + office/dept joins

## Common Tasks

- **Inspect a table:** connect with `DATABASE_URL` (Render dashboard psql or any client). Read-only audit example: `scripts/list-mailchimp-audiences.js`.
- **Add a column to a runtime table:** add an `ALTER TABLE … ADD COLUMN IF NOT EXISTS` in `ensureExtraTables()` (idempotent, runs on first use).

## Gotchas / Notes

- ⚠️ **Schema is in app code, not migrations** for the 5 runtime tables — easy to lose track; first request after deploy pays the DDL cost.
- `rep_id` on farm requests/assessments is a **value** (sms_code or slug), not a foreign key — can dangle if a rep is renamed/deleted.
- Both pools disable SSL cert verification.

---
*This document is maintained by the Documentation Agent. To regenerate or update, see `claude-skills.md` → Documentation Agent role.*
