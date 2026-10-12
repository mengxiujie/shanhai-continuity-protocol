// Local developer example: real protocol code, MOCK registry state. Not chain proof.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { AbiCoder, Wallet } from 'ethers';
import { createSprintRuntime, fixedScopeParameters, REGISTRY_SELECTORS } from '../protocol/reference/owner-web/sprint-runtime.mjs';
import { BRIEF_DOCUMENTS, BRIEF_ALLOWED_ITEM_IDS } from '../protocol/reference/owner-web/brief-fixture.mjs';

const signer = Wallet.createRandom(); // Ephemeral synthetic identity; never exported or funded.
const registryAddress = `0x${'66'.repeat(20)}`;
const assetId = `0x${'11'.repeat(32)}`;
const consentIds = ['22', '33'].map((byte) => `0x${byte.repeat(32)}`);
const parameters = await Promise.all(BRIEF_DOCUMENTS.map((doc, i) => fixedScopeParameters(doc, BRIEF_ALLOWED_ITEM_IDS[i])));
const abi = AbiCoder.defaultAbiCoder();
const state = { version: 1, grants: new Map() };
const runtimes = [];
const downstream = ['envelopeFetches', 'envelopeReceived', 'independentChainChecks', 'decryptAttempts', 'decryptSucceeded', 'contextAssemblies', 'controlledGatewayCalls'];

// Test transport only: implements the four read methods consumed by the existing adapter.
// State changes below are mock fixture mutations, NOT calls to ConsentRegistry.sol.
function mockRpc(input) {
  if (input.method === 'eth_chainId') return '0x279f';
  if (input.method === 'eth_blockNumber') return '0x64';
  if (input.method === 'eth_getBlockByNumber') return { hash: `0x${'77'.repeat(32)}` };
  assert.equal(input.method, 'eth_call', 'Only read methods are supported');
  const call = input.params[0];
  assert.equal(call.to.toLowerCase(), registryAddress);
  const selector = call.data.slice(0, 10);
  const id = `0x${call.data.slice(10)}`;
  if (selector === REGISTRY_SELECTORS.getAsset) {
    assert.equal(id, assetId);
    return abi.encode(['address', 'bytes32', 'uint32'], [signer.address, parameters[state.version - 1].contentCommitment, state.version]);
  }
  assert.equal(selector, REGISTRY_SELECTORS.getConsent);
  const grant = state.grants.get(id);
  assert.ok(grant, 'Mock grant not approved');
  return abi.encode(
    ['bytes32', 'address', 'bytes32', 'uint32', 'uint64', 'uint64', 'uint64'],
    [assetId, signer.address, parameters[grant.version - 1].scopeHash, grant.version, 100, 0, grant.revokedAt],
  );
}
const server = createServer(async (request, response) => {
  let input;
  try {
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify({ jsonrpc: '2.0', id: input.id, result: mockRpc(input) }));
  } catch {
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify({ jsonrpc: '2.0', id: input?.id ?? null, error: { code: -32602, message: 'Unsupported mock request' } }));
  }
});
await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
const rpcUrl = `http://127.0.0.1:${server.address().port}`;

async function approveAndOpen(version) {
  const i = version - 1;
  state.grants.set(consentIds[i], { version, revokedAt: 0 });
  const runtime = await createSprintRuntime({
    rpcUrl, registryAddress, assetId, consentId: consentIds[i], grantee: signer.address,
    document: BRIEF_DOCUMENTS[i], allowedItemIds: BRIEF_ALLOWED_ITEM_IDS[i], outputMode: 'BRIEF_TEMPLATE',
  });
  runtimes.push(runtime);
  return runtime;
}

// Integration seam: request one authorized handoff; consume only the returned result.
async function requestBrief(runtime) {
  const challenge = await runtime.createChallenge();
  return runtime.continueWithSignature({ declaration: challenge.declaration, signature: await signer.signMessage(challenge.message) });
}
function consumeApproved(reply, version, schedule) {
  assert.equal(reply.status, 'ACTIVE_CONTEXT_DELIVERED', JSON.stringify(reply));
  assert.equal(reply.receipt.outcome, 'ACTIVE');
  assert.notEqual(reply.ownerPid, reply.agentPid);
  const announcement = reply.result.announcement;
  assert.equal(announcement.sourceVersion, version);
  assert.equal(announcement.receivedFields.schedule, schedule);
  assert.deepEqual(announcement.receivedItemIds, BRIEF_ALLOWED_ITEM_IDS[version - 1]);
  assert.doesNotMatch(JSON.stringify([reply.messages, announcement]), /SYNTHETIC_INTERNAL_NOTE|SYNTHETIC_UNAPPROVED_SUGGESTION|free admission/);
  for (const key of downstream) assert.equal(reply.counters.delta[key], 1, key);
  assert.equal(reply.realModelBehavior, 'NOT_MEASURED');
  console.log(`v${version} approved: ACTIVE | ${announcement.receivedFields.schedule} | ${announcement.receivedFields.venue}`);
}
function assertDenied(reply, outcome) {
  assert.equal(reply.status, 'DENIED', JSON.stringify(reply));
  assert.equal(reply.receipt.outcome, outcome);
  assert.equal(reply.counters.delta.chainChecks, 1);
  for (const key of downstream) assert.equal(reply.counters.delta[key], 0, key);
  assert.equal(reply.result, undefined, 'Denied handoffs have no new application result');
  console.log(`${outcome} | new downstream work=0`);
}

try {
  console.log('LOCAL MOCK ONLY: no Monad RPC, wallet extension, chain writes, or AI model.');
  const v1 = await approveAndOpen(1);
  consumeApproved(await requestBrief(v1), 1, 'Friday, 19:00');
  state.version = 2; // Mock publication invalidates the old grant; it does not approve v2.
  assertDenied(await requestBrief(v1), 'VERSION_STALE');
  const v2 = await approveAndOpen(2); // Separate mock approval and new recipient session.
  consumeApproved(await requestBrief(v2), 2, 'Saturday, 15:00');
  state.grants.get(consentIds[1]).revokedAt = 150;
  assertDenied(await requestBrief(v2), 'REVOKED');
  console.log('PASS 4/4 local mock lifecycle outcomes.');
  console.log('This tests the integration seam, not Solidity execution, live-chain evidence, or external adoption.');
} finally {
  await Promise.allSettled(runtimes.map((runtime) => runtime.close()));
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
}
