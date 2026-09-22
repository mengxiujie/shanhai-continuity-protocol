import { MonadConsentRegistryAdapter } from './monad-gate.js';
import { MonadJsonRpcClient, MonadConsentRegistryRpcProvider } from './monad-rpc-provider.js';

const $ = (id) => document.getElementById(id);
const fields = ['registry', 'asset', 'consent', 'grantee', 'scope', 'version'];
let lastReceipt = null;

function setText(id, value) { $(id).textContent = value ?? '—'; }
function resetEvidence() {
  lastReceipt = null;
  $('badge').className = 'tag';
  setText('badge', 'NOT YET EVIDENCE');
  for (const id of ['chain', 'block', 'outcome']) setText(id, '—');
  for (const id of ['envelope', 'decrypt', 'model']) setText(id, 'NOT MEASURED');
  setText('result', '尚未读取。这里不会显示合成通过状态。');
  $('download').disabled = true;
}

function showReceipt(receipt) {
  lastReceipt = {
    evidenceType: 'MONAD_TESTNET_READ_RECEIPT',
    generatedAt: new Date().toISOString(),
    rpcUrl: 'https://testnet-rpc.monad.xyz',
    request: Object.fromEntries(fields.map((id) => [id, $(id).value.trim()])),
    receipt,
    counters: { envelopeFetch: 'NOT_MEASURED', localDecrypt: 'NOT_MEASURED', modelCall: 'NOT_MEASURED' },
  };
  $('badge').className = receipt.outcome === 'ACTIVE' ? 'tag ok' : 'tag bad';
  setText('badge', 'LIVE RPC READ');
  setText('chain', `${receipt.chainId} / Monad Testnet`);
  setText('block', receipt.blockNumber ? `${receipt.blockNumber}${receipt.blockHash ? ` · ${receipt.blockHash}` : ''}` : '—');
  setText('outcome', receipt.outcome);
  setText('result', JSON.stringify(lastReceipt, null, 2));
  $('download').disabled = false;
}

$('read').onclick = async () => {
  resetEvidence();
  setText('badge', 'READING…');
  try {
    const registryAddress = $('registry').value.trim();
    const rpc = new MonadJsonRpcClient({ rpcUrl: 'https://testnet-rpc.monad.xyz' });
    const provider = new MonadConsentRegistryRpcProvider({
      rpc,
      registryAddress,
      selectors: { getAsset: '0x2cc3ce80', getConsent: '0x7715ae34' },
    });
    const gate = new MonadConsentRegistryAdapter({ chainId: 10143, registryAddress, provider });
    const receipt = await gate.verify({
      assetId: $('asset').value.trim().toLowerCase(),
      consentId: $('consent').value.trim().toLowerCase(),
      grantee: $('grantee').value.trim().toLowerCase(),
      version: Number($('version').value),
      scopeHash: $('scope').value.trim().toLowerCase(),
      now: Math.floor(Date.now() / 1000),
    });
    showReceipt(receipt);
  } catch (error) {
    $('badge').className = 'tag bad';
    setText('badge', 'FAIL CLOSED');
    setText('outcome', 'FAIL_CLOSED');
    setText('result', JSON.stringify({ status: 'FAIL_CLOSED', code: error.code || error.message }, null, 2));
  }
};

$('clear').onclick = () => { for (const id of fields) $(id).value = id === 'version' ? '1' : ''; resetEvidence(); };
$('download').onclick = () => {
  if (!lastReceipt) return;
  const blob = new Blob([`${JSON.stringify(lastReceipt, null, 2)}\n`], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `shanhai-monad-receipt-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
};

resetEvidence();
