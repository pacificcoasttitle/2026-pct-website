/**
 * GET /api/admin/mailchimp?audienceId=xxx
 * Returns subscriber stats for a Mailchimp audience.
 * Server-side proxy — keeps API key off the client.
 */
import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const audienceId = req.nextUrl.searchParams.get('audienceId')
  if (!audienceId) {
    return NextResponse.json({ error: 'audienceId required' }, { status: 400 })
  }

  const apiKey = process.env.MAILCHIMP_API_KEY
  const server = process.env.MAILCHIMP_SERVER // e.g. "us14"
  if (!apiKey || !server) {
    return NextResponse.json({ error: 'Mailchimp not configured' }, { status: 500 })
  }

  try {
    const res = await fetch(
      `https://${server}.api.mailchimp.com/3.0/lists/${audienceId}?fields=id,name,stats`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 }, // cache 5 min
      }
    )

    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json({ error: err.detail ?? 'Mailchimp error' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({
      id:            data.id,
      name:          data.name,
      member_count:  data.stats?.member_count ?? 0,
      open_rate:     data.stats?.open_rate ?? 0,
      click_rate:    data.stats?.click_rate ?? 0,
      campaign_count: data.stats?.campaign_count ?? 0,
    })
  } catch (err) {
    console.error('Mailchimp fetch error:', err)
    return NextResponse.json({ error: 'Network error' }, { status: 500 })
  }
}
