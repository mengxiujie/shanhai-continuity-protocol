import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  canonicalize,
  computeProvenanceCommitment,
  verifyProvenanceCommitment,
  projectDisclosure,
  buildAgentBContext,
} from '../../src/index.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const vectorPath = path.join(here, '..', 'vectors', '02-valid-confirmed-correction.json');
const vector = JSON.parse(await readFile(vectorPath, 'utf8'));
const v2 = vector.documents[1];

test('canonical serialization is key-order independent and rejects unsafe values', () => {
  assert.equal(canonicalize({ z: 1, a: { y: 2, x: 3 } }), canonicalize({ a: { x: 3, y: 2 }, z: 1 }));
  assert.throws(() => canonicalize({ value: Number.NaN }), { code: 'CANONICAL_NON_FINITE_NUMBER' });
  assert.throws(() => canonicalize({ value: undefined }), { code: 'CANONICAL_UNDEFINED' });
});

test('provenance commitment is stable and detects semantic tampering', () => {
  const commitment = computeProvenanceCommitment(v2);
  assert.match(commitment, /^sha256:[0-9a-f]{64}$/);
  assert.equal(verifyProvenanceCommitment(v2, commitment), true);
  const tampered = structuredClone(v2);
  tampered.items[0].source.sourceId = '40000000-0000-4000-8000-000000000099';
  assert.throws(() => verifyProvenanceCommitment(tampered, commitment), { code: 'PROVENANCE_COMMITMENT_MISMATCH' });
  const timeTampered = structuredClone(v2);
  timeTampered.items[0].validTime.from += 1;
  assert.throws(() => verifyProvenanceCommitment(timeTampered, commitment), { code: 'PROVENANCE_COMMITMENT_MISMATCH' });
});

test('a freshly recomputed commitment cannot legitimize invalid provenance semantics', () => {
  const malformed = structuredClone(v2);
  malformed.items[0].source.authorityRank = 100;
  const attackerCommitment = computeProvenanceCommitment(malformed);
  assert.throws(() => verifyProvenanceCommitment(malformed, attackerCommitment), { code: 'PROVENANCE_AUTHORITY_MISMATCH' });
});

test('scope projection returns only selected items and preserves provenance/time', () => {
  const itemId = v2.items[0].itemId;
  const { disclosure, provenanceCommitment } = projectDisclosure(v2, { allowedItemIds: [itemId] });
  assert.deepEqual(disclosure.scope.itemIds, [itemId]);
  assert.equal(disclosure.items.length, 1);
  assert.equal(disclosure.items[0].source.originKind, 'MODEL_INFERENCE');
  assert.equal(disclosure.items[0].source.reviewStatus, 'USER_CONFIRMED');
  assert.equal(disclosure.items[0].validTime.precision, 'DAY');
  assert.match(provenanceCommitment, /^sha256:/);
  assert.throws(() => projectDisclosure(v2, { allowedItemIds: ['30000000-0000-4000-8000-000000000099'] }), { code: 'SCOPE_ITEM_NOT_FOUND' });
});

test('scope projection refuses USER_REJECTED material', () => {
  const rejected = structuredClone(v2);
  rejected.items[0].source.reviewStatus = 'USER_REJECTED';
  rejected.items[0].source.authorityClass = 'MODEL_INFERENCE';
  rejected.items[0].source.authorityRank = 100;
  rejected.items[0].source.confirmation = null;
  assert.throws(() => projectDisclosure(rejected, { allowedItemIds: [rejected.items[0].itemId] }), { code: 'SCOPE_REJECTED_ITEM' });
});

test('Agent B context preserves labels and never presents inference as user quote', () => {
  const projected = projectDisclosure(v2, { allowedItemIds: [v2.items[0].itemId] });
  const messages = buildAgentBContext(projected);
  assert.equal(messages.length, 2);
  assert.match(messages[1].content, /原始来源=MODEL_INFERENCE/);
  assert.match(messages[1].content, /模型推断（不得当作用户原话）/);
  assert.match(messages[1].content, /有效时间=/);
  assert.match(messages[1].content, /修正关系=CORRECTS/);
});

test('Agent B blocks commitment tampering and out-of-scope injection before model context', () => {
  const projected = projectDisclosure(v2, { allowedItemIds: [v2.items[0].itemId] });
  const altered = structuredClone(projected);
  altered.disclosure.items[0].source.authorityRank = 100;
  assert.throws(() => buildAgentBContext(altered), { code: 'PROVENANCE_AUTHORITY_MISMATCH' });

  const leaked = structuredClone(projected);
  leaked.disclosure.items.push({ ...structuredClone(v2.items[0]), itemId: '30000000-0000-4000-8000-000000000098' });
  assert.throws(() => buildAgentBContext(leaked), { code: 'CONTEXT_SCOPE_LEAK' });
});
