import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRIEF_DOCUMENTS, BRIEF_ALLOWED_ITEM_IDS } from '../protocol/reference/owner-web/brief-fixture.mjs';
import { fixedScopeParameters } from '../protocol/reference/owner-web/sprint-runtime.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const parts = [
  ['raw-browser-evidence.brief-part1.monad-testnet.2026-10-12.json', 'dea1b5ce0deddf72ac8d9a116e97414f2e227e68c12f6e6cfc66285f381c63b2'],
  ['raw-browser-evidence.brief-part2.monad-testnet.2026-10-12.json', '17e13b028035ef5daab8a3ec272c9602d6c302476509193080ab659e8d60e5be'],
];
const loaded = [];
for (const [name, expectedHash] of parts) {
  const bytes = await readFile(join(root, 'deployment', name));
  const actualHash = createHash('sha256').update(bytes).digest('hex');
  assert.equal(actualHash, expectedHash, `${name}: raw hash`);
  loaded.push(JSON.parse(bytes.toString('utf8')));
}
const [first, second] = loaded;
assert.equal(first.scenario.id, 'CLIENT_BRIEF_HANDOFF');
assert.deepEqual(second.scenario, first.scenario);
assert.equal(first.realModelBehavior, 'NOT_MEASURED');
assert.equal(second.realModelBehavior, 'NOT_MEASURED');
assert.deepEqual(second.parameters, first.parameters);
assert.equal(second.configuration.registryAddress, first.configuration.registryAddress);
assert.equal(second.configuration.account.toLowerCase(), first.configuration.account.toLowerCase());
assert.notEqual(first.parameters.consentId, first.parameters.consentIdV2);
assert.notEqual(first.parameters.scopeHash, first.parameters.scopeHashV2);

for (const [index, document] of BRIEF_DOCUMENTS.entries()) {
  const scope = await fixedScopeParameters(document, BRIEF_ALLOWED_ITEM_IDS[index]);
  assert.equal(scope.contentCommitment, first.parameters[`contentCommitmentV${index + 1}`]);
  assert.equal(scope.scopeHash, first.parameters[index ? 'scopeHashV2' : 'scopeHash']);
}

const actions = ['registerAsset', 'issueConsent', 'publishVersion', 'issueConsentV2', 'revokeConsentV2'];
assert.deepEqual(first.receipts.map((entry) => entry.action), actions.slice(0, 3));
assert.deepEqual(second.receipts.map((entry) => entry.action), actions);
assert.deepEqual(second.receipts.slice(0, 3), first.receipts);
assert.equal(new Set(second.receipts.map((entry) => entry.txHash)).size, 5);
for (const receipt of second.receipts) {
  assert.equal(receipt.status, 'CONFIRMED_ON_TESTNET');
  assert.match(receipt.txHash, /^0x[0-9a-f]{64}$/i);
  assert.equal(receipt.chainId, 10143);
}
assert.deepEqual(first.results.map((entry) => entry.action ?? entry.receipt?.outcome),
  ['registerAsset', 'issueConsent', 'ACTIVE', 'publishVersion', 'VERSION_STALE']);
assert.deepEqual(second.results.map((entry) => entry.action ?? entry.receipt?.outcome),
  ['ACTIVE', 'revokeConsentV2', 'REVOKED']);

const gates = [first.results[2], first.results[4], second.results[0], second.results[2]];
const expected = [
  ['ACTIVE', 1, 'Friday, 19:00'],
  ['VERSION_STALE', 1, null],
  ['ACTIVE', 2, 'Saturday, 15:00'],
  ['REVOKED', 2, null],
];
const downstream = ['envelopeFetches', 'envelopeReceived', 'independentChainChecks', 'decryptAttempts', 'decryptSucceeded', 'contextAssemblies', 'controlledGatewayCalls'];
for (const [index, gate] of gates.entries()) {
  const [outcome, version, schedule] = expected[index];
  const consent = first.parameters[version === 1 ? 'consentId' : 'consentIdV2'];
  const scope = first.parameters[version === 1 ? 'scopeHash' : 'scopeHashV2'];
  // A stale receipt reports the chain's current V2 commitment, not the old request's V1 commitment.
  const commitment = first.parameters[`contentCommitmentV${outcome === 'VERSION_STALE' ? 2 : version}`];
  assert.equal(gate.receipt.outcome, outcome);
  assert.equal(gate.receipt.chainId, 10143);
  assert.equal(gate.receipt.version, version);
  assert.equal(gate.receipt.consentId, consent);
  assert.equal(gate.receipt.scopeHash, scope);
  assert.equal(gate.receipt.assetCommitment, commitment);
  assert.equal(gate.counters.delta.chainChecks, 1);
  assert.equal(gate.realModelBehavior, 'NOT_MEASURED');
  for (const key of downstream) assert.equal(gate.counters.delta[key], schedule ? 1 : 0, `${outcome}: ${key}`);
  if (!schedule) {
    assert.equal(gate.status, 'DENIED');
    assert.equal(gate.messages, undefined);
    assert.equal(gate.result, undefined);
    continue;
  }
  assert.equal(gate.status, 'ACTIVE_CONTEXT_DELIVERED');
  assert.equal(gate.ownerReceipt.outcome, 'ACTIVE');
  assert.equal(gate.ownerReceipt.version, version);
  const announcement = gate.result.announcement;
  assert.equal(announcement.evidenceType, 'DETERMINISTIC_TEMPLATE_NOT_AI');
  assert.equal(announcement.sourceVersion, version);
  assert.deepEqual(announcement.receivedItemIds, BRIEF_ALLOWED_ITEM_IDS[version - 1]);
  assert.deepEqual(announcement.receivedFields, JSON.parse(BRIEF_DOCUMENTS[version - 1].items[0].statement));
  assert.equal(announcement.receivedFields.schedule, schedule);
  const delivered = JSON.stringify({ messages: gate.messages, announcement });
  assert.ok(!delivered.includes('SYNTHETIC_INTERNAL_NOTE'));
  assert.ok(!delivered.includes('SYNTHETIC_UNAPPROVED_SUGGESTION'));
  assert.equal(gate.messages.filter((message) => message.role === 'user').length, 1);
}

console.log(JSON.stringify({ status: 'PASS', evidenceType: 'TWO_ORIGINAL_BROWSER_EXPORTS', hashes: parts.map(([name, sha256]) => ({ name, sha256 })),
  transactionCount: 5, gateOutcomes: expected.map(([outcome, version]) => ({ outcome, version })), realModelBehavior: 'NOT_MEASURED' }, null, 2));
