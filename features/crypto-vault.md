# Crypto Vault

> Feature spec for implementation planning. Source: `../tech-design.md` §8.

| Field | Value |
|---|---|
| Component | crypto-vault |
| Priority | P0 |
| Upstream Refs | HACK-001-02 §4.2, §4.5, §5.3, §7 |
| Depends On | — |
| Blocks | continuity-service |

## Purpose

只保存 Owner Web 已加密的版本 payload 与 grant envelope；在 ACTIVE receipt 后返回匹配 envelope。服务端没有解密接口或密钥。

## Scope

Included：encrypted version/envelope schema、commitment consistency、SQLite repository、ACTIVE receipt gate。Excluded：canonical plaintext、scope projection、任何 unwrap/decrypt、CEK/SPK/私钥、authorization truth。

## Core Responsibilities

encrypted-only storage、immutable version/grant binding、receipt gate、commitment validation、deny-before-envelope。

## Interfaces

```ts
storeEncryptedVersion(row: EncryptedVersion, tx: DbTx): Promise<void>;
storeGrantEnvelope(row: GrantEnvelope, tx: DbTx): Promise<void>;
fetchEnvelopeAuthorized(input:{receipt:VerificationReceipt; requestDigest:string; consentId:string}):Promise<GrantEnvelope>;
```

`EncryptedVersion` 和 `GrantEnvelope` 只含 ciphertext、nonce/tag、wrapped key、public keys、`plaintextCommitment/provenanceCommitment` 与最小协议/版本索引字段；无 plaintext/raw key。

## Data Flow

Owner Web encrypted objects → format/commitment validation → store；access receipt gate → select exact consent envelope → return ciphertext bytes。Agent B 浏览器负责 unwrap/decrypt/context。

## Key Behaviors

验证 `ciphertextDigest` 与 envelope commitment 可从上传字节重算；`plaintextCommitment`、`provenanceCommitment` 只能作为 opaque bytes32，Vault 不解释内部来源和时间。返回前检查 receipt ACTIVE/TTL/requestDigest/public-key fingerprint/consentId。任何非 ACTIVE 不执行 envelope SELECT。

## Constraints

Payload ≤262144 bytes；数据库只存密文、公钥与 commitment；服务进程 `server_plaintext_count=0` 且无 WebCrypto decrypt/unwrap 调用。

## Acceptance Criteria

| AC-ID | Priority | Criterion | Expected Result | Verification Method |
|---|---|---|---|---|
| AC-VAULT-001 | P0 | store valid encrypted version/grant | exact ciphertext bytes retrieved only by ID | integration |
| AC-VAULT-002 | P0 | digest/commitment inconsistent | reject `COMMITMENT_MISMATCH`; no row | mutation test |
| AC-VAULT-003 | P0 | denied/expired/mismatched receipt | reject before envelope query/return | spy-based negative test |
| AC-VAULT-004 | P0 | ACTIVE receipt key fingerprint mismatches grant | `AGENT_KEY_BINDING_INVALID`; zero envelope | integration |
| AC-VAULT-005 | P0 | scan process/API/DB/log | server plaintext and raw CEK/SPK/private key count zero | security scan |
| AC-VAULT-006 | P0 | provenance commitment or protocol/version binding differs | `COMMITMENT_MISMATCH`; no row/envelope | mutation test |

## Error Handling

Commitment mismatch 409 and audit event；missing envelope 404；stale receipt 409。Raw SQLite errors are never returned；密文 integrity 最终由 Agent B AES-GCM 验证。

## File Structure

```text
packages/crypto-vault/src/{envelope-schema.ts,commitment-validator.ts,repository.ts,sqlite-repository.ts,gate.ts}
packages/crypto-vault/test/{commitment-validator.test.ts,repository.integration.test.ts,gate.test.ts}
```

## Test Module

**Test file:** `packages/crypto-vault/test/gate.test.ts`. Cover size boundaries, commitment mutation, consent/key mismatch, receipt TTL/replay, denied requests with envelope query/return zero, and static/runtime assertion that this package exposes no decrypt/unwrap function.
