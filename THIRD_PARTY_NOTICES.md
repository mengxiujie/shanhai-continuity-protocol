# Third-party notices

本仓库的直接依赖与本次修复涉及的编译工具链组件为：

| Package | Locked version | Purpose | License |
|---|---:|---|---|
| npm `solc` / solc-js wrapper | 0.8.30 | JavaScript interface used to compile `ConsentRegistry.sol` | MIT |
| Solidity compiler bundled as `soljson.js` | 0.8.30 | Solidity compiler implementation used by the wrapper | GPL-3.0 |
| `ethers` | 6.17.0 | Ethereum request-signature recovery and exact ABI transaction encoding | MIT |
| `tmp` (transitive development dependency) | 0.2.7 | Temporary-file helper in the solc toolchain; pinned through an npm override | MIT |

npm `solc` 的包元数据和包内 `LICENSE` 标注 MIT，适用于 solc-js 包装器；其中包含的编译器组件遵循 Solidity 的许可证，不能将包装器许可当作编译器的重新许可。上游来源：[solc-js](https://github.com/ethereum/solc-js)、[Solidity 0.8.30 license](https://github.com/ethereum/solidity/blob/v0.8.30/LICENSE.txt)。本仓库自身源码的许可见根目录 `LICENSE`。

`contracts/package.json` 将编译器固定为 `solc` 0.8.30，并仅覆盖其 `tmp` 依赖至 0.2.7，以处理已知临时文件路径风险。锁文件记录实际安装版本；这项覆盖不更新编译器版本。

浏览器与 Node.js 内置 Web Crypto、Fetch 和 Test Runner 不随本仓库再分发。

部署或发布前应以锁文件和 `npm` 包元数据重新生成完整软件物料清单（SBOM）。本说明不是对所有传递依赖的替代。
