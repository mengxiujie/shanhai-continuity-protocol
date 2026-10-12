// Read-only verification of archived transaction receipts against public Monad Testnet RPC.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const evidence = JSON.parse(await readFile(join(root, 'deployment', 'raw-browser-evidence.brief-part2.monad-testnet.2026-10-12.json'), 'utf8'));
assert.equal(evidence.receipts.length, 5);
const rpcUrl = process.env.MONAD_TESTNET_RPC_URL || 'https://testnet-rpc.monad.xyz';
const results = [];
for (const [index, archived] of evidence.receipts.entries()) {
  const response = await fetch(rpcUrl, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: index + 1, method: 'eth_getTransactionReceipt', params: [archived.txHash] }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`RPC_HTTP_${response.status}`);
  const reply = await response.json();
  if (reply.error) throw new Error(`RPC_ERROR_${reply.error.code}`);
  const receipt = reply.result;
  assert.ok(receipt, `${archived.action}: missing receipt`);
  assert.equal(receipt.transactionHash.toLowerCase(), archived.txHash.toLowerCase());
  assert.equal(receipt.status, '0x1', `${archived.action}: unsuccessful transaction`);
  assert.equal(receipt.blockNumber.toLowerCase(), archived.blockNumber.toLowerCase(), `${archived.action}: block mismatch`);
  assert.equal(receipt.blockHash.toLowerCase(), archived.blockHash.toLowerCase(), `${archived.action}: block hash mismatch`);
  results.push({ action: archived.action, txHash: archived.txHash, status: receipt.status, blockNumber: Number.parseInt(receipt.blockNumber, 16), match: true });
}
console.log(JSON.stringify({ status: 'PASS', evidenceType: 'READ_ONLY_PUBLIC_RPC_TRANSACTION_CHECK', chainId: 10143, transactionCount: results.length, results,
  boundary: 'Transaction inclusion and success only; Agent B off-chain execution remains project-instrumented.' }, null, 2));
