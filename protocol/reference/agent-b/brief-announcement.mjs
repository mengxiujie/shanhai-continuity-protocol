import { invariant } from '../../src/errors.mjs';

// Render only the verified, decrypted disclosure supplied by Agent B.
// There is no lookup of the owner's fixture, no model call and no invented copy.
export function renderBriefAnnouncement(disclosure) {
  invariant(disclosure?.dataClass === 'SYNTHETIC', 'BRIEF_SYNTHETIC_ONLY');
  invariant(disclosure.items?.length === 1 && disclosure.scope?.itemIds?.length === 1, 'BRIEF_EXACT_SCOPE_REQUIRED');
  const item = disclosure.items[0];
  invariant(item.itemId === disclosure.scope.itemIds[0] && item.source?.reviewStatus === 'USER_CONFIRMED', 'BRIEF_CONFIRMED_ITEM_REQUIRED');
  let fields;
  try { fields = JSON.parse(item.statement); } catch { invariant(false, 'BRIEF_FIELDS_INVALID'); }
  invariant(fields && !Array.isArray(fields) && Object.keys(fields).length === 3 &&
    ['title', 'schedule', 'venue'].every((key) => typeof fields[key] === 'string' && fields[key].length > 0 && fields[key].length <= 160), 'BRIEF_FIELDS_INVALID');
  return {
    evidenceType: 'DETERMINISTIC_TEMPLATE_NOT_AI', sourceVersion: disclosure.version,
    sourceVersionId: disclosure.versionId, receivedItemIds: [item.itemId], receivedFields: fields,
    text: `${fields.title}\n${fields.schedule} · ${fields.venue}\nJoin us for ${fields.title} at ${fields.venue} on ${fields.schedule}.`,
  };
}
