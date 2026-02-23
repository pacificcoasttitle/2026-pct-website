import { NextRequest, NextResponse } from "next/server"
import { generateReferenceNumber, storeSubmission } from "@/lib/fincen-db"
import { sendNotificationEmail, sendConfirmationEmail } from "@/lib/fincen-email"

// Simple rate limiting: track IPs in memory (resets on cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

function requireString(val: unknown, field: string): string {
  if (typeof val !== "string" || !val.trim()) throw new Error(`${field} is required`)
  return val.trim()
}

function requirePositiveNumber(val: unknown, field: string): number {
  const n = typeof val === "string" ? parseFloat(val.replace(/[,$]/g, "")) : Number(val)
  if (isNaN(n) || n <= 0) throw new Error(`${field} must be a positive number`)
  return n
}

function sanitize(s: unknown): string {
  if (typeof s !== "string") return ""
  return s.replace(/<[^>]*>/g, "").trim()
}

export async function POST(request: NextRequest) {
  // Rate limit
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  try {
    // ── Step 1: Transaction ────────────────────────────────────────────
    const officerName     = requireString(body.officer_name, "Officer name")
    const officerEmail    = requireString(body.officer_email, "Officer email")
    const branchOffice    = requireString(body.branch_office, "Branch office")
    const escrowNumber    = requireString(body.escrow_number, "Escrow number")
    const propertyType    = requireString(body.property_type, "Property type")
    const closingDate     = requireString(body.estimated_closing_date, "Closing date")
    const purchasePrice   = requirePositiveNumber(body.purchase_price, "Purchase price")
    const propAddr = body.property_address as Record<string, string>
    if (!propAddr?.street || !propAddr?.city || !propAddr?.zip) {
      throw new Error("Property street, city, and ZIP are required")
    }

    // ── Step 2: Buyer ──────────────────────────────────────────────────
    const buyerType = requireString(body.buyer_type, "Buyer type")
    const buyerData = body.buyer_data as Record<string, unknown>
    if (!buyerData) throw new Error("Buyer information is required")

    if (buyerType === "individual") {
      requireString(buyerData.first_name, "Buyer first name")
      requireString(buyerData.last_name, "Buyer last name")
    } else if (buyerType === "trust") {
      requireString(buyerData.trust_name, "Trust name")
      requireString(buyerData.trustee_name, "Trustee name")
    } else {
      requireString(buyerData.entity_name, "Entity name")
      requireString(buyerData.contact_name, "Entity contact name")
    }

    // ── Step 3: Sellers ────────────────────────────────────────────────
    const sellersData = body.sellers_data as Array<Record<string, string>>
    if (!Array.isArray(sellersData) || sellersData.length === 0) {
      throw new Error("At least one seller is required")
    }
    for (const s of sellersData) {
      if (!s.name?.trim()) throw new Error("Each seller must have a name")
    }

    // ── Step 4: Payment ────────────────────────────────────────────────
    const paymentMethod = requireString(body.payment_method, "Payment method")
    const totalAmount   = requirePositiveNumber(body.total_amount, "Total amount")

    // ── Step 5: Certification ──────────────────────────────────────────
    if (!body.certified) throw new Error("Certification is required")

    // ── Build submission object ────────────────────────────────────────
    const referenceNumber = await generateReferenceNumber()
    const submittedAt     = new Date().toISOString()

    const submission = {
      reference_number:        referenceNumber,
      submitted_at:            submittedAt,
      checker_result:          sanitize(body.checker_result) || null,
      checker_answers:         body.checker_answers || null,
      officer_name:            sanitize(officerName),
      officer_email:           sanitize(officerEmail),
      officer_phone:           sanitize(body.officer_phone as string),
      branch_office:           sanitize(branchOffice),
      escrow_number:           sanitize(escrowNumber),
      property_address: {
        street: sanitize(propAddr.street),
        city:   sanitize(propAddr.city),
        state:  sanitize(propAddr.state || "CA"),
        zip:    sanitize(propAddr.zip),
        county: sanitize(propAddr.county || ""),
      },
      property_type:           sanitize(propertyType),
      estimated_closing_date:  closingDate,
      purchase_price:          purchasePrice,
      buyer_type:              buyerType,
      buyer_data:              buyerData,
      sellers_data:            sellersData,
      payment_method:          sanitize(paymentMethod),
      payment_sources:         body.payment_sources || null,
      total_amount:            totalAmount,
      financial_institution:   sanitize(body.financial_institution as string),
      lender_aml_regulated:    sanitize(body.lender_aml_regulated as string),
      financing_notes:         sanitize(body.financing_notes as string),
      certified:               true,
      certified_at:            submittedAt,
    }

    // ── Store in DB (non-blocking failure) ────────────────────────────
    const stored = await storeSubmission(submission)

    // ── Send emails ───────────────────────────────────────────────────
    const [notifSent, confirmSent] = await Promise.allSettled([
      sendNotificationEmail(submission),
      sendConfirmationEmail(submission),
    ])

    console.log(
      `[FinCEN] Submission ${referenceNumber} — DB:${stored} Notify:${notifSent.status} Confirm:${confirmSent.status}`
    )

    return NextResponse.json({ success: true, reference_number: referenceNumber }, { status: 201 })

  } catch (err) {
    const message = err instanceof Error ? err.message : "Validation error"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
