import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { Wallet } from 'ethers';
import { createSprintRuntime, fixedScopeParameters } from '../../reference/owner-web/sprint-runtime.mjs';
import { SPRINT_DOCUMENTS, SPRINT_ALLOWED_ITEM_IDS } from '../../reference/owner-web/sprint-fixture.mjs';
import { createEncryptedGrantEnvelope } from '../../reference/owner-web/envelope.mjs';
import { createAgentBSession, openEnvelopeAndContinue } from '../../reference/agent-b/access.mjs';
import { contentCommitment } from '../../reference/shared/content-commitment.mjs';
import { projectDisclosure } from '../../src/projection.mjs';

const registryAddress = `0x${'66'.repeat(20)}`;
const assetId = `0x${'11'.repeat(32)}`;
const consentId = `0x${'22'.repeat(32)}`;
const blockHash = `0x${'77'.repeat(32)}`;
const uint = (number) => BigInt(number).toString(16).padStart(64, '0');
const address = (value) => value.slice(2).padStart(64, '0');

async function setup(options = {}) {
  const wallet = Wallet.createRandom();
  const params = await fixedScopeParameters(SPRINT_DOCUMENTS[0], SPRINT_ALLOWED_ITEM_IDS[0]);
  const state = { currentVersion: 1, revokedAt: 0, commitment: params.contentCommitment, returnedScope: params.scopeHash, chainId: '0x279f', malformed: false, fail: false, ownerReads: 0, rpcCalls: 0 };
  const server = createServer(async (request, response) => {
    const chunks = []; for await (const chunk of request) chunks.push(chunk);
    const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    state.rpcCalls += 1;
    if (state.ownerReads >= 1 && input.method === 'eth_chainId') {
      if (state.hangB) return;
      if (state.revokeBeforeB) state.revokedAt = 150;
    }
    if (state.fail) { response.writeHead(503); response.end('{}'); return; }
    let result;
    if (input.method === 'eth_chainId') result = state.chainId;
    else if (input.method === 'eth_blockNumber') result = '0x64';
    else if (input.method === 'eth_getBlockByNumber') result = { hash: blockHash };
    else if (input.method === 'eth_call') {
      if (input.params[0].data.startsWith('0x2cc3ce80')) {
        state.ownerReads += 1;
        result = state.malformed ? '0x' : `0x${address(wallet.address)}${state.commitment.slice(2)}${uint(state.currentVersion)}`;
      } else result = `0x${assetId.slice(2)}${address(wallet.address)}${state.returnedScope.slice(2)}${uint(1)}${uint(100)}${uint(0)}${uint(state.revokedAt)}`;
    }
    response.setHeader('content-type', 'application/json'); response.end(JSON.stringify({ jsonrpc: '2.0', id: input.id, result }));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const rpcUrl = `http://127.0.0.1:${server.address().port}`;
  let runtime;
  try { runtime = await createSprintRuntime({ rpcUrl, registryAddress, assetId, consentId, grantee: wallet.address, document: SPRINT_DOCUMENTS[0], allowedItemIds: SPRINT_ALLOWED_ITEM_IDS[0], ...options }); }
  catch (error) { await new Promise((resolve) => server.close(resolve)); throw error; }
  return {
    runtime, state, wallet,
    async call() { const challenge = await runtime.createChallenge(); return runtime.continueWithSignature({ declaration: challenge.declaration, signature: await wallet.signMessage(challenge.message) }); },
    async close() { await runtime.close(); server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); },
  };
}

test('fixed synthetic chain -> signed request -> independent B -> exact context, then stale/revoked zero downstream', async () => {
  const fixture = await setup();
  try {
    const active = await fixture.call();
    assert.equal(active.status, 'ACTIVE_CONTEXT_DELIVERED', JSON.stringify(active));
    assert.notEqual(active.ownerPid, active.agentPid);
    assert.equal(active.receipt.blockHash, blockHash);
    assert.equal(active.receipt.assetCommitment, fixture.runtime.publicParameters.contentCommitment);
    assert.equal(active.counters.delta.envelopeFetches, 1);
    assert.equal(active.counters.delta.envelopeReceived, 1);
    assert.equal(active.counters.delta.decryptSucceeded, 1);
    assert.equal(active.counters.delta.contextAssemblies, 1);
    assert.equal(active.counters.delta.controlledGatewayCalls, 1);
    assert.equal(active.realModelBehavior, 'NOT_MEASURED');
    assert.match(active.messages[1].content, /explain complex ideas briefly/);
    assert.doesNotMatch(JSON.stringify(active.messages), /Synthetic private note/);
    assert.equal(fixture.state.ownerReads, 2, 'Owner and B must separately query the chain');
    fixture.state.currentVersion = 2;
    const stale = await fixture.call();
    assert.equal(stale.receipt.outcome, 'VERSION_STALE');
    fixture.state.revokedAt = 150;
    const revoked = await fixture.call();
    assert.equal(revoked.receipt.outcome, 'REVOKED');
    for (const denied of [stale, revoked]) for (const name of ['envelopeFetches', 'envelopeReceived', 'decryptAttempts', 'contextAssemblies', 'controlledGatewayCalls']) assert.equal(denied.counters.delta[name], 0, name);
  } finally { await fixture.close(); }
});

for (const [name, patch, code] of [
  ['wrong commitment', { commitment: `0x${'88'.repeat(32)}` }, 'CHAIN_CONTENT_COMMITMENT_MISMATCH'],
  ['wrong scope', { returnedScope: `0x${'99'.repeat(32)}` }, 'SCOPE_MISMATCH'],
  ['wrong chain', { chainId: '0x1' }, 'CHAIN_ID_MISMATCH'],
  ['malformed RPC record', { malformed: true }, 'REGISTRY_READ_MALFORMED'],
  ['RPC unavailable', { fail: true }, 'CHAIN_UNAVAILABLE'],
]) test(`${name} fails before any envelope delivery`, async () => {
  const fixture = await setup();
  try {
    Object.assign(fixture.state, patch);
    const reply = await fixture.call();
    assert.equal(reply.status, 'DENIED');
    assert.equal(reply.code ?? reply.receipt.outcome, code);
    for (const stage of ['envelopeFetches', 'envelopeReceived', 'decryptAttempts', 'contextAssemblies', 'controlledGatewayCalls']) assert.equal(reply.counters.delta[stage], 0, stage);
  } finally { await fixture.close(); }
});

test('replaying a signed request cannot read chain or release a second envelope', async () => {
  const fixture = await setup();
  try {
    const challenge = await fixture.runtime.createChallenge();
    const signedRequest = { declaration: challenge.declaration, signature: await fixture.wallet.signMessage(challenge.message) };
    assert.equal((await fixture.runtime.continueWithSignature(signedRequest)).status, 'ACTIVE_CONTEXT_DELIVERED');
    const reply = await fixture.runtime.continueWithSignature(signedRequest);
    assert.equal(reply.code, 'REQUEST_NONCE_REPLAYED');
    for (const count of Object.values(reply.counters.delta)) assert.equal(count, 0);
  } finally { await fixture.close(); }
});

test('parallel submissions have isolated per-request counters and correct cumulative totals', async () => {
  const fixture = await setup();
  try {
    const challenges = await Promise.all([fixture.runtime.createChallenge(), fixture.runtime.createChallenge()]);
    const requests = await Promise.all(challenges.map(async (challenge) => ({ declaration: challenge.declaration, signature: await fixture.wallet.signMessage(challenge.message) })));
    const replies = await Promise.all(requests.map((request) => fixture.runtime.continueWithSignature(request)));
    for (const reply of replies) {
      assert.equal(reply.status, 'ACTIVE_CONTEXT_DELIVERED');
      for (const name of ['chainChecks', 'independentChainChecks', 'envelopeFetches', 'envelopeReceived', 'decryptAttempts', 'contextAssemblies', 'controlledGatewayCalls']) assert.equal(reply.counters.delta[name], 1, name);
    }
    assert.equal(replies[1].counters.totals.controlledGatewayCalls, 2);
  } finally { await fixture.close(); }
});

test('revocation between Owner and B checks is recorded as delivery=1 but no decryption/context/gateway', async () => {
  const fixture = await setup();
  try {
    fixture.state.revokeBeforeB = true;
    const reply = await fixture.call();
    assert.equal(reply.status, 'DENIED');
    assert.equal(reply.ownerReceipt.outcome, 'ACTIVE');
    assert.equal(reply.receipt.outcome, 'REVOKED');
    assert.equal(reply.counters.delta.envelopeFetches, 1);
    assert.equal(reply.counters.delta.envelopeReceived, 1);
    for (const name of ['decryptAttempts', 'contextAssemblies', 'controlledGatewayCalls']) assert.equal(reply.counters.delta[name], 0, name);
  } finally { await fixture.close(); }
});

test('IPC timeout is UNKNOWN, invalidates the session and never claims zero B counters', async () => {
  const fixture = await setup({ agentTimeoutMs: 1800 });
  try {
    fixture.state.hangB = true;
    const reply = await fixture.call();
    assert.equal(reply.status, 'UNKNOWN');
    assert.equal(reply.code, 'AGENT_PROCESS_TIMEOUT');
    assert.equal(reply.sessionInvalidated, true);
    assert.equal(reply.counters.delta.envelopeFetches, 1);
    assert.equal(reply.counters.delta.controlledGatewayCalls, 'NOT_MEASURED');
    await assert.rejects(fixture.runtime.createChallenge(), { code: 'SPRINT_SESSION_CLOSED' });
  } finally { await fixture.close(); }
});

test('full content commitment changes when only statement changes; B checks decrypted full content', async () => {
  const { disclosure } = projectDisclosure(SPRINT_DOCUMENTS[0], { allowedItemIds: SPRINT_ALLOWED_ITEM_IDS[0] });
  const changed = structuredClone(disclosure); changed.items[0].statement = 'A different statement with identical source metadata';
  assert.notEqual(contentCommitment(disclosure), contentCommitment(changed));
  const session = await createAgentBSession('agent-b:local');
  const envelope = await createEncryptedGrantEnvelope({ document: SPRINT_DOCUMENTS[0], allowedItemIds: SPRINT_ALLOWED_ITEM_IDS[0], consentId, grantee: session.grantee, agentPublicJwk: session.publicJwk });
  let calls = 0;
  const tampered = structuredClone(envelope); tampered.contentCommitment = contentCommitment(changed);
  await assert.rejects(openEnvelopeAndContinue({ envelope: tampered, session, requestedItemIds: SPRINT_ALLOWED_ITEM_IDS[0], modelGateway: async () => calls++ }), { code: 'CIPHERTEXT_INTEGRITY_FAILED' });
  assert.equal(calls, 0);
});
