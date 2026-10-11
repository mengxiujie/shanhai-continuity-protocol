# Private organizer / mentor milestone update

## English draft

We completed the Monad testnet evidence gate for Shanhai Continuity Protocol in the Trust, Identity & AI Infrastructure track. The verified contract is deployed at `0xcda4d087900f47427b4956b9b1ee2543ec5575c0` on chain 10143. With fixed synthetic material, the recorded sequence produced `ACTIVE_CONTEXT_DELIVERED`, then `VERSION_STALE` after publishing V2, then `REVOKED` after revocation. The stale and revoked requests each show zero new envelope fetch, decryption, context assembly, or controlled-gateway work.

The exact raw browser evidence is archived byte-for-byte with SHA-256 `49bd59c0ff054fbf2ef82ab009b1bccefaf88890240ff5b18b0d0cc8225a9864`. A read-only replay recomputes that hash in the browser and links the underlying Monad transactions. External model behavior remains explicitly `NOT_MEASURED`; the evidence demonstrates the authorization and delivery boundary, not model intelligence or production security.

The most useful mentor feedback would now be: (1) whether the 90-second replay makes the active → stale → revoked transition immediately legible, and (2) which claim or screen should be simplified for judging without weakening the evidence boundary.

## 中文核对稿

我们已经完成 Shanhai Continuity Protocol 的 Monad 测试网证据门，参赛赛道为 Trust, Identity & AI Infrastructure。已核验合约部署在链 10143 的 `0xcda4d087900f47427b4956b9b1ee2543ec5575c0`。在两条固定合成材料下，记录序列依次得到 `ACTIVE_CONTEXT_DELIVERED`、发布 V2 后的 `VERSION_STALE`，以及撤销后的 `REVOKED`。旧版本与撤销请求的新增 envelope 获取、解密、上下文组装和受控 gateway 执行均为 0。

浏览器原始证据已逐字节归档，SHA-256 为 `49bd59c0ff054fbf2ef82ab009b1bccefaf88890240ff5b18b0d0cc8225a9864`。只读回放页会在浏览器中重新计算哈希，并链接对应 Monad 交易。真实外部模型行为仍明确标为 `NOT_MEASURED`；本证据证明的是授权与交付边界，不是模型智能或生产安全。

现在最希望导师反馈：90 秒回放是否能让评委立即看懂 ACTIVE → VERSION_STALE → REVOKED，以及哪些表述或画面可以继续简化而不削弱证据边界。
