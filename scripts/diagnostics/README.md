# Diagnostic & One-Off Scripts

Read-only investigation queries and one-off operational helpers that are
useful but not part of the application runtime. Kept here so they don't
clutter `scripts/` (which holds repeatable seeders, backfills, and
verification scripts).

## Conventions

- All scripts load env from `.env.local` at the repo root.
- Run from the **repo root** (not from this folder) so `process.cwd()`
  resolves correctly.
- All `investigate-*.ts` scripts are read-only (`SELECT` only).
- All write/upload scripts are gated by an explicit CLI argument and print
  a BEFORE/AFTER row so the change is auditable.
- Scripts are invoked via `tsx`. Use `--env-file=.env.local` when the
  script doesn't load env itself (only the photo helpers need it; the
  others self-load via `loadEnvFile`).

## Read-only investigation scripts

### `investigate-employee-schema.ts`

Dumps the `vcard_employees` table schema (column name, data type,
nullability) plus a row-count summary (total / active / active with
Mailchimp audience).

**When:** Verifying the sales-rep schema before writing migrations or
audience-backfill scripts.

```bash
npx tsx scripts/diagnostics/investigate-employee-schema.ts
```

### `investigate-rep-counts.ts`

Quick counts on `vcard_employees`: total, active, and active-with-Mailchimp.
Lighter than `investigate-employee-schema.ts` — counts only, no schema dump.

**When:** Sanity-checking rep counts after a CSV import or backfill.

```bash
npx tsx scripts/diagnostics/investigate-rep-counts.ts
```

### `investigate-signature-data.ts`

Read-only inspection of `staff_members` + `office_locations` for Jerry
Hernandez specifically. Shows the staff_members column list, Jerry's row,
and the office_locations referenced by his `office_location` slug.

**When:** Debugging signature rendering issues for a specific employee.
Adapt the email constant to inspect a different staff member.

```bash
npx tsx scripts/diagnostics/investigate-signature-data.ts
```

### `investigate-template-html.ts`

Dumps full `html_content` of every row in `vcard_email_templates` to
stdout (and optionally to disk). Useful when the rendered email differs
from the editor preview and you want to compare what's actually in the DB.

**When:** Debugging template-rendering bugs or auditing what the
production DB currently has.

```bash
npx tsx scripts/diagnostics/investigate-template-html.ts
```

### `investigate-templates.ts`

Lighter version of the above: lists `id`, `name`, `category`, `LENGTH`,
`updated_at`, and a sha256 hash of `html_content` for each template.
No full HTML body — useful for spotting drift between environments.

**When:** Comparing template state across deployments without dumping
multi-KB HTML bodies.

```bash
npx tsx scripts/diagnostics/investigate-templates.ts
```

### `verify-openai-key.ts`

Read-only smoke test: hits `GET https://api.openai.com/v1/models` with the
configured key. Prints a one-line pass/fail. Checks `OPENAI_API_KEY` first,
then falls back to legacy `Open_Ai_Key` / `OPEN_AI_KEY` names.

**When:** After rotating the OpenAI key, after renaming the env var, or
when the AI generate endpoint returns 503.

```bash
npx tsx scripts/diagnostics/verify-openai-key.ts
```

## One-off operational helpers (write scripts)

### `set-staff-photo.ts`

Sets `staff_members.photo_url` for a single staff member by email. Wraps
the UPDATE in a transaction and prints BEFORE/AFTER rows so the change is
auditable. Needed because the Render Postgres MCP is read-only by design.

**When:** Manually assigning a photo URL until the Photo Upload UI ships
to self-service in Phase 2.

```bash
npx tsx --env-file=.env.local scripts/diagnostics/set-staff-photo.ts \
  ghernandez@pct.com \
  https://pub-dbe01c2b9ef0457c979ef76b8d8618f3.r2.dev/marketing/jerry-hernandez.png
```

### `upload-photo-to-r2.ts`

Uploads a local image to Cloudflare R2 with an explicit object key. Mirrors
the SigV4 logic in `app/api/admin/upload/route.ts` but lets the caller pin
the destination filename (so we get stable URLs like
`marketing/jerry-hernandez.png` instead of the route's random
timestamp-based names).

**When:** One-off uploads where the public URL needs to be predictable
(staff headshots, marketing assets that need stable links). For
user-uploaded content the API route at `/api/admin/upload` is the right
choice.

```bash
npx tsx --env-file=.env.local scripts/diagnostics/upload-photo-to-r2.ts \
  Jerry.png \
  marketing/jerry-hernandez.png
```

---

## Adding a new diagnostic script

1. Drop it in this folder.
2. Read-only by default; if it writes, gate the write behind an explicit
   CLI argument and print BEFORE/AFTER.
3. Self-load env via the `loadEnvFile` helper pattern used by the existing
   `investigate-*` scripts, OR document `--env-file=.env.local` in the
   example.
4. Add a one-paragraph entry above with **purpose**, **when to use**, and
   an **example invocation**.
