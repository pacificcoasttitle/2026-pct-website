import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { TESSA_COOKIE, isValidSession, isAuthRequired } from "@/lib/tessa-auth"

export async function POST(request: Request) {
  if (isAuthRequired()) {
    const jar = await cookies()
    const session = jar.get(TESSA_COOKIE)?.value
    if (!isValidSession(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    const { messages } = await request.json()

    const response = await fetch("https://tessa-proxy.onrender.com/api/ask-tessa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        max_tokens: 1500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error("TESSA API error")
    }

    const data = await response.json()
    const reply =
      data.choices[0]?.message?.content || "I apologize, but I couldn't generate a response. Please try again."

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("[v0] TESSA API error:", error)
    return NextResponse.json(
      { reply: "I apologize, but I'm having trouble connecting right now. Please try again or contact us directly." },
      { status: 500 },
    )
  }
}
