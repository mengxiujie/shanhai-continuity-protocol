import { canonicalize } from '../../src/canonical-json.mjs';
import { projectDisclosure } from '../../src/projection.mjs';
import {
  subtle, randomBytes, utf8, toBase64Url, fromBase64Url,
  normalizedItemIds, scopeHash, publicKeyFingerprint, deriveWrappingKey,
} from '../shared/webcrypto.mjs';

export async function createEncryptedGrantEnvelope({
  document,
  allowedItemIds,
  consentId,
  grantee,
  agentPublicJwk,
}) {
  const scopedItemIds = normalizedItemIds(allowedItemIds);
  const { disclosure, provenanceCommitment } = projectDisclosure(document, { allowedItemIds: scopedItemIds });
  const agentKeyFingerprint = await publicKeyFingerprint(agentPublicJwk);
  const computedScopeHash = await scopeHash(scopedItemIds);
  const aadDescriptor = {
    protocol: 'shanhai-continuity-envelope',
    protocolVersion: document.protocolVersion,
    consentId,
    grantee,
    packageId: document.packageId,
    versionId: document.versionId,
    version: document.version,
    scopeHash: computedScopeHash,
    provenanceCommitment,
    agentKeyFingerprint,
  };
  const aad = utf8(canonicalize(aadDescriptor));

  const payloadKey = await subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']);
  const payloadKeyBytes = new Uint8Array(await subtle.exportKey('raw', payloadKey));
  const payloadNonce = randomBytes(12);
  const payloadCiphertext = new Uint8Array(await subtle.encrypt(
    { name: 'AES-GCM', iv: payloadNonce, additionalData: aad },
    payloadKey,
    utf8(canonicalize(disclosure)),
  ));

  const agentPublicKey = await subtle.importKey('jwk', agentPublicJwk, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const ownerEphemeral = await subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const hkdfSalt = randomBytes(16);
  const wrapNonce = randomBytes(12);
  const wrappingKey = await deriveWrappingKey({
    privateKey: ownerEphemeral.privateKey,
    publicKey: agentPublicKey,
    salt: hkdfSalt,
    usage: ['encrypt'],
  });
  const wrappedPayloadKey = new Uint8Array(await subtle.encrypt(
    { name: 'AES-GCM', iv: wrapNonce, additionalData: aad },
    wrappingKey,
    payloadKeyBytes,
  ));

  return {
    ...aadDescriptor,
    scope: { itemIds: scopedItemIds },
    ownerEphemeralPublicJwk: await subtle.exportKey('jwk', ownerEphemeral.publicKey),
    hkdfSalt: toBase64Url(hkdfSalt),
    wrapNonce: toBase64Url(wrapNonce),
    wrappedPayloadKey: toBase64Url(wrappedPayloadKey),
    payloadNonce: toBase64Url(payloadNonce),
    payloadCiphertext: toBase64Url(payloadCiphertext),
    algorithms: { agreement: 'ECDH-P256', kdf: 'HKDF-SHA-256', content: 'A256GCM', commitment: 'SHA-256' },
  };
}
