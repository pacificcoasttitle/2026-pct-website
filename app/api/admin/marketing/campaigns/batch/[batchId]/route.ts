// ============================================================
// GET /api/admin/marketing/campaigns/batch/[batchId]
// Return batch metadata + per-rep campaign rows.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/admin-auth'
import { getBatchCampaigns } from '@/lib/admin-db'

export const runtime = 'nodejs'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ batchId: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { batchId } = await ctx.params
  if (!batchId || !UUID_RE.test(batchId)) {
    return NextResponse.json({ error: 'Invalid batchId' }, { status: 400 })
  }

  const rows = await getBatchCampaigns(batchId)
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
  }

  const server = process.env.MAILCHIMP_SERVER
  const editUrl = (webId: string | null) =>
    webId && server ? `https://${server}.admin.mailchimp.com/campaigns/edit?id=${webId}` : null

  const counts = {
    total:     rows.length,
    drafts:    rows.filter((r) => r.status === 'draft').length,
    scheduled: rows.filter((r) => r.status === 'scheduled').length,
    sent:      rows.filter((r) => r.status === 'sent').length,
    cancelled: rows.filter((r) => r.status === 'cancelled').length,
  }

  const scheduledTimes = rows
    .filter((r) => r.scheduled_at)
    .map((r) => r.scheduled_at as string)
    .sort()

  // First-name as batch label (matches the history endpoint's logic).
  const firstCampaignName = rows[0]?.name ?? 'Untitled batch'

  return NextResponse.json({
    batch: {
      batch_id:            batchId,
      first_campaign_name: firstCampaignName,
      created_at:          rows[0]?.created_at ?? null,
      next_send_time:      scheduledTimes[0] ?? null,
      reply_to_mode:       rows[0]?.reply_to_mode ?? null,
      ...counts,
    },
    campaigns: rows.map((r) => ({
      id:                    r.id,
      rep_slug:              r.rep_slug,
      rep_name:              r.rep_name,
      name:                  r.name,
      subject:               r.subject,
      audience_id:           r.audience_id,
      template_id:           r.template_id,
      mailchimp_campaign_id: r.mailchimp_campaign_id,
      mailchimp_web_id:      r.mailchimp_web_id,
      edit_url:              editUrl(r.mailchimp_web_id),
      status:                r.status,
      scheduled_at:          r.scheduled_at,
      created_at:            r.created_at,
    })),
  })
}
