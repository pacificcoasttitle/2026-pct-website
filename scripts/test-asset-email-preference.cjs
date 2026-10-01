// Offline regression checks: no database, network, or real email calls.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const path = require('node:path')
const root = path.resolve(__dirname, '..')

function load(relative, mocks, suffix = '') {
  const source = fs.readFileSync(path.join(root, relative), 'utf8') + suffix
  const js = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  } }).outputText
  const exports = {}
  vm.runInNewContext(js, { exports, require: name => {
    if (name in mocks) return mocks[name]
    // Imports not used by these isolated workers are inert.
    return {}
  }, console, process: { env: {} }, Buffer, Date, Map, Set })
  return exports
}

async function main() {
  let preferences, sent, updates, downloads
  const worker = load('app/api/admin/marketing/asset-delivery/[batchId]/send/route.ts', {
    zod: require('zod'),
    '@/lib/admin-db': {
      createAssetDeliverySend: async () => ({ id: 1 }),
      updateAssetDeliverySend: async (_id, value) => updates.push(value),
      getRepAssetEmailEnabled: async () => preferences.shift(),
    },
    '@/lib/r2-upload': { downloadFromR2: async () => { downloads++; return Buffer.from('test') } },
    '@/lib/email-templates/asset-delivery': {
      ASSET_DELIVERY_DEFAULTS: {}, renderAssetDeliveryHtml: () => '<p>Test</p>',
    },
  }, '\nexport { sendOneRep };').sendOneRep
  const rep = { id: 23, first_name: 'Test', full_name: 'Test Rep', email: 'test@example.invalid' }
  const files = [{ file_size_bytes: 4, r2_key: 'test', original_filename: 'C-23.pdf' }]
  const context = { batchId: 'test', campaignName: 'Test', emailSubject: 'Test',
    openaiKey: null, sg: { send: async () => { sent++; return [{ headers: {} }] } }, isTest: false }
  for (const [values, expected, expectedSends, expectedDownloads] of [
    [[false], 'skipped', 0, 0],
    [[true, true], 'sent', 1, 1],
    [[true, false], 'skipped', 0, 1],
    [[null], 'skipped', 0, 0],
  ]) {
    preferences = [...values]; sent = 0; updates = []; downloads = 0
    const result = await worker(rep, files, context)
    assert.equal(result.status, expected)
    assert.equal(sent, expectedSends)
    assert.equal(downloads, expectedDownloads)
    assert.equal(updates.at(-1).send_status, expected)
    if (expected === 'skipped') assert.equal(updates.at(-1).error_message, 'Marketing-piece emails disabled')
  }
  console.log('PASS: disabled, enabled, disabled during preparation, missing rep; no live sends.')
}
main().catch(error => { console.error(error); process.exitCode = 1 })
