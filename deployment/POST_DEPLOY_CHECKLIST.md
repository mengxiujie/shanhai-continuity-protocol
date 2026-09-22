# Post-deployment checklist

## Repository and build

- [ ] Git status 中没有 `.env`、私钥、助记词、token、PIN 或真实个人材料。
- [ ] `npm test` 全部通过。
- [ ] `npm run compile:contract` 通过。
- [ ] 编译器为 solc `0.8.30`。

## Deployment identity

- [ ] Chain ID 是 `10143`。
- [ ] 合约地址已记录。
- [ ] 部署交易哈希与区块号已记录。
- [ ] `npm run verify:deployment` 返回 `PASS`。
- [ ] 链上 runtime bytecode 与仓库 artifact 完全一致。

## State evidence

- [ ] `ACTIVE` JSON 与交易/区块证据齐备。
- [ ] `VERSION_STALE` JSON 与发布 V2 交易证据齐备。
- [ ] `REVOKED` JSON 与撤销交易证据齐备。
- [ ] 非 ACTIVE 的 envelope fetch、local decrypt、model call 在端到端仪表中均为 0。
- [ ] 所有证据只包含合成 ID 与承诺，不含生活正文。

## Submission honesty

- [ ] README 的“赛前已有 / 黑客松新增”与 Git 历史一致。
- [ ] AI 工具使用已披露。
- [ ] 没有把合成测试写成真实链证据。
- [ ] 没有把测试网实现写成生产安全结论。
- [ ] Mera ceremony 未通过时，不申请或宣称 Mera bounty 已完成。
