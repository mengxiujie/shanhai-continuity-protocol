// 生产适配边界：真实实现应注入 readAsset/readConsent 的 Monad RPC 读取器。
export class MonadConsentRegistryAdapter {
  constructor({ chainId, registryAddress, provider }) {
    this.chainId = chainId;
    this.registryAddress = registryAddress;
    this.provider = provider;
  }

  async verify({ assetId, consentId, grantee, version, scopeHash, now = Math.floor(Date.now() / 1000) }) {
    const snapshot = this.provider.readSnapshot
      ? await this.provider.readSnapshot(assetId, consentId)
      : { asset: await this.provider.readAsset(assetId), consent: await this.provider.readConsent(consentId) };
    const { asset, consent } = snapshot;
    const receipt = { chainId: this.chainId, registryAddress: this.registryAddress, assetId, consentId, grantee, version, scopeHash, assetCommitment: asset?.commitment ?? null, blockNumber: snapshot.blockNumber ?? asset?.blockNumber ?? null, blockHash: snapshot.blockHash ?? null };
    if (!asset || !consent || consent.assetId !== assetId || consent.grantee !== grantee) return { outcome: 'NOT_FOUND', ...receipt };
    if (consent.revokedAt) return { outcome: 'REVOKED', ...receipt };
    if (consent.version !== version || asset.currentVersion !== version) return { outcome: 'VERSION_STALE', ...receipt };
    if (consent.scopeHash !== scopeHash) return { outcome: 'SCOPE_MISMATCH', ...receipt };
    if (consent.expiresAt && consent.expiresAt <= now) return { outcome: 'EXPIRED', ...receipt };
    return { outcome: 'ACTIVE', ...receipt };
  }
}

// 仅用于四幕演示；不会伪装成 Monad 网络。
export class DemoMonadProvider {
  constructor() { this.assets = new Map(); this.consents = new Map(); this.block = 1; }
  async readAsset(id) { return this.assets.get(id) ?? null; }
  async readConsent(id) { return this.consents.get(id) ?? null; }
  async readSnapshot(assetId, consentId) { return { asset: await this.readAsset(assetId), consent: await this.readConsent(consentId), blockNumber: this.block, blockHash: `demo-${this.block}` }; }
  register(assetId, commitment) { this.assets.set(assetId, { assetId, commitment, currentVersion: 1, blockNumber: ++this.block }); }
  publish(assetId, commitment) { const asset = this.assets.get(assetId); asset.currentVersion += 1; asset.commitment = commitment; asset.blockNumber = ++this.block; }
  issue(consentId, input) { this.consents.set(consentId, { ...input, revokedAt: 0 }); }
  revoke(consentId) { const consent = this.consents.get(consentId); consent.revokedAt = ++this.block; }
}
