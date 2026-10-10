import test from 'node:test';
import assert from 'node:assert/strict';
import { Wallet } from 'ethers';
import { createAgentBSession } from '../../reference/agent-b/access.mjs';
import {
  createRequestChallenge, verifySignedRequest, requestSigningMessage,
  normalizeRequestDeclaration, InMemoryRequestNonceStore,
} from '../../reference/agent-b/request-identity.mjs';

const NOW = 1_800_000_000;
const CONTEXT = { domain: 'shanhai-continuity.local', chainId: 10143, registry: '0x1111111111111111111111111111111111111111' };
const ASSET = `0x${'12'.repeat(32)}`;
const CONSENT = `0x${'23'.repeat(32)}`;
const SCOPE = `0x${'45'.repeat(32)}`;

async function fixture() {
  const wallet = Wallet.createRandom();
  const agent = await createAgentBSession(wallet.address.toLowerCase());
  const nonceStore = new InMemoryRequestNonceStore();
  const challenge = await createRequestChallenge({
    context: CONTEXT,
    request: { assetId: ASSET, consentId: CONSENT, version: 1, scopeHash: SCOPE, grantee: wallet.address },
    agentPublicJwk: agent.publicJwk,
    nonceStore,
    now: NOW,
    ttlSeconds: 60,
  });
  const signature = await wallet.signMessage(challenge.message);
  return {
    wallet, agent, nonceStore, challenge,
    input: { declaration: challenge.declaration, signature, agentPublicJwk: agent.publicJwk, context: CONTEXT, nonceStore, now: NOW },
  };
}

function hasCode(code) { return (error) => error.code === code; }

test('wallet signs canonical request, verified address binds the P-256 session, nonce works once', async () => {
  const { input, wallet, agent } = await fixture();
  const result = await verifySignedRequest(input);
  assert.equal(result.grantee, wallet.address.toLowerCase());
  assert.equal(result.grantee, agent.grantee);
  assert.equal(result.chainId, 10143);
  await assert.rejects(verifySignedRequest(input), hasCode('REQUEST_NONCE_REPLAYED'));
});

test('concurrent replay consumes exactly one challenge in a verifier process', async () => {
  const { input } = await fixture();
  const results = await Promise.allSettled([verifySignedRequest(input), verifySignedRequest(input)]);
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal(results.filter((result) => result.status === 'rejected' && result.reason.code === 'REQUEST_NONCE_REPLAYED').length, 1);
});

test('wrong signing wallet does not consume the legitimate challenge', async () => {
  const { input, challenge } = await fixture();
  const signature = await Wallet.createRandom().signMessage(challenge.message);
  await assert.rejects(verifySignedRequest({ ...input, signature }), hasCode('REQUEST_SIGNER_MISMATCH'));
  await verifySignedRequest(input);
});

test('wrong ephemeral key is rejected before challenge consumption', async () => {
  const { input } = await fixture();
  const otherAgent = await createAgentBSession(input.declaration.grantee);
  await assert.rejects(verifySignedRequest({ ...input, agentPublicJwk: otherAgent.publicJwk }), hasCode('REQUEST_AGENT_KEY_MISMATCH'));
  await verifySignedRequest(input);
});

test('expiry rejects at the exact deadline', async () => {
  const { input } = await fixture();
  await assert.rejects(verifySignedRequest({ ...input, now: NOW + 60 }), hasCode('REQUEST_EXPIRED'));
});

for (const [field, replacement, code] of [
  ['domain', 'other.local', 'REQUEST_DOMAIN_MISMATCH'],
  ['chainId', 1, 'REQUEST_CHAIN_MISMATCH'],
  ['registry', '0x2222222222222222222222222222222222222222', 'REQUEST_REGISTRY_MISMATCH'],
  ['purpose', 'SCP_SAVE', 'REQUEST_PURPOSE_INVALID'],
]) {
  test(`rejects request replay into another ${field}`, async () => {
    const { input } = await fixture();
    const declaration = { ...input.declaration, [field]: replacement };
    await assert.rejects(verifySignedRequest({ ...input, declaration }), hasCode(code));
  });
}

for (const [field, replacement] of [
  ['assetId', `0x${'bc'.repeat(32)}`],
  ['consentId', `0x${'67'.repeat(32)}`],
  ['version', 2],
  ['scopeHash', `0x${'89'.repeat(32)}`],
  ['expiresAt', NOW + 120],
]) {
  test(`wallet cannot change challenged ${field}, even by signing the modified declaration`, async () => {
    const { input, wallet } = await fixture();
    const declaration = { ...input.declaration, [field]: replacement };
    const signature = await wallet.signMessage(requestSigningMessage(declaration));
    await assert.rejects(verifySignedRequest({ ...input, declaration, signature }), hasCode('REQUEST_CHALLENGE_MISMATCH'));
    await verifySignedRequest(input);
  });
}

test('unknown nonce cannot create authority even with a valid wallet signature', async () => {
  const { input, wallet } = await fixture();
  const declaration = { ...input.declaration, nonce: `0x${'ab'.repeat(32)}` };
  const signature = await wallet.signMessage(requestSigningMessage(declaration));
  await assert.rejects(verifySignedRequest({ ...input, declaration, signature }), hasCode('REQUEST_NONCE_UNKNOWN'));
});

test('request cannot change the challenged grantee by supplying another valid signature', async () => {
  const { input } = await fixture();
  const other = Wallet.createRandom();
  const declaration = { ...input.declaration, grantee: other.address };
  const signature = await other.signMessage(requestSigningMessage(declaration));
  await assert.rejects(verifySignedRequest({ ...input, declaration, signature }), hasCode('REQUEST_CHALLENGE_MISMATCH'));
});

test('unsigned semantic tampering fails signature recovery', async () => {
  const { input } = await fixture();
  await assert.rejects(verifySignedRequest({ ...input, declaration: { ...input.declaration, version: 2 } }), hasCode('REQUEST_SIGNER_MISMATCH'));
});

test('canonical message accepts address/hex case normalization and stable field ordering', async () => {
  const { input, wallet, challenge } = await fixture();
  const alternate = Object.fromEntries(Object.entries(input.declaration).reverse());
  alternate.grantee = wallet.address;
  alternate.scopeHash = `0x${alternate.scopeHash.slice(2).toUpperCase()}`;
  alternate.nonce = `0x${alternate.nonce.slice(2).toUpperCase()}`;
  assert.equal(requestSigningMessage(alternate), challenge.message);
  assert.deepEqual(normalizeRequestDeclaration(alternate), input.declaration);
  await verifySignedRequest({ ...input, declaration: alternate });
});

test('extra fields, invalid signature, and private JWK are refused', async () => {
  const { input } = await fixture();
  await assert.rejects(verifySignedRequest({ ...input, declaration: { ...input.declaration, save: true } }), hasCode('REQUEST_FIELDS_INVALID'));
  await assert.rejects(verifySignedRequest({ ...input, signature: '0x1234' }), hasCode('REQUEST_SIGNATURE_INVALID'));
  await assert.rejects(verifySignedRequest({ ...input, agentPublicJwk: { ...input.agentPublicJwk, d: 'do-not-accept-private-key' } }), hasCode('REQUEST_AGENT_KEY_INVALID'));
  await verifySignedRequest(input);
});

test('challenge TTL is bounded and malformed/off-curve P-256 keys are refused', async () => {
  const { input } = await fixture();
  const args = { context: CONTEXT, request: input.declaration, agentPublicJwk: input.agentPublicJwk, nonceStore: input.nonceStore, now: NOW };
  await assert.rejects(createRequestChallenge({ ...args, ttlSeconds: 301 }), hasCode('REQUEST_TTL_INVALID'));
  await assert.rejects(createRequestChallenge({ ...args, agentPublicJwk: { kty: 'EC', crv: 'P-256', x: 'A'.repeat(43), y: 'A'.repeat(43) } }), hasCode('REQUEST_AGENT_KEY_INVALID'));
});
