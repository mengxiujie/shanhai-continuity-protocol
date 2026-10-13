# Shanhai Continuity Protocol

> Versioned, revocable handoffs for client-approved AI context.

**Metropolis 2026 candidate repository · Track: Trust, Identity & AI Infrastructure**

## Judge quick path

**Question:** when a client corrects an approved brief, may the next AI tool still receive the old version?

This repository records one fixed-fictional Monad Testnet run:

```text
V1 approved and delivered (Friday, 19:00)
        -> V2 published
old V1 request -> VERSION_STALE, zero new downstream execution
        -> V2 separately approved and delivered (Saturday, 15:00)
V2 revoked -> REVOKED, zero new downstream execution
```

- [60-second judge guide](JUDGES.md)
- [Public read-only evidence verifier](https://mengxiujie.github.io/shanhai-continuity-proof/)
- [69-second technical demo](https://youtu.be/nTZoqwLfsjo)
- [70-second pitch](https://youtu.be/hig7qjxeCFQ)
- [ConsentRegistry on Monad Testnet](https://testnet.monadscan.com/address/0xcda4d087900f47427b4956b9b1ee2543ec5575c0)
- [Who could adopt it, and why](ADOPTION.md)
- [Developer quickstart and feedback](docs/DEVELOPER_QUICKSTART.md)

Fast local verification (Node.js 24+, from a Git clone or source ZIP, in the directory containing `package.json`; ZIP users skip Git commands):

```bash
npm ci
npm run verify:brief-evidence
npm run verify:brief-live
```

The first verifier checks the exact hashes and internal consistency of the two original browser exports. The second needs public Monad Testnet RPC access and expects five matching successful receipts. Record an HTTP error, timeout or mismatch separately; do not infer its cause or mark it PASS. Transaction receipts prove inclusion and success; the archived project execution counters are the evidence for the off-chain fetch/decrypt/context/gateway deltas. Installation needs the npm registry; once installed, the archive check and local example below can be run without public RPC connectivity.

For a fresh local execution of the handoff boundary, run:

```bash
node examples/brief-handoff.mjs
```

This small example calls the existing runtime with a loopback **mock registry** and generated test identity. It exercises real local encryption, signature checks and separate recipient processes across four outcomes, without a wallet extension or test coins. It does not execute Solidity or contact Monad. See [the developer guide](docs/DEVELOPER_QUICKSTART.md) and [blank feedback form](docs/EXTERNAL_REPRO_FEEDBACK.md).

### Latest local use case: client-approved brief handoff

A fictional client asks another assistant to prepare an event announcement. Only the approved brief is disclosed. When Friday changes to Saturday, the old request is denied; the client must separately authorize V2 before the new brief and updated announcement can be delivered. Revoking V2 denies later requests. The announcement is a deterministic template rendered by the receiving process from verified decrypted fields, not model output.

Run `npm run sprint:brief` and follow [`deployment/BRIEF_TRANSACTION_SEQUENCE.md`](deployment/BRIEF_TRANSACTION_SEQUENCE.md). The Founder-operated new case now has five successful Monad Testnet transactions and four recorded gate outcomes; two original browser exports pass `npm run verify:brief-evidence`. See the [read-only brief evidence replay](apps/demo/brief-evidence.html) and [QA/evidence boundary](docs/BRIEF_QA_2026-10-12.md). The browser was reloaded between exports, so there is no single uninterrupted raw file. The 2026-10-11 testnet record below belongs to a separate preference case.

## In one minute

Shanhai Continuity Protocol (SCP) is a user-controlled continuity reference for AI agents. A wallet-signed request binds an exact scope/version to an ephemeral Agent B key. The Owner reads Monad before releasing that encrypted disclosure; a separately running local B process reads the registry again, decrypts, verifies full content and provenance commitments, and assembles a controlled context. An Owner-side stale/revoked/invalid gate stops before delivery. If state changes between the two checks, B can stop before decryption even though ciphertext has already been delivered. This is process separation and snapshot-based enforcement, not a separate administrative trust domain or instantaneous revocation of past plaintext.

The repository is an independently publishable hackathon module. It is not the complete Unsaid Shanhai commercial product and contains no real user data, production credentials, payment system, private operating documents, or proprietary prompt corpus.

### Full regression and build checks

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

Current evidence boundaries are explicit: the integrated dual-process route passes against a local synthetic JSON-RPC server using the actual RPC decoder and cryptography. The browser-wallet testnet run is also complete: the deployed contract and the recorded `ACTIVE`, `VERSION_STALE`, and `REVOKED` receipts are archived under `deployment/`. No external model is called; model behavior and production security remain unverified.

未叙山海（Shanhai）正在探索一种不同于“平台替用户记住一切”的个人 AI 记忆方式：用户先确认材料，再决定向哪个 Agent 开放哪个范围；正文保持离链加密，Monad 只保存独立验证授权所需的最小事实。

本仓库是 Metropolis 黑客松参赛模块的隔离工程包，不是未叙山海完整商业产品，也不包含真人数据、生产凭据或私有业务材料。当前访问状态见 [`docs/STATUS.md`](docs/STATUS.md)。

## 四幕演示

1. **Owner 授权**：用户确认合成材料，选择最小披露范围，由参考发送端生成加密 envelope。
2. **Agent B 接续**：Owner 先读授权，只有 `ACTIVE` 才释放精确 envelope；独立 B 再自行读链，授权有效才解密，随后核验完整正文与来源承诺，最后构造受控上下文。
3. **版本失效**：Owner 读取到 V2 后，旧 V1 授权得到 `VERSION_STALE`；该次请求的 envelope、解密、context、受控 gateway 增量均为 0。
4. **撤销生效**：Owner 撤销授权后，新请求得到 `REVOKED`；不得返回正文或构造上下文。

## 为什么需要 Monad

如果授权状态只保存在未叙自己的数据库里，Agent B 仍然必须相信未叙的声明。Consent Registry 把最小授权事实放在 Monad 上，使另一个 Agent 可以独立验证：

- 授权对象是否是自己；
- 请求范围是否与授权范围完全一致；
- 请求版本是否仍是当前版本；
- 授权是否已经撤销或过期。

Monad 不保存生活正文、来源记录或模型上下文。链上状态是授权事实层，不是个人资料库。但地址、标识、承诺、版本与时间等元数据仍公开可见；正文离链不等于没有隐私泄露面。单一组织内部也可能更适合使用数据库权限表，链上登记不能强迫任意接收者遵守离链协议。

## 当前可验证能力

下列测试数量来自已有 QA 记录，并非外部开发者验收。最新简报案例详见 [`docs/BRIEF_QA_2026-10-12.md`](docs/BRIEF_QA_2026-10-12.md)；旧偏好案例与视频历史不作为新案例替代证据。

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
| 本地钱包操作台、同源保护、ABI 与回执核验 | 本地 PASS | wallet/API/controller suite 19/19；固定虚构简报的真实浏览器钱包流程另有原始导出 |
| Monad 测试网真实合约部署与三类真实 receipt | **E3 PASS** | `0xcda4d087900f47427b4956b9b1ee2543ec5575c0`；见 `docs/EVIDENCE.md` |
| 最新简报实链证据回放 | PASS；两份原始 JSON SHA-256 MATCH，四次结果及五笔交易 | `apps/demo/brief-evidence.html`；只读回放，外部开发者复现待完成 |
| 技术演示与项目介绍视频 | PASS；分别为 69 秒和 70 秒，主理人已在未登录窗口验证播放 | YouTube 链接见本页 `Judge quick path`；技术演示是事后只读核验，不是钱包现场录屏 |
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

评委请先查看 [`JUDGES.md`](JUDGES.md)，再按需要阅读 [`submission/SCORECARD.md`](submission/SCORECARD.md) 和 [`submission/JUDGE_QA.md`](submission/JUDGE_QA.md)。`submission/` 内保留历史候选稿；当前评审入口以根目录 README 与 `JUDGES.md` 为准。

完整的一键复现脚本是 `scripts/reproduce.ps1`（Windows）和 `scripts/reproduce.sh`（POSIX）。静态托管候选与手动 GitHub Pages 流程见 [`docs/HOSTING.md`](docs/HOSTING.md)；工作流不会因普通 push 自动发布。

## 本地运行

前提：Node.js 24+；Python 仅用于启动静态页面。

```bash
npm ci
npm ci --prefix contracts
npm test
npm run compile:contract
npm run probe:monad
npm run serve:demo
```

然后打开：

- 四幕合成演示：`http://localhost:4173/apps/demo/index.html`
- 最新简报证据回放：`http://localhost:4173/apps/demo/brief-evidence.html`
- Monad 真实只读证据面板：`http://localhost:4173/apps/demo/evidence-panel.html`
- Monad 已记录证据回放：`http://localhost:4173/apps/demo/evidence-replay.html`

`npm run probe:monad` 需要访问 Monad 测试网。其他测试不使用真人材料、不发交易。

### 本地钱包操作台（仅固定虚构材料）

```bash
npm run sprint:wallet
```

在安装浏览器钱包的浏览器中打开输出的 `http://127.0.0.1:端口`。它不会自动连接钱包或发送交易；Owner 与代理签名身份在这个最小演示中使用同一测试账户，Agent B 的 ECDH 私钥仍只在独立进程内。按顺序部署、核验、登记、授权、请求、发布 V2、再次请求、撤销、再次请求，再下载公开证据 JSON。细节见 [`deployment/README.md`](deployment/README.md)。普通静态四幕只是单浏览器教学演示，不是该双进程实链路线。

签名 nonce 只在本机单会话内有效，重启后旧请求拒绝；UNKNOWN 使会话失效，不等于零执行。每个 asset 在本次参考实现中绑定一个精确 scope 的完整内容承诺，没有实现任意多 scope 的 Merkle 证明。授权撤销与两次读取/交付之间仍存在时间窗。

## 部署状态

2026-10-12 已完成最新固定虚构简报案例：V1 `ACTIVE`、旧 V1 `VERSION_STALE`、单独批准的 V2 `ACTIVE`、撤销后的 V2 `REVOKED`。合约地址为 [`0xcda4d087900f47427b4956b9b1ee2543ec5575c0`](https://testnet.monadscan.com/address/0xcda4d087900f47427b4956b9b1ee2543ec5575c0)。两份原始浏览器导出逐字节归档，分别通过 SHA-256 和内部一致性核验；五笔交易已通过公开 Monad RPC 重新读取并匹配状态、区块号和区块哈希。详见 [`docs/BRIEF_QA_2026-10-12.md`](docs/BRIEF_QA_2026-10-12.md)。外部开发者复现仍待完成；生产安全、真实模型质量和真人价值均未据此成立。

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

Git 历史与上述披露用于区分赛前积累和赛中进展，不将整套未叙产品描述为六周内从零开发。

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
