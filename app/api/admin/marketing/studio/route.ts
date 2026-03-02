import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated, verifyAdminToken, ADMIN_COOKIE } from '@/lib/admin-auth'
import {
  createEmailCampaignLog,
  getEmailCampaignLogs,
  getEmailTemplates,
  upsertEmailTemplate,
} from '@/lib/admin-db'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

function mcAuthHeader(apiKey: string) {
  return `Basic ${Buffer.from(`any:${apiKey}`).toString('base64')}`
}

async function getActorUsername() {
  try {
    const jar = await cookies()
    const token = jar.get(ADMIN_COOKIE)?.value
    if (!token) return null
    const session = await verifyAdminToken(token)
    return session?.username || null
  } catch {
    return null
  }
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const [templates, campaigns] = await Promise.all([
    getEmailTemplates(),
    getEmailCampaignLogs(100),
  ])
  return NextResponse.json({ templates, campaigns })
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const action = String(body.action || '')

    if (action === 'save-template') {
      const name = String(body.name || '').trim()
      const subject = String(body.subject || '').trim()
      const html_content = String(body.html_content || '')
      if (!name || !subject || !html_content) {
        return NextResponse.json({ error: 'Name, subject, and html content are required' }, { status: 400 })
      }
      const actor = await getActorUsername()
      const template = await upsertEmailTemplate({
        id: body.id ? Number(body.id) : undefined,
        name,
        subject,
        preheader: String(body.preheader || ''),
        html_content,
        thumbnail_url: String(body.thumbnail_url || ''),
        actor: actor || undefined,
      })
      return NextResponse.json({ success: true, template })
    }

    if (action === 'create-campaign') {
      const apiKey = process.env.MAILCHIMP_API_KEY
      const server = process.env.MAILCHIMP_SERVER
      if (!apiKey || !server) {
        return NextResponse.json({ error: 'Mailchimp not configured' }, { status: 500 })
      }

      const campaignName = String(body.campaignName || '').trim()
      const fromName = String(body.fromName || 'Pacific Coast Title').trim()
      const replyTo = String(body.replyTo || 'info@pct.com').trim()
      const audienceId = String(body.audienceId || '').trim()
      const subject = String(body.subject || '').trim()
      const html = String(body.html_content || '')
      const templateId = body.templateId ? Number(body.templateId) : undefined
      const sendNow = Boolean(body.sendNow)

      if (!campaignName || !audienceId || !subject || !html) {
        return NextResponse.json({ error: 'Campaign name, audience, subject, and html are required' }, { status: 400 })
      }

      const createRes = await fetch(`https://${server}.api.mailchimp.com/3.0/campaigns`, {
        method: 'POST',
        headers: {
          Authorization: mcAuthHeader(apiKey),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'regular',
          recipients: { list_id: audienceId },
          settings: {
            subject_line: subject,
            title: campaignName,
            from_name: fromName,
            reply_to: replyTo,
          },
        }),
      })
      const createData = await createRes.json()
      if (!createRes.ok) {
        return NextResponse.json({ error: createData.detail || 'Failed to create campaign' }, { status: createRes.status })
      }

      const campaignId = String(createData.id)
      const webId = String(createData.web_id ?? '')

      const contentRes = await fetch(`https://${server}.api.mailchimp.com/3.0/campaigns/${campaignId}/content`, {
        method: 'PUT',
        headers: {
          Authorization: mcAuthHeader(apiKey),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html }),
      })
      const contentData = await contentRes.json()
      if (!contentRes.ok) {
        return NextResponse.json({ error: contentData.detail || 'Failed to set campaign content' }, { status: contentRes.status })
      }

      let status = 'draft'
      if (sendNow) {
        const sendRes = await fetch(`https://${server}.api.mailchimp.com/3.0/campaigns/${campaignId}/actions/send`, {
          method: 'POST',
          headers: {
            Authorization: mcAuthHeader(apiKey),
            'Content-Type': 'application/json',
          },
        })
        if (!sendRes.ok) {
          const sendData = await sendRes.json()
          return NextResponse.json({ error: sendData.detail || 'Failed to send campaign' }, { status: sendRes.status })
        }
        status = 'sent'
      }

      const log = await createEmailCampaignLog({
        name: campaignName,
        subject,
        audience_id: audienceId,
        template_id: templateId,
        mailchimp_campaign_id: campaignId,
        mailchimp_web_id: webId || null,
        status,
        notes: sendNow ? 'Sent immediately from Team Admin' : 'Draft created from Team Admin',
      })

      return NextResponse.json({
        success: true,
        campaignId,
        webId,
        status,
        editUrl: webId ? `https://${server}.admin.mailchimp.com/campaigns/edit?id=${webId}` : null,
        log,
      })
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
  } catch (err) {
    console.error('Marketing Studio API error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

