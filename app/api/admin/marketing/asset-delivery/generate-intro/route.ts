/**
 * /api/admin/marketing/asset-delivery/generate-intro
 *
 * POST — generate a 2-3 sentence personalized intro paragraph for the
 * asset-delivery email a sales rep will receive. Output is plain text
 * (no HTML, no markdown) suitable for dropping straight into a template
 * <p> tag or a plain-text fallback.
 *
 * Distinct from /api/admin/marketing/ai/generate, which produces full
 * email body HTML (80-600 words). This endpoint is tuned tightly for
 * short, varied per-rep intros.
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateMarketingCopy, marketingAiFailureResponse, MARKETING_AI_MODEL } from '@/lib/marketing-ai-client'
import { requireApiRole } from '@/lib/auth/guards'
import {
  ASSET_DELIVERY_INTRO_SYSTEM_PROMPT,
  buildIntroUserMessage,
  stripHtmlTags,
} from '@/lib/marketing-ai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MODEL = MARKETING_AI_MODEL
const MAX_TOKENS = 300
const MIN_WORDS = 30
const MAX_WORDS = 150

/* ─── Schema ───────────────────────────────────────────────────── */

const AssetSummaryItem = z.object({
  format: z.string().trim().min(1).max(50),
  type:   z.string().trim().min(1).max(100),
})

const BodySchema = z.object({
  rep_first_name:       z.string().trim().min(1).max(50),
  rep_full_name:        z.string().trim().min(1).max(100),
  campaign_name:        z.string().trim().min(1).max(200),
  campaign_description: z.string().trim().max(500).optional(),
  asset_summary:        z.array(AssetSummaryItem).min(1).max(10),
})

/* System prompt and user-message builder live in @/lib/marketing-ai so
 * the preview endpoint and the real send endpoint stay in lock-step. */

/* ─── Helpers ──────────────────────────────────────────────────── */

function stripWrappingQuotes(s: string): string {
  // Common quote characters the model wraps output in (ASCII, curly, guillemets).
  const pairs: Array<[string, string]> = [
    ['"', '"'],
    ["'", "'"],
    ['“', '”'],
    ['‘', '’'],
    ['«', '»'],
  ]
  let out = s.trim()
  for (const [open, close] of pairs) {
    if (out.length >= 2 && out.startsWith(open) && out.endsWith(close)) {
      out = out.slice(open.length, out.length - close.length).trim()
    }
  }
  return out
}

function countWords(s: string): number {
  const trimmed = s.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

/* ─── Route ────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  const auth = await requireApiRole('asset-delivery')
  if ('error' in auth) return auth.error

  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    console.error('[asset-intro] OPENAI_API_KEY not set in server environment')
    return NextResponse.json(
      { error: 'AI service not configured — OPENAI_API_KEY is missing on the server.' },
      { status: 503 },
    )
  }

  let body: z.infer<typeof BodySchema>
  try {
    const raw = await req.json()
    body = BodySchema.parse(raw)
  } catch (err) {
    const issues = err instanceof z.ZodError
      ? err.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`)
      : ['Invalid JSON body']
    return NextResponse.json({ error: 'Invalid request', details: issues }, { status: 400 })
  }

  const {
    rep_first_name,
    rep_full_name,
    campaign_name,
    campaign_description,
    asset_summary,
  } = body
  const adminEmail = auth.session.username || 'unknown'

  const userMessage = buildIntroUserMessage({
    rep_first_name,
    rep_full_name,
    campaign_name,
    campaign_description,
    asset_summary,
  })

  let generated
  try {
    generated = await generateMarketingCopy({
      apiKey,
      messages: [
        { role: 'system', content: ASSET_DELIVERY_INTRO_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      maxTokens: MAX_TOKENS,
    })
  } catch (error) {
    const failure = marketingAiFailureResponse(error)
    return NextResponse.json(failure.body, { status: failure.status })
  }
  let intro = stripWrappingQuotes(stripHtmlTags(generated.text))
  intro = intro.replace(/\s+/g, ' ').trim()
  if (!intro) return NextResponse.json({ error: 'The AI service returned no usable copy.' }, { status: 503 })
  const wordCount = countWords(intro)
  const tokensUsed = generated.tokensUsed

  if (wordCount < MIN_WORDS || wordCount > MAX_WORDS) {
    console.warn(
      `[asset-intro] word count out of range (${wordCount}); returning anyway. admin=${adminEmail} campaign=${campaign_name}`,
    )
  }

  console.log(
    `[asset-intro] admin=${adminEmail} rep=${rep_full_name} campaign=${campaign_name} tokens=${tokensUsed} words=${wordCount}`,
  )

  return NextResponse.json({
    intro,
    tokens_used: tokensUsed,
    model:       MODEL,
    word_count:  wordCount,
  })
}
