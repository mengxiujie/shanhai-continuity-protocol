# Changelog

## 0.1.0 — 2026-09-21

- 建立独立的 Shanhai Continuity Protocol。
- 分离材料原始来源与用户审阅状态。
- 固定确定性权威优先级与拒绝规则。
- 加入 valid time / recorded time 双时间模型。
- 加入不可变版本、修正关系和派生 `supersededBy` 规则。
- 建立仅使用合成材料的一致性测试套件。
- 实现规范化序列化、范围投影、来源语义/承诺校验与 Agent B 上下文构造参考内核。
- 增加运行时篡改、越权、拒绝材料和来源标签测试。
- 增加 Owner Web → AES-GCM envelope → 独立 Agent B 进程的本机端到端参考链。
- 增加 ECDH P-256、HKDF-SHA-256、Agent 公钥指纹及 AAD 绑定；拒绝路径模型调用增量为 0。
