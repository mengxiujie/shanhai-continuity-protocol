# Metropolis submission copy

> Sprint draft updated 2026-10-11. Real deployment, connected live delivery evidence, public URLs and final portal submission remain pending at this editorial checkpoint. Replace bracketed placeholders only with verified public evidence, and update the evidence section from the final execution artifacts before submission.

## Project name

**Shanhai Continuity Protocol**

## Tagline

**Your memory travels. Your authority stays with you.**

## One sentence

Shanhai binds encrypted AI context to a user-chosen agent, scope and version, with a Monad authorization check controlling future delivery.

## Short description

Moving AI context between products is increasingly possible. The harder question is whether another agent may receive a particular scope and version now, especially after a correction or revocation. Shanhai Continuity Protocol couples encrypted, source-labeled context with a Monad authorization registry. Its sprint target is one connected path: current chain check → controlled envelope delivery → independent Agent B decryption and context construction. Stale, revoked and mismatched requests must stop before delivery. A simulated gateway measures the downstream boundary; no external model is called.

At this draft checkpoint, local protocol, encryption and separate gate tests exist. A real deployment and recorded execution of the connected live path are still pending. The final submission must state the actual achieved evidence level.

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

- Existing local evidence: protocol conformance, encrypted-envelope implementation, separate independent-process test, synthetic Monad gate tests, contract compilation and release preparation. Exact counts and hashes must come from the final run, not this draft.
- Pending: verified Monad contract deployment and its transaction/block evidence.
- Pending: the same real-chain delivery path producing ACTIVE, VERSION_STALE and REVOKED receipts plus measured downstream activity.
- Pending: public repository, hosted demo, recorded video, logged-out link checks and final portal confirmation.
- Not demonstrated: external model behavior, real-user value, production security, market adoption or Mera recovery.

Use `docs/EVIDENCE.md` and actual sprint run artifacts as the evidence source. A deployment receipt, a synthetic walkthrough and an independent encryption test do not by themselves prove the connected live claim.

## Evidence to insert only after completion

- Public repository: `[GITHUB_URL]`
- Hosted demo: `[DEMO_URL]`
- Demo video: `[VIDEO_URL]`
- Monad contract: `[CONTRACT_ADDRESS]`
- Deployment transaction: `[DEPLOY_TX_URL]`
- `ACTIVE` receipt: `[ACTIVE_RECEIPT_URL]`
- `VERSION_STALE` receipt: `[STALE_RECEIPT_URL]`
- `REVOKED` receipt: `[REVOKED_RECEIPT_URL]`

## Pre-existing work and event-period work

The pre-existing project contributed product context, user-sovereignty principles and earlier local experiments. The standalone protocol, source metadata, bitemporal model, conformance suite, encrypted Agent B reference flow, Monad registry and evidence tools were built as the submission module. The final sprint must disclose its actual additional connection work and real timestamps. See `docs/BUILD_DISCLOSURE.md` and the public Git history; earlier planning maturity is not evidence that all submitted code was built during the event.

## AI tool disclosure

OpenAI Codex and other AI-assisted tools supported research, specification organization, implementation, review, and test scaffolding. The project owner made product and authorization decisions, reviewed outputs, and remains responsible for evidence and submission. See `docs/AI_USAGE.md`.

## Chinese positioning reference

本届参赛主张收敛为：用户确认一份合成材料并限定对象、范围、版本；真实 Monad 授权检查决定密文是否可以交付给独立 Agent B。版本过期或授权撤销后，同一路径必须停止交付、解密和上下文构造。网关仅作确定性模拟，真实模型调用始终为零。当前稿中实链部署、贯通取证与公开链接仍待完成，以实际最终证据替换状态。

## Sponsor bounty

Mera is outside the primary sprint and is not claimed. Select no sponsor bounty unless its separate requirements and actual proof are completed within the authorized scope.
