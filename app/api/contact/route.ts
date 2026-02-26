import { NextRequest, NextResponse } from "next/server"
import sgMail from "@sendgrid/mail"

let sgInitialized = false
function getSg() {
  const key = process.env.SENDGRID_API_KEY
  if (!key) return null
  if (!sgInitialized) { sgMail.setApiKey(key); sgInitialized = true }
  return sgMail
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const name    = (body.name as string)?.trim()
  const email   = (body.email as string)?.trim()
  const phone   = (body.phone as string)?.trim() || ""
  const message = (body.message as string)?.trim()
  const type    = (body.type as string) === "escrow" ? "escrow" : "general"

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 })
  }

  const toEmail   = type === "escrow" ? "escrow@pct.com" : "info@pct.com"
  const typeLabel = type === "escrow" ? "Escrow Inquiry" : "General Inquiry"

  const text = `New ${typeLabel} from pct.com

From:    ${name}
Email:   ${email}${phone ? `\nPhone:   ${phone}` : ""}

Message:
${message}

---
Submitted via pct.com contact form`

  const sg = getSg()
  if (!sg) {
    // Dev fallback — log to console
    console.log("[Contact] SendGrid not configured. Message:\n", text)
    return NextResponse.json({ success: true })
  }

  try {
    await sg.send({
      from: { name: "PCT Website", email: "info@pct.com" },
      to: toEmail,
      replyTo: { name, email },
      subject: `[${typeLabel}] from ${name}`,
      text,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[Contact] SendGrid error:", err)
    return NextResponse.json({ error: "Failed to send message. Please call us at (866) 724-1050." }, { status: 500 })
  }
}
