const HEX_32 = /^0x[0-9a-fA-F]{64}$/;
const ADDRESS = /^0x[0-9a-fA-F]{40}$/;

function assert(condition, code) { if (!condition) { const error = new Error(code); error.code = code; throw error; } }
function word(data, index) { const clean = data.startsWith('0x') ? data.slice(2) : data; return clean.slice(index * 64, (index + 1) * 64); }
function asAddress(value) { return `0x${value.slice(24)}`.toLowerCase(); }
function asNumber(value) { return Number(BigInt(`0x${value || '0'}`)); }

export class MonadJsonRpcClient {
  constructor({ rpcUrl = 'https://testnet-rpc.monad.xyz', fetchImpl = fetch }) { this.rpcUrl = rpcUrl; this.fetchImpl = fetchImpl; this.id = 0; }
  async call(method, params = []) {
    const response = await this.fetchImpl(this.rpcUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: ++this.id, method, params }) });
    assert(response.ok, 'CHAIN_UNAVAILABLE');
    const body = await response.json();
    assert(!body.error && body.result !== undefined, 'CHAIN_RPC_ERROR');
    return body.result;
  }
  async assertChain(expected = 10143) { const actual = asNumber((await this.call('eth_chainId')).slice(2)); assert(actual === expected, 'CHAIN_ID_MISMATCH'); return actual; }
}

export class MonadConsentRegistryRpcProvider {
  constructor({ rpc, registryAddress, selectors }) {
    assert(ADDRESS.test(registryAddress), 'REGISTRY_ADDRESS_INVALID');
    assert(/^0x[0-9a-fA-F]{8}$/.test(selectors.getAsset), 'ASSET_SELECTOR_INVALID');
    assert(/^0x[0-9a-fA-F]{8}$/.test(selectors.getConsent), 'CONSENT_SELECTOR_INVALID');
    this.rpc = rpc; this.registryAddress = registryAddress; this.selectors = selectors;
  }
  async ethCall(selector, id, blockTag) {
    assert(HEX_32.test(id), 'BYTES32_ID_INVALID');
    return this.rpc.call('eth_call', [{ to: this.registryAddress, data: `${selector}${id.slice(2)}` }, blockTag]);
  }
  async readSnapshot(assetId, consentId) {
    await this.rpc.assertChain(10143);
    const blockTag = await this.rpc.call('eth_blockNumber');
    const [assetRaw, consentRaw, block] = await Promise.all([
      this.ethCall(this.selectors.getAsset, assetId, blockTag),
      this.ethCall(this.selectors.getConsent, consentId, blockTag),
      this.rpc.call('eth_getBlockByNumber', [blockTag, false]),
    ]);
    assert(assetRaw !== '0x' && consentRaw !== '0x', 'REGISTRY_READ_EMPTY');
    const asset = {
      owner: asAddress(word(assetRaw, 0)), commitment: `0x${word(assetRaw, 1)}`,
      currentVersion: asNumber(word(assetRaw, 2)), blockNumber: asNumber(blockTag.slice(2)),
    };
    const consent = {
      assetId: `0x${word(consentRaw, 0)}`, grantee: asAddress(word(consentRaw, 1)), scopeHash: `0x${word(consentRaw, 2)}`,
      version: asNumber(word(consentRaw, 3)), issuedAt: asNumber(word(consentRaw, 4)), expiresAt: asNumber(word(consentRaw, 5)), revokedAt: asNumber(word(consentRaw, 6)),
    };
    return { asset, consent, blockNumber: asset.blockNumber, blockHash: block?.hash ?? null };
  }
}
