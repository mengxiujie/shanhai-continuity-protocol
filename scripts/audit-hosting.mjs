import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const findings = [];
const files = [];
const textExtensions = new Set(['', '.css', '.html', '.js', '.json', '.md', '.mjs', '.txt']);
const contentRules = [
  ['LOCAL_WINDOWS_USER_PATH', /[A-Za-z]:\\Users\\[^\\\s]+/],
  ['LOCAL_PROJECT_DRIVE_PATH', /D:\\工作区/],
  ['EMAIL_ADDRESS', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i],
  ['PRIVATE_KEY_HEADER', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['UNRESOLVED_SUBMISSION_PLACEHOLDER', /\[(?:GITHUB|DEMO|VIDEO|CONTRACT|DEPLOY_TX|ACTIVE_RECEIPT|STALE_RECEIPT|REVOKED_RECEIPT)_URL\]/],
];

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else files.push(path);
  }
}

await walk(dist);

for (const path of files) {
  if (!textExtensions.has(extname(path).toLowerCase())) continue;
  const content = await readFile(path, 'utf8');
  for (const [rule, pattern] of contentRules) {
    if (pattern.test(content)) findings.push({ rule, path: relative(dist, path) });
  }
  if (extname(path).toLowerCase() !== '.html') continue;
  for (const match of content.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const target = match[1];
    if (/^(?:https?:|data:|#|mailto:|javascript:)/i.test(target)) continue;
    const cleanTarget = target.split('#')[0].split('?')[0];
    const targetPath = resolve(dirname(path), cleanTarget);
    try { await stat(targetPath); }
    catch { findings.push({ rule: 'BROKEN_LOCAL_REFERENCE', path: relative(dist, path), target }); }
  }
}

const required = ['index.html', 'apps/demo/index.html', 'apps/demo/app.js', 'apps/demo/styles.css', 'apps/demo/evidence-panel.html', 'apps/demo/evidence-replay.html', 'apps/demo/evidence-replay.js', 'deployment/raw-browser-evidence.monad-testnet.2026-10-11.json', 'protocol/reference/owner-web/sprint-fixture.mjs', 'docs/EVIDENCE.md'];
for (const path of required) {
  try { await stat(join(dist, path)); }
  catch { findings.push({ rule: 'REQUIRED_ASSET_MISSING', path }); }
}

console.log(JSON.stringify({ status: findings.length ? 'FAIL' : 'PASS', files: files.length, findings }, null, 2));
if (findings.length) process.exitCode = 1;
