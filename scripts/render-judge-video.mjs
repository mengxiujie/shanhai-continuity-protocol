// Render a silent review draft from archived evidence. No browser recording or new chain execution.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import { SPRINT_DOCUMENTS, SPRINT_ALLOWED_ITEM_IDS } from '../protocol/reference/owner-web/sprint-fixture.mjs';
import { fixedScopeParameters } from '../protocol/reference/owner-web/sprint-runtime.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const outputDir = resolve(process.argv[2] ?? join(root, '..', 'HACK-001_VIDEO_REVIEW_2026-10-11'));
const rawBytes = await readFile(join(root, 'deployment', 'raw-browser-evidence.monad-testnet.2026-10-11.json'));
const expectedHash = '49bd59c0ff054fbf2ef82ab009b1bccefaf88890240ff5b18b0d0cc8225a9864';
const hash = createHash('sha256').update(rawBytes).digest('hex');
if (hash !== expectedHash) throw new Error('RAW_EVIDENCE_HASH_MISMATCH');
const evidence = JSON.parse(rawBytes);
const states = ['ACTIVE', 'VERSION_STALE', 'REVOKED'].map((outcome) => evidence.results.find((result) => result.receipt?.outcome === outcome));
if (states.some((state) => !state)) throw new Error('INCOMPLETE_RECORDED_SEQUENCE');
const [active, stale, revoked] = states;
const metricKeys = ['envelopeFetches', 'independentChainChecks', 'decryptAttempts', 'contextAssemblies', 'controlledGatewayCalls'];
for (const [index, state] of states.entries()) {
  if (state.receipt.chainId !== 10143 || metricKeys.some((key) => state.counters.delta[key] !== (index === 0 ? 1 : 0))) throw new Error('UNEXPECTED_RECORDED_METRICS');
}
if (active.ownerPid === active.agentPid) throw new Error('RECIPIENT_PROCESS_NOT_INDEPENDENT');
for (const [index, document] of SPRINT_DOCUMENTS.entries()) {
  const params = await fixedScopeParameters(document, SPRINT_ALLOWED_ITEM_IDS[index]);
  if (params.contentCommitment !== evidence.parameters[`contentCommitmentV${index + 1}`]) throw new Error('SOURCE_FIXTURE_COMMITMENT_MISMATCH');
}
const messages = active.messages.map((message) => message.content).join('\n');
if (!messages.includes(SPRINT_DOCUMENTS[0].items[0].statement) || messages.includes(SPRINT_DOCUMENTS[0].items[1].statement)) throw new Error('SCOPE_PROJECTION_MISMATCH');

const scenes = [
  { start: 0, end: 10, title: 'You changed your mind.', subtitle: 'May another AI receive your old context again?', narration: 'If I correct what I told an AI, may another assistant receive the old version again? Shanhai makes future delivery depend on current authorization.', chinese: '如果我更正了告诉 AI 的内容，另一个助手还能再次收到旧版本吗？山海让未来交付取决于当前授权。' },
  { start: 10, end: 23, title: 'One selected item. One exact version.', narration: 'This fixed example asks for brief answers, with the result first. The owner authorizes one item. A separate private note stays outside the scope.', chinese: '这条固定合成材料要求先给简短结论。用户只授权这一条；另一条私密备注没有进入接收方的上下文。' },
  { start: 23, end: 41, title: 'ACTIVE: authorized context delivered.', narration: 'The owner checks Monad before releasing the encrypted envelope. Independent Agent B checks again, decrypts once, and assembles one authorized context.', chinese: '授权有效时，发送方先检查 Monad，再交付密文。独立 Agent B 再次检查后，执行一次解密和一次上下文组装。' },
  { start: 41, end: 59, title: 'V2 published. The old request is stale.', narration: 'The owner then corrects the preference: this task needs a detailed explanation. The old version-one request is denied, with zero new downstream execution.', chinese: '用户随后更正：这次任务需要详细解释。发布 V2 后，旧 V1 请求被拒绝，本次新增取材、解密、上下文与网关执行全部为零。' },
  { start: 59, end: 74, title: 'Consent revoked. Future delivery stops.', narration: 'After revocation, another request is denied before new delivery. This does not erase plaintext the agent previously received while authorized.', chinese: '撤销授权后，新请求在交付前被阻断。这不会抹掉接收方此前合法取得的明文。' },
  { start: 74, end: 84, title: 'Inspect the evidence.', narration: 'Four confirmed state transactions and block-bound receipts preserve the sequence. The archived JSON hash matches. The replay page links the chain records.', chinese: '四笔状态交易和带区块锚点的回执保留了完整序列。原始 JSON 哈希匹配；回放页可以查看对应链上记录。' },
  { start: 84, end: 92, title: 'Your memory travels.', subtitle: 'Your authority stays with you.', narration: 'Shanhai Continuity Protocol: encrypted context, exact scope, and verifiable authority over future delivery. External model behavior remains unmeasured.', chinese: '山海连续性协议：加密材料、精确范围，以及可核验的未来交付权限。真实模型效果仍未测量。' },
];
const pad = (number, length = 2) => String(number).padStart(length, '0');
const assTime = (seconds) => `${Math.floor(seconds / 3600)}:${pad(Math.floor(seconds / 60) % 60)}:${pad(Math.floor(seconds) % 60)}.00`;
const srtTime = (seconds) => `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(Math.floor(seconds) % 60)},000`;
const wrap = (text, limit = 82) => {
  const lines = []; let line = '';
  for (const word of text.split(/\s+/)) { if ((line + ' ' + word).trim().length > limit) { lines.push(line); line = word; } else line = (line + ' ' + word).trim(); }
  if (line) lines.push(line);
  return lines.join('\n');
};
const safe = (text) => String(text).replace(/\\/g, '/').replace(/[{}]/g, '').replace(/\n/g, '\\N');
const events = [];
const line = (scene, style, x, y, text) => events.push(`Dialogue: 0,${assTime(scene.start)},${assTime(scene.end)},${style},,0,0,0,,{\\pos(${x},${y})}${safe(text)}`);
const body = (scene, y, text) => line(scene, 'Body', 120, y, wrap(text, 82));
function metrics(scene, state, startY = 365) {
  const labels = ['Envelope fetch', 'Independent B chain check', 'Decryption attempt', 'Context assembly', 'Controlled gateway'];
  line(scene, 'Small', 120, startY - 58, 'NEW EXECUTION IN THIS REQUEST');
  metricKeys.forEach((key, index) => { line(scene, 'Body', 120, startY + index * 62, labels[index]); line(scene, state === active ? 'Good' : 'Denied', 1080, startY + index * 62 - 5, state.counters.delta[key]); });
}
for (const scene of scenes) {
  line(scene, 'Kicker', 120, 72, 'SHANHAI CONTINUITY PROTOCOL / TRACK 04');
  line(scene, 'Title', 120, 155, scene.title);
  if (scene.subtitle) line(scene, 'Subtitle', 120, 240, scene.subtitle);
  line(scene, 'Small', 120, 881, 'CHECKS USE BLOCK SNAPSHOTS; AUTHORITY MAY CHANGE AFTER THE FINAL CHECK.');
  line(scene, 'Small', 120, 923, 'ARCHIVED TESTNET EVIDENCE VISUALIZATION / FIXED SYNTHETIC DATA / EXTERNAL MODEL: NOT_MEASURED');
  line(scene, 'Caption', 960, 994, wrap(scene.narration, 106));
}
body(scenes[0], 405, 'Old context should not remain eligible for new delivery after its version changes or its grant is revoked.');
body(scenes[0], 615, 'Recorded Monad execution: ACTIVE → VERSION_STALE → REVOKED');
body(scenes[1], 335, SPRINT_DOCUMENTS[0].items[0].statement);
body(scenes[1], 540, 'Scope: one confirmed preference. The second synthetic private note is not present in the recorded Agent B context.');
body(scenes[1], 710, 'Content: encrypted off-chain. Authorization facts: independently readable on Monad.');
metrics(scenes[2], active);
body(scenes[2], 740, `Owner block ${active.ownerReceipt.blockNumber} → Agent B block ${active.receipt.blockNumber}`);
body(scenes[2], 807, `Owner PID ${active.ownerPid} / independent Agent B PID ${active.agentPid}`);
body(scenes[3], 263, SPRINT_DOCUMENTS[1].items[0].statement);
metrics(scenes[3], stale, 460);
body(scenes[3], 790, `VERSION_STALE / block ${stale.receipt.blockNumber} / old request version 1`);
metrics(scenes[4], revoked);
body(scenes[4], 740, `REVOKED / block ${revoked.receipt.blockNumber}`);
body(scenes[4], 807, 'Previously delivered plaintext cannot be recalled.');
body(scenes[5], 310, `Monad Testnet / chain 10143\nRegistry: ${evidence.configuration.registryAddress}`);
body(scenes[5], 480, 'RAW JSON SHA-256: MATCH');
line(scenes[5], 'Hash', 120, 550, hash);
body(scenes[5], 650, `${evidence.receipts.length} confirmed state transactions / preserved block anchors`);
body(scenes[5], 758, 'Replay page: exact raw download + contract and transaction links.');
body(scenes[6], 455, 'Encrypted context → current authority → controlled delivery');
body(scenes[6], 595, 'Implemented on Monad. Model quality, external adoption and production security remain unvalidated.');
const header = `[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\nWrapStyle: 2\nScaledBorderAndShadow: yes\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n`;
const style = (name, size, color, bold = 0, alignment = 7, border = 1) => `Style: ${name},Arial,${size},${color},&H00FFFFFF,&H00170D0B,&H70170D0B,${bold},0,0,0,100,100,0,0,${border},${border === 3 ? 10 : 0},0,${alignment},100,100,20,1`;
const styles = [style('Kicker', 27, '&H00D8B0B8', -1), style('Title', 61, '&H00FFFFFF', -1), style('Subtitle', 52, '&H00D8B0B8'), style('Body', 37, '&H00EDE6E8'), style('Small', 23, '&H00AA99A0'), style('Good', 51, '&H00B6EF86', -1), style('Denied', 51, '&H00A4A4FD', -1), style('Hash', 31, '&H00B6EF86'), style('Caption', 28, '&H00FFFFFF', 0, 8, 3)].join('\n');
await mkdir(outputDir, { recursive: true });
await writeFile(join(outputDir, 'narration.scenes.json'), JSON.stringify(scenes.map(({ start, end, chinese }) => ({ start, end, chinese })), null, 2));
await writeFile(join(outputDir, 'judges-draft.ass'), `${header}${styles}\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n${events.join('\n')}\n`);
for (const [suffix, key] of [['en', 'narration'], ['zh', 'chinese']]) {
  await writeFile(join(outputDir, `shanhai-92s.${suffix}.srt`), scenes.map((scene, index) => `${index + 1}\n${srtTime(scene.start)} --> ${srtTime(scene.end)}\n${wrap(scene[key], suffix === 'en' ? 106 : 42)}\n`).join('\n'));
}
await writeFile(join(outputDir, 'narration.zh.txt'), scenes.map((scene) => `${scene.start}–${scene.end} 秒\n${scene.chinese}`).join('\n\n'));
function run(command, args, capture = false) {
  const result = spawnSync(command, args, { cwd: outputDir, windowsHide: true, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited ${result.status}: ${result.stderr ?? ''}`);
  return result.stdout;
}
run('ffmpeg', ['-hide_banner', '-loglevel', 'warning', '-y', '-f', 'lavfi', '-i', 'color=c=0x0b0d17:s=1920x1080:r=25:d=92', '-vf', 'drawbox=x=0:y=0:w=iw:h=12:color=0x8b5cf6:t=fill,ass=judges-draft.ass', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '22', '-threads', '2', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', 'shanhai-92s-review-draft.mp4']);
run('ffmpeg', ['-hide_banner', '-loglevel', 'warning', '-y', '-i', 'shanhai-92s-review-draft.mp4', '-vf', 'fps=1/11.5,scale=480:270,tile=4x2', '-frames:v', '1', '-update', '1', 'review-contact-sheet.png']);
const probe = JSON.parse(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,size:stream=codec_name,width,height,codec_type', '-of', 'json', 'shanhai-92s-review-draft.mp4'], true));
const video = probe.streams.find((stream) => stream.codec_type === 'video');
if (video?.width !== 1920 || video?.height !== 1080 || Math.abs(Number(probe.format.duration) - 92) > 0.1) throw new Error('VIDEO_METADATA_MISMATCH');
const qa = { status: 'GENERATED_REVIEW_DRAFT', evidenceHash: hash, fixtureCommitmentsMatch: true, scopeMatchesRecordedContext: true, durationSeconds: Number(probe.format.duration), width: video.width, height: video.height, codec: video.codec_name, audio: 'NONE', bytes: Number(probe.format.size), videoType: 'ARCHIVED_EVIDENCE_VISUALIZATION_NOT_SCREEN_RECORDING', externalModel: 'NOT_MEASURED' };
await writeFile(join(outputDir, 'video-qa.json'), JSON.stringify(qa, null, 2));
console.log(JSON.stringify(qa, null, 2));
