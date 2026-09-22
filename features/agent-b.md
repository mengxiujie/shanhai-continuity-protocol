# Agent B

> Feature spec for implementation planning. Source: `../tech-design.md` §8.

| Field | Value |
|---|---|
| Component | agent-b |
| Priority | P0 |
| Upstream Refs | HACK-001-02 §4.1, §5.2, §6 Acts 2–4, §7 |
| Depends On | verifier-sdk, continuity-service |
| Blocks | winner demo readiness |

## Purpose

作为独立调用方证明另一个 AI 可以在不信任未叙授权声明的情况下，先查 Monad、再取得有限 scope；stale/revoke 后真正停止正文和模型上下文。

## Scope

Included：独立 app/process/origin、内存 P-256 key pair、grantee signature binding、Verifier、encrypted envelope、本地 unwrap/decrypt/context/model。Excluded：服务端明文、共享 Owner session/DB、持久化 private key。

## Core Responsibilities

independent verification、scope-limited request、receipt display、denial before context、fresh session retry after state change。

## Interfaces

```ts
verifyConsent(input:VerifyInput):Promise<VerificationReceipt>;
generateEphemeralAgentKey():Promise<CryptoKeyPair>;
requestContinuity(input:AgentAccessRequest):Promise<{receipt:VerificationReceipt; encryptedEnvelope:GrantEnvelope}>;
decryptEnvelopeLocally(envelope:GrantEnvelope, privateKey:CryptoKey):Promise<ScopedPayload>;
buildModelContext(payload:ScopedPayload, receipt:VerificationReceipt):ModelMessage[];
continueFromContext(messages:ModelMessage[]):Promise<Continuation>;
```

## Data Flow

Agent browser generates non-exportable P-256 private key in memory → grantee signs public-key binding → API/Verifier → ACTIVE encrypted envelope only → browser ECDH/HKDF unwraps SPK → AES-GCM decrypts → 校验 SCP/provenance commitment → 删除 `USER_REJECTED` → 携带来源、双时间和修正关系构造 local context/model。Denial terminates before envelope。

## Key Behaviors

Each browser session creates P-256 key pair and fresh signed binding/challenge。No cached ACTIVE。UI shows derived outcome and counters。Envelope AAD/commitments are checked locally before context。X25519 仅可作为后置可选。

## Constraints

Separate build/origin；private key non-exportable and memory-only；no Owner cookies/plaintext persistence；never mock Verifier/chain in final demo。

## Acceptance Criteria

| AC-ID | Priority | Criterion | Expected Result | Verification Method |
|---|---|---|---|---|
| AC-AGB-001 | P0 | ACTIVE exact grant | envelope returned; browser locally decrypts exact scope and builds context | cross-app E2E |
| AC-AGB-002 | P0 | request extra scope | `SCOPE_MISMATCH`, envelope/decrypt/model calls 0 | negative E2E |
| AC-AGB-003 | P0 | V2 exists, V1 consent used | `AUTHORIZATION STALE`, zero envelope/context | E2E |
| AC-AGB-004 | P0 | revoke then new session/request | `CONSENT REVOKED`, zero envelope/context | E2E |
| AC-AGB-005 | P0 | Monad unavailable | fail-closed 503; no prior payload reused | fault E2E |
| AC-AGB-006 | P0 | private key missing or envelope/AAD tampered | local decrypt fails; no context/model | browser crypto negative |
| AC-AGB-007 | P0 | replace public key without grantee signature | 403; zero envelope | binding E2E |
| AC-AGB-008 | P0 | scoped payload 含来源与时间 | 上下文保留 provenance/time 标签；模型推断不得呈现为用户原话 | context snapshot test |
| AC-AGB-009 | P0 | payload 含 rejected item 或 provenance commitment 被改写 | 构造上下文前拒绝或排除；零模型调用 | negative browser test |

## Error Handling

Denial state is primary output, not caught as generic exception. Retry only chain pending/unavailable with explicit user action; never automatically widen scope or select another version.

## File Structure

```text
apps/agent-b/src/{main.tsx,app.tsx,agent/key-binding.ts,agent/envelope-crypto.ts,agent/access-client.ts,agent/context-builder.ts,agent/model-adapter.ts,components/verification-panel.tsx}
apps/agent-b/e2e/independent-access.spec.ts
```

## Test Module

**Test file:** `apps/agent-b/e2e/independent-access.spec.ts`. Assert separate origin, WebCrypto P-256 vectors, signed key binding, local-only decrypt, all outcomes, fresh revoke request, exact scoped context, and zero envelope/decrypt/model on denial.
