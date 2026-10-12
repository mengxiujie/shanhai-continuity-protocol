import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { BRIEF_DOCUMENTS, BRIEF_ALLOWED_ITEM_IDS, BRIEF_SCENARIO } from '../../protocol/reference/owner-web/brief-fixture.mjs';
import { projectDisclosure } from '../../protocol/src/projection.mjs';
import { renderBriefAnnouncement } from '../../protocol/reference/agent-b/brief-announcement.mjs';

// Exercise the actual inline UI controller with simulated wallet/API responses.
// These tests are UI-state evidence, not real wallet, browser or chain execution.
async function setup() {
  const html = await readFile(new URL('../wallet-workbench.html', import.meta.url), 'utf8');
  const elements = new Map([...html.matchAll(/id="([^"]+)"/g)].map((match) => [match[1], { textContent: '', disabled: true, hidden: false, value: '' }]));
  const get = (id) => elements.get(id);
  const state = { version: 1, grantedV1: false, grantedV2: false, revokedV2: false, cancelSignature: false, preparedAction: null };
  const account = `0x${'11'.repeat(20)}`;
  const config = { token: '0'.repeat(64), parameters: {}, receipts: [], configuration: null, scenario: BRIEF_SCENARIO,
    recommendedRegistryAddress: `0x${'22'.repeat(20)}` };
  const fetch = async (path, options = {}) => {
    const input = options.body ? JSON.parse(options.body) : {};
    let output;
    if (path === '/api/config') output = config;
    else if (path === '/api/configure') { config.configuration = { account }; output = config; }
    else if (path === '/api/prepare') { state.preparedAction = input.action; output = { preparedId: input.action, transaction: { data: input.action } }; }
    else if (path === '/api/receipt') {
      const action = state.preparedAction;
      if (action === 'issueConsent') state.grantedV1 = true;
      if (action === 'publishVersion') state.version = 2;
      if (action === 'issueConsentV2') state.grantedV2 = true;
      if (action === 'revokeConsentV2') state.revokedV2 = true;
      output = { action, status: 'CONFIRMED_ON_TESTNET', txHash: input.txHash };
      config.receipts.push(output);
    } else if (path.startsWith('/api/request-challenge')) output = { message: 'test-only declaration', declaration: {} };
    else if (path.startsWith('/api/continue')) {
      const version = path.endsWith('-v2') ? 2 : 1;
      const outcome = version === 1 && state.version === 2 ? 'VERSION_STALE' : version === 2 && state.revokedV2 ? 'REVOKED' :
        (version === 1 ? state.grantedV1 : state.grantedV2) ? 'ACTIVE' : 'NOT_FOUND';
      output = { status: outcome === 'ACTIVE' ? 'ACTIVE_CONTEXT_DELIVERED' : 'DENIED', receipt: { outcome, version } };
      if (outcome === 'ACTIVE') {
        const { disclosure } = projectDisclosure(BRIEF_DOCUMENTS[version - 1], { allowedItemIds: BRIEF_ALLOWED_ITEM_IDS[version - 1] });
        output.result = { announcement: renderBriefAnnouncement(disclosure) }; output.messages = [{ role: 'user', content: disclosure.items[0].statement }];
      }
    } else throw new Error(`UNEXPECTED_PATH:${path}`);
    return { ok: true, async json() { return structuredClone(output); } };
  };
  const ethereum = { on() {}, async request({ method }) {
    if (method === 'eth_chainId') return '0x279f';
    if (['eth_accounts', 'eth_requestAccounts'].includes(method)) return [account];
    if (method === 'eth_estimateGas') return '0x10000';
    if (method === 'eth_sendTransaction') return `0x${'33'.repeat(32)}`;
    if (method === 'personal_sign') { if (state.cancelSignature) throw new Error('TEST_SIGNATURE_CANCELLED'); return `0x${'44'.repeat(65)}`; }
    throw new Error(`UNEXPECTED_WALLET_METHOD:${method}`);
  } };
  runInNewContext(html.match(/<script nonce="__CSP_NONCE__">([\s\S]*?)<\/script>/)[1], {
    document: { getElementById: get }, window: { ethereum }, fetch, AbortSignal, TextEncoder, setTimeout, Blob, URL, console,
  });
  await new Promise((resolve) => setImmediate(resolve));
  const click = async (id) => { assert.equal(get(id).disabled, false, `${id} must be enabled before this step`); await get(id).onclick(); };
  await click('connect'); await click('configure');
  return { get, state, click };
}

test('actual UI controller guides all four results and removes obsolete announcement on denial', async () => {
  const h = await setup();
  assert.equal(h.get('deploy').hidden, true, 'reuse the existing registry by default');
  assert.equal(h.get('issueV2').disabled, true);
  await h.click('register'); await h.click('issue'); await h.click('continue');
  assert.equal(h.get('brief-output').hidden, false);
  assert.match(h.get('announcement').textContent, /Friday, 19:00/);
  await h.click('publish');
  assert.equal(h.get('brief-output').hidden, true);
  assert.equal(h.get('issueV2').disabled, true, 'collect stale evidence before the new grant');
  await h.click('continue');
  assert.match(h.get('result-summary').textContent, /VERSION_STALE/);
  assert.equal(h.get('announcement').textContent, '');
  await h.click('issueV2'); await h.click('continueV2');
  assert.match(h.get('announcement').textContent, /Saturday, 15:00/);
  assert.doesNotMatch(h.get('received-context').textContent, /INTERNAL_NOTE|free admission/);
  await h.click('revoke'); await h.click('continueV2');
  assert.match(h.get('result-summary').textContent, /REVOKED/);
  assert.equal(h.get('brief-output').hidden, true);
  assert.equal(h.get('announcement').textContent, '');
  assert.match(h.get('next-step').textContent, /四种结果已收集/);
});

test('cancelled signature clears the previous successful artifact and reports this operation incomplete', async () => {
  const h = await setup();
  await h.click('register'); await h.click('issue'); await h.click('continue');
  assert.match(h.get('announcement').textContent, /Friday/);
  h.state.cancelSignature = true; await h.click('continue');
  assert.equal(h.get('brief-output').hidden, true);
  assert.equal(h.get('announcement').textContent, '');
  assert.match(h.get('result').textContent, /NOT_COMPLETED/);
  assert.doesNotMatch(h.get('result').textContent, /ACTIVE_CONTEXT_DELIVERED/);
});
