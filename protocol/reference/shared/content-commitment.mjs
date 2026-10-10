import { createHash } from 'node:crypto';
import { canonicalize } from '../../src/canonical-json.mjs';
import { invariant } from '../../src/errors.mjs';

// Unlike the provenance-only manifest, this commits to statements AND metadata.
// One registered asset in this reference demo denotes one exact scoped disclosure.
export function contentCommitment(disclosure) {
  return `0x${createHash('sha256').update(canonicalize(disclosure), 'utf8').digest('hex')}`;
}

export function scopeCommitmentBytes32(hash) {
  invariant(typeof hash === 'string' && /^sha256:[A-Za-z0-9_-]{43}$/.test(hash), 'SCOPE_HASH_FORMAT_INVALID');
  const bytes = Buffer.from(hash.slice(7), 'base64url');
  invariant(bytes.length === 32 && bytes.toString('base64url') === hash.slice(7), 'SCOPE_HASH_FORMAT_INVALID');
  return `0x${bytes.toString('hex')}`;
}
