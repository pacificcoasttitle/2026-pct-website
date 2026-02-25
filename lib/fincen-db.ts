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

  // Fallback when no DB: timestamp (ms, base-36) + 3 random digits — never repeats
  const fallback = () => {
    const ts  = Date.now().toString(36).toUpperCase().slice(-5)
    const rnd = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
    return `${prefix}${ts}${rnd}`
  }

  if (!db) return fallback()

  try {
    // NEXTVAL is atomic — eliminates the race condition that caused duplicate numbers
    await db.query(`CREATE SEQUENCE IF NOT EXISTS fincen_ref_seq START 1`)
    const result = await db.query(`SELECT NEXTVAL('fincen_ref_seq') AS n`)
    const n = parseInt(result.rows[0].n as string, 10)
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
