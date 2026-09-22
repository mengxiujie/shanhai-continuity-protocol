# Evidence and claim boundary

> Updated: 2026-09-21  
> Data class: synthetic only

本页是仓库证据主入口。技术设计描述目标；本页只登记已经获得的工程证据和仍缺失的证据。

## 证据等级

| 等级 | 含义 |
|---|---|
| E0 | 设计或声明，没有执行证据 |
| E1 | 确定性单元或合成测试 |
| E2 | 独立进程、本地真实密码学或真实公共 RPC 读取 |
| E3 | Monad 测试网真实合约、交易与可复核 receipt |
| E4 | 生产环境、真人使用或市场结果 |

## 当前证据矩阵

| Claim | Level | Result | Reproduce | Boundary |
|---|---:|---|---|---|
| SCP schema/来源/双时间/修正关系 | E1 | PASS 9/9 | `npm run test:protocol` | 合成向量 |
| 规范序列化、范围投影、来源承诺与 context | E1 | PASS 7/7 | `npm run test:protocol` | 不含模型调用 |
| 浏览器标准密码学 envelope | E2 | PASS | `npm run test:protocol` | 本地 WebCrypto |
| 独立 Agent B 进程 | E2 | PASS | `npm run test:process` | 本机独立进程 |
| Monad testnet 可达且 chain ID=10143 | E2 | PASS | `npm run probe:monad` | 只读公共 RPC；区块随时间变化 |
| Consent Registry 编译 | E1 | PASS | `npm run compile:contract` | 未部署、未审计 |
| 状态门禁与 envelope fetch counter | E1 | PASS 5/5 | `npm run test:monad-gate` | 合成 JSON-RPC 响应 |
| 测试网真实 `ACTIVE` receipt | E3 | MISSING | `npm run verify:deployment` + evidence panel | 需要真实部署及初始化交易 |
| 测试网真实 `VERSION_STALE` receipt | E3 | MISSING | evidence panel | 需要发布 V2 |
| 测试网真实 `REVOKED` receipt | E3 | MISSING | evidence panel | 需要撤销交易 |
| Mera ceremony/跨设备恢复 | E3 | DEFERRED | 官方 SDK 浏览器流程 | Windows Hello PIN 阻断 |
| 生产安全、真人价值、支付与留存 | E4 | NOT CLAIMED | 无 | 不在当前仓库范围 |

## 合格的 Monad 证据记录

一条真实门禁证据至少包含：

- `chainId = 10143`；
- Consent Registry 合约地址；
- 合约部署交易哈希与区块号；
- `assetId`、`consentId`、`grantee`、请求版本和 `scopeHash`；
- 同一区块读取的 asset 与 consent；
- 派生 outcome 与区块哈希；
- 若 outcome 不是 `ACTIVE`，envelope fetch 必须为 0。

`apps/demo/evidence-panel.html` 在没有真实地址与标识时显示 `NOT YET EVIDENCE`。本地四幕演示中的 `DemoMonadProvider` 永远不能写入本表的 E3 证据。

## 未闭合事项

1. 部署 Consent Registry 到 Monad testnet。
2. 依次产生并读取 `ACTIVE → VERSION_STALE → REVOKED` 三种真实状态。
3. 保存交易链接、区块号、面板导出 JSON 与屏幕录制。
4. 在可用 passkey 环境完成 Mera ceremony 与第二设备/新 profile 复现。
5. 独立安全复核合约与浏览器密钥生命周期。
