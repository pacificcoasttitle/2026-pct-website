// ============================================================
// PCT Admin — database query helpers (Node.js runtime only)
// ============================================================

import { Pool } from 'pg'
import { randomUUID } from 'node:crypto'
import type { Employee } from '@/types/employee'
import { ASSET_DELIVERY_HTML } from '@/lib/email-templates/asset-delivery'
import { CORPORATE_STANDARD_HTML } from '@/lib/signature-templates/corporate-standard'
import {
  HOLIDAY_GREETING_HTML,
  HOLIDAY_GREETING_META,
} from '@/lib/email-templates/holiday-greeting'
import {
  PRODUCT_SPOTLIGHT_HTML,
  PRODUCT_SPOTLIGHT_META,
} from '@/lib/email-templates/product-spotlight'
import {
  TITLE_INDUSTRY_NEWS_HTML,
  TITLE_INDUSTRY_NEWS_META,
} from '@/lib/email-templates/title-industry-news'
import {
  MARKET_UPDATE_HTML,
  MARKET_UPDATE_META,
} from '@/lib/email-templates/market-update'

let _pool: Pool | null = null
export function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
    })
  }
  return _pool
}

// ── Auth ──────────────────────────────────────────────────────

export interface AdminUser {
  id:            number
  username:      string
  email:         string
  password_hash: string
  role:          string
  office_id:     number | null
  first_name:    string | null
  last_name:     string | null
  active:        boolean
}

export async function getAdminByUsername(username: string): Promise<AdminUser | null> {
  const db = getPool()
  const res = await db.query(
    `SELECT id, username, email, password_hash, role, office_id, first_name, last_name, active
     FROM vcard_admin_users WHERE username = $1 LIMIT 1`,
    [username]
  )
  return res.rows[0] ?? null
}

export async function updateLastLogin(userId: number): Promise<void> {
  await getPool().query(
    `UPDATE vcard_admin_users SET last_login = NOW() WHERE id = $1`,
    [userId]
  )
}

// ── Dashboard Stats ───────────────────────────────────────────

export interface DashboardStats {
  totalEmployees:   number
  activeEmployees:  number
  websiteActive:    number
  byOffice:         { name: string; count: number }[]
  byDept:           { name: string; color: string; count: number }[]
  topViewed:        { slug: string; name: string; views: number }[]
  farmRequests:     number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const db = getPool()

  const [total, active, website, byOffice, byDept, topViewed, farm] = await Promise.all([
    db.query(`SELECT COUNT(*) FROM vcard_employees`),
    db.query(`SELECT COUNT(*) FROM vcard_employees WHERE active = true`),
    db.query(`SELECT COUNT(*) FROM vcard_employees WHERE active = true AND website_active = true`),
    db.query(`
      SELECT o.name, COUNT(e.id)::int AS count
      FROM vcard_offices o
      LEFT JOIN vcard_employees e ON e.office_id = o.id AND e.active = true
      GROUP BY o.id, o.name ORDER BY o.name
    `),
    db.query(`
      SELECT d.name, d.color, COUNT(e.id)::int AS count
      FROM vcard_departments d
      LEFT JOIN vcard_employees e ON e.department_id = d.id AND e.active = true
      GROUP BY d.id, d.name, d.color ORDER BY count DESC
    `),
    db.query(`
      SELECT slug, first_name || ' ' || last_name AS name, view_count AS views
      FROM vcard_employees WHERE active = true
      ORDER BY view_count DESC LIMIT 5
    `),
    db.query(`SELECT COUNT(*) FROM vcard_farm_requests WHERE status = 'pending'`),
  ])

  return {
    totalEmployees:  parseInt(total.rows[0].count),
    activeEmployees: parseInt(active.rows[0].count),
    websiteActive:   parseInt(website.rows[0].count),
    byOffice:        byOffice.rows,
    byDept:          byDept.rows,
    topViewed:       topViewed.rows,
    farmRequests:    parseInt(farm.rows[0].count),
  }
}

// ── Employees (admin view — includes inactive) ────────────────

const ADMIN_COLS = `
  e.id, e.slug, e.first_name, e.last_name,
  e.first_name || ' ' || e.last_name AS name,
  e.title, e.department_id, e.office_id,
  e.email, e.phone, e.mobile, e.sms_code,
  e.bio, e.photo_url, e.languages, e.specialties,
  e.linkedin, e.theme_color,
  e.active, e.featured, e.sales_manager, e.website_active,
  e.website_bio, e.website_specialties,
  e.mailchimp_form_code, e.mailchimp_audience_id,
  e.website_hero_image, e.website_custom_title, e.website_meta_description,
  e.view_count, e.save_count,
  e.facebook, e.instagram, e.twitter, e.website,
  e.created_at, e.updated_at,
  o.name AS office_name,
  d.name AS dept_name, d.color AS dept_color
`

export interface AdminEmployee {
  id:                      number
  slug:                    string
  first_name:              string
  last_name:               string
  name:                    string
  title:                   string | null
  department_id:           number | null
  office_id:               number | null
  email:                   string | null
  phone:                   string | null
  mobile:                  string | null
  // sms_code: TEXT, nullable. Format: C-<n> (e.g., 'C-4', 'C-28').
  // IMPORTANT: NOT unique. Multiple reps may share a code when they
  // form a "team account" (e.g., Lopez team: Hugo, Jesse, Izzy all
  // share C-4). Lookups by sms_code resolve to the lowest-id active
  // holder, who is treated as the senior team rep. Email delivery
  // uses that senior rep's email. See Asset Delivery + SMS Studio
  // for the team-code lookup pattern.
  sms_code:                string | null
  bio:                     string | null
  photo_url:               string | null
  languages:               string | null
  specialties:             string | null
  linkedin:                string | null
  theme_color:             string | null
  active:                  boolean
  featured:                boolean
  sales_manager:           boolean
  website_active:          boolean
  website_bio:             string | null
  website_specialties:     string | null
  mailchimp_form_code:     string | null
  mailchimp_audience_id:   string | null
  website_hero_image:      string | null
  website_custom_title:    string | null
  website_meta_description: string | null
  view_count:              number
  save_count:              number
  facebook:                string | null
  instagram:               string | null
  twitter:                 string | null
  website:                 string | null
  created_at:              string
  updated_at:              string
  office_name:             string | null
  dept_name:               string | null
  dept_color:              string | null
}

export async function getAllEmployeesAdmin(): Promise<AdminEmployee[]> {
  const db = getPool()
  const res = await db.query(`
    SELECT ${ADMIN_COLS}
    FROM vcard_employees e
    LEFT JOIN vcard_offices o ON o.id = e.office_id
    LEFT JOIN vcard_departments d ON d.id = e.department_id
    ORDER BY e.active DESC, e.last_name ASC
  `)
  return res.rows
}

export async function getEmployeeAdminBySlug(slug: string): Promise<AdminEmployee | null> {
  const db = getPool()
  const res = await db.query(`
    SELECT ${ADMIN_COLS}
    FROM vcard_employees e
    LEFT JOIN vcard_offices o ON o.id = e.office_id
    LEFT JOIN vcard_departments d ON d.id = e.department_id
    WHERE e.slug = $1 LIMIT 1
  `, [slug])
  return res.rows[0] ?? null
}

export interface EmployeeUpdatePayload {
  first_name?:              string
  last_name?:               string
  title?:                   string
  email?:                   string
  phone?:                   string
  mobile?:                  string
  bio?:                     string
  photo_url?:               string
  languages?:               string
  specialties?:             string
  linkedin?:                string
  office_id?:               number | null
  department_id?:           number | null
  active?:                  boolean
  featured?:                boolean
  sales_manager?:           boolean
  website_active?:          boolean
  website_bio?:             string
  website_specialties?:     string
  website_custom_title?:    string
  website_meta_description?: string
  mailchimp_audience_id?:   string
  mailchimp_form_code?:     string
}

export async function updateEmployee(slug: string, data: EmployeeUpdatePayload): Promise<AdminEmployee | null> {
  const db    = getPool()
  const keys  = Object.keys(data) as (keyof EmployeeUpdatePayload)[]
  if (keys.length === 0) return getEmployeeAdminBySlug(slug)

  const sets   = keys.map((k, i) => `${k} = $${i + 2}`).join(', ')
  const values = keys.map((k) => data[k])

  await db.query(
    `UPDATE vcard_employees SET ${sets}, updated_at = NOW() WHERE slug = $1`,
    [slug, ...values]
  )
  return getEmployeeAdminBySlug(slug)
}

// ── Create a new employee ─────────────────────────────────────

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')   // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60) || 'employee'
}

async function ensureUniqueSlug(base: string): Promise<string> {
  const db = getPool()
  let slug = base
  let n    = 1
  // Loop until we find a free slug. Bounded to avoid pathological cases.
  while (n < 100) {
    const res = await db.query(`SELECT 1 FROM vcard_employees WHERE slug = $1 LIMIT 1`, [slug])
    if (res.rowCount === 0) return slug
    n += 1
    slug = `${base}-${n}`
  }
  // Fallback: append a timestamp suffix
  return `${base}-${Date.now()}`
}

/**
 * Default bio template used during initial setup of a new employee.
 * Uses {first_name} placeholder so the marketing team can fine-tune
 * the wording later from the edit screen.
 */
export const DEFAULT_EMPLOYEE_BIO =
  "{first_name} is dedicated to helping real estate agents and lending partners across Southern California grow their business with Pacific Coast Title. With a hands-on approach and deep knowledge of the title and escrow process, {first_name} makes sure your clients feel supported from contract to close — every time."

export function renderDefaultBio(firstName: string): string {
  const name = (firstName || '').trim() || 'Your rep'
  return DEFAULT_EMPLOYEE_BIO.replace(/\{first_name\}/g, name)
}

export interface CreateEmployeeInput {
  first_name:     string
  last_name:      string
  title?:         string
  email?:         string
  mobile?:        string
  phone?:         string
  office_id?:     number | null
  department_id?: number | null
  sms_code?:      string
  active?:        boolean
  sales_manager?: boolean
  website_active?: boolean
  bio?:           string
  website_bio?:   string
  photo_url?:     string
}

export async function createEmployee(input: CreateEmployeeInput): Promise<AdminEmployee> {
  const db = getPool()
  const first = input.first_name.trim()
  const last  = input.last_name.trim()
  if (!first || !last) throw new Error('first_name and last_name are required')

  const slug = await ensureUniqueSlug(slugify(`${first}-${last}`))

  // Optional sms_code uniqueness check (not enforced at DB level historically).
  if (input.sms_code && input.sms_code.trim()) {
    const code = input.sms_code.trim().toUpperCase()
    const dup  = await db.query(
      `SELECT slug FROM vcard_employees WHERE UPPER(sms_code) = $1 LIMIT 1`,
      [code],
    )
    if (dup.rowCount && dup.rowCount > 0) {
      throw new Error(`SMS code ${code} is already used by ${dup.rows[0].slug}`)
    }
  }

  const cols: string[] = ['slug', 'first_name', 'last_name']
  const vals: unknown[] = [slug, first, last]
  function add(col: string, value: unknown) {
    if (value === undefined || value === null || value === '') return
    cols.push(col)
    vals.push(value)
  }
  add('title',          input.title?.trim())
  add('email',          input.email?.trim())
  add('mobile',         input.mobile?.trim())
  add('phone',          input.phone?.trim())
  add('office_id',      input.office_id ?? undefined)
  add('department_id',  input.department_id ?? undefined)
  add('sms_code',       input.sms_code?.trim().toUpperCase())
  add('photo_url',      input.photo_url?.trim())

  // Default the bio (and its public-website mirror) so new reps don't
  // have a blank profile while marketing finishes the polished copy.
  const bio = (input.bio && input.bio.trim()) || renderDefaultBio(first)
  add('bio', bio)
  add('website_bio', (input.website_bio && input.website_bio.trim()) || bio)
  cols.push('active')
  vals.push(input.active === false ? false : true)
  cols.push('sales_manager')
  vals.push(input.sales_manager === true)
  cols.push('website_active')
  vals.push(input.website_active === true)

  const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ')
  await db.query(
    `INSERT INTO vcard_employees (${cols.join(', ')}) VALUES (${placeholders})`,
    vals,
  )

  const created = await getEmployeeAdminBySlug(slug)
  if (!created) throw new Error('Insert succeeded but row not found')
  return created
}

// ── Farm Requests ─────────────────────────────────────────────

export interface FarmRequest {
  id:                number
  list_type:         string
  city_area:         string
  property_address:  string | null
  radius:            string | null
  list_size:         string
  output_formats:    string[]
  notes:             string | null
  contact_name:      string
  contact_email:     string
  contact_phone:     string | null
  rep_id:            string | null
  rep_name:          string | null
  rep_email:         string | null
  source_channel:    string
  status:            string
  notification_sent: boolean
  submitted_at:      string
  updated_at:        string
}

export async function getAllFarmRequests(): Promise<FarmRequest[]> {
  const db  = getPool()
  const res = await db.query(`
    SELECT id, list_type, city_area, property_address, radius, list_size,
           output_formats, notes, contact_name, contact_email, contact_phone,
           rep_id, rep_name, rep_email, source_channel, status,
           notification_sent, submitted_at, updated_at
    FROM vcard_farm_requests
    ORDER BY submitted_at DESC
  `)
  return res.rows.map((r) => ({
    ...r,
    output_formats: r.output_formats ?? [],
  }))
}

export async function updateFarmStatus(id: number, status: string): Promise<void> {
  await getPool().query(
    `UPDATE vcard_farm_requests SET status = $1, updated_at = NOW() WHERE id = $2`,
    [status, id]
  )
}

export async function insertFarmRequest(data: {
  list_type:        string
  city_area:        string
  property_address: string
  radius:           string
  list_size:        string
  output_formats:   string[]
  notes:            string
  contact_name:     string
  contact_email:    string
  contact_phone:    string
  rep_id:           string
  rep_name:         string
  rep_email:        string
  source_channel:   string
}): Promise<number> {
  const db  = getPool()
  const res = await db.query(`
    INSERT INTO vcard_farm_requests
      (list_type, city_area, property_address, radius, list_size,
       output_formats, notes, contact_name, contact_email, contact_phone,
       rep_id, rep_name, rep_email, source_channel, status, notification_sent)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'pending',false)
    RETURNING id
  `, [
    data.list_type, data.city_area, data.property_address || null, data.radius || null,
    data.list_size, JSON.stringify(data.output_formats), data.notes || null,
    data.contact_name, data.contact_email, data.contact_phone || null,
    data.rep_id || null, data.rep_name || null, data.rep_email || null,
    data.source_channel || 'web',
  ])
  return res.rows[0].id
}

// ── SMS ────────────────────────────────────────────────────────

export interface SmsEmployee {
  id:            number
  slug:          string
  name:          string
  first_name:    string
  sms_code:      string
  email:         string | null
  mobile:        string | null
  active:        boolean
  sms_opt_ins:   number
  last_sms_at:   string | null
}

export async function getSmsEmployees(): Promise<SmsEmployee[]> {
  const db  = getPool()
  const res = await db.query(`
    SELECT
      e.id, e.slug,
      e.first_name,
      e.first_name || ' ' || e.last_name AS name,
      e.sms_code, e.email, e.mobile, e.active,
      COUNT(a.id)::int AS sms_opt_ins,
      MAX(a.created_at)::text AS last_sms_at
    FROM vcard_employees e
    LEFT JOIN vcard_employee_activity a
      ON a.employee_id = e.id AND a.activity_type = 'sms_optin'
    WHERE e.sms_code IS NOT NULL AND e.sms_code <> ''
    GROUP BY e.id, e.slug, e.first_name, e.last_name, e.sms_code, e.email, e.mobile, e.active
    ORDER BY e.last_name ASC
  `)
  return res.rows
}

/**
 * Look up an active rep by SMS code (case-insensitive).
 *
 * Implements the "team code" rule: multiple active reps may share a
 * code (e.g., Hugo, Izzy, Jesse all hold C-4). When that happens we
 * return the lowest-id active holder, which the team treats as the
 * senior rep — email delivery, SMS replies, and Asset Delivery all
 * route through that senior rep's email/phone.
 *
 * Used by:
 *   - app/api/sms/route.ts                                (SMS opt-in reply)
 *   - app/api/assessment/route.ts                         (assessment attribution)
 *   - app/api/admin/marketing/asset-delivery/upload/route.ts (filename → rep)
 */
export interface EmployeeBySmsCode {
  id:         number
  slug:       string
  name:       string
  first_name: string
  last_name:  string
  email:      string | null
  phone:      string | null
  sms_code:   string
}

export async function getEmployeeBySmsCode(code: string): Promise<EmployeeBySmsCode | null> {
  const db  = getPool()
  const res = await db.query(
    `SELECT id, slug,
            first_name, last_name,
            first_name || ' ' || last_name AS name,
            email, phone, sms_code
     FROM vcard_employees
     WHERE UPPER(sms_code) = UPPER($1) AND active = true
     ORDER BY id ASC
     LIMIT 1`,
    [code]
  )
  return res.rows[0] ?? null
}

export async function getSmsEmployeeId(code: string): Promise<number | null> {
  const db  = getPool()
  const res = await db.query(
    `SELECT id FROM vcard_employees WHERE UPPER(sms_code) = UPPER($1) AND active = true LIMIT 1`,
    [code]
  )
  return res.rows[0]?.id ?? null
}

export async function logSmsActivity(employeeId: number, ip: string, meta: string): Promise<void> {
  await getPool().query(
    `INSERT INTO vcard_employee_activity (employee_id, activity_type, ip_address, metadata)
     VALUES ($1, 'sms_optin', $2, $3)`,
    [employeeId, ip, meta]
  )
}

// ── Offices & Departments (for dropdowns) ────────────────────

export async function getOfficesAndDepts() {
  const db = getPool()
  const [offices, depts] = await Promise.all([
    db.query(`SELECT id, name, city FROM vcard_offices ORDER BY name`),
    db.query(`SELECT id, name, color FROM vcard_departments ORDER BY name`),
  ])
  return {
    offices: offices.rows as { id: number; name: string; city: string | null }[],
    depts:   depts.rows   as { id: number; name: string; color: string }[],
  }
}

let _extraTablesReady = false
async function ensureExtraTables() {
  if (_extraTablesReady) return
  const db = getPool()
  await db.query(`
    CREATE TABLE IF NOT EXISTS vcard_email_templates (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      preheader TEXT,
      html_content TEXT NOT NULL,
      thumbnail_url TEXT,
      category TEXT,
      created_by TEXT,
      updated_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
  // Add category column if missing (existing installs)
  await db.query(`ALTER TABLE vcard_email_templates ADD COLUMN IF NOT EXISTS category TEXT;`)
  await db.query(`
    CREATE TABLE IF NOT EXISTS vcard_email_campaigns (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      audience_id TEXT,
      template_id INT REFERENCES vcard_email_templates(id) ON DELETE SET NULL,
      mailchimp_campaign_id TEXT,
      mailchimp_web_id TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      scheduled_at TIMESTAMPTZ,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
  // Batch-aware campaign columns (added 2026-05-21).
  // batch_id groups campaigns created together in a multi-rep batch.
  // rep_slug remembers which rep this campaign was personalised for.
  // reply_to_mode records whether reply-to was the global PCT inbox or the rep's own email.
  await db.query(`
    ALTER TABLE vcard_email_campaigns
      ADD COLUMN IF NOT EXISTS batch_id UUID,
      ADD COLUMN IF NOT EXISTS rep_slug TEXT,
      ADD COLUMN IF NOT EXISTS reply_to_mode TEXT DEFAULT 'global';
  `)
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_vcard_email_campaigns_batch_id
      ON vcard_email_campaigns(batch_id);
  `)
  await db.query(`
    CREATE TABLE IF NOT EXISTS vcard_assessments (
      id SERIAL PRIMARY KEY,
      respondent_name TEXT NOT NULL,
      respondent_email TEXT NOT NULL,
      respondent_phone TEXT,
      rep_id TEXT,
      rep_name TEXT,
      source_channel TEXT DEFAULT 'web',
      capability_score NUMERIC(5,2) NOT NULL,
      avg_confidence_score NUMERIC(3,2) NOT NULL,
      responses_json JSONB NOT NULL,
      confidence_json JSONB NOT NULL,
      user_agent TEXT,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
  await db.query(`CREATE INDEX IF NOT EXISTS idx_vcard_assessments_rep_id ON vcard_assessments(rep_id)`)
  await db.query(`CREATE INDEX IF NOT EXISTS idx_vcard_assessments_submitted ON vcard_assessments(submitted_at DESC)`)

  // SMS Studio send history
  await db.query(`
    CREATE TABLE IF NOT EXISTS vcard_sms_send_logs (
      id              SERIAL PRIMARY KEY,
      mode            TEXT NOT NULL,           -- 'mms' | 'text' | 'single-text'
      send_mode       TEXT,                    -- 'single' | 'per-image' | 'all'
      preview_mode    BOOLEAN NOT NULL DEFAULT FALSE,
      test_phone      TEXT,
      message         TEXT NOT NULL,
      image_urls      JSONB,
      total           INT NOT NULL DEFAULT 0,
      successful      INT NOT NULL DEFAULT 0,
      failed          INT NOT NULL DEFAULT 0,
      success         BOOLEAN NOT NULL DEFAULT FALSE,
      error           TEXT,
      raw_response    JSONB,
      actor           TEXT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
  await db.query(`CREATE INDEX IF NOT EXISTS idx_sms_logs_created ON vcard_sms_send_logs(created_at DESC)`)
  await db.query(`
    CREATE TABLE IF NOT EXISTS vcard_sms_send_log_recipients (
      id          SERIAL PRIMARY KEY,
      log_id      INT NOT NULL REFERENCES vcard_sms_send_logs(id) ON DELETE CASCADE,
      rep_slug    TEXT,
      rep_name    TEXT,
      sms_code    TEXT,
      phone_last4 TEXT,
      status      TEXT,                  -- 'sent' | 'failed' | 'skipped' | etc.
      error       TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
  await db.query(`CREATE INDEX IF NOT EXISTS idx_sms_log_recipients_log ON vcard_sms_send_log_recipients(log_id)`)

  _extraTablesReady = true
}

// ── SMS Send Log helpers ──────────────────────────────────────

export interface SmsSendLogRecipient {
  id?:          number
  rep_slug?:    string | null
  rep_name?:    string | null
  sms_code?:    string | null
  phone_last4?: string | null
  status?:      string | null
  error?:       string | null
}

export interface SmsSendLogInput {
  mode:          string
  send_mode?:    string | null
  preview_mode:  boolean
  test_phone?:   string | null
  message:       string
  image_urls?:   string[] | null
  total:         number
  successful:    number
  failed:        number
  success:       boolean
  error?:        string | null
  raw_response?: unknown
  actor?:        string | null
  recipients:    SmsSendLogRecipient[]
}

export interface SmsSendLogRow {
  id:           number
  mode:         string
  send_mode:    string | null
  preview_mode: boolean
  test_phone:   string | null
  message:      string
  image_urls:   string[] | null
  total:        number
  successful:   number
  failed:       number
  success:      boolean
  error:        string | null
  actor:        string | null
  created_at:   string
  recipient_count: number
}

function last4(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 4 ? digits.slice(-4) : digits || null
}

export async function recordSmsSendLog(input: SmsSendLogInput): Promise<number> {
  await ensureExtraTables()
  const db = getPool()
  const res = await db.query(
    `INSERT INTO vcard_sms_send_logs
       (mode, send_mode, preview_mode, test_phone, message, image_urls,
        total, successful, failed, success, error, raw_response, actor)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING id`,
    [
      input.mode,
      input.send_mode ?? null,
      input.preview_mode,
      input.test_phone ?? null,
      input.message,
      input.image_urls && input.image_urls.length ? JSON.stringify(input.image_urls) : null,
      input.total,
      input.successful,
      input.failed,
      input.success,
      input.error ?? null,
      input.raw_response ? JSON.stringify(input.raw_response) : null,
      input.actor ?? null,
    ],
  )
  const logId = res.rows[0].id as number

  if (input.recipients.length) {
    // Bulk insert recipients
    const values: unknown[] = []
    const placeholders = input.recipients.map((r, i) => {
      const base = i * 7
      values.push(
        logId,
        r.rep_slug    ?? null,
        r.rep_name    ?? null,
        r.sms_code    ?? null,
        r.phone_last4 ?? null,
        r.status      ?? null,
        r.error       ?? null,
      )
      return `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${base + 6},$${base + 7})`
    }).join(',')
    await db.query(
      `INSERT INTO vcard_sms_send_log_recipients
         (log_id, rep_slug, rep_name, sms_code, phone_last4, status, error)
       VALUES ${placeholders}`,
      values,
    )
  }

  return logId
}

export async function getSmsSendLogs(limit = 25): Promise<SmsSendLogRow[]> {
  await ensureExtraTables()
  const db = getPool()
  const res = await db.query(
    `SELECT l.id, l.mode, l.send_mode, l.preview_mode, l.test_phone, l.message,
            l.image_urls, l.total, l.successful, l.failed, l.success, l.error,
            l.actor, l.created_at::text,
            (SELECT COUNT(*)::int FROM vcard_sms_send_log_recipients r WHERE r.log_id = l.id) AS recipient_count
       FROM vcard_sms_send_logs l
       ORDER BY l.created_at DESC
       LIMIT $1`,
    [limit],
  )
  return res.rows
}

export async function getSmsSendLog(id: number): Promise<{ log: SmsSendLogRow; recipients: SmsSendLogRecipient[] } | null> {
  await ensureExtraTables()
  const db = getPool()
  const logRes = await db.query(
    `SELECT l.id, l.mode, l.send_mode, l.preview_mode, l.test_phone, l.message,
            l.image_urls, l.total, l.successful, l.failed, l.success, l.error,
            l.actor, l.created_at::text,
            (SELECT COUNT(*)::int FROM vcard_sms_send_log_recipients r WHERE r.log_id = l.id) AS recipient_count
       FROM vcard_sms_send_logs l
       WHERE l.id = $1`,
    [id],
  )
  if (logRes.rowCount === 0) return null
  const recRes = await db.query(
    `SELECT id, rep_slug, rep_name, sms_code, phone_last4, status, error
       FROM vcard_sms_send_log_recipients
       WHERE log_id = $1
       ORDER BY (status = 'sent') ASC, rep_name ASC, id ASC`,
    [id],
  )
  return { log: logRes.rows[0], recipients: recRes.rows }
}

/** Common keys the Render service may use to wrap the per-recipient list. */
const RECIPIENT_KEYS = [
  'recipients', 'results', 'sent_to', 'sent', 'targets',
  'deliveries', 'messages', 'message_results', 'details',
]

/**
 * Look for a per-recipient array anywhere in the response (top level,
 * common nested wrappers like `data`, `result`, `body`, or under any of
 * the canonical keys). Returns the first array found whose entries
 * look like recipient records (have name / phone / sms_code / status).
 */
function findRecipientArray(raw: unknown): unknown[] | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>

  for (const key of RECIPIENT_KEYS) {
    const v = obj[key]
    if (Array.isArray(v) && v.length > 0) return v
  }
  for (const wrapper of ['data', 'result', 'body', 'response']) {
    const inner = obj[wrapper]
    if (inner && typeof inner === 'object') {
      const found = findRecipientArray(inner)
      if (found) return found
    }
  }
  // Fall back: any array on the object whose first item looks like a recipient.
  for (const v of Object.values(obj)) {
    if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && v[0]) {
      const sample = v[0] as Record<string, unknown>
      if ('phone' in sample || 'sms_code' in sample || 'name' in sample || 'status' in sample) {
        return v
      }
    }
  }
  return null
}

function pick<T = unknown>(obj: Record<string, unknown>, ...keys: string[]): T | undefined {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k] as T
  }
  return undefined
}

/** Helper for the API route — turn a Render response + targets into recipient rows. */
export function buildRecipientsFromResponse(
  raw: unknown,
  fallbackTargets: SmsSendLogRecipient[] = [],
): SmsSendLogRecipient[] {
  const arr = findRecipientArray(raw)
  if (arr && arr.length > 0) {
    return arr.map((row) => {
      const x = (row || {}) as Record<string, unknown>
      const status = pick<string>(x, 'status', 'state', 'result', 'outcome')
      const phone  = pick<string>(x, 'phone', 'to', 'phone_number', 'mobile')
      const error  = pick<string>(x, 'error', 'error_message', 'reason', 'failure_reason', 'message')

      // If the row only carries a boolean `success`, derive a status string.
      let normalisedStatus = status ? String(status) : null
      if (!normalisedStatus && typeof x.success === 'boolean') {
        normalisedStatus = x.success ? 'sent' : 'failed'
      }

      return {
        rep_name:    pick<string>(x, 'name', 'rep_name', 'first_name')           ? String(pick(x, 'name', 'rep_name', 'first_name')) : null,
        sms_code:    pick<string>(x, 'sms_code', 'code', 'rep_code')             ? String(pick(x, 'sms_code', 'code', 'rep_code'))   : null,
        phone_last4: last4(phone ? String(phone) : null),
        status:      normalisedStatus,
        error:       error && normalisedStatus !== 'sent' ? String(error) : null,
      }
    })
  }
  return fallbackTargets.map((t) => ({ ...t, phone_last4: t.phone_last4 ?? null }))
}

export { last4 as smsPhoneLast4 }

export interface EmailTemplate {
  id: number
  name: string
  subject: string
  preheader: string | null
  html_content: string
  thumbnail_url: string | null
  category: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  await ensureExtraTables()
  const db = getPool()
  const res = await db.query(`
    SELECT id, name, subject, preheader, html_content, thumbnail_url, category, created_by, updated_by, created_at::text, updated_at::text
    FROM vcard_email_templates
    ORDER BY updated_at DESC
  `)
  return res.rows
}

export async function upsertEmailTemplate(input: {
  id?: number
  name: string
  subject: string
  preheader?: string
  html_content: string
  thumbnail_url?: string
  category?: string
  actor?: string
}): Promise<EmailTemplate> {
  await ensureExtraTables()
  const db = getPool()
  if (input.id) {
    const updated = await db.query(`
      UPDATE vcard_email_templates
      SET name = $1, subject = $2, preheader = $3, html_content = $4, thumbnail_url = $5, updated_by = $6, updated_at = NOW(), category = COALESCE($8, category)
      WHERE id = $7
      RETURNING id, name, subject, preheader, html_content, thumbnail_url, category, created_by, updated_by, created_at::text, updated_at::text
    `, [
      input.name,
      input.subject,
      input.preheader || null,
      input.html_content,
      input.thumbnail_url || null,
      input.actor || null,
      input.id,
      input.category || null,
    ])
    return updated.rows[0]
  }
  const created = await db.query(`
    INSERT INTO vcard_email_templates (name, subject, preheader, html_content, thumbnail_url, category, created_by, updated_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
    RETURNING id, name, subject, preheader, html_content, thumbnail_url, category, created_by, updated_by, created_at::text, updated_at::text
  `, [
    input.name,
    input.subject,
    input.preheader || null,
    input.html_content,
    input.thumbnail_url || null,
    input.category || null,
    input.actor || null,
  ])
  return created.rows[0]
}

// ── Seed 4 default templates (Product, Title News, Market Update, Holidays) ──
let _seeded = false
export async function seedDefaultTemplates(): Promise<void> {
  if (_seeded) return
  _seeded = true
  await ensureExtraTables()
  const db = getPool()
  const existing = await db.query(`SELECT DISTINCT category FROM vcard_email_templates WHERE category IS NOT NULL`)
  const cats = new Set(existing.rows.map((r: { category: string }) => r.category))

  const repCard = `<tr><td style="padding:24px 32px;background:#f8f6f3;border-radius:0 0 16px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="60" valign="top"><img src="{{REP_PHOTO}}" alt="{{REP_NAME}}" width="52" height="52" style="border-radius:50%;object-fit:cover;display:block;" /></td>
      <td style="padding-left:12px;">
        <p style="margin:0;font-weight:700;color:#03374f;font-size:14px;">{{REP_NAME}}</p>
        <p style="margin:2px 0 0;color:#6b7280;font-size:12px;">{{REP_TITLE}}</p>
        <p style="margin:4px 0 0;font-size:12px;"><a href="mailto:{{REP_EMAIL}}" style="color:#f26b2b;text-decoration:none;">{{REP_EMAIL}}</a> &middot; <a href="tel:{{REP_PHONE}}" style="color:#f26b2b;text-decoration:none;">{{REP_PHONE}}</a></p>
      </td>
    </tr></table>
  </td></tr>`

  const footer = `<tr><td style="padding:16px 32px;text-align:center;color:#9ca3af;font-size:11px;">
    Pacific Coast Title Company &middot; <a href="https://www.pct.com" style="color:#f26b2b;text-decoration:none;">pct.com</a><br/>
    <a href="mailto:{{REP_EMAIL}}" style="color:#f26b2b;text-decoration:none;font-size:11px;">Email Me</a>
    &middot;
    <a href="tel:{{REP_PHONE}}" style="color:#f26b2b;text-decoration:none;font-size:11px;">Call Me</a>
  </td></tr>`

  const wrap = (inner: string) => `<table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;background:#f0ede9;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
${inner}
${repCard}
${footer}
    </table>
  </td></tr></table>`

  const defaults: Record<string, { name: string; subject: string; preheader: string; html: string }> = {
    product: {
      name:      PRODUCT_SPOTLIGHT_META.name,
      subject:   PRODUCT_SPOTLIGHT_META.subject,
      preheader: PRODUCT_SPOTLIGHT_META.preheader,
      html:      PRODUCT_SPOTLIGHT_HTML,
    },
    title_news: {
      name:      TITLE_INDUSTRY_NEWS_META.name,
      subject:   TITLE_INDUSTRY_NEWS_META.subject,
      preheader: TITLE_INDUSTRY_NEWS_META.preheader,
      html:      TITLE_INDUSTRY_NEWS_HTML,
    },
    market_update: {
      name:      MARKET_UPDATE_META.name,
      subject:   MARKET_UPDATE_META.subject,
      preheader: MARKET_UPDATE_META.preheader,
      html:      MARKET_UPDATE_HTML,
    },
    holidays: {
      name:      HOLIDAY_GREETING_META.name,
      subject:   HOLIDAY_GREETING_META.subject,
      preheader: HOLIDAY_GREETING_META.preheader,
      html:      HOLIDAY_GREETING_HTML,
    },
  }

  // Auto-sync the file → DB per template. The existing `cats` short-circuit
  // (category presence) is intentionally NOT used here anymore because it
  // prevented updates: once any row exists in a category, the seeder
  // skipped that category forever. We now operate per-template by `name`.
  //
  // Rules:
  //   - No row with this name  → INSERT (system-owned)
  //   - Row exists, updated_by='system'  → UPDATE html_content/subject/
  //     preheader/category (file is authoritative)
  //   - Row exists, updated_by anything else  → SKIP (admin customized
  //     it via the UI editor; respect their changes)
  //
  // `cats` is still inspected only to leave the legacy logging behavior
  // intact for any reader expecting it.
  void cats

  for (const [cat, d] of Object.entries(defaults)) {
    const existing = await db.query<{ id: number; updated_by: string | null }>(
      `SELECT id, updated_by FROM vcard_email_templates WHERE name = $1 LIMIT 1`,
      [d.name],
    )

    if (existing.rowCount === 0) {
      await db.query(
        `INSERT INTO vcard_email_templates (name, subject, preheader, html_content, category, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, 'system', 'system')`,
        [d.name, d.subject, d.preheader, d.html, cat],
      )
      continue
    }

    const row = existing.rows[0]
    if (row.updated_by !== 'system') continue  // admin-owned — leave alone

    await db.query(
      `UPDATE vcard_email_templates
          SET html_content = $1,
              subject      = $2,
              preheader    = $3,
              category     = $4,
              updated_at   = NOW()
        WHERE id = $5`,
      [d.html, d.subject, d.preheader, cat, row.id],
    )
  }
}

export interface EmailCampaignLog {
  id: number
  name: string
  subject: string
  audience_id: string | null
  template_id: number | null
  mailchimp_campaign_id: string | null
  mailchimp_web_id: string | null
  status: string
  scheduled_at: string | null
  notes: string | null
  created_at: string
  batch_id?: string | null
  rep_slug?: string | null
  reply_to_mode?: string | null
}

export async function createEmailCampaignLog(input: {
  name: string
  subject: string
  audience_id?: string | null
  template_id?: number | null
  mailchimp_campaign_id?: string | null
  mailchimp_web_id?: string | null
  status: string
  scheduled_at?: string | null
  notes?: string | null
  batch_id?: string | null
  rep_slug?: string | null
  reply_to_mode?: string | null
}): Promise<EmailCampaignLog> {
  await ensureExtraTables()
  const db = getPool()
  const res = await db.query(`
    INSERT INTO vcard_email_campaigns
      (name, subject, audience_id, template_id, mailchimp_campaign_id, mailchimp_web_id,
       status, scheduled_at, notes, batch_id, rep_slug, reply_to_mode)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING id, name, subject, audience_id, template_id, mailchimp_campaign_id, mailchimp_web_id,
              status, scheduled_at::text, notes, created_at::text,
              batch_id::text AS batch_id, rep_slug, reply_to_mode
  `, [
    input.name,
    input.subject,
    input.audience_id || null,
    input.template_id || null,
    input.mailchimp_campaign_id || null,
    input.mailchimp_web_id || null,
    input.status,
    input.scheduled_at || null,
    input.notes || null,
    input.batch_id || null,
    input.rep_slug || null,
    input.reply_to_mode || null,
  ])
  return res.rows[0]
}

export async function getEmailCampaignLogs(limit = 50): Promise<EmailCampaignLog[]> {
  await ensureExtraTables()
  const db = getPool()
  const res = await db.query(`
    SELECT id, name, subject, audience_id, template_id, mailchimp_campaign_id, mailchimp_web_id,
           status, scheduled_at::text, notes, created_at::text,
           batch_id::text AS batch_id, rep_slug, reply_to_mode
    FROM vcard_email_campaigns
    ORDER BY created_at DESC
    LIMIT $1
  `, [limit])
  return res.rows
}

// ── Batch campaign helpers (multi-rep send) ──────────────────────

/** Summary row in the batches history list. */
export interface EmailCampaignBatchSummary {
  batch_id:            string | null    // null for "non-batch" tail entries
  first_campaign_name: string
  created_at:          string
  total:               number
  drafts:              number
  scheduled:           number
  sent:                number
  cancelled:           number
  next_send_time:      string | null
}

/**
 * Fetch batches plus optional non-batch tail (older single-campaign rows).
 * Returns `hasMore` so the caller can paginate.
 */
export async function getEmailCampaignBatches(
  opts: { limit?: number; offset?: number; includeNonBatch?: boolean } = {},
): Promise<{ batches: EmailCampaignBatchSummary[]; hasMore: boolean }> {
  await ensureExtraTables()
  const db = getPool()
  const limit  = Math.max(1, Math.min(opts.limit  ?? 50, 200))
  const offset = Math.max(0, opts.offset ?? 0)

  // Fetch limit+1 to detect whether there are more batches.
  const batchRes = await db.query(`
    SELECT
      batch_id::text                                            AS batch_id,
      MIN(name)                                                 AS first_campaign_name,
      MIN(created_at)::text                                     AS created_at,
      COUNT(*)::int                                             AS total,
      COUNT(*) FILTER (WHERE status = 'draft')::int             AS drafts,
      COUNT(*) FILTER (WHERE status = 'scheduled')::int         AS scheduled,
      COUNT(*) FILTER (WHERE status = 'sent')::int              AS sent,
      COUNT(*) FILTER (WHERE status = 'cancelled')::int         AS cancelled,
      MIN(scheduled_at)::text                                   AS next_send_time
    FROM vcard_email_campaigns
    WHERE batch_id IS NOT NULL
    GROUP BY batch_id
    ORDER BY MIN(created_at) DESC
    LIMIT $1 OFFSET $2
  `, [limit + 1, offset])

  const overFetched = batchRes.rows.length > limit
  const batches: EmailCampaignBatchSummary[] = batchRes.rows.slice(0, limit)

  // Optionally append legacy single-campaign (non-batch) rows for completeness.
  // We only do this on the first page (offset === 0) so pagination stays sane.
  if (opts.includeNonBatch && offset === 0) {
    const legacy = await db.query(`
      SELECT
        NULL::text                                              AS batch_id,
        name                                                    AS first_campaign_name,
        created_at::text                                        AS created_at,
        1                                                       AS total,
        (CASE WHEN status = 'draft'     THEN 1 ELSE 0 END)::int AS drafts,
        (CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END)::int AS scheduled,
        (CASE WHEN status = 'sent'      THEN 1 ELSE 0 END)::int AS sent,
        (CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)::int AS cancelled,
        scheduled_at::text                                      AS next_send_time
      FROM vcard_email_campaigns
      WHERE batch_id IS NULL
      ORDER BY created_at DESC
      LIMIT 25
    `)
    batches.push(...legacy.rows)
  }

  return { batches, hasMore: overFetched }
}

/** Row shape used by the cancel + detail endpoints. */
export interface BatchCampaignRow {
  id:                    number
  batch_id:              string | null
  rep_slug:              string | null
  rep_name:              string | null
  name:                  string
  subject:               string
  audience_id:           string | null
  template_id:           number | null
  mailchimp_campaign_id: string | null
  mailchimp_web_id:      string | null
  status:                string
  scheduled_at:          string | null
  created_at:            string
  reply_to_mode:         string | null
}

/** Fetch every campaign in a batch, joined with rep name when possible. */
export async function getBatchCampaigns(batchId: string): Promise<BatchCampaignRow[]> {
  await ensureExtraTables()
  const db = getPool()
  const res = await db.query(`
    SELECT
      c.id,
      c.batch_id::text                                          AS batch_id,
      c.rep_slug,
      (e.first_name || ' ' || e.last_name)                      AS rep_name,
      c.name,
      c.subject,
      c.audience_id,
      c.template_id,
      c.mailchimp_campaign_id,
      c.mailchimp_web_id,
      c.status,
      c.scheduled_at::text                                      AS scheduled_at,
      c.created_at::text                                        AS created_at,
      c.reply_to_mode
    FROM vcard_email_campaigns c
    LEFT JOIN vcard_employees e ON e.slug = c.rep_slug
    WHERE c.batch_id = $1::uuid
    ORDER BY c.created_at ASC, c.id ASC
  `, [batchId])
  return res.rows
}

/** Update one campaign's status (e.g. flip 'scheduled' → 'cancelled'). */
export async function updateCampaignStatus(
  id: number,
  status: string,
): Promise<void> {
  await ensureExtraTables()
  await getPool().query(
    `UPDATE vcard_email_campaigns SET status = $1 WHERE id = $2`,
    [status, id],
  )
}

export interface AssessmentRecord {
  id: number
  respondent_name: string
  respondent_email: string
  respondent_phone: string | null
  rep_id: string | null
  rep_name: string | null
  source_channel: string
  capability_score: number
  avg_confidence_score: number
  responses_json: Record<string, unknown>
  confidence_json: Record<string, unknown>
  user_agent: string | null
  submitted_at: string
}

export async function createAssessment(input: {
  respondent_name: string
  respondent_email: string
  respondent_phone?: string
  rep_id?: string
  rep_name?: string
  source_channel?: string
  capability_score: number
  avg_confidence_score: number
  responses_json: Record<string, unknown>
  confidence_json: Record<string, unknown>
  user_agent?: string
}): Promise<AssessmentRecord> {
  await ensureExtraTables()
  const db = getPool()
  const res = await db.query(`
    INSERT INTO vcard_assessments
      (respondent_name, respondent_email, respondent_phone, rep_id, rep_name, source_channel, capability_score, avg_confidence_score, responses_json, confidence_json, user_agent)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING id, respondent_name, respondent_email, respondent_phone, rep_id, rep_name, source_channel,
              capability_score::float, avg_confidence_score::float, responses_json, confidence_json, user_agent, submitted_at::text
  `, [
    input.respondent_name,
    input.respondent_email,
    input.respondent_phone || null,
    input.rep_id || null,
    input.rep_name || null,
    input.source_channel || 'web',
    input.capability_score,
    input.avg_confidence_score,
    JSON.stringify(input.responses_json),
    JSON.stringify(input.confidence_json),
    input.user_agent || null,
  ])
  return res.rows[0]
}

export async function getAssessments(limit = 200): Promise<AssessmentRecord[]> {
  await ensureExtraTables()
  const db = getPool()
  const res = await db.query(`
    SELECT id, respondent_name, respondent_email, respondent_phone, rep_id, rep_name, source_channel,
           capability_score::float, avg_confidence_score::float, responses_json, confidence_json, user_agent, submitted_at::text
    FROM vcard_assessments
    ORDER BY submitted_at DESC
    LIMIT $1
  `, [limit])
  return res.rows
}

// ============================================================
// Signature Center — staff_members / signature_templates / office_locations
// ============================================================
// Independent from vcard_employees. Sales reps may exist in both tables;
// that's acceptable for MVP. All DDL uses IF NOT EXISTS and all seeds use
// ON CONFLICT DO NOTHING so this is safe to run on every cold start.

let _signatureTablesReady = false
async function ensureSignatureTables(): Promise<void> {
  if (_signatureTablesReady) return
  const db = getPool()

  // 1. office_locations
  await db.query(`
    CREATE TABLE IF NOT EXISTS office_locations (
      id            SERIAL PRIMARY KEY,
      slug          TEXT NOT NULL UNIQUE,
      display_name  TEXT NOT NULL,
      address_line1 TEXT NOT NULL,
      address_line2 TEXT,
      city          TEXT NOT NULL,
      state         TEXT NOT NULL,
      zip           TEXT NOT NULL,
      main_phone    TEXT,
      toll_free     TEXT,
      fax           TEXT,
      active        BOOLEAN     NOT NULL DEFAULT true,
      display_order INTEGER     NOT NULL DEFAULT 0,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)

  // 2. signature_templates
  await db.query(`
    CREATE TABLE IF NOT EXISTS signature_templates (
      id            SERIAL PRIMARY KEY,
      name          TEXT NOT NULL UNIQUE,
      description   TEXT,
      html_template TEXT NOT NULL,
      active        BOOLEAN     NOT NULL DEFAULT true,
      is_default    BOOLEAN     NOT NULL DEFAULT false,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
  // Partial unique index: at most one row may have is_default = true.
  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_signature_templates_one_default
      ON signature_templates(is_default) WHERE is_default = true;
  `)

  // 3. staff_members
  await db.query(`
    CREATE TABLE IF NOT EXISTS staff_members (
      id                    SERIAL PRIMARY KEY,

      -- Identity
      first_name            TEXT NOT NULL,
      last_name             TEXT NOT NULL,
      full_legal_name       TEXT,

      -- Role
      title                 TEXT NOT NULL,
      department            TEXT,

      -- Contact
      email                 TEXT NOT NULL UNIQUE,
      office_direct         TEXT,
      cell_phone            TEXT,
      fax                   TEXT,

      -- Office (references office_locations.slug, denormalised for read performance)
      office_location       TEXT,

      -- Branding
      photo_url             TEXT,

      -- Compliance
      license_number        TEXT,

      -- Social
      linkedin_url          TEXT,
      instagram_url         TEXT,

      -- Marketing
      group_email           TEXT,
      signature_template_id INTEGER REFERENCES signature_templates(id) ON DELETE SET NULL,

      -- Flags
      active                BOOLEAN     NOT NULL DEFAULT true,
      part_time             BOOLEAN     NOT NULL DEFAULT false,

      -- Audit
      created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_by            TEXT,
      updated_by            TEXT
    );
  `)
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_staff_members_email
      ON staff_members(LOWER(email));
  `)
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_staff_members_office
      ON staff_members(office_location);
  `)
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_staff_members_active
      ON staff_members(active) WHERE active = true;
  `)

  await seedOfficeLocations(db)
  await seedSignatureTemplates(db)

  _signatureTablesReady = true
}

// ── Seeders ──────────────────────────────────────────────────────

async function seedOfficeLocations(db: Pool): Promise<void> {
  const offices: Array<{
    slug:           string
    display_name:   string
    address_line1:  string
    city:           string
    state:          string
    zip:            string
    main_phone?:    string
    toll_free?:     string
    fax?:           string
    display_order:  number
  }> = [
    {
      slug:          'orange-hq',
      display_name:  'Orange HQ',
      address_line1: '1111 E. Katella Ave., Ste. 120',
      city:          'Orange',
      state:         'CA',
      zip:           '92867',
      main_phone:    '714.516.6700',
      toll_free:     '877.338.1108',
      fax:           '714.516.6681',
      display_order: 1,
    },
    {
      slug:          'glendale',
      display_name:  'Glendale',
      address_line1: '516 Burchett St.',
      city:          'Glendale',
      state:         'CA',
      zip:           '91203',
      main_phone:    '818.662.6700',
      toll_free:     '866.724.1050',
      fax:           '818.662.6780',
      display_order: 2,
    },
    {
      slug:          'ontario',
      display_name:  'Ontario',
      address_line1: '3200 Inland Empire Blvd., Ste. 235',
      city:          'Ontario',
      state:         'CA',
      zip:           '91764',
      main_phone:    '951.528.5915',
      display_order: 3,
    },
    {
      slug:          'porterville',
      display_name:  'Porterville',
      address_line1: '1150 W. Morton Ave., Ste. A',
      city:          'Porterville',
      state:         'CA',
      zip:           '93257',
      main_phone:    '559.833.2740',
      display_order: 4,
    },
    {
      slug:          'livermore-tsg',
      display_name:  'Livermore (TSG NorCal)',
      address_line1: '6111 Southfront Road, Suite F',
      city:          'Livermore',
      state:         'CA',
      zip:           '94551',
      main_phone:    '925.942.4040',
      display_order: 5,
    },
    {
      slug:          'las-vegas-tsg',
      display_name:  'Las Vegas (TSG NV)',
      address_line1: '930 S. 4th Street, Suite 210',
      city:          'Las Vegas',
      state:         'NV',
      zip:           '89101',
      display_order: 6,
    },
  ]

  for (const o of offices) {
    await db.query(
      `INSERT INTO office_locations
         (slug, display_name, address_line1, city, state, zip,
          main_phone, toll_free, fax, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (slug) DO NOTHING`,
      [
        o.slug,
        o.display_name,
        o.address_line1,
        o.city,
        o.state,
        o.zip,
        o.main_phone || null,
        o.toll_free  || null,
        o.fax        || null,
        o.display_order,
      ],
    )
  }
}

async function seedSignatureTemplates(db: Pool): Promise<void> {
  // The file (lib/signature-templates/corporate-standard.ts) is the source
  // of truth. On every cold start we UPSERT so the DB row always matches
  // the deployed code — no manual migration needed when the template HTML
  // changes. Only html_template, description, and updated_at are touched;
  // is_default and active are preserved on subsequent runs.
  await db.query(
    `INSERT INTO signature_templates (name, description, html_template, is_default)
     VALUES ($1, $2, $3, true)
     ON CONFLICT (name) DO UPDATE SET
       html_template = EXCLUDED.html_template,
       description   = EXCLUDED.description,
       updated_at    = NOW()`,
    [
      'Corporate Standard',
      'Default signature for all PCT employees',
      CORPORATE_STANDARD_HTML,
    ],
  )
}

// ── Office Locations ─────────────────────────────────────────────

export interface OfficeLocation {
  id:            number
  slug:          string
  display_name:  string
  address_line1: string
  address_line2: string | null
  city:          string
  state:         string
  zip:           string
  main_phone:    string | null
  toll_free:     string | null
  fax:           string | null
  active:        boolean
  display_order: number
}

export async function getAllOfficeLocations(): Promise<OfficeLocation[]> {
  await ensureSignatureTables()
  const db = getPool()
  const res = await db.query(`
    SELECT * FROM office_locations
    WHERE active = true
    ORDER BY display_order, display_name
  `)
  return res.rows
}

export async function getOfficeLocationBySlug(slug: string): Promise<OfficeLocation | null> {
  await ensureSignatureTables()
  const db = getPool()
  const res = await db.query(
    `SELECT * FROM office_locations WHERE slug = $1 LIMIT 1`,
    [slug],
  )
  return res.rows[0] || null
}

// ── Signature Templates ──────────────────────────────────────────

export interface SignatureTemplate {
  id:            number
  name:          string
  description:   string | null
  html_template: string
  active:        boolean
  is_default:    boolean
  created_at:    Date
  updated_at:    Date
}

export async function getAllSignatureTemplates(): Promise<SignatureTemplate[]> {
  await ensureSignatureTables()
  const db = getPool()
  const res = await db.query(`
    SELECT * FROM signature_templates
    WHERE active = true
    ORDER BY is_default DESC, name
  `)
  return res.rows
}

export async function getDefaultSignatureTemplate(): Promise<SignatureTemplate | null> {
  await ensureSignatureTables()
  const db = getPool()
  const res = await db.query(`
    SELECT * FROM signature_templates
    WHERE is_default = true AND active = true
    LIMIT 1
  `)
  return res.rows[0] || null
}

export async function getSignatureTemplateById(id: number): Promise<SignatureTemplate | null> {
  await ensureSignatureTables()
  const db = getPool()
  const res = await db.query(
    `SELECT * FROM signature_templates WHERE id = $1 LIMIT 1`,
    [id],
  )
  return res.rows[0] || null
}

// ── Staff Members ────────────────────────────────────────────────

export interface StaffMember {
  id:                    number
  first_name:            string
  last_name:             string
  full_legal_name:       string | null
  title:                 string
  department:            string | null
  email:                 string
  office_direct:         string | null
  cell_phone:            string | null
  fax:                   string | null
  office_location:       string | null
  photo_url:             string | null
  license_number:        string | null
  linkedin_url:          string | null
  instagram_url:         string | null
  group_email:           string | null
  signature_template_id: number | null
  active:                boolean
  part_time:             boolean
  created_at:            Date
  updated_at:            Date
  created_by:            string | null
  updated_by:            string | null
}

export interface StaffMemberInput {
  first_name:             string
  last_name:              string
  full_legal_name?:       string | null
  title:                  string
  department?:            string | null
  email:                  string
  office_direct?:         string | null
  cell_phone?:            string | null
  fax?:                   string | null
  office_location?:       string | null
  photo_url?:             string | null
  license_number?:        string | null
  linkedin_url?:          string | null
  instagram_url?:         string | null
  group_email?:           string | null
  signature_template_id?: number | null
  active?:                boolean
  part_time?:             boolean
}

// Whitelist of columns the caller is allowed to set via updateStaffMember.
// Prevents accidental updates to id / created_at / created_by via spread payloads.
const STAFF_UPDATABLE_COLUMNS = new Set<keyof StaffMemberInput>([
  'first_name', 'last_name', 'full_legal_name', 'title', 'department',
  'email', 'office_direct', 'cell_phone', 'fax',
  'office_location', 'photo_url', 'license_number',
  'linkedin_url', 'instagram_url', 'group_email',
  'signature_template_id', 'active', 'part_time',
])

export async function getAllStaffMembers(
  options?: { activeOnly?: boolean },
): Promise<StaffMember[]> {
  await ensureSignatureTables()
  const db = getPool()
  const where = options?.activeOnly ? 'WHERE active = true' : ''
  const res = await db.query(`
    SELECT * FROM staff_members
    ${where}
    ORDER BY last_name, first_name
  `)
  return res.rows
}

export async function getStaffMemberById(id: number): Promise<StaffMember | null> {
  await ensureSignatureTables()
  const db = getPool()
  const res = await db.query(
    `SELECT * FROM staff_members WHERE id = $1 LIMIT 1`,
    [id],
  )
  return res.rows[0] || null
}

export async function getStaffMemberByEmail(email: string): Promise<StaffMember | null> {
  await ensureSignatureTables()
  const db = getPool()
  const res = await db.query(
    `SELECT * FROM staff_members WHERE LOWER(email) = LOWER($1) LIMIT 1`,
    [email],
  )
  return res.rows[0] || null
}

export async function createStaffMember(
  input: StaffMemberInput,
  createdBy: string,
): Promise<StaffMember> {
  await ensureSignatureTables()
  const db = getPool()
  const res = await db.query(
    `INSERT INTO staff_members (
       first_name, last_name, full_legal_name, title, department,
       email, office_direct, cell_phone, fax,
       office_location, photo_url, license_number,
       linkedin_url, instagram_url, group_email,
       signature_template_id, active, part_time,
       created_by, updated_by
     ) VALUES (
       $1, $2, $3, $4, $5,
       $6, $7, $8, $9,
       $10, $11, $12,
       $13, $14, $15,
       $16, $17, $18,
       $19, $19
     )
     RETURNING *`,
    [
      input.first_name,
      input.last_name,
      input.full_legal_name || null,
      input.title,
      input.department || null,
      input.email,
      input.office_direct || null,
      input.cell_phone || null,
      input.fax || null,
      input.office_location || null,
      input.photo_url || null,
      input.license_number || null,
      input.linkedin_url || null,
      input.instagram_url || null,
      input.group_email || null,
      input.signature_template_id ?? null,
      input.active ?? true,
      input.part_time ?? false,
      createdBy,
    ],
  )
  return res.rows[0]
}

export async function updateStaffMember(
  id:        number,
  input:     Partial<StaffMemberInput>,
  updatedBy: string,
): Promise<StaffMember | null> {
  await ensureSignatureTables()
  const db = getPool()

  // Build dynamic UPDATE using only whitelisted columns.
  const fields: string[]    = []
  const values: unknown[]   = []
  let   idx                 = 1

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue
    if (!STAFF_UPDATABLE_COLUMNS.has(key as keyof StaffMemberInput)) continue
    fields.push(`${key} = $${idx}`)
    values.push(value)
    idx++
  }

  if (fields.length === 0) return getStaffMemberById(id)

  fields.push(`updated_at = NOW()`)
  fields.push(`updated_by = $${idx}`)
  values.push(updatedBy)
  idx++
  values.push(id)

  const res = await db.query(
    `UPDATE staff_members
        SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *`,
    values,
  )
  return res.rows[0] || null
}

export async function deleteStaffMember(id: number): Promise<boolean> {
  await ensureSignatureTables()
  const db = getPool()
  const res = await db.query(
    `DELETE FROM staff_members WHERE id = $1`,
    [id],
  )
  return (res.rowCount ?? 0) > 0
}

/**
 * Bulk insert/upsert for CSV imports. Wrapped in a single transaction;
 * per-row failures are collected and the surviving rows are committed.
 * Conflict on email triggers an UPDATE of mutable fields (created_by /
 * created_at are preserved on re-import).
 */
export async function bulkCreateStaffMembers(
  inputs:    StaffMemberInput[],
  createdBy: string,
): Promise<{ created: number; errors: Array<{ row: number; error: string }> }> {
  await ensureSignatureTables()
  const db = getPool()
  const client = await db.connect()

  let created = 0
  const errors: Array<{ row: number; error: string }> = []

  try {
    await client.query('BEGIN')

    for (let i = 0; i < inputs.length; i++) {
      // Per-row SAVEPOINT keeps the outer transaction healthy when a single
      // row violates a constraint. Without this, the first failing row would
      // poison every subsequent INSERT inside the same transaction.
      const savepointName = `sp_row_${i}`

      try {
        await client.query(`SAVEPOINT ${savepointName}`)

        await client.query(
          `INSERT INTO staff_members (
             first_name, last_name, full_legal_name, title, department,
             email, office_direct, cell_phone, fax,
             office_location, photo_url, license_number,
             linkedin_url, instagram_url, group_email,
             signature_template_id, active, part_time,
             created_by, updated_by
           ) VALUES (
             $1, $2, $3, $4, $5,
             $6, $7, $8, $9,
             $10, $11, $12,
             $13, $14, $15,
             $16, $17, $18,
             $19, $19
           )
           ON CONFLICT (email) DO UPDATE SET
             first_name      = EXCLUDED.first_name,
             last_name       = EXCLUDED.last_name,
             full_legal_name = EXCLUDED.full_legal_name,
             title           = EXCLUDED.title,
             department      = EXCLUDED.department,
             office_direct   = EXCLUDED.office_direct,
             cell_phone      = EXCLUDED.cell_phone,
             fax             = EXCLUDED.fax,
             office_location = EXCLUDED.office_location,
             license_number  = EXCLUDED.license_number,
             group_email     = EXCLUDED.group_email,
             updated_at      = NOW(),
             updated_by      = $19`,
          [
            inputs[i].first_name,
            inputs[i].last_name,
            inputs[i].full_legal_name || null,
            inputs[i].title,
            inputs[i].department || null,
            inputs[i].email,
            inputs[i].office_direct || null,
            inputs[i].cell_phone || null,
            inputs[i].fax || null,
            inputs[i].office_location || null,
            inputs[i].photo_url || null,
            inputs[i].license_number || null,
            inputs[i].linkedin_url || null,
            inputs[i].instagram_url || null,
            inputs[i].group_email || null,
            inputs[i].signature_template_id ?? null,
            inputs[i].active ?? true,
            inputs[i].part_time ?? false,
            createdBy,
          ],
        )

        await client.query(`RELEASE SAVEPOINT ${savepointName}`)
        created++
      } catch (err) {
        // Roll back ONLY this row's savepoint so the transaction stays
        // alive for the remaining rows.
        try {
          await client.query(`ROLLBACK TO SAVEPOINT ${savepointName}`)
          await client.query(`RELEASE SAVEPOINT ${savepointName}`)
        } catch (cleanupErr) {
          console.warn(
            `[bulkCreateStaffMembers] savepoint cleanup failed for row ${i + 1}:`,
            cleanupErr instanceof Error ? cleanupErr.message : cleanupErr,
          )
        }

        errors.push({
          row: i + 1,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }

  return { created, errors }
}

// ============================================================
// Asset Delivery — batches / files / sends / templates
// ============================================================
// New feature: marketing uploads personalised files, sends to all active
// sales reps as email attachments. Schema is independent of every other
// table here. All DDL is idempotent (IF NOT EXISTS) and the template seed
// uses ON CONFLICT … DO UPDATE so re-running this module updates the
// canonical HTML if the source file changes.

let _assetDeliveryTablesReady = false
async function ensureAssetDeliveryTables(): Promise<void> {
  if (_assetDeliveryTablesReady) return
  const db = getPool()

  // 1. asset_delivery_templates
  await db.query(`
    CREATE TABLE IF NOT EXISTS asset_delivery_templates (
      id            SERIAL PRIMARY KEY,
      slug          TEXT NOT NULL UNIQUE,
      name          TEXT NOT NULL,
      description   TEXT,
      html_template TEXT NOT NULL,
      is_default    BOOLEAN     NOT NULL DEFAULT false,
      active        BOOLEAN     NOT NULL DEFAULT true,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
  // At most one row may carry is_default = true.
  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_asset_delivery_templates_one_default
      ON asset_delivery_templates(is_default) WHERE is_default = true;
  `)

  // 2. asset_delivery_batches
  await db.query(`
    CREATE TABLE IF NOT EXISTS asset_delivery_batches (
      id               SERIAL PRIMARY KEY,
      batch_id         UUID NOT NULL UNIQUE,
      campaign_slug    TEXT NOT NULL,
      campaign_name    TEXT NOT NULL,
      lane             TEXT,
      email_subject    TEXT NOT NULL,
      template_id      INTEGER REFERENCES asset_delivery_templates(id) ON DELETE SET NULL,
      status           TEXT     NOT NULL DEFAULT 'draft',
      total_recipients INTEGER  NOT NULL DEFAULT 0,
      total_files      INTEGER  NOT NULL DEFAULT 0,
      total_bytes      BIGINT   NOT NULL DEFAULT 0,
      sent_at          TIMESTAMPTZ,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_by       TEXT,
      updated_by       TEXT
    );
  `)
  // Additive column for the wizard's "About this campaign" field. Persists
  // the operator's description so AI intro generation (both preview and
  // real send) gets the same input. See FIX 5 in the pre-launch report.
  await db.query(`
    ALTER TABLE asset_delivery_batches
    ADD COLUMN IF NOT EXISTS description TEXT
  `)
  await db.query(`CREATE INDEX IF NOT EXISTS idx_asset_delivery_batches_status        ON asset_delivery_batches(status);`)
  await db.query(`CREATE INDEX IF NOT EXISTS idx_asset_delivery_batches_created_at    ON asset_delivery_batches(created_at DESC);`)
  await db.query(`CREATE INDEX IF NOT EXISTS idx_asset_delivery_batches_campaign_slug ON asset_delivery_batches(campaign_slug);`)

  // 3. asset_delivery_files (one row per uploaded file)
  await db.query(`
    CREATE TABLE IF NOT EXISTS asset_delivery_files (
      id                SERIAL PRIMARY KEY,
      batch_id          UUID NOT NULL REFERENCES asset_delivery_batches(batch_id) ON DELETE CASCADE,
      rep_email         TEXT NOT NULL,
      format            TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      r2_key            TEXT NOT NULL,
      r2_url            TEXT NOT NULL,
      file_size_bytes   INTEGER NOT NULL,
      mime_type         TEXT,
      uploaded_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
  await db.query(`CREATE INDEX IF NOT EXISTS idx_asset_delivery_files_batch_id  ON asset_delivery_files(batch_id);`)
  await db.query(`CREATE INDEX IF NOT EXISTS idx_asset_delivery_files_rep_email ON asset_delivery_files(rep_email);`)

  // 4. asset_delivery_sends (one row per rep per batch)
  await db.query(`
    CREATE TABLE IF NOT EXISTS asset_delivery_sends (
      id                     SERIAL PRIMARY KEY,
      batch_id               UUID NOT NULL REFERENCES asset_delivery_batches(batch_id) ON DELETE CASCADE,
      rep_id                 INTEGER,
      rep_email              TEXT NOT NULL,
      rep_name               TEXT NOT NULL,
      send_status            TEXT    NOT NULL DEFAULT 'pending',
      attachment_count       INTEGER NOT NULL DEFAULT 0,
      attachment_total_bytes INTEGER NOT NULL DEFAULT 0,
      ai_generated_intro     TEXT,
      sendgrid_message_id    TEXT,
      sent_at                TIMESTAMPTZ,
      error_message          TEXT,
      created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
  // Additive column so test-mode sends don't pollute the audit/count
  // tiles. Default false keeps existing rows correct. Partial index keeps
  // the common "real sends only" filter cheap. See FIX 4.
  await db.query(`
    ALTER TABLE asset_delivery_sends
    ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false
  `)
  await db.query(`CREATE INDEX IF NOT EXISTS idx_asset_delivery_sends_batch_id ON asset_delivery_sends(batch_id);`)
  await db.query(`CREATE INDEX IF NOT EXISTS idx_asset_delivery_sends_status   ON asset_delivery_sends(send_status);`)
  await db.query(`CREATE INDEX IF NOT EXISTS idx_asset_delivery_sends_sent_at  ON asset_delivery_sends(sent_at DESC);`)
  await db.query(`CREATE INDEX IF NOT EXISTS idx_asset_delivery_sends_real     ON asset_delivery_sends(is_test) WHERE is_test = false;`)

  await seedAssetDeliveryTemplate(db)

  _assetDeliveryTablesReady = true
}

async function seedAssetDeliveryTemplate(db: Pool): Promise<void> {
  await db.query(
    `INSERT INTO asset_delivery_templates (slug, name, description, html_template, is_default)
     VALUES ($1, $2, $3, $4, true)
     ON CONFLICT (slug) DO UPDATE SET
       html_template = EXCLUDED.html_template,
       description   = EXCLUDED.description,
       updated_at    = NOW()`,
    [
      'asset-delivery-default',
      'Personalized Asset Delivery',
      'Default template for delivering personalized marketing pieces to reps',
      ASSET_DELIVERY_HTML,
    ],
  )
}

// ── Types ────────────────────────────────────────────────────────

export type AssetDeliveryBatchStatus =
  | 'draft' | 'ready' | 'sending' | 'sent' | 'failed' | 'archived'

export type AssetDeliverySendStatus =
  | 'pending' | 'sending' | 'sent' | 'failed' | 'skipped'

export interface AssetDeliveryTemplate {
  id:            number
  slug:          string
  name:          string
  description:   string | null
  html_template: string
  is_default:    boolean
  active:        boolean
  created_at:    Date
  updated_at:    Date
}

export interface AssetDeliveryBatch {
  id:               number
  batch_id:         string
  campaign_slug:    string
  campaign_name:    string
  lane:             string | null
  email_subject:    string
  description:      string | null
  template_id:      number | null
  status:           AssetDeliveryBatchStatus
  total_recipients: number
  total_files:      number
  total_bytes:      number
  sent_at:          Date | null
  created_at:       Date
  updated_at:       Date
  created_by:       string | null
  updated_by:       string | null
}

export interface AssetDeliveryFile {
  id:                number
  batch_id:          string
  rep_email:         string
  format:            string
  original_filename: string
  r2_key:            string
  r2_url:            string
  file_size_bytes:   number
  mime_type:         string | null
  uploaded_at:       Date
}

export interface AssetDeliverySend {
  id:                     number
  batch_id:               string
  rep_id:                 number | null
  rep_email:              string
  rep_name:               string
  send_status:            AssetDeliverySendStatus
  attachment_count:       number
  attachment_total_bytes: number
  ai_generated_intro:     string | null
  sendgrid_message_id:    string | null
  sent_at:                Date | null
  error_message:          string | null
  is_test:                boolean
  created_at:             Date
  updated_at:             Date
}

// ── Template helpers ─────────────────────────────────────────────

export async function getDefaultAssetDeliveryTemplate(): Promise<AssetDeliveryTemplate | null> {
  await ensureAssetDeliveryTables()
  const db = getPool()
  const res = await db.query(`
    SELECT * FROM asset_delivery_templates
    WHERE is_default = true AND active = true
    LIMIT 1
  `)
  return res.rows[0] || null
}

export async function getAssetDeliveryTemplateBySlug(slug: string): Promise<AssetDeliveryTemplate | null> {
  await ensureAssetDeliveryTables()
  const db = getPool()
  const res = await db.query(
    `SELECT * FROM asset_delivery_templates WHERE slug = $1 LIMIT 1`,
    [slug],
  )
  return res.rows[0] || null
}

// ── Batch helpers ────────────────────────────────────────────────

/**
 * The pg driver returns BIGINT columns as JavaScript strings to preserve
 * precision beyond 2^53. asset_delivery_batches.total_bytes is the only
 * BIGINT in this domain — every other count is INTEGER and comes through
 * as a number. Coerce here so TypeScript's `total_bytes: number` type
 * matches runtime reality and downstream arithmetic / .toFixed() calls
 * don't silently break.
 */
function coerceBatchRow(row: AssetDeliveryBatch): AssetDeliveryBatch {
  if (!row) return row
  const raw = (row as unknown as { total_bytes: number | string | null }).total_bytes
  const coerced =
    typeof raw === 'string' ? Number(raw) : (raw ?? 0)
  return { ...row, total_bytes: Number.isFinite(coerced) ? coerced : 0 }
}

export interface AssetDeliveryBatchInput {
  campaign_slug:     string
  campaign_name:     string
  lane?:             string | null
  email_subject:     string
  description?:      string | null
  template_id?:      number | null
  status?:           AssetDeliveryBatchStatus
  total_recipients?: number
  total_files?:      number
  total_bytes?:      number
}

export interface AssetDeliveryBatchUpdate {
  campaign_slug?:    string
  campaign_name?:    string
  lane?:             string | null
  email_subject?:    string
  description?:      string | null
  template_id?:      number | null
  status?:           AssetDeliveryBatchStatus
  total_recipients?: number
  total_files?:      number
  total_bytes?:      number
  sent_at?:          Date | string | null
}

const BATCH_UPDATABLE = new Set<keyof AssetDeliveryBatchUpdate>([
  'campaign_slug', 'campaign_name', 'lane', 'email_subject', 'description',
  'template_id', 'status', 'total_recipients', 'total_files', 'total_bytes',
  'sent_at',
])

export async function getAllAssetDeliveryBatches(
  options?: { status?: AssetDeliveryBatchStatus; limit?: number },
): Promise<AssetDeliveryBatch[]> {
  await ensureAssetDeliveryTables()
  const db = getPool()
  const limit  = Math.max(1, Math.min(options?.limit ?? 50, 200))
  const where: string[]   = []
  const values: unknown[] = []
  if (options?.status) {
    where.push(`status = $${values.length + 1}`)
    values.push(options.status)
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  values.push(limit)
  const res = await db.query(
    `SELECT * FROM asset_delivery_batches
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT $${values.length}`,
    values,
  )
  return res.rows.map(coerceBatchRow)
}

export async function getAssetDeliveryBatchById(batchId: string): Promise<AssetDeliveryBatch | null> {
  await ensureAssetDeliveryTables()
  const db = getPool()
  const res = await db.query(
    `SELECT * FROM asset_delivery_batches WHERE batch_id = $1::uuid LIMIT 1`,
    [batchId],
  )
  return res.rows[0] ? coerceBatchRow(res.rows[0]) : null
}

export async function createAssetDeliveryBatch(
  input:     AssetDeliveryBatchInput,
  createdBy: string,
): Promise<AssetDeliveryBatch> {
  await ensureAssetDeliveryTables()
  const db = getPool()
  const batchId = randomUUID()
  const res = await db.query(
    `INSERT INTO asset_delivery_batches (
       batch_id, campaign_slug, campaign_name, lane, email_subject, description, template_id,
       status, total_recipients, total_files, total_bytes,
       created_by, updated_by
     ) VALUES (
       $1::uuid, $2, $3, $4, $5, $6, $7,
       $8, $9, $10, $11,
       $12, $12
     )
     RETURNING *`,
    [
      batchId,
      input.campaign_slug,
      input.campaign_name,
      input.lane ?? null,
      input.email_subject,
      input.description ?? null,
      input.template_id ?? null,
      input.status           ?? 'draft',
      input.total_recipients ?? 0,
      input.total_files      ?? 0,
      input.total_bytes      ?? 0,
      createdBy,
    ],
  )
  return coerceBatchRow(res.rows[0])
}

export async function updateAssetDeliveryBatch(
  batchId:   string,
  updates:   AssetDeliveryBatchUpdate,
  updatedBy: string,
): Promise<AssetDeliveryBatch | null> {
  await ensureAssetDeliveryTables()
  const db = getPool()

  const fields: string[]    = []
  const values: unknown[]   = []
  let   idx                 = 1
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) continue
    if (!BATCH_UPDATABLE.has(key as keyof AssetDeliveryBatchUpdate)) continue
    fields.push(`${key} = $${idx}`)
    values.push(value)
    idx++
  }
  if (fields.length === 0) return getAssetDeliveryBatchById(batchId)

  fields.push(`updated_at = NOW()`)
  fields.push(`updated_by = $${idx}`)
  values.push(updatedBy)
  idx++
  values.push(batchId)

  const res = await db.query(
    `UPDATE asset_delivery_batches
        SET ${fields.join(', ')}
      WHERE batch_id = $${idx}::uuid
      RETURNING *`,
    values,
  )
  return res.rows[0] ? coerceBatchRow(res.rows[0]) : null
}

export async function deleteAssetDeliveryBatch(batchId: string): Promise<boolean> {
  await ensureAssetDeliveryTables()
  const db = getPool()
  const res = await db.query(
    `DELETE FROM asset_delivery_batches WHERE batch_id = $1::uuid`,
    [batchId],
  )
  // CASCADE removes asset_delivery_files / asset_delivery_sends.
  return (res.rowCount ?? 0) > 0
}

// ── File helpers ─────────────────────────────────────────────────

export interface AssetDeliveryFileInput {
  batch_id:          string
  rep_email:         string
  format:            string
  original_filename: string
  r2_key:            string
  r2_url:            string
  file_size_bytes:   number
  mime_type?:        string | null
}

export async function addAssetDeliveryFile(input: AssetDeliveryFileInput): Promise<AssetDeliveryFile> {
  await ensureAssetDeliveryTables()
  const db = getPool()
  const res = await db.query(
    `INSERT INTO asset_delivery_files (
       batch_id, rep_email, format, original_filename,
       r2_key, r2_url, file_size_bytes, mime_type
     ) VALUES (
       $1::uuid, $2, $3, $4,
       $5, $6, $7, $8
     )
     RETURNING *`,
    [
      input.batch_id,
      input.rep_email,
      input.format,
      input.original_filename,
      input.r2_key,
      input.r2_url,
      input.file_size_bytes,
      input.mime_type ?? null,
    ],
  )
  return res.rows[0]
}

export async function getFilesByBatchId(batchId: string): Promise<AssetDeliveryFile[]> {
  await ensureAssetDeliveryTables()
  const db = getPool()
  const res = await db.query(
    `SELECT * FROM asset_delivery_files
       WHERE batch_id = $1::uuid
       ORDER BY rep_email ASC, uploaded_at ASC, id ASC`,
    [batchId],
  )
  return res.rows
}

export async function getFilesByRepEmail(
  batchId:  string,
  repEmail: string,
): Promise<AssetDeliveryFile[]> {
  await ensureAssetDeliveryTables()
  const db = getPool()
  const res = await db.query(
    `SELECT * FROM asset_delivery_files
       WHERE batch_id = $1::uuid AND LOWER(rep_email) = LOWER($2)
       ORDER BY uploaded_at ASC, id ASC`,
    [batchId, repEmail],
  )
  return res.rows
}

export async function getAssetDeliveryFileById(fileId: number): Promise<AssetDeliveryFile | null> {
  await ensureAssetDeliveryTables()
  const db = getPool()
  const res = await db.query(
    `SELECT * FROM asset_delivery_files WHERE id = $1 LIMIT 1`,
    [fileId],
  )
  return res.rows[0] || null
}

export async function deleteAssetDeliveryFile(fileId: number): Promise<boolean> {
  await ensureAssetDeliveryTables()
  const db = getPool()
  const res = await db.query(
    `DELETE FROM asset_delivery_files WHERE id = $1`,
    [fileId],
  )
  return (res.rowCount ?? 0) > 0
}

/**
 * Atomically adjust a batch's running totals. Used when uploading or
 * removing individual files so the batch row reflects current state without
 * a full recount. Positive deltas add, negative deltas subtract (clamped at
 * zero so a buggy caller can't drive totals negative).
 */
export async function incrementBatchCounts(
  batchId:    string,
  fileDelta:  number,
  bytesDelta: number,
  updatedBy:  string,
): Promise<AssetDeliveryBatch | null> {
  await ensureAssetDeliveryTables()
  const db = getPool()
  const res = await db.query(
    `UPDATE asset_delivery_batches
        SET total_files = GREATEST(0, total_files + $1),
            total_bytes = GREATEST(0, total_bytes + $2),
            updated_at  = NOW(),
            updated_by  = $3
      WHERE batch_id = $4::uuid
      RETURNING *`,
    [fileDelta, bytesDelta, updatedBy, batchId],
  )
  return res.rows[0] ? coerceBatchRow(res.rows[0]) : null
}

// ── Send helpers ─────────────────────────────────────────────────

export interface AssetDeliverySendInput {
  batch_id:                string
  rep_id?:                 number | null
  rep_email:               string
  rep_name:                string
  send_status?:            AssetDeliverySendStatus
  attachment_count?:       number
  attachment_total_bytes?: number
  ai_generated_intro?:     string | null
  sendgrid_message_id?:    string | null
  sent_at?:                Date | string | null
  error_message?:          string | null
  /** True when this send was produced by the "Send Test" path. Defaults
   * to false so audit counts reflect real production sends only. */
  is_test?:                boolean
}

export interface AssetDeliverySendUpdate {
  send_status?:            AssetDeliverySendStatus
  attachment_count?:       number
  attachment_total_bytes?: number
  ai_generated_intro?:     string | null
  sendgrid_message_id?:    string | null
  sent_at?:                Date | string | null
  error_message?:          string | null
}

const SEND_UPDATABLE = new Set<keyof AssetDeliverySendUpdate>([
  'send_status', 'attachment_count', 'attachment_total_bytes',
  'ai_generated_intro', 'sendgrid_message_id', 'sent_at', 'error_message',
])

export async function createAssetDeliverySend(input: AssetDeliverySendInput): Promise<AssetDeliverySend> {
  await ensureAssetDeliveryTables()
  const db = getPool()
  const res = await db.query(
    `INSERT INTO asset_delivery_sends (
       batch_id, rep_id, rep_email, rep_name,
       send_status, attachment_count, attachment_total_bytes,
       ai_generated_intro, sendgrid_message_id, sent_at, error_message, is_test
     ) VALUES (
       $1::uuid, $2, $3, $4,
       $5, $6, $7,
       $8, $9, $10, $11, $12
     )
     RETURNING *`,
    [
      input.batch_id,
      input.rep_id ?? null,
      input.rep_email,
      input.rep_name,
      input.send_status            ?? 'pending',
      input.attachment_count       ?? 0,
      input.attachment_total_bytes ?? 0,
      input.ai_generated_intro     ?? null,
      input.sendgrid_message_id    ?? null,
      input.sent_at                ?? null,
      input.error_message          ?? null,
      input.is_test                ?? false,
    ],
  )
  return res.rows[0]
}

export async function updateAssetDeliverySend(
  sendId:  number,
  updates: AssetDeliverySendUpdate,
): Promise<AssetDeliverySend | null> {
  await ensureAssetDeliveryTables()
  const db = getPool()

  const fields: string[]    = []
  const values: unknown[]   = []
  let   idx                 = 1
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) continue
    if (!SEND_UPDATABLE.has(key as keyof AssetDeliverySendUpdate)) continue
    fields.push(`${key} = $${idx}`)
    values.push(value)
    idx++
  }
  if (fields.length === 0) {
    const cur = await db.query(`SELECT * FROM asset_delivery_sends WHERE id = $1 LIMIT 1`, [sendId])
    return cur.rows[0] || null
  }

  fields.push(`updated_at = NOW()`)
  values.push(sendId)

  const res = await db.query(
    `UPDATE asset_delivery_sends
        SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *`,
    values,
  )
  return res.rows[0] || null
}

export async function getSendsByBatchId(batchId: string): Promise<AssetDeliverySend[]> {
  await ensureAssetDeliveryTables()
  const db = getPool()
  const res = await db.query(
    `SELECT * FROM asset_delivery_sends
       WHERE batch_id = $1::uuid
       ORDER BY rep_name ASC, id ASC`,
    [batchId],
  )
  return res.rows
}

// ============================================================
// Marketing Recap — recipients / upcoming / drafts / sends
// ============================================================
// Phase A foundation for the Weekly Marketing Recap email feature.
// All DDL is idempotent (IF NOT EXISTS) and seeds use ON CONFLICT DO NOTHING.
// Counts are INTEGER (no >2GB recipient counts; avoids the pg-string-coercion
// gotcha we hit on Asset Delivery's BIGINT total_bytes). UUIDs are TEXT,
// generated via crypto.randomUUID() in app code rather than the DB.
// No FK constraints — draft_id is joined conceptually as TEXT.

let _marketingRecapTablesReady = false
export async function ensureMarketingRecapTables(): Promise<void> {
  if (_marketingRecapTablesReady) return
  const db = getPool()

  // ── 1. marketing_recap_recipients ───────────────────────────────
  await db.query(`
    CREATE TABLE IF NOT EXISTS marketing_recap_recipients (
      id         SERIAL PRIMARY KEY,
      email      TEXT NOT NULL,
      name       TEXT NOT NULL,
      role       TEXT NOT NULL,
      notes      TEXT,
      active     BOOLEAN     NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_by TEXT,
      updated_by TEXT
    );
  `)
  // Partial unique on lower(email) WHERE active — keeps the soft-delete
  // pattern compatible with re-adding a previously-deactivated email.
  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_recap_recipients_email
      ON marketing_recap_recipients (LOWER(email))
      WHERE active = true;
  `)
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_recap_recipients_active
      ON marketing_recap_recipients (active);
  `)
  await db.query(`
    INSERT INTO marketing_recap_recipients (email, name, role, created_by, updated_by)
    VALUES
      ('rudy@pct.com',      'Rudy Cortez',      'Super Admin', 'system', 'system'),
      ('bheethuis@pct.com', 'Brandon Heethuis', 'Super Admin', 'system', 'system')
    ON CONFLICT DO NOTHING;
  `)

  // ── 2. marketing_upcoming ───────────────────────────────────────
  await db.query(`
    CREATE TABLE IF NOT EXISTS marketing_upcoming (
      id                  SERIAL PRIMARY KEY,
      scheduled_date      DATE NOT NULL,
      title               TEXT NOT NULL,
      lane                TEXT NOT NULL DEFAULT 'other',
      description         TEXT,
      asset_count_planned INTEGER,
      notes               TEXT,
      active              BOOLEAN     NOT NULL DEFAULT true,
      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_by          TEXT,
      updated_by          TEXT
    );
  `)
  // Additive: status column for Stage H1. Three values — 'planned'
  // (default), 'shipped', 'cancelled'. Backfills existing rows to
  // 'planned'. Matches the TEXT-with-CHECK pattern used by the other
  // status-bearing tables in this file (no pg ENUM type — type-safety
  // lives in the TS union and the Zod schema at the route layer).
  await db.query(`
    ALTER TABLE marketing_upcoming
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'planned'
  `)
  await db.query(`
    ALTER TABLE marketing_upcoming
    DROP CONSTRAINT IF EXISTS marketing_upcoming_status_check
  `)
  await db.query(`
    ALTER TABLE marketing_upcoming
    ADD CONSTRAINT marketing_upcoming_status_check
    CHECK (status IN ('planned', 'shipped', 'cancelled'))
  `)
  // Additive: owner column for Stage H2. Optional free-text — whoever's
  // responsible for the item. Nullable (NULL = "unset"); empty string
  // normalizes to NULL at the API layer. No CHECK (free-text — nothing
  // to constrain beyond the length cap, which lives in the Zod schemas
  // at the route layer). No FK to vcard_employees (decision locked).
  await db.query(`
    ALTER TABLE marketing_upcoming
    ADD COLUMN IF NOT EXISTS owner TEXT
  `)
  // Additive: asset_delivery_batch_id FK for Stage H3 — links an
  // upcoming item to the batch that fulfilled it. Nullable (NULL =
  // "no link"). ON DELETE SET NULL so deleting a batch nulls the link
  // rather than cascading or blocking. Setting the link auto-flips
  // status to 'shipped' (in the DB helpers, not here). FK added with a
  // defensive DROP-IF-EXISTS first so re-runs are safe; partial index
  // because Postgres doesn't auto-index FK columns.
  //
  // The FK references asset_delivery_batches, which lives in its own
  // ensure-block. Guarantee that table exists first so a cold start
  // (recap tables initialized before asset-delivery tables) can't fail
  // the ADD CONSTRAINT.
  await ensureAssetDeliveryTables()
  await db.query(`
    ALTER TABLE marketing_upcoming
    ADD COLUMN IF NOT EXISTS asset_delivery_batch_id INTEGER
  `)
  await db.query(`
    ALTER TABLE marketing_upcoming
    DROP CONSTRAINT IF EXISTS marketing_upcoming_asset_link_fk
  `)
  await db.query(`
    ALTER TABLE marketing_upcoming
    ADD CONSTRAINT marketing_upcoming_asset_link_fk
    FOREIGN KEY (asset_delivery_batch_id)
    REFERENCES asset_delivery_batches(id)
    ON DELETE SET NULL
  `)
  await db.query(`
    CREATE INDEX IF NOT EXISTS marketing_upcoming_asset_link_idx
      ON marketing_upcoming(asset_delivery_batch_id)
      WHERE asset_delivery_batch_id IS NOT NULL;
  `)
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_upcoming_date
      ON marketing_upcoming (scheduled_date);
  `)
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_upcoming_active_date
      ON marketing_upcoming (active, scheduled_date)
      WHERE active = true;
  `)

  // ── 3. marketing_recap_drafts ───────────────────────────────────
  await db.query(`
    CREATE TABLE IF NOT EXISTS marketing_recap_drafts (
      id               SERIAL PRIMARY KEY,
      draft_id         TEXT NOT NULL,
      week_start_date  DATE NOT NULL,
      week_end_date    DATE NOT NULL,
      status           TEXT NOT NULL DEFAULT 'draft',
      subject          TEXT NOT NULL,
      html_content     TEXT NOT NULL,
      context_json     JSONB,
      recipient_count  INTEGER     NOT NULL DEFAULT 0,
      successful_sends INTEGER     NOT NULL DEFAULT 0,
      failed_sends     INTEGER     NOT NULL DEFAULT 0,
      sent_at          TIMESTAMPTZ,
      error_summary    TEXT,
      is_test          BOOLEAN     NOT NULL DEFAULT false,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_by       TEXT,
      updated_by       TEXT
    );
  `)
  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_recap_drafts_draft_id
      ON marketing_recap_drafts (draft_id);
  `)
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_recap_drafts_week_start
      ON marketing_recap_drafts (week_start_date DESC);
  `)
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_recap_drafts_status
      ON marketing_recap_drafts (status);
  `)

  // ── 4. marketing_recap_sends ────────────────────────────────────
  await db.query(`
    CREATE TABLE IF NOT EXISTS marketing_recap_sends (
      id                  SERIAL PRIMARY KEY,
      draft_id            TEXT NOT NULL,
      recipient_email     TEXT NOT NULL,
      recipient_name      TEXT NOT NULL,
      recipient_role      TEXT,
      recipient_source    TEXT NOT NULL,
      is_cc               BOOLEAN     NOT NULL DEFAULT false,
      send_status         TEXT        NOT NULL DEFAULT 'pending',
      sendgrid_message_id TEXT,
      sent_at             TIMESTAMPTZ,
      error_message       TEXT,
      is_test             BOOLEAN     NOT NULL DEFAULT false,
      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `)
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_recap_sends_draft_id
      ON marketing_recap_sends (draft_id);
  `)
  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_recap_sends_status
      ON marketing_recap_sends (draft_id, send_status);
  `)

  _marketingRecapTablesReady = true
}

// ── Types ────────────────────────────────────────────────────────

export type RecapDraftStatus = 'draft' | 'sending' | 'sent' | 'failed'
export type RecapSendStatus  = 'pending' | 'sent' | 'failed'
export type RecapRecipientSource = 'recipients_table' | 'sales_manager_flag'

export interface RecapRecipient {
  id:         number
  email:      string
  name:       string
  role:       string
  notes:      string | null
  active:     boolean
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

/**
 * Per-item state for marketing_upcoming. H1 is manual-only — admin
 * sets via the edit form. H3 will auto-derive 'shipped' from a linked
 * asset_delivery batch; the manual control stays as an override.
 * 'cancelled' is orthogonal to soft-delete (active=false): cancelled
 * items remain visible (with a visual cue); soft-deleted items are
 * hidden by activeOnly.
 */
export type UpcomingStatus = 'planned' | 'shipped' | 'cancelled'

export const UPCOMING_STATUSES: readonly UpcomingStatus[] = [
  'planned', 'shipped', 'cancelled',
] as const

/**
 * Max length for the free-text owner field (Stage H2). Exported so the
 * route-layer Zod schemas share a single source of truth with the DB
 * helpers. Client maxLength mirrors this value.
 */
export const OWNER_MAX = 100

/**
 * Normalize a free-text owner value: trim whitespace, collapse empty
 * string → null. NULL and empty string are equivalent "no owner set"
 * representations; we store NULL.
 */
export function normalizeOwner(value: string | null | undefined): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export interface UpcomingItem {
  id:                  number
  scheduled_date:      string
  title:               string
  lane:                string
  description:         string | null
  asset_count_planned: number | null
  notes:               string | null
  active:              boolean
  status:              UpcomingStatus
  owner:               string | null
  asset_delivery_batch_id:    number | null
  asset_delivery_batch_label: string | null
  created_at:          string
  updated_at:          string
  created_by:          string | null
  updated_by:          string | null
}

export interface RecapDraft {
  id:               number
  draft_id:         string
  week_start_date:  string
  week_end_date:    string
  status:           RecapDraftStatus
  subject:          string
  html_content:     string
  context_json:     unknown
  recipient_count:  number
  successful_sends: number
  failed_sends:     number
  sent_at:          string | null
  error_summary:    string | null
  is_test:          boolean
  created_at:       string
  updated_at:       string
  created_by:       string | null
  updated_by:       string | null
}

export interface RecapSend {
  id:                  number
  draft_id:            string
  recipient_email:     string
  recipient_name:      string
  recipient_role:      string | null
  recipient_source:    RecapRecipientSource
  is_cc:               boolean
  send_status:         RecapSendStatus
  sendgrid_message_id: string | null
  sent_at:             string | null
  error_message:       string | null
  is_test:             boolean
  created_at:          string
  updated_at:          string
}

// ── Recipients CRUD ──────────────────────────────────────────────

export async function getRecapRecipients(activeOnly = true): Promise<RecapRecipient[]> {
  await ensureMarketingRecapTables()
  const db = getPool()
  const where = activeOnly ? 'WHERE active = true' : ''
  const res = await db.query(
    `SELECT id, email, name, role, notes, active,
            created_at::text, updated_at::text, created_by, updated_by
       FROM marketing_recap_recipients
       ${where}
       ORDER BY name ASC`,
  )
  return res.rows
}

export async function getRecapRecipientById(id: number): Promise<RecapRecipient | null> {
  await ensureMarketingRecapTables()
  const db = getPool()
  const res = await db.query(
    `SELECT id, email, name, role, notes, active,
            created_at::text, updated_at::text, created_by, updated_by
       FROM marketing_recap_recipients
       WHERE id = $1
       LIMIT 1`,
    [id],
  )
  return res.rows[0] || null
}

export interface RecapRecipientCreateInput {
  email:       string
  name:        string
  role:        string
  notes?:      string | null
  created_by:  string
}

export async function createRecapRecipient(input: RecapRecipientCreateInput): Promise<RecapRecipient> {
  await ensureMarketingRecapTables()
  const db = getPool()
  const res = await db.query(
    `INSERT INTO marketing_recap_recipients
       (email, name, role, notes, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $5)
     RETURNING id, email, name, role, notes, active,
               created_at::text, updated_at::text, created_by, updated_by`,
    [input.email, input.name, input.role, input.notes ?? null, input.created_by],
  )
  return res.rows[0]
}

export interface RecapRecipientUpdate {
  email?:      string
  name?:       string
  role?:       string
  notes?:      string | null
  active?:     boolean
  updated_by:  string
}

const RECIPIENT_UPDATABLE = new Set<keyof RecapRecipientUpdate>([
  'email', 'name', 'role', 'notes', 'active',
])

export async function updateRecapRecipient(
  id:      number,
  updates: RecapRecipientUpdate,
): Promise<RecapRecipient> {
  await ensureMarketingRecapTables()
  const db = getPool()

  const fields: string[]  = []
  const values: unknown[] = []
  let   idx               = 1
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) continue
    if (key === 'updated_by') continue
    if (!RECIPIENT_UPDATABLE.has(key as keyof RecapRecipientUpdate)) continue
    fields.push(`${key} = $${idx}`)
    values.push(value)
    idx++
  }
  fields.push(`updated_at = NOW()`)
  fields.push(`updated_by = $${idx}`)
  values.push(updates.updated_by)
  idx++
  values.push(id)

  const res = await db.query(
    `UPDATE marketing_recap_recipients
        SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING id, email, name, role, notes, active,
                created_at::text, updated_at::text, created_by, updated_by`,
    values,
  )
  return res.rows[0]
}

/** Soft-delete: flip active=false. Caller supplies updated_by. */
export async function deleteRecapRecipient(id: number, updatedBy = 'system'): Promise<void> {
  await ensureMarketingRecapTables()
  const db = getPool()
  await db.query(
    `UPDATE marketing_recap_recipients
        SET active = false, updated_at = NOW(), updated_by = $2
      WHERE id = $1`,
    [id, updatedBy],
  )
}

// ── Upcoming items CRUD ──────────────────────────────────────────

export interface UpcomingItemQueryOpts {
  fromDate?:   string
  toDate?:     string
  activeOnly?: boolean
}

/**
 * Shared SELECT projection for upcoming items. Aliases the table as `u`
 * and LEFT JOINs asset_delivery_batches as `b` (the join is 1:1 — the
 * FK references the unique PK, so no row multiplication). Columns are
 * qualified because created_at/updated_at/id exist in both tables.
 * asset_delivery_batch_label is denormalized here so the UI doesn't
 * need a second fetch.
 */
const UPCOMING_SELECT_COLS = `
  u.id, u.scheduled_date::text, u.title, u.lane, u.description,
  u.asset_count_planned, u.notes, u.active, u.status, u.owner,
  u.asset_delivery_batch_id,
  CASE
    WHEN b.id IS NULL THEN NULL
    ELSE 'Batch #' || b.id || ' — ' || b.campaign_name
  END AS asset_delivery_batch_label,
  u.created_at::text, u.updated_at::text, u.created_by, u.updated_by
`

export async function getUpcomingItems(opts: UpcomingItemQueryOpts = {}): Promise<UpcomingItem[]> {
  await ensureMarketingRecapTables()
  const db = getPool()
  const where: string[]  = []
  const values: unknown[] = []
  if (opts.fromDate) {
    where.push(`u.scheduled_date >= $${values.length + 1}::date`)
    values.push(opts.fromDate)
  }
  if (opts.toDate) {
    where.push(`u.scheduled_date <= $${values.length + 1}::date`)
    values.push(opts.toDate)
  }
  if (opts.activeOnly ?? true) where.push(`u.active = true`)
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const res = await db.query(
    `SELECT ${UPCOMING_SELECT_COLS}
       FROM marketing_upcoming u
       LEFT JOIN asset_delivery_batches b ON b.id = u.asset_delivery_batch_id
       ${whereSql}
       ORDER BY u.scheduled_date ASC, u.id ASC`,
    values,
  )
  return res.rows
}

export async function getUpcomingItemById(id: number): Promise<UpcomingItem | null> {
  await ensureMarketingRecapTables()
  const db = getPool()
  const res = await db.query(
    `SELECT ${UPCOMING_SELECT_COLS}
       FROM marketing_upcoming u
       LEFT JOIN asset_delivery_batches b ON b.id = u.asset_delivery_batch_id
       WHERE u.id = $1
       LIMIT 1`,
    [id],
  )
  return res.rows[0] || null
}

export interface UpcomingItemCreateInput {
  scheduled_date:       string
  title:                string
  lane?:                string
  description?:         string | null
  asset_count_planned?: number | null
  notes?:               string | null
  /** Defaults to 'planned' on the DB side when omitted. */
  status?:              UpcomingStatus
  /** Free-text owner (H2). Empty string normalizes to null. */
  owner?:               string | null
  /** FK to asset_delivery_batches (H3). Setting it auto-flips status. */
  asset_delivery_batch_id?: number | null
  created_by:           string
}

export async function createUpcomingItem(input: UpcomingItemCreateInput): Promise<UpcomingItem> {
  await ensureMarketingRecapTables()
  const db = getPool()

  // Auto-flip (H3): if a batch link is being set AND the caller did NOT
  // explicitly provide a status, derive status='shipped'. Explicit
  // admin intent (any provided status) always wins.
  const linkSet = input.asset_delivery_batch_id != null
  const status =
    input.status !== undefined ? input.status
    : linkSet               ? 'shipped'
    :                         'planned'

  const res = await db.query(
    `INSERT INTO marketing_upcoming
       (scheduled_date, title, lane, description, asset_count_planned, notes, status, owner, asset_delivery_batch_id, created_by, updated_by)
     VALUES ($1::date, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)
     RETURNING id`,
    [
      input.scheduled_date,
      input.title,
      input.lane ?? 'other',
      input.description ?? null,
      input.asset_count_planned ?? null,
      input.notes ?? null,
      status,
      normalizeOwner(input.owner),
      input.asset_delivery_batch_id ?? null,
      input.created_by,
    ],
  )
  // Re-fetch through the joined projection so the returned row carries
  // asset_delivery_batch_label.
  const created = await getUpcomingItemById(res.rows[0].id)
  return created as UpcomingItem
}

export interface UpcomingItemUpdate {
  scheduled_date?:      string
  title?:               string
  lane?:                string
  description?:         string | null
  asset_count_planned?: number | null
  notes?:               string | null
  active?:              boolean
  status?:              UpcomingStatus
  owner?:               string | null
  asset_delivery_batch_id?: number | null
  updated_by:           string
}

const UPCOMING_UPDATABLE = new Set<keyof UpcomingItemUpdate>([
  'scheduled_date', 'title', 'lane', 'description',
  'asset_count_planned', 'notes', 'active', 'status', 'owner',
  'asset_delivery_batch_id',
])

export async function updateUpcomingItem(
  id:      number,
  updates: UpcomingItemUpdate,
): Promise<UpcomingItem> {
  await ensureMarketingRecapTables()
  const db = getPool()

  const fields: string[]  = []
  const values: unknown[] = []
  let   idx               = 1
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) continue
    if (key === 'updated_by') continue
    if (!UPCOMING_UPDATABLE.has(key as keyof UpcomingItemUpdate)) continue
    // scheduled_date is DATE — cast string input so we don't accept TIMESTAMPTZ accidentally
    if (key === 'scheduled_date') {
      fields.push(`${key} = $${idx}::date`)
    } else {
      fields.push(`${key} = $${idx}`)
    }
    // owner is free-text: normalize empty string → null at the DB layer
    // too (the route Zod transform already does this, but a direct
    // helper caller should get the same behavior).
    values.push(key === 'owner' ? normalizeOwner(value as string | null) : value)
    idx++
  }

  // Auto-flip (H3): if this update SETS a batch link (non-null
  // asset_delivery_batch_id) AND status is NOT in the update body,
  // also set status='shipped'. Explicit status in the body always wins
  // (admin intent overrides auto-flip). Removing the link (explicit
  // null) does NOT touch status — no auto-revert, no silent data loss.
  const linkBeingSet =
    updates.asset_delivery_batch_id !== undefined &&
    updates.asset_delivery_batch_id !== null
  if (linkBeingSet && updates.status === undefined) {
    fields.push(`status = $${idx}`)
    values.push('shipped')
    idx++
  }

  fields.push(`updated_at = NOW()`)
  fields.push(`updated_by = $${idx}`)
  values.push(updates.updated_by)
  idx++
  values.push(id)

  await db.query(
    `UPDATE marketing_upcoming
        SET ${fields.join(', ')}
      WHERE id = $${idx}`,
    values,
  )
  // Re-fetch through the joined projection so the returned row carries
  // asset_delivery_batch_label.
  const updated = await getUpcomingItemById(id)
  return updated as UpcomingItem
}

/** Soft-delete: flip active=false. */
export async function deleteUpcomingItem(id: number, updatedBy = 'system'): Promise<void> {
  await ensureMarketingRecapTables()
  const db = getPool()
  await db.query(
    `UPDATE marketing_upcoming
        SET active = false, updated_at = NOW(), updated_by = $2
      WHERE id = $1`,
    [id, updatedBy],
  )
}

// ── Batch picker (H3) ────────────────────────────────────────────

/**
 * Lightweight row for the asset-link picker. Only what the combobox
 * needs — id, a human-readable label, the creation date for sorting/
 * display, and status (shown as a subtle hint; the picker does NOT
 * filter on it, per the locked decision).
 */
export interface BatchPickerRow {
  id:         number
  label:      string
  created_at: string
  status:     string
}

/** All batches, most-recent first, shaped for the asset-link picker. */
export async function listBatchesForPicker(): Promise<BatchPickerRow[]> {
  await ensureAssetDeliveryTables()
  const db = getPool()
  const res = await db.query(
    `SELECT id,
            ('Batch #' || id || ' — ' || campaign_name) AS label,
            created_at::text AS created_at,
            status
       FROM asset_delivery_batches
      ORDER BY created_at DESC, id DESC`,
  )
  return res.rows
}

// ── Drafts ───────────────────────────────────────────────────────

export interface RecapDraftQueryOpts {
  status?: RecapDraftStatus
  limit?:  number
}

export async function getRecapDrafts(opts: RecapDraftQueryOpts = {}): Promise<RecapDraft[]> {
  await ensureMarketingRecapTables()
  const db = getPool()
  const limit  = Math.max(1, Math.min(opts.limit ?? 50, 200))
  const where: string[]  = []
  const values: unknown[] = []
  if (opts.status) {
    where.push(`status = $${values.length + 1}`)
    values.push(opts.status)
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  values.push(limit)
  const res = await db.query(
    `SELECT id, draft_id, week_start_date::text, week_end_date::text,
            status, subject, html_content, context_json,
            recipient_count, successful_sends, failed_sends,
            sent_at::text, error_summary, is_test,
            created_at::text, updated_at::text, created_by, updated_by
       FROM marketing_recap_drafts
       ${whereSql}
       ORDER BY week_start_date DESC, id DESC
       LIMIT $${values.length}`,
    values,
  )
  return res.rows
}

export async function getRecapDraftByDraftId(draftId: string): Promise<RecapDraft | null> {
  await ensureMarketingRecapTables()
  const db = getPool()
  const res = await db.query(
    `SELECT id, draft_id, week_start_date::text, week_end_date::text,
            status, subject, html_content, context_json,
            recipient_count, successful_sends, failed_sends,
            sent_at::text, error_summary, is_test,
            created_at::text, updated_at::text, created_by, updated_by
       FROM marketing_recap_drafts
       WHERE draft_id = $1
       LIMIT 1`,
    [draftId],
  )
  return res.rows[0] || null
}

export interface RecapDraftCreateInput {
  draft_id:        string
  week_start_date: string
  week_end_date:   string
  subject:         string
  html_content:    string
  context_json:    unknown
  is_test?:        boolean
  created_by:      string
}

export async function createRecapDraft(input: RecapDraftCreateInput): Promise<RecapDraft> {
  await ensureMarketingRecapTables()
  const db = getPool()
  const res = await db.query(
    `INSERT INTO marketing_recap_drafts
       (draft_id, week_start_date, week_end_date, status, subject,
        html_content, context_json, is_test, created_by, updated_by)
     VALUES ($1, $2::date, $3::date, 'draft', $4,
             $5, $6, $7, $8, $8)
     RETURNING id, draft_id, week_start_date::text, week_end_date::text,
               status, subject, html_content, context_json,
               recipient_count, successful_sends, failed_sends,
               sent_at::text, error_summary, is_test,
               created_at::text, updated_at::text, created_by, updated_by`,
    [
      input.draft_id,
      input.week_start_date,
      input.week_end_date,
      input.subject,
      input.html_content,
      input.context_json !== undefined ? JSON.stringify(input.context_json) : null,
      input.is_test ?? false,
      input.created_by,
    ],
  )
  return res.rows[0]
}

export interface RecapDraftStatusUpdate {
  successful_sends?: number
  failed_sends?:     number
  recipient_count?:  number
  sent_at?:          string
  error_summary?:    string
  updated_by:        string
}

export async function updateRecapDraftStatus(
  draftId: string,
  status:  'sending' | 'sent' | 'failed',
  updates: RecapDraftStatusUpdate,
): Promise<RecapDraft | null> {
  await ensureMarketingRecapTables()
  const db = getPool()

  const sets: string[]   = ['status = $1']
  const values: unknown[] = [status]
  let   idx               = 2
  const push = (col: string, value: unknown, cast = '') => {
    sets.push(`${col} = $${idx}${cast}`)
    values.push(value)
    idx++
  }
  if (updates.successful_sends !== undefined) push('successful_sends', updates.successful_sends)
  if (updates.failed_sends     !== undefined) push('failed_sends',     updates.failed_sends)
  if (updates.recipient_count  !== undefined) push('recipient_count',  updates.recipient_count)
  if (updates.sent_at          !== undefined) push('sent_at',          updates.sent_at, '::timestamptz')
  if (updates.error_summary    !== undefined) push('error_summary',    updates.error_summary)

  sets.push('updated_at = NOW()')
  sets.push(`updated_by = $${idx}`)
  values.push(updates.updated_by)
  idx++
  values.push(draftId)

  const res = await db.query(
    `UPDATE marketing_recap_drafts
        SET ${sets.join(', ')}
      WHERE draft_id = $${idx}
      RETURNING id, draft_id, week_start_date::text, week_end_date::text,
                status, subject, html_content, context_json,
                recipient_count, successful_sends, failed_sends,
                sent_at::text, error_summary, is_test,
                created_at::text, updated_at::text, created_by, updated_by`,
    values,
  )
  return res.rows[0] || null
}

// ── Sends ────────────────────────────────────────────────────────

export interface RecapSendCreateInput {
  draft_id:         string
  recipient_email:  string
  recipient_name:   string
  recipient_role?:  string
  recipient_source: RecapRecipientSource
  is_cc?:           boolean
  is_test?:         boolean
}

export async function createRecapSend(input: RecapSendCreateInput): Promise<RecapSend> {
  await ensureMarketingRecapTables()
  const db = getPool()
  const res = await db.query(
    `INSERT INTO marketing_recap_sends
       (draft_id, recipient_email, recipient_name, recipient_role,
        recipient_source, is_cc, send_status, is_test)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)
     RETURNING id, draft_id, recipient_email, recipient_name, recipient_role,
               recipient_source, is_cc, send_status, sendgrid_message_id,
               sent_at::text, error_message, is_test,
               created_at::text, updated_at::text`,
    [
      input.draft_id,
      input.recipient_email,
      input.recipient_name,
      input.recipient_role ?? null,
      input.recipient_source,
      input.is_cc   ?? false,
      input.is_test ?? false,
    ],
  )
  return res.rows[0]
}

export interface RecapSendStatusUpdate {
  sendgrid_message_id?: string
  sent_at?:             string
  error_message?:       string
}

export async function updateRecapSendStatus(
  id:      number,
  status:  'sent' | 'failed',
  updates: RecapSendStatusUpdate = {},
): Promise<RecapSend> {
  await ensureMarketingRecapTables()
  const db = getPool()

  const sets: string[]   = ['send_status = $1']
  const values: unknown[] = [status]
  let   idx               = 2
  if (updates.sendgrid_message_id !== undefined) {
    sets.push(`sendgrid_message_id = $${idx}`); values.push(updates.sendgrid_message_id); idx++
  }
  if (updates.sent_at !== undefined) {
    sets.push(`sent_at = $${idx}::timestamptz`); values.push(updates.sent_at); idx++
  }
  if (updates.error_message !== undefined) {
    sets.push(`error_message = $${idx}`); values.push(updates.error_message); idx++
  }
  sets.push('updated_at = NOW()')
  values.push(id)

  const res = await db.query(
    `UPDATE marketing_recap_sends
        SET ${sets.join(', ')}
      WHERE id = $${idx}
      RETURNING id, draft_id, recipient_email, recipient_name, recipient_role,
                recipient_source, is_cc, send_status, sendgrid_message_id,
                sent_at::text, error_message, is_test,
                created_at::text, updated_at::text`,
    values,
  )
  return res.rows[0]
}

export async function getRecapSendsByDraftId(draftId: string): Promise<RecapSend[]> {
  await ensureMarketingRecapTables()
  const db = getPool()
  const res = await db.query(
    `SELECT id, draft_id, recipient_email, recipient_name, recipient_role,
            recipient_source, is_cc, send_status, sendgrid_message_id,
            sent_at::text, error_message, is_test,
            created_at::text, updated_at::text
       FROM marketing_recap_sends
       WHERE draft_id = $1
       ORDER BY is_cc ASC, recipient_name ASC, id ASC`,
    [draftId],
  )
  return res.rows
}

// ── Sales managers (for recipient resolution) ────────────────────

export interface ActiveSalesManager {
  email:      string
  first_name: string
  last_name:  string
  sms_code:   string | null
}

export async function getActiveSalesManagers(): Promise<ActiveSalesManager[]> {
  // No ensureMarketingRecapTables() needed — this reads from vcard_employees,
  // which is unrelated. Kept here because the recap resolver is the only
  // caller and co-locating with the rest of the recap helpers improves
  // discoverability.
  const db = getPool()
  const res = await db.query(`
    SELECT email, first_name, last_name, sms_code
      FROM vcard_employees
     WHERE active = true AND sales_manager = true
     ORDER BY first_name ASC
  `)
  return res.rows
}
