/**
 * GET /api/admin/marketing/studio/[id]
 *
 * Fetch a single email template by id. Faster than the full /studio GET:
 * no seedDefaultTemplates(), no campaign log fetch, and the payload is just
 * one row. Eliminates the cold-start race in the template editor where the
 * full /studio call could complete after TinyMCE had already initialised
 * with empty content.
 */
import { NextRequest, NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/auth/guards'
import { getPool } from '@/lib/admin-db'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole('marketing')
  if ('error' in auth) return auth.error

  const { id } = await ctx.params
  const numericId = Number(id)
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return NextResponse.json({ error: 'Invalid template id' }, { status: 400 })
  }

  const db  = getPool()
  const res = await db.query(
    `SELECT id, name, category, subject, preheader, html_content,
            thumbnail_url, created_at::text, updated_at::text
       FROM vcard_email_templates
      WHERE id = $1
      LIMIT 1`,
    [numericId],
  )

  if (res.rowCount === 0) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  return NextResponse.json({ template: res.rows[0] })
}
