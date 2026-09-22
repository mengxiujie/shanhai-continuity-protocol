import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const vectorDir = path.join(here, 'vectors');
const ORIGIN_AUTHORITY = {
  USER_UTTERANCE: ['USER_UTTERANCE', 300],
  TRACEABLE_FACT: ['TRACEABLE_FACT', 200],
  MODEL_INFERENCE: ['MODEL_INFERENCE', 100],
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function fail(code, detail) { const error = new Error(`${code}: ${detail}`); error.code = code; throw error; }
function exactKeys(value, keys, code) {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, i) => key !== expected[i])) fail(code, `keys=${actual.join(',')}`);
}
function integerTime(value, name) { if (!Number.isInteger(value) || value < 0) fail('INVALID_TIME', name); }

function validateDocument(doc) {
  exactKeys(doc, ['protocol','protocolVersion','dataClass','packageId','versionId','version','supersedesVersionId','recordedAt','items'], 'UNKNOWN_OR_MISSING_DOCUMENT_FIELD');
  if (doc.protocol !== 'shanhai-continuity' || doc.protocolVersion !== '0.1.0') fail('UNSUPPORTED_PROTOCOL', doc.protocolVersion);
  if (doc.dataClass !== 'SYNTHETIC') fail('NON_SYNTHETIC_DATA_FORBIDDEN', doc.dataClass);
  for (const [name, value] of [['packageId',doc.packageId],['versionId',doc.versionId]]) if (!UUID.test(value)) fail('INVALID_UUID', name);
  if (!Number.isInteger(doc.version) || doc.version < 1) fail('INVALID_VERSION', doc.version);
  if (doc.supersedesVersionId !== null && !UUID.test(doc.supersedesVersionId)) fail('INVALID_UUID', 'supersedesVersionId');
  integerTime(doc.recordedAt, 'document.recordedAt');
  if (!Array.isArray(doc.items) || doc.items.length === 0) fail('EMPTY_ITEMS', doc.versionId);

  for (const item of doc.items) {
    exactKeys(item, ['itemId','statement','source','validTime','recordedAt','supersedes'], 'UNKNOWN_OR_MISSING_ITEM_FIELD');
    if (!UUID.test(item.itemId) || typeof item.statement !== 'string' || item.statement.length === 0 || item.statement.length > 4096) fail('INVALID_ITEM', item.itemId);
    integerTime(item.recordedAt, `${item.itemId}.recordedAt`);
    if (item.recordedAt > doc.recordedAt) fail('ITEM_RECORDED_AFTER_DOCUMENT', item.itemId);
    exactKeys(item.validTime, ['from','to','precision'], 'INVALID_VALID_TIME_SHAPE');
    integerTime(item.validTime.from, `${item.itemId}.validTime.from`);
    if (item.validTime.to !== null) {
      integerTime(item.validTime.to, `${item.itemId}.validTime.to`);
      if (item.validTime.to <= item.validTime.from) fail('INVALID_VALID_TIME_RANGE', item.itemId);
    }
    if (!['INSTANT','DAY','MONTH','YEAR','APPROXIMATE'].includes(item.validTime.precision)) fail('INVALID_TIME_PRECISION', item.itemId);

    const source = item.source;
    exactKeys(source, ['originKind','reviewStatus','authorityClass','authorityRank','sourceId','capturedAt','supportingSourceIds','confirmation','inference'], 'INVALID_SOURCE_SHAPE');
    if (!ORIGIN_AUTHORITY[source.originKind]) fail('INVALID_ORIGIN_KIND', item.itemId);
    if (!['UNREVIEWED','USER_CONFIRMED','USER_REJECTED'].includes(source.reviewStatus)) fail('INVALID_REVIEW_STATUS', item.itemId);
    const expectedAuthority = source.reviewStatus === 'USER_CONFIRMED' ? ['USER_CONFIRMED', 400] : ORIGIN_AUTHORITY[source.originKind];
    if (source.authorityClass !== expectedAuthority[0] || source.authorityRank !== expectedAuthority[1]) fail('SOURCE_PRIORITY_MISMATCH', item.itemId);
    if (!UUID.test(source.sourceId)) fail('INVALID_UUID', 'sourceId');
    integerTime(source.capturedAt, `${item.itemId}.source.capturedAt`);
    if (source.capturedAt > item.recordedAt) fail('SOURCE_CAPTURED_AFTER_RECORD', item.itemId);
    if (!Array.isArray(source.supportingSourceIds) || source.supportingSourceIds.some((id) => !UUID.test(id)) || new Set(source.supportingSourceIds).size !== source.supportingSourceIds.length) fail('INVALID_SUPPORTING_SOURCE', item.itemId);

    if (source.reviewStatus === 'USER_CONFIRMED') {
      if (!source.confirmation || !UUID.test(source.confirmation.eventId)) fail('CONFIRMATION_REQUIRED', item.itemId);
      integerTime(source.confirmation.confirmedAt, `${item.itemId}.confirmation.confirmedAt`);
      if (source.confirmation.confirmedAt > item.recordedAt) fail('CONFIRMATION_AFTER_RECORD', item.itemId);
      if (source.supportingSourceIds.length === 0) fail('CONFIRMATION_SOURCE_REQUIRED', item.itemId);
    } else if (source.confirmation !== null) fail('CONFIRMATION_STATUS_MISMATCH', item.itemId);

    if (source.originKind === 'MODEL_INFERENCE') {
      if (!source.inference || !source.inference.model || !Array.isArray(source.inference.basedOnItemIds) || source.inference.basedOnItemIds.length === 0) fail('INFERENCE_BASIS_REQUIRED', item.itemId);
      integerTime(source.inference.generatedAt, `${item.itemId}.inference.generatedAt`);
      if (source.inference.generatedAt > item.recordedAt) fail('INFERENCE_AFTER_RECORD', item.itemId);
    } else if (source.inference !== null) fail('INFERENCE_ORIGIN_MISMATCH', item.itemId);

    if (!Array.isArray(item.supersedes)) fail('INVALID_SUPERSESSION', item.itemId);
    const edgeKeys = new Set();
    for (const edge of item.supersedes) {
      exactKeys(edge, ['itemId','relation'], 'INVALID_SUPERSESSION_SHAPE');
      if (!UUID.test(edge.itemId) || !['CORRECTS','REFINES','REPLACES'].includes(edge.relation)) fail('INVALID_SUPERSESSION', item.itemId);
      const key = `${edge.itemId}:${edge.relation}`;
      if (edgeKeys.has(key)) fail('DUPLICATE_SUPERSESSION', key);
      edgeKeys.add(key);
    }
  }
}

function validateHistory(documents) {
  if (!Array.isArray(documents) || documents.length === 0) fail('EMPTY_HISTORY', 'documents');
  const versions = new Map();
  const items = new Map();
  const itemVersions = new Map();
  const edges = new Map();
  const packageId = documents[0].packageId;
  for (const doc of documents) {
    validateDocument(doc);
    if (doc.packageId !== packageId) fail('CROSS_PACKAGE_HISTORY', doc.versionId);
    if (versions.has(doc.versionId)) fail('DUPLICATE_VERSION_ID', doc.versionId);
    versions.set(doc.versionId, doc);
    for (const item of doc.items) {
      if (items.has(item.itemId)) fail('DUPLICATE_ITEM_ID', item.itemId);
      items.set(item.itemId, item);
      itemVersions.set(item.itemId, doc.version);
      edges.set(item.itemId, item.supersedes.map((edge) => edge.itemId));
    }
  }
  const ordered = [...documents].sort((a,b) => a.version - b.version);
  for (let i = 0; i < ordered.length; i += 1) {
    const doc = ordered[i];
    if (doc.version !== i + 1) fail('VERSION_SEQUENCE_INVALID', doc.versionId);
    if (i === 0 && doc.supersedesVersionId !== null) fail('FIRST_VERSION_SUPERSEDES', doc.versionId);
    if (i > 0 && doc.supersedesVersionId !== ordered[i - 1].versionId) fail('VERSION_CHAIN_BROKEN', doc.versionId);
    for (const item of doc.items) for (const edge of item.supersedes) {
      const old = items.get(edge.itemId);
      if (!old) fail('SUPERSEDED_ITEM_NOT_FOUND', edge.itemId);
      if (itemVersions.get(edge.itemId) >= doc.version) fail('SUPERSESSION_NOT_PRIOR_VERSION', `${item.itemId}->${old.itemId}`);
      if (item.recordedAt < old.recordedAt) fail('SUPERSESSION_TIME_REVERSED', `${item.itemId}->${old.itemId}`);
      if (item.source.authorityRank < old.source.authorityRank) fail('SOURCE_PRECEDENCE_VIOLATION', `${item.itemId}->${old.itemId}`);
    }
  }
  for (const item of items.values()) {
    if (item.source.originKind === 'MODEL_INFERENCE') {
      for (const basisId of item.source.inference.basedOnItemIds) if (!items.has(basisId)) fail('INFERENCE_BASIS_NOT_FOUND', basisId);
    }
  }
  const visiting = new Set(); const visited = new Set();
  function walk(id) {
    if (visiting.has(id)) fail('SUPERSESSION_CYCLE', id);
    if (visited.has(id)) return;
    visiting.add(id); for (const next of edges.get(id) ?? []) walk(next); visiting.delete(id); visited.add(id);
  }
  for (const id of edges.keys()) walk(id);
}

const files = (await readdir(vectorDir)).filter((name) => name.endsWith('.json')).sort();
const results = [];
for (const file of files) {
  const vector = JSON.parse(await readFile(path.join(vectorDir, file), 'utf8'));
  let actual = 'PASS'; let code = null;
  try { validateHistory(vector.documents); } catch (error) { actual = 'FAIL'; code = error.code ?? 'UNEXPECTED'; }
  assert.equal(actual, vector.expect, `${file}: expected ${vector.expect}, got ${actual} (${code})`);
  if (vector.expectedError) assert.equal(code, vector.expectedError, `${file}: wrong error`);
  results.push({ file, status: 'PASS', observed: actual, code });
}
console.log(JSON.stringify({ suite: 'SCP-0.1.0-CONFORMANCE', status: 'PASS', vectors: results.length, results }, null, 2));
