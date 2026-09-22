import test from 'node:test';
import assert from 'node:assert/strict';
import { MonadConsentRegistryAdapter } from '../monad-gate.js';
import { MonadJsonRpcClient, MonadConsentRegistryRpcProvider } from '../monad-rpc-provider.js';
import { releaseEnvelopeAfterMonad } from '../envelope-gate.js';

const assetId = `0x${'11'.repeat(32)}`;
const consentId = `0x${'22'.repeat(32)}`;
const scopeHash = `0x${'33'.repeat(32)}`;
const commitment = `0x${'44'.repeat(32)}`;
const grantee = `0x${'55'.repeat(20)}`;
const registryAddress = `0x${'66'.repeat(20)}`;
const addressWord = (address) => address.slice(2).padStart(64, '0');
const uintWord = (value) => BigInt(value).toString(16).padStart(64, '0');

function rpcFetch({ currentVersion = 1, consentVersion = 1, revokedAt = 0, returnedScope = scopeHash } = {}) {
  return async (_url, init) => {
    const request = JSON.parse(init.body);
    let result;
    if (request.method === 'eth_chainId') result = '0x279f';
    else if (request.method === 'eth_blockNumber') result = '0x64';
    else if (request.method === 'eth_getBlockByNumber') result = { hash: `0x${'77'.repeat(32)}` };
    else if (request.method === 'eth_call') {
      const selector = request.params[0].data.slice(0, 10);
      if (selector === '0x2cc3ce80') result = `0x${addressWord(grantee)}${commitment.slice(2)}${uintWord(currentVersion)}`;
      else result = `0x${assetId.slice(2)}${addressWord(grantee)}${returnedScope.slice(2)}${uintWord(consentVersion)}${uintWord(100)}${uintWord(0)}${uintWord(revokedAt)}`;
    }
    return { ok: true, async json() { return { jsonrpc: '2.0', id: request.id, result }; } };
  };
}

function makeGate(options) {
  const rpc = new MonadJsonRpcClient({ fetchImpl: rpcFetch(options) });
  const provider = new MonadConsentRegistryRpcProvider({ registryAddress, rpc, selectors: { getAsset: '0x2cc3ce80', getConsent: '0x7715ae34' } });
  return new MonadConsentRegistryAdapter({ chainId: 10143, registryAddress, provider });
}

const input = { assetId, consentId, grantee, version: 1, scopeHash, now: 200 };

test('ACTIVE receipt is read at one Monad block before exact envelope fetch', async () => {
  let fetches = 0;
  const result = await releaseEnvelopeAfterMonad({ gate: makeGate(), verifyInput: input, envelopeStore: { async fetchExact() { fetches += 1; return { ciphertext: 'synthetic' }; } } });
  assert.equal(result.receipt.outcome, 'ACTIVE');
  assert.equal(result.receipt.blockNumber, 100);
  assert.match(result.receipt.blockHash, /^0x77/);
  assert.equal(fetches, 1);
  assert.deepEqual(result.envelope, { ciphertext: 'synthetic' });
});

for (const [name, options, outcome] of [
  ['stale version', { currentVersion: 2 }, 'VERSION_STALE'],
  ['revoked consent', { revokedAt: 150 }, 'REVOKED'],
  ['scope mismatch', { returnedScope: `0x${'99'.repeat(32)}` }, 'SCOPE_MISMATCH'],
]) test(`${name} returns no envelope`, async () => {
  let fetches = 0;
  const result = await releaseEnvelopeAfterMonad({ gate: makeGate(options), verifyInput: input, envelopeStore: { async fetchExact() { fetches += 1; return {}; } } });
  assert.equal(result.receipt.outcome, outcome);
  assert.equal(result.envelope, null);
  assert.equal(fetches, 0);
});

test('wrong chain fails closed before registry reads', async () => {
  const rpc = new MonadJsonRpcClient({ fetchImpl: async (_url, init) => ({ ok: true, async json() { const req = JSON.parse(init.body); return { jsonrpc: '2.0', id: req.id, result: '0x1' }; } }) });
  const provider = new MonadConsentRegistryRpcProvider({ registryAddress, rpc, selectors: { getAsset: '0x2cc3ce80', getConsent: '0x7715ae34' } });
  const gate = new MonadConsentRegistryAdapter({ chainId: 10143, registryAddress, provider });
  await assert.rejects(gate.verify(input), { code: 'CHAIN_ID_MISMATCH' });
});
