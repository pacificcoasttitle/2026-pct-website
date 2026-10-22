import { randomUUID } from 'node:crypto'
import { marketingAiError } from './marketing-ai-errors'

export const MARKETING_AI_MODEL = 'gpt-4o-mini'
export class MarketingAiFailure extends Error {
  constructor(public code: string, message: string, public status = 503, public reference: string = randomUUID()) {
    super(message)
    this.name = 'MarketingAiFailure'
  }
}

export function marketingAiFailureResponse(error: unknown) {
  const failure = error instanceof MarketingAiFailure ? error :
    new MarketingAiFailure('AI_UNAVAILABLE', 'AI generation could not finish. Please try again.')
  return { status: failure.status, body: {
    error: `${failure.message} Support reference: ${failure.reference}`,
    code: failure.code, reference: failure.reference,
  } }
}

type Options = {
  apiKey: string
  messages: Array<{ role: 'system' | 'user'; content: string }>
  maxTokens: number
}
type Dependencies = { fetch?: typeof fetch; sleep?: (ms: number) => Promise<void>; timeoutMs?: number }

/** One server-only transport for previews and generated campaign copy.
 * No prompt/key/raw provider response is logged. Never retry billing/auth errors.
 * A single deadline covers fetch, body parsing, and the optional bounded retry.
 */
export async function generateMarketingCopy(options: Options, deps: Dependencies = {}) {
  const reference = randomUUID()
  const apiKey = options.apiKey.trim()
  if (!apiKey) throw new MarketingAiFailure('AI_NOT_CONFIGURED', 'AI generation is not configured on this server.', 503, reference)
  const request = deps.fetch ?? fetch
  const sleep = deps.sleep ?? ((ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms)))
  const controller = new AbortController()
  const timeoutMs = deps.timeoutMs ?? 25_000
  let timer: ReturnType<typeof setTimeout> | undefined
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort()
      reject(new MarketingAiFailure('AI_TIMEOUT', 'AI generation took too long. Please try again.', 503, reference))
    }, timeoutMs)
  })
  const run = async () => {
    for (let attempt = 0; attempt < 2; attempt++) {
      if (controller.signal.aborted) throw new MarketingAiFailure('AI_TIMEOUT', 'AI generation took too long. Please try again.', 503, reference)
      const response = await request('https://api.openai.com/v1/chat/completions', {
        method: 'POST', cache: 'no-store', signal: controller.signal,
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'X-Client-Request-Id': reference },
        body: JSON.stringify({ model: MARKETING_AI_MODEL, messages: options.messages, temperature: 0.7, max_tokens: options.maxTokens }),
      })
      if (!response.ok) {
        const failure = await marketingAiError(response)
        const retryHeader = response.headers.get('retry-after')
        const seconds = retryHeader === null ? 1 : Number(retryHeader)
        const delay = Number.isFinite(seconds) ? Math.max(0, seconds * 1000) : Math.max(0, Date.parse(retryHeader!) - Date.now())
        const transient = failure.body.code === 'AI_RATE_LIMITED' || (response.status >= 500 && failure.body.code === 'AI_PROVIDER_ERROR')
        if (attempt === 0 && transient && Number.isFinite(delay) && delay <= 2000) {
          await sleep(delay)
          continue
        }
        throw new MarketingAiFailure(failure.body.code, failure.body.error, failure.status, reference)
      }
      const data = await response.json().catch(() => null)
      const choice = data?.choices?.[0]
      if (choice?.finish_reason === 'length') throw new MarketingAiFailure('AI_INCOMPLETE', 'The generated copy was cut short. Try a shorter request.', 503, reference)
      const text = choice?.message?.content
      if (typeof text !== 'string' || !text.trim()) throw new MarketingAiFailure('AI_EMPTY_RESPONSE', 'The AI service returned no usable copy. Please try again.', 503, reference)
      console.info('[marketing-ai] completed', { reference, model: MARKETING_AI_MODEL, attempt: attempt + 1 })
      return { text: text.trim(), tokensUsed: typeof data?.usage?.total_tokens === 'number' ? data.usage.total_tokens : 0 }
    }
    throw new MarketingAiFailure('AI_UNAVAILABLE', 'AI generation could not finish.', 503, reference)
  }
  try {
    return await Promise.race([run(), deadline])
  } catch (error) {
    const failure = error instanceof MarketingAiFailure ? error : new MarketingAiFailure(
      controller.signal.aborted ? 'AI_TIMEOUT' : 'AI_CONNECTION_ERROR',
      controller.signal.aborted ? 'AI generation took too long. Please try again.' : 'Could not reach the AI service. Please try again.', 503, reference)
    console.error('[marketing-ai] failed', { reference, code: failure.code })
    throw failure
  } finally {
    clearTimeout(timer)
  }
}
