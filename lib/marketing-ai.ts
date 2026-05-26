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
