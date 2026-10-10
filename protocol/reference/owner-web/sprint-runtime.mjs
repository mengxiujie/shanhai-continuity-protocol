import { fork } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { getAddress } from 'ethers';
import { projectDisclosure } from '../../src/projection.mjs';
import { invariant } from '../../src/errors.mjs';
import { scopeHash } from '../shared/webcrypto.mjs';
import { contentCommitment, scopeCommitmentBytes32 } from '../shared/content-commitment.mjs';
import { createEncryptedGrantEnvelope } from './envelope.mjs';
import { authorizedRelease } from './authorized-release.mjs';
import { InMemoryRequestNonceStore, createRequestChallenge } from '../agent-b/request-identity.mjs';
import { MonadConsentRegistryAdapter } from '../../../apps/demo/monad-gate.js';
import { MonadConsentRegistryRpcProvider, MonadJsonRpcClient } from '../../../apps/demo/monad-rpc-provider.js';

export const REGISTRY_SELECTORS = { getAsset: '0x2cc3ce80', getConsent: '0x7715ae34' };
const childPath = fileURLToPath(new URL('../agent-b/gated-process.mjs', import.meta.url));
const B_COUNTERS = ['envelopeReceived', 'independentChainChecks', 'decryptAttempts', 'decryptSucceeded', 'contextAssemblies', 'controlledGatewayCalls'];

export async function fixedScopeParameters(document, allowedItemIds) {
  invariant(document?.dataClass === 'SYNTHETIC', 'SPRINT_SYNTHETIC_ONLY');
  const { disclosure } = projectDisclosure(document, { allowedItemIds });
  return { version: document.version, scopeHash: scopeCommitmentBytes32(await scopeHash(allowedItemIds)), contentCommitment: contentCommitment(disclosure) };
}

export async function createSprintRuntime({ rpcUrl, registryAddress, assetId, consentId, grantee, domain = 'localhost', document, allowedItemIds, agentTimeoutMs = 30000 }) {
  const normalizedGrantee = getAddress(grantee).toLowerCase();
  const normalizedRegistry = getAddress(registryAddress).toLowerCase();
  invariant(/^0x[0-9a-fA-F]{64}$/.test(assetId) && /^0x[0-9a-fA-F]{64}$/.test(consentId), 'SPRINT_IDS_INVALID');
  const publicParameters = { ...await fixedScopeParameters(document, allowedItemIds), assetId: assetId.toLowerCase(), consentId: consentId.toLowerCase(), grantee: normalizedGrantee, registryAddress: normalizedRegistry, chainId: 10143 };
  const context = { domain, chainId: 10143, registry: normalizedRegistry };
  const counters = { chainChecks: 0, envelopeFetches: 0, ...Object.fromEntries(B_COUNTERS.map((key) => [key, 0])) };
  const nonceStore = new InMemoryRequestNonceStore();
  const child = fork(childPath, [], { stdio: ['ignore', 'ignore', 'pipe', 'ipc'], windowsHide: true });
  let sequence = 0;
  let closed = false;
  let continuationQueue = Promise.resolve();
  const pending = new Map();
  child.stderr.resume();
  child.on('message', (response) => { const entry = pending.get(response.id); if (entry) { clearTimeout(entry.timer); pending.delete(response.id); entry.resolve(response); } });
  const rejectPending = () => { for (const entry of pending.values()) { clearTimeout(entry.timer); entry.reject(new Error('AGENT_PROCESS_EXITED')); } pending.clear(); };
  child.on('error', rejectPending); child.on('exit', rejectPending);
  const send = (type, payload = {}) => new Promise((resolve, reject) => {
    if (!child.connected) return reject(new Error('AGENT_PROCESS_NOT_CONNECTED'));
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); const error = new Error('AGENT_PROCESS_TIMEOUT'); error.code = 'AGENT_PROCESS_TIMEOUT'; reject(error); }, type === 'continue' ? agentTimeoutMs : 30000);
    pending.set(id, { resolve, reject, timer });
    child.send({ type, id, ...payload }, (error) => { if (error && pending.has(id)) { clearTimeout(timer); pending.delete(id); reject(error); } });
  });
  const close = async () => { if (closed) return; closed = true; try { await send('close'); } finally { if (child.connected) child.disconnect(); child.kill(); } };
  try {
    const agent = await send('initialize', { config: { rpcUrl, registryAddress: normalizedRegistry, grantee: normalizedGrantee, domain, selectors: REGISTRY_SELECTORS } });
    invariant(agent.ok, agent.code ?? 'AGENT_INITIALIZE_FAILED');
    const envelope = await createEncryptedGrantEnvelope({ document, allowedItemIds, consentId: publicParameters.consentId, grantee: normalizedGrantee, agentPublicJwk: agent.publicJwk });
    const envelopeStore = {
      async describeExact() { const { payloadCiphertext, wrappedPayloadKey, ...metadata } = envelope; return structuredClone(metadata); },
      async fetchExact() { return structuredClone(envelope); },
    };
    const rpc = new MonadJsonRpcClient({ rpcUrl });
    const provider = new MonadConsentRegistryRpcProvider({ rpc, registryAddress: normalizedRegistry, selectors: REGISTRY_SELECTORS });
    const gate = new MonadConsentRegistryAdapter({ chainId: 10143, registryAddress: normalizedRegistry, provider });
    return {
      publicParameters, agentPublicJwk: agent.publicJwk, agentKeyFingerprint: agent.keyFingerprint,
      ownerPid: process.pid, agentPid: agent.pid,
      async createChallenge() { invariant(!closed, 'SPRINT_SESSION_CLOSED'); return createRequestChallenge({ context, request: publicParameters, agentPublicJwk: agent.publicJwk, nonceStore }); },
      continueWithSignature(signedRequest) {
        const run = continuationQueue.then(() => execute(signedRequest));
        continuationQueue = run.catch(() => {});
        return run;
      },
      close,
    };

    async function execute(signedRequest) {
        invariant(!closed, 'SPRINT_SESSION_CLOSED');
        const before = structuredClone(counters);
        const evidence = (unknownB = false) => ({
          totals: Object.fromEntries(Object.keys(counters).map((key) => [key, unknownB && B_COUNTERS.includes(key) ? 'NOT_MEASURED' : counters[key]])),
          delta: Object.fromEntries(Object.keys(counters).map((key) => [key, unknownB && B_COUNTERS.includes(key) ? 'NOT_MEASURED' : counters[key] - before[key]])),
        });
        let sentToB = false;
        try {
          const released = await authorizedRelease({ gate, context, nonceStore, signedRequest, agentPublicJwk: agent.publicJwk, requestedItemIds: allowedItemIds, envelopeStore, counters });
          if (!released.envelope) return { status: 'DENIED', receipt: released.receipt, counters: evidence(), realModelBehavior: 'NOT_MEASURED' };
          sentToB = true;
          const reply = await send('continue', { envelope: released.envelope, signedRequest, requestedItemIds: allowedItemIds });
          for (const key of B_COUNTERS) counters[key] = reply.counters[key];
          return { status: reply.ok ? 'ACTIVE_CONTEXT_DELIVERED' : 'DENIED', code: reply.code, ownerReceipt: released.receipt, receipt: reply.receipt, counters: evidence(), messages: reply.messages, result: reply.result, ownerPid: process.pid, agentPid: agent.pid, realModelBehavior: 'NOT_MEASURED' };
        } catch (error) {
          if (sentToB) {
            // Missing IPC completion is NOT evidence of zero downstream work.
            closed = true; child.kill(); if (child.connected) child.disconnect(); rejectPending();
            return { status: 'UNKNOWN', code: error.code ?? error.message ?? 'UNKNOWN', counters: evidence(true), sessionInvalidated: true, realModelBehavior: 'NOT_MEASURED' };
          }
          return { status: 'DENIED', code: error.code ?? error.message ?? 'UNKNOWN', counters: evidence(), realModelBehavior: 'NOT_MEASURED' };
        }
    }
  } catch (error) { await close().catch(() => {}); throw error; }
}
