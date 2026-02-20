import { NextRequest, NextResponse } from "next/server"
import { validateCredentials, generateSession, SESSION_COOKIE } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 })
    }

    if (!validateCredentials(username, password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const session = generateSession(username)
    const response = NextResponse.json({ success: true })
    
    response.cookies.set(SESSION_COOKIE, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    })

    return response
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
