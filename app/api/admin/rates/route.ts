import { NextRequest, NextResponse } from "next/server"
import { requireApiRole } from "@/lib/auth/guards"
import fs from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data", "calculator")

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

function readJsonFile(filename: string) {
  const data = fs.readFileSync(path.join(DATA_DIR, filename), "utf-8")
  return JSON.parse(data)
}

function writeJsonFile(filename: string, data: any) {
  fs.writeFileSync(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2))
}

// GET - List rates by type (title, escrow-resale, escrow-refinance, endorsements)
export async function GET(request: NextRequest) {
  const auth = await requireApiRole('fees')
  if ('error' in auth) return auth.error

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "title"

    const fileMap: Record<string, string> = {
      title: "title-rates.json",
      "escrow-resale": "escrow-resale.json",
      "escrow-refinance": "escrow-refinance.json",
      endorsements: "endorsements.json",
      "transfer-taxes": "transfer-taxes.json",
    }

    const filename = fileMap[type]
    if (!filename) {
      return NextResponse.json({ error: "Invalid rate type" }, { status: 400 })
    }

    const data = readJsonFile(filename)
    return NextResponse.json({ type, data, readOnly: !!process.env.VERCEL })
  } catch {
    return NextResponse.json({ error: "Failed to read rates" }, { status: 500 })
  }
}

// PUT - Update a specific rate entry
export async function PUT(request: NextRequest) {
  const auth = await requireApiRole('fees')
  if ('error' in auth) return auth.error

  const readOnly = readOnlyResponse()
  if (readOnly) return readOnly

  try {
    const body = await request.json()
    const { type, index, data } = body

    const fileMap: Record<string, string> = {
      title: "title-rates.json",
      "escrow-resale": "escrow-resale.json",
      "escrow-refinance": "escrow-refinance.json",
      endorsements: "endorsements.json",
      "transfer-taxes": "transfer-taxes.json",
    }

    const filename = fileMap[type]
    if (!filename) {
      return NextResponse.json({ error: "Invalid rate type" }, { status: 400 })
    }

    const allData = readJsonFile(filename)
    
    if (index !== undefined && index >= 0 && index < allData.length) {
      allData[index] = { ...allData[index], ...data }
      writeJsonFile(filename, allData)
      return NextResponse.json({ success: true, updated: allData[index] })
    }

    return NextResponse.json({ error: "Invalid index" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Failed to update rate" }, { status: 500 })
  }
}

// POST - Add a new rate entry
export async function POST(request: NextRequest) {
  const auth = await requireApiRole('fees')
  if ('error' in auth) return auth.error

  const readOnly = readOnlyResponse()
  if (readOnly) return readOnly

  try {
    const body = await request.json()
    const { type, data } = body

    const fileMap: Record<string, string> = {
      title: "title-rates.json",
      "escrow-resale": "escrow-resale.json",
      "escrow-refinance": "escrow-refinance.json",
      endorsements: "endorsements.json",
      "transfer-taxes": "transfer-taxes.json",
    }

    const filename = fileMap[type]
    if (!filename) {
      return NextResponse.json({ error: "Invalid rate type" }, { status: 400 })
    }

    const allData = readJsonFile(filename)
    allData.push(data)
    writeJsonFile(filename, allData)

    return NextResponse.json({ success: true, index: allData.length - 1 }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to add rate" }, { status: 500 })
  }
}

// DELETE - Delete a rate entry by index
export async function DELETE(request: NextRequest) {
  const auth = await requireApiRole('fees')
  if ('error' in auth) return auth.error

  const readOnly = readOnlyResponse()
  if (readOnly) return readOnly

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const index = parseInt(searchParams.get("index") || "")

    const fileMap: Record<string, string> = {
      title: "title-rates.json",
      "escrow-resale": "escrow-resale.json",
      "escrow-refinance": "escrow-refinance.json",
      endorsements: "endorsements.json",
      "transfer-taxes": "transfer-taxes.json",
    }

    const filename = type ? fileMap[type] : undefined
    if (!filename) {
      return NextResponse.json({ error: "Invalid rate type" }, { status: 400 })
    }

    const allData = readJsonFile(filename)

    if (isNaN(index) || index < 0 || index >= allData.length) {
      return NextResponse.json({ error: "Invalid index" }, { status: 400 })
    }

    allData.splice(index, 1)
    writeJsonFile(filename, allData)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete rate" }, { status: 500 })
  }
}
