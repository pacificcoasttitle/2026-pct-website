// ============================================================
// PCT Admin — database query helpers (Node.js runtime only)
// ============================================================

import { Pool } from 'pg'
import type { Employee } from '@/types/employee'

let _pool: Pool | null = null
function getPool(): Pool {
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
