# Mera Adapter

> Feature spec for implementation planning. Source: `../tech-design.md` §8. TP-MERA-01 已锁定官方 SDK `@category-labs/mera@0.2.0`；真实 passkey/跨设备 ceremony 因本机 Windows Hello PIN 阻断，延至提交前人工 E2E，不阻断 Track 04/P0。

| Field | Value |
|---|---|
| Component | mera-adapter |
| Priority | P1 |
| Upstream Refs | HACK-001-02 §4.5, §7.9, §14 |
| Depends On | official Mera SDK and compatible browser/device |
| Blocks | Mera bounty claim only; not P0 access |

## Purpose

隔离 Mera SDK 变化；仅为 Owner version CEK 的跨设备恢复提供 P1 KEK，不参与 grant SPK 或 Agent B P0 解密。

## Scope

Included：capability probe、官方 secret-vault 创建/解密、zeroization best effort、明确 fallback disclosure。Excluded：登录按钮、钱包签名、支付、服务器保存 PRF 输出或明文 CEK。

## Interfaces

```ts
export interface MeraPrfPort {
  probe(ctx:{userGesture:boolean}): Promise<{supported:boolean; sdkVersion?:string; reason?:string}>;
  protectOwnerCek(input:{rpId:string; credential?:PasskeyCredentialMetadata; cek:Uint8Array}): Promise<PasskeySecretVault>;
  recoverOwnerCek(input:{rpId:string; vault:PasskeySecretVault}): Promise<Uint8Array>;
}
```

内部 port 分别适配官方 `createSecretVaultWithExistingPasskey`（首次无 passkey 时可用 `createSecretVaultWithNewPasskey`）与 `decryptSecretVaultWithPasskey`。底层 `getPasskeyPrfOutput` 接受严格 32-byte salt、强制 `userVerification: required`；产品层不持久化 raw PRF。真实调用与第二设备证据完成前不得提交 Mera bounty 达成声明。

## Data Flow

user gesture → official SDK WebAuthn PRF ceremony → SDK 生成 fresh 32-byte PRF salt → 内部 HKDF-SHA-256(`mera.v1.encrypt.secret`) → non-exportable AES-256-GCM key → 输出 JSON-safe encrypted CEK vault；恢复时以 vault credential+salt 限定同一 passkey 并解密 CEK。

## Key Behaviors

Probe 输出无秘密 evidence；同 credential、rpId 与 vault salt 应恢复同一 owner CEK。不同 credential/rpId/salt 必须失败。失败返回 `MERA_UNSUPPORTED` 并关闭恢复/bounty claim，但不影响当前 Owner 会话生成 grant envelope 与 Agent B P0 访问。

## Constraints

PRF/派生 key 不落盘、不日志、不传服务端；只允许保存 SDK 输出的密文 vault；必须 HTTPS/secure context；用户手势不可自动重试；锁定 SDK 0.2.0（preview）并保留升级兼容测试。

## Acceptance Criteria

| AC-ID | Priority | Criterion | Expected Result | Verification Method |
|---|---|---|---|---|
| AC-MERA-001 | P0 | SDK/API 未验证或浏览器不支持 | probe fails closed; no fabricated integration claim | compatibility test |
| AC-MERA-002 | P1 | 同 passkey 第二设备/新浏览器 | unwrap same CEK and decrypt fixture | recorded manual+E2E |
| AC-MERA-003 | P1 | credential/rpId/vault salt 任一变化 | cannot unwrap prior CEK | negative crypto test |
| AC-MERA-004 | P0 | scan storage/network/log | no PRF/KEK raw bytes | security inspection |

## Error Handling

`MERA_UNSUPPORTED`, `MERA_USER_CANCELLED`, `MERA_PRF_FAILED`, `KEY_DERIVATION_FAILED`; cancel 不重试，网络最多一次；任何失败不得降级为把 secret 存磁盘。

## File Structure

```text
packages/mera-adapter/src/{port.ts,adapter.ts,secret-vault.ts,probe.ts,errors.ts}
packages/mera-adapter/test/{probe.test.ts,secret-vault.test.ts,cross-device.manual.md}
```

## Test Module

**Test file:** `packages/mera-adapter/test/probe.test.ts`. Mock 只测 port 行为；bounty gate 必须用真实 SDK/设备证据，记录版本、浏览器、设备、结果，绝不记录凭据。
