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
import { cookies } from 'next/headers'
import { z } from 'zod'
import {
  isAuthenticated,
  verifyAdminToken,
  ADMIN_COOKIE,
} from '@/lib/admin-auth'
import { PCT_BRAND_VOICE_RULES, stripHtmlTags } from '@/lib/marketing-ai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MODEL = 'gpt-4o-mini' as const
const MAX_TOKENS = 200
const TEMPERATURE = 0.7
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

/* ─── System prompt ────────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are writing personalized email intros for Pacific Coast Title's marketing team. The marketing team is delivering personalized marketing pieces to a specific sales rep, who will share these with their clients and contacts.

YOUR OUTPUT:
A 2-3 sentence paragraph that:
1. Opens warmly without re-introducing yourself or saying "Hi {name}" (the email has separate greeting and signature)
2. Briefly describes what the marketing pieces are about (1 sentence)
3. Suggests when/how they're useful — be specific to title insurance / real estate sales context (1 sentence)

VOICE RULES:
${PCT_BRAND_VOICE_RULES}

ADDITIONAL CONSTRAINTS:
- Plain text only (no HTML, no markdown, no bullets)
- 40-80 words total
- Confident, helpful tone — like a trusted marketing colleague
- No emoji
- Reference the campaign topic naturally — don't restate the campaign name
- Don't list every attachment by name (the email already shows that)
- Don't use clichés like "exciting," "thrilled," "your trusted partner"
- Don't make claims you can't verify ("the most powerful," "industry-leading")

GOOD EXAMPLE (for "Wire Fraud Prevention" campaign):
"Your personalized Wire Fraud Prevention assets are attached and ready to share. These pieces explain the rising threat of real estate wire fraud in clear, client-friendly language — perfect for sending to active escrow clients or sharing on social. Forward them as-is or use the talking points to make them your own."

BAD EXAMPLE (avoid this style):
"Hey Jerry! We're so excited to share these innovative new pieces that will help you take your business to the next level! Pacific Coast Title is thrilled to be your trusted partner..."`

/* ─── Helpers ──────────────────────────────────────────────────── */

async function getActorEmail(): Promise<string> {
  try {
    const jar   = await cookies()
    const token = jar.get(ADMIN_COOKIE)?.value
    if (!token) return 'unknown'
    const session = await verifyAdminToken(token)
    return session?.username || 'unknown'
  } catch {
    return 'unknown'
  }
}

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
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.OPENAI_API_KEY
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
    rep_full_name,
    campaign_name,
    campaign_description,
    asset_summary,
  } = body
  const adminEmail = await getActorEmail()

  /* Build user message. */
  const lines: string[] = []
  lines.push('Generate an intro for:')
  lines.push(`- Rep: ${rep_full_name}`)
  lines.push(`- Campaign: ${campaign_name}`)
  if (campaign_description && campaign_description.trim()) {
    lines.push(`- About: ${campaign_description.trim()}`)
  }
  lines.push(`- Attachments: ${asset_summary.map((a) => `${a.format} (${a.type})`).join(', ')}`)
  lines.push('')
  lines.push('Write the 2-3 sentence intro paragraph now.')
  const userMessage = lines.join('\n')

  /* Call OpenAI. */
  let openaiRes: Response
  try {
    openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model:       MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user',   content: userMessage },
        ],
        temperature: TEMPERATURE,
        max_tokens:  MAX_TOKENS,
      }),
    })
  } catch (netErr) {
    console.error('[asset-intro] network error calling OpenAI:', netErr)
    return NextResponse.json(
      { error: 'AI service unreachable. Please try again in a moment.' },
      { status: 503 },
    )
  }

  if (openaiRes.status === 401) {
    console.error('[asset-intro] OpenAI rejected credentials (401). Rotate OPENAI_API_KEY.')
    return NextResponse.json(
      { error: 'AI service unavailable. Please contact an administrator.' },
      { status: 503 },
    )
  }
  if (openaiRes.status === 429) {
    return NextResponse.json(
      { error: 'Rate limited, try again in a moment.' },
      { status: 429 },
    )
  }
  if (!openaiRes.ok) {
    const errText = await openaiRes.text().catch(() => '')
    console.error(`[asset-intro] OpenAI ${openaiRes.status} error:`, errText.slice(0, 500))
    return NextResponse.json(
      { error: 'AI service error. Please try again.' },
      { status: 500 },
    )
  }

  interface OpenAIResponse {
    choices?: Array<{ message?: { content?: string } }>
    usage?:   { total_tokens?: number }
  }
  const data = (await openaiRes.json().catch(() => null)) as OpenAIResponse | null
  const rawContent = data?.choices?.[0]?.message?.content
  if (!data || typeof rawContent !== 'string' || rawContent.trim() === '') {
    console.error('[asset-intro] OpenAI returned no content:', JSON.stringify(data).slice(0, 400))
    return NextResponse.json(
      { error: 'AI service returned no content. Please try again.' },
      { status: 500 },
    )
  }

  /* Post-process: strip HTML, strip wrapping quotes, collapse whitespace. */
  let intro = stripHtmlTags(rawContent)
  intro = stripWrappingQuotes(intro)
  intro = intro.replace(/\s+/g, ' ').trim()

  const wordCount  = countWords(intro)
  const tokensUsed = typeof data.usage?.total_tokens === 'number' ? data.usage.total_tokens : 0

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
