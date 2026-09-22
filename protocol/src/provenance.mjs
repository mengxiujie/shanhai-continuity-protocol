import { createHash, timingSafeEqual } from 'node:crypto';
import { canonicalize } from './canonical-json.mjs';
import { invariant } from './errors.mjs';

export const PROVENANCE_COMMITMENT_ALGORITHM = 'sha256';
const ORIGIN_AUTHORITY = {
  USER_UTTERANCE: ['USER_UTTERANCE', 300],
  TRACEABLE_FACT: ['TRACEABLE_FACT', 200],
  MODEL_INFERENCE: ['MODEL_INFERENCE', 100],
};

export function validateProvenanceSemantics(document) {
  invariant(document?.protocol === 'shanhai-continuity', 'PROVENANCE_INVALID_PROTOCOL');
  invariant(Array.isArray(document.items) && document.items.length > 0, 'PROVENANCE_INVALID_ITEMS');
  for (const item of document.items) {
    const source = item?.source;
    invariant(source && ORIGIN_AUTHORITY[source.originKind], 'PROVENANCE_INVALID_ORIGIN', item?.itemId);
    invariant(['UNREVIEWED', 'USER_CONFIRMED', 'USER_REJECTED'].includes(source.reviewStatus), 'PROVENANCE_INVALID_REVIEW', item.itemId);
    const expected = source.reviewStatus === 'USER_CONFIRMED' ? ['USER_CONFIRMED', 400] : ORIGIN_AUTHORITY[source.originKind];
    invariant(source.authorityClass === expected[0] && source.authorityRank === expected[1], 'PROVENANCE_AUTHORITY_MISMATCH', item.itemId);
    invariant(Number.isInteger(item.recordedAt) && Number.isInteger(source.capturedAt) && source.capturedAt <= item.recordedAt, 'PROVENANCE_TIME_INVALID', item.itemId);
    invariant(Number.isInteger(item.validTime?.from), 'PROVENANCE_VALID_TIME_INVALID', item.itemId);
    invariant(item.validTime.to === null || (Number.isInteger(item.validTime.to) && item.validTime.to > item.validTime.from), 'PROVENANCE_VALID_TIME_INVALID', item.itemId);
    if (source.reviewStatus === 'USER_CONFIRMED') {
      invariant(source.confirmation && Number.isInteger(source.confirmation.confirmedAt) && source.confirmation.confirmedAt <= item.recordedAt, 'CONFIRMATION_REQUIRED', item.itemId);
    } else invariant(source.confirmation === null, 'CONFIRMATION_STATUS_MISMATCH', item.itemId);
    if (source.originKind === 'MODEL_INFERENCE') {
      invariant(source.inference?.model && Number.isInteger(source.inference.generatedAt) && source.inference.generatedAt <= item.recordedAt, 'INFERENCE_BASIS_REQUIRED', item.itemId);
      invariant(Array.isArray(source.inference.basedOnItemIds) && source.inference.basedOnItemIds.length > 0, 'INFERENCE_BASIS_REQUIRED', item.itemId);
    } else invariant(source.inference === null, 'INFERENCE_ORIGIN_MISMATCH', item.itemId);
  }
  return true;
}

export function provenanceManifest(document) {
  invariant(document?.protocol === 'shanhai-continuity', 'PROVENANCE_INVALID_PROTOCOL');
  invariant(Array.isArray(document.items), 'PROVENANCE_INVALID_ITEMS');
  return {
    protocol: document.protocol,
    protocolVersion: document.protocolVersion,
    packageId: document.packageId,
    versionId: document.versionId,
    version: document.version,
    supersedesVersionId: document.supersedesVersionId,
    recordedAt: document.recordedAt,
    items: document.items.map((item) => ({
      itemId: item.itemId,
      source: item.source,
      validTime: item.validTime,
      recordedAt: item.recordedAt,
      supersedes: item.supersedes,
    })),
  };
}

export function computeProvenanceCommitment(document) {
  const bytes = Buffer.from(canonicalize(provenanceManifest(document)), 'utf8');
  return `${PROVENANCE_COMMITMENT_ALGORITHM}:${createHash(PROVENANCE_COMMITMENT_ALGORITHM).update(bytes).digest('hex')}`;
}

export function verifyProvenanceCommitment(document, expectedCommitment) {
  validateProvenanceSemantics(document);
  invariant(typeof expectedCommitment === 'string', 'PROVENANCE_COMMITMENT_INVALID');
  const actual = computeProvenanceCommitment(document);
  const left = Buffer.from(actual, 'utf8');
  const right = Buffer.from(expectedCommitment, 'utf8');
  invariant(left.length === right.length && timingSafeEqual(left, right), 'PROVENANCE_COMMITMENT_MISMATCH');
  return true;
}
