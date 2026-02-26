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

  // No-DB fallback: MMDD + 4-digit random (e.g. PCT-FINCEN-2026-02264821)
  const fallback = () => {
    const d = new Date()
    const mmdd = `${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`
    const rnd = Math.floor(Math.random() * 9000 + 1000)
    return `${prefix}${mmdd}${rnd}`
  }

  if (!db) return fallback()

  try {
    // Read the actual max stored in the table — survives redeployments and restarts
    const { rows } = await db.query(
      `SELECT COALESCE(MAX(
         CASE WHEN reference_number ~ $1
              THEN CAST(SPLIT_PART(reference_number, '-', 4) AS INTEGER)
              ELSE 0
         END
       ), 0) + 1 AS next_n
       FROM fincen_intake_submissions`,
      [`^PCT-FINCEN-${year}-[0-9]+$`]
    )
    const n = parseInt(rows[0].next_n as string, 10)
    return `${prefix}${String(n).padStart(4, "0")}`
  } catch {
    return fallback()
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
        certified, certified_at, submitted_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
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
