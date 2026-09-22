import { verifyProvenanceCommitment } from './provenance.mjs';
import { invariant } from './errors.mjs';

const LABEL = {
  USER_CONFIRMED: '用户已确认',
  USER_UTTERANCE: '用户原话（未确认）',
  TRACEABLE_FACT: '可追溯事实',
  MODEL_INFERENCE: '模型推断（不得当作用户原话）',
};
const ORIGIN_LABEL = {
  USER_UTTERANCE: '用户原话',
  TRACEABLE_FACT: '可追溯事实',
  MODEL_INFERENCE: '模型推断（不得当作用户原话）',
};

function renderItem(item) {
  const source = item.source;
  const relation = item.supersedes.length
    ? `；修正关系=${item.supersedes.map((edge) => `${edge.relation}:${edge.itemId}`).join(',')}`
    : '';
  return [
    `[材料 ${item.itemId}]`,
    `权威=${LABEL[source.authorityClass]}；原始来源=${source.originKind}:${ORIGIN_LABEL[source.originKind]}；审阅=${source.reviewStatus}`,
    `有效时间=${item.validTime.from}..${item.validTime.to ?? 'open'}(${item.validTime.precision})；记录时间=${item.recordedAt}${relation}`,
    `内容=${item.statement}`,
  ].join('\n');
}

export function buildAgentBContext({ disclosure, provenanceCommitment }) {
  invariant(disclosure?.protocol === 'shanhai-continuity', 'CONTEXT_PROTOCOL_INVALID');
  invariant(Array.isArray(disclosure.items) && disclosure.items.length > 0, 'CONTEXT_EMPTY');
  invariant(Array.isArray(disclosure.scope?.itemIds), 'CONTEXT_SCOPE_INVALID');
  const allowed = new Set(disclosure.scope.itemIds);
  invariant(disclosure.items.every((item) => allowed.has(item.itemId)), 'CONTEXT_SCOPE_LEAK');
  invariant(disclosure.items.every((item) => item.source.reviewStatus !== 'USER_REJECTED'), 'CONTEXT_REJECTED_ITEM');

  verifyProvenanceCommitment({
    protocol: disclosure.protocol,
    protocolVersion: disclosure.protocolVersion,
    packageId: disclosure.packageId,
    versionId: disclosure.versionId,
    version: disclosure.version,
    supersedesVersionId: disclosure.supersedesVersionId,
    recordedAt: disclosure.recordedAt,
    items: disclosure.items,
  }, provenanceCommitment);

  const ordered = [...disclosure.items].sort((a, b) =>
    b.source.authorityRank - a.source.authorityRank || a.recordedAt - b.recordedAt || a.itemId.localeCompare(b.itemId));
  return [
    {
      role: 'system',
      content: '以下是用户按范围授权的连续性材料。必须保留来源等级与时间边界；不得把模型推断写成用户原话或客观事实；发生冲突时优先使用更高权威材料，并允许表达未知。',
    },
    { role: 'user', content: ordered.map(renderItem).join('\n\n') },
  ];
}
