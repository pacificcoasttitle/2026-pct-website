# Marketing Center — Email + SMS

**Last verified:** 2026-05-22 · **Maintained by:** Documentation Agent · **Source of truth:** `/docs/system/marketing-center.md`

## Overview

The Marketing Center lets admins build reusable email templates, then fan a single template out to many sales reps as **personalized Mailchimp campaigns** — one campaign per rep, each targeting that rep's own Mailchimp audience, grouped under a single `batch_id`. It also drives the SMS Studio (covered briefly here; Twilio relay details in `integrations.md`). Lives at `/admin/team/marketing` and `/admin/team/sms`.

## Architecture

```
 Admin UI (CampaignWizard / TemplatesManager)
        │  POST /api/admin/marketing/campaigns/batch
        ▼
 batch route ── for each repSlug (concurrency 5) ──┐
   resolve template ──▶ replaceMergeTags()         │
                    ──▶ resolveHeroImage()          │
   createMailchimpCampaign() ──▶ POST /campaigns    │ Mailchimp
                              ──▶ PUT  /content      │ (us-DC API)
   action: draft | schedule | send                  │
     schedule ▶ computeScheduleTime(30) → /actions/schedule
     send     ▶ /actions/send                        │
   createEmailCampaignLog(batch_id, rep_slug, …) ───┴─▶ Postgres
        ▼
 returns { batchId, scheduleTime, total, successful, failed, campaigns[] }
```

## Database tables

All in PostgreSQL, created/migrated by `ensureExtraTables()` in `lib/admin-db.ts`.

- **`vcard_employees`** — the rep roster. Marketing reads `mailchimp_audience_id` (the rep's Mailchimp **list ID**), `name`, `title`, `email`, `phone`, `photo_url`, `slug`. A rep with no `mailchimp_audience_id` is **skipped** by the batch.
- **`vcard_email_templates`** — `id, name, subject, preheader, html_content, thumbnail_url, category, created_by, updated_by, created_at, updated_at`. Four templates (`product`, `title_news`, `market_update`, `holidays`) are **seeded on first GET** via `seedDefaultTemplates()`.
- **`vcard_email_campaigns`** — `id, name, subject, audience_id, template_id → vcard_email_templates, mailchimp_campaign_id, mailchimp_web_id, status, scheduled_at, notes, created_at` plus the batch columns **`batch_id UUID`, `rep_slug`, `reply_to_mode`** (added by `ALTER … ADD COLUMN IF NOT EXISTS`; indexed on `batch_id`). One row per rep-campaign.

## API endpoints

| Method · Path | Purpose | Key payload |
|---|---|---|
| `GET /api/admin/marketing/studio` | List templates + recent campaign logs; seeds defaults | — |
| `POST /api/admin/marketing/studio` | `action: 'save-template'` or `'create-campaign'` (single-rep, legacy) | `name, subject, html_content`; or `campaignName, audienceId, subject, repSlug, sendNow` |
| `GET /api/admin/marketing/studio/[id]` | Fetch one template | — |
| `POST /api/admin/marketing/campaigns/batch` | **Multi-rep batch** — 1 campaign per rep | `templateId, repSlugs[], subject, preheader, heroImageUrl, campaignNamePrefix, fromName, replyToMode('global'|'rep'), replyToGlobal, action('draft'|'schedule'|'send')` |
| `GET /api/admin/marketing/campaigns/batches` | List batch summaries (+ legacy non-batch tail) | `?limit` |
| `GET /api/admin/marketing/campaigns/batch/[batchId]` | Campaigns within one batch | — |
| `POST /api/admin/marketing/campaigns/batch/[batchId]/cancel` | Unschedule all scheduled campaigns in a batch | — |
| `GET /api/admin/mailchimp?audienceId=` | Proxy for one audience's live stats | — |

All require a valid `pct_admin` session (`isAuthenticated()`); the Mailchimp API key never reaches the client.

## Campaign creation flow (batch)

`app/api/admin/marketing/campaigns/batch/route.ts`:
1. Validate: `templateId`, non-empty `repSlugs[]`, `subject`, `campaignNamePrefix`; `replyToGlobal` required when `replyToMode='global'`.
2. Resolve the template once; dedupe slugs (first-seen order); mint `batchId = randomUUID()`.
3. **`runWithConcurrency(slugs, 5, worker)`** — soft limit of `CONCURRENCY = 5`.
4. Per rep: look up rep → skip if missing or no `mailchimp_audience_id`; compute `replyTo` (rep email or global); `replaceMergeTags()` then `resolveHeroImage()`; `createMailchimpCampaign()` (POST `/campaigns` + PUT `/content`); apply the action; `createEmailCampaignLog()` with `batch_id`, `rep_slug`, `reply_to_mode`.
5. Return `{ batchId, scheduleTime, total, successful, failed, campaigns[] }`. Each `campaigns[]` entry has `status: draft|scheduled|sent|failed|skipped`.

## 30-minute scheduled send pattern

`lib/mailchimp-schedule.ts` mirrors the legacy `mailchimp_manager.py`:
- `SCHEDULE_DELAY_MINUTES = 30` (in the batch route).
- `computeScheduleTime(30)` = `now + 30min`, then **rounded UP to the next quarter-hour** (00/15/30/45 UTC), seconds/ms zeroed. If already on a boundary it bumps to the next — so a 30-min delay never yields a sub-30-min schedule (Mailchimp requires quarter-hour boundaries).
- `toMailchimpScheduleString()` emits `YYYY-MM-DDTHH:MM:SS+00:00` (explicit UTC offset, for parity with the legacy system).
- The chosen 30-min buffer gives the marketer time to **cancel** before send (`/cancel` → `unscheduleCampaign`).

## Batch system (batch_id grouping)

Every campaign in one "send" shares a `batch_id` UUID written to `vcard_email_campaigns`. `getEmailCampaignBatches()` groups by `batch_id` for the history list (with a legacy non-batch tail), and `getBatchCampaigns(batchId)` returns each rep-campaign joined to rep name. This is what powers `RecentBatches.tsx` / `BatchDetail.tsx`.

## Available merge tags

Resolved server-side before HTML is sent to Mailchimp (`lib/marketing-mailchimp.ts`):

| Tag | Source |
|---|---|
| `{{REP_NAME}}` | `vcard_employees.name` |
| `{{REP_TITLE}}` | `.title` |
| `{{REP_EMAIL}}` | `.email` |
| `{{REP_PHONE}}` | `.phone` |
| `{{REP_PHOTO}}` | `.photo_url` |
| `{{REP_URL}}` | `NEXT_PUBLIC_SITE_URL/<slug>` (studio route only) |
| `{{HERO_IMAGE}}` | uploaded hero URL; if empty, the wrapping `<img …>` is **stripped** so no broken image renders |

## TinyMCE editor specifics

⚠️ NEEDS REVIEW: The brief references a TinyMCE editor. This repo's template editing is `components/admin/marketing/TemplateEditor.tsx` / `TemplatesManager.tsx`; I did not open them this pass to confirm whether they embed TinyMCE or a different rich-text/raw-HTML editor. Templates are ultimately stored as raw `html_content` with `{{...}}` merge tags. **Action:** open `TemplateEditor.tsx` to confirm the editor library before relying on this section.

## Hero image flow (R2 upload, replacement)

- Admin uploads an image → `POST /api/admin/upload` → Cloudflare R2 via hand-rolled AWS SigV4 (`app/api/admin/upload/route.ts`). Non-`prefix` uploads land in `marketing/<stem>.<ext>`; the public CDN URL (`R2_PUBLIC_URL/<key>`) is returned.
- That URL is passed as `heroImageUrl`; `resolveHeroImage()` substitutes `{{HERO_IMAGE}}` per rep, or strips the image tag if blank.

## Code References

- `app/api/admin/marketing/campaigns/batch/route.ts:34` — `CONCURRENCY=5`, `SCHEDULE_DELAY_MINUTES=30`
- `lib/mailchimp-schedule.ts:27` — `computeScheduleTime`
- `lib/marketing-mailchimp.ts:22` — `replaceMergeTags`; `:40` — `resolveHeroImage`; `:79` — `createMailchimpCampaign`
- `lib/admin-db.ts:520` — `vcard_email_campaigns` DDL; `:535` — batch_id ALTER; `:1117` — `getEmailCampaignBatches`

## Common Tasks

- **Send a newsletter to all reps:** pick template → select rep slugs → set subject/preheader/hero → `action:'schedule'` → review in RecentBatches → `/cancel` if needed before the quarter-hour fires.
- **Find reps missing an audience:** the marketing page lists active+website-live reps with no `mailchimp_audience_id`; or run `scripts/list-mailchimp-audiences.js`.

## Gotchas / Notes

- Reps without `mailchimp_audience_id` are silently `skipped` (logged to server console, surfaced as `status:'skipped'`).
- A DB log failure does **not** abort the Mailchimp campaign (wrapped in try/catch) — the campaign exists in Mailchimp even if the local row is missing.
- Mailchimp datacenter is set by `MAILCHIMP_SERVER` (e.g. `us17`); the edit URL is built from it.

---
*This document is maintained by the Documentation Agent. To regenerate or update, see `claude-skills.md` → Documentation Agent role.*
