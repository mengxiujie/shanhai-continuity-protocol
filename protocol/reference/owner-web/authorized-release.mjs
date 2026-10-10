import { invariant } from '../../src/errors.mjs';
import { scopeHash } from '../shared/webcrypto.mjs';
import { scopeCommitmentBytes32 } from '../shared/content-commitment.mjs';
import { verifySignedRequest } from '../agent-b/request-identity.mjs';
import { releaseEnvelopeAfterMonad } from '../../../apps/demo/envelope-gate.js';

export function assertEnvelopeBinding(envelope, declaration, receipt) {
  invariant(envelope?.consentId === declaration.consentId, 'ENVELOPE_CONSENT_MISMATCH');
  invariant(envelope.grantee === declaration.grantee, 'ENVELOPE_GRANTEE_MISMATCH');
  invariant(envelope.version === declaration.version, 'ENVELOPE_VERSION_MISMATCH');
  invariant(scopeCommitmentBytes32(envelope.scopeHash) === declaration.scopeHash, 'ENVELOPE_SCOPE_MISMATCH');
  invariant(envelope.agentKeyFingerprint === declaration.agentKeyFingerprint, 'ENVELOPE_KEY_MISMATCH');
  invariant(/^0x[0-9a-f]{64}$/.test(envelope.contentCommitment) && envelope.contentCommitment === receipt.assetCommitment, 'CHAIN_CONTENT_COMMITMENT_MISMATCH');
}

// The only release path for this sprint: no unsigned request fields are reused.
// describeExact supplies non-payload metadata; fetchExact runs only after all gates.
export async function authorizedRelease({ gate, context, nonceStore, signedRequest, agentPublicJwk, requestedItemIds, envelopeStore, counters, now = Math.floor(Date.now() / 1000) }) {
  const declaration = await verifySignedRequest({ ...signedRequest, agentPublicJwk, context, nonceStore, now });
  invariant(scopeCommitmentBytes32(await scopeHash(requestedItemIds)) === declaration.scopeHash, 'REQUEST_ITEMS_SCOPE_MISMATCH');
  invariant(gate.chainId === declaration.chainId && gate.registryAddress.toLowerCase() === declaration.registry, 'REQUEST_GATE_MISMATCH');
  const { assetId, consentId, version, scopeHash: scopedHash, grantee } = declaration;
  counters.chainChecks += 1;
  const result = await releaseEnvelopeAfterMonad({
    gate,
    verifyInput: { assetId, consentId, version, scopeHash: scopedHash, grantee, now },
    envelopeStore: {
      async fetchExact(query, { receipt }) {
        invariant(receipt.chainId === declaration.chainId && receipt.registryAddress.toLowerCase() === declaration.registry, 'RECEIPT_DOMAIN_MISMATCH');
        invariant(/^0x[0-9a-fA-F]{64}$/.test(receipt.blockHash), 'RECEIPT_BLOCK_UNPROVEN');
        const metadata = await envelopeStore.describeExact(query);
        assertEnvelopeBinding(metadata, declaration, receipt);
        counters.envelopeFetches += 1;
        const envelope = await envelopeStore.fetchExact(query);
        assertEnvelopeBinding(envelope, declaration, receipt);
        return envelope;
      },
    },
  });
  return { ...result, declaration };
}
