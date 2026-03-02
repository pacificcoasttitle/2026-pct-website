import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'

export const runtime = 'nodejs'

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const base = process.env.RENDER_API_URL || 'https://main-website-files.onrender.com'
  try {
    const res = await fetch(`${base}/api/health`, { cache: 'no-store' })
    const data = await res.json()
    return NextResponse.json({
      ok: res.ok,
      preview_mode: Boolean(data?.preview_mode),
      status: data?.status ?? 'unknown',
      sales_reps_count: Number(data?.sales_reps_count ?? 0),
      twilio_configured: Boolean(data?.twilio_configured),
      database_connected: Boolean(data?.database_connected),
    })
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        status: 'unreachable',
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 502 }
    )
  }
}

