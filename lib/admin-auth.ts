import { cookies } from "next/headers"

// Simple admin authentication using environment variable or hardcoded for development
// In production, use ADMIN_PASSWORD environment variable
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "pctadmin"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "PacificCoast2026!"
const SESSION_COOKIE = "pct-admin-session"
const SESSION_SECRET = process.env.SESSION_SECRET || "pct-admin-secret-key-2026"

// Simple hash for session token
function createSessionToken(username: string): string {
  const timestamp = Date.now()
  const data = `${username}:${timestamp}:${SESSION_SECRET}`
  // Simple base64 encoding for session (in production, use proper JWT)
  return Buffer.from(data).toString("base64")
}

function validateSessionToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const parts = decoded.split(":")
    if (parts.length !== 3) return false
    const [username, timestamp, secret] = parts
    if (secret !== SESSION_SECRET) return false
    // Session valid for 24 hours
    const age = Date.now() - parseInt(timestamp)
    if (age > 24 * 60 * 60 * 1000) return false
    return username === ADMIN_USERNAME
  } catch {
    return false
  }
}

export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

export function generateSession(username: string): string {
  return createSessionToken(username)
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  if (!session) return false
  return validateSessionToken(session.value)
}

export { SESSION_COOKIE }
