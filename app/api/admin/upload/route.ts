/**
 * /api/admin/upload — RETIRED.
 *
 * This endpoint used to be a single shared image upload serving four
 * capability groups (employees + signatures, which are HR-allowed, and
 * marketing + sms, which are HR-blocked). Because it served both
 * HR-allowed and HR-blocked features, it couldn't be role-gated
 * without either breaking HR or leaving a hole.
 *
 * It has been split into four capability-specific gated endpoints:
 *   POST /api/admin/employees/upload   (employees)
 *   POST /api/admin/signatures/upload  (signatures)
 *   POST /api/admin/marketing/upload   (marketing)
 *   POST /api/admin/sms/upload         (sms — preserves sms_code filename)
 *
 * The file is kept (not deleted) so any un-grepped/external caller
 * gets a clear 410 Gone instead of a 404 mystery — but it no longer
 * uploads anything.
 */
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST() {
  return NextResponse.json(
    {
      error:
        'This endpoint has been split by capability. Use the capability-specific upload endpoint.',
    },
    { status: 410 },
  )
}
