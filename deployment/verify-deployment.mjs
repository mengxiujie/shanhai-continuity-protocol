import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const RPC_URL = process.env.MONAD_TESTNET_RPC_URL || 'https://testnet-rpc.monad.xyz';
const ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const registryAddress = process.env.REGISTRY_ADDRESS;

function fail(code, details = {}) {
  console.error(JSON.stringify({ status: 'FAIL_CLOSED', code, ...details }, null, 2));
  process.exitCode = 1;
}

async function rpc(method, params = []) {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  if (!response.ok) throw new Error('CHAIN_UNAVAILABLE');
  const body = await response.json();
  if (body.error || body.result === undefined) throw new Error('CHAIN_RPC_ERROR');
  return body.result;
}

if (!ADDRESS.test(registryAddress || '')) {
  fail('REGISTRY_ADDRESS_REQUIRED', { hint: 'Set REGISTRY_ADDRESS to the deployed Monad testnet contract.' });
} else {
  try {
    const artifactPath = resolve('contracts/build/ConsentRegistry.json');
    const artifact = JSON.parse(await readFile(artifactPath, 'utf8'));
    const expected = `0x${artifact.evm.deployedBytecode.object}`.toLowerCase();
    const [chainHex, blockHex, actual] = await Promise.all([
      rpc('eth_chainId'),
      rpc('eth_blockNumber'),
      rpc('eth_getCode', [registryAddress, 'latest']),
    ]);
    const chainId = Number(BigInt(chainHex));
    if (chainId !== 10143) throw new Error('CHAIN_ID_MISMATCH');
    if (!actual || actual === '0x') throw new Error('CONTRACT_CODE_EMPTY');
    if (actual.toLowerCase() !== expected) throw new Error('RUNTIME_BYTECODE_MISMATCH');
    const sha256 = createHash('sha256').update(Buffer.from(actual.slice(2), 'hex')).digest('hex');
    console.log(JSON.stringify({
      status: 'PASS', network: 'Monad Testnet', chainId,
      blockNumber: Number(BigInt(blockHex)), registryAddress: registryAddress.toLowerCase(),
      runtimeBytecodeBytes: (actual.length - 2) / 2, runtimeBytecodeSha256: sha256,
      compiler: artifact.compiler,
    }, null, 2));
  } catch (error) {
    fail(error.message || 'VERIFICATION_FAILED');
  }
}
