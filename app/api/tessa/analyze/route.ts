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
    const formData = await request.formData()
    const file = formData.get("pdf") as File

    if (!file) {
      return NextResponse.json({ analysis: "No PDF file provided." }, { status: 400 })
    }

    const analysis = `
📋 PRELIMINARY TITLE REPORT ANALYSIS

⚠️ Note: PDF analysis is currently in development. This feature will allow you to upload preliminary title reports and receive:

✅ Title Requirements (must be satisfied to close)
🏠 Property Information
🚨 Liens and Judgments
💰 Taxes and Assessments
📄 Other Findings

For now, please contact your title officer directly for report analysis at (800) 234-5678.

Thank you for your patience as we enhance TESSA™ to serve you better!
    `

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("[v0] PDF analysis error:", error)
    return NextResponse.json({ analysis: "Error analyzing PDF. Please contact your title officer." }, { status: 500 })
  }
}
