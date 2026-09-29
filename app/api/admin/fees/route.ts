import { NextRequest, NextResponse } from "next/server"
import { requireApiRole } from "@/lib/auth/guards"
import fs from "fs"
import path from "path"

const FEES_PATH = path.join(process.cwd(), "data", "calculator", "fees.json")

/**
 * Rate tables live in data/calculator/*.json and are versioned in git. On Vercel the
 * filesystem is read-only (writes look like they succeed and vanish on the next deploy),
 * so the write endpoints refuse there and point at the repo instead.
 */
const READ_ONLY_MESSAGE =
  "Rate tables are versioned in git and read-only in production. Edit data/calculator/*.json in the repo and deploy."

function readOnlyResponse() {
  return process.env.VERCEL
    ? NextResponse.json({ error: READ_ONLY_MESSAGE, readOnly: true }, { status: 409 })
    : null
}

function readFees() {
  const data = fs.readFileSync(FEES_PATH, "utf-8")
  return JSON.parse(data)
}

function writeFees(fees: any[]) {
  fs.writeFileSync(FEES_PATH, JSON.stringify(fees, null, 2))
}

// GET - List all fees
export async function GET() {
  const auth = await requireApiRole('fees')
  if ('error' in auth) return auth.error

  try {
    const fees = readFees()
    return NextResponse.json(fees, { headers: { "X-Rates-Read-Only": process.env.VERCEL ? "1" : "0" } })
  } catch {
    return NextResponse.json({ error: "Failed to read fees" }, { status: 500 })
  }
}

// POST - Create a new fee
export async function POST(request: NextRequest) {
  const auth = await requireApiRole('fees')
  if ('error' in auth) return auth.error

  const readOnly = readOnlyResponse()
  if (readOnly) return readOnly

  try {
    const body = await request.json()
    const { transactionType, category, name, value, active } = body

    if (!transactionType || !category || !name || value === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const fees = readFees()
    const maxId = fees.reduce((max: number, f: any) => Math.max(max, f.id || 0), 0)
    
    const newFee = {
      id: maxId + 1,
      transactionType,
      category,
      name,
      value: Number(value),
      active: active !== false,
    }

    fees.push(newFee)
    writeFees(fees)

    return NextResponse.json(newFee, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create fee" }, { status: 500 })
  }
}

// PUT - Update a fee
export async function PUT(request: NextRequest) {
  const auth = await requireApiRole('fees')
  if ('error' in auth) return auth.error

  const readOnly = readOnlyResponse()
  if (readOnly) return readOnly

  try {
    const body = await request.json()
    const { id, transactionType, category, name, value, active } = body

    if (!id) {
      return NextResponse.json({ error: "Fee ID required" }, { status: 400 })
    }

    const fees = readFees()
    const index = fees.findIndex((f: any) => f.id === id)
    
    if (index === -1) {
      return NextResponse.json({ error: "Fee not found" }, { status: 404 })
    }

    fees[index] = {
      ...fees[index],
      ...(transactionType !== undefined && { transactionType }),
      ...(category !== undefined && { category }),
      ...(name !== undefined && { name }),
      ...(value !== undefined && { value: Number(value) }),
      ...(active !== undefined && { active }),
    }

    writeFees(fees)

    return NextResponse.json(fees[index])
  } catch {
    return NextResponse.json({ error: "Failed to update fee" }, { status: 500 })
  }
}

// DELETE - Delete a fee
export async function DELETE(request: NextRequest) {
  const auth = await requireApiRole('fees')
  if ('error' in auth) return auth.error

  const readOnly = readOnlyResponse()
  if (readOnly) return readOnly

  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get("id") || "")

    if (isNaN(id)) {
      return NextResponse.json({ error: "Fee ID required" }, { status: 400 })
    }

    const fees = readFees()
    const filtered = fees.filter((f: any) => f.id !== id)

    if (filtered.length === fees.length) {
      return NextResponse.json({ error: "Fee not found" }, { status: 404 })
    }

    writeFees(filtered)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete fee" }, { status: 500 })
  }
}
