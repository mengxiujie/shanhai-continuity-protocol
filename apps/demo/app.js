import { DemoMonadProvider, MonadConsentRegistryAdapter } from './monad-gate.js';

const $ = (id) => document.getElementById(id);
const enc = new TextEncoder();
const state = { act: 1, assetId: 'asset-synthetic-001', consentId: 'consent-synthetic-001', agent: 'agent-b-synthetic', version: 1, revoked: false, envelope: null };
const chain = new DemoMonadProvider();
const gate = new MonadConsentRegistryAdapter({ chainId: 'MONAD-TESTNET-DEMO', registryAddress: '0xDEMO', provider: chain });

async function digest(text) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(text)))].map((b) => b.toString(16).padStart(2, '0')).join(''); }
async function createEnvelope(statement) {
  const payload = { protocol: 'shanhai-continuity', protocolVersion: '0.1.0', dataClass: 'SYNTHETIC', packageId: state.assetId, versionId: `version-${state.version}`, version: state.version, recordedAt: Math.floor(Date.now()/1000), scope: { itemIds: ['item-001'] }, items: [{ itemId: 'item-001', statement, source: { originKind: 'USER_UTTERANCE', reviewStatus: 'USER_CONFIRMED', authorityClass: 'USER_CONFIRMED', authorityRank: 400 }, validTime: { from: Math.floor(Date.now()/1000), to: null, precision: 'INSTANT' }, recordedAt: Math.floor(Date.now()/1000), supersedes: [] }] };
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(payload))));
  return { payload, key, iv, ciphertext, commitment: await digest(JSON.stringify(payload)) };
}
function show(text, good = true) { $('status').innerHTML = `<span class="${good ? 'ok' : 'bad'}">${good ? 'PASS' : 'BLOCKED'}</span>\n${text}`; }
function setAct(n) { state.act = n; document.querySelectorAll('.step').forEach((el) => el.classList.toggle('active', Number(el.dataset.act) === n)); }

async function act1() {
  state.version = 1; state.revoked = false; const statement = $('statement').value.trim() || '我希望把复杂问题讲清楚。';
  state.envelope = await createEnvelope(statement); chain.register(state.assetId, state.envelope.commitment); chain.issue(state.consentId, { assetId: state.assetId, grantee: state.agent, version: 1, scopeHash: 'scope:item-001', expiresAt: 0 });
  setAct(1); show('V1 已在 Owner 浏览器生成。正文已进入 AES-GCM 密文；演示链登记了最小授权事实。'); $('envelope').textContent = JSON.stringify({ version: 1, ciphertextBytes: state.envelope.ciphertext.length, commitment: state.envelope.commitment }, null, 2);
}
async function act2() { if (!state.envelope) await act1(); const receipt = await gate.verify({ assetId: state.assetId, consentId: state.consentId, grantee: state.agent, version: 1, scopeHash: 'scope:item-001' }); setAct(2); if (receipt.outcome !== 'ACTIVE') return show(`Monad 门禁结果：${receipt.outcome}`, false); const plain = new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: state.envelope.iv }, state.envelope.key, state.envelope.ciphertext)); $('context').textContent = `[用户已确认 | validTime=INSTANT | recordedAt=${state.envelope.payload.recordedAt}]\n${JSON.parse(plain).items[0].statement}`; show(`Monad 门禁：ACTIVE\nAgent B 本地解密完成\n模型调用：1（合成计数）`); }
async function act3() { if (!state.envelope) await act1(); state.version = 2; chain.publish(state.assetId, await digest('version-2')); const receipt = await gate.verify({ assetId: state.assetId, consentId: state.consentId, grantee: state.agent, version: 1, scopeHash: 'scope:item-001' }); setAct(3); show(`创建 V2 后重放 V1 授权\nMonad 门禁：${receipt.outcome}\n旧 envelope 返回：0\n模型调用：0`, false); }
async function act4() { if (!state.envelope) await act1(); chain.revoke(state.consentId); const receipt = await gate.verify({ assetId: state.assetId, consentId: state.consentId, grantee: state.agent, version: 1, scopeHash: 'scope:item-001' }); setAct(4); show(`撤销后重新请求\nMonad 门禁：${receipt.outcome}\n旧内容解密：0\n模型调用：0`, false); }

document.addEventListener('DOMContentLoaded', () => { $('create').onclick = act1; $('continue').onclick = act2; $('change').onclick = act3; $('revoke').onclick = act4; $('reset').onclick = () => location.reload(); });
