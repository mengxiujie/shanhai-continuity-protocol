import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import WebSocket from 'ws';

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const url = process.argv[3] || 'http://127.0.0.1:4173/apps/demo/brief-evidence.html';
const output = path.resolve(process.argv[2] || 'brief-readonly-frames');
const port = 19223;
const fps = 6;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const profile = await mkdtemp(path.join(tmpdir(), 'shanhai-brief-capture-'));
await mkdir(output, { recursive: true });

const browser = spawn(chrome, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--window-size=1280,720', '--force-device-scale-factor=1', url,
], { windowsHide: true, stdio: 'ignore' });

let socket;
try {
  let page;
  for (let attempt = 0; attempt < 80; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json`);
      const pages = await response.json();
      page = pages.find((entry) => entry.type === 'page' && entry.url === url);
      if (page) break;
    } catch { /* Chrome is still starting. */ }
    await delay(250);
  }
  if (!page) throw new Error('Chrome CDP page did not start');
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.once('open', resolve); socket.once('error', reject); });
  let nextId = 0;
  const pending = new Map();
  socket.on('message', (raw) => {
    const msg = JSON.parse(String(raw));
    const slot = pending.get(msg.id);
    if (!slot) return;
    pending.delete(msg.id);
    if (msg.error) slot.reject(new Error(msg.error.message));
    else slot.resolve(msg.result);
  });
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  await call('Page.enable');
  await call('Runtime.enable');
  await call('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
  for (let i = 0; i < 40; i++) {
    if (await evaluate("document.querySelector('#hash1')?.textContent?.includes('MATCH') && document.querySelectorAll('.proof-card').length === 4")) break;
    await delay(250);
  }
  if (!await evaluate("document.querySelector('#hash1')?.textContent?.includes('MATCH') && document.querySelectorAll('.proof-card').length === 4")) throw new Error('Evidence page did not validate its two exports');

  const scenes = [
    { name: 'two-export-hashes', seconds: 8, target: '0' },
    { name: 'v1-active', seconds: 10, target: "document.querySelectorAll('.proof-card')[0]" },
    { name: 'v1-stale', seconds: 10, target: "document.querySelectorAll('.proof-card')[1]" },
    { name: 'v2-active', seconds: 10, target: "document.querySelectorAll('.proof-card')[2]" },
    { name: 'v2-revoked', seconds: 10, target: "document.querySelectorAll('.proof-card')[3]" },
    { name: 'five-transactions', seconds: 7, target: "document.querySelector('#transactions')" },
    { name: 'live-check-running', seconds: 5, target: "document.querySelector('#verify-live')", click: true },
    { name: 'live-check-result', seconds: 9, target: "document.querySelector('#live-status')" },
  ];
  const captured = [];
  let frame = 0;
  for (const scene of scenes) {
    if (scene.target !== '0') {
      await evaluate(`(() => { const e = ${scene.target}; window.scrollTo({top: e.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth'}); })()`);
    } else await evaluate('window.scrollTo({top:0,behavior:"smooth"})');
    if (scene.click) {
      await delay(800);
      await evaluate("document.querySelector('#verify-live').click()");
    }
    for (let i = 0; i < scene.seconds * fps; i++) {
      const started = Date.now();
      const shot = await call('Page.captureScreenshot', { format: 'jpeg', quality: 84, captureBeyondViewport: false });
      const file = path.join(output, `frame-${String(frame++).padStart(4, '0')}.jpg`);
      await writeFile(file, Buffer.from(shot.data, 'base64'));
      const rest = Math.round(1000 / fps) - (Date.now() - started);
      if (rest > 0) await delay(rest);
    }
    captured.push({ name: scene.name, seconds: scene.seconds, frames: scene.seconds * fps });
    process.stdout.write(`${scene.name}: ${scene.seconds}s captured\n`);
  }
  const result = await evaluate("document.querySelector('#live-status').textContent");
  if (!result.includes('5/5') || !result.includes('PASS')) throw new Error(`Live check did not pass: ${result}`);
  await writeFile(path.join(output, 'capture-manifest.json'), JSON.stringify({ url, fps, frameCount: frame, scenes: captured, liveCheck: result, disclosure: 'Post-run read-only verification. No wallet transaction; no live model.' }, null, 2));
  process.stdout.write(`CAPTURE_PASS ${frame} frames; ${result}\n`);
} finally {
  socket?.close();
  browser.kill();
}
