# 📋 PCT VCard Database Export Specification

**Purpose:** Export all data from GoDaddy MySQL for migration to Vercel  
**Database:** `pct_vcard` @ `132.148.215.120`  
**Requested By:** Marketing / Development Team  
**Date:** February 27, 2026

---

## 1. Database Schema (DDL)

**What we need:**
- `CREATE TABLE` statements for **every table** in the `pct_vcard` database
- Include: table names, column names, data types, nullable/not-null, default values, indexes, foreign keys

**Output:** Single SQL file named `pct_vcard_schema.sql`

**How to export (phpMyAdmin):**
1. Select `pct_vcard` database
2. Click "Export" tab
3. Choose "Custom" export method
4. Under "Format-specific options" → Check "Structure only"
5. Under "Object creation options" → Check all (indexes, auto_increment, etc.)
6. Click "Go" → Save as `pct_vcard_schema.sql`

---

## 2. Full Data Export — All Tables

**What we need:**
- Every table exported as **JSON** (preferred) or **CSV**
- One file per table
- All rows, all columns
- Include NULL values explicitly (don't skip empty fields)

**Known tables to export:**

| Table | Purpose |
|-------|---------|
| `employees` | Sales reps / team members |
| `farm_requests` | Lead form submissions |
| `assessments` | Tool competency assessments |
| `admin_users` | Admin panel credentials |
| `departments` | Department listings |
| `offices` | Branch/office locations |
| *(any other tables)* | Export everything |

**Output:** Folder named `pct_vcard_data/` containing:
```
pct_vcard_data/
├── employees.json
├── farm_requests.json
├── assessments.json
├── admin_users.json
├── departments.json
├── offices.json
└── [any_other_table].json
```

**How to export (phpMyAdmin):**
1. Select table
2. Click "Export" tab
3. Format: JSON
4. Click "Go" → Save with table name

**Alternative (MySQL CLI):**
```bash
# Export as JSON
mysql -h 132.148.215.120 -u pctcursor1 -p pct_vcard \
  -e "SELECT * FROM employees" \
  --batch --raw | python -c "import sys,json,csv; print(json.dumps(list(csv.DictReader(sys.stdin, delimiter='\t'))))" \
  > employees.json
```

---

## 3. Employee Record — Field Inventory ✅ KNOWN

Based on code analysis, we already know the `employees` table schema:

### Core Fields (Confirmed)

| Category | Column Names | Notes |
|----------|--------------|-------|
| **Identity** | `id`, `slug`, `first_name`, `last_name` | `slug` = URL slug (john-doe) |
| **Title/Role** | `title`, `department_id`, `office_id` | FKs to lookup tables |
| **Contact** | `email`, `phone`, `mobile` | phone = office line |
| **Photo** | `photo_url`, `background_image`, `qr_code_url` | URL or path |
| **Social** | `linkedin`, `facebook`, `instagram`, `twitter`, `website` | Full URLs |
| **Bio** | `bio`, `languages`, `specialties` | languages/specialties = comma-separated |
| **SMS** | `sms_code` | e.g., "C-1", "C-2", "C-31" |
| **Settings** | `theme_color`, `show_qr`, `show_social`, `show_bio`, `analytics_enabled` | Booleans |
| **Status** | `active`, `featured` | Booleans |
| **Analytics** | `view_count`, `save_count` | Integers |
| **System** | `created_at`, `updated_at`, `created_by` | Timestamps |

### Website-Specific Fields

| Column | Purpose |
|--------|---------|
| `website_active` | Show on pct.com team page? |
| `website_bio` | Separate bio for website |
| `website_specialties` | Website-specific specialties |
| `website_hero_image` | Hero image for rep page |
| `website_custom_title` | Custom page title |
| `website_meta_description` | SEO meta description |
| `website_created_at` | When website was enabled |
| `website_updated_at` | Last website update |
| `mailchimp_form_code` | Mailchimp signup form code |
| `mailchimp_audience_id` | Mailchimp audience/list ID |

### Still Confirm

Run `DESCRIBE employees;` to confirm any additional columns not in code:

```sql
DESCRIBE employees;
```

**Output:** Text file or screenshot (just to verify nothing is missing)

---

## 4. Photo Assets

**What we need:**
- All employee headshot photos
- ZIP file with original filenames (as stored in database)
- Include all size variants if they exist (thumbnail, full, etc.)

**Acceptable formats:** JPG, PNG, WebP

**Current location (likely):**
```
pct.com/vcard-new/assets/photos/
pct.com/vcard-new/uploads/
```

**Output:** `employee_photos.zip`

**Destination:** We'll serve from `/public/team/` in the Next.js app

---

## 5. PHP Template Reference

**What we need:**
- View the source HTML of ONE live employee page
- Example: Right-click → "View Page Source" on any vCard page

**Why:** Shows us what fields are actually displayed and the layout structure

**Output:** Save as `sample_vcard_rendered.html`

**Not needed:** The PHP source code itself

---

## 6. Current URL Pattern ✅ KNOWN

Based on existing documentation:

| Type | URL Pattern |
|------|-------------|
| **VCard Pages** | `https://pct.com/vcard-new/[slug]` |
| **Example** | `https://pct.com/vcard-new/john-doe` |
| **Admin Panel** | `https://pct.com/vcard-new/admin/` |
| **Farm Request** | `https://pct.com/vcard-new/farm-request/` |
| **Assessment** | `https://pct.com/vcard-new/assessment/` |

**Redirect rules needed:**
```
/vcard-new/[slug] → /team/[slug]  (301 permanent)
/vcard-new/admin/ → /admin/       (301 permanent)
```

---

## 7. Render API Reference ✅ DOCUMENTED

The Render.com API handles SMS/MMS distribution. Here's what we know:

### Base URL
```
https://main-website-files.onrender.com
```

### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/health` | Health check, connection status |
| POST | `/api/send-batch` | Send MMS to multiple reps |
| POST | `/api/send-single` | Send single test SMS |

### Health Check Response
```json
{
  "status": "healthy",
  "twilio_configured": true,
  "database_configured": true,
  "database_connected": true,
  "sales_reps_count": 31,
  "preview_mode": true
}
```

### Send Batch Request
```json
POST /api/send-batch
Content-Type: application/json

{
  "images": [
    {"url": "https://pct.com/vcard-new/social-media-sms/sent/page_01.jpg"},
    {"url": "https://pct.com/vcard-new/social-media-sms/sent/page_02.jpg"}
  ],
  "message": "Here's your custom social media post!",
  "send_to_all": false
}
```

### Send Batch Response
```json
{
  "success": true,
  "total": 31,
  "successful": 31,
  "failed": 0,
  "results": [...]
}
```

### Authentication
- **No API key required** (internal use only)
- Preview mode controlled via Render environment variables

### Database Connection
- **Same MySQL database:** `pct_vcard` @ `132.148.215.120`
- Queries `employees` table for active reps with mobile numbers

### Environment Variables (Render)
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=[redacted]
TWILIO_FROM_NUMBER=+18186965791
DB_HOST=132.148.215.120
DB_PORT=3306
DB_USER=pctcursor1
DB_PASSWORD=[redacted]
DB_NAME=pct_vcard
PREVIEW_MODE=true
TEST_PHONE_NUMBER=+18186965791
```

---

## 📦 Export Checklist

| # | Item | Format | Required | Status |
|---|------|--------|----------|--------|
| 1 | Database Schema | `.sql` | ✅ Yes | ⬜ Pending |
| 2 | All Table Data | `.json` per table | ✅ Yes | ⬜ Pending |
| 3 | Employees DESCRIBE | Text/Screenshot | ✅ Yes | ⬜ Pending |
| 4 | Photo Assets | `.zip` | ✅ Yes | ⬜ Pending |
| 5 | Sample HTML | `.html` | ⚠️ Helpful | ⬜ Pending |
| 6 | URL Pattern | N/A | ✅ Known | ✅ Done |
| 7 | Render API | N/A | ✅ Known | ✅ Done |

---

## 🚀 Once We Have This

With items 1-4, we can immediately begin:
1. Creating the MySQL → TypeScript type definitions
2. Building the `/team/[slug]` pages
3. Migrating employee photos to Vercel
4. Setting up the admin panel extensions

**Questions?** Contact the development team.

---

**Document Version:** 1.0  
**Created:** February 27, 2026
