/**
 * Shared brand-voice guardrails and HTML sanitization for marketing AI
 * endpoints (full-body generation and personalized intro generation).
 *
 * Anything that should be enforced across every PCT marketing AI call
 * belongs here, so we don't drift from rule to rule as endpoints grow.
 *
 * Behavior contract:
 *   - PCT_BRAND_VOICE_RULES is a verbatim slice of the original system
 *     prompt's NEVER USE / USE INSTEAD / SELF-CHECK sections. Composing
 *     the existing prompt with this constant must produce a string that
 *     is byte-identical to the previous inline prompt.
 *   - sanitizeAiHtml mirrors the previous inline `sanitiseHtml` helper
 *     exactly (same regex order, same outputs).
 */

/**
 * NEVER USE / USE INSTEAD lists, lifted verbatim from the original
 * marketing-AI system prompt. These are the core brand-voice
 * guardrails that apply to every PCT marketing AI call regardless of
 * output format.
 */
export const PCT_BRAND_VOICE_RULES = `NEVER USE:
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
- Specific examples over vague claims`

/**
 * SELF-CHECK instruction kept separate so callers can place it in the
 * position their existing prompt expects (the original full-body prompt
 * puts it AFTER format requirements, not adjacent to the voice rules).
 */
export const PCT_BRAND_VOICE_SELF_CHECK = `SELF-CHECK BEFORE FINISHING:
Re-read your output. If you used any words from the NEVER USE list, rewrite that sentence using simpler, more direct language. Prefer:
- "new" instead of "innovative"
- "available" or "ready" instead of "exciting"
- Specific descriptions over emotional language
- Active voice and concrete benefits`

/**
 * Server-side HTML sanitiser for AI-generated marketing copy.
 *
 * Allow-list approach: strip the handful of dangerous primitives we
 * actively block (scripts, styles, iframes, on* handlers, javascript:
 * URLs, <img>, document wrappers). The system prompt already constrains
 * model output to a small tag set; this is defense-in-depth.
 *
 * IMPORTANT: regex order matters — block-with-content patterns must run
 * before the self-closing pass, and event handlers must consume the
 * leading whitespace so we don't eat inner-text words like "common".
 */
export function sanitizeAiHtml(input: string): string {
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

  // 6. Strip <img> tags entirely (hero image is handled separately).
  html = html.replace(/<img\b[^>]*\/?>/gi, '')

  // 7. Strip <html>, <head>, <body> wrappers if the model included them.
  html = html.replace(/<\/?(?:html|head|body|!doctype)[^>]*>/gi, '')

  return html.trim()
}

/**
 * System prompt for the asset-delivery personalized intro generator.
 *
 * Single source of truth used by BOTH the preview endpoint
 * (/api/admin/marketing/asset-delivery/generate-intro) and the real
 * send endpoint (/api/admin/marketing/asset-delivery/[batchId]/send).
 * Keeping them in sync here prevents prompt drift — the preview the
 * operator approves is the prompt the recipient's email uses.
 *
 * Embeds PCT_BRAND_VOICE_RULES so brand updates flow through here too.
 */
export const ASSET_DELIVERY_INTRO_SYSTEM_PROMPT = `You are writing personalized email intros for Pacific Coast Title's marketing team. The marketing team is delivering personalized marketing pieces to a specific sales rep, who will share these with their clients and contacts.

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

export interface IntroContext {
  rep_first_name:        string
  rep_full_name:         string
  campaign_name:         string
  campaign_description?: string | null
  asset_summary:         Array<{ format: string; type: string }>
}

/**
 * Builds the user message that pairs with ASSET_DELIVERY_INTRO_SYSTEM_PROMPT.
 * Identical wording across preview and send so the model sees the same
 * input on both paths.
 */
export function buildIntroUserMessage(ctx: IntroContext): string {
  const lines: string[] = []
  lines.push('Generate an intro for:')
  lines.push(`- Rep: ${ctx.rep_full_name}`)
  lines.push(`- Campaign: ${ctx.campaign_name}`)
  if (ctx.campaign_description && ctx.campaign_description.trim()) {
    lines.push(`- About: ${ctx.campaign_description.trim()}`)
  }
  lines.push(`- Attachments: ${ctx.asset_summary.map((a) => `${a.format} (${a.type})`).join(', ')}`)
  lines.push('')
  lines.push('Write the 2-3 sentence intro paragraph now.')
  return lines.join('\n')
}

/**
 * Strip every HTML tag, decode the handful of entities the model is
 * likely to emit, and collapse whitespace. Used by plain-text endpoints
 * (intro generation) that need to coerce the model's output to flat
 * prose even if it slipped in a stray <p>.
 */
export function stripHtmlTags(input: string): string {
  let text = input

  // Run through the HTML sanitiser first so script/style blocks don't
  // leak their content into the stripped text.
  text = sanitizeAiHtml(text)

  // Remove every remaining tag.
  text = text.replace(/<\/?[^>]+>/g, ' ')

  // Decode the entities we expect to see from the model.
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")

  // Collapse whitespace (incl. newlines) and trim.
  text = text.replace(/\s+/g, ' ').trim()

  return text
}
