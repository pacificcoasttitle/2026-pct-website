/**
 * POST /api/admin/hr/roster/share
 *
 * Emails the HR roster as a SAFE directory (name, title, department,
 * office, work email, office phone) embedded in the email body. Gated
 * requireApiRole('hr-tools').
 *
 * ⚠️ PRIVACY:
 *   - Only the safe DirectoryRosterRow subset is built (explicit mapping);
 *     no sensitive field (personal mobile, birthday, start date, legal
 *     name, flags, docs) is ever passed to the renderer.
 *   - ACTIVE employees only.
 *   - ⚠️ TESTING: the email is sent ONLY to the single override address
 *     (HR_ROSTER_SHARE_TEST_EMAIL || ghernandez@pct.com). It NEVER
 *     iterates/BCCs the real employee emails. A real all-staff send is a
 *     deliberate FUTURE switch, not this route.
 */
import { NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'
import { requireApiRole } from '@/lib/auth/guards'
import { getAllHrEmployees } from '@/lib/admin-db'
import {
  renderHrRosterShare,
  type DirectoryRosterRow,
} from '@/lib/email-templates/hr-roster-share'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ⚠️ Testing override: the ONLY recipient. Never the real employee list.
const TEST_RECIPIENT = (process.env.HR_ROSTER_SHARE_TEST_EMAIL || 'ghernandez@pct.com').trim()

let sgInitialized = false
function getSg(): typeof sgMail | null {
  const key = process.env.SENDGRID_API_KEY
  if (!key) return null
  if (!sgInitialized) {
    sgMail.setApiKey(key)
    sgInitialized = true
  }
  return sgMail
}

export async function POST() {
  const auth = await requireApiRole('hr-tools')
  if ('error' in auth) return auth.error

  // Fetch → ACTIVE only → EXPLICIT safe-subset mapping. The full HrEmployee
  // rows never leave this function; only DirectoryRosterRow reaches the
  // renderer.
  const employees = await getAllHrEmployees()
  const rows: DirectoryRosterRow[] = employees
    .filter((e) => e.active === true)
    .map((e) => ({
      first_name:   e.first_name,
      last_name:    e.last_name,
      title:        e.title,
      department:   e.department,
      office:       e.office,
      email:        e.email,
      office_phone: e.office_phone,
    }))

  const subject = `Pacific Coast Title — Employee Directory (${rows.length})`
  const html = renderHrRosterShare({ subject, rows })

  const sg = getSg()
  if (!sg) {
    return NextResponse.json(
      { error: 'Email is not configured (SENDGRID_API_KEY missing).' },
      { status: 503 },
    )
  }

  try {
    await sg.send({
      to:      TEST_RECIPIENT,
      from:    { email: 'hr@pct.com', name: 'Pacific Coast Title HR' },
      subject,
      html,
    })
  } catch (err) {
    console.error('[hr-roster-share] send failed:', err)
    return NextResponse.json(
      { error: 'Failed to send the roster email. Please try again.' },
      { status: 502 },
    )
  }

  return NextResponse.json({
    ok: true,
    sent_to: TEST_RECIPIENT,
    row_count: rows.length,
  })
}
