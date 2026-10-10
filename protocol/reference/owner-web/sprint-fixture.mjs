// Fixed fictional material only. Never replace this fixture with a participant's history.
const recordedAt = 1791676800;
const source = (suffix) => ({
  originKind: 'USER_UTTERANCE', reviewStatus: 'USER_CONFIRMED', authorityClass: 'USER_CONFIRMED', authorityRank: 400,
  sourceId: `40000000-0000-4000-8000-${suffix}`, capturedAt: recordedAt - 20,
  supportingSourceIds: [], confirmation: { eventId: `50000000-0000-4000-8000-${suffix}`, confirmedAt: recordedAt - 10 }, inference: null,
});
const item = (suffix, statement, supersedes = []) => ({
  itemId: `30000000-0000-4000-8000-${suffix}`, statement, source: source(suffix),
  validTime: { from: recordedAt - 100, to: null, precision: 'INSTANT' }, recordedAt, supersedes,
});
const base = { protocol: 'shanhai-continuity', protocolVersion: '0.1.0', dataClass: 'SYNTHETIC', packageId: '10000000-0000-4000-8000-000000000011', recordedAt };
const first = item('000000000011', 'Synthetic preference: explain complex ideas briefly; give the result first, then the evidence.');
const excluded = item('000000000012', 'Synthetic private note: this item must never enter Agent B context for this grant.');
export const SPRINT_DOCUMENTS = [
  { ...base, version: 1, versionId: '20000000-0000-4000-8000-000000000011', supersedesVersionId: null, items: [first, excluded] },
  { ...base, version: 2, versionId: '20000000-0000-4000-8000-000000000012', supersedesVersionId: '20000000-0000-4000-8000-000000000011', items: [item('000000000013', 'Synthetic correction: for this task I want a detailed explanation, not only a brief conclusion.', [{ itemId: first.itemId, relation: 'CORRECTS' }]), excluded] },
];
export const SPRINT_ALLOWED_ITEM_IDS = SPRINT_DOCUMENTS.map((document) => [document.items[0].itemId]);
