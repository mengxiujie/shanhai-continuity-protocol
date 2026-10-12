// Fixed fictional client brief. Never substitute participant or customer data.
const recordedAt = 1791763200;
const confirmedSource = (suffix) => ({
  originKind: 'USER_UTTERANCE', reviewStatus: 'USER_CONFIRMED', authorityClass: 'USER_CONFIRMED', authorityRank: 400,
  sourceId: `41000000-0000-4000-8000-${suffix}`, capturedAt: recordedAt - 20,
  supportingSourceIds: [], confirmation: { eventId: `51000000-0000-4000-8000-${suffix}`, confirmedAt: recordedAt - 10 }, inference: null,
});
const item = (suffix, statement, source = confirmedSource(suffix), supersedes = []) => ({
  itemId: `31000000-0000-4000-8000-${suffix}`, statement, source,
  validTime: { from: recordedAt - 100, to: null, precision: 'INSTANT' }, recordedAt, supersedes,
});
const brief = (schedule) => JSON.stringify({ title: 'Lens Club photography meetup', schedule, venue: 'Harbor Studio' });
const first = item('000000000021', brief('Friday, 19:00'));
const privateNote = item('000000000022', 'SYNTHETIC_INTERNAL_NOTE: organizer staffing discussion; not approved for the copywriting handoff.');
const suggestion = item('000000000023', 'SYNTHETIC_UNAPPROVED_SUGGESTION: advertise free admission.', {
  originKind: 'MODEL_INFERENCE', reviewStatus: 'UNREVIEWED', authorityClass: 'MODEL_INFERENCE', authorityRank: 100,
  sourceId: '41000000-0000-4000-8000-000000000023', capturedAt: recordedAt - 15,
  supportingSourceIds: [], confirmation: null,
  inference: { model: 'synthetic-fixture-not-an-executed-model', generatedAt: recordedAt - 15, basedOnItemIds: [first.itemId] },
});
const base = { protocol: 'shanhai-continuity', protocolVersion: '0.1.0', dataClass: 'SYNTHETIC', packageId: '11000000-0000-4000-8000-000000000021', recordedAt };
export const BRIEF_DOCUMENTS = [
  { ...base, version: 1, versionId: '21000000-0000-4000-8000-000000000021', supersedesVersionId: null, items: [first, privateNote, suggestion] },
  { ...base, version: 2, versionId: '21000000-0000-4000-8000-000000000022', supersedesVersionId: '21000000-0000-4000-8000-000000000021', items: [
    item('000000000024', brief('Saturday, 15:00'), confirmedSource('000000000024'), [{ itemId: first.itemId, relation: 'CORRECTS' }]),
    privateNote, suggestion,
  ] },
];
export const BRIEF_ALLOWED_ITEM_IDS = BRIEF_DOCUMENTS.map((document) => [document.items[0].itemId]);
export const BRIEF_SCENARIO = {
  id: 'CLIENT_BRIEF_HANDOFF', dataClass: 'SYNTHETIC', outputMode: 'DETERMINISTIC_TEMPLATE_NOT_AI',
  title: '客户批准的活动简报交接',
  approved: BRIEF_DOCUMENTS.map((document) => ({ version: document.version, ...JSON.parse(document.items[0].statement) })),
  excluded: ['内部筹备备注（未选入范围）', '免费入场建议（AI 合成推断，未选入范围）'],
};
