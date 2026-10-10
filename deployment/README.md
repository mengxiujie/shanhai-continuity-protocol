# Monad testnet deployment runbook

本操作包用于把 `ConsentRegistry` 部署到 Monad 测试网并形成可复核证据。它不保存私钥，也不自动代表用户签名。

## 2026-10-11 冲刺准入核查与用户操作卡

本次检查：候选仓库初始 Git 工作区干净、尚无 remote；GitHub CLI 已安装。首次沙箱检查报认证失效，提升权限仅做只读复核后 `gh auth status` 成功，当前 GitHub 登录有效，不需要重复登录。未找到本项目真实 `deployment-record.json`、公开 live config 或三状态 receipt。以下账户/钱包准备由用户在自己的界面完成；只回报完成状态及公开地址，不转递凭据。

| 用户需要完成的一次准备 | 已核实入口与回报 |
|---|---|
| GitHub 仓库发布准备 | 当前 GitHub CLI 已登录；准备使用当前账号的独立公开仓库。候选仓库尚无 remote、没有公开推送，发布前使用实际通过审核的 commit。认证已核实，用户不需要再次登录，也不需要发送验证码、token 或账户安全截图。 |
| 准备测试钱包及测试币 | 当前官方测试网文档：[Network Information - Testnet](https://docs.monad.xyz/developer-essentials/testnet)。Chain ID `10143`、RPC `https://testnet-rpc.monad.xyz` 已从官方页面公开配置重新核实；本轮公开只读 `eth_chainId` 返回 `0x279f`。官方 faucet 为 [faucet.monad.xyz](https://faucet.monad.xyz/)，由用户自行填写公开钱包地址并领取测试 MON。只回报测试钱包公开地址与是否已有测试币。 |
| 打开现有赛事项目，核对提交入口 | 当前官方 [Metropolis 页面](https://monad.xyz/developers/hackathons/metropolis) 指向 [hackathon.monad.xyz](https://hackathon.monad.xyz/)。确认现有项目仍可编辑、Track 04、准确截止、字段要求/长度以及正式地区资格条款；只转递字段名、限制和不含账号隐私的状态。 |

官方页面本轮显示 1 Sep–13 Oct；用户收到的主办方截止更正邮件说明 13 Oct 2026, 11:59 PM Eastern Time，对应北京时间 14 Oct 11:59。最终提交仍核对登录后台的实际截止显示。

本轮新官方 FAQ 说明开源被鼓励但并非强制，与历史门户 AI 摘要不同。我们继续准备独立公开仓库，作为评委复核方案；不把历史 AI 摘要当作最新强制规则。官方当前页面的评审期为 14–27 Oct、公布日为 3 Nov；这些仅作本轮来源记录，不批量改写历史快照。地区限制以应用平台正式规则为准。

签名操作在钱包中逐笔完成。完成上述准备后，按本文件部署、校验及交易序列继续；当前读链成功不表示本项目已有部署或获奖资格已确认。

## 本轮主链取证目标

真实 Monad 读取必须接到实际的受控 envelope 释放和独立 Agent B 解密/上下文路径。单独的 `evidence-panel.html` 默认将交付、解密和模型计数标为 `NOT_MEASURED`；三份链 receipt 不能替代这条贯通证据。下游使用确定性模拟 gateway，外部模型调用为零；必须分开记录 simulated gateway、实际交付、解密与 context 构造次数。

同一 consent 的 A → B → C 三份 receipt 是历史状态；撤销之后的新读取应显示当前 REVOKED。不得通过演示回放静默恢复链授权。Mera 不进入本轮主线，也不申报其未完成 bounty。

## 0. 固定参数

| Item | Value |
|---|---|
| Network | Monad Testnet |
| Chain ID | `10143` |
| Public RPC | `https://testnet-rpc.monad.xyz` |
| Compiler | Solidity `0.8.30` |
| Contract | `contracts/src/ConsentRegistry.sol` |
| Constructor args | none |

部署前先运行：

```bash
npm install
npm test
npm run compile:contract
npm run probe:monad
```

所有命令通过后再进入钱包步骤。

## 1. 钱包与测试币（用户操作）

1. 使用单独的测试钱包，不使用存放真实资产的钱包。
2. 在钱包中添加 Monad Testnet，确认 chain ID 为 `10143`。
3. 从赛事页面链接的官方 faucet 获取测试网 MON。
4. 不向任何聊天、日志、仓库或脚本粘贴私钥、助记词、PIN 或 API key。

## 2. 部署合约（浏览器 IDE 路线）

这一阶段必须由用户在钱包弹窗中确认：

1. 打开可信的 Solidity 浏览器 IDE。
2. 新建 `ConsentRegistry.sol`，内容逐字复制自 `contracts/src/ConsentRegistry.sol`。
3. 编译器选择 `0.8.30`，不开启未经记录的源码改动。
4. 环境选择“Injected Provider”，再次核对 chain ID `10143`。
5. 部署 `ConsentRegistry`，构造参数为空。
6. 等待交易确认，记录合约地址、部署交易哈希和区块号。
7. 把结果填入 `deployment-record.template.json` 的副本；副本命名为 `deployment-record.json`，该文件默认被 `.gitignore` 排除，审核无秘密后再决定是否公开。

任何网络、源码、编译器或账户不一致，都停止部署。

## 3. 只读核验

PowerShell：

```powershell
$env:REGISTRY_ADDRESS='0x真实合约地址'
npm run verify:deployment
```

核验器检查：

- RPC chain ID 精确等于 `10143`；
- 地址上存在合约代码；
- 链上 runtime bytecode 与本仓库编译产物逐字节一致；
- 输出地址、区块号和 SHA-256，绝不读取钱包秘密。

只有核验结果为 `PASS` 才进入初始化交易。

## 4. 生成三种真实门禁状态

严格按 [`TRANSACTION_SEQUENCE.md`](TRANSACTION_SEQUENCE.md) 操作：

1. `registerAsset` + `issueConsent` → 读取 `ACTIVE`；
2. `publishVersion` → 用旧授权读取 `VERSION_STALE`；
3. `revokeConsent` → 读取 `REVOKED`。

每一步都使用合成材料和新生成标识，不写任何真人内容。

## 5. 证据采集

启动静态页面：

```bash
npm run serve:demo
```

打开 `http://localhost:4173/apps/demo/evidence-panel.html`，填入真实参数；每种状态各导出一个 JSON，并保存：

- 钱包/区块浏览器交易链接；
- 合约地址与部署交易；
- 面板 JSON；
- 包含地址、区块号、outcome 的截图或录屏；
- 完成后的 `deployment-record.json`。

参照 [`POST_DEPLOY_CHECKLIST.md`](POST_DEPLOY_CHECKLIST.md) 做最终验收。

## 6. 停止条件

出现以下任一情况立即停止，不以 Demo Provider 替代：

- chain ID 不是 `10143`；
- 编译 bytecode 不匹配；
- 合约地址没有代码；
- RPC 读取失败或 ABI 解码失败；
- 非 `ACTIVE` 请求仍取得 envelope；
- 任何秘密出现在命令、日志、截图或 Git diff 中。

## 7. 冲刺最小操作台（2026-10-11）

推荐直接运行 `npm run sprint:wallet`，在安装钱包的浏览器打开输出的本地地址。此路线上用户不必往 Remix 反复复制参数。每笔部署/登记/授权/版本/撤销交易必须本人点击并在钱包确认，服务器只构造 ABI 数据和核对公开回执。

顺序：连接独立测试钱包 → 部署 → 核验合约 → 登记 v1 → 授权 v1 → 签署临时请求并下载 ACTIVE 结果 → 发布 v2 → 用新 nonce 签请求并下载 VERSION_STALE → 撤销 → 再用新 nonce 签请求并下载 REVOKED。确认未知时保留交易 hash，不盲目重发。合约、源版本、内容承诺、scope、P-256 会话指纹和 nonce 都应一致。

本轮 nonce 账本与加密会话只在进程内；在 ACTIVE 取证前请不要关闭/重启操作台。重启会产生新的 asset/consent 标识，不能把它算作原授权恢复。若进程意外结束，先保存已有公开交易记录，再安排新的合成测试，不复活旧 grant。

Owner 与 Agent B 的签名身份在最小操作台中使用同一测试地址，B 的 ECDH 私钥和 context 位于独立子进程；这是本机工程隔离，不是两个独立组织的采用证据。操作台目前 mock 14/14、贯通合成 RPC 11/11 通过，真实钱包签名与实链结果仍待用户执行。
