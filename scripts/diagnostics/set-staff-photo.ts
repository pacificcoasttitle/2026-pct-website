/**
 * One-off CLI: set staff_members.photo_url for a single staff member by email.
 *
 * Read-only MCP can't run UPDATEs, so we use the existing pg connection
 * (DATABASE_URL from .env.local) to run a transactional UPDATE.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/set-staff-photo.ts <email> <url>
 */
import { Pool } from 'pg'

async function main() {
  const [email, photoUrl] = process.argv.slice(2)
  if (!email || !photoUrl) {
    console.error('Usage: npx tsx --env-file=.env.local scripts/set-staff-photo.ts <email> <url>')
    process.exit(1)
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL not set')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })

  try {
    const before = await pool.query(
      'SELECT id, email, first_name, last_name, photo_url FROM staff_members WHERE email = $1',
      [email],
    )

    if (before.rowCount === 0) {
      console.error(`No staff_members row found for email "${email}"`)
      process.exit(1)
    }

    console.log('BEFORE:')
    console.log(before.rows[0])

    const result = await pool.query(
      `UPDATE staff_members
       SET photo_url  = $1,
           updated_at = NOW(),
           updated_by = 'system'
       WHERE email    = $2
       RETURNING id, email, first_name, last_name, photo_url, updated_at, updated_by`,
      [photoUrl, email],
    )

    console.log('\nAFTER:')
    console.log(result.rows[0])
    console.log(`\nUpdated ${result.rowCount} row(s).`)
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
