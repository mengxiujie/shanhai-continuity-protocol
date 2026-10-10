# Third-party notices

本仓库的直接依赖为：

| Package | Locked version | Purpose | License |
|---|---:|---|---|
| `solc` | 0.8.30 | Compile `ConsentRegistry.sol` | GPL-3.0 |
| `ethers` | 6.17.0 | Ethereum request-signature recovery and exact ABI transaction encoding | MIT |

浏览器与 Node.js 内置 Web Crypto、Fetch 和 Test Runner 不随本仓库再分发。

部署或发布前应以锁文件和 `npm` 包元数据重新生成完整软件物料清单（SBOM）。本说明不是对所有传递依赖的替代。
