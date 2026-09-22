import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative, sep } from 'node:path';

const root = new URL('../', import.meta.url);
const excludedDirs = new Set(['.git', 'node_modules', 'coverage', 'dist']);
const forbiddenDirs = new Set(['raw', 'private']);
const forbiddenNames = [/^\.env(?!\.example$)/i, /deployment-record\.json$/i, /\.(pem|key|p12|pfx)$/i];
const textExtensions = new Set(['', '.cjs', '.css', '.html', '.js', '.json', '.md', '.mjs', '.sol', '.txt', '.yml', '.yaml']);
const contentRules = [
  { name: 'PEM_PRIVATE_KEY', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: 'LOCAL_WINDOWS_USER_PATH', pattern: /[A-Za-z]:\\Users\\[^\\\s]+/ },
  { name: 'LOCAL_PROJECT_DRIVE_PATH', pattern: /D:\\工作区/ },
  { name: 'EMAIL_ADDRESS', pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i },
  { name: 'ASSIGNED_SECRET', pattern: /(?:api[_-]?key|private[_-]?key|mnemonic|seed|password|token)\s*[:=]\s*["'][^"'\s]{8,}["']/i }
];

const findings = [];
let scannedFiles = 0;

async function walk(directoryUrl) {
  const entries = await readdir(directoryUrl, { withFileTypes: true });
  for (const entry of entries) {
    if (excludedDirs.has(entry.name)) continue;
    const entryUrl = new URL(`${encodeURIComponent(entry.name)}${entry.isDirectory() ? '/' : ''}`, directoryUrl);
    const path = relative(new URL('.', root).pathname, entryUrl.pathname).split('/').join(sep);
    if (entry.isDirectory()) {
      if (forbiddenDirs.has(entry.name)) findings.push({ rule: 'FORBIDDEN_DIRECTORY', path });
      await walk(entryUrl);
      continue;
    }
    if (forbiddenNames.some((pattern) => pattern.test(entry.name))) findings.push({ rule: 'FORBIDDEN_FILE', path });
    if (!textExtensions.has(extname(entry.name).toLowerCase())) continue;
    scannedFiles += 1;
    const content = await readFile(entryUrl, 'utf8');
    for (const rule of contentRules) {
      if (rule.pattern.test(content)) findings.push({ rule: rule.name, path });
    }
  }
}

await walk(root);

const result = {
  status: findings.length === 0 ? 'PASS' : 'FAIL',
  scannedFiles,
  findings
};

console.log(JSON.stringify(result, null, 2));
if (findings.length > 0) process.exitCode = 1;
