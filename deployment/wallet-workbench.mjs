import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { Interface, getAddress } from 'ethers';
import { SPRINT_DOCUMENTS, SPRINT_ALLOWED_ITEM_IDS } from '../protocol/reference/owner-web/sprint-fixture.mjs';
import { BRIEF_DOCUMENTS, BRIEF_ALLOWED_ITEM_IDS, BRIEF_SCENARIO } from '../protocol/reference/owner-web/brief-fixture.mjs';
import { createSprintRuntime, fixedScopeParameters } from '../protocol/reference/owner-web/sprint-runtime.mjs';

const CHAIN_ID = 10143;
const CHAIN_HEX = '0x279f';
const DEFAULT_RPC = 'https://testnet-rpc.monad.xyz';
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const BODY_LIMIT = 32768;
const ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const HASH = /^0x[0-9a-fA-F]{64}$/;
const CONTRACT_ACTIONS = new Set(['deploy', 'registerAsset', 'issueConsent', 'publishVersion', 'revokeConsent']);
const ACTIONS = new Set([...CONTRACT_ACTIONS, 'issueConsentV2', 'revokeConsentV2']);
const fail = (code, status = 400) => Object.assign(new Error(code), { status });
const bytes32 = () => `0x${randomBytes(32).toString('hex')}`;
const sha256 = (hex) => createHash('sha256').update(Buffer.from(hex.replace(/^0x/, ''), 'hex')).digest('hex');

export async function loadRegistryArtifact(artifactPath = resolve(ROOT, 'contracts/build/ConsentRegistry.json')) {
  const artifact = JSON.parse(await readFile(artifactPath, 'utf8'));
  const creation = artifact?.evm?.bytecode?.object;
  const runtime = artifact?.evm?.deployedBytecode?.object;
  if (artifact.contractName !== 'ConsentRegistry' || !artifact.compiler?.startsWith('0.8.30+') ||
      !Array.isArray(artifact.abi) || !/^(?:[0-9a-fA-F]{2})+$/.test(creation ?? '') ||
      !/^(?:[0-9a-fA-F]{2})+$/.test(runtime ?? '')) throw fail('REGISTRY_ARTIFACT_INVALID');
  const abi = new Interface(artifact.abi);
  for (const name of [...CONTRACT_ACTIONS].filter((name) => name !== 'deploy')) {
    if (!abi.getFunction(name)) throw fail('REGISTRY_ABI_INCOMPLETE');
  }
  return { abi, creation: `0x${creation}`, runtime: `0x${runtime}`.toLowerCase(), compiler: artifact.compiler };
}

function publicRpc(rpcUrl) {
  const url = new URL(rpcUrl);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw fail('RPC_CONFIGURATION_INVALID');
  return async (method, params = []) => {
    // A configured, fixed RPC only; no browser-selected URL or generic proxy route.
    const response = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }), signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw fail('CHAIN_UNAVAILABLE', 503);
    const result = await response.json();
    if (result.error || result.result === undefined) throw fail('CHAIN_RPC_ERROR', 503);
    return result.result;
  };
}

function noExtraKeys(input, keys) {
  if (!input || Array.isArray(input) || typeof input !== 'object' || Object.keys(input).some((key) => !keys.includes(key))) throw fail('INVALID_REQUEST_FIELDS');
}

async function jsonBody(request) {
  if (!/^application\/json(?:\s*;.*)?$/i.test(request.headers['content-type'] ?? '')) throw fail('JSON_CONTENT_TYPE_REQUIRED', 415);
  const chunks = []; let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > BODY_LIMIT) throw fail('REQUEST_TOO_LARGE', 413);
    chunks.push(chunk);
  }
  try { const input = JSON.parse(Buffer.concat(chunks).toString('utf8')); noExtraKeys(input, Object.keys(input ?? {})); return input; }
  catch (error) { throw fail(error.message === 'INVALID_REQUEST_FIELDS' ? error.message : 'INVALID_JSON'); }
}

export async function createWalletWorkbench({ rpcUrl = DEFAULT_RPC, rpcCall, runtimeFactory, publicParameters, artifactPath, scenario = 'preference' } = {}) {
  if (!['preference', 'brief'].includes(scenario)) throw fail('SCENARIO_INVALID');
  const isBrief = scenario === 'brief';
  const documents = isBrief ? BRIEF_DOCUMENTS : SPRINT_DOCUMENTS;
  const allowedItemIds = isBrief ? BRIEF_ALLOWED_ITEM_IDS : SPRINT_ALLOWED_ITEM_IDS;
  const artifact = await loadRegistryArtifact(artifactPath);
  const rpc = rpcCall ?? publicRpc(rpcUrl);
  const v1 = await fixedScopeParameters(documents[0], allowedItemIds[0]);
  const v2 = await fixedScopeParameters(documents[1], allowedItemIds[1]);
  const parameters = { version: 1, scopeHash: v1.scopeHash, contentCommitmentV1: v1.contentCommitment,
    contentCommitmentV2: v2.contentCommitment, scopeHashV2: v2.scopeHash, ...publicParameters };
  if (parameters.version !== 1 || ![parameters.scopeHash, parameters.scopeHashV2, parameters.contentCommitmentV1, parameters.contentCommitmentV2].every((value) => HASH.test(value))) throw fail('SYNTHETIC_PARAMETERS_INVALID');
  const factory = runtimeFactory ?? createSprintRuntime;
  const assetId = parameters.assetId ?? bytes32(); const consentId = parameters.consentId ?? bytes32();
  const consentIdV2 = parameters.consentIdV2 ?? bytes32();
  if (!HASH.test(assetId) || !HASH.test(consentId) || !HASH.test(consentIdV2) || consentId.toLowerCase() === consentIdV2.toLowerCase()) throw fail('SYNTHETIC_IDS_INVALID');
  const token = randomBytes(32).toString('hex');
  const nonce = randomBytes(20).toString('base64url');
  const template = await readFile(new URL('./wallet-workbench.html', import.meta.url), 'utf8');
  let origin = null; let configured = null; let runtime = null; let runtimeV2 = null; let busy = false; let revision = 0; let closed = false;
  const prepared = new Map(); const receipts = [];
  const publicConfig = () => ({ mode: 'FIXED_SYNTHETIC_LOCAL_WORKBENCH', chainId: CHAIN_ID, chainHex: CHAIN_HEX,
    rpcUrl, explorerUrl: 'https://testnet.monadscan.com', token,
    artifact: { compiler: artifact.compiler, creationBytes: (artifact.creation.length - 2) / 2, runtimeBytes: (artifact.runtime.length - 2) / 2, runtimeBytecodeSha256: sha256(artifact.runtime) },
    parameters: { ...parameters, assetId, consentId, ...(isBrief ? { consentIdV2 } : {}) }, configuration: configured, configurationRevision: revision,
    scenario: isBrief ? BRIEF_SCENARIO : { id: 'LEGACY_PREFERENCE', dataClass: 'SYNTHETIC' },
    recommendedRegistryAddress: isBrief ? '0xcda4d087900f47427b4956b9b1ee2543ec5575c0' : null,
    realModelBehavior: 'NOT_MEASURED', receipts });
  const respond = (response, status, body, type = 'application/json; charset=utf-8') => {
    response.writeHead(status, { 'content-type': type, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff',
      'referrer-policy': 'no-referrer', 'content-security-policy': `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'` });
    response.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
  };
  const checkChain = async () => {
    if (BigInt(await rpc('eth_chainId')) !== BigInt(CHAIN_ID)) throw fail('CHAIN_ID_MISMATCH', 409);
  };
  const verifyRegistry = async (address) => {
    await checkChain();
    const actual = await rpc('eth_getCode', [address, 'latest']);
    if (actual === '0x') throw fail('CONTRACT_CODE_EMPTY', 409);
    if (typeof actual !== 'string' || actual.toLowerCase() !== artifact.runtime) throw fail('RUNTIME_BYTECODE_MISMATCH', 409);
    return { status: 'RUNTIME_BYTECODE_VERIFIED', registryAddress: address, runtimeBytecodeSha256: sha256(actual) };
  };
  const exclusive = async (fn) => {
    if (busy) throw fail('OPERATION_IN_PROGRESS', 409);
    busy = true; try { return await fn(); } finally { busy = false; }
  };
  const server = createServer(async (request, response) => {
    try {
      if (!origin || request.headers.host !== new URL(origin).host) throw fail('HOST_REJECTED', 403);
      if (request.headers.origin && request.headers.origin !== origin) throw fail('ORIGIN_REJECTED', 403);
      if (request.headers['sec-fetch-site'] && !['same-origin', 'none'].includes(request.headers['sec-fetch-site'])) throw fail('FETCH_SITE_REJECTED', 403);
      const url = new URL(request.url, origin);
      if (url.origin !== origin || url.search || url.hash) throw fail('ROUTE_NOT_FOUND', 404);
      if (request.method === 'GET' && url.pathname === '/') return respond(response, 200, template.replaceAll('__CSP_NONCE__', nonce), 'text/html; charset=utf-8');
      if (request.method === 'GET' && url.pathname === '/api/config') return respond(response, 200, publicConfig());
      if (request.method !== 'POST') throw fail('ROUTE_NOT_FOUND', 404);
      if (request.headers.origin !== origin) throw fail('ORIGIN_REQUIRED', 403);
      const suppliedToken = String(request.headers['x-workbench-token'] ?? '');
      if (!/^[0-9a-f]{64}$/.test(suppliedToken) || !timingSafeEqual(Buffer.from(suppliedToken), Buffer.from(token))) throw fail('REQUEST_TOKEN_REQUIRED', 403);
      if (!['/api/configure', '/api/prepare', '/api/receipt', '/api/request-challenge', '/api/continue',
        ...(isBrief ? ['/api/request-challenge-v2', '/api/continue-v2'] : [])].includes(url.pathname)) throw fail('ROUTE_NOT_FOUND', 404);
      const input = await jsonBody(request);
      if (url.pathname === '/api/configure') {
        noExtraKeys(input, ['account', 'registryAddress']);
        if (!ADDRESS.test(input.account ?? '') || !ADDRESS.test(input.registryAddress ?? '')) throw fail('ADDRESS_INVALID');
        const account = getAddress(input.account).toLowerCase(); const registryAddress = getAddress(input.registryAddress).toLowerCase();
        const result = await exclusive(async () => {
          const verified = await verifyRegistry(registryAddress);
          if (runtime) await runtime.close();
          if (runtimeV2) await runtimeV2.close();
          runtime = null; runtimeV2 = null; configured = null; prepared.clear(); revision++;
          const candidates = [];
          try {
            for (const index of (isBrief ? [0, 1] : [0])) {
              const candidate = await factory({ rpcUrl, registryAddress, assetId, consentId: index === 0 ? consentId : consentIdV2,
                grantee: account, domain: '127.0.0.1', document: documents[index], allowedItemIds: allowedItemIds[index],
                outputMode: isBrief ? 'BRIEF_TEMPLATE' : 'COUNTERS_ONLY' });
              candidates.push(candidate);
              const candidateParams = candidate.publicParameters;
              if (candidateParams && (candidateParams.version !== index + 1 ||
                candidateParams.scopeHash !== (index === 0 ? parameters.scopeHash : parameters.scopeHashV2) ||
                candidateParams.contentCommitment !== parameters[`contentCommitmentV${index + 1}`])) throw fail('RUNTIME_PARAMETERS_MISMATCH', 409);
            }
          } catch (error) { await Promise.allSettled(candidates.map((candidate) => candidate.close())); throw error; }
          [runtime, runtimeV2] = candidates;
          configured = { ...verified, account, agentPid: runtime.agentPid ?? null, agentKeyFingerprint: runtime.agentKeyFingerprint ?? null,
            ...(isBrief ? { agentPidV2: runtimeV2.agentPid ?? null, agentKeyFingerprintV2: runtimeV2.agentKeyFingerprint ?? null } : {}), revision };
          return publicConfig();
        });
        return respond(response, 200, result);
      }
      if (url.pathname === '/api/prepare') {
        noExtraKeys(input, ['action', 'account']);
        if (!ACTIONS.has(input.action) || !ADDRESS.test(input.account ?? '')) throw fail('ACTION_OR_ACCOUNT_INVALID');
        if (!isBrief && ['issueConsentV2', 'revokeConsentV2'].includes(input.action)) throw fail('ACTION_OR_ACCOUNT_INVALID');
        if (busy) throw fail('OPERATION_IN_PROGRESS', 409);
        const account = getAddress(input.account).toLowerCase(); await checkChain();
        let transaction; let argumentsPreview;
        if (input.action === 'deploy') {
          transaction = { from: account, chainId: CHAIN_HEX, data: artifact.creation, value: '0x0' }; argumentsPreview = { contract: 'ConsentRegistry', constructorArguments: [] };
        } else {
          if (!configured || !runtime || configured.account !== account) throw fail('VERIFIED_CONFIGURATION_REQUIRED', 409);
          await verifyRegistry(configured.registryAddress);
          const args = input.action === 'registerAsset' ? [assetId, parameters.contentCommitmentV1] :
            input.action === 'issueConsent' ? [consentId, assetId, account, parameters.scopeHash, 1, Math.floor(Date.now() / 1000) + 86400] :
            input.action === 'issueConsentV2' ? [consentIdV2, assetId, account, parameters.scopeHashV2, 2, Math.floor(Date.now() / 1000) + 86400] :
            input.action === 'publishVersion' ? [assetId, 1, parameters.contentCommitmentV2] : [input.action === 'revokeConsentV2' ? consentIdV2 : consentId];
          const functionName = input.action === 'issueConsentV2' ? 'issueConsent' : input.action === 'revokeConsentV2' ? 'revokeConsent' : input.action;
          transaction = { from: account, chainId: CHAIN_HEX, to: configured.registryAddress, data: artifact.abi.encodeFunctionData(functionName, args), value: '0x0' };
          argumentsPreview = { action: input.action, functionName, args };
        }
        const preparedId = randomBytes(16).toString('hex');
        if (prepared.size >= 100) prepared.delete(prepared.keys().next().value);
        prepared.set(preparedId, { transaction, action: input.action, revision, createdAt: Date.now() });
        return respond(response, 200, { status: 'TRANSACTION_PREPARED_NOT_SENT', chainId: CHAIN_ID, configurationRevision: revision, preparedId, transaction, argumentsPreview });
      }
      if (url.pathname === '/api/receipt') {
        noExtraKeys(input, ['txHash', 'preparedId']);
        if (!HASH.test(input.txHash ?? '') || typeof input.preparedId !== 'string') throw fail('RECEIPT_REQUEST_INVALID');
        const intent = prepared.get(input.preparedId);
        if (!intent || intent.revision !== revision) throw fail('PREPARED_TRANSACTION_NOT_CURRENT', 409);
        await checkChain();
        const [receipt, transaction] = await Promise.all([rpc('eth_getTransactionReceipt', [input.txHash]), rpc('eth_getTransactionByHash', [input.txHash])]);
        if (!receipt || !transaction) return respond(response, 200, { status: 'PENDING_NOT_CONFIRMED', txHash: input.txHash });
        const expected = intent.transaction;
        if (transaction.from?.toLowerCase() !== expected.from || (transaction.to ? transaction.to.toLowerCase() : null) !== (expected.to ?? null) ||
            transaction.input?.toLowerCase() !== expected.data.toLowerCase() || BigInt(transaction.value ?? 0) !== 0n) throw fail('TRANSACTION_BINDING_MISMATCH', 409);
        const status = BigInt(receipt.status) === 1n ? 'CONFIRMED_ON_TESTNET' : 'TRANSACTION_FAILED';
        const publicReceipt = { status, action: intent.action, txHash: input.txHash, blockNumber: receipt.blockNumber, blockHash: receipt.blockHash,
          contractAddress: receipt.contractAddress ?? null, gasUsed: receipt.gasUsed, chainId: CHAIN_ID, explorerUrl: `https://testnet.monadscan.com/tx/${input.txHash}` };
        if (status === 'CONFIRMED_ON_TESTNET' && intent.action === 'deploy') publicReceipt.codeVerification = await verifyRegistry(receipt.contractAddress);
        if (!receipts.some((entry) => entry.txHash === input.txHash)) receipts.push(publicReceipt);
        return respond(response, 200, publicReceipt);
      }
      if (!configured || !runtime) throw fail('VERIFIED_CONFIGURATION_REQUIRED', 409);
      const requestedRuntime = url.pathname.endsWith('-v2') ? runtimeV2 : runtime;
      if (!requestedRuntime) throw fail('VERIFIED_CONFIGURATION_REQUIRED', 409);
      if (url.pathname === '/api/request-challenge' || url.pathname === '/api/request-challenge-v2') {
        noExtraKeys(input, []);
        return respond(response, 200, await exclusive(() => requestedRuntime.createChallenge()));
      }
      noExtraKeys(input, ['declaration', 'signature']);
      if (!input.declaration || typeof input.declaration !== 'object' || typeof input.signature !== 'string' || !/^0x[0-9a-fA-F]{130}$/.test(input.signature)) throw fail('SIGNED_REQUEST_INVALID');
      return respond(response, 200, await exclusive(() => requestedRuntime.continueWithSignature(input)));
    } catch (error) { respond(response, error.status ?? 500, { status: 'FAIL_CLOSED', code: error.message ?? 'WORKBENCH_ERROR' }); }
  });
  server.requestTimeout = 20000; server.headersTimeout = 10000;
  server.on('clientError', (_error, socket) => { if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n'); });
  return {
    server,
    async start() {
      if (closed) throw fail('WORKBENCH_CLOSED');
      if (origin) return { url: origin };
      await new Promise((resolveStart, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', () => { server.removeListener('error', reject); resolveStart(); }); });
      origin = `http://127.0.0.1:${server.address().port}`;
      return { url: origin };
    },
    async close() {
      if (closed) return; closed = true;
      if (runtime) await runtime.close();
      if (runtimeV2) await runtimeV2.close();
      if (server.listening) await new Promise((resolveClose) => server.close(resolveClose));
    },
    get url() { return origin; },
  };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const workbench = await createWalletWorkbench({ scenario: process.argv.includes('--brief') ? 'brief' : 'preference' });
  const { url } = await workbench.start();
  console.log(JSON.stringify({ status: 'LOCAL_WORKBENCH_READY_NO_TRANSACTIONS_SENT', url, chainId: CHAIN_ID, material: 'FIXED_SYNTHETIC_ONLY' }, null, 2));
  const shutdown = async () => { await workbench.close(); process.exit(0); };
  process.once('SIGINT', shutdown); process.once('SIGTERM', shutdown);
}
