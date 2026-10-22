import assert from 'node:assert/strict'
import { generateMarketingCopy, marketingAiFailureResponse, MarketingAiFailure } from '../lib/marketing-ai-client'

const options = { apiKey: ' test-only ', messages: [{ role: 'user' as const, content: 'Test copy' }], maxTokens: 100 }
const ok = () => new Response(JSON.stringify({choices:[{message:{content:'Useful copy'},finish_reason:'stop'}],usage:{total_tokens:12}}))
async function main() {
  let checks = 0
  const success = await generateMarketingCopy(options, {fetch: async (url, init) => {
    assert.equal(url, 'https://api.openai.com/v1/chat/completions')
    assert.equal((init?.headers as Record<string,string>).Authorization, 'Bearer test-only')
    assert.equal(JSON.parse(String(init?.body)).model, 'gpt-4o-mini')
    assert.equal(init?.cache, 'no-store')
    return ok()
  }})
  assert.deepEqual(success, {text:'Useful copy',tokensUsed:12}); checks++
  for (const [status, code, expected] of [
    [429,'credit_balance_exhausted','AI_BILLING_REQUIRED'],
    [429,'organization_spend_limit_exceeded','AI_BILLING_REQUIRED'],
    [401,'invalid_api_key','AI_ACCESS_REQUIRED'],
    [403,'permission_denied','AI_ACCESS_REQUIRED'],
  ] as const) {
    let calls=0
    await assert.rejects(generateMarketingCopy(options,{fetch:async()=>{calls++;return new Response(JSON.stringify({error:{code}}),{status})}}), (e:unknown)=>e instanceof MarketingAiFailure && e.code===expected)
    assert.equal(calls,1);checks++
  }
  for (const status of [429,503]) {
    let calls=0;let waited=0
    const result=await generateMarketingCopy(options,{fetch:async()=>++calls===1?new Response('{}',{status,headers:{'Retry-After':'1'}}):ok(),sleep:async ms=>{waited=ms}})
    assert.equal(calls,2);assert.equal(waited,1000);assert.equal(result.text,'Useful copy');checks++
  }
  let calls=0
  await assert.rejects(generateMarketingCopy(options,{fetch:async()=>{calls++;return new Response('{}',{status:429,headers:{'Retry-After':'60'}})}}))
  assert.equal(calls,1);checks++
  calls=0
  await assert.rejects(generateMarketingCopy(options,{fetch:async()=>{calls++;return new Response('{}',{status:503})},sleep:async()=>{}}))
  assert.equal(calls,2);checks++
  for (const body of ['not json','{}',JSON.stringify({choices:[{message:{content:'cut off'},finish_reason:'length'}]})]) {
    await assert.rejects(generateMarketingCopy(options,{fetch:async()=>new Response(body)}));checks++
  }
  await assert.rejects(generateMarketingCopy(options,{fetch:async()=>{throw new Error('secret provider detail')}}), (e:unknown)=>e instanceof MarketingAiFailure && !e.message.includes('secret'));checks++
  await assert.rejects(generateMarketingCopy(options,{timeoutMs:10,fetch:()=>new Promise<Response>(()=>{})}), (e:unknown)=>e instanceof MarketingAiFailure && e.code==='AI_TIMEOUT');checks++
  await assert.rejects(generateMarketingCopy({...options,apiKey:' '},{fetch:async()=>{throw new Error('Must not call')}}), (e:unknown)=>e instanceof MarketingAiFailure && e.code==='AI_NOT_CONFIGURED');checks++
  const failure=marketingAiFailureResponse(new MarketingAiFailure('AI_BILLING_REQUIRED','Billing required',503,'test-reference'))
  assert.equal(failure.body.reference,'test-reference');assert.match(failure.body.error,/test-reference/);checks++
  console.log(`PASS: ${checks} rebuilt-generator transport tests`)
}
main().catch(e=>{console.error(e);process.exitCode=1})
