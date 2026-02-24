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

export interface TessaApiResponse {
  choices: Array<{
    message: {
      role: string
      content: string
    }
  }>
}

export async function callTessaProxy(
  messages: TessaMessage[],
  options: { max_tokens?: number; temperature?: number } = {}
): Promise<string> {
  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      max_tokens: options.max_tokens ?? 2400,
      temperature: options.temperature ?? 0.25,
    }),
  })

  if (!response.ok) {
    throw new Error(`TESSA proxy error: HTTP ${response.status}`)
  }

  const data: TessaApiResponse = await response.json()
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error('Invalid response format from TESSA proxy')

  return content
}

export async function callTessaRepair(
  history: TessaMessage[],
  repairPrompt: string
): Promise<string> {
  return callTessaProxy(
    [...history, { role: 'user', content: repairPrompt }],
    { max_tokens: 900, temperature: 0.1 }
  )
}
