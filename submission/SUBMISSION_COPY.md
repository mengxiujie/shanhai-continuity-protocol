# Metropolis submission copy

> Draft status: ready for portal-field mapping on 2026-10-02. Replace bracketed placeholders only with verified public evidence.

## Project name

**Shanhai Continuity Protocol**

## Tagline

**Your memory travels. Your authority stays with you.**

## One sentence

Shanhai is a user-owned continuity protocol that lets an independent AI agent receive only the encrypted, source-proven material a user authorized—and nothing when the grant is stale, revoked, or out of scope.

## Short description

AI memory is useful, but today it is usually trapped inside one platform and governed by that platform. Shanhai Continuity Protocol makes continuity portable without making personal data public. The owner confirms source material, projects a minimum authorized scope, encrypts it in the browser, and grants an Agent B access. Monad stores only the minimum authorization facts. Agent B independently reads those facts before any envelope is returned. `VERSION_STALE`, `REVOKED`, scope mismatch, wrong-chain, and malformed-RPC paths fail closed with zero envelope delivery and zero model calls.

## Long description

### The problem

People increasingly build valuable personal context with AI: confirmed preferences, corrected stories, goals, constraints, and life events. That context is difficult to move between agents without either copying an entire chat history or trusting a single platform to decide what another agent may know. Ordinary account memory solves convenience inside one product; it does not create portable, independently verifiable user authority.

### The solution

Shanhai Continuity Protocol separates four concerns:

1. **Source truth** — user-confirmed material outranks user utterance, traceable fact, and model inference.
2. **Minimum disclosure** — the owner selects an exact scope instead of exporting a whole profile.
3. **Encrypted portability** — the browser creates an encrypted envelope; plaintext remains off-chain.
4. **Independent authorization** — Agent B reads Monad before the service returns the envelope.

The result is a continuity primitive rather than another diary or chatbot. An authorized agent can continue with one confirmed fragment. A stale, revoked, expired, mismatched, malformed, or wrong-chain request receives no envelope and creates no model request.

### Why Monad

If authorization lives only in Shanhai's database, Agent B must trust Shanhai's current answer. Monad gives Agent B an independently readable authorization fact: asset, current version, grantee, scope hash, expiry, and revocation status. Personal text never goes on-chain. Monad is the shared trust layer that makes the negative guarantees observable across organizational boundaries.

### Four-act demonstration

1. Owner confirms one synthetic statement and authorizes its minimum scope.
2. Agent B independently verifies `ACTIVE`, decrypts locally, and constructs one labeled model context.
3. Owner publishes V2; replaying the V1 grant returns `VERSION_STALE`, with zero envelope, decryptions, and model calls.
4. Owner revokes the grant; the next request returns `REVOKED`, again with all three counters at zero.

## Innovation

- A portable continuity package with deterministic source precedence and explicit user confirmation.
- Bitemporal `validTime` and `recordedAt`, plus immutable supersession instead of silent profile overwrites.
- Scope projection and provenance commitments bind meaning and source before encryption.
- Monad authorization is checked before envelope delivery, not after model context construction.
- The demo treats denial as first-class evidence: non-active states visibly keep model calls at zero.

## Technical implementation

- `Shanhai Continuity Protocol 0.1.0`: JSON schema, canonical serialization, conformance vectors, provenance validation, scope projection, context construction.
- Browser WebCrypto: AES-256-GCM envelope; P-256 ECDH + HKDF reference path for Agent B key wrapping.
- Independent Agent B process: local decryption, commitment validation, source-labeled context, model gateway counter.
- Solidity `ConsentRegistry`: asset version, commitment, scoped grant, expiry, grantee, and revocation.
- Monad read adapter: fixed chain ID, block-consistent reads, fail-closed ABI/RPC handling.
- Evidence panel: separates synthetic test outcomes from live receipt evidence.

## Track fit

Primary track: **Trust, Identity & AI Infrastructure**.

Shanhai directly addresses protocol-level trust, provenance, and user-owned data for AI. It demonstrates how an AI agent can be useful without one platform owning or unilaterally controlling the user's continuity context.

## Current verified evidence

- SCP conformance: 9/9 PASS.
- Runtime and encrypted-envelope tests: 13/13 PASS.
- Monad deterministic gate tests: 5/5 PASS.
- Independent Agent B process: PASS.
- Solidity compilation: PASS with solc 0.8.30; 2554-byte deployment bytecode.
- Release audit: PASS with zero findings.

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

The pre-existing project contributed the product vision, user-sovereignty principles, and earlier local continuity experiments. The standalone protocol, source hierarchy, bitemporal model, conformance suite, encrypted Agent B flow, Monad Consent Registry, verifier, four-act demo, and evidence tooling were implemented as the substantial new submission module. See `docs/BUILD_DISCLOSURE.md` and the public Git history.

## AI tool disclosure

OpenAI Codex and other AI-assisted tools supported research, specification organization, implementation, review, and test scaffolding. The project owner made product and authorization decisions, reviewed outputs, and remains responsible for evidence and submission. See `docs/AI_USAGE.md`.

## Chinese positioning reference

未叙山海不是让平台“拥有你的记忆”，而是让用户确认、保存并授权自己的连续性材料。用户只开放本次所需的最小范围；独立 Agent 必须先在 Monad 验证授权。版本失效、撤销或越权时，不返回密文、不解密、不调用模型。
