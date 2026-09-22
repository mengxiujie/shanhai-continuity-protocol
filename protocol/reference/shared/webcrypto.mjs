import { webcrypto } from 'node:crypto';
import { canonicalize } from '../../src/canonical-json.mjs';
import { invariant, ProtocolError } from '../../src/errors.mjs';

export const subtle = webcrypto.subtle;
export const randomBytes = (length) => webcrypto.getRandomValues(new Uint8Array(length));
export const utf8 = (value) => new TextEncoder().encode(value);
export const text = (value) => new TextDecoder().decode(value);
export const toBase64Url = (value) => Buffer.from(value).toString('base64url');
export const fromBase64Url = (value) => new Uint8Array(Buffer.from(value, 'base64url'));

export async function sha256(value) {
  return toBase64Url(await subtle.digest('SHA-256', utf8(value)));
}

export function normalizedItemIds(itemIds) {
  invariant(Array.isArray(itemIds) && itemIds.length > 0, 'SCOPE_EMPTY');
  invariant(new Set(itemIds).size === itemIds.length, 'SCOPE_DUPLICATE_ITEM');
  return [...itemIds].sort();
}

export async function scopeHash(itemIds) {
  return `sha256:${await sha256(canonicalize(normalizedItemIds(itemIds)))}`;
}

export async function publicKeyFingerprint(publicJwk) {
  return `sha256:${await sha256(canonicalize(publicJwk))}`;
}

export async function deriveWrappingKey({ privateKey, publicKey, salt, usage }) {
  const sharedBits = await subtle.deriveBits({ name: 'ECDH', public: publicKey }, privateKey, 256);
  const material = await subtle.importKey('raw', sharedBits, 'HKDF', false, ['deriveKey']);
  return subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt, info: utf8('shanhai-continuity-envelope-wrap-v1') },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    usage,
  );
}

export function mapCryptoFailure(error, code = 'CIPHERTEXT_INTEGRITY_FAILED') {
  if (error instanceof ProtocolError) throw error;
  throw new ProtocolError(code);
}
