/**
 * POST /api/admin/hr/accomplishments-digest
 *
 * On-demand quarterly accomplishments digest: coverage facts in code +
 * optional AI summary (present, don't rank).
 *
 * ⚠️ Gated by explicit role === 'hr' || 'top_level' — NOT requireApiRole
 * ('hr-tools'), which manager='all' would pass.
 */
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminSession } from '@/lib/auth/guards'
import {
  assertDigestAccess,
  quarterToWindow,
  getAccomplishmentsForQuarter,
  computeCoverageFacts,
  generateAccomplishmentsDigestAi,
  type QuarterNumber,
} from '@/lib/hr-accomplishments-digest'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BodySchema = z.object({
  year:    z.number().int().min(2000).max(2100),
  quarter: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
})

export async function POST(req: Request) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!assertDigestAccess(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch (err) {
    const issues = err instanceof z.ZodError
      ? err.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
      : ['Invalid JSON body']
    return NextResponse.json({ error: 'Invalid request', details: issues }, { status: 400 })
  }

  const window = quarterToWindow(body.year, body.quarter as QuarterNumber)
  const groups = await getAccomplishmentsForQuarter(window.start, window.end)
  const coverage = computeCoverageFacts(groups, window)

  const { result: ai, error: aiError } = await generateAccomplishmentsDigestAi(groups)

  return NextResponse.json({
    ok: true,
    coverage,
    employees: groups,
    ai,
    aiError,
    empty: groups.length === 0,
  })
}
