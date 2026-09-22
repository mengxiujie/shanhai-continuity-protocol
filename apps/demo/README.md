# Shanhai browser demo

这是静态浏览器演示，不是生产部署。

由于 ES Module 在 `file://` 下可能被浏览器阻止，请在本目录上启动一个本地静态服务器，然后打开 `/index.html`。例如：

```text
python -m http.server 4173
```

页面会明确显示当前使用 `DemoMonadProvider`；接入真实 Monad 前，不得把演示结果作为链上证据。

## Monad 测试网

- 只读 RPC 探针：`node probe-monad-rpc.mjs`
- 真实 receipt 页面：`live-receipt.html`
- 统一证据面板：`evidence-panel.html`（推荐）
- 测试网 chain ID：`10143`
- 默认公共 RPC：`https://testnet-rpc.monad.xyz`

`live-receipt.html` 需要一个已经部署的 Consent Registry 地址，以及真实的 asset/consent/grantee/scope/version。缺少这些值时必须 fail closed，不能回退到 Demo Provider。

`evidence-panel.html` 额外显示证据等级、区块信息和未测量计数，并可导出只读 receipt JSON；它不会把链读取自动冒充为完整 envelope/模型调用证据。
