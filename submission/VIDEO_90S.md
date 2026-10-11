# 90-second judge video

> Updated 2026-10-11 from completed Monad testnet evidence. A 92-second Chinese-narrated review draft with burned-in English subtitles has been generated locally. It visualizes archived evidence and is not a screen recording or new chain execution. Founder review, upload and anonymous playback remain pending.

The single claim to demonstrate is: future controlled delivery depends on the current authorization of an exact version and scope. The recorded testnet sequence shows `ACTIVE_CONTEXT_DELIVERED`, then `VERSION_STALE`, then `REVOKED`. Checks are snapshots, not an atomic transaction with delivery. The content is fixed synthetic material and the external model boundary remains `NOT_MEASURED`.

## Generate the review package

With an installed FFmpeg/ffprobe available on PATH, run:

```bash
node scripts/render-judge-video.mjs
node scripts/mux-judge-narration.mjs
```

The default output is the adjacent `HACK-001_VIDEO_REVIEW_2026-10-11` directory, outside this source repository. It contains `shanhai-92s-zh-en-review.mp4` (1920×1080, 92 seconds, H.264/AAC), the silent source MP4, English/Chinese SRT files, a Chinese narration sheet, a contact sheet and machine-readable QA. The generator verifies the exact raw hash, source-fixture V1/V2 commitments, recorded scope exclusion, separate process IDs and actual execution deltas before rendering. English text and subtitles are burned into the frames.

The narration step uses an installed Windows Simplified-Chinese SAPI voice (Microsoft Huihui in this run), not a recording of the founder, voice cloning or an external model service. It fails if no suitable installed voice exists; there is no network fallback. Seven segments are padded to their scene windows; no speed adjustment exceeds 1.225× in this run. This audio production is separate from the protocol gateway, whose external-model behavior remains `NOT_MEASURED`. Metadata and segment timing passed; pronunciation and user comprehensibility still require review.

The source example is the executed `protocol/reference/owner-web/sprint-fixture.mjs`: V1 asks for brief, result-first answers; V2 asks for detail for this task. The out-of-scope private note is absent from the recorded ACTIVE context. The video does not show a fresh V2 grant or delivery.

## Recording source

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
