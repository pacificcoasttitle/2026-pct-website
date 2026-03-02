// ============================================================
// TESSA™ API Abstraction
// Handles calls to tessa-proxy.onrender.com.
// Proxy wraps Anthropic Claude in OpenAI response format.
// ============================================================

const PROXY_URL = 'https://tessa-proxy.onrender.com/api/ask-tessa'

export interface TessaMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface TessaApiOptions {
  messages: TessaMessage[]
  max_tokens?: number
  temperature?: number
  /** Hint to the proxy about what kind of call this is */
  request_type?: 'prelim_extract' | 'prelim_summarize' | 'prelim_cheatsheet' | 'repair' | 'chat'
  /** Expected response format: json returns raw JSON, markdown returns prose */
  response_format?: 'json' | 'markdown'
}

export interface TessaApiResponse {
  choices: Array<{
    message: {
      role: string
      content: string
    }
  }>
  _meta?: Record<string, unknown>
}

export async function callTessaProxy(options: TessaApiOptions): Promise<string> {
  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: options.messages,
      max_tokens: options.max_tokens ?? 2400,
      temperature: options.temperature ?? 0.25,
      request_type: options.request_type ?? 'chat',
      response_format: options.response_format ?? 'markdown',
    }),
  })

  if (!response.ok) {
    throw new Error(`TESSA proxy error: HTTP ${response.status}`)
  }

  const data: TessaApiResponse = await response.json()

  // Log metadata in development for debugging
  if (process.env.NODE_ENV === 'development' && data._meta) {
    console.log('[TESSA] API call metadata:', data._meta)
  }

  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error('Invalid response format from TESSA proxy')

  return content
}

// ── Convenience wrappers for each pipeline step ──────────────

/**
 * Step 1 – Structured extraction (temp=0, JSON output).
 * Returns raw JSON string; caller must parse.
 */
export async function callTessaExtract(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  return callTessaProxy({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 4000,
    temperature: 0,
    request_type: 'prelim_extract',
    response_format: 'json',
  })
}

/**
 * Step 2 – Plain-English summary (temp=0.1, markdown output).
 */
export async function callTessaSummarize(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  return callTessaProxy({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 1200,
    temperature: 0.1,
    request_type: 'prelim_summarize',
    response_format: 'markdown',
  })
}

/**
 * Repair call – used when validation finds missing items.
 */
export async function callTessaRepair(
  history: TessaMessage[],
  repairPrompt: string
): Promise<string> {
  return callTessaProxy({
    messages: [...history, { role: 'user', content: repairPrompt }],
    max_tokens: 900,
    temperature: 0.1,
    request_type: 'repair',
    response_format: 'markdown',
  })
}
