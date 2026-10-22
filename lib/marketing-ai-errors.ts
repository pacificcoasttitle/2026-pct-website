/** Safe, actionable provider errors. Never expose raw provider messages or keys. */
export async function marketingAiError(response: Response) {
  const payload = await response.json().catch(() => null)
  const code = typeof payload?.error?.code === 'string' ? payload.error.code : ''
  const type = typeof payload?.error?.type === 'string' ? payload.error.type : ''
  const billingCodes = [
    'insufficient_quota', 'credit_balance_exhausted', 'billing_hard_limit_reached',
    'organization_spend_limit_exceeded', 'organization_usage_limit_exceeded',
    'billing_not_active',
  ]
  // Allow-list diagnostics only; no provider message, prompt, or credentials.
  console.error('[marketing-ai] provider failure', {
    status: response.status,
    code: /^[a-z_]+$/.test(code) ? code : 'unknown',
    requestId: response.headers.get('x-request-id'),
  })
  if (type === 'insufficient_quota' || billingCodes.includes(code)) {
    return {
      status: 503,
      body: { code: 'AI_BILLING_REQUIRED', error: 'AI generation is unavailable because the OpenAI account connected to this server has no available credits or has reached its usage limit. Ask your administrator to check billing for the account associated with the deployed OPENAI_API_KEY. Waiting and retrying will not resolve this.' },
    }
  }
  if (response.status === 401 || response.status === 403) {
    return { status: 503, body: { code: 'AI_ACCESS_REQUIRED', error: 'The AI service rejected the server credentials or permissions. Ask your administrator to check the deployed OpenAI API key and model access.' } }
  }
  if (response.status === 429) {
    return { status: 429, body: { code: 'AI_RATE_LIMITED', error: 'The AI service is temporarily receiving too many requests. Please wait a minute before trying again.' } }
  }
  return { status: 503, body: { code: 'AI_PROVIDER_ERROR', error: 'The AI service could not complete this request. Please try again. If it continues, contact your administrator.' } }
}
