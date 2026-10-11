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
| Consent Registry 编译及测试网运行代码核验 | E3 | PASS | `REGISTRY_ADDRESS=... npm run verify:deployment` | 已部署；未做独立安全审计 |
| 状态门禁与 envelope fetch counter | E1 | PASS 5/5 | `npm run test:monad-gate` | 合成 JSON-RPC 响应 |
| 钱包签名与 Agent 临时公钥、请求版本/范围/域/nonce 绑定 | E2 | PASS 20/20 | `npm run test:protocol` | 测试生成钱包；无用户钱包操作 |
| 完整正文承诺 + Owner/B 两次 RPC 核验 + 独立 B context | E2 | PASS 11/11 | `npm run test:sprint` | 本机合成 RPC；独立进程与实际加密；受控 gateway |
| 钱包操作台同源保护、交易构造与回执处理 | E3 | PASS | 14/14 mock 回归 + 真实浏览器钱包流程 | 固定虚构材料；用户逐笔确认 |
| 测试网真实 `ACTIVE` receipt | E3 | PASS | [`live-gate-evidence.monad-testnet.2026-10-11.json`](../deployment/live-gate-evidence.monad-testnet.2026-10-11.json) | 受控确定性 gateway；真实模型未测 |
| 测试网真实 `VERSION_STALE` receipt | E3 | PASS | 同上 | Owner 门禁拒绝；下游增量均为 0 |
| 测试网真实 `REVOKED` receipt | E3 | PASS | 同上 | Owner 门禁拒绝；下游增量均为 0 |
| 已归档实链证据的浏览器回放 | E3 记录展示 | 本地 PASS；SHA-256 MATCH | [`evidence-replay.html`](../apps/demo/evidence-replay.html) | 重放既有记录，不新增执行证据；公开托管仍 OFF |
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

1. 已完成原始记录归档与只读回放；短视频录制、外部开发者复现仍待完成。
2. 独立安全复核合约与浏览器密钥生命周期。
3. Mera 已移出主线，仅余量充足时评估。
4. 投稿前重新公开仓库与 Pages，复核匿名访问、最终字段和提交回执；官方评审权重仍未独立核实。

## 2026-10-11 冲刺证据

完整回归 `npm test`：协议向量 9/9，protocol 44/44（既有 13、身份 20、贯通 11），Monad gate 5/5，wallet workbench 14/14。另复跑既有独立进程演示通过，合约编译、发布扫描与静态托管检查通过。依赖固定 `ethers@6.17.0`；官方 npm 审计 0 vulnerabilities 仅代表该次依赖报告，不代表生产安全审计。

首次失败与修复见 [`SPRINT_QA_2026-10-11.md`](SPRINT_QA_2026-10-11.md)。2026-10-11 已取得真实 Monad Testnet 合约、四笔状态交易及 `ACTIVE → VERSION_STALE → REVOKED` 门禁证据；独立只读核验在区块 `70046454` 再次确认运行代码哈希。部署记录见 [`deployment-record.monad-testnet.2026-10-11.json`](../deployment/deployment-record.monad-testnet.2026-10-11.json)，浏览器原始导出见 [`raw-browser-evidence.monad-testnet.2026-10-11.json`](../deployment/raw-browser-evidence.monad-testnet.2026-10-11.json)，SHA-256 为 `49bd59c0ff054fbf2ef82ab009b1bccefaf88890240ff5b18b0d0cc8225a9864`。这些证据不验证生产安全、真实模型质量、真人价值或商业护城河。

[`evidence-replay.html`](../apps/demo/evidence-replay.html) 已在本地浏览器核对三个结果、区块锚点、执行增量、交易链接和原始文件哈希 MATCH。它展示已发生的历史过程；新一次 RPC 查询只能说明当前状态。下游执行计数来自本项目仪表记录，哈希一致证明归档与导出一致，不能替代外部开发者复现或第三方审计。

实链拒绝结果是 Owner 首次门禁的快照证据。B 独立二次核验路径和竞态阻断由本地合成测试另行覆盖；两次读链之间及后续使用之间仍有时间窗，不构成原子读链与交付，也不能追回先前取得的明文。

## 公开与托管证据（历史成功，当前已下线）

2026-10-11 已公开 [隔离仓库](https://github.com/mengxiujie/shanhai-continuity-protocol) 和 [合成演示](https://mengxiujie.github.io/shanhai-continuity-protocol/)。[首次 Actions 发布](https://github.com/mengxiujie/shanhai-continuity-protocol/actions/runs/38090677884) 成功；仓库、演示 HTML/JS 和本页均通过无登录 Cookie 的 HTTP 200 核查。完整发布记录见 [HOSTING.md](HOSTING.md)。公开托管没有补齐 E3，不代表实链双进程或用户钱包已经执行。

随后用户裁决“暂时私有，投稿前公开”。已执行仓库 PRIVATE、移除 Pages 配置；无登录 Cookie 核查仓库、演示 root/HTML 与本页均返回 404。代码、Git 历史和本地测试保留。上述 HTTP 200 是撤回前历史，不得用于声称当前评委可访问；投稿前必须重新开放并复核。
