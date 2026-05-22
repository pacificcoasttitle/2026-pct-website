// ============================================================
// POST /api/admin/marketing/ai/generate
// Server-side OpenAI call for marketing email content.
// Future "Create with AI" button calls this; the key is never
// exposed to the client.
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { cookies } from 'next/headers'
import {
  isAuthenticated,
  verifyAdminToken,
  ADMIN_COOKIE,
} from '@/lib/admin-auth'

export const runtime = 'nodejs'

// Force this route to be evaluated dynamically — never statically cached.
// AI generation is stateful per request and must not be reused.
export const dynamic = 'force-dynamic'

// ── Request validation ──────────────────────────────────────────
const BodySchema = z.object({
  prompt:          z.string().min(10).max(2000),
  mode:            z.enum(['insert', 'rewrite']).default('insert'),
  length:          z.enum(['short', 'medium', 'long']).default('medium'),
  existingContent: z.string().max(5000).optional(),
})

const MAX_TOKENS: Record<'short' | 'medium' | 'long', number> = {
  short:  400,
  medium: 800,
  long:   1500,
}

const LENGTH_GUIDANCE: Record<'short' | 'medium' | 'long', string> = {
  short:  'Write 1-2 short paragraphs (~80-150 words total).',
  medium: 'Write 3-4 short paragraphs (~200-350 words total).',
  long:   'Write 5-7 short paragraphs with clear structure (~400-600 words total). Use a heading and a bulleted list if natural.',
}

const MODEL = 'gpt-4o-mini' as const

// ── System prompt (verbatim per spec) ───────────────────────────
const SYSTEM_PROMPT = `You are an expert email copywriter for Pacific Coast Title Company (PCT), a 
title insurance and escrow company serving California since 2005.

WRITING STYLE:
- Confident but not arrogant
- Reassuring — "you're in good hands" energy
- Customer-benefit focused, not company-focused
- Professional but approachable
- Calm and dependable, never loud or salesy

NEVER USE:
- Superlatives ("best", "leading", "premier", "top-rated", "#1")
- Hype words ("revolutionary", "game-changing", "cutting-edge")
- Specific certifications we can't verify ("WCAG compliant", "SOC 2 certified")
- Vague time promises ("respond within 24 hours", "always available")
- "Industry-leading" anything
- Startup language ("disrupt", "transform", "synergy")
- "innovative" / "innovative option" / "innovative service"
- "you've come to expect" (soft superlative)
- "exciting" or "thrilled" (overused, drains meaning)
- "trusted by thousands" or similar unverifiable claims
- "your trusted partner" (cliché)

USE INSTEAD:
- "We work to..." instead of "We always..."
- "We aim to..." instead of "We promise..."
- "Where reasonable..." for qualified commitments
- Specific examples over vague claims

FORMAT REQUIREMENTS:
- Output clean HTML for email body content ONLY
- Use these tags: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <a href="...">
- DO NOT include <html>, <head>, <body>, or any document structure
- DO NOT include style attributes (CSS comes from the template)
- DO NOT include <img> tags (hero image is handled separately)
- Use merge tags where natural: {{REP_NAME}}, {{REP_PHONE}}, {{REP_EMAIL}}
- Output ONLY the HTML — no markdown code blocks, no preamble, no explanation
- Keep paragraphs short (2-3 sentences max)
- Use bullets when listing 3+ items

SELF-CHECK BEFORE FINISHING:
Re-read your output. If you used any words from the NEVER USE list, rewrite that sentence using simpler, more direct language. Prefer:
- "new" instead of "innovative"
- "available" or "ready" instead of "exciting"
- Specific descriptions over emotional language
- Active voice and concrete benefits

AUDIENCE:
The reader is typically a real estate agent, loan officer, or property 
professional. They care about: smooth closings, trustworthy partners, their 
reputation with their clients.

VERIFIED FACTS YOU CAN STATE:
- PCT was founded in 2005
- PCT is headquartered in Orange, California
- PCT has 5 California locations (Orange HQ, Downey, Glendale, Inland 
  Empire/Ontario, San Diego)
- PCT's TSG/REO division covers Arizona, California, and Nevada
- Services: title insurance, escrow settlement, commercial title, 1031 exchange

LENGTH GUIDANCE:
- short: 1-2 paragraphs (~80-150 words)
- medium: 3-4 short paragraphs (~200-350 words)
- long: 5-7 paragraphs with structure (~400-600 words)`

// ── Allow-list HTML sanitiser ───────────────────────────────────
//
// We don't pull in a heavyweight DOM library for one route. The system
// prompt strongly constrains the model output to a handful of tags, so
// we run a server-side scrub that strips anything dangerous: script /
// style / iframe / object / embed blocks, on* event handlers, and
// javascript:/data: URLs. Anything that survives is plain HTML that
// the email template wraps in its own CSS.
function sanitiseHtml(input: string): string {
  let html = input

  // 1. Trim accidental markdown code fences ("```html ... ```").
  html = html.replace(/^\s*```(?:html)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()

  // 2. Drop entire dangerous blocks (with their content).
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
  html = html.replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '')
  html = html.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe\s*>/gi, '')
  html = html.replace(/<object\b[^>]*>[\s\S]*?<\/object\s*>/gi, '')
  html = html.replace(/<embed\b[^>]*>[\s\S]*?<\/embed\s*>/gi, '')

  // 3. Self-closing variants of the same tags.
  html = html.replace(/<(?:script|style|iframe|object|embed)\b[^>]*\/?>/gi, '')

  // 4. Strip on*="..." / on*='...' / on*=value event handlers
  //    inside any tag attribute list. Whitespace before "on" is required
  //    to avoid eating inner-text words like "common".
  html = html.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
  html = html.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
  html = html.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '')

  // 5. Neutralise javascript: and data: URLs in href / src.
  html = html.replace(/(href|src)\s*=\s*"\s*(?:javascript|data)\s*:[^"]*"/gi, '$1="#"')
  html = html.replace(/(href|src)\s*=\s*'\s*(?:javascript|data)\s*:[^']*'/gi, "$1='#'")

  // 6. Strip <img> tags entirely (spec: hero image is handled separately).
  html = html.replace(/<img\b[^>]*\/?>/gi, '')

  // 7. Strip <html>, <head>, <body> wrappers if the model included them.
  html = html.replace(/<\/?(?:html|head|body|!doctype)[^>]*>/gi, '')

  return html.trim()
}

// ── Actor email (for log line) ──────────────────────────────────
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

// ── Route ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('[ai-gen] OPENAI_API_KEY not set in server environment')
    return NextResponse.json(
      { error: 'AI service not configured — OPENAI_API_KEY is missing on the server.' },
      { status: 500 },
    )
  }

  // ── Parse + validate body ─────────────────────────────────────
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

  const { prompt, mode, length, existingContent } = body
  const adminEmail = await getActorEmail()

  // ── Build messages ────────────────────────────────────────────
  const userParts: string[] = []
  userParts.push(prompt.trim())
  userParts.push('')
  userParts.push(LENGTH_GUIDANCE[length])
  if (mode === 'rewrite' && existingContent && existingContent.trim()) {
    userParts.push('')
    userParts.push('Rewrite the following existing content while keeping its intent:')
    userParts.push('---')
    userParts.push(existingContent.trim())
    userParts.push('---')
  }

  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    { role: 'user'   as const, content: userParts.join('\n') },
  ]

  // ── Call OpenAI ───────────────────────────────────────────────
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
        messages,
        temperature: 0.7,
        max_tokens:  MAX_TOKENS[length],
      }),
    })
  } catch (netErr) {
    console.error('[ai-gen] network error calling OpenAI:', netErr)
    return NextResponse.json(
      { error: 'AI service unreachable. Please try again in a moment.' },
      { status: 503 },
    )
  }

  if (openaiRes.status === 401) {
    console.error('[ai-gen] OpenAI rejected credentials (401). Rotate OPENAI_API_KEY.')
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
    console.error(`[ai-gen] OpenAI ${openaiRes.status} error:`, errText.slice(0, 500))
    return NextResponse.json(
      { error: 'AI service error. Please try again.' },
      { status: 503 },
    )
  }

  // ── Parse + sanitise ──────────────────────────────────────────
  interface OpenAIResponse {
    choices?: Array<{ message?: { content?: string } }>
    usage?:   { total_tokens?: number }
  }
  const data = (await openaiRes.json().catch(() => null)) as OpenAIResponse | null
  const rawContent = data?.choices?.[0]?.message?.content
  if (!data || typeof rawContent !== 'string' || rawContent.trim() === '') {
    console.error('[ai-gen] OpenAI returned no content:', JSON.stringify(data).slice(0, 400))
    return NextResponse.json(
      { error: 'AI service returned no content. Please try again.' },
      { status: 503 },
    )
  }

  const content    = sanitiseHtml(rawContent)
  const tokensUsed = typeof data.usage?.total_tokens === 'number' ? data.usage.total_tokens : 0

  // Single-line log: shows up in Vercel logs without leaking the prompt body.
  console.log(`[ai-gen] admin=${adminEmail} tokens=${tokensUsed} model=${MODEL} chars=${prompt.length}`)

  return NextResponse.json({
    content,
    tokensUsed,
    model: MODEL,
  })
}
