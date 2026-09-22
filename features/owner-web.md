# Owner Web

> Feature spec for implementation planning. Source: `../tech-design.md` §8.

| Field | Value |
|---|---|
| Component | owner-web |
| Priority | P0 |
| Upstream Refs | HACK-001-02 §5–7 |
| Depends On | continuity-service, consent-registry, mera-adapter |
| Blocks | four-act demo |

## Purpose

让 Human Owner 清楚完成整理、人工修改、确认、版本更新、范围授权和撤销；可视化 `User Confirmed / Scope / Version / Encrypted Off-chain / Monad tx`，不把 Agent B 伪装在同页。

## Scope

Included：Act 1/3/4、synthetic fixtures、transaction confirmation、状态与证据、accessibility。Excluded：Agent B chat、真人数据入口、生产 login/payment、自动确认。

## Core Responsibilities

human-in-loop confirmation、SCP provenance/time editing、browser-only plaintext crypto、scope-minimal grant envelope、P-256 key binding、Mera P1 disclosure。

## Interfaces

```ts
confirmDraft(input:EditedSyntheticDraft):Promise<PackageCreated>;
publishVersion(input:VersionDraft):Promise<VersionCreated>;
issueConsent(input:ConsentForm):Promise<ConfirmedTx>;
createGrantEnvelope(input:{consent:ConsentForm; agentPublicKey:JsonWebKey; bindingSignature:string}):Promise<EncryptedGrantEnvelope>;
revokeConsent(consentId:string):Promise<ConfirmedTx>;
```

## Data Flow

Synthetic input → 每条显示来源、审阅状态、有效时间和记录时间 → editable confirmation/correction → blindSalt/commitments/AES-GCM in Owner browser → encrypted version upload。Grant：验证 grantee 对 P-256 public key 的签名，按 scope 投影最小 disclosure并保留 provenance/time/supersession，排除 `USER_REJECTED`，随机 SPK 加密，再以 ephemeral P-256 ECDH→HKDF wrapping key 包裹 SPK，只上传 envelope。Mera 仅 P1 owner KEK recovery。

## Key Behaviors

Confirm 前禁用且 API payload 禁止 plaintext。V2 不继承授权。Grant envelope 绑定 consent/version/scope/grantee/public-key fingerprint。revoke 等链确认；之后切换独立 Agent B 发起新请求。

## Constraints

独立 origin/app；CSP；不将 plaintext/key 写 localStorage；所有 fixture 标记 SYNTHETIC；四幕总演示 ≤3 分钟；键盘可用与高对比状态。

## Acceptance Criteria

| AC-ID | Priority | Criterion | Expected Result | Verification Method |
|---|---|---|---|---|
| AC-WEB-001 | P0 | edit then Confirm V1 | browser encrypts; API sees ciphertext only; evidence labels and tx link | Playwright |
| AC-WEB-002 | P0 | no explicit confirmation/invalid scope | no encryption/chain mutation | negative E2E |
| AC-WEB-003 | P0 | create V2 | supersedes shown; no auto consent | E2E + chain query |
| AC-WEB-004 | P0 | revoke tx pending/confirmed | pending not reported final; confirmed state exact | E2E |
| AC-WEB-005 | P1 | Mera unsupported | honest disabled badge; main demo fallback disclosed | compatibility E2E |
| AC-WEB-006 | P0 | grant exact scope to signed Agent B P-256 key | minimal encrypted disclosure stored; no plaintext leaves browser | network E2E |
| AC-WEB-007 | P0 | key binding invalid or scope empty | grant refused before upload | negative E2E |
| AC-WEB-008 | P0 | confirm model inference | `reviewStatus` 变为 confirmed，但 `originKind=MODEL_INFERENCE` 保留且确认事件可追溯 | component + E2E |
| AC-WEB-009 | P0 | correct prior item | 生成新版本和指向旧条目的 relation；旧版本不改写 | protocol vector + E2E |

## Error Handling

Map typed API/contract errors to user actions; rejected signature leaves state retryable; never say success from transaction submission alone. Unknown failure shows requestId, not internal details.

## File Structure

```text
apps/owner-web/src/{main.tsx,app.tsx,features/create/,features/grant/,features/change/,features/revoke/,lib/browser-crypto.ts,lib/api.ts,lib/chain.ts}
apps/owner-web/e2e/four-act-owner.spec.ts
```

## Test Module

**Test file:** `apps/owner-web/e2e/four-act-owner.spec.ts`. Test browser-only encryption, commitment vectors, scope projection, P-256 wrapping, network has no plaintext/key, V2 noninheritance and revoke.
