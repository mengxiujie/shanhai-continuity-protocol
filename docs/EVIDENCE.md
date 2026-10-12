# Evidence and claim boundary

> Updated: 2026-10-12
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
4. 投稿前解决私有评审许可与规则公开源码要求的适用关系，复核评委访问、最终字段和提交回执；主理人提供的规则列五项各 20%，未独立获取在线规则最新版本。

## 2026-10-12 客户批准简报交接：新增实链证据

这是一组与 2026-10-11 偏好案例分开的固定虚构材料。原始浏览器导出分为 [第一段](../deployment/raw-browser-evidence.brief-part1.monad-testnet.2026-10-12.json)（SHA-256 `dea1b5ce0deddf72ac8d9a116e97414f2e227e68c12f6e6cfc66285f381c63b2`）和 [第二段](../deployment/raw-browser-evidence.brief-part2.monad-testnet.2026-10-12.json)（SHA-256 `17e13b028035ef5daab8a3ec272c9602d6c302476509193080ab659e8d60e5be`）。页面重载发生在 V2 授权回执恢复之后，因此没有一个涵盖全部九步的单一原始导出；第二段的五笔回执仍含同一笔 V2 授权。运行 `npm run verify:brief-evidence` 可重新计算两份哈希，核对合成 fixture 的内容承诺、共同标识、五笔交易记录与四次门禁结果。

| 实际顺序 | 浏览器记录 | 可观察输出 |
|---|---|---|
| V1 批准并请求 | `ACTIVE` | 仅批准的 Friday 19:00 简报进入独立 B，固定模板生成公告 |
| 发布 V2 后再次请求旧 V1 | `VERSION_STALE` | 只有链检查增量；无新密文获取、解密、上下文或 gateway 增量 |
| 单独批准 V2 后请求 | `ACTIVE` | 仅批准的 Saturday 15:00 简报进入独立 B，固定模板更新公告 |
| 撤销 V2 后再请求 | `REVOKED` | 只有链检查增量；无新下游执行增量 |

五笔交易分别为 [登记 V1](https://testnet.monadscan.com/tx/0x7d4be6f6beaf502b56867896abbc67febc348e8553f515e8cb9f67a32d32eb9b)、[批准 V1](https://testnet.monadscan.com/tx/0xf85ae48dd0d78b2108f4dfe0b9dc14f172623a3f2f6839c5003182a0962e96e2)、[发布 V2](https://testnet.monadscan.com/tx/0xcc0e0afd89d55f05d3979c2ca897f1efcdef869be30423d9005f15159669e8c2)、[单独批准 V2](https://testnet.monadscan.com/tx/0x4d76dcc55a6a445493a1b24d3d76a479e8b1ed0a000ea19d7dbea7d23c80881a)、[撤销 V2](https://testnet.monadscan.com/tx/0xa65d821b9a127529b8fdf6d185cea29dbb35e9c3c1a477255d8269fc4df029d6)。导出中的交易状态为 `CONFIRMED_ON_TESTNET`；哈希校验和浏览器记录一致性不等同于独立链上重演。

2026-10-12 另以公共 Monad RPC 只读查询上述五个交易哈希，均返回 `status=0x1`，区块号均与导出相符。这独立核实交易入链与成功，不独立证明 Agent B 的链下执行；链下结果仍来自两份原始浏览器导出及本地可复现实现。

`npm run verify:brief-live` 可重做上述只读回执核对；[简报证据回放页](../apps/demo/brief-evidence.html)提供需主动点击的同等只读复查按钮，2026-10-12 本地浏览器实测显示 `5/5` 和区块哈希匹配。它们都不请求钱包签名或产生交易，也不重放历史门禁执行。

没有调用真实模型。公告证据类型是 `DETERMINISTIC_TEMPLATE_NOT_AI`，真人、产品价值和生产安全仍未测。Owner 与代理签名使用同一个测试钱包，B 在独立本机进程；该演示不声称跨机构采用。已收到的旧明文不能因撤销而追回，链检查与交付也不是原子事务。页面重载前存在 V2 授权回执已确认但按钮未即时恢复的 UI 问题；原始失败和恢复经过见 [QA 记录](BRIEF_QA_2026-10-12.md)。

## 2026-10-11 冲刺证据

完整回归 `npm test`：协议向量 9/9，protocol 44/44（既有 13、身份 20、贯通 11），Monad gate 5/5，wallet workbench 14/14。另复跑既有独立进程演示通过，合约编译、发布扫描与静态托管检查通过。依赖固定 `ethers@6.17.0`；官方 npm 审计 0 vulnerabilities 仅代表该次依赖报告，不代表生产安全审计。

首次失败与修复见 [`SPRINT_QA_2026-10-11.md`](SPRINT_QA_2026-10-11.md)。2026-10-11 已取得真实 Monad Testnet 合约、四笔状态交易及 `ACTIVE → VERSION_STALE → REVOKED` 门禁证据；独立只读核验在区块 `70046454` 再次确认运行代码哈希。部署记录见 [`deployment-record.monad-testnet.2026-10-11.json`](../deployment/deployment-record.monad-testnet.2026-10-11.json)，浏览器原始导出见 [`raw-browser-evidence.monad-testnet.2026-10-11.json`](../deployment/raw-browser-evidence.monad-testnet.2026-10-11.json)，SHA-256 为 `49bd59c0ff054fbf2ef82ab009b1bccefaf88890240ff5b18b0d0cc8225a9864`。这些证据不验证生产安全、真实模型质量、真人价值或商业护城河。

[`evidence-replay.html`](../apps/demo/evidence-replay.html) 已在本地浏览器核对三个结果、区块锚点、执行增量、交易链接和原始文件哈希 MATCH。它展示已发生的历史过程；新一次 RPC 查询只能说明当前状态。下游执行计数来自本项目仪表记录，哈希一致证明归档与导出一致，不能替代外部开发者复现或第三方审计。

实链拒绝结果是 Owner 首次门禁的快照证据。B 独立二次核验路径和竞态阻断由本地合成测试另行覆盖；两次读链之间及后续使用之间仍有时间窗，不构成原子读链与交付，也不能追回先前取得的明文。

## 公开与托管证据（历史成功，当前已下线）

2026-10-11 已公开 [隔离仓库](https://github.com/mengxiujie/shanhai-continuity-protocol) 和 [合成演示](https://mengxiujie.github.io/shanhai-continuity-protocol/)。[首次 Actions 发布](https://github.com/mengxiujie/shanhai-continuity-protocol/actions/runs/38090677884) 成功；仓库、演示 HTML/JS 和本页均通过无登录 Cookie 的 HTTP 200 核查。完整发布记录见 [HOSTING.md](HOSTING.md)。公开托管没有补齐 E3，不代表实链双进程或用户钱包已经执行。

随后用户裁决“暂时私有，投稿前公开”。已执行仓库 PRIVATE、移除 Pages 配置；无登录 Cookie 核查仓库、演示 root/HTML 与本页均返回 404。代码、Git 历史和本地测试保留。上述 HTTP 200 是撤回前历史，不得用于声称当前评委可访问；投稿前必须重新开放并复核。
