# Monad testnet deployment runbook

本操作包用于把 `ConsentRegistry` 部署到 Monad 测试网并形成可复核证据。它不保存私钥，也不自动代表用户签名。

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
