// ============================================================
// Mailchimp scheduling helpers
// ============================================================
// Mirrors the legacy `mailchimp_manager.py` behaviour:
//   - now + delayMinutes
//   - round UP to the next quarter-hour (00 / 15 / 30 / 45)
//   - zero seconds & milliseconds
//   - emit ISO-8601 with explicit "+00:00" UTC offset (Mailchimp accepts
//     "...Z" too but the legacy system used the offset form, so we keep it
//     identical for parity with anything that grep'd for that string).
//
// All Date math is done in UTC. The returned Date object is timezone-naive
// in the JS sense, but its underlying epoch is on a quarter-hour UTC boundary.

import { mailchimpAuthHeader } from './marketing-mailchimp'

const QUARTER_HOUR_MS = 15 * 60 * 1000

/**
 * Compute the scheduled send time for a batch.
 *
 * @param delayMinutes Minimum delay from "now" before send. Default 30 (legacy).
 *                     Mailchimp itself enforces a small minimum (a few minutes);
 *                     30 gives the marketer breathing room to cancel.
 * @returns A Date whose UTC components are exactly on a quarter-hour with 0 sec/ms.
 */
export function computeScheduleTime(delayMinutes = 30): Date {
  const nowMs   = Date.now()
  const targetMs = nowMs + delayMinutes * 60 * 1000

  // Round UP to next quarter-hour boundary. If we land exactly on a
  // boundary, advance to the next one — matches the legacy ceil-with-bump
  // behaviour so a 30-min delay never produces a sub-30-min schedule.
  const remainder = targetMs % QUARTER_HOUR_MS
  const roundedMs = remainder === 0
    ? targetMs + QUARTER_HOUR_MS
    : targetMs + (QUARTER_HOUR_MS - remainder)

  const d = new Date(roundedMs)
  // Defensive: explicitly zero seconds & ms (already zero from quarter-hour math).
  d.setUTCSeconds(0, 0)
  return d
}

/**
 * Format a Date as the Mailchimp-friendly ISO string with explicit UTC offset.
 * Example: "2026-05-21T21:00:00+00:00"
 */
export function toMailchimpScheduleString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyy = date.getUTCFullYear()
  const mm   = pad(date.getUTCMonth() + 1)
  const dd   = pad(date.getUTCDate())
  const hh   = pad(date.getUTCHours())
  const mi   = pad(date.getUTCMinutes())
  const ss   = pad(date.getUTCSeconds())
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}+00:00`
}

interface MailchimpScheduleConfig {
  apiKey: string
  server: string
}

function readConfig(): MailchimpScheduleConfig {
  const apiKey = process.env.MAILCHIMP_API_KEY
  const server = process.env.MAILCHIMP_SERVER
  if (!apiKey || !server) {
    throw new Error('Mailchimp not configured (MAILCHIMP_API_KEY / MAILCHIMP_SERVER missing)')
  }
  return { apiKey, server }
}

/**
 * Schedule a Mailchimp campaign for a future send.
 * Mailchimp requires schedule_time to be a quarter-hour boundary in UTC.
 */
export async function scheduleCampaign(
  campaignId: string,
  scheduleTime: Date,
): Promise<void> {
  const { apiKey, server } = readConfig()
  const url = `https://${server}.api.mailchimp.com/3.0/campaigns/${campaignId}/actions/schedule`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: mailchimpAuthHeader(apiKey),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ schedule_time: toMailchimpScheduleString(scheduleTime) }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const detail = (data as { detail?: string; title?: string }).detail
      || (data as { detail?: string; title?: string }).title
      || `HTTP ${res.status}`
    throw new Error(`Mailchimp schedule failed: ${detail}`)
  }
}

/**
 * Cancel a previously-scheduled Mailchimp campaign.
 * Used by the batch-cancel endpoint.
 */
export async function unscheduleCampaign(campaignId: string): Promise<void> {
  const { apiKey, server } = readConfig()
  const url = `https://${server}.api.mailchimp.com/3.0/campaigns/${campaignId}/actions/unschedule`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: mailchimpAuthHeader(apiKey),
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const detail = (data as { detail?: string; title?: string }).detail
      || (data as { detail?: string; title?: string }).title
      || `HTTP ${res.status}`
    throw new Error(`Mailchimp unschedule failed: ${detail}`)
  }
}

/**
 * Send a Mailchimp campaign immediately.
 * Co-located here so the batch endpoint has a single import surface for
 * "what happens after content upload" actions.
 */
export async function sendCampaignNow(campaignId: string): Promise<void> {
  const { apiKey, server } = readConfig()
  const url = `https://${server}.api.mailchimp.com/3.0/campaigns/${campaignId}/actions/send`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: mailchimpAuthHeader(apiKey),
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const detail = (data as { detail?: string; title?: string }).detail
      || (data as { detail?: string; title?: string }).title
      || `HTTP ${res.status}`
    throw new Error(`Mailchimp send-now failed: ${detail}`)
  }
}
