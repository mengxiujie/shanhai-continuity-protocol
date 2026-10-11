# Shanhai Continuity Protocol

> A user-owned continuity layer for AI: disclose the minimum, prove the source, and revoke future access.

**Metropolis 2026 candidate repository · Track: Trust, Identity & AI Infrastructure**

Current visibility: **temporarily PRIVATE; GitHub Pages OFF**, by owner instruction on 2026-10-11. Repository/demo links are not currently available to anonymous judges. Reopen before submission and verify access again; see the [publication and withdrawal record](docs/HOSTING.md). Local reproduction remains available. Static hosting is not the local dual-process wallet workbench or a live testnet proof.

## In one minute

Shanhai Continuity Protocol (SCP) is a user-controlled continuity reference for AI agents. A wallet-signed request binds an exact scope/version to an ephemeral Agent B key. The Owner reads Monad before releasing that encrypted disclosure; an independent B process reads the registry again, decrypts, verifies full content and provenance commitments, and assembles a controlled context. An Owner-side stale/revoked/invalid gate stops before delivery. If state changes between the two checks, B can stop before decryption even though ciphertext has already been delivered. This is snapshot-based enforcement, not instantaneous revocation of past plaintext.

The repository is an independently publishable hackathon module. It is not the complete Unsaid Shanhai commercial product and contains no real user data, production credentials, payment system, private operating documents, or proprietary prompt corpus.

### Reproduce the synthetic evidence

```bash
npm ci
npm ci --prefix contracts
npm run audit:release
npm test
npm run test:process
npm run test:wallet
npm run compile:contract
npm run build:pages
npm run audit:hosting
```

The public Monad RPC probe is separate because it requires network access:

```bash
npm run probe:monad
```

Current evidence boundaries are explicit: the integrated dual-process route passes against a local synthetic JSON-RPC server using the actual RPC decoder and cryptography. No external model is called. A live testnet deployment, three real state receipts, and browser-wallet signatures remain unverified until executed.

未叙山海（Shanhai）正在探索一种不同于“平台替用户记住一切”的个人 AI 记忆方式：用户先确认材料，再决定向哪个 Agent 开放哪个范围；正文保持离链加密，Monad 只保存独立验证授权所需的最小事实。

本仓库是 Metropolis 黑客松参赛模块的公开工程包，不是未叙山海完整商业产品，也不包含真人数据、生产凭据或私有业务材料。

## 四幕演示

1. **Owner 授权**：用户确认合成材料，选择最小披露范围，在浏览器生成加密 envelope。
2. **Agent B 接续**：Owner 先读授权，只有 `ACTIVE` 才释放精确 envelope；独立 B 再自行读链，授权有效才解密，随后核验完整正文与来源承诺，最后构造受控上下文。
3. **版本失效**：Owner 读取到 V2 后，旧 V1 授权得到 `VERSION_STALE`；该次请求的 envelope、解密、context、受控 gateway 增量均为 0。
4. **撤销生效**：Owner 撤销授权后，新请求得到 `REVOKED`；不得返回正文或构造上下文。

## 为什么需要 Monad

如果授权状态只保存在未叙自己的数据库里，Agent B 仍然必须相信未叙的声明。Consent Registry 把最小授权事实放在 Monad 上，使另一个 Agent 可以独立验证：

- 授权对象是否是自己；
- 请求范围是否与授权范围完全一致；
- 请求版本是否仍是当前版本；
- 授权是否已经撤销或过期。

Monad 不保存生活正文、来源记录或模型上下文。链上状态是授权事实层，不是个人资料库。

## 当前可验证能力

| 能力 | 状态 | 证据 |
|---|---|---|
| SCP 0.1.0 schema、来源优先级、双时间与修正关系 | PASS | `protocol/test/conformance.mjs`，9/9 |
| 规范化序列化、范围投影、来源承诺、Agent B context | PASS | protocol unit suite，7/7 |
| WebCrypto envelope 与独立 Agent B 进程 | PASS | protocol E2E / process suite |
| Monad testnet RPC 与 chain ID 只读探针 | PASS | chain ID 10143；`apps/demo/probe-monad-rpc.mjs` |
| Solidity Consent Registry 编译 | PASS | solc 0.8.30；`contracts/build/ConsentRegistry.json` |
| `ACTIVE / VERSION_STALE / REVOKED` envelope 门禁 | 合成 RPC PASS | `apps/demo/test/monad-gate.test.mjs`，5/5 |
| 签名身份、临时 P-256 密钥、nonce/域/链/合约绑定 | 本地 PASS | request identity suite，20/20 |
| 统一 RPC → 密文 → 独立 B → context 路径及并发/UNKNOWN | 本地合成 RPC PASS | sprint chain suite，11/11；真实模型未测 |
| 本地钱包操作台、同源保护、ABI 与回执核验 | PASS | wallet suite 14/14；真实浏览器钱包流程完成 |
| Monad 测试网真实合约部署与三类真实 receipt | **E3 PASS** | `0xcda4d087900f47427b4956b9b1ee2543ec5575c0`；见 `docs/EVIDENCE.md` |
| Mera 真实 ceremony / 第二设备恢复 | **DEFERRED** | 已调起系统认证，受本机 Windows Hello PIN 阻断 |

详细证据边界见 [`docs/EVIDENCE.md`](docs/EVIDENCE.md)。

## 仓库结构

```text
apps/
  owner-web/       Owner 端浏览器原型
  agent-b/         独立 Agent B 原型
  demo/            四幕演示、真实只读 receipt 与证据面板
contracts/         ConsentRegistry Solidity 源码与编译产物
deployment/        Monad 测试网部署、核验和取证操作包
docs/              当前状态与证据说明
features/          各组件验收规格
protocol/          SCP 0.1.0、参考实现与一致性测试
submission/        提交文案、视频脚本、评分映射与评委问答
tech-design.md     完整技术设计
```

评委可先运行四幕引导演示，再查看 [`submission/SCORECARD.md`](submission/SCORECARD.md) 和 [`submission/JUDGE_QA.md`](submission/JUDGE_QA.md)。最终提交草案中的方括号链接仍是待真实证据替换的占位符，不得原样提交。

完整的一键复现脚本是 `scripts/reproduce.ps1`（Windows）和 `scripts/reproduce.sh`（POSIX）。静态托管候选与手动 GitHub Pages 流程见 [`docs/HOSTING.md`](docs/HOSTING.md)；工作流不会因普通 push 自动发布。

## 本地运行

前提：Node.js 24+；Python 仅用于启动静态页面。

```bash
npm install
npm test
npm run compile:contract
npm run probe:monad
npm run serve:demo
```

然后打开：

- 四幕合成演示：`http://localhost:4173/apps/demo/index.html`
- Monad 真实只读证据面板：`http://localhost:4173/apps/demo/evidence-panel.html`

`npm run probe:monad` 需要访问 Monad 测试网。其他测试不使用真人材料、不发交易。

### 本地钱包操作台（仅固定虚构材料）

```bash
npm run sprint:wallet
```

在安装浏览器钱包的浏览器中打开输出的 `http://127.0.0.1:端口`。它不会自动连接钱包或发送交易；Owner 与代理签名身份在这个最小演示中使用同一测试账户，Agent B 的 ECDH 私钥仍只在独立进程内。按顺序部署、核验、登记、授权、请求、发布 V2、再次请求、撤销、再次请求，再下载公开证据 JSON。细节见 [`deployment/README.md`](deployment/README.md)。普通静态四幕只是单浏览器教学演示，不是该双进程实链路线。

签名 nonce 只在本机单会话内有效，重启后旧请求拒绝；UNKNOWN 使会话失效，不等于零执行。每个 asset 在本次参考实现中绑定一个精确 scope 的完整内容承诺，没有实现任意多 scope 的 Merkle 证明。授权撤销与两次读取/交付之间仍存在时间窗。

## 部署状态

2026-10-11 已完成 Monad Testnet 部署和固定虚构材料的 `ACTIVE → VERSION_STALE → REVOKED` 路径。合约地址为 [`0xcda4d087900f47427b4956b9b1ee2543ec5575c0`](https://testnet.monadscan.com/address/0xcda4d087900f47427b4956b9b1ee2543ec5575c0)，部署与门禁记录见 [`docs/EVIDENCE.md`](docs/EVIDENCE.md)。浏览器原始导出仍待归档，生产安全、真实模型质量和真人价值均未据此成立。

## 黑客松工作披露

完整边界与逐项清单见 [`docs/BUILD_DISCLOSURE.md`](docs/BUILD_DISCLOSURE.md)；AI 使用披露见 [`docs/AI_USAGE.md`](docs/AI_USAGE.md)。

### 赛前已有

- 未叙山海的产品愿景、用户主权原则与内部治理材料；
- 早期本地原型和关于连续性记忆的探索。

这些内容不是本仓库声称在黑客松期间从零创造的成果。

### 黑客松期间新增

- 独立、版本化的 Shanhai Continuity Protocol 0.1.0；
- 来源优先级、双时间模型、不可变修正关系与一致性向量；
- 浏览器最小范围投影、来源承诺、WebCrypto envelope 与独立 Agent B 解密；
- Monad Consent Registry、只读 Verifier、状态门禁测试与四幕演示；
- 证据面板和可复核的测试网部署操作包。

提交前将以公开 Git 历史为准再次核对开发窗口内的工作比例。

### AI 工具使用

本项目使用了 OpenAI Codex 等 AI 工具辅助研究、规格整理、编码和测试。项目所有者负责产品决策、授权边界、结果复核和最终提交；自动生成内容不被视为未经验证的证据。

## 安全与隐私

- 仓库只使用合成数据。
- 不提交私钥、助记词、API key、Cookie、真实个人材料或生产配置。
- Owner 首次门禁非 `ACTIVE` 不返回 envelope；B 二次门禁失败不解密/组装 context。RPC、解析或链 ID 异常 fail closed；执行回执未知则报 UNKNOWN，不编造零计数。
- 撤销阻止未来的新访问，但不虚假承诺删除第三方此前已合法取得的明文。
- 本仓库是测试网参赛实现，不是生产安全审计结论。

公开发布前运行 `npm run audit:release`，并按 [`docs/PUBLISHING_CHECKLIST.md`](docs/PUBLISHING_CHECKLIST.md) 完成人工复核。安全问题报告方式见 [`SECURITY.md`](SECURITY.md)。

## License

MIT。见 [`LICENSE`](LICENSE)。第三方依赖与署名见 [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md)。
