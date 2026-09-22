import { createServer } from 'node:http';
import { createAgentBSession, openEnvelopeAndContinue } from './access.mjs';

const grantee = 'agent-b:independent-process';
const session = await createAgentBSession(grantee);
let modelCalls = 0;

function send(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

const server = createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/session') {
    return send(response, 200, { grantee, publicJwk: session.publicJwk, keyFingerprint: session.keyFingerprint, modelCalls });
  }
  if (request.method === 'POST' && request.url === '/continue') {
    try {
      const input = await readJson(request);
      const result = await openEnvelopeAndContinue({
        envelope: input.envelope,
        session,
        requestedItemIds: input.requestedItemIds,
        modelGateway: async (messages) => {
          modelCalls += 1;
          return { status: 'SYNTHETIC_MODEL_RESULT', contextItems: messages.length };
        },
      });
      return send(response, 200, { ok: true, modelCalls, result: result.result });
    } catch (error) {
      return send(response, 400, { ok: false, code: error.code ?? 'UNEXPECTED', modelCalls });
    }
  }
  if (request.method === 'POST' && request.url === '/shutdown') {
    send(response, 200, { ok: true });
    return server.close();
  }
  return send(response, 404, { ok: false, code: 'NOT_FOUND', modelCalls });
});

server.listen(0, '127.0.0.1', () => {
  const { port } = server.address();
  process.stdout.write(`${JSON.stringify({ status: 'READY', port })}\n`);
});
