import solc from 'solc';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(path.join(root, 'src', 'ConsentRegistry.sol'), 'utf8');
const input = { language: 'Solidity', sources: { 'ConsentRegistry.sol': { content: source } }, settings: { optimizer: { enabled: true, runs: 200 }, outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object', 'evm.deployedBytecode.object', 'evm.methodIdentifiers'] } } } };
const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = (output.errors ?? []).filter((entry) => entry.severity === 'error');
if (errors.length) throw new Error(errors.map((entry) => entry.formattedMessage).join('\n'));
const artifact = output.contracts['ConsentRegistry.sol'].ConsentRegistry;
await mkdir(path.join(root, 'build'), { recursive: true });
await writeFile(path.join(root, 'build', 'ConsentRegistry.json'), JSON.stringify({ contractName: 'ConsentRegistry', compiler: solc.version(), ...artifact }, null, 2));
console.log(JSON.stringify({ status: 'PASS', compiler: solc.version(), bytecodeBytes: artifact.evm.bytecode.object.length / 2, selectors: artifact.evm.methodIdentifiers }, null, 2));
