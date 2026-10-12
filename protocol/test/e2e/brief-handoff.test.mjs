import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { Wallet } from 'ethers';
import { createSprintRuntime, fixedScopeParameters } from '../../reference/owner-web/sprint-runtime.mjs';
import { BRIEF_DOCUMENTS, BRIEF_ALLOWED_ITEM_IDS } from '../../reference/owner-web/brief-fixture.mjs';
import { projectDisclosure } from '../../src/projection.mjs';
import { renderBriefAnnouncement } from '../../reference/agent-b/brief-announcement.mjs';

const registryAddress = `0x${'66'.repeat(20)}`;
const assetId = `0x${'31'.repeat(32)}`;
const consentIds = [`0x${'41'.repeat(32)}`, `0x${'42'.repeat(32)}`];
const blockHash = `0x${'77'.repeat(32)}`;
const uint = (value) => BigInt(value).toString(16).padStart(64, '0');
const addressWord = (value) => value.slice(2).toLowerCase().padStart(64, '0');
const downstream = ['envelopeFetches', 'envelopeReceived', 'decryptAttempts', 'decryptSucceeded', 'contextAssemblies', 'controlledGatewayCalls'];

async function setup(t) {
  // Generated in memory for a local test; never emitted or written to disk.
  const owner = Wallet.createRandom(); const recipient = Wallet.createRandom();
  const parameters = await Promise.all(BRIEF_DOCUMENTS.map((document, i) => fixedScopeParameters(document, BRIEF_ALLOWED_ITEM_IDS[i])));
  const state = { version: 1, commitment: parameters[0].contentCommitment, consents: new Map(), assetReads: 0 };
  const server = createServer(async (request, response) => {
    const chunks = []; for await (const chunk of request) chunks.push(chunk);
    const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    let result;
    if (input.method === 'eth_chainId') result = '0x279f';
    else if (input.method === 'eth_blockNumber') result = '0x64';
    else if (input.method === 'eth_getBlockByNumber') result = { hash: blockHash };
    else if (input.method === 'eth_call') {
      const data = input.params[0].data;
      if (data.startsWith('0x2cc3ce80')) {
        state.assetReads++;
        result = `0x${addressWord(owner.address)}${state.commitment.slice(2)}${uint(state.version)}`;
      } else {
        const consent = state.consents.get(`0x${data.slice(10)}`);
        result = consent
          ? `0x${assetId.slice(2)}${addressWord(recipient.address)}${parameters[consent.version - 1].scopeHash.slice(2)}${uint(consent.version)}${uint(100)}${uint(0)}${uint(consent.revokedAt)}`
          : `0x${'0'.repeat(64 * 7)}`;
      }
    }
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify({ jsonrpc: '2.0', id: input.id, result }));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const runtimes = [];
  t.after(async () => { await Promise.allSettled(runtimes.map((runtime) => runtime.close())); server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); });
  for (const index of [0, 1]) runtimes.push(await createSprintRuntime({
    rpcUrl: `http://127.0.0.1:${server.address().port}`, registryAddress, assetId, consentId: consentIds[index],
    grantee: recipient.address, document: BRIEF_DOCUMENTS[index], allowedItemIds: BRIEF_ALLOWED_ITEM_IDS[index], outputMode: 'BRIEF_TEMPLATE',
  }));
  return { owner, recipient, parameters, state, runtimes,
    grant(version) { state.consents.set(consentIds[version - 1], { version, revokedAt: 0 }); },
    async call(version, signer = recipient) {
      const runtime = runtimes[version - 1]; const challenge = await runtime.createChallenge();
      return runtime.continueWithSignature({ declaration: challenge.declaration, signature: await signer.signMessage(challenge.message) });
    },
  };
}

test('client brief: V1 delivered, stale blocked, V2 requires its own grant, new announcement delivered, then revoked', async (t) => {
  const h = await setup(t);
  assert.notEqual(h.owner.address, h.recipient.address, 'local identities are deliberately distinct');
  assert.notEqual(h.runtimes[0].agentKeyFingerprint, h.runtimes[1].agentKeyFingerprint);
  h.grant(1);
  const first = await h.call(1);
  assert.equal(first.status, 'ACTIVE_CONTEXT_DELIVERED', JSON.stringify(first));
  assert.equal(first.result.announcement.sourceVersion, 1);
  assert.match(first.result.announcement.text, /Friday, 19:00/);
  assert.notEqual(first.ownerPid, first.agentPid);
  assert.equal(h.state.assetReads, 2, 'sender and recipient each read the RPC');
  h.state.version = 2; h.state.commitment = h.parameters[1].contentCommitment;
  const stale = await h.call(1);
  assert.equal(stale.receipt.outcome, 'VERSION_STALE');
  const notGranted = await h.call(2);
  assert.equal(notGranted.receipt.outcome, 'NOT_FOUND', 'publishing V2 must not grant access');
  h.grant(2);
  const second = await h.call(2);
  assert.equal(second.status, 'ACTIVE_CONTEXT_DELIVERED', JSON.stringify(second));
  assert.equal(second.result.announcement.sourceVersion, 2);
  assert.match(second.result.announcement.text, /Saturday, 15:00/);
  assert.doesNotMatch(second.result.announcement.text, /Friday/);
  assert.deepEqual(second.result.announcement.receivedItemIds, BRIEF_ALLOWED_ITEM_IDS[1]);
  const stillStale = await h.call(1);
  assert.equal(stillStale.receipt.outcome, 'VERSION_STALE', 'new consent does not revive the old one');
  h.state.consents.get(consentIds[1]).revokedAt = 150;
  const revoked = await h.call(2);
  assert.equal(revoked.receipt.outcome, 'REVOKED');
  for (const denied of [stale, notGranted, stillStale, revoked]) {
    for (const key of downstream) assert.equal(denied.counters.delta[key], 0, key);
    assert.equal(denied.result, undefined, 'denial must not carry the previous announcement');
  }
  for (const delivered of [first, second]) {
    assert.equal(delivered.result.announcement.evidenceType, 'DETERMINISTIC_TEMPLATE_NOT_AI');
    assert.equal(delivered.realModelBehavior, 'NOT_MEASURED');
    assert.doesNotMatch(JSON.stringify(delivered), /SYNTHETIC_INTERNAL_NOTE|SYNTHETIC_UNAPPROVED_SUGGESTION|free admission/);
    for (const key of downstream) assert.equal(delivered.counters.delta[key], 1, key);
  }
});

test('brief handoff rejects wrong signer and a V1 signed challenge sent to the V2 runtime', async (t) => {
  const h = await setup(t); h.grant(1); h.grant(2);
  const wrongSigner = await h.call(1, h.owner);
  assert.equal(wrongSigner.code, 'REQUEST_SIGNER_MISMATCH');
  for (const key of downstream) assert.equal(wrongSigner.counters.delta[key], 0);
  const challenge = await h.runtimes[0].createChallenge();
  const mixed = await h.runtimes[1].continueWithSignature({ declaration: challenge.declaration, signature: await h.recipient.signMessage(challenge.message) });
  assert.equal(mixed.code, 'REQUEST_AGENT_KEY_MISMATCH');
  for (const key of downstream) assert.equal(mixed.counters.delta[key], 0);
  assert.equal(h.state.assetReads, 0);
});

test('V2 content commitment mismatch stops delivery and cannot produce an updated announcement', async (t) => {
  const h = await setup(t); h.grant(2); h.state.version = 2;
  // Keep V1 content commitment to model a mismatched chain record.
  const result = await h.call(2);
  assert.equal(result.code, 'CHAIN_CONTENT_COMMITMENT_MISMATCH');
  for (const key of downstream) assert.equal(result.counters.delta[key], 0);
  assert.equal(result.result, undefined);
});

test('announcement template uses received fields, not fixture lookup, and refuses unconfirmed/extra material', () => {
  const { disclosure } = projectDisclosure(BRIEF_DOCUMENTS[1], { allowedItemIds: BRIEF_ALLOWED_ITEM_IDS[1] });
  const changed = structuredClone(disclosure);
  changed.items[0].statement = JSON.stringify({ title: 'Another synthetic meetup', schedule: 'Sunday, 11:00', venue: 'Another studio' });
  assert.match(renderBriefAnnouncement(changed).text, /Sunday, 11:00/);
  assert.doesNotMatch(renderBriefAnnouncement(changed).text, /Saturday|Harbor/);
  changed.items[0].source.reviewStatus = 'UNREVIEWED';
  assert.throws(() => renderBriefAnnouncement(changed), { code: 'BRIEF_CONFIRMED_ITEM_REQUIRED' });
  assert.throws(() => renderBriefAnnouncement({ ...disclosure, items: [...disclosure.items, BRIEF_DOCUMENTS[1].items[1]] }), { code: 'BRIEF_EXACT_SCOPE_REQUIRED' });
});
