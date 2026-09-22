import { MonadJsonRpcClient } from './monad-rpc-provider.js';

const rpc = new MonadJsonRpcClient({ rpcUrl: process.env.MONAD_TESTNET_RPC_URL || 'https://testnet-rpc.monad.xyz' });
const chainId = await rpc.assertChain(10143);
const blockNumber = Number(BigInt(await rpc.call('eth_blockNumber')));
console.log(JSON.stringify({ status: 'PASS', network: 'Monad Testnet', chainId, blockNumber, readOnly: true }, null, 2));
