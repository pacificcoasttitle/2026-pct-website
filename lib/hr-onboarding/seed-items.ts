/**
 * HR onboarding checklist — the canonical seed item list (v1).
 *
 * The 16 items below reuse the EXACT labels/keys/categories/order from the
 * legacy rep onboarding flow (labels only — none of that system's code is
 * touched). They are seeded onto an hr_onboarding when it is created.
 *
 * ⚠️ The two onboarding types DIVERGE:
 *   - sales_rep → the full 16-item CANONICAL_ITEMS (unchanged).
 *   - employee  → a trimmed 2-item list: HR Packet + a headshot-only
 *     'Headshot' item (distinct from the rep's 'Headshot, Bio, and
 *     Client List'). No sales items.
 *
 * ⚠️ All items seed as status='pending', source='manual'. The `source`
 * field is a DORMANT seam: a future auto-checker can flip specific items to
 * source='auto' + status='complete' (e.g. when a headshot doc arrives).
 * v1 never sets 'auto'.
 */

export type HrOnboardingType = 'employee' | 'sales_rep'
export type HrOnboardingItemCategory = 'administrative' | 'marketing' | 'customer-service'

export interface HrOnboardingSeedItem {
  item_key: string
  label:    string
  category: HrOnboardingItemCategory
}

/** The canonical 16-item list (order = sort_order). */
const CANONICAL_ITEMS: HrOnboardingSeedItem[] = [
  { item_key: 'sales-agreement',          category: 'administrative',   label: 'Sales Agreement' },
  { item_key: 'license-live-scan',        category: 'administrative',   label: 'Marketing Sales Rep License & Live Scan' },
  { item_key: 'hr-packet',                category: 'administrative',   label: 'HR Packet (Background Check, Direct Deposit, Company Policies, etc.)' },
  { item_key: 'headshot-bio-client-list', category: 'marketing',        label: 'Headshot, Bio, and Client List' },
  { item_key: 'business-cards',           category: 'marketing',        label: 'Business Cards & Contact Cards & Name Tag' },
  { item_key: 'email-banner',             category: 'marketing',        label: 'Email Banner & Announcement' },
  { item_key: 'ratesheets',               category: 'marketing',        label: 'Ratesheets & Ratebooks' },
  { item_key: 'agent-one',                category: 'marketing',        label: 'Pacific Coast Agent One: App & Dashboard' },
  { item_key: 'instant-profile',          category: 'marketing',        label: 'Pacific Coast Instant Profile: Setup' },
  { item_key: 'title-toolbox',            category: 'marketing',        label: 'PCT Title Toolbox' },
  { item_key: 'title-sphere',             category: 'marketing',        label: 'Title Sphere' },
  { item_key: 'rea-reports',              category: 'marketing',        label: 'REA Reports: Setup' },
  { item_key: 'mailchimp',                category: 'marketing',        label: 'Mailchimp Email Marketing: Setup' },
  { item_key: 'farms-report-ordering',    category: 'customer-service', label: 'Farms & Report Ordering Protocol' },
  { item_key: 'open-order',               category: 'customer-service', label: 'Open Order Form & Protocol' },
  { item_key: 'nationwide-order',         category: 'customer-service', label: 'Nationwide Order Protocol' },
]

/** The new headshot-only item for the regular-employee list. ⚠️ DISTINCT
 * from the rep's 'headshot-bio-client-list' — this is a plain headshot. */
const HEADSHOT_EMPLOYEE_ITEM: HrOnboardingSeedItem = {
  item_key: 'headshot-employee', category: 'marketing', label: 'Headshot',
}

/** Regular-employee list: just the HR packet + a headshot. Reuses the
 * canonical hr-packet definition; carries NO sales items. */
const EMPLOYEE_ITEMS: HrOnboardingSeedItem[] = [
  CANONICAL_ITEMS.find((i) => i.item_key === 'hr-packet')!,
  HEADSHOT_EMPLOYEE_ITEM,
]

/**
 * Per-type seed map. sales_rep = the full canonical 16 (unchanged);
 * employee = the trimmed 2-item list. Array order = sort_order.
 */
export const HR_ONBOARDING_SEED_ITEMS: Record<HrOnboardingType, HrOnboardingSeedItem[]> = {
  employee:  EMPLOYEE_ITEMS,
  sales_rep: CANONICAL_ITEMS,
}

/** Resolve the seed set for a type, defaulting to sales_rep (the v1 default). */
export function seedItemsForType(type: string | null | undefined): HrOnboardingSeedItem[] {
  return type === 'employee'
    ? HR_ONBOARDING_SEED_ITEMS.employee
    : HR_ONBOARDING_SEED_ITEMS.sales_rep
}

/** Display order for category groupings in the HR panel. */
export const HR_ONBOARDING_CATEGORY_ORDER: HrOnboardingItemCategory[] = [
  'administrative', 'marketing', 'customer-service',
]

export const HR_ONBOARDING_CATEGORY_LABELS: Record<HrOnboardingItemCategory, string> = {
  'administrative':   'Administrative',
  'marketing':        'Marketing',
  'customer-service': 'Customer Service',
}
