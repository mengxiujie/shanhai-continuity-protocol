export async function releaseEnvelopeAfterMonad({ gate, verifyInput, envelopeStore }) {
  const receipt = await gate.verify(verifyInput);
  if (receipt.outcome !== 'ACTIVE') return { receipt, envelope: null };
  const envelope = await envelopeStore.fetchExact({ consentId: verifyInput.consentId, version: verifyInput.version, scopeHash: verifyInput.scopeHash, grantee: verifyInput.grantee });
  return { receipt, envelope };
}
