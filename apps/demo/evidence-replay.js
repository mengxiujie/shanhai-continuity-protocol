import { SPRINT_DOCUMENTS } from '../../protocol/reference/owner-web/sprint-fixture.mjs';

const RAW_URL = '../../deployment/raw-browser-evidence.monad-testnet.2026-10-11.json';
const EXPECTED_HASH = '49bd59c0ff054fbf2ef82ab009b1bccefaf88890240ff5b18b0d0cc8225a9864';
const EXPLORER = 'https://testnet.monadscan.com';

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const hex = (bytes) => Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
const metric = (delta, key) => delta?.[key] ?? 'NOT_RECORDED';

function stageCard(title, result, denied = false) {
  const outcome = result?.receipt?.outcome ?? 'UNKNOWN';
  const delta = result?.counters?.delta ?? {};
  return `<article class="card replay-card${denied ? ' denied' : ''}">
    <h2><span>${escapeHtml(title)}</span><span class="tag ${denied ? 'bad' : 'ok'}">${escapeHtml(outcome)}</span></h2>
    <p><code>${escapeHtml(result?.status ?? 'MISSING')}</code></p>
    <dl class="metric-list">
      <dt>Envelope fetch</dt><dd>${escapeHtml(metric(delta, 'envelopeFetches'))}</dd>
      <dt>Independent B check</dt><dd>${escapeHtml(metric(delta, 'independentChainChecks'))}</dd>
      <dt>Decrypt</dt><dd>${escapeHtml(metric(delta, 'decryptAttempts'))}</dd>
      <dt>Context assembly</dt><dd>${escapeHtml(metric(delta, 'contextAssemblies'))}</dd>
      <dt>Controlled gateway</dt><dd>${escapeHtml(metric(delta, 'controlledGatewayCalls'))}</dd>
      <dt>Block</dt><dd>${escapeHtml(result?.receipt?.blockNumber ?? result?.ownerReceipt?.blockNumber ?? '—')}</dd>
    </dl>
  </article>`;
}

async function load() {
  const response = await fetch(RAW_URL, { cache: 'no-store' });
  if (!response.ok) throw new Error(`EVIDENCE_HTTP_${response.status}`);
  const bytes = await response.arrayBuffer();
  const actualHash = hex(await crypto.subtle.digest('SHA-256', bytes));
  const evidence = JSON.parse(new TextDecoder().decode(bytes));
  const registry = evidence.configuration.registryAddress;
  const link = document.querySelector('#registry');
  link.textContent = registry;
  link.href = `${EXPLORER}/address/${registry}`;
  document.querySelector('#model').textContent = evidence.realModelBehavior;
  const hashNode = document.querySelector('#hash');
  hashNode.textContent = `${actualHash} · ${actualHash === EXPECTED_HASH ? 'MATCH' : 'MISMATCH'}`;
  hashNode.className = `hash ${actualHash === EXPECTED_HASH ? 'ok-text' : 'bad-text'}`;
  if (actualHash !== EXPECTED_HASH) throw new Error('EVIDENCE_HASH_MISMATCH');

  const gateResults = evidence.results.filter((result) => ['ACTIVE_CONTEXT_DELIVERED', 'DENIED'].includes(result.status));
  const active = gateResults.find((result) => result.receipt?.outcome === 'ACTIVE');
  const stale = gateResults.find((result) => result.receipt?.outcome === 'VERSION_STALE');
  const revoked = gateResults.find((result) => result.receipt?.outcome === 'REVOKED');
  if (!active || !stale || !revoked) throw new Error('RECORDED_SEQUENCE_INCOMPLETE');
  const messages = (active.messages ?? []).map((message) => message.content).join('\n');
  const firstStatement = SPRINT_DOCUMENTS[0].items[0].statement;
  const excludedStatement = SPRINT_DOCUMENTS[0].items[1].statement;
  if (!messages.includes(firstStatement) || messages.includes(excludedStatement)) throw new Error('RECORDED_SCOPE_MISMATCH');
  document.querySelector('#v1-material').textContent = firstStatement;
  document.querySelector('#v2-material').textContent = SPRINT_DOCUMENTS[1].items[0].statement;
  document.querySelector('#scope-note').textContent = 'Recorded ACTIVE context contains the authorized preference. The out-of-scope synthetic private note is absent.';
  document.querySelector('#stages').innerHTML = [
    stageCard('1 · Authorized delivery', active),
    stageCard('2 · Version corrected', stale, true),
    stageCard('3 · Consent revoked', revoked, true),
  ].join('');

  const labels = { registerAsset: 'Register V1', issueConsent: 'Grant V1', publishVersion: 'Publish V2', revokeConsent: 'Revoke consent' };
  document.querySelector('#transactions').innerHTML = evidence.receipts.map((receipt) =>
    `<a class="button alt" target="_blank" rel="noreferrer" href="${EXPLORER}/tx/${escapeHtml(receipt.txHash)}">${escapeHtml(labels[receipt.action] ?? receipt.action)} · ${escapeHtml(receipt.status)}</a>`
  ).join('');
}

load().catch((error) => {
  document.querySelector('#stages').innerHTML = `<article class="card"><h2 class="bad-text">Evidence unavailable</h2><pre>${escapeHtml(error.message)}</pre></article>`;
});
