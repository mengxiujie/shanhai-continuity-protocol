import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createEncryptedGrantEnvelope } from '../../reference/owner-web/envelope.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(here, '..', '..', 'reference', 'agent-b', 'server.mjs');
const vector = JSON.parse(await readFile(path.join(here, '..', 'vectors', '02-valid-confirmed-correction.json'), 'utf8'));
const document = vector.documents[1];
const itemId = document.items[0].itemId;

function firstJsonLine(stream) {
  return new Promise((resolve, reject) => {
    let buffer = '';
    stream.setEncoding('utf8');
    stream.on('data', (chunk) => {
      buffer += chunk;
      const newline = buffer.indexOf('\n');
      if (newline >= 0) {
        try { resolve(JSON.parse(buffer.slice(0, newline))); } catch (error) { reject(error); }
      }
    });
    stream.on('error', reject);
  });
}

async function request(base, route, options = {}) {
  const response = await fetch(`${base}${route}`, options);
  return { status: response.status, body: await response.json() };
}

const child = spawn(process.execPath, [serverPath], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
let stderr = '';
child.stderr.setEncoding('utf8');
child.stderr.on('data', (chunk) => { stderr += chunk; });

try {
  const ready = await firstJsonLine(child.stdout);
  assert.equal(ready.status, 'READY');
  const base = `http://127.0.0.1:${ready.port}`;
  const sessionResponse = await request(base, '/session');
  assert.equal(sessionResponse.status, 200);
  assert.equal(sessionResponse.body.privateKey, undefined);

  const envelope = await createEncryptedGrantEnvelope({
    document,
    allowedItemIds: [itemId],
    consentId: 'consent-process-001',
    grantee: sessionResponse.body.grantee,
    agentPublicJwk: sessionResponse.body.publicJwk,
  });
  assert.doesNotMatch(JSON.stringify(envelope), /相比稳定/);

  const allowed = await request(base, '/continue', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ envelope, requestedItemIds: [itemId] }),
  });
  assert.equal(allowed.status, 200);
  assert.equal(allowed.body.modelCalls, 1);

  const tampered = structuredClone(envelope);
  tampered.payloadCiphertext = (tampered.payloadCiphertext[0] === 'A' ? 'B' : 'A') + tampered.payloadCiphertext.slice(1);
  const denied = await request(base, '/continue', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ envelope: tampered, requestedItemIds: [itemId] }),
  });
  assert.equal(denied.status, 400);
  assert.equal(denied.body.code, 'CIPHERTEXT_INTEGRITY_FAILED');
  assert.equal(denied.body.modelCalls, 1, 'tampered request must not increment model calls');

  await request(base, '/shutdown', { method: 'POST' });
  await once(child, 'exit');
  assert.equal(child.exitCode, 0, stderr);
  console.log(JSON.stringify({ suite: 'SCP-INDEPENDENT-PROCESS-E2E', status: 'PASS', ownerProcess: process.pid, agentProcessSeparated: true, successfulModelCalls: 1, deniedRequestAdditionalModelCalls: 0 }, null, 2));
} finally {
  if (child.exitCode === null) child.kill();
}
