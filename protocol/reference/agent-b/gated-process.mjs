import { createAgentBSession, openEnvelopeAndContinue } from './access.mjs';
import { normalizeRequestDeclaration, requestSigningMessage } from './request-identity.mjs';
import { verifyMessage } from 'ethers';
import { invariant } from '../../src/errors.mjs';
import { assertEnvelopeBinding } from '../owner-web/authorized-release.mjs';
import { MonadConsentRegistryAdapter } from '../../../apps/demo/monad-gate.js';
import { MonadConsentRegistryRpcProvider, MonadJsonRpcClient } from '../../../apps/demo/monad-rpc-provider.js';

let config;
let session;
const counters = { envelopeReceived: 0, independentChainChecks: 0, decryptAttempts: 0, decryptSucceeded: 0, contextAssemblies: 0, controlledGatewayCalls: 0 };
const consumedNonces = new Set();
let queue = Promise.resolve();
process.on('message', (message) => {
  queue = queue.then(async () => {
    try {
      if (message.type === 'initialize') {
        invariant(!session, 'PROCESS_ALREADY_INITIALIZED');
        config = message.config;
        session = await createAgentBSession(config.grantee);
        process.send({ id: message.id, ok: true, pid: process.pid, publicJwk: session.publicJwk, keyFingerprint: session.keyFingerprint, counters });
        return;
      }
      invariant(session, 'PROCESS_NOT_INITIALIZED');
      if (message.type === 'close') { process.send({ id: message.id, ok: true }); process.disconnect(); return; }
      invariant(message.type === 'continue', 'PROCESS_COMMAND_INVALID');
      counters.envelopeReceived += 1;
      const declaration = normalizeRequestDeclaration(message.signedRequest.declaration);
      invariant(declaration.domain === config.domain && declaration.chainId === 10143 && declaration.registry === config.registryAddress.toLowerCase(), 'PROCESS_REQUEST_DOMAIN_MISMATCH');
      invariant(verifyMessage(requestSigningMessage(declaration), message.signedRequest.signature).toLowerCase() === session.grantee, 'REQUEST_SIGNER_MISMATCH');
      invariant(declaration.expiresAt > Math.floor(Date.now() / 1000), 'REQUEST_EXPIRED');
      invariant(!consumedNonces.has(declaration.nonce), 'REQUEST_NONCE_REPLAYED');
      consumedNonces.add(declaration.nonce);
      // A fresh read inside B narrows, but cannot eliminate, the chain/read/use race.
      const rpc = new MonadJsonRpcClient({ rpcUrl: config.rpcUrl });
      const provider = new MonadConsentRegistryRpcProvider({ rpc, registryAddress: config.registryAddress, selectors: config.selectors });
      const gate = new MonadConsentRegistryAdapter({ chainId: 10143, registryAddress: config.registryAddress, provider });
      counters.independentChainChecks += 1;
      const receipt = await gate.verify({ ...declaration, now: Math.floor(Date.now() / 1000) });
      if (receipt.outcome !== 'ACTIVE') { process.send({ id: message.id, ok: false, code: receipt.outcome, receipt, counters }); return; }
      assertEnvelopeBinding(message.envelope, declaration, receipt);
      const result = await openEnvelopeAndContinue({
        envelope: message.envelope, session, requestedItemIds: message.requestedItemIds,
        onStage(stage) { counters[stage] += 1; },
        modelGateway: async (messages) => ({ status: 'CONTROLLED_GATEWAY_ONLY', contextMessageCount: messages.length }),
      });
      process.send({ id: message.id, ok: true, receipt, counters, messages: result.messages, result: result.result });
    } catch (error) { process.send({ id: message.id, ok: false, code: error.code ?? 'PROCESS_ERROR', counters }); }
  }).catch(() => process.exit(1));
});
