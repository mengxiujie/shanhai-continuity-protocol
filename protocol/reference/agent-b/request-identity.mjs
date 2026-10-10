import { getAddress, verifyMessage } from 'ethers';
import { canonicalize } from '../../src/canonical-json.mjs';
import { invariant, ProtocolError } from '../../src/errors.mjs';
import { publicKeyFingerprint, randomBytes, subtle } from '../shared/webcrypto.mjs';

export const REQUEST_PURPOSE = 'SCP_REQUEST_CONTINUITY';
const MESSAGE_PREFIX = 'Shanhai Continuity Protocol access request v1\n';
const DECLARATION_FIELDS = [
  'domain', 'purpose', 'chainId', 'registry', 'assetId', 'consentId', 'version', 'scopeHash',
  'grantee', 'agentKeyFingerprint', 'nonce', 'expiresAt',
];
const BYTES32 = /^0x[0-9a-fA-F]{64}$/;
const FINGERPRINT = /^sha256:[A-Za-z0-9_-]{43}$/;
const UNIX_SECONDS = () => Math.floor(Date.now() / 1000);

function integer(value, code, minimum = 0, maximum = Number.MAX_SAFE_INTEGER) {
  invariant(Number.isSafeInteger(value) && value >= minimum && value <= maximum, code);
  return value;
}

function address(value, code) {
  invariant(typeof value === 'string', code);
  try { return getAddress(value).toLowerCase(); } catch { throw new ProtocolError(code); }
}

function bytes32(value, code) {
  invariant(typeof value === 'string' && BYTES32.test(value), code);
  return value.toLowerCase();
}

function domain(value) {
  invariant(typeof value === 'string' && /^[a-z0-9][a-z0-9.-]{0,252}$/i.test(value), 'REQUEST_DOMAIN_INVALID');
  return value.toLowerCase();
}

function normalizeContext(context) {
  invariant(context && Object.getPrototypeOf(context) === Object.prototype, 'REQUEST_CONTEXT_INVALID');
  return {
    domain: domain(context.domain),
    chainId: integer(context.chainId, 'REQUEST_CHAIN_INVALID', 1),
    registry: address(context.registry, 'REQUEST_REGISTRY_INVALID'),
  };
}

export function normalizeRequestDeclaration(input) {
  invariant(input && Object.getPrototypeOf(input) === Object.prototype, 'REQUEST_DECLARATION_INVALID');
  invariant(Object.keys(input).length === DECLARATION_FIELDS.length && DECLARATION_FIELDS.every((field) => Object.hasOwn(input, field)), 'REQUEST_FIELDS_INVALID');
  invariant(input.purpose === REQUEST_PURPOSE, 'REQUEST_PURPOSE_INVALID');
  invariant(typeof input.agentKeyFingerprint === 'string' && FINGERPRINT.test(input.agentKeyFingerprint), 'REQUEST_KEY_FINGERPRINT_INVALID');
  return {
    ...normalizeContext(input),
    purpose: REQUEST_PURPOSE,
    assetId: bytes32(input.assetId, 'REQUEST_ASSET_INVALID'),
    consentId: bytes32(input.consentId, 'REQUEST_CONSENT_INVALID'),
    version: integer(input.version, 'REQUEST_VERSION_INVALID', 1, 0xffffffff),
    scopeHash: bytes32(input.scopeHash, 'REQUEST_SCOPE_INVALID'),
    grantee: address(input.grantee, 'REQUEST_GRANTEE_INVALID'),
    agentKeyFingerprint: input.agentKeyFingerprint,
    nonce: bytes32(input.nonce, 'REQUEST_NONCE_INVALID'),
    expiresAt: integer(input.expiresAt, 'REQUEST_EXPIRY_INVALID', 1),
  };
}

export function requestSigningMessage(declaration) {
  return MESSAGE_PREFIX + canonicalize(normalizeRequestDeclaration(declaration));
}

async function checkedKeyFingerprint(publicJwk) {
  invariant(publicJwk && Object.getPrototypeOf(publicJwk) === Object.prototype, 'REQUEST_AGENT_KEY_INVALID');
  const permitted = new Set(['kty', 'crv', 'x', 'y', 'ext', 'key_ops']);
  invariant(Object.keys(publicJwk).every((key) => permitted.has(key)), 'REQUEST_AGENT_KEY_INVALID');
  invariant(publicJwk.kty === 'EC' && publicJwk.crv === 'P-256', 'REQUEST_AGENT_KEY_INVALID');
  invariant(/^[A-Za-z0-9_-]{43}$/.test(publicJwk.x) && /^[A-Za-z0-9_-]{43}$/.test(publicJwk.y), 'REQUEST_AGENT_KEY_INVALID');
  invariant(publicJwk.ext === undefined || typeof publicJwk.ext === 'boolean', 'REQUEST_AGENT_KEY_INVALID');
  invariant(publicJwk.key_ops === undefined || (Array.isArray(publicJwk.key_ops) && publicJwk.key_ops.length === 0), 'REQUEST_AGENT_KEY_INVALID');
  try {
    await subtle.importKey('jwk', publicJwk, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  } catch { throw new ProtocolError('REQUEST_AGENT_KEY_INVALID'); }
  return publicKeyFingerprint(publicJwk);
}

// A process-local single-use challenge ledger. A durable, shared ledger is required
// before multiple verifier processes or restart-safe authorization are claimed.
export class InMemoryRequestNonceStore {
  #entries = new Map();

  issue(declaration) {
    const current = normalizeRequestDeclaration(declaration);
    invariant(!this.#entries.has(current.nonce), 'REQUEST_NONCE_COLLISION');
    this.#entries.set(current.nonce, { message: requestSigningMessage(current), expiresAt: current.expiresAt, consumed: false });
  }

  consume(declaration, now) {
    const current = normalizeRequestDeclaration(declaration);
    integer(now, 'REQUEST_TIME_INVALID');
    const entry = this.#entries.get(current.nonce);
    invariant(entry, 'REQUEST_NONCE_UNKNOWN');
    invariant(!entry.consumed, 'REQUEST_NONCE_REPLAYED');
    invariant(now < entry.expiresAt, 'REQUEST_EXPIRED');
    invariant(entry.message === requestSigningMessage(current), 'REQUEST_CHALLENGE_MISMATCH');
    // Synchronous check-and-set keeps concurrent verification in one process atomic.
    entry.consumed = true;
  }
}

export async function createRequestChallenge({ context, request, agentPublicJwk, nonceStore, now = UNIX_SECONDS(), ttlSeconds = 60 }) {
  const currentTime = integer(now, 'REQUEST_TIME_INVALID');
  const ttl = integer(ttlSeconds, 'REQUEST_TTL_INVALID', 1, 300);
  invariant(nonceStore && typeof nonceStore.issue === 'function', 'REQUEST_NONCE_STORE_INVALID');
  const declaration = normalizeRequestDeclaration({
    ...normalizeContext(context),
    purpose: REQUEST_PURPOSE,
    assetId: request?.assetId,
    consentId: request?.consentId,
    version: request?.version,
    scopeHash: request?.scopeHash,
    grantee: request?.grantee,
    agentKeyFingerprint: await checkedKeyFingerprint(agentPublicJwk),
    nonce: `0x${Buffer.from(randomBytes(32)).toString('hex')}`,
    expiresAt: currentTime + ttl,
  });
  nonceStore.issue(declaration);
  return { declaration, message: requestSigningMessage(declaration) };
}

export async function verifySignedRequest({ declaration, signature, agentPublicJwk, context, nonceStore, now = UNIX_SECONDS() }) {
  const normalized = normalizeRequestDeclaration(declaration);
  const expected = normalizeContext(context);
  const currentTime = integer(now, 'REQUEST_TIME_INVALID');
  invariant(normalized.domain === expected.domain, 'REQUEST_DOMAIN_MISMATCH');
  invariant(normalized.chainId === expected.chainId, 'REQUEST_CHAIN_MISMATCH');
  invariant(normalized.registry === expected.registry, 'REQUEST_REGISTRY_MISMATCH');
  invariant(currentTime < normalized.expiresAt, 'REQUEST_EXPIRED');
  invariant(normalized.agentKeyFingerprint === await checkedKeyFingerprint(agentPublicJwk), 'REQUEST_AGENT_KEY_MISMATCH');
  invariant(typeof signature === 'string', 'REQUEST_SIGNATURE_INVALID');
  let signer;
  try { signer = getAddress(verifyMessage(requestSigningMessage(normalized), signature)).toLowerCase(); }
  catch { throw new ProtocolError('REQUEST_SIGNATURE_INVALID'); }
  invariant(signer === normalized.grantee, 'REQUEST_SIGNER_MISMATCH');
  invariant(nonceStore && typeof nonceStore.consume === 'function', 'REQUEST_NONCE_STORE_INVALID');
  nonceStore.consume(normalized, currentTime);
  return normalized;
}
