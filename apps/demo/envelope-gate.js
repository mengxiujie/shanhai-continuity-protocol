export async function releaseEnvelopeAfterMonad({ gate, verifyInput, envelopeStore }) {
  const receipt = await gate.verify(verifyInput);
  if (receipt.outcome !== 'ACTIVE') return { receipt, envelope: null };
  const envelope = await envelopeStore.fetchExact({ assetId: verifyInput.assetId, consentId: verifyInput.consentId, version: verifyInput.version, scopeHash: verifyInput.scopeHash, grantee: verifyInput.grantee }, { receipt });
  return { receipt, envelope };
}
