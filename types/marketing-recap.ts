/**
 * MarketingRecapContext
 *
 * Canonical data shape for the Weekly Marketing Recap email.
 *
 * - Produced by lib/marketing-recap-data.ts (data shaper, Phase C2)
 * - Consumed by lib/email-templates/marketing-recap.ts (Mustache template, Phase C1)
 * - Stored as JSONB in marketing_recap_drafts.context_json (Phase A schema)
 * - Used by the generate-draft route to render and persist the HTML
 *
 * All fields are required (no optional fields at the top level).
 * For empty states, fields like batches_sent are empty arrays rather
 * than undefined, so Mustache section blocks {{#batches_sent}}...{{/}}
 * render the empty-state copy correctly.
 *
 * Date strings throughout are ISO YYYY-MM-DD format (e.g., '2026-05-26').
 * Display formatting is the template's responsibility, not the data
 * shaper's.
 */
export interface MarketingRecapContext {
  // ───── Email metadata ─────

  /** Subject line for the email. May include Mustache placeholders that
   *  the generate-draft route substitutes before send. */
  subject: string

  /** Pre-formatted week range string for the email header.
   *  Example: "May 19 to May 25, 2026" */
  week_range_label: string

  /** ISO date for the Monday of last week (the "sent last week" boundary).
   *  Example: '2026-05-19' */
  last_week_start: string

  /** ISO date for the Sunday of last week. Example: '2026-05-25' */
  last_week_end: string

  /** ISO date for the Monday of next week. Example: '2026-05-26' */
  next_week_start: string

  /** ISO date for the Sunday of next week. Example: '2026-06-01' */
  next_week_end: string

  // ───── "SENT LAST WEEK" section ─────

  /** Array of asset delivery campaigns that were sent in the prior week.
   *  Empty array if no campaigns were sent. */
  batches_sent: RecapBatchSummary[]

  /** True when batches_sent.length === 0. Lets the template render an
   *  empty-state block via {{^has_batches_sent}}...{{/}} */
  has_batches_sent: boolean

  // ───── "COMING THIS WEEK" section ─────

  /** Array of upcoming marketing items scheduled in the next week.
   *  Pulled from marketing_upcoming WHERE active=true AND date in range.
   *  Empty array if nothing is scheduled. */
  upcoming_items: RecapUpcomingItem[]

  /** True when upcoming_items.length === 0. */
  has_upcoming_items: boolean

  // ───── "BY THE NUMBERS" section ─────

  /** Aggregate stats for the prior week. */
  numbers: RecapNumbers
}

/**
 * Single campaign in the "sent last week" section.
 */
export interface RecapBatchSummary {
  /** Display name of the campaign (e.g., "Prelim Toolkit Spring 2026") */
  campaign_name: string

  /** Lane label for badge (e.g., "Marketing Piece", "Social", etc.).
   *  Already in display-friendly format, not the slug. */
  lane_label: string

  /** ISO date the batch was sent. Example: '2026-05-21' */
  sent_date: string

  /** Human-readable sent date for display. Example: "Wed, May 21" */
  sent_date_label: string

  /** Number of unique reps who received the batch (excludes test sends).
   *  INTEGER, not string. */
  rep_count: number

  /** Number of files attached. INTEGER. */
  file_count: number

  /** Number of successful sends (excludes is_test). INTEGER. */
  successful_sends: number

  /** Number of failed sends (excludes is_test). INTEGER. */
  failed_sends: number

  /** True if any sends in this batch failed. Lets the template flag
   *  partial-success batches visually. */
  has_failures: boolean

  /** Optional description from asset_delivery_batches.description.
   *  Empty string if no description was set (not undefined — keeps
   *  Mustache rendering clean). */
  description: string
}

/**
 * Single upcoming item in the "coming this week" section.
 */
export interface RecapUpcomingItem {
  /** ISO date the item is scheduled for. Example: '2026-05-28' */
  scheduled_date: string

  /** Human-readable scheduled date for display. Example: "Thu, May 28" */
  scheduled_date_label: string

  /** Item title. Example: "How to Read a Preliminary Title Report" */
  title: string

  /** Lane label for badge (display-friendly, not slug). */
  lane_label: string

  /** Description from marketing_upcoming.description, or empty string. */
  description: string

  /** Planned asset count if set (e.g., 63 for 21 reps × 3 formats).
   *  Zero if not set — keeps Mustache rendering clean. */
  asset_count_planned: number

  /** True if asset_count_planned > 0. Lets template conditionally show
   *  "63 assets planned" line via {{#has_asset_count}}...{{/}} */
  has_asset_count: boolean

  /** Item status (J1). NARROWED to 'planned' | 'shipped': the data
   *  shaper filters status='cancelled' rows OUT before mapping, so a
   *  cancelled item never reaches the email. The narrower type makes
   *  that invariant visible at the type level. */
  status: 'planned' | 'shipped'

  /** True when status === 'shipped' (J1). Drives the template's inline
   *  "[Shipped]" indicator via {{#is_shipped}}...{{/}}. Derived boolean
   *  so the Mustache template needs no status-string comparison. */
  is_shipped: boolean
}

/**
 * Aggregate "by the numbers" section.
 * All counts are INTEGER (no BIGINT — well under 2B for any field).
 */
export interface RecapNumbers {
  /** Total campaigns sent during the recap week. */
  campaigns_sent: number

  /** Total unique reps reached across all campaigns (deduped). */
  unique_reps_reached: number

  /** Total files delivered across all campaigns. */
  total_files: number

  /** Total payload in megabytes (rounded to 1 decimal).
   *  Already a number — data shaper coerces from BIGINT total_bytes. */
  total_payload_mb: number

  /** Total successful sends across all campaigns (excludes is_test). */
  total_successful_sends: number

  /** Total failed sends across all campaigns (excludes is_test). */
  total_failed_sends: number
}
