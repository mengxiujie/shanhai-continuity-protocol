import { DemoMonadProvider, MonadConsentRegistryAdapter } from './monad-gate.js';

const $ = (id) => document.getElementById(id);
const enc = new TextEncoder();
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const state = {
  act: 1,
  assetId: 'asset-synthetic-001',
  consentId: 'consent-synthetic-001',
  agent: 'agent-b-synthetic',
  version: 1,
  envelope: null,
  metrics: { envelope: 0, decrypt: 0, model: 0, outcome: '—' },
};
const chain = new DemoMonadProvider();
const gate = new MonadConsentRegistryAdapter({ chainId: 'MONAD-TESTNET-DEMO', registryAddress: '0xDEMO', provider: chain });

async function digest(text) {
  return [...new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(text)))]
    .map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function createEnvelope(statement) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    protocol: 'shanhai-continuity', protocolVersion: '0.1.0', dataClass: 'SYNTHETIC',
    packageId: state.assetId, versionId: `version-${state.version}`, version: state.version,
    recordedAt: now, scope: { itemIds: ['item-001'] },
    items: [{
      itemId: 'item-001', statement,
      source: { originKind: 'USER_UTTERANCE', reviewStatus: 'USER_CONFIRMED', authorityClass: 'USER_CONFIRMED', authorityRank: 400 },
      validTime: { from: now, to: null, precision: 'INSTANT' }, recordedAt: now, supersedes: [],
    }],
  };
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(payload))));
  return { payload, key, iv, ciphertext, commitment: await digest(JSON.stringify(payload)) };
}

function setStatus(label, text, kind = 'neutral') {
  $('status').className = `status ${kind}`;
  $('status').innerHTML = `<strong>${label}</strong><span>${text}</span>`;
}

function setAct(number) {
  state.act = number;
  document.querySelectorAll('.step').forEach((element) => element.classList.toggle('active', Number(element.dataset.act) === number));
}

function renderMetrics({ envelope = 0, decrypt = 0, model = 0, outcome = '—' }) {
  state.metrics = { envelope, decrypt, model, outcome };
  $('envelopeCount').textContent = envelope;
  $('decryptCount').textContent = decrypt;
  $('modelCount').textContent = model;
  $('outcomeCount').textContent = outcome;
  $('outcomeCount').className = outcome === 'ACTIVE' ? 'metric-good' : outcome === '—' ? '' : 'metric-blocked';
}

function clearContext(message = 'Nothing has entered model context.') {
  $('context').textContent = message;
  $('context').classList.add('empty');
}

async function act1() {
  state.version = 1;
  const statement = $('statement').value.trim() || 'I want people to remember that I make complex ideas understandable.';
  state.envelope = await createEnvelope(statement);
  chain.register(state.assetId, state.envelope.commitment);
  chain.issue(state.consentId, { assetId: state.assetId, grantee: state.agent, version: 1, scopeHash: 'scope:item-001', expiresAt: 0 });
  setAct(1);
  clearContext();
  renderMetrics({ outcome: 'GRANTED' });
  setStatus('OWNER READY', 'V1 encrypted in this browser. Authorization facts are stored in DemoMonadProvider, not on a live chain.', 'good');
  $('envelope').textContent = JSON.stringify({
    dataClass: 'SYNTHETIC', version: 1, scope: ['item-001'], ciphertextBytes: state.envelope.ciphertext.length,
    plaintextOnChain: false, commitment: state.envelope.commitment,
  }, null, 2);
}

async function act2() {
  if (!state.envelope) await act1();
  const receipt = await gate.verify({ assetId: state.assetId, consentId: state.consentId, grantee: state.agent, version: 1, scopeHash: 'scope:item-001' });
  setAct(2);
  if (receipt.outcome !== 'ACTIVE') {
    clearContext(`Blocked before decryption: ${receipt.outcome}`);
    renderMetrics({ outcome: receipt.outcome });
    setStatus('BLOCKED', `Monad gate returned ${receipt.outcome}. No envelope reached Agent B.`, 'blocked');
    return;
  }
  const plain = new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: state.envelope.iv }, state.envelope.key, state.envelope.ciphertext));
  const payload = JSON.parse(plain);
  $('context').classList.remove('empty');
  $('context').textContent = `[USER CONFIRMED · scope=item-001]\nvalidTime=${payload.items[0].validTime.precision} · recordedAt=${payload.recordedAt}\n\n${payload.items[0].statement}`;
  renderMetrics({ envelope: 1, decrypt: 1, model: 1, outcome: 'ACTIVE' });
  setStatus('ACTIVE', 'The synthetic gate allowed this request. This browser decrypted one context; no gateway or independent process was called.', 'good');
}

async function act3() {
  if (!state.envelope) await act1();
  state.version = 2;
  chain.publish(state.assetId, await digest('version-2'));
  const receipt = await gate.verify({ assetId: state.assetId, consentId: state.consentId, grantee: state.agent, version: 1, scopeHash: 'scope:item-001' });
  setAct(3);
  clearContext('Old V1 context removed. No new context constructed.');
  renderMetrics({ outcome: receipt.outcome });
  setStatus(receipt.outcome, 'Owner published V2. Replaying the V1 grant stops before envelope delivery.', 'blocked');
}

async function act4() {
  if (!state.envelope) await act1();
  chain.revoke(state.consentId);
  const receipt = await gate.verify({ assetId: state.assetId, consentId: state.consentId, grantee: state.agent, version: 1, scopeHash: 'scope:item-001' });
  setAct(4);
  clearContext('Grant revoked. No content is available to model context.');
  renderMetrics({ outcome: receipt.outcome });
  setStatus(receipt.outcome, 'The owner revoked the grant. Future access is denied before envelope delivery.', 'blocked');
}

async function runAll() {
  const controls = document.querySelectorAll('.act-control, #runAll');
  controls.forEach((control) => { control.disabled = true; });
  $('runNote').textContent = 'Guided demo running…';
  try {
    await act1(); await wait(1400);
    await act2(); await wait(2200);
    await act3(); await wait(2200);
    await act4();
    $('runNote').textContent = 'Complete: grant → continue → stale → revoke.';
  } finally {
    controls.forEach((control) => { control.disabled = false; });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const acts = { 1: act1, 2: act2, 3: act3, 4: act4 };
  document.querySelectorAll('.step').forEach((step) => {
    step.onclick = () => acts[Number(step.dataset.act)]();
  });
  $('create').onclick = act1;
  $('continue').onclick = act2;
  $('change').onclick = act3;
  $('revoke').onclick = act4;
  $('runAll').onclick = runAll;
  $('reset').onclick = () => location.reload();
  renderMetrics({});
});
