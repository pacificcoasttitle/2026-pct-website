// ============================================================
// PCT VCard Database — typed Postgres query helpers
// Queries the vcard_* tables on the Render PostgreSQL instance.
// ============================================================

import { Pool } from 'pg'
import type { Employee, Office, Department } from '@/types/employee'

// ── Connection pool (singleton) ──────────────────────────────

let _pool: Pool | null = null

function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30_000,
    })
  }
  return _pool
}

// ── Column list (with JOIN aliases) ─────────────────────────

const COLS = `
  e.id,
  e.slug,
  e.first_name,
  e.last_name,
  e.first_name || ' ' || e.last_name AS name,
  e.title,
  e.department_id,
  e.office_id,
  e.email,
  e.phone,
  e.mobile,
  e.sms_code,
  e.bio,
  e.photo_url,
  e.languages,
  e.specialties,
  e.linkedin,
  e.facebook,
  e.instagram,
  e.twitter,
  e.website,
  e.theme_color,
  e.active,
  e.featured,
  e.view_count,
  e.save_count,
  e.website_active,
  e.website_bio,
  e.website_specialties,
  e.mailchimp_form_code,
  e.mailchimp_audience_id,
  e.website_hero_image,
  e.website_custom_title,
  e.website_meta_description,
  o.id          AS office__id,
  o.name        AS office__name,
  o.street      AS office__street,
  o.city        AS office__city,
  o.state       AS office__state,
  o.zip         AS office__zip,
  o.phone       AS office__phone,
  o.region      AS office__region,
  d.id          AS dept__id,
  d.name        AS dept__name,
  d.color       AS dept__color
`

const FROM = `
  FROM vcard_employees e
  LEFT JOIN vcard_offices     o ON o.id = e.office_id
  LEFT JOIN vcard_departments d ON d.id = e.department_id
`

// ── Row mapper ───────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(r: Record<string, any>): Employee {
  const office: Office | null = r['office__id']
    ? {
        id:     r['office__id'] as number,
        name:   r['office__name'] as string,
        street: r['office__street'] as string | null,
        city:   r['office__city']   as string | null,
        state:  r['office__state']  as string | null,
        zip:    r['office__zip']    as string | null,
        phone:  r['office__phone']  as string | null,
        region: r['office__region'] as string | null,
      }
    : null

  const department: Department | null = r['dept__id']
    ? {
        id:    r['dept__id']   as number,
        name:  r['dept__name'] as string,
        color: r['dept__color'] as string,
      }
    : null

  return {
    id:            r['id']            as number,
    slug:          r['slug']          as string,
    first_name:    r['first_name']    as string,
    last_name:     r['last_name']     as string,
    name:          r['name']          as string,
    title:         r['title']         as string | null,
    department_id: r['department_id'] as number | null,
    office_id:     r['office_id']     as number | null,
    email:         r['email']         as string | null,
    phone:         r['phone']         as string | null,
    mobile:        r['mobile']        as string | null,
    sms_code:      r['sms_code']      as string | null,
    bio:           r['bio']           as string | null,
    photo_url:     r['photo_url']     as string | null,
    languages:     r['languages']     as string | null,
    specialties:   r['specialties']   as string | null,
    linkedin:      r['linkedin']      as string | null,
    facebook:      r['facebook']      as string | null,
    instagram:     r['instagram']     as string | null,
    twitter:       r['twitter']       as string | null,
    website:       r['website']       as string | null,
    theme_color:   r['theme_color']   as string | null,
    active:        r['active']        as boolean,
    featured:      r['featured']      as boolean,
    view_count:    r['view_count']    as number,
    save_count:    r['save_count']    as number,
    website_active:           r['website_active']           as boolean,
    website_bio:              r['website_bio']              as string | null,
    website_specialties:      r['website_specialties']      as string | null,
    mailchimp_form_code:      r['mailchimp_form_code']      as string | null,
    mailchimp_audience_id:    r['mailchimp_audience_id']    as string | null,
    website_hero_image:       r['website_hero_image']       as string | null,
    website_custom_title:     r['website_custom_title']     as string | null,
    website_meta_description: r['website_meta_description'] as string | null,
    office,
    department,
  }
}

// ── Public helpers ───────────────────────────────────────────

/** Fetch a single active employee by slug. Returns null if not found. */
export async function getEmployeeBySlug(slug: string): Promise<Employee | null> {
  try {
    const db = getPool()
    const res = await db.query(
      `SELECT ${COLS} ${FROM} WHERE e.slug = $1 AND e.active = TRUE LIMIT 1`,
      [slug.toLowerCase()]
    )
    return res.rows[0] ? mapRow(res.rows[0]) : null
  } catch (err) {
    console.error('[vcard-db] getEmployeeBySlug error:', err)
    return null
  }
}

/** Fetch all active employees, featured first then alphabetical by last name. */
export async function getAllActiveEmployees(): Promise<Employee[]> {
  try {
    const db = getPool()
    const res = await db.query(
      `SELECT ${COLS} ${FROM}
       WHERE e.active = TRUE
       ORDER BY e.featured DESC, e.last_name ASC`
    )
    return res.rows.map(mapRow)
  } catch (err) {
    console.error('[vcard-db] getAllActiveEmployees error:', err)
    return []
  }
}

/** Fetch employees with website_active = true (for public directory). */
export async function getWebsiteEmployees(): Promise<Employee[]> {
  try {
    const db = getPool()
    const res = await db.query(
      `SELECT ${COLS} ${FROM}
       WHERE e.active = TRUE AND e.website_active = TRUE
       ORDER BY e.last_name ASC`
    )
    return res.rows.map(mapRow)
  } catch (err) {
    console.error('[vcard-db] getWebsiteEmployees error:', err)
    return []
  }
}

/** Fetch all active employees grouped — returns raw array (group on client). */
export async function getEmployeesByDepartment(departmentId: number): Promise<Employee[]> {
  try {
    const db = getPool()
    const res = await db.query(
      `SELECT ${COLS} ${FROM}
       WHERE e.active = TRUE AND e.department_id = $1
       ORDER BY e.last_name ASC`,
      [departmentId]
    )
    return res.rows.map(mapRow)
  } catch (err) {
    console.error('[vcard-db] getEmployeesByDepartment error:', err)
    return []
  }
}

/** Increment view count for an employee (fire-and-forget). */
export function recordView(slug: string): void {
  getPool()
    .query(`UPDATE vcard_employees SET view_count = view_count + 1 WHERE slug = $1`, [slug])
    .catch(() => { /* non-critical */ })
}
