import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { request as httpRequest } from 'node:http';
import { createWalletWorkbench, loadRegistryArtifact } from '../wallet-workbench.mjs';

const account = `0x${'11'.repeat(20)}`;
const registryAddress = `0x${'22'.repeat(20)}`;
const txHash = `0x${'33'.repeat(32)}`;
const signature = `0x${'44'.repeat(65)}`;

async function harness(t, overrides = {}) {
  const artifact = await loadRegistryArtifact();
  const calls = []; const runtimeCalls = []; const state = { chainId: '0x279f', code: artifact.runtime, receipt: null, transaction: null };
  const runtime = {
    agentPid: 12345, agentKeyFingerprint: 'PUBLIC_TEST_FINGERPRINT',
    async createChallenge() { runtimeCalls.push('challenge'); return { declaration: { nonce: 'test-nonce' }, message: 'fixed test request' }; },
    async continueWithSignature(input) { runtimeCalls.push(input); return { status: 'DENIED', receipt: { outcome: 'VERSION_STALE' }, counters: { delta: { envelopeFetches: 0 } }, realModelBehavior: 'NOT_MEASURED' }; },
    async close() { runtimeCalls.push('close'); },
  };
  const rpcCall = async (method, params) => {
    calls.push({ method, params });
    if (method === 'eth_chainId') return state.chainId;
    if (method === 'eth_getCode') return state.code;
    if (method === 'eth_getTransactionReceipt') return state.receipt;
    if (method === 'eth_getTransactionByHash') return state.transaction;
    throw new Error('UNEXPECTED_RPC_METHOD');
  };
  const workbench = await createWalletWorkbench({ rpcCall, runtimeFactory: async (configuration) => { runtimeCalls.push(configuration); return runtime; }, ...overrides });
  const { url } = await workbench.start();
  t.after(() => workbench.close());
  const config = await (await fetch(`${url}/api/config`)).json();
  const post = async (path, body, headers = {}) => {
    const response = await fetch(`${url}${path}`, { method: 'POST', headers: { origin: url, 'content-type': 'application/json', 'x-workbench-token': config.token, ...headers }, body: typeof body === 'string' ? body : JSON.stringify(body) });
    return { status: response.status, body: await response.json(), headers: response.headers };
  };
  const configure = () => post('/api/configure', { account, registryAddress });
  return { workbench, url, config, post, configure, calls, runtimeCalls, state, artifact };
}

test('compiled artifact is loaded with exact ABI and runtime', async () => {
  const artifact = await loadRegistryArtifact();
  assert.match(artifact.compiler, /^0\.8\.30\+/);
  assert.equal(artifact.abi.getFunction('registerAsset').selector, '0xafbeafc9');
  assert.ok(artifact.creation.length > artifact.runtime.length);
});

test('loopback startup returns only public fixed synthetic configuration; no RPC or wallet mutation', async (t) => {
  const h = await harness(t);
  assert.equal(h.workbench.server.address().address, '127.0.0.1');
  assert.equal(h.config.chainId, 10143);
  assert.equal(h.config.configuration, null);
  assert.equal(h.config.realModelBehavior, 'NOT_MEASURED');
  assert.equal(h.calls.length, 0);
  const page = await fetch(h.url); const html = await page.text();
  assert.equal(page.status, 200);
  assert.match(page.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  assert.equal(page.headers.get('access-control-allow-origin'), null);
  assert.match(html, /not接|不接真实模型/);
  assert.doesNotMatch(html, /__CSP_NONCE__/);
  assert.doesNotMatch(html, /localStorage|sessionStorage|privateKey|eth_sendRawTransaction/);
});

test('forged Host, cross Origin and cross-site requests are rejected before RPC', async (t) => {
  const h = await harness(t);
  const badHostStatus = await new Promise((resolve, reject) => {
    const request = httpRequest(`${h.url}/api/config`, { headers: { host: 'attacker.test' } }, (response) => { response.resume(); resolve(response.statusCode); });
    request.on('error', reject); request.end();
  });
  assert.equal(badHostStatus, 403);
  const badOrigin = await h.post('/api/prepare', { action: 'deploy', account }, { origin: 'https://attacker.test' });
  assert.equal(badOrigin.body.code, 'ORIGIN_REJECTED');
  const badSite = await h.post('/api/prepare', { action: 'deploy', account }, { 'sec-fetch-site': 'cross-site' });
  assert.equal(badSite.body.code, 'FETCH_SITE_REJECTED');
  assert.equal(h.calls.length, 0);
});

test('POST requires exact Origin and per-session token', async (t) => {
  const h = await harness(t);
  const noOrigin = await h.post('/api/prepare', { action: 'deploy', account }, { origin: '' });
  assert.equal(noOrigin.body.code, 'ORIGIN_REQUIRED');
  const noToken = await h.post('/api/prepare', { action: 'deploy', account }, { 'x-workbench-token': '' });
  assert.equal(noToken.body.code, 'REQUEST_TOKEN_REQUIRED');
  assert.equal(h.calls.length, 0);
});

test('unknown routes, extra fields, malformed/oversized bodies cannot become arbitrary RPC proxy', async (t) => {
  const h = await harness(t);
  assert.equal((await h.post('/api/rpc', { method: 'eth_sendTransaction' })).status, 404);
  assert.equal((await h.post('/api/prepare?rpc=https://attacker.test', { action: 'deploy', account })).status, 404);
  assert.equal((await h.post('/api/prepare', { action: 'deploy', account, rpcUrl: 'https://attacker.test' })).body.code, 'INVALID_REQUEST_FIELDS');
  assert.equal((await h.post('/api/prepare', '{bad json')).body.code, 'INVALID_JSON');
  assert.equal((await h.post('/api/prepare', JSON.stringify({ action: 'x'.repeat(35000), account }))).status, 413);
  assert.equal(h.calls.length, 0);
});

test('deploy preparation includes bytecode and zero value but never sends a transaction', async (t) => {
  const h = await harness(t);
  const response = await h.post('/api/prepare', { action: 'deploy', account });
  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'TRANSACTION_PREPARED_NOT_SENT');
  assert.equal(response.body.transaction.data, h.artifact.creation);
  assert.equal(response.body.transaction.value, '0x0');
  assert.equal(response.body.transaction.from, account);
  assert.equal(response.body.transaction.to, undefined);
  assert.deepEqual(h.calls.map((entry) => entry.method), ['eth_chainId']);
});

test('wrong network and wrong registry bytecode fail closed before runtime initialization', async (t) => {
  const h = await harness(t);
  h.state.chainId = '0x1';
  assert.equal((await h.configure()).body.code, 'CHAIN_ID_MISMATCH');
  h.state.chainId = '0x279f'; h.state.code = '0x';
  assert.equal((await h.configure()).body.code, 'CONTRACT_CODE_EMPTY');
  h.state.code = '0x6000';
  assert.equal((await h.configure()).body.code, 'RUNTIME_BYTECODE_MISMATCH');
  assert.equal(h.runtimeCalls.length, 0);
});

test('non-deployment actions require verified registry and current account; nonce signing is delegated only after configuration', async (t) => {
  const h = await harness(t);
  assert.equal((await h.post('/api/prepare', { action: 'registerAsset', account })).body.code, 'VERIFIED_CONFIGURATION_REQUIRED');
  assert.equal((await h.post('/api/request-challenge', {})).body.code, 'VERIFIED_CONFIGURATION_REQUIRED');
  const configured = await h.configure();
  assert.equal(configured.body.configuration.status, 'RUNTIME_BYTECODE_VERIFIED');
  assert.equal(h.runtimeCalls[0].domain, '127.0.0.1');
  assert.equal(h.runtimeCalls[0].grantee, account);
  const challenge = await h.post('/api/request-challenge', {});
  assert.equal(challenge.body.message, 'fixed test request');
  const continued = await h.post('/api/continue', { declaration: challenge.body.declaration, signature });
  assert.equal(continued.body.status, 'DENIED');
  assert.equal(continued.body.counters.delta.envelopeFetches, 0);
  assert.equal((await h.post('/api/prepare', { action: 'registerAsset', account: registryAddress })).body.code, 'VERIFIED_CONFIGURATION_REQUIRED');
});

test('register / issue / version / revoke use fixed ABI parameters, not browser-defined scope or version', async (t) => {
  const h = await harness(t); await h.configure();
  for (const action of ['registerAsset', 'issueConsent', 'publishVersion', 'revokeConsent']) {
    const response = await h.post('/api/prepare', { action, account });
    assert.equal(response.status, 200);
    const decoded = h.artifact.abi.parseTransaction(response.body.transaction);
    assert.equal(decoded.name, action);
    assert.equal(response.body.transaction.to, registryAddress);
    if (action === 'registerAsset') assert.equal(decoded.args[1], h.config.parameters.contentCommitmentV1);
    if (action === 'issueConsent') { assert.equal(decoded.args[2], account); assert.equal(decoded.args[3], h.config.parameters.scopeHash); assert.equal(decoded.args[4], 1n); }
    if (action === 'publishVersion') { assert.equal(decoded.args[1], 1n); assert.equal(decoded.args[2], h.config.parameters.contentCommitmentV2); }
  }
  assert.equal((await h.post('/api/prepare', { action: 'issueConsent', account, version: 2 })).body.code, 'INVALID_REQUEST_FIELDS');
  assert.equal(h.calls.some(({ method }) => method.startsWith('eth_send')), false);
});

test('a changed runtime code blocks preparation even after an earlier successful configuration', async (t) => {
  const h = await harness(t); await h.configure(); h.state.code = '0x6000';
  assert.equal((await h.post('/api/prepare', { action: 'registerAsset', account })).body.code, 'RUNTIME_BYTECODE_MISMATCH');
});

test('pending and failed transaction receipts are not reported as success', async (t) => {
  const h = await harness(t);
  const prepared = (await h.post('/api/prepare', { action: 'deploy', account })).body;
  const input = { preparedId: prepared.preparedId, txHash };
  assert.equal((await h.post('/api/receipt', input)).body.status, 'PENDING_NOT_CONFIRMED');
  h.state.transaction = { from: account, to: null, input: prepared.transaction.data, value: '0x0' };
  h.state.receipt = { status: '0x0', blockNumber: '0x1', blockHash: txHash, contractAddress: null, gasUsed: '0x1' };
  assert.equal((await h.post('/api/receipt', input)).body.status, 'TRANSACTION_FAILED');
});

test('confirmed deployment receipt must bind sender / data / zero value and match deployed bytecode', async (t) => {
  const h = await harness(t);
  const prepared = (await h.post('/api/prepare', { action: 'deploy', account })).body;
  h.state.transaction = { from: account, to: null, input: prepared.transaction.data, value: '0x0' };
  h.state.receipt = { status: '0x1', blockNumber: '0x9', blockHash: txHash, contractAddress: registryAddress, gasUsed: '0x888' };
  const input = { preparedId: prepared.preparedId, txHash };
  const confirmed = await h.post('/api/receipt', input);
  assert.equal(confirmed.body.status, 'CONFIRMED_ON_TESTNET');
  assert.equal(confirmed.body.codeVerification.status, 'RUNTIME_BYTECODE_VERIFIED');
  h.state.transaction.from = registryAddress;
  assert.equal((await h.post('/api/receipt', input)).body.code, 'TRANSACTION_BINDING_MISMATCH');
});

test('runtime parameters mismatch is rejected and candidate process closed', async (t) => {
  let closed = false;
  const h = await harness(t, { runtimeFactory: async () => ({ publicParameters: { version: 2 }, async close() { closed = true; } }) });
  assert.equal((await h.configure()).body.code, 'RUNTIME_PARAMETERS_MISMATCH');
  assert.equal(closed, true);
  assert.equal((await h.post('/api/request-challenge', {})).body.code, 'VERIFIED_CONFIGURATION_REQUIRED');
});

test('frontend transaction and request signatures are click-only and use no raw private-key signing', async () => {
  const page = await readFile(new URL('../wallet-workbench.html', import.meta.url), 'utf8');
  assert.match(page, /eth_requestAccounts/);
  assert.match(page, /wallet_switchEthereumChain/);
  assert.match(page, /eth_sendTransaction/);
  assert.match(page, /personal_sign/);
  assert.match(page, /TRANSACTION_FAILED/);
  assert.match(page, /NOT_MEASURED/);
  assert.doesNotMatch(page, /eth_sendRawTransaction|Wallet\(|privateKey|localStorage|sessionStorage/);
});

test('brief workbench builds separate fixed V2 grant/revoke and initializes two version-bound recipients', async (t) => {
  const h = await harness(t, { scenario: 'brief' });
  assert.equal(h.config.scenario.id, 'CLIENT_BRIEF_HANDOFF');
  assert.notEqual(h.config.parameters.consentId, h.config.parameters.consentIdV2);
  assert.notEqual(h.config.parameters.scopeHash, h.config.parameters.scopeHashV2);
  assert.equal(h.calls.length, 0, 'startup does not submit or read chain');
  await h.configure();
  const configurations = h.runtimeCalls.filter((entry) => typeof entry === 'object' && entry.document);
  assert.deepEqual(configurations.map((entry) => entry.document.version), [1, 2]);
  assert.deepEqual(configurations.map((entry) => entry.consentId), [h.config.parameters.consentId, h.config.parameters.consentIdV2]);
  assert.ok(configurations.every((entry) => entry.outputMode === 'BRIEF_TEMPLATE'));
  const grant = (await h.post('/api/prepare', { action: 'issueConsentV2', account })).body;
  const decoded = h.artifact.abi.parseTransaction(grant.transaction);
  assert.equal(decoded.name, 'issueConsent');
  assert.equal(decoded.args[0], h.config.parameters.consentIdV2);
  assert.equal(decoded.args[3], h.config.parameters.scopeHashV2);
  assert.equal(decoded.args[4], 2n);
  const revoke = (await h.post('/api/prepare', { action: 'revokeConsentV2', account })).body;
  assert.equal(h.artifact.abi.parseTransaction(revoke.transaction).args[0], h.config.parameters.consentIdV2);
  assert.equal((await h.post('/api/prepare', { action: 'issueConsentV2', account, version: 1 })).body.code, 'INVALID_REQUEST_FIELDS');
  assert.equal((await h.post('/api/request-challenge-v2', {})).status, 200);
  assert.equal((await h.post('/api/continue-v2', { declaration: { nonce: 'test-nonce' }, signature })).body.status, 'DENIED');
  assert.equal(h.calls.some(({ method }) => method.startsWith('eth_send')), false);
});

test('brief V2 configuration failure closes both candidates and leaves no usable previous configuration', async (t) => {
  const versionsClosed = [];
  const h = await harness(t, { scenario: 'brief', runtimeFactory: async ({ document }) => ({
    publicParameters: document.version === 2 ? { version: 1 } : undefined,
    async close() { versionsClosed.push(document.version); },
  }) });
  assert.equal((await h.configure()).body.code, 'RUNTIME_PARAMETERS_MISMATCH');
  assert.deepEqual(versionsClosed.sort(), [1, 2]);
  assert.equal((await h.post('/api/request-challenge-v2', {})).body.code, 'VERIFIED_CONFIGURATION_REQUIRED');
});

test('legacy preference endpoint cannot request the new scenario grant or V2 runtime', async (t) => {
  const h = await harness(t); await h.configure();
  assert.equal((await h.post('/api/prepare', { action: 'issueConsentV2', account })).body.code, 'ACTION_OR_ACCOUNT_INVALID');
  assert.equal((await h.post('/api/request-challenge-v2', {})).status, 404);
});
