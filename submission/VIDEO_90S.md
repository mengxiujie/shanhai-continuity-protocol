# 90-second judge video

> Updated 2026-10-11. The preferred narration is now **script V2**, below and in [`VIDEO_90S_V2.json`](VIDEO_90S_V2.json). It adds a concrete opening, source-preservation test, the reason for independent Monad verification and a clearer closing. V2 is text only: the existing 92-second MP4 still uses V1. V2 audio, frame alignment and video have not been produced. Founder review, upload and anonymous playback remain pending.

The single claim to demonstrate is: future controlled delivery depends on the current authorization of an exact version and scope. The recorded testnet sequence shows `ACTIVE_CONTEXT_DELIVERED`, then `VERSION_STALE`, then `REVOKED`. Checks are snapshots, not an atomic transaction with delivery. The content is fixed synthetic material and the external model boundary remains `NOT_MEASURED`.

## Preferred narration V2

Planned scene windows total 92 seconds. These are editorial timings, not measured audio alignment. There are 287 Chinese characters, plus Latin names and punctuation; actual pronunciation and pauses must be checked during production. Chinese read-aloud text is also saved locally as `HACK-001_VIDEO_REVIEW_2026-10-11/narration.v2.zh.txt`; planned English captions are `shanhai-script-v2.en.srt`. Both are separate from the existing V1 audio/video artifacts.

**0–10 seconds — concrete change**

我把给 AI 的要求从“简短结论”改成“详细解释”。下一位助手，还能收到旧版本吗？

**10–22 seconds — source identity**

这是山海连续性协议。它保留内容来源：在协议测试中，用户认可 AI 推断，也不会把它变成用户原话。

**22–37 seconds — why the shared record matters**

正文加密留在链外，授权和版本记录在 Monad。发送方与接收方各自核验，接收方不必只相信山海服务器的回答。

**37–51 seconds — authorized delivery**

看这次测试网记录：用户只授权一条偏好，私密备注未进入上下文。授权有效时，独立接收进程解密，并把获准材料组装进上下文。

**51–65 seconds — correction has an execution consequence**

用户随后更正为“这次需要详细解释”。发布第二版后，旧请求被阻断，没有新增取材、解密或上下文组装。

**65–77 seconds — revocation and its limit**

撤销授权后，下一次请求也在交付前停止。此前合法取得的明文无法追回；原型约束的是后续交付。

**77–85 seconds — checkable evidence**

三种结果、四笔状态交易，都能沿链上记录和执行回执核查。

**85–92 seconds — closing contribution**

山海连续性协议：让下一次交付，先核验授权。

### V2 picture and evidence map

| Window | Required picture | Evidence source / label |
|---|---|---|
| 0–10s | “Brief conclusions” → “Detailed explanation for this task” | Fixed synthetic scenario, from the executed fixture |
| 10–22s | `originKind=MODEL_INFERENCE` remains; `reviewStatus=USER_CONFIRMED` | **Separate local synthetic protocol test**, `protocol/test/vectors/02-valid-confirmed-correction.json`; not part of the recorded testnet preference example |
| 22–37s | Encrypted content off-chain; Owner and B separately read the same Monad authorization/version registry | Implemented architecture; reads use block snapshots |
| 37–51s | Selected preference; excluded private note; ACTIVE receipt and measured delivery/decryption/context increments | Archived Monad Testnet execution; B is a separate local process, not a second external product |
| 51–65s | Actual V2 instruction; `VERSION_STALE`; request increments 0 | Archived execution; no fresh V2 grant/delivery is shown |
| 65–77s | `REVOKED`; request increments 0; previously obtained plaintext cannot be reclaimed | Archived execution |
| 77–85s | Four transaction links and three receipts; clear labels for on-chain state and project-instrumented counters | Existing replay and raw evidence; hash matching checks archive identity |
| 85–92s | Closing title with checkable evidence entry | Protocol purpose, not a production or adoption claim |

Keep “Fixed synthetic material; evidence type labeled by scene” visible. At 77–92s, show a dedicated readable disclosure card alongside captions: “Testnet prototype; archived evidence”; “External model not called; human value and production security unvalidated”; “Snapshot checks; delivery is not atomic with chain state.” Keep the previously received plaintext limit in the spoken narration. Detailed scope remains in `docs/EVIDENCE.md`.

The V2 JSON contains both languages, 8 scenes and 14 planned English caption cues. It is a script handoff file; the current renderer does not consume it. The commands below still produce the V1 package until the renderer is explicitly updated and the new video is verified.

## Existing V1 review package

With an installed FFmpeg/ffprobe available on PATH, run:

```bash
node scripts/render-judge-video.mjs
node scripts/mux-judge-narration.mjs
```

The default output is the adjacent `HACK-001_VIDEO_REVIEW_2026-10-11` directory, outside this source repository. It contains `shanhai-92s-zh-en-review.mp4` (1920×1080, 92 seconds, H.264/AAC), the silent source MP4, English/Chinese SRT files, a Chinese narration sheet, a contact sheet and machine-readable QA. The generator verifies the exact raw hash, source-fixture V1/V2 commitments, recorded scope exclusion, separate process IDs and actual execution deltas before rendering. English text and subtitles are burned into the frames.

The narration step uses an installed Windows Simplified-Chinese SAPI voice (Microsoft Huihui in this run), not a recording of the founder, voice cloning or an external model service. It fails if no suitable installed voice exists; there is no network fallback. Seven segments are padded to their scene windows; no speed adjustment exceeds 1.225× in this run. This audio production is separate from the protocol gateway, whose external-model behavior remains `NOT_MEASURED`. Metadata and segment timing passed; pronunciation and user comprehensibility still require review.

The source example is the executed `protocol/reference/owner-web/sprint-fixture.mjs`: V1 asks for brief, result-first answers; V2 asks for detail for this task. The out-of-scope private note is absent from the recorded ACTIVE context. The video does not show a fresh V2 grant or delivery.

## Existing V1 recording source and timing

Open `apps/demo/evidence-replay.html`. Before narration, verify that the page shows:

- contract `0xcda4d087900f47427b4956b9b1ee2543ec5575c0` on Monad Testnet `10143`;
- raw evidence SHA-256 `49bd59c0ff054fbf2ef82ab009b1bccefaf88890240ff5b18b0d0cc8225a9864` with `MATCH`;
- four MonadScan transaction links;
- three block-bound outcomes and their execution deltas.

| Time | Picture / operation | English subtitle / narration meaning | On-screen proof |
|---:|---|---|---|
| 0–10s | Concrete question | “If I correct what I told an AI, may another assistant receive the old version again?” | problem; synthetic-data and archived-visualization labels |
| 10–23s | The selected V1 preference | “The owner authorizes one item. A separate private note stays outside the scope.” | actual fixed statement; scope exclusion |
| 23–41s | ACTIVE execution | “The owner checks Monad before release. Independent Agent B checks again, decrypts once, and assembles one authorized context.” | five measured deltas = 1; Owner/B blocks and process IDs |
| 41–59s | Actual V2 correction and old request | “This task needs a detailed explanation. The old version-one request is denied, with zero new downstream execution.” | actual correction; `VERSION_STALE`; block 70041507; deltas 0 |
| 59–74s | Revoked grant | “Another request is denied before new delivery. This does not erase plaintext previously received.” | `REVOKED`; block 70043660; deltas 0 |
| 74–84s | Evidence identity | “Four confirmed state transactions and block-bound receipts preserve the sequence. The archived JSON hash matches.” | chain/contract; exact SHA-256; link location on replay page |
| 84–92s | Closing title and boundary | “Encrypted context, exact scope, and verifiable authority over future delivery.” | Track 04; external model NOT_MEASURED |

## Recording rules

- Record at 1920×1080 without wallet UI, account details, notifications, personal browser chrome or secrets.
- Use only the recorded-evidence replay. It requests no wallet, sends no transaction and calls no external model.
- If using the generated MP4, call it an archived-evidence visualization. It is neither filmed browser interaction nor an external observer's independent reproduction.
- Keep `SHA-256 MATCH`, chain ID, contract and exact outcomes visible long enough to read.
- Say “recorded testnet execution”, not “live execution”. The replay is backed by immutable archived JSON but is not itself a new chain run.
- A historical ACTIVE receipt does not mean the consent is active now. The recorded sequence ends in `REVOKED`.
- Do not claim model quality, production security, instant revocation of already obtained plaintext, erasure of chain history, or control over a malicious external agent.
- Publish the final video URL only after logged-out playback works. Retain the source recording and the receipt files used in it.

## Founder review and external check

Watch the Chinese-narrated local draft first. Confirm that the scenario is understandable, the English text is readable, and the pace allows time to inspect the zero-execution states. Review the generic synthesized voice's pronunciation; the founder may replace it with a recording from the Chinese narration sheet while retaining the English subtitles.

Ask one unfamiliar viewer, without explaining the answer beforehand:

1. What concrete problem does this solve?
2. What changed after V2, and what happened to the old request?
3. What did revocation stop, and what could it not undo?
4. Which parts were actually run, and which parts remain untested?

Record their answers and viewing time. A developer can separately follow the README in a clean environment and inspect the raw evidence hash, deployed code and receipts. Until that person actually runs it, keep external reproduction PENDING. Sending an invitation or viewing this generated draft is not adoption or market evidence.
