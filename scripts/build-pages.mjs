import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(join(dist, 'apps'), { recursive: true });
await mkdir(join(dist, 'docs'), { recursive: true });
await cp(join(root, 'apps', 'demo'), join(dist, 'apps', 'demo'), { recursive: true });
await cp(join(root, 'docs', 'EVIDENCE.md'), join(dist, 'docs', 'EVIDENCE.md'));

const landing = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="refresh" content="0; url=apps/demo/index.html">
  <title>Shanhai Continuity Protocol</title>
</head>
<body>
  <p><a href="apps/demo/index.html">Open the Shanhai four-act demo</a></p>
</body>
</html>
`;

await writeFile(join(dist, 'index.html'), landing, 'utf8');
await writeFile(join(dist, '.nojekyll'), '', 'utf8');

console.log(JSON.stringify({ status: 'PASS', output: 'dist', entry: 'apps/demo/index.html' }, null, 2));
