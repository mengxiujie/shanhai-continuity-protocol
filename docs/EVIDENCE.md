# Evidence and claim boundary

> Updated: 2026-10-11
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
| 钱包签名与 Agent 临时公钥、请求版本/范围/域/nonce 绑定 | E2 | PASS 20/20 | `npm run test:protocol` | 测试生成钱包；无用户钱包操作 |
| 完整正文承诺 + Owner/B 两次 RPC 核验 + 独立 B context | E2 | PASS 11/11 | `npm run test:sprint` | 本机合成 RPC；独立进程与实际加密；受控 gateway |
| 钱包操作台同源保护、交易构造与回执处理 | E1 | PASS 14/14 | `npm run test:wallet` | mock RPC/runtime；真实浏览器钱包未测 |
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
- Owner 门禁非 `ACTIVE`，该次 envelope fetch 必须为 0；B 二次门禁拒绝可以已收到密文，此时解密/context/gateway 应为 0；
- 完整内容承诺与链上承诺一致，正文解密后重新计算；
- 独立进程 PID、Owner/B 各自的区块锚点、实际分阶段增量；
- IPC 完成未知须为 `UNKNOWN`，未知 B 计数为 `NOT_MEASURED`。

`apps/demo/evidence-panel.html` 在没有真实地址与标识时显示 `NOT YET EVIDENCE`。本地四幕演示中的 `DemoMonadProvider` 永远不能写入本表的 E3 证据。

## 未闭合事项

1. 部署 Consent Registry 到 Monad testnet。
2. 依次产生并读取 `ACTIVE → VERSION_STALE → REVOKED` 三种真实状态。
3. 保存交易链接、区块号、面板导出 JSON 与屏幕录制。
4. 真实浏览器钱包与双进程实链取证、外部复现；Mera 已移出主线，仅余量充足时评估。
5. 独立安全复核合约与浏览器密钥生命周期。

## 2026-10-11 冲刺证据

完整回归 `npm test`：协议向量 9/9，protocol 44/44（既有 13、身份 20、贯通 11），Monad gate 5/5，wallet workbench 14/14。另复跑既有独立进程演示通过，合约编译、发布扫描与静态托管检查通过。依赖固定 `ethers@6.17.0`；官方 npm 审计 0 vulnerabilities 仅代表该次依赖报告，不代表生产安全审计。

首次失败与修复见 [`SPRINT_QA_2026-10-11.md`](SPRINT_QA_2026-10-11.md)。当前仍没有本项目 E3 部署或交易证据。协议链不是生产产品、市场价值或商业护城河的验证。

## 公开与托管证据

2026-10-11 已公开 [隔离仓库](https://github.com/mengxiujie/shanhai-continuity-protocol) 和 [合成演示](https://mengxiujie.github.io/shanhai-continuity-protocol/)。[首次 Actions 发布](https://github.com/mengxiujie/shanhai-continuity-protocol/actions/runs/38090677884) 成功；仓库、演示 HTML/JS 和本页均通过无登录 Cookie 的 HTTP 200 核查。完整发布记录见 [HOSTING.md](HOSTING.md)。公开托管没有补齐 E3，不代表实链双进程或用户钱包已经执行。
