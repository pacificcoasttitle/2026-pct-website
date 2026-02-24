import sgMail from "@sendgrid/mail"

let initialized = false

function getSg(): typeof sgMail | null {
  const key = process.env.SENDGRID_API_KEY
  if (!key) return null
  if (!initialized) {
    sgMail.setApiKey(key)
    initialized = true
  }
  return sgMail
}

function fmt$(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildBuyerBlock(submission: Record<string, any>): string {
  const buyer = submission.buyer_data
  const type = submission.buyer_type

  if (type === "individual") {
    return `BUYER — Individual
  Name: ${buyer.first_name}${buyer.middle_name ? " " + buyer.middle_name : ""} ${buyer.last_name}
  DOB: ${buyer.date_of_birth || "Not provided"}
  Address: ${buyer.address?.street}, ${buyer.address?.city}, ${buyer.address?.state} ${buyer.address?.zip}
  ${buyer.phone ? "Phone: " + buyer.phone : ""}
  NOTE: PCT will contact buyer directly for ID verification.`
  }

  if (type === "trust") {
    return `BUYER ⚠️ Trust
  Trust Name: ${buyer.trust_name}
  Trust Type: ${buyer.trust_type || "Not specified"}
  Trustee: ${buyer.trustee_name}${buyer.trustee_email ? " <" + buyer.trustee_email + ">" : ""}
  Settlor/Grantor: ${buyer.settlor_name || "Not provided"}
  Trust EIN: ${buyer.trust_ein || "Not provided — PCT to request"}
  Address: ${buyer.address?.street}, ${buyer.address?.city}, ${buyer.address?.state} ${buyer.address?.zip}`
  }

  const boLine =
    buyer.beneficial_owners_known === "yes"
      ? `Yes (${buyer.beneficial_owner_count || "?"}${buyer.beneficial_owner_names ? " — " + buyer.beneficial_owner_names : ""})`
      : buyer.beneficial_owners_known === "no"
        ? "No"
        : "Not Sure"

  return `BUYER ⚠️ ${type.toUpperCase()}
  Entity Name: ${buyer.entity_name}
  Entity Type: ${buyer.entity_type || type}
  State of Formation: ${buyer.state_of_formation || "Not provided"}
  EIN: ${buyer.ein || "Not provided — PCT to request"}
  Contact: ${buyer.contact_name}${buyer.contact_email ? " <" + buyer.contact_email + ">" : ""}${buyer.contact_phone ? " | " + buyer.contact_phone : ""}
  Beneficial Owners Known: ${boLine}
  Address: ${buyer.address?.street}, ${buyer.address?.city}, ${buyer.address?.state} ${buyer.address?.zip}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendNotificationEmail(submission: Record<string, any>): Promise<boolean> {
  const sg = getSg()
  const addr = submission.property_address
  const sellers = submission.sellers_data as Array<Record<string, string>>

  const sellerLines = sellers
    .map((s, i) => `  Seller ${i + 1} (${s.seller_type}): ${s.name}${s.trustee_name ? " / Trustee: " + s.trustee_name : ""}`)
    .join("\n")

  const text = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 NEW FINCEN INTAKE SUBMISSION
Reference: ${submission.reference_number}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUBMITTED BY
  Officer: ${submission.officer_name}
  Email:   ${submission.officer_email}
  Phone:   ${submission.officer_phone || "Not provided"}
  Branch:  ${submission.branch_office}
  Escrow#: ${submission.escrow_number}

TRANSACTION
  Property: ${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}${addr.county ? " | " + addr.county + " County" : ""}
  Type:     ${submission.property_type}
  Closing:  ${submission.estimated_closing_date}
  Price:    ${fmt$(submission.purchase_price)}

${buildBuyerBlock(submission)}

SELLER(S)
${sellerLines}

NOTE: Payment method, financial institution, and AML details will be
collected directly by the PCT compliance coordinator during the filing process.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Checker Result: ${submission.checker_result
    ? submission.checker_result.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
    : "Direct Access"}
Submitted: ${new Date(submission.submitted_at).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })} PT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`

  if (!sg) {
    console.log("[FinCEN Email] SENDGRID_API_KEY not set. Notification email content:\n", text)
    return false
  }

  try {
    await sg.send({
      from: { name: "PCT FinCEN System", email: "noreply@pct.com" },
      to: "fincen@pct.com",
      subject: `[FinCEN Intake] New Submission — ${submission.escrow_number} — ${addr.street}, ${addr.city}`,
      text,
    })
    return true
  } catch (err) {
    console.error("[FinCEN Email] Failed to send notification:", err)
    return false
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendConfirmationEmail(submission: Record<string, any>): Promise<boolean> {
  const sg = getSg()
  if (!sg) return false

  const firstName = submission.officer_name.split(" ")[0]
  const addr = submission.property_address

  const text = `Hi ${firstName},

Your FinCEN intake submission has been received.

  Reference Number: ${submission.reference_number}
  Escrow Number:    ${submission.escrow_number}
  Property:         ${addr.street}, ${addr.city}, ${addr.state}

What happens next:
  1. A compliance coordinator will review your submission within 1 business day
  2. We will contact the buyer and seller directly for any additional information needed
  3. You will receive updates at this email as the filing progresses

You don't need to do anything else at this time.

Questions?
  Email: fincen@pct.com
  Phone: (866) 724-1050

Thank you,
Pacific Coast Title — FinCEN Reporting Division`

  try {
    await sg.send({
      from: { name: "PCT FinCEN Reporting Desk", email: "noreply@pct.com" },
      to: submission.officer_email,
      subject: `FinCEN Submission Received — ${submission.reference_number}`,
      text,
    })
    return true
  } catch (err) {
    console.error("[FinCEN Email] Failed to send confirmation:", err)
    return false
  }
}
