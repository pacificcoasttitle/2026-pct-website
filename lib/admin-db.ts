// ============================================================
// PCT Admin — database query helpers (Node.js runtime only)
// ============================================================

import { Pool } from 'pg'
import type { Employee } from '@/types/employee'
import { CORPORATE_STANDARD_HTML } from '@/lib/signature-templates/corporate-standard'
import {
  HOLIDAY_GREETING_HTML,
  HOLIDAY_GREETING_META,
} from '@/lib/email-templates/holiday-greeting'

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
  e.active, e.featured, e.website_active,
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
  sms_code:                string | null
  bio:                     string | null
  photo_url:               string | null
  languages:               string | null
  specialties:             string | null
  linkedin:                string | null
  theme_color:             string | null
  active:                  boolean
  featured:                boolean
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

export async function getEmployeeBySmsCode(code: string): Promise<{ slug: string; name: string; email: string | null; phone: string | null } | null> {
  const db  = getPool()
  const res = await db.query(
    `SELECT slug, first_name || ' ' || last_name AS name, email, phone
     FROM vcard_employees WHERE UPPER(sms_code) = UPPER($1) AND active = true LIMIT 1`,
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
      name: 'Product Spotlight',
      subject: 'New from Pacific Coast Title — {{REP_NAME}}',
      preheader: 'A new service designed to streamline your next transaction.',
      html: wrap(`
      <tr><td style="background:#03374f;padding:24px 32px;"><img src="https://www.pct.com/logo2.png" alt="Pacific Coast Title" width="140" style="display:block;opacity:.95;" /></td></tr>
      <tr><td><img src="{{HERO_IMAGE}}" alt="Product" width="600" style="display:block;width:100%;height:auto;" /></td></tr>
      <tr><td style="padding:32px;">
        <h2 style="margin:0 0 12px;color:#03374f;font-size:22px;">Introducing Our Latest Service</h2>
        <p style="margin:0 0 16px;color:#4b5563;line-height:1.7;">Share details about a new product, service, or capability your clients should know about. Highlight the value proposition and how it makes their next transaction easier.</p>
        <a href="https://www.pct.com" style="display:inline-block;padding:12px 28px;border-radius:8px;background:#f26b2b;color:#fff;text-decoration:none;font-weight:600;font-size:14px;">Learn More</a>
      </td></tr>`)
    },
    title_news: {
      name: 'Title Industry News',
      subject: 'Title Industry Update — {{REP_NAME}}',
      preheader: 'Important regulatory and industry changes you should know.',
      html: wrap(`
      <tr><td style="background:#03374f;padding:24px 32px;">
        <p style="margin:0;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Industry Update</p>
        <h1 style="margin:6px 0 0;color:#fff;font-size:24px;">Title News Briefing</h1>
      </td></tr>
      <tr><td><img src="{{HERO_IMAGE}}" alt="News" width="600" style="display:block;width:100%;height:auto;" /></td></tr>
      <tr><td style="padding:32px;">
        <h2 style="margin:0 0 12px;color:#03374f;font-size:20px;">Headline Goes Here</h2>
        <p style="margin:0 0 16px;color:#4b5563;line-height:1.7;">Write about a regulatory change, new compliance requirement, or industry trend. Keep it concise and actionable — agents want to know what it means for their deals.</p>
        <p style="margin:0 0 16px;color:#4b5563;line-height:1.7;"><strong style="color:#03374f;">What This Means for You:</strong> Add practical takeaways here.</p>
        <a href="https://www.pct.com" style="display:inline-block;padding:12px 28px;border-radius:8px;background:#f26b2b;color:#fff;text-decoration:none;font-weight:600;font-size:14px;">Read Full Article</a>
      </td></tr>`)
    },
    market_update: {
      name: 'Market Update',
      subject: 'Market Snapshot — {{REP_NAME}}',
      preheader: 'Your local real estate market at a glance.',
      html: wrap(`
      <tr><td style="background:#03374f;padding:24px 32px;">
        <p style="margin:0;color:rgba(255,255,255,0.5);font-size:11px;text-transform:uppercase;letter-spacing:0.1em;">Monthly Report</p>
        <h1 style="margin:6px 0 0;color:#fff;font-size:24px;">Market Snapshot</h1>
      </td></tr>
      <tr><td><img src="{{HERO_IMAGE}}" alt="Market" width="600" style="display:block;width:100%;height:auto;" /></td></tr>
      <tr><td style="padding:32px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td width="48%" style="background:#f0ede9;border-radius:12px;padding:20px;text-align:center;">
            <p style="margin:0 0 4px;color:#9ca3af;font-size:11px;">Active Inventory</p>
            <p style="margin:0;color:#03374f;font-size:28px;font-weight:700;">+12%</p>
            <p style="margin:4px 0 0;color:#6b7280;font-size:11px;">vs last month</p>
          </td>
          <td width="4%"></td>
          <td width="48%" style="background:#f0ede9;border-radius:12px;padding:20px;text-align:center;">
            <p style="margin:0 0 4px;color:#9ca3af;font-size:11px;">Avg Days on Market</p>
            <p style="margin:0;color:#f26b2b;font-size:28px;font-weight:700;">18</p>
            <p style="margin:4px 0 0;color:#6b7280;font-size:11px;">days</p>
          </td>
        </tr></table>
        <h3 style="margin:24px 0 8px;color:#03374f;font-size:16px;">Key Takeaway</h3>
        <p style="margin:0 0 16px;color:#4b5563;line-height:1.7;">Replace with your local market commentary. What are you seeing on the ground? What should agents prepare for?</p>
        <a href="https://www.pct.com" style="display:inline-block;padding:12px 28px;border-radius:8px;background:#f26b2b;color:#fff;text-decoration:none;font-weight:600;font-size:14px;">View Full Report</a>
      </td></tr>`)
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
