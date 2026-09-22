# Consent Registry

> Feature spec for implementation planning. Source: `../tech-design.md` §8.

| Field | Value |
|---|---|
| Component | consent-registry |
| Priority | P0 |
| Upstream Refs | HACK-001-02 §4.3–4.4, §5, §7 |
| Depends On | Monad |
| Blocks | verifier-sdk, continuity-service, owner-web, agent-b |

## Purpose

在 Monad 上保存最小 asset/version/consent/grantee/scope/status 与聚合 commitment 事实。来源、确认、双时间和生活正文不直接上链；持久 consent 仅 `ISSUED/REVOKED`；stale、scope mismatch、expired、not found 均由 Verifier 派生。

## Scope

**Included:** asset registration/current version、issue/revoke consent、只读状态、事件、幂等与权限。**Excluded:** 密文、用户资料、支付、代理升级、多链、可枚举正文元数据。

## Core Responsibilities

1. Owner-only version progression；2. immutable consent issuance；3. irreversible per-consent revoke；4. queryable evidence/events；5. stale 可由版本比较确定。

## Interfaces

```solidity
struct Asset { address owner; bytes32 commitment; uint32 currentVersion; }
struct Consent { bytes32 assetId; address grantee; bytes32 scopeHash; uint32 version; uint64 issuedAt; uint64 expiresAt; uint64 revokedAt; } // revokedAt=0 means ISSUED
function registerAsset(bytes32 assetId, bytes32 commitment) external;
function publishVersion(bytes32 assetId, uint32 expectedCurrent, bytes32 newCommitment) external;
function issueConsent(bytes32 consentId, bytes32 assetId, address grantee, bytes32 scopeHash, uint32 version, uint64 expiresAt) external;
function revokeConsent(bytes32 consentId) external;
function getAsset(bytes32 assetId) external view returns (Asset memory);
function getConsent(bytes32 consentId) external view returns (Consent memory);
```

Events mirror non-sensitive fields. Custom errors: `AssetExists`, `AssetNotFound`, `NotAssetOwner`, `VersionConflict`, `ConsentExists`, `ConsentNotFound`, `ConsentAlreadyRevoked`, `InvalidGrantee`, `InvalidScopeHash`, `InvalidExpiry`.

## Data Flow

Owner signs tx → contract validates caller/current version → state update → event → verifier reads state at confirmed block. No service-side signer.

## Key Behaviors

- `publishVersion` requires `expectedCurrent == currentVersion` and sets exactly `+1`; V1 history remains queryable via event/commitment, no consent copied.
- `issueConsent` requires asset current version equality, nonzero grantee/scope, expiry 0 or future; consent ID cannot be overwritten.
- `revokeConsent` transitions persistent `ISSUED → REVOKED` exactly once; no un-revoke. New authorization requires new consent ID.
- Contract never stores `VERSION_STALE`, `SCOPE_MISMATCH`, `EXPIRED` or `NOT_FOUND`; these are per-request outcomes.

## Constraints

Solidity 0.8.30 pinned; non-upgradeable; no plaintext strings; bounded fixed-size storage; chainId recorded off-chain; gas benchmark captured.

## Acceptance Criteria

| AC-ID | Priority | Criterion | Expected Result | Verification Method |
|---|---|---|---|---|
| AC-REG-001 | P0 | owner registers then issues current-version consent | exact Asset/Consent and events | Foundry integration |
| AC-REG-002 | P0 | publish from expected current version | currentVersion increments by exactly 1 | unit/fuzz |
| AC-REG-003 | P0 | non-owner/version race/duplicate ID | matching custom error; no mutation | negative unit |
| AC-REG-004 | P0 | revoke once then repeat | first sets time; repeat custom error; never active | invariant |
| AC-REG-005 | P0 | inspect calldata/log/storage ABI | no content/name/emotion fields | ABI privacy test |
| AC-REG-006 | P0 | inspect provenance handling | no raw source/time/statement on chain；only aggregate commitment | ABI/event privacy test |

## Error Handling

Expected guards use custom errors; unexpected panic is test failure. Frontend maps each error to the main catalog; no generic success UI before confirmed receipt.

## File Structure

```text
packages/contracts/
├── src/ConsentRegistry.sol
├── test/ConsentRegistry.t.sol
├── test/ConsentRegistry.invariant.t.sol
└── script/Deploy.s.sol
```

## Test Module

**Test files:** `packages/contracts/test/ConsentRegistry.t.sol`, `ConsentRegistry.invariant.t.sol`. Test every function, unauthorized caller, duplicate, timestamp boundary, version race, fuzzed identifiers, and invariants revoked→never restored / old consent→stale after increment.
