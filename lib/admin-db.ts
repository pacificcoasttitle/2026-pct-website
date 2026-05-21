// ============================================================
// PCT Admin — database query helpers (Node.js runtime only)
// ============================================================

import { Pool } from 'pg'
import type { Employee } from '@/types/employee'

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
      name: 'Holiday Greeting',
      subject: 'Warm Wishes from {{REP_NAME}} at PCT',
      preheader: 'Wishing you and your family a wonderful season.',
      html: wrap(`
      <tr><td style="background:linear-gradient(135deg,#03374f,#065a7a);padding:32px;text-align:center;">
        <img src="https://www.pct.com/logo2.png" alt="PCT" width="120" style="display:inline-block;opacity:.9;margin-bottom:16px;" /><br/>
        <h1 style="margin:0;color:#fff;font-size:28px;font-weight:300;letter-spacing:0.02em;">Season&rsquo;s Greetings</h1>
      </td></tr>
      <tr><td><img src="{{HERO_IMAGE}}" alt="Happy Holidays" width="600" style="display:block;width:100%;height:auto;" /></td></tr>
      <tr><td style="padding:32px;text-align:center;">
        <h2 style="margin:0 0 16px;color:#03374f;font-size:22px;">Wishing You a Wonderful Season</h2>
        <p style="margin:0 0 16px;color:#4b5563;line-height:1.8;max-width:460px;display:inline-block;">Thank you for your trust and partnership this year. I look forward to helping you and your clients with all of their title and escrow needs in the coming year.</p>
        <p style="margin:0;color:#4b5563;line-height:1.8;font-style:italic;">Warm regards,<br/><strong style="color:#03374f;">{{REP_NAME}}</strong></p>
      </td></tr>`)
    },
  }

  for (const [cat, d] of Object.entries(defaults)) {
    if (!cats.has(cat)) {
      await db.query(
        `INSERT INTO vcard_email_templates (name, subject, preheader, html_content, category, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, 'system', 'system')`,
        [d.name, d.subject, d.preheader, d.html, cat]
      )
    }
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
}

export async function createEmailCampaignLog(input: {
  name: string
  subject: string
  audience_id?: string
  template_id?: number
  mailchimp_campaign_id?: string
  mailchimp_web_id?: string
  status: string
  scheduled_at?: string
  notes?: string
}): Promise<EmailCampaignLog> {
  await ensureExtraTables()
  const db = getPool()
  const res = await db.query(`
    INSERT INTO vcard_email_campaigns
      (name, subject, audience_id, template_id, mailchimp_campaign_id, mailchimp_web_id, status, scheduled_at, notes)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING id, name, subject, audience_id, template_id, mailchimp_campaign_id, mailchimp_web_id, status, scheduled_at::text, notes, created_at::text
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
  ])
  return res.rows[0]
}

export async function getEmailCampaignLogs(limit = 50): Promise<EmailCampaignLog[]> {
  await ensureExtraTables()
  const db = getPool()
  const res = await db.query(`
    SELECT id, name, subject, audience_id, template_id, mailchimp_campaign_id, mailchimp_web_id, status, scheduled_at::text, notes, created_at::text
    FROM vcard_email_campaigns
    ORDER BY created_at DESC
    LIMIT $1
  `, [limit])
  return res.rows
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
