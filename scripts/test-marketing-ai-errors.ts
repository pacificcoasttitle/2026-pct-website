import assert from 'node:assert/strict'
import { marketingAiError } from '../lib/marketing-ai-errors'

async function main() {
  for (const code of ['credit_balance_exhausted', 'insufficient_quota', 'organization_spend_limit_exceeded', 'organization_usage_limit_exceeded', 'billing_hard_limit_reached']) {
    const r = await marketingAiError(new Response(JSON.stringify({ error: { code } }), { status: 429 }))
    assert.equal(r.status, 503)
    assert.equal(r.body.code, 'AI_BILLING_REQUIRED')
  }
  const quota = await marketingAiError(new Response(JSON.stringify({error:{type:'insufficient_quota',code:'new_billing_code'}}),{status:429}))
  assert.equal(quota.body.code, 'AI_BILLING_REQUIRED')
  for (const status of [401, 403]) {
    const r = await marketingAiError(new Response('{}', { status }))
    assert.equal(r.body.code, 'AI_ACCESS_REQUIRED')
  }
  const rate = await marketingAiError(new Response('{"error":{"code":"rate_limit_exceeded"}}', { status: 429 }))
  assert.equal(rate.status, 429)
  assert.equal(rate.body.code, 'AI_RATE_LIMITED')
  const bad = await marketingAiError(new Response('upstream error', { status: 502 }))
  assert.equal(bad.body.code, 'AI_PROVIDER_ERROR')
  assert.equal(JSON.stringify(bad).includes('upstream error'), false)
  console.log('PASS: 10 provider-error cases; billing, access, rate limits, malformed responses.')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
