/**
 * POST /api/sms — Twilio webhook
 *
 * Agents text an employee's personal SMS code to PCT's Twilio number.
 * We look up the rep and reply with their profile link.
 *
 * Configure in Twilio console:
 *   Messaging → Your Number → Webhook URL: https://www.pct.com/api/sms
 *   HTTP Method: POST
 */
import { NextRequest, NextResponse } from 'next/server'
import { getEmployeeBySmsCode, logSmsActivity, getSmsEmployeeId } from '@/lib/admin-db'

function twiml(message: string): NextResponse {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${message}</Message>
</Response>`
  return new NextResponse(xml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}

export async function POST(req: NextRequest) {
  const body   = await req.text()
  const params = new URLSearchParams(body)

  const from    = params.get('From') ?? ''
  const msgBody = (params.get('Body') ?? '').trim().toUpperCase()

  // Help keyword
  if (msgBody === 'HELP') {
    return twiml(
      "Pacific Coast Title: Text your rep's code to get their contact info. " +
      "Example: PCTDAVID\nQuestions? Call (866) 724-1050."
    )
  }

  // Look up employee by SMS code
  const emp = await getEmployeeBySmsCode(msgBody)

  if (!emp) {
    return twiml(
      "Hi! We didn't recognize that code. " +
      "Ask your PCT rep for their personal code, or visit pct.com/team. " +
      "Questions? Call (866) 724-1050."
    )
  }

  // Log the activity (non-blocking)
  const empId = await getSmsEmployeeId(msgBody)
  if (empId) {
    logSmsActivity(empId, from, JSON.stringify({ from, code: msgBody })).catch(() => {})
  }

  const firstName  = emp.name.split(' ')[0]
  const profileUrl = `https://www.pct.com/team/${emp.slug}`

  return twiml(
    `Hi! I'm ${emp.name} with Pacific Coast Title. ` +
    `View my profile & save my contact:\n${profileUrl}\n\n` +
    `📞 ${emp.phone ?? '(866) 724-1050'}\n` +
    `✉️ ${emp.email ?? 'info@pct.com'}\n\n` +
    `Reply FARM to request a farm list from ${firstName}.`
  )
}

export async function GET() {
  return new NextResponse('Method not allowed', { status: 405 })
}
