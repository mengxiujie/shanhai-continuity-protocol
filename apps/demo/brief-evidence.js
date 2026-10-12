const files = [
  ['../../deployment/raw-browser-evidence.brief-part1.monad-testnet.2026-10-12.json', 'dea1b5ce0deddf72ac8d9a116e97414f2e227e68c12f6e6cfc66285f381c63b2'],
  ['../../deployment/raw-browser-evidence.brief-part2.monad-testnet.2026-10-12.json', '17e13b028035ef5daab8a3ec272c9602d6c302476509193080ab659e8d60e5be'],
];
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const hex = (bytes) => Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
const downstream = ['envelopeFetches', 'decryptAttempts', 'contextAssemblies', 'controlledGatewayCalls'];
const rpcUrl = 'https://testnet-rpc.monad.xyz';
async function rpc(method, params, id) {
  const response = await fetch(rpcUrl, { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }) });
  if (!response.ok) throw new Error(`RPC_HTTP_${response.status}`);
  const body = await response.json();
  if (body.error) throw new Error(`RPC_ERROR_${body.error.code}`);
  return body.result;
}
async function readPart([url, expected], index) {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Part ${index + 1}: HTTP ${response.status}`);
  const bytes = await response.arrayBuffer();
  const hash = hex(await crypto.subtle.digest('SHA-256', bytes));
  const node = document.querySelector(`#hash${index + 1}`);
  node.textContent = `${hash} · ${hash === expected ? 'MATCH' : 'MISMATCH'}`;
  node.classList.add(hash === expected ? 'ok' : 'bad');
  if (hash !== expected) throw new Error(`Part ${index + 1}: HASH_MISMATCH`);
  return JSON.parse(new TextDecoder().decode(bytes));
}
function gateCard(title, record, version, schedule) {
  const outcome = record.receipt.outcome;
  if (record.receipt.version !== version || record.counters.delta.chainChecks !== 1) throw new Error(`${title}: WRONG_GATE_BINDING`);
  for (const key of downstream) if (record.counters.delta[key] !== (schedule ? 1 : 0)) throw new Error(`${title}: WRONG_EXECUTION_DELTA`);
  const fields = record.result?.announcement?.receivedFields;
  if (schedule && (fields?.schedule !== schedule || record.result.announcement.evidenceType !== 'DETERMINISTIC_TEMPLATE_NOT_AI')) throw new Error(`${title}: WRONG_APPROVED_OUTPUT`);
  if (!schedule && record.result !== undefined) throw new Error(`${title}: DENIAL_HAS_RESULT`);
  const details = schedule ? `${escapeHtml(fields.title)}<br>${escapeHtml(fields.schedule)} · ${escapeHtml(fields.venue)}<br><small>One approved item · fixed template, not AI output</small>` : 'No new brief or announcement delivered';
  return `<article class="card proof-card${schedule ? '' : ' denied'}"><h2>${escapeHtml(title)} <span>${escapeHtml(outcome)}</span></h2><p>${details}</p><dl><dt>Chain checks</dt><dd>1</dd><dt>Envelope fetch</dt><dd>${record.counters.delta.envelopeFetches}</dd><dt>Decrypt</dt><dd>${record.counters.delta.decryptAttempts}</dd><dt>Context assembly</dt><dd>${record.counters.delta.contextAssemblies}</dd><dt>Controlled gateway</dt><dd>${record.counters.delta.controlledGatewayCalls}</dd><dt>Receipt block</dt><dd>${escapeHtml(record.receipt.blockNumber)}</dd></dl></article>`;
}
async function load() {
  const [a, b] = await Promise.all(files.map(readPart));
  if (a.scenario.id !== 'CLIENT_BRIEF_HANDOFF' || b.scenario.id !== a.scenario.id || a.realModelBehavior !== 'NOT_MEASURED' || b.realModelBehavior !== 'NOT_MEASURED') throw new Error('WRONG_SCENARIO');
  if (a.parameters.assetId !== b.parameters.assetId || a.parameters.consentId !== b.parameters.consentId || a.parameters.consentIdV2 !== b.parameters.consentIdV2 || a.configuration.registryAddress !== b.configuration.registryAddress) throw new Error('SPLIT_SESSION_MISMATCH');
  const [v1, stale] = a.results.filter((result) => result.status === 'ACTIVE_CONTEXT_DELIVERED' || result.status === 'DENIED');
  const [v2, revoked] = b.results.filter((result) => result.status === 'ACTIVE_CONTEXT_DELIVERED' || result.status === 'DENIED');
  if ([v1?.receipt?.outcome, stale?.receipt?.outcome, v2?.receipt?.outcome, revoked?.receipt?.outcome].join(',') !== 'ACTIVE,VERSION_STALE,ACTIVE,REVOKED') throw new Error('FOUR_OUTCOME_SEQUENCE_MISSING');
  for (const result of [v1, v2]) {
    const delivered = JSON.stringify({ messages: result.messages, announcement: result.result.announcement });
    if (delivered.includes('SYNTHETIC_INTERNAL_NOTE') || delivered.includes('SYNTHETIC_UNAPPROVED_SUGGESTION') || result.result.announcement.receivedItemIds.length !== 1) throw new Error('SCOPE_LEAK');
  }
  document.querySelector('#stages').innerHTML = [gateCard('1 · Friday approved', v1, 1, 'Friday, 19:00'), gateCard('2 · Old version refused', stale, 1, null), gateCard('3 · Saturday re-approved', v2, 2, 'Saturday, 15:00'), gateCard('4 · Revoked access refused', revoked, 2, null)].join('');
  const registry = document.querySelector('#registry');
  registry.textContent = a.configuration.registryAddress;
  registry.href = `https://testnet.monadscan.com/address/${encodeURIComponent(a.configuration.registryAddress)}`;
  if (b.receipts.length !== 5 || b.receipts.some((receipt) => receipt.status !== 'CONFIRMED_ON_TESTNET')) throw new Error('TRANSACTION_SEQUENCE_INCOMPLETE');
  document.querySelector('#transactions').innerHTML = b.receipts.map((receipt) => `<a class="button alt" target="_blank" rel="noreferrer" href="https://testnet.monadscan.com/tx/${escapeHtml(receipt.txHash)}">${escapeHtml(receipt.action)}</a>`).join('');
  const verifyButton = document.querySelector('#verify-live');
  verifyButton.disabled = false;
  verifyButton.addEventListener('click', async () => {
    verifyButton.disabled = true;
    const status = document.querySelector('#live-status');
    status.textContent = 'Reading Monad Testnet receipts; no wallet connection or transaction is requested…';
    try {
      const chain = await rpc('eth_chainId', [], 1);
      if (Number.parseInt(chain, 16) !== 10143) throw new Error('WRONG_RPC_CHAIN');
      const checks = await Promise.all(b.receipts.map((entry, index) => rpc('eth_getTransactionReceipt', [entry.txHash], index + 2)));
      for (const [index, receipt] of checks.entries()) {
        const archived = b.receipts[index];
        if (!receipt || receipt.status !== '0x1' || receipt.transactionHash.toLowerCase() !== archived.txHash.toLowerCase() ||
          receipt.blockNumber.toLowerCase() !== archived.blockNumber.toLowerCase() || receipt.blockHash.toLowerCase() !== archived.blockHash.toLowerCase()) throw new Error(`${archived.action}: RECEIPT_MISMATCH`);
      }
      status.textContent = 'LIVE READ-ONLY CHECK PASS · Monad 10143 · 5/5 successful receipts and block hashes match the archive. Agent B execution remains project-instrumented.';
      status.className = 'ok';
    } catch (error) {
      status.textContent = `LIVE CHECK INCOMPLETE · ${error.message}. Archived results above remain separately hash-verified.`;
      status.className = 'bad';
    } finally { verifyButton.disabled = false; }
  });
}
load().catch((error) => { document.querySelector('#stages').innerHTML = `<article class="card"><h2 class="bad">Evidence unavailable</h2><p>${escapeHtml(error.message)}</p></article>`; });
