# Synthetic transaction sequence

所有 ID 和 commitment 都使用合成值。不要把姓名、对话、邮箱或原始文本编码上链。

## 参数准备

| Parameter | Requirement |
|---|---|
| `assetId` | 随机 `bytes32`，全流程保持一致 |
| `consentId` | 另一随机 `bytes32` |
| `commitmentV1` | 合成版本 V1 的 `bytes32` commitment |
| `commitmentV2` | 与 V1 不同的 `bytes32` commitment |
| `grantee` | Agent B 测试地址，不能是零地址 |
| `scopeHash` | 对规范化 scope 的 `bytes32` hash |
| `expiresAt` | 当前时间之后的 Unix 秒时间戳 |

可在浏览器控制台用 Web Crypto 生成随机 ID：

```js
`0x${[...crypto.getRandomValues(new Uint8Array(32))].map(x => x.toString(16).padStart(2, '0')).join('')}`
```

## A. ACTIVE

1. Owner 调用 `registerAsset(assetId, commitmentV1)`。
2. 等待确认，调用 `issueConsent(consentId, assetId, grantee, scopeHash, 1, expiresAt)`。
3. 在证据面板请求 version `1` 与同一个 `scopeHash`。
4. 预期：`ACTIVE`。

## B. VERSION_STALE

1. Owner 调用 `publishVersion(assetId, 1, commitmentV2)`。
2. 等待确认；仍使用原 `consentId` 请求 version `1`。
3. 预期：`VERSION_STALE`；envelope fetch 必须为 0。

## C. REVOKED

1. Owner 调用 `revokeConsent(consentId)`。
2. 等待确认；再次读取原授权。
3. 预期：`REVOKED`；envelope、local decrypt 和 model call 必须均为 0。

## 顺序限制

必须按 A → B → C 执行，因为撤销不可逆。同一个 consent 无法从 `REVOKED` 恢复；需要再次授权时创建新的 `consentId`。
