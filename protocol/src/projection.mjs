import { computeProvenanceCommitment, validateProvenanceSemantics } from './provenance.mjs';
import { invariant } from './errors.mjs';

function clone(value) { return structuredClone(value); }

export function projectDisclosure(document, { allowedItemIds }) {
  validateProvenanceSemantics(document);
  invariant(Array.isArray(allowedItemIds) && allowedItemIds.length > 0, 'SCOPE_EMPTY');
  invariant(new Set(allowedItemIds).size === allowedItemIds.length, 'SCOPE_DUPLICATE_ITEM');
  const byId = new Map(document.items.map((item) => [item.itemId, item]));
  for (const itemId of allowedItemIds) invariant(byId.has(itemId), 'SCOPE_ITEM_NOT_FOUND', itemId);

  const selected = allowedItemIds.map((itemId) => byId.get(itemId));
  invariant(selected.every((item) => item.source.reviewStatus !== 'USER_REJECTED'), 'SCOPE_REJECTED_ITEM');

  const items = selected.map(clone);
  const disclosure = {
    protocol: document.protocol,
    protocolVersion: document.protocolVersion,
    dataClass: document.dataClass,
    packageId: document.packageId,
    versionId: document.versionId,
    version: document.version,
    supersedesVersionId: document.supersedesVersionId,
    recordedAt: document.recordedAt,
    scope: { itemIds: [...allowedItemIds] },
    items,
  };
  return {
    disclosure,
    provenanceCommitment: computeProvenanceCommitment({ ...document, items }),
  };
}
