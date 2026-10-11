import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, 'apps'), { recursive: true });
await mkdir(join(dist, 'docs'), { recursive: true });
await mkdir(join(dist, 'deployment'), { recursive: true });
await cp(join(root, 'apps', 'demo'), join(dist, 'apps', 'demo'), { recursive: true });
await cp(join(root, 'docs', 'EVIDENCE.md'), join(dist, 'docs', 'EVIDENCE.md'));
await cp(join(root, 'deployment', 'raw-browser-evidence.monad-testnet.2026-10-11.json'), join(dist, 'deployment', 'raw-browser-evidence.monad-testnet.2026-10-11.json'));

const landing = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="refresh" content="0; url=apps/demo/index.html">
  <title>Shanhai Continuity Protocol</title>
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%238b5cf6'/%3E%3Cpath d='M8 20c4-8 8 3 16-8' fill='none' stroke='white' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E">
</head>
<body>
  <p><a href="apps/demo/index.html">Open the Shanhai four-act demo</a></p>
</body>
</html>
`;

await writeFile(join(dist, 'index.html'), landing, 'utf8');
await writeFile(join(dist, '.nojekyll'), '', 'utf8');

console.log(JSON.stringify({ status: 'PASS', output: 'dist', entry: 'apps/demo/index.html' }, null, 2));
