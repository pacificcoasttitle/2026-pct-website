// ============================================================
// PCT Team Member / Employee Types
// Matches vcard_employees PostgreSQL table schema
// ============================================================

export interface Office {
  id:     number
  name:   string
  street: string | null
  city:   string | null
  state:  string | null
  zip:    string | null
  phone:  string | null
  region: string | null
}

export interface Department {
  id:    number
  name:  string
  color: string
}

export interface Employee {
  id:            number
  slug:          string
  first_name:    string
  last_name:     string
  /** Full display name — computed as `first_name + ' ' + last_name` */
  name:          string
  title:         string | null
  department_id: number | null
  office_id:     number | null
  email:         string | null
  phone:         string | null
  mobile:        string | null
  sms_code:      string | null
  bio:           string | null
  photo_url:     string | null
  /** JSON string array, e.g. '["English","Spanish"]' */
  languages:     string | null
  /** JSON string array, e.g. '["Residential Title","Refinancing"]' */
  specialties:   string | null
  linkedin:      string | null
  facebook:      string | null
  instagram:     string | null
  twitter:       string | null
  website:       string | null
  theme_color:   string | null
  active:        boolean
  featured:      boolean
  view_count:    number
  save_count:    number
  // Website-page fields
  website_active:           boolean
  website_bio:              string | null
  website_specialties:      string | null
  mailchimp_form_code:      string | null
  mailchimp_audience_id:    string | null
  website_hero_image:       string | null
  website_custom_title:     string | null
  website_meta_description: string | null
  // Joined fields (when fetched with office/department)
  office?:     Office | null
  department?: Department | null
}

// Helpers — handles both JSON arrays and comma-separated plain strings
function smartParse(raw: string | null): string[] {
  if (!raw || !raw.trim()) return []
  const trimmed = raw.trim()
  // Try JSON first (e.g. '["English","Spanish"]')
  if (trimmed.startsWith('[')) {
    try { return JSON.parse(trimmed) } catch { /* fall through */ }
  }
  // Fallback: comma-separated or period-separated plain string
  return trimmed
    .split(/[,.]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function parseLangs(raw: string | null): string[] {
  return smartParse(raw)
}

export function parseSpecs(raw: string | null): string[] {
  return smartParse(raw)
}

export const R2_BASE = 'https://pub-dbe01c2b9ef0457c979ef76b8d8618f3.r2.dev/sales-rep-photos/WebThumb'

/** Resolve photo URL — prefers DB value if absolute, falls back to R2 */
export function resolvePhotoUrl(employee: Pick<Employee, 'first_name' | 'photo_url'>): string {
  if (employee.photo_url?.startsWith('http')) return employee.photo_url
  const name = employee.first_name.charAt(0).toUpperCase() + employee.first_name.slice(1).toLowerCase()
  return `${R2_BASE}/${name}.png`
}
