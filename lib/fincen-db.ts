import { Pool } from "pg"

let pool: Pool | null = null

function getPool(): Pool | null {
  const connStr = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!connStr) return null
  if (!pool) {
    pool = new Pool({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
      max: 5,
    })
  }
  return pool
}

export async function generateReferenceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const prefix = `PCT-FINCEN-${year}-`
  const db = getPool()

  if (!db) {
    // No DB configured — use timestamp-based suffix
    const suffix = String(Date.now()).slice(-4)
    return `${prefix}${suffix}`
  }

  try {
    const result = await db.query(
      `SELECT reference_number FROM fincen_intake_submissions
       WHERE reference_number LIKE $1
       ORDER BY reference_number DESC LIMIT 1`,
      [`${prefix}%`]
    )
    let next = 1
    if (result.rows.length > 0) {
      const last = result.rows[0].reference_number as string
      const lastNum = parseInt(last.split("-").pop() || "0", 10)
      next = lastNum + 1
    }
    return `${prefix}${String(next).padStart(4, "0")}`
  } catch {
    const suffix = String(Date.now()).slice(-4)
    return `${prefix}${suffix}`
  }
}

export async function storeSubmission(data: Record<string, unknown>): Promise<boolean> {
  const db = getPool()
  if (!db) {
    console.warn("[FinCEN DB] DATABASE_URL not set — submission not stored in DB.")
    return false
  }

  try {
    await db.query(
      `INSERT INTO fincen_intake_submissions (
        reference_number, checker_result, checker_answers,
        officer_name, officer_email, officer_phone, branch_office, escrow_number,
        property_address, property_type, estimated_closing_date, purchase_price,
        buyer_type, buyer_data, sellers_data,
        payment_method, payment_sources, total_amount, financial_institution,
        lender_aml_regulated, financing_notes,
        certified, certified_at, submitted_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)`,
      [
        data.reference_number,
        data.checker_result,
        JSON.stringify(data.checker_answers),
        data.officer_name,
        data.officer_email,
        data.officer_phone || null,
        data.branch_office,
        data.escrow_number,
        JSON.stringify(data.property_address),
        data.property_type,
        data.estimated_closing_date,
        data.purchase_price,
        data.buyer_type,
        JSON.stringify(data.buyer_data),
        JSON.stringify(data.sellers_data),
        data.payment_method,
        data.payment_sources ? JSON.stringify(data.payment_sources) : null,
        data.total_amount,
        data.financial_institution || null,
        data.lender_aml_regulated || null,
        data.financing_notes || null,
        data.certified,
        data.certified_at,
        data.submitted_at,
      ]
    )
    return true
  } catch (err) {
    console.error("[FinCEN DB] Failed to store submission:", err)
    return false
  }
}
