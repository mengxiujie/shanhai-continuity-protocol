# Metropolis submission copy

> Sprint draft updated 2026-10-11. Repository temporarily PRIVATE and Pages OFF following owner instruction; reopen and verify links before submission. Real Monad deployment and the connected fixed-synthetic evidence path passed. Video, browser-export archival and final portal submission remain pending.

## Project name

**Shanhai Continuity Protocol**

## Tagline

**Your memory travels. Your authority stays with you.**

## One sentence

Shanhai binds encrypted AI context to a user-chosen agent, scope and version, with a Monad authorization check controlling future delivery.

## Short description

Moving AI context between products is increasingly possible. The harder question is whether another agent may receive a particular scope and version now, especially after a correction or revocation. Shanhai Continuity Protocol couples encrypted, source-labeled context with a Monad authorization registry. Its sprint target is one connected path: current chain check → controlled envelope delivery → independent Agent B decryption and context construction. Stale, revoked and mismatched requests must stop before delivery. A simulated gateway measures the downstream boundary; no external model is called.

The protocol, encryption path, independent Agent B and deterministic tests pass locally. A user-operated test wallet deployed the registry on Monad Testnet and completed the connected `ACTIVE → VERSION_STALE → REVOKED` path with measured downstream activity. The repository remains private until the pre-submission reopening step.

## Long description

### The problem

People accumulate preferences, corrected statements, goals and constraints with AI. Export formats and memory tools can move this information, but transport alone does not prove that the recipient may receive this version, for this scope, at this time. The concrete problem tested here is an old authorization being replayed after its source version changes or the owner revokes it.

### The solution

Shanhai Continuity Protocol separates four concerns:

1. **Source truth** — user-confirmed material outranks user utterance, traceable fact, and model inference.
2. **Minimum disclosure** — the owner selects an exact scope instead of exporting a whole profile.
3. **Encrypted portability** — the browser creates an encrypted envelope; plaintext remains off-chain.
4. **Independent authorization** — Agent B reads Monad before the service returns the envelope.

The target result is a small continuity primitive: an authorized agent can construct context from one confirmed fragment, while stale, revoked, expired, mismatched, malformed or wrong-chain requests stop before controlled envelope delivery. These are testable behaviors of the supplied implementation, not claims about every external agent or previously disclosed plaintext.

### Why Monad

Monad provides a shared authorization record that a separate process can read without trusting Shanhai's private database: asset, current version, grantee, scope hash, expiry and revocation state. The chain record controls an actual delivery decision in the target flow. Personal text remains encrypted off-chain. This design is EVM-compatible; the submission demonstrates its implementation on Monad rather than claiming that no other chain could implement it.

### Four-act demonstration

1. Owner confirms one synthetic statement and authorizes its minimum scope and Agent B.
2. The target connected runner verifies real `ACTIVE` state before envelope delivery; independent B decrypts and constructs source-labeled context, then invokes a clearly labeled simulated gateway.
3. Owner publishes V2; the same V1 request must return `VERSION_STALE`, with no new envelope delivery, decryption, context construction or gateway invocation.
4. Owner revokes the grant; a further request must return `REVOKED` with the same zero downstream activity.

The three receipts document a historical transition at distinct block anchors. A new RPC read reports current state; it does not recreate historical ACTIVE state. The standalone browser four-act walkthrough is explicitly synthetic until its own live connection is proven.

## Innovation

- A portable continuity package with deterministic source precedence and explicit user confirmation.
- Bitemporal `validTime` and `recordedAt`, plus immutable supersession instead of silent profile overwrites.
- Scope projection and provenance commitments bind meaning and source before encryption.
- Monad authorization is checked before envelope delivery, not after model context construction.
- The connected target measures denial through actual delivery, decryption, context and simulated-gateway activity, rather than UI-assigned counters.

These are the submission's implementation choices. User-owned memory, encryption, portability and revocable permissions already have related open-source work; this submission does not claim to have invented them.

## Technical implementation

- `Shanhai Continuity Protocol 0.1.0`: JSON schema, canonical serialization, conformance vectors, provenance validation, scope projection, context construction.
- Browser WebCrypto: AES-256-GCM envelope; P-256 ECDH + HKDF reference path for Agent B key wrapping.
- Independent Agent B process: local decryption, commitment validation, source-labeled context and simulated gateway instrumentation. Real model calls are zero throughout this sprint.
- Solidity `ConsentRegistry`: asset version, commitment, scoped grant, expiry, grantee, and revocation.
- Monad read adapter: fixed chain ID, block-consistent reads, fail-closed ABI/RPC handling.
- Evidence panel: separates synthetic test outcomes from live receipt evidence.

## Track fit

Primary track: **Trust, Identity & AI Infrastructure**.

Shanhai directly addresses protocol-level trust, provenance, and user-owned data for AI. It demonstrates how an AI agent can be useful without one platform owning or unilaterally controlling the user's continuity context.

## Evidence status at the editorial checkpoint

- Local evidence: 9 conformance vectors, 44 protocol tests, 5 synthetic Monad gate tests and 14 wallet-workbench tests passed at the sprint checkpoint.
- Monad E3 evidence: deployed registry, four confirmed state transactions and the connected `ACTIVE → VERSION_STALE → REVOKED` path. The two denial runs recorded zero new envelope fetch, decryption, context assembly or controlled-gateway work.
- Independent verification: chain ID, deployed runtime length and runtime SHA-256 matched the local compiler artifact at block `70046454`.
- Historical publication passed, then withdrawn: repository currently PRIVATE and Pages OFF; success and subsequent anonymous HTTP 404 checks recorded in `docs/HOSTING.md`.
- Pending: recorded video, final link/field checks and portal confirmation.
- Not demonstrated: external model behavior, real-user value, production security, market adoption or Mera recovery.

Use `docs/EVIDENCE.md` and actual sprint run artifacts as the evidence source. A deployment receipt, a synthetic walkthrough and an independent encryption test do not by themselves prove the connected live claim.

## Evidence links

- Repository URL (currently private; reopen and verify before use): https://github.com/mengxiujie/shanhai-continuity-protocol
- Planned hosted demo URL (currently offline; redeploy and verify before use): https://mengxiujie.github.io/shanhai-continuity-protocol/
- Demo video: `[VIDEO_URL]`
- Monad contract: https://testnet.monadscan.com/address/0xcda4d087900f47427b4956b9b1ee2543ec5575c0
- Deployment transaction: https://testnet.monadscan.com/tx/0xfa9a1587b93c0786a59f5f39ec50734faa67fc8125271c35fee615b1949070d2
- `ACTIVE / VERSION_STALE / REVOKED` gate evidence (available after repository reopening): https://github.com/mengxiujie/shanhai-continuity-protocol/blob/main/deployment/live-gate-evidence.monad-testnet.2026-10-11.json
- V2 transaction: https://testnet.monadscan.com/tx/0x455bb6f7ad8d10977cc37bd3cca9fd0540a1fb5360c6a7ee10e16d7d18423e2c
- Revocation transaction: https://testnet.monadscan.com/tx/0x32502800838f9e58896b9912b0a80d8e1c6a55e574c8746866b1747a13e33d32

## Pre-existing work and event-period work

The pre-existing project contributed product context, user-sovereignty principles and earlier local experiments. The standalone protocol, source metadata, bitemporal model, conformance suite, encrypted Agent B reference flow, Monad registry and evidence tools were built as the submission module. The final sprint must disclose its actual additional connection work and real timestamps. See `docs/BUILD_DISCLOSURE.md` and the public Git history; earlier planning maturity is not evidence that all submitted code was built during the event.

## AI tool disclosure

OpenAI Codex and other AI-assisted tools supported research, specification organization, implementation, review, and test scaffolding. The project owner made product and authorization decisions, reviewed outputs, and remains responsible for evidence and submission. See `docs/AI_USAGE.md`.

## Chinese positioning reference

本届参赛主张收敛为：用户确认一份合成材料并限定对象、范围、版本；真实 Monad 授权检查决定密文是否可以交付给独立 Agent B。2026-10-11 已完成固定虚构材料的 `ACTIVE → VERSION_STALE → REVOKED` 实链路径，两个拒绝状态均记录到下游执行增量为零。网关仅作确定性模拟，真实模型调用始终为零。仓库重新公开、原始浏览器导出归档、视频和最终投稿仍待完成。

## Sponsor bounty

Mera is outside the primary sprint and is not claimed. Select no sponsor bounty unless its separate requirements and actual proof are completed within the authorized scope.
