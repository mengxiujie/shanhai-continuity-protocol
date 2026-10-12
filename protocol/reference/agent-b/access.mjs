import { canonicalize } from '../../src/canonical-json.mjs';
import { buildAgentBContext } from '../../src/context-builder.mjs';
import { invariant } from '../../src/errors.mjs';
import { contentCommitment } from '../shared/content-commitment.mjs';
import {
  subtle, utf8, text, fromBase64Url, normalizedItemIds, scopeHash,
  publicKeyFingerprint, deriveWrappingKey, mapCryptoFailure,
} from '../shared/webcrypto.mjs';

function equalArrays(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function aadDescriptor(envelope) {
  return {
    protocol: envelope.protocol,
    protocolVersion: envelope.protocolVersion,
    consentId: envelope.consentId,
    grantee: envelope.grantee,
    packageId: envelope.packageId,
    versionId: envelope.versionId,
    version: envelope.version,
    scopeHash: envelope.scopeHash,
    provenanceCommitment: envelope.provenanceCommitment,
    contentCommitment: envelope.contentCommitment,
    agentKeyFingerprint: envelope.agentKeyFingerprint,
  };
}

export async function createAgentBSession(grantee) {
  const keyPair = await subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveBits']);
  const publicJwk = await subtle.exportKey('jwk', keyPair.publicKey);
  return { grantee, publicJwk, privateKey: keyPair.privateKey, keyFingerprint: await publicKeyFingerprint(publicJwk) };
}

export async function openEnvelopeAndContinue({ envelope, session, requestedItemIds, modelGateway, onStage = () => {} }) {
  const expectedItemIds = normalizedItemIds(requestedItemIds);
  invariant(envelope.protocol === 'shanhai-continuity-envelope', 'ENVELOPE_PROTOCOL_INVALID');
  invariant(envelope.grantee === session.grantee, 'GRANTEE_MISMATCH');
  invariant(envelope.agentKeyFingerprint === session.keyFingerprint, 'AGENT_KEY_BINDING_INVALID');
  invariant(equalArrays(normalizedItemIds(envelope.scope?.itemIds), expectedItemIds), 'SCOPE_MISMATCH');
  invariant(envelope.scopeHash === await scopeHash(expectedItemIds), 'SCOPE_COMMITMENT_MISMATCH');
  invariant(typeof modelGateway === 'function', 'MODEL_GATEWAY_INVALID');
  invariant(/^0x[0-9a-f]{64}$/.test(envelope.contentCommitment), 'CONTENT_COMMITMENT_INVALID');

  const aad = utf8(canonicalize(aadDescriptor(envelope)));
  let payload;
  try {
    onStage('decryptAttempts');
    const ownerPublicKey = await subtle.importKey('jwk', envelope.ownerEphemeralPublicJwk, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
    const wrappingKey = await deriveWrappingKey({
      privateKey: session.privateKey,
      publicKey: ownerPublicKey,
      salt: fromBase64Url(envelope.hkdfSalt),
      usage: ['decrypt'],
    });
    const payloadKeyBytes = await subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64Url(envelope.wrapNonce), additionalData: aad },
      wrappingKey,
      fromBase64Url(envelope.wrappedPayloadKey),
    );
    const payloadKey = await subtle.importKey('raw', payloadKeyBytes, { name: 'AES-GCM' }, false, ['decrypt']);
    const plaintext = await subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64Url(envelope.payloadNonce), additionalData: aad },
      payloadKey,
      fromBase64Url(envelope.payloadCiphertext),
    );
    payload = JSON.parse(text(plaintext));
  } catch (error) {
    mapCryptoFailure(error);
  }

  invariant(equalArrays(normalizedItemIds(payload.scope?.itemIds), expectedItemIds), 'DECRYPTED_SCOPE_MISMATCH');
  invariant(contentCommitment(payload) === envelope.contentCommitment, 'CONTENT_COMMITMENT_MISMATCH');
  invariant(payload.packageId === envelope.packageId && payload.versionId === envelope.versionId && payload.version === envelope.version, 'DECRYPTED_VERSION_MISMATCH');
  onStage('decryptSucceeded');
  const messages = buildAgentBContext({ disclosure: payload, provenanceCommitment: envelope.provenanceCommitment });
  onStage('contextAssemblies');
  onStage('controlledGatewayCalls');
  const result = await modelGateway(messages, { disclosure: payload });
  return { messages, result };
}
