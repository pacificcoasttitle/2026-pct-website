# `/admin/team` — Complete Technical Internals

**System:** Pacific Coast Title "Team Admin" (the Next.js command center at `https://www.pct.com/admin/team`)
**Stack:** Next.js 16 (App Router, React 19) on Vercel · PostgreSQL on Render · Cloudflare R2 · Twilio (via Render Flask) · Mailchimp · SendGrid
**Date:** 2026-05-20
**Scope:** Every route, table, service, data flow, and trust boundary behind `/admin/team`.

> ⚠️ This is the **new** system. It is NOT the legacy PHP `/vcard-new/` platform documented in `SYSTEMS-TECHNICAL-INTERNALS.md`. The two share *concepts* (sms_code routing, rep attribution, the Render Twilio API) but the new Team Admin runs on **PostgreSQL (`vcard_*` tables)**, while the legacy PHP ran on **MySQL (`pct_vcard` / `employees`)**. Where they overlap is called out explicitly below.

---

## 0. TL;DR — What this thing actually is

`/admin/team` is a password-protected, JWT-gated control panel that lets PCT marketing staff:

1. **Manage the employee/rep roster** (`vcard_employees`) — create, edit, toggle active, toggle public website page, upload photos, set Mailchimp audience IDs and SMS codes.
2. **Run SMS/MMS campaigns** to reps' phones through a Twilio relay hosted on Render.
3. **Build email templates and fire Mailchimp campaigns** with per-rep merge-tag personalization.
4. **Triage inbound "Farm Requests"** (lead-gen forms filled out by real-estate agents).
5. **Review "Assessments"** (a tool-competency survey clients fill out, attributed to a rep).

Everything is one Next.js app. The admin UI, the public API endpoints that feed the tables, and the Twilio webhook all live in the same deployment.

---

## 1. Routing & file map

### 1.1 Admin pages (UI)

| Route | File | Purpose |
|---|---|---|
| `/admin` | `app/admin/page.tsx` | Entry/redirect stub |
| `/admin/login` | `app/admin/login/page.tsx` | Login form (client component) |
| `/admin/team` | `app/admin/team/(protected)/page.tsx` | **Dashboard** |
| `/admin/team/employees` | `.../employees/page.tsx` | Employee list |
| `/admin/team/employees/new` | `.../employees/new/page.tsx` | Create employee |
| `/admin/team/employees/[slug]` | `.../employees/[slug]/page.tsx` | Edit employee |
| `/admin/team/farms` | `.../farms/page.tsx` | Farm Requests triage |
| `/admin/team/sms` | `.../sms/page.tsx` | SMS Command Center |
| `/admin/team/marketing` | `.../marketing/page.tsx` | Email Marketing (Mailchimp) |
| `/admin/team/assessments` | `.../assessments/page.tsx` | Assessment results |

The `(protected)` route group wraps all team pages in `layout.tsx`, which renders `AdminSidebar` and re-checks the JWT server-side (defense in depth on top of middleware).

### 1.2 API routes

**Admin (auth-gated) — `app/api/admin/*`**

| Endpoint | Methods | Backed by |
|---|---|---|
| `/api/admin/login` | POST | `getAdminByUsername`, bcrypt, `createAdminToken` |
| `/api/admin/logout` | POST | clears cookie |
| `/api/admin/session` | GET | returns current session |
| `/api/admin/employees` | POST | `createEmployee` |
| `/api/admin/employees/[slug]` | GET, PATCH | `getEmployeeAdminBySlug`, `updateEmployee` |
| `/api/admin/farm-requests` | GET, PATCH | `getAllFarmRequests`, `updateFarmStatus` |
| `/api/admin/assessments` | GET | `getAssessments` |
| `/api/admin/sms-studio` | GET, POST | Render relay → Twilio; logs to DB |
| `/api/admin/sms-studio/logs` | GET | `getSmsSendLogs` |
| `/api/admin/sms-studio/logs/[id]` | GET | `getSmsSendLog` (with recipients) |
| `/api/admin/sms-health` | GET | proxies Render `/api/health` |
| `/api/admin/marketing/studio` | GET, POST | templates + Mailchimp campaign create/send |
| `/api/admin/mailchimp` | GET | audience stats proxy |
| `/api/admin/upload` | POST | Cloudflare R2 (S3 SigV4) image upload |
| `/api/admin/fees`, `/api/admin/rates` | — | calculator admin (separate subsystem) |

**Public (feed the admin tables) — no auth**

| Endpoint | Methods | Purpose |
|---|---|---|
| `/api/farm-request` | POST | Agent submits farm list request → DB + SendGrid + SMS |
| `/api/assessment` | POST | Client submits competency survey → DB |
| `/api/sms` | POST/GET | **Twilio inbound webhook** (text a rep's code, get vCard) |
| `/api/team/[slug]/vcf` | GET | Generates a downloadable `.vcf` vCard |

> There is **no public `/team/<slug>` profile page** anymore — it was retired (see git history: "retire public /team page"). The only public-facing remnant of the vCard is the `.vcf` download endpoint and the Twilio SMS reply.

---

## 2. Authentication & authorization

### 2.1 The flow

```
Browser → POST /api/admin/login {username, password}
        → getAdminByUsername()  (SELECT from vcard_admin_users)
        → bcrypt.compare(password, password_hash)
        → createAdminToken()    (jose, HS256, 8h expiry)
        → Set-Cookie: pct_admin=<JWT>  (httpOnly, sameSite=lax, secure in prod, maxAge 8h)
```

- **Library:** `jose` (Edge-compatible) for JWT, `bcryptjs` for password hashing.
- **bcryptjs note:** deliberately chosen because it verifies **both** `$2y$` (PHP/legacy) and `$2b$` (Node) hash prefixes — i.e. admin users migrated from the legacy PHP system can log in with their existing hashes. (`app/api/admin/login/route.ts:20`)
- **Secret:** `NEXTAUTH_SECRET` → falls back to `ADMIN_SECRET` → falls back to the literal string `'dev-secret-change-me-in-env'`. **If neither env var is set in production, every JWT is signed with a publicly-known string. See Risks.** (`lib/admin-auth.ts:11`)
- **Session payload:** `{ userId, username, role, officeId }`.

### 2.2 Two enforcement layers

1. **`middleware.ts`** — runs on `matcher: ['/admin/:path*']`. Any `/admin/*` path except `/admin/login` requires a valid `pct_admin` cookie; missing/invalid → redirect to `/admin/login?from=<path>`, and the bad cookie is deleted.
2. **`(protected)/layout.tsx`** — re-reads the cookie server-side and `redirect('/admin/login')` if the token doesn't verify. Belt and suspenders.
3. **Each API route** independently calls `isAuthenticated()` (or `requireAuth()`), so even if middleware were bypassed, the JSON endpoints reject unauthenticated callers with 401.

### 2.3 Roles

- Roles seen: `top_level` ("Super Admin") and `manager` ("Manager"). `AdminSidebar.roleLabel()` maps these.
- **`officeId` exists in the session but is NOT enforced server-side.** Managers are theoretically office-scoped, but the data helpers (`getAllEmployeesAdmin`, `updateEmployee`, etc.) do **no office filtering**. Any authenticated admin can read/edit any employee. (See Risks — "Manager enforcement gaps", same finding as the legacy map.)

---

## 3. The database — PostgreSQL on Render

Two `pg.Pool` singletons exist (one in `lib/admin-db.ts`, one in `lib/vcard-db.ts`), both reading `process.env.DATABASE_URL`, both `ssl: { rejectUnauthorized: false }`, `max: 5`.

- `lib/vcard-db.ts` — **read-mostly, public-safe** queries (only active employees, joins office/department). Used by the `.vcf` endpoint and any public reads.
- `lib/admin-db.ts` — **full admin** queries (includes inactive rows, write operations, all the marketing/SMS/assessment tables).

### 3.1 Table inventory

| Table | Owner module | Created by |
|---|---|---|
| `vcard_employees` | core rep roster | pre-existing (migrated) |
| `vcard_offices` | office lookup | pre-existing |
| `vcard_departments` | department lookup | pre-existing |
| `vcard_admin_users` | admin logins | pre-existing |
| `vcard_employee_activity` | SMS opt-in / activity log | pre-existing |
| `vcard_farm_requests` | lead-gen submissions | pre-existing |
| `vcard_email_templates` | email builder | **auto-created** by `ensureExtraTables()` |
| `vcard_email_campaigns` | Mailchimp campaign log | **auto-created** |
| `vcard_assessments` | competency surveys | **auto-created** |
| `vcard_sms_send_logs` | SMS send history | **auto-created** |
| `vcard_sms_send_log_recipients` | per-recipient SMS detail | **auto-created** |

> `ensureExtraTables()` (`lib/admin-db.ts:498`) lazily runs `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` on first use of any marketing/SMS/assessment helper. The schema is therefore **defined in application code, not in migration files**. There is no migrations directory for these five tables.

### 3.2 `vcard_employees` — the canonical record

This is the heart of the whole system. Every subsystem keys off it. Columns (from the `COLS`/`ADMIN_COLS` select lists and the `Employee` type):

**Identity / contact**
`id`, `slug` (URL key, lowercased), `first_name`, `last_name`, `title`, `email`, `phone`, `mobile`, `sms_code` (e.g. `C-28` — the SMS routing key).

**Foreign keys**
`office_id` → `vcard_offices`, `department_id` → `vcard_departments`.

**Profile content**
`bio`, `photo_url`, `languages` (JSON-string array OR comma-sep), `specialties` (same), `linkedin`, `facebook`, `instagram`, `twitter`, `website`, `theme_color`.

**Flags & counters**
`active` (in roster), `featured` (sort first), `view_count`, `save_count`.

**Public website-page fields** (the "vCard website" per rep)
`website_active` (page is live), `website_bio`, `website_specialties`, `website_hero_image`, `website_custom_title`, `website_meta_description`.

**Mailchimp linkage**
`mailchimp_audience_id` (the Mailchimp **list ID** for this rep), `mailchimp_form_code`.

**Timestamps:** `created_at`, `updated_at`.

Key derived/computed values:
- `name` = `first_name || ' ' || last_name` (computed in SQL, not stored).
- `resolvePhotoUrl()` (`types/employee.ts:93`): if `photo_url` starts with `http`, use it; else build `https://pub-dbe01c2b9ef0457c979ef76b8d8618f3.r2.dev/sales-rep-photos/WebThumb/<Firstname>.png` from the R2 bucket.

### 3.3 The other tables (abbreviated schemas)

**`vcard_admin_users`** — `id, username, email, password_hash, role, office_id, first_name, last_name, active, last_login`.

**`vcard_farm_requests`** — `id, list_type, city_area, property_address, radius, list_size, output_formats (JSONB), notes, contact_name, contact_email, contact_phone, rep_id, rep_name, rep_email, source_channel, status ('pending' default), notification_sent, submitted_at, updated_at`.

**`vcard_assessments`** — `id, respondent_name, respondent_email, respondent_phone, rep_id, rep_name, source_channel, capability_score NUMERIC(5,2), avg_confidence_score NUMERIC(3,2), responses_json JSONB, confidence_json JSONB, user_agent, submitted_at`. (Note: the new system stores answers as **JSONB blobs**, unlike the legacy PHP schema's 68 flat columns.)

**`vcard_email_templates`** — `id, name, subject, preheader, html_content, thumbnail_url, category, created_by, updated_by, created_at, updated_at`.

**`vcard_email_campaigns`** — `id, name, subject, audience_id, template_id → vcard_email_templates, mailchimp_campaign_id, mailchimp_web_id, status ('draft' default), scheduled_at, notes, created_at`.

**`vcard_sms_send_logs`** — `id, mode ('mms'|'text'|'single-text'), send_mode ('single'|'per-image'|'all'), preview_mode, test_phone, message, image_urls JSONB, total, successful, failed, success, error, raw_response JSONB, actor, created_at`.

**`vcard_sms_send_log_recipients`** — `id, log_id → vcard_sms_send_logs (CASCADE), rep_slug, rep_name, sms_code, phone_last4, status, error, created_at`. **Only the last 4 digits of phone numbers are stored** (privacy-conscious — `last4()` helper).

**`vcard_employee_activity`** — used for `activity_type = 'sms_optin'` rows; joined to count `sms_opt_ins` and `last_sms_at` per rep.

---

## 4. The five screens (what each does, in detail)

### 4.1 Dashboard (`/admin/team`)
Server component, `revalidate = 60`. Calls `getDashboardStats()` which runs 7 parallel queries:
- total employees, active employees, website-active count
- employees grouped by office, by department (with dept color)
- top 5 most-viewed profiles
- count of `pending` farm requests

Renders stat cards, two breakdown panels, a "Most Viewed Profiles" list, and a quick-action button to the employee list.

### 4.2 Employees (`/admin/team/employees`, `/new`, `/[slug]`)
- **List:** `getAllEmployeesAdmin()` — every row incl. inactive, ordered `active DESC, last_name ASC`, joined to office/dept names.
- **Create** (`POST /api/admin/employees` → `createEmployee`):
  - Auto-generates a unique `slug` via `slugify()` (strips diacritics, lowercases, dedupes with `-2`, `-3`… then timestamp fallback).
  - Optional `sms_code` uniqueness check (case-insensitive) — throws 409 if taken. **Not enforced at DB level**, only here.
  - Defaults the `bio` (and mirrors to `website_bio`) using `DEFAULT_EMPLOYEE_BIO` with `{first_name}` substitution, so new reps aren't blank.
  - `revalidatePath('/admin/team/employees')`.
- **Edit** (`PATCH /api/admin/employees/[slug]` → `updateEmployee`):
  - **Field whitelist** (`app/api/admin/employees/[slug]/route.ts:41`): first/last name, title, email, phone, mobile, bio, photo_url, languages, specialties, linkedin, office_id, department_id, active, featured, website_active, website_bio, website_specialties, website_custom_title, website_meta_description, mailchimp_audience_id, mailchimp_form_code.
  - `updateEmployee` builds a dynamic `SET col = $n` statement from whatever keys are present, always bumps `updated_at = NOW()`.

This screen is where a rep's **public website page** is toggled live (`website_active`) and where their **Mailchimp audience** and **SMS code** are wired up — i.e. it's the join point connecting one employee to all three marketing channels.

### 4.3 SMS Command Center (`/admin/team/sms`)
- Loads `getSmsEmployees()` — only reps with a non-empty `sms_code`, with opt-in counts.
- Shows `SmsServiceBadge` (live health from `/api/admin/sms-health`) and a Twilio Console link.
- `SmsStudioWithLogs` client component drives `POST /api/admin/sms-studio`.
- Collapsible "Twilio Webhook Setup" instructions.

### 4.4 Email Marketing (`/admin/team/marketing`)
- `force-dynamic`. Loads all employees, filters to those **with** `mailchimp_audience_id`.
- For each, fetches live Mailchimp list stats (`member_count`, `open_rate`, `click_rate`, `campaign_count`) **server-side in parallel**, summing total subscribers.
- Flags reps that are active + website_active but have **no** Mailchimp audience (gaps to fix).
- `MarketingStudioClient` drives template editing + campaign creation via `/api/admin/marketing/studio`.

### 4.5 Farm Requests (`/admin/team/farms`) & Assessments (`/admin/team/assessments`)
- Read the `vcard_farm_requests` / `vcard_assessments` tables via their GET endpoints.
- Farms supports `PATCH` to change `status` (pending/processing/completed/cancelled-style workflow).
- Assessments is read-only review of submitted surveys (incl. capability % and avg confidence).

---

## 5. External services & integrations

### 5.1 Twilio — via the Render Flask relay (NOT direct)

The Next.js app **never talks to Twilio's API directly**. It POSTs to a Python Flask service on Render, which holds the Twilio credentials and the recipient routing logic.

```
/admin/team/sms  →  POST /api/admin/sms-studio  →  lib/render-sms.ts
                                                 →  fetch  https://main-website-files.onrender.com
                                                          /api/send-batch | /api/send-single | /api/send-text-batch
                                                 →  Render Flask  →  Twilio  →  rep phones
```

- **Base URL:** `RENDER_API_URL` (default `https://main-website-files.onrender.com`).
- **Auth to Render:** optional `RENDER_API_KEY` sent as `X-API-Key` header. (`lib/render-sms.ts:18`) — if unset, the Render endpoints are unauthenticated.
- **Three send modes** (`POST /api/admin/sms-studio`):
  - **MMS batch** (`mode: 'mms'`): requires `imageUrls[]`. If `send_to_all` is false, the **filename embeds the rep's sms_code** (e.g. `C-9_...jpg`) and Render's `extract_sms_code_from_filename` routes each image to the matching rep. If `send_to_all`, one image goes to every rep.
  - **Text batch** (`mode: 'text'`): blasts a text to all active reps.
  - **Single text** (`mode: 'text'` + `single_rep_slug`): looks up the rep, uses their `mobile` (or `test_phone`), calls Render `/api/send-single`.
- **Preview mode:** `RENDER_SMS_PREVIEW_MODE === 'true'` redirects all sends to `RENDER_SMS_TEST_PHONE`. Toggleable per-request.
- **Logging:** every send writes a `vcard_sms_send_logs` row + recipient rows. `buildRecipientsFromResponse()` is a defensive parser that digs through unknown Render response shapes (tries keys `recipients`, `results`, `sent_to`, …, and nested `data`/`result`/`body` wrappers) to recover per-rep status. Totals fall back across `total`/`recipient_count`, `successful`/`success_count`, `failed`/`fail_count`.
- **Health:** `/api/admin/sms-health` proxies Render `/api/health` and surfaces `twilio_configured`, `database_connected`, `sales_reps_count`, `preview_mode`.

> The Render service still queries the **legacy MySQL `pct_vcard`** for its rep roster (per the legacy doc). So SMS recipient resolution may run against a *different* rep list than the Postgres `vcard_employees` the admin UI edits. **This is a real drift risk** — adding a rep in Team Admin does not automatically make Render's MySQL aware of them.

### 5.2 Twilio — inbound webhook (`/api/sms`)

Configured in Twilio console as the messaging webhook (`POST https://www.pct.com/api/sms`). Flow:
- Agent texts a rep's SMS code (e.g. `PCTDAVID`) to PCT's Twilio number.
- `getEmployeeBySmsCode()` looks up the active rep.
- Logs an `sms_optin` activity row (`from` number + code).
- Replies with TwiML containing the rep's **vCard download link** (`/api/team/<slug>/vcf`), phone, email, and a "Reply FARM" prompt.
- `HELP` keyword and unknown-code fallbacks handled.

### 5.3 Mailchimp (`/api/admin/marketing/studio`, `/api/admin/mailchimp`)

- **Config:** `MAILCHIMP_API_KEY` + `MAILCHIMP_SERVER` (datacenter, e.g. `us14`). Auth = HTTP Basic `any:<apiKey>` base64. Key stays server-side (proxy pattern).
- **Per-rep audiences:** each employee's `mailchimp_audience_id` is the Mailchimp **list ID**. The marketing page fans out one stats request per rep.
- **Template builder:** `save-template` upserts into `vcard_email_templates`. Four default templates (Product Spotlight, Title Industry News, Market Update, Holiday Greeting) are **seeded on first GET** via `seedDefaultTemplates()` — full responsive HTML lives inline in `lib/admin-db.ts:891`.
- **Merge tags:** templates use `{{REP_NAME}}`, `{{REP_TITLE}}`, `{{REP_EMAIL}}`, `{{REP_PHONE}}`, `{{REP_PHOTO}}`, `{{REP_URL}}` (+ `{{HERO_IMAGE}}`). `replaceMergeTags()` resolves them from the chosen rep before the HTML is pushed to Mailchimp. `{{REP_URL}}` = `NEXT_PUBLIC_SITE_URL/<slug>`.
- **Campaign create** (`create-campaign`): 3 Mailchimp API calls — (1) `POST /campaigns` (type regular, list_id, subject, preview_text=preheader, from_name, reply_to, open/click tracking), (2) `PUT /campaigns/{id}/content` with the merged HTML, (3) optionally `POST /campaigns/{id}/actions/send` if `sendNow`. Then logs to `vcard_email_campaigns` and returns an `editUrl` into the Mailchimp admin.
- This **replaces** the legacy Python `campaign_manager.py` / `template_generator.py` / `sales_reps_data.json` pipeline. The new system reads rep data from Postgres, not `sales_reps_data.json`.

### 5.4 SendGrid (`@sendgrid/mail`)

Used by `/api/farm-request` (not the admin UI directly). On a farm submission it sends **two** emails: a rich notification to the assigned rep (`rep_email`) and a confirmation to the agent (`contact_email`), both from `no-reply@pct.com`. Requires `SENDGRID_API_KEY`. (It also fires a Twilio SMS to the rep via the Render relay.)

### 5.5 Cloudflare R2 (`/api/admin/upload`)

- S3-compatible object storage. The route implements **AWS Signature V4 by hand** with Node `crypto` (no AWS SDK).
- Env: `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_PUBLIC_URL`.
- Validates: image MIME only, ≤10 MB.
- **Key naming is load-bearing:** if a `prefix` form field is present (the rep's `sms_code`), the file lands in `sms/<PREFIX>_<stem>.<ext>`; otherwise `marketing/<stem>.<ext>`. The `sms/` prefixed names are what make MMS routing work (Render parses the sms_code out of the URL).
- Returns the public CDN URL (`R2_PUBLIC_URL/<key>`). Rep photos live under `sales-rep-photos/WebThumb/` in the same R2 account.

---

## 6. End-to-end data flows

**A) Edit a rep → push live website page**
```
/admin/team/employees/<slug>  → PATCH /api/admin/employees/<slug>
  → updateEmployee() UPDATE vcard_employees SET website_active=true, website_bio=…
  → revalidatePath('/admin/team/employees')
```

**B) Send an MMS to one rep**
```
SMS Studio → upload image (prefix=C-9) → R2 sms/C-9_xxx.jpg
           → POST /api/admin/sms-studio {mode:'mms', imageUrls:[…]}
           → Render /api/send-batch → MySQL rep lookup by C-9 → Twilio → rep phone
           → recordSmsSendLog() + recipient rows in Postgres
```

**C) Agent submits a Farm Request (public)**
```
Public form → POST /api/farm-request
  → insertFarmRequest() INSERT vcard_farm_requests (status='pending')
  → SendGrid: notify rep + confirm agent
  → Render /api/send-single: SMS the rep (best-effort)
  → appears in /admin/team/farms
```

**D) Client takes the Assessment (public)**
```
Public survey → POST /api/assessment
  → score: capability% = yes/total*100 ; avg confidence over 1–5 ratings
  → resolve rep by sms_code then slug
  → createAssessment() INSERT vcard_assessments (JSONB blobs)
  → appears in /admin/team/assessments
```

**E) Agent texts a rep code (inbound)**
```
Twilio → POST /api/sms → getEmployeeBySmsCode → log sms_optin
       → TwiML reply with /api/team/<slug>/vcf link
```

**F) Send a Mailchimp campaign**
```
/admin/team/marketing → POST /api/admin/marketing/studio {action:'create-campaign'}
  → replaceMergeTags(html, rep)
  → MC POST /campaigns → PUT /content → (optional) actions/send
  → createEmailCampaignLog() INSERT vcard_email_campaigns
```

---

## 7. "Connected websites" / vCard surface

- **The public per-rep vCard *page*** (`/team/<slug>`) was **removed** from pct.com. What remains public:
  - `/api/team/<slug>/vcf` — the downloadable contact card (vCard 3.0): name, org "Pacific Coast Title Company", title, cell/work phones, work email, office address, photo URL (from R2), LinkedIn, website `https://www.pct.com`, and a NOTE with `(866) 724-1050`.
  - The Twilio SMS reply that links to that `.vcf`.
- **Per-rep "website pages"** referenced by `website_active`/`website_*` columns are managed here but rendered elsewhere in the broader site (these flags gate whether a rep appears in the public directory via `getWebsiteEmployees()`).
- **Legacy PHP `/vcard-new/`** is the *other* connected system: same conceptual rep model, but on MySQL, with its own admin panel, SMS studio, and Mailchimp Python automation. The Render Twilio relay is **shared** between old and new. See `SYSTEMS-TECHNICAL-INTERNALS.md` and `docs/vcard-new-system-map.canvas.tsx`.

---

## 8. Environment variables (complete list)

| Var | Used by | Notes |
|---|---|---|
| `DATABASE_URL` | both pg pools | Render Postgres, SSL no-verify |
| `NEXTAUTH_SECRET` / `ADMIN_SECRET` | JWT signing | **falls back to a hardcoded dev string if unset** |
| `RENDER_API_URL` | SMS relay | default `main-website-files.onrender.com` |
| `RENDER_API_KEY` | SMS relay | optional `X-API-Key`; if unset Render is open |
| `RENDER_SMS_PREVIEW_MODE` | SMS | `'true'` → redirect to test phone |
| `RENDER_SMS_TEST_PHONE` | SMS | preview recipient |
| `MAILCHIMP_API_KEY` | Mailchimp | server-side only |
| `MAILCHIMP_SERVER` | Mailchimp | datacenter, e.g. `us14` |
| `SENDGRID_API_KEY` | farm-request emails | |
| `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_PUBLIC_URL` | upload | Cloudflare R2 |
| `NEXT_PUBLIC_SITE_URL` | merge tags | default `https://www.pct.com` |
| `NODE_ENV` | cookie `secure` flag | |

---

## 9. Risks & sharp edges (brutal)

1. **JWT secret fallback.** If `NEXTAUTH_SECRET`/`ADMIN_SECRET` are not set in prod, JWTs are signed with `'dev-secret-change-me-in-env'` — anyone could forge an admin session. **Verify these are set in Vercel.** (`lib/admin-auth.ts:11`)
2. **Two rep catalogs that drift.** Team Admin writes Postgres `vcard_employees`; the Render Twilio relay reads legacy MySQL `pct_vcard`. A rep created/edited here is invisible to SMS routing until MySQL is synced. Mailchimp audiences and `sales_reps_data.json` add a third surface.
3. **No server-side role/office scoping.** `officeId` is in the JWT but never used to filter. Every authenticated admin (manager or super) can edit every employee and send to everyone.
4. **Render endpoints may be unauthenticated.** `RENDER_API_KEY` is optional in the client; if unset, `/api/send-batch` etc. accept anonymous POSTs that send real SMS.
5. **Public intake endpoints are unauthenticated and unrate-limited.** `/api/farm-request` and `/api/assessment` accept arbitrary POSTs — each farm request triggers 2 SendGrid emails + 1 SMS, so they're an abuse/cost vector. No CAPTCHA/honeypot in the route.
6. **Schema lives in app code.** The five `vcard_*` marketing tables are created by `ensureExtraTables()` at runtime, not migrations — easy to lose track of, and the lazy-init pattern means the first request after deploy pays the DDL cost.
7. **Secrets in the repo's own docs.** `docs/SYSTEMS-TECHNICAL-INTERNALS.md` contains a live-looking Twilio Account SID, a MySQL host/user, and a plaintext DB password. Those should be rotated and scrubbed from the repo regardless of the new system. (Per PCT policy, credential *values* were intentionally excluded from THIS document.)
8. **SSL `rejectUnauthorized: false`** on both Postgres pools disables cert verification (MITM exposure on the DB connection).
9. **HTML email built by string concatenation** in `/api/farm-request` interpolates `contact_name`, `notes`, etc. directly into HTML — stored/forwarded XSS surface in the rep's inbox and in the admin farm view if rendered as HTML.

---

## 10. Quick reference — where to look

| You want… | Go to |
|---|---|
| Auth/JWT logic | `lib/admin-auth.ts`, `middleware.ts` |
| All admin DB queries + table DDL | `lib/admin-db.ts` |
| Public-safe employee reads | `lib/vcard-db.ts` |
| Employee type/photo logic | `types/employee.ts` |
| Twilio relay client | `lib/render-sms.ts` |
| Assessment questions/scoring | `lib/assessment-config.ts`, `app/api/assessment/route.ts` |
| Mailchimp campaign logic | `app/api/admin/marketing/studio/route.ts` |
| R2 upload (SigV4) | `app/api/admin/upload/route.ts` |
| Inbound Twilio webhook | `app/api/sms/route.ts` |
| vCard generation | `app/api/team/[slug]/vcf/route.ts` |
| Sidebar / nav | `components/admin/AdminSidebar.tsx` |
| Legacy PHP system | `docs/SYSTEMS-TECHNICAL-INTERNALS.md`, `docs/vcard-new-system-map.canvas.tsx` |
