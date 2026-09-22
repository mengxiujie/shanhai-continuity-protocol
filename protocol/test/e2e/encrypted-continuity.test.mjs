import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createEncryptedGrantEnvelope } from '../../reference/owner-web/envelope.mjs';
import { createAgentBSession, openEnvelopeAndContinue } from '../../reference/agent-b/access.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const vector = JSON.parse(await readFile(path.join(here, '..', 'vectors', '02-valid-confirmed-correction.json'), 'utf8'));
const document = vector.documents[1];
const itemId = document.items[0].itemId;

function gatewayCounter() {
  const state = { calls: 0, lastMessages: null };
  return {
    state,
    gateway: async (messages) => {
      state.calls += 1;
      state.lastMessages = messages;
      return { status: 'SYNTHETIC_MODEL_RESULT' };
    },
  };
}

function mutateBase64Url(value) {
  const first = value[0] === 'A' ? 'B' : 'A';
  return first + value.slice(1);
}

async function setup() {
  const session = await createAgentBSession('agent-b:synthetic');
  const envelope = await createEncryptedGrantEnvelope({
    document,
    allowedItemIds: [itemId],
    consentId: 'consent-synthetic-001',
    grantee: session.grantee,
    agentPublicJwk: session.publicJwk,
  });
  return { session, envelope };
}

test('Owner projection → encrypted envelope → independent Agent B context → model gateway', async () => {
  const { session, envelope } = await setup();
  const model = gatewayCounter();
  const result = await openEnvelopeAndContinue({ envelope, session, requestedItemIds: [itemId], modelGateway: model.gateway });
  assert.equal(model.state.calls, 1);
  assert.equal(result.result.status, 'SYNTHETIC_MODEL_RESULT');
  assert.match(result.messages[1].content, /MODEL_INFERENCE:模型推断/);
  assert.doesNotMatch(JSON.stringify(envelope), /相比稳定/);
});

test('requesting a wider or different scope stops before decrypt and model', async () => {
  const { session, envelope } = await setup();
  const model = gatewayCounter();
  await assert.rejects(
    openEnvelopeAndContinue({ envelope, session, requestedItemIds: ['30000000-0000-4000-8000-000000000099'], modelGateway: model.gateway }),
    { code: 'SCOPE_MISMATCH' },
  );
  assert.equal(model.state.calls, 0);
});

test('payload ciphertext tampering fails closed with zero model calls', async () => {
  const { session, envelope } = await setup();
  const model = gatewayCounter();
  const tampered = structuredClone(envelope);
  tampered.payloadCiphertext = mutateBase64Url(tampered.payloadCiphertext);
  await assert.rejects(
    openEnvelopeAndContinue({ envelope: tampered, session, requestedItemIds: [itemId], modelGateway: model.gateway }),
    { code: 'CIPHERTEXT_INTEGRITY_FAILED' },
  );
  assert.equal(model.state.calls, 0);
});

test('provenance commitment tampering invalidates AAD with zero model calls', async () => {
  const { session, envelope } = await setup();
  const model = gatewayCounter();
  const tampered = structuredClone(envelope);
  tampered.provenanceCommitment = tampered.provenanceCommitment.replace(/.$/, tampered.provenanceCommitment.endsWith('0') ? '1' : '0');
  await assert.rejects(
    openEnvelopeAndContinue({ envelope: tampered, session, requestedItemIds: [itemId], modelGateway: model.gateway }),
    { code: 'CIPHERTEXT_INTEGRITY_FAILED' },
  );
  assert.equal(model.state.calls, 0);
});

test('a different Agent B private key cannot open the envelope', async () => {
  const { envelope } = await setup();
  const otherSession = await createAgentBSession('agent-b:synthetic');
  const model = gatewayCounter();
  await assert.rejects(
    openEnvelopeAndContinue({ envelope, session: otherSession, requestedItemIds: [itemId], modelGateway: model.gateway }),
    { code: 'AGENT_KEY_BINDING_INVALID' },
  );
  assert.equal(model.state.calls, 0);
});

test('Owner cannot create an envelope containing USER_REJECTED material', async () => {
  const rejected = structuredClone(document);
  rejected.items[0].source.reviewStatus = 'USER_REJECTED';
  rejected.items[0].source.authorityClass = 'MODEL_INFERENCE';
  rejected.items[0].source.authorityRank = 100;
  rejected.items[0].source.confirmation = null;
  const session = await createAgentBSession('agent-b:synthetic');
  await assert.rejects(
    createEncryptedGrantEnvelope({ document: rejected, allowedItemIds: [itemId], consentId: 'consent-synthetic-002', grantee: session.grantee, agentPublicJwk: session.publicJwk }),
    { code: 'SCOPE_REJECTED_ITEM' },
  );
});
