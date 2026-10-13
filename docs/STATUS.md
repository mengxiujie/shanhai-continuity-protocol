# Repository status

## Current checkpoint — 2026-10-14

This section is the current status. Everything under **Historical checkpoints (superseded)** is retained for provenance, not a current to-do list.

| Area | Current status and evidence source |
|---|---|
| Portal | **Ready for judging**, from the owner's authenticated portal screenshot; last saved 2026-10-13 08:30 UTC after the logo correction. Track, project details, logo, live product and both videos are populated. This is not an award or technical acceptance decision. |
| Deadline / track | Portal: 14 Oct 2026, 11:59 GMT+8; Trust, Identity & AI Infrastructure; no sponsor bounties selected. |
| Public live-product URL | [Read-only verifier](https://mengxiujie.github.io/shanhai-continuity-proof/). Migrated on 2026-10-13 after the owner reported a Cloudflare block on the previous `chatgpt.site` URL. A fresh anonymous root request returned HTTP 200 on 2026-10-13; the owner confirmed the replacement URL in the saved submission. Earlier browser checks showed both original hashes `MATCH`, four archived outcomes and a `5/5` read-only receipt PASS. The local `verify:brief-live` re-check passed all five transactions on 2026-10-13. This is a historical-evidence verifier, not new Agent B execution. |
| Videos | [Technical demo](https://youtu.be/nTZoqwLfsjo), 69 seconds, and [pitch](https://youtu.be/hig7qjxeCFQ), 70 seconds; owner reported both playable without login. Demo is a post-run verifier capture, not original signing footage. |
| Testnet brief | Five successful state transactions; V1 `ACTIVE`, old V1 `VERSION_STALE`, separately approved V2 `ACTIVE`, V2 `REVOKED`. Original exports remain unchanged. |
| Compiler dependency maintenance | On 2026-10-14, kept `solc` 0.8.30 and overrode its development dependency `tmp` to 0.2.7. A fresh official npm audit of `contracts` reports zero known findings. Compilation and exact deployed-runtime comparison passed at Monad Testnet block 70735828; the 2526-byte runtime SHA-256 remains `f968181f3fe204013357563ff6c0e6a6ba23320340974036b32ee97c86f827f4`. Existing 9 conformance vectors, 48 protocol tests, 5 gate tests, 19 wallet tests and the separate-process check passed after the change. License attribution and the public-clone Quickstart were corrected; see [audit record](audit-report.md). |
| Source access | Published with the owner's renewed authorization on 2026-10-14. Anonymous GitHub API reads confirm **public**, default branch `main`, and source commit `9185c9e7464fe6ed4e8701b7cb0a8c0abbd3e3af`. The repository webpage, README, JUDGES.md, docs/DEVELOPER_QUICKSTART.md and contracts/src/ConsentRegistry.sol returned HTTP 200 without login credentials. The release audit scanned 145 files with no findings before publication. The organizer separately confirmed acceptance of its invitation; no judge login session was operated here. |
| External evidence | This public repository makes no claim of external application integration, customer adoption or production use. Nonpublic review material is kept outside this repository. An earlier AI-generated reproduction-style report is not human testing evidence. |
| Developer packet | [Quickstart](DEVELOPER_QUICKSTART.md), [optional feedback form](EXTERNAL_REPRO_FEEDBACK.md) and [local example](../examples/brief-handoff.mjs) prepared. Documentation separates browser/archive, fresh local mock and live receipt checks; ZIP users skip Git. The local 4/4 example is not a new Monad run. |
| Public proof hosting | Separate public static repository `mengxiujie/shanhai-continuity-proof`, deployed commit `037bce78a55b9961de4645fad3c856efeb1b7ac3`; contains 25 static demo/evidence files. The implementation repository is also public as of 2026-10-14. The prepared alternative Sites project was not deployed and is not the recovery URL. |
| Technical article | The owner's [DEV article, A correction does not inherit the old approval](https://dev.to/mengxiujie/a-correction-does-not-inherit-the-old-approval-1dja), is published and was retrieved in public search on 2026-10-13. The [repository article candidate](../submission/TECHNICAL_ARTICLE.md) is a separate text, not an exact copy of that published page; local edits do not update DEV. |
| Governance design provenance | [Build disclosure](BUILD_DISCLOSURE.md#how-governance-practice-shaped-this-build) maps prior governance practice to the submitted version, scope and delivery checks. It does not claim that the internal governance workflow runs through this protocol or that governance maturity establishes product adoption. README, judge guide, Q&A and candidate field copy carry the same boundary. These local wording refinements are not a new portal submission. |
| Remaining risks | Read-only demo's fit to the working-product requirement; external integration evidence. Public source access does not establish judges' acceptance of the submission. |

The announcement is a deterministic template using fixed fictional data. The same test wallet signed Owner and requester operations; B ran in a separate local process. Receipt checks establish inclusion/success/block matching; off-chain execution deltas remain project-instrumented. Snapshot reads do not eliminate the state-change race, and revocation cannot recall delivered plaintext. Production security and live-model quality are not established.

The 2026-10-13 local verification and focused documentation findings are recorded in [audit-report.md](audit-report.md), including the initial sandbox child-process failure and the approved-process successful retry. The Windows reproduction script now stops on a failed native command instead of relying on a final PASS label.

## Historical checkpoints (superseded)

The following October 11–12 preparation notes predate the portal's **Ready for judging** state and the latest media checks. Their pending statuses, counters and commit IDs describe those earlier checkpoints only.

Latest 2026-10-12 checkpoint: client-approved activity brief and independent V2 reauthorization are implemented. Local protocol tests 48/48, gate tests 5/5, wallet/API/controller tests 19/19 and conformance 9/9 pass. Founder-operated Monad Testnet has produced five confirmed transaction records and four gate outcomes: V1 `ACTIVE` Friday 19:00; old V1 `VERSION_STALE`; separately approved V2 `ACTIVE` Saturday 15:00; V2 `REVOKED`. Both denials have zero downstream execution delta. Two original browser exports, split by a page reload after V2 receipt recovery, are archived unchanged and pass `npm run verify:brief-evidence`; see `BRIEF_QA_2026-10-12.md`. This is fixed synthetic material and a deterministic announcement template, not a live model or production service. The 2026-10-11 results below remain a separate preference case. The older `../submission/BRIEF_DEMO_90S.md` script was not filmed as written; the public 69-second narrated verifier demo is a separately scoped post-run read-only capture. The isolated repository remains private, with an organizer invitation pending acceptance; portal submission has not been performed.

Submission-prep update: [new brief-case portal copy](../submission/BRIEF_SUBMISSION_COPY.md), [English film narration candidate](../submission/BRIEF_NARRATION_EN.md), [operational capture plan](../submission/BRIEF_VIDEO_CAPTURE.md), and the track-specific [scorecard](../submission/SCORECARD.md) point to this executed case. `npm run verify:brief-live` and the replay's click-to-check button independently re-read all five transaction receipts; the browser showed `5/5 PASS` with matching block hashes. These are read-only chain checks, not a fresh wallet run. The Founder confirmed no original wallet-run screen recording exists. A new 69-second continuous read-only browser walkthrough was captured from the public HTTPS page with a fresh button click and `5/5 PASS`; details and SHA-256 are in `../HACK-001_VIDEO_REVIEW_2026-10-12_BRIEF/CAPTURE_MANIFEST.md`. It is not original wallet footage. The 69-second narrated demo and separate 70-second pitch are now publicly hosted with synthetic English voice; local browser media metadata passed and anonymous page/MP4 HEAD returned 200, but direct public-browser playback was not completed. **Repository invitation acceptance and portal receipt remain pending.**

Authenticated portal transcription received 2026-10-12: the displayed deadline is **14 Oct 11:59 GMT+8**, checklist **1/5**, with only the primary track complete. The form expressly accepts a public source repository **or** a private repository shared with its specified organizer review mailbox. It separately requires a Monad-running HTTPS live product, a working-product demo video (≤3 minutes), a team/problem/motivation pitch video (≤2 minutes), a compliant logo, project detail fields and steps to try. Actual field map: [PORTAL_FIELD_MAP.md](../submission/PORTAL_FIELD_MAP.md); candidate English answers: [PORTAL_READY_BRIEF.md](../submission/PORTAL_READY_BRIEF.md). A separate, authorized [public read-only evidence verifier](https://shanhai-brief-proof.open-wand-0634.chatgpt.site/) now returns anonymous HTTP 200 and, when operated from the public origin, verifies both evidence hashes and five Monad Testnet receipts (`5/5 PASS`). It is not the signing workbench or a production AI service; whether judges accept it as the required live product remains uncertain. A compliant local PNG logo and silent 69-second public-origin walkthrough also exist. No portal fields were edited by this checkpoint.

Current repository review checkpoint (2026-10-12): isolated contest code and evidence are on private GitHub `main` at `5fee936`. GitHub shows a pending `write` invitation to organizer account `MonadMetropolis` (invitation ID `337336571`). Invitation sent is not invitation accepted or reviewer access tested. The portal is still unsubmitted. Earlier paragraphs below retain their original production-history context where applicable; this checkpoint supersedes their older "no invitation / only local" claims.

## Submission readiness

| Area | Status |
|---|---|
| Repository structure | READY; remote temporarily PRIVATE |
| Repository review access | INVITED, NOT YET ACCEPTED: `MonadMetropolis` has a pending `write` invitation to the private repo. Actual reviewer access not verified; rules §§4.1/7.2 public-code timing still requires clarification |
| GitHub Pages | OFF; anonymous root/demo/evidence HTTP 404 |
| Separate public HTTPS verifier | LIVE; fixed fictional brief, archived evidence and read-only Monad Testnet receipt check; source repository remains PRIVATE |
| Portal logo PNG | READY locally; 1024×1024, 335313 bytes |
| Root README and disclosure | READY |
| MIT license and third-party notice | READY |
| SCP protocol tests | PASS |
| Monad gate synthetic tests | PASS |
| Evidence panel | READY FOR LIVE INPUT |
| Deployment runbook and verifier | READY |
| Testnet contract deployed | PASS; `0xcda4d087900f47427b4956b9b1ee2543ec5575c0` |
| Live ACTIVE / VERSION_STALE / REVOKED evidence | PASS; fixed synthetic path |
| Exact raw browser export archive | PASS; SHA-256 `49bd59c0ff054fbf2ef82ab009b1bccefaf88890240ff5b18b0d0cc8225a9864` |
| Recorded evidence replay | PASS locally; hash MATCH; anonymous hosting remains OFF |
| New client-brief evidence | PASS locally; two raw exports hash MATCH; five tx receipts independently re-read via public RPC with status `0x1`; four gate outcomes verified; [read-only replay](../apps/demo/brief-evidence.html) works locally |
| 92-second Chinese narration / English subtitles | GENERATED locally; metadata/timing/visual contact sheet PASS; founder review PENDING |
| Preferred narration V2 / English caption plan | TEXT READY locally; source claims reviewed; 92-second windows planned; V2 audio/video NOT RENDERED; existing MP4 remains V1 |
| Hosted demo and separate pitch video URLs | FOUNDER-TESTED YOUTUBE: demo `https://youtu.be/nTZoqwLfsjo` (69 seconds) and pitch `https://youtu.be/hig7qjxeCFQ` (70 seconds). Founder reports both open without login; tool-side independent playback and portal-field acceptance remain unverified |
| External developer reproduction | PENDING |
| Track judging weights | Founder-supplied current authenticated track page: Technical Execution 20%, Design & Craft 20%, Originality & Track Insight 15%, Founder & Market Readiness 25%, Traction & Path Forward 20%. This supersedes the earlier generic 20%-each scorecard; current page was not independently retrievable by the web tool |
| Official video limit / operational footage | Track page: demo ≤3 minutes and pitch ≤2 minutes, hosted via YouTube/Loom/Vimeo. Both new URLs use YouTube and meet the measured local durations; demo is read-only post-run verification, not original wallet signing. Judges' working-product interpretation remains uncertain |
| Final portal submission receipt | PENDING |
| Mera ceremony | DEFERRED |
| Production or real-user release | NOT AUTHORIZED |

## Go / no-go

参赛源码仓库按用户指令继续私有；原 GitHub Pages 公开演示仍下线。用户另行授权的、仅含固定虚构材料的独立只读核验页已公开，不能把它等同于公开源码或钱包操作台。2026-10-12 主办方回复允许私有评审，但所附规则 §4.1/7.2 的公开/开源要求与私有路线的阶段关系仍需澄清；不能把私有评审许可等同于豁免开源或保密。GitHub 已发出官方账号邀请；接受与实际访问仍待确认。

固定虚构材料的 Monad 真门禁路径已完成，浏览器原始导出已按 SHA-256 归档，并通过独立代码核验。只读证据回放页已在本地显示三个历史结果及哈希 MATCH；92 秒中文合成旁白＋英文字幕审阅稿是旧检查点。新的 69 秒技术演示与 70 秒项目介绍现有 YouTube 链接，主理人称未登录可播放。当前仍需外部开发者复现并核对实际投稿字段及回执。演示视频是事后只读核验，不是原始钱包现场录屏。独立进程与代码核验不等于外部开发者复现；不得将本结果描述为生产安全、真实模型质量、真人价值或市场验证。

Owner 与 B 各自在区块快照上检查资格，两次检查之间以及检查后仍有状态变化时间窗。实链证据证明记录时的许可与拒绝结果，不证明原子交付或已取得明文可被追回。

2026-10-11 文稿优化（历史检查点）：当时首选旁白为 `submission/VIDEO_90S.md` 的 V2 文稿及 `submission/VIDEO_90S_V2.json`，当时尚未渲染；此后已制作并托管分别为 69 秒和 70 秒的新英文视频。参赛更新现已推送私有远端 `5fee936`，`91f0e4e` 不再是当前远端检查点。
