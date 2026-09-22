# Shanhai Continuity Protocol

协议版本：`0.1.0`  
状态：`DRAFT / SYNTHETIC CONFORMANCE READY`

## 1. 协议目的

Shanhai Continuity Protocol（SCP）定义一种由本人确认、可追溯、可版本化并可按范围授权给其他 Agent 的个人连续性材料。协议不定义通用聊天记忆算法，也不允许模型推断冒充用户事实。

本目录是公开协议边界；未叙的报告方法、D4、内容运营和商业交付不属于协议。

## 2. 规范性语言

`MUST`、`MUST NOT`、`SHOULD`、`MAY` 按 RFC 2119 解释。实现必须拒绝未知字段、未知枚举、非规范时间和不支持的协议版本，禁止“尽力猜测”后继续授权。

## 3. 版本策略

- `MAJOR`：破坏 wire format、commitment 或权利语义；旧实现必须拒绝。
- `MINOR`：增加可选能力；只有声明支持该 minor 的实现才能接受新增字段。
- `PATCH`：说明、测试向量或不改变 wire semantics 的修订。
- 每份 package version 必须带精确 `protocolVersion`；不得只写 `v1`。

## 4. 来源与确认优先级

协议把“内容从哪里来”和“用户是否认领”分开，防止确认动作抹去原始来源：

- `originKind`：`USER_UTTERANCE`、`TRACEABLE_FACT`、`MODEL_INFERENCE`；
- `reviewStatus`：`UNREVIEWED`、`USER_CONFIRMED`、`USER_REJECTED`；
- `authorityClass` / `authorityRank`：由前两项确定性派生，不能由模型任意填写。

| 条件 | authorityClass | rank |
|---|---|---:|
| `reviewStatus=USER_CONFIRMED` | `USER_CONFIRMED` | 400 |
| 未确认的 `USER_UTTERANCE` | `USER_UTTERANCE` | 300 |
| 未确认的 `TRACEABLE_FACT` | `TRACEABLE_FACT` | 200 |
| 未确认的 `MODEL_INFERENCE` | `MODEL_INFERENCE` | 100 |

规范：

1. 低优先级条目 MUST NOT 以 `CORRECTS`、`REPLACES` 或 `REFINES` 覆盖更高优先级条目。
2. 模型推断 MUST 标注模型、生成时间和依据条目；即使被用户确认，`originKind` 仍为 `MODEL_INFERENCE`。
3. 用户确认 MUST 记录确认事件和所依据的来源；确认表示“用户选择它作为当前权威表达”，不等于证明它是客观事实。
4. 接续发生冲突时，展示高优先级来源；低优先级内容可作为不同解释保留，但必须显示其等级。
5. `USER_REJECTED` MUST NOT 进入 disclosure、导出或模型上下文。
6. 所有对 Agent 的 disclosure MUST 携带原始来源、审阅状态、权威等级和必要溯源标识；接收方不得丢弃这些标记。

## 5. 双时间模型

每条材料同时记录：

- `validTime`：材料在用户人生或事件世界中何时成立；
- `recordedAt`：山海何时把该版本写入协议记录。

`validTime.from` 可以早于、等于或晚于 `recordedAt`（例如回忆或未来计划）；区间采用 `[from,to)`，`to` 若存在必须严格晚于 `from`。所有时间使用 Unix UTC 秒整数。

修正不得改写旧条目。新版本通过：

- `supersedesVersionId` 指向上一不可变版本；
- 条目 `supersedes[]` 指向被修正的旧条目；
- `relation` 使用 `CORRECTS`、`REFINES` 或 `REPLACES`。

`supersededBy` 是由版本集合反向计算的索引，不写回旧版本正文，从而保持旧版本 commitment 不变。

## 6. 最小 wire object

结构由 `schema/continuity-package-version.schema.json` 定义。正文对象只存在于 Owner/Agent B 已授权的本地明文边界；服务端只保存其 AES-GCM 密文和 commitment。

协议对象的核心字段：

```text
protocol / protocolVersion / dataClass
packageId / versionId / version
supersedesVersionId
recordedAt
items[]:
  itemId / statement
  source.originKind / source.reviewStatus
  source.authorityClass / source.authorityRank
  source.sourceId / capturedAt / supportingSourceIds
  source.confirmation / source.inference
  validTime.from / validTime.to / precision
  recordedAt
  supersedes[]
```

## 7. 一致性套件

运行：

```text
node test/conformance.mjs
```

完整运行时测试：

```text
npm test
```

独立进程边界测试（本机 loopback）：

```text
npm run test:process
```

实现必须至少通过：

- 合法 V1；
- 用户确认模型推断但保留其原始来源；
- 低优先级覆盖高优先级时拒绝；
- 无确认事件的 `USER_CONFIRMED` 拒绝；
- 无模型依据的 `MODEL_INFERENCE` 拒绝；
- 双时间区间倒置拒绝；
- 跨包历史、非连续版本、同版/未来修正、推断依据缺失和修正循环拒绝；
- 未来计划的 `validTime` 晚于 `recordedAt` 时仍可合法表达。

测试向量均为合成材料，不包含真人数据。

## 7A. 参考运行时

`src/` 提供零外部依赖的参考实现：

- `canonical-json.mjs`：拒绝非有限数字、`undefined`、稀疏数组、循环和自定义 `toJSON`，递归排序对象键；
- `provenance.mjs`：生成规范来源清单、计算 `sha256:<hex>` 承诺并同时验证语义与承诺；
- `projection.mjs`：按明确 item allowlist 生成最小 disclosure，拒绝未授权、重复或 `USER_REJECTED` 条目；
- `context-builder.mjs`：Agent B 在模型调用前校验 scope 与来源承诺，并显式标注来源、确认、双时间和修正关系。
- `reference/owner-web/envelope.mjs`：执行最小投影、真实 AES-256-GCM 内容加密及 P-256 ECDH/HKDF 密钥包装；
- `reference/agent-b/`：在独立进程持有不可导出的临时私钥，本地解包、解密、复检并在最后一步才调用模型网关。

该实现是协议参考内核；包含本机 HTTP 跨进程演练，但不包含公网、数据库、真实模型、钱包或链上交易。

## 8. 与访问协议的关系

SCP 内容版本与授权状态相互独立：

- package version 描述“内容是什么、来源为何、何时成立”；
- Monad Consent Registry 描述“谁、对哪个版本、在什么范围、当前能否调用”；
- disclosure 是 package version 的最小范围投影，不能删除来源等级、双时间和修正关系；
- `VERSION_STALE` 与 `REVOKED` 在返回密文 envelope 之前判定。

## 9. 当前边界

`0.1.0` 不定义完整知识图谱、自动召回、模型训练、DID、ZK、支付或真人生产数据。它只冻结黑客松 vertical slice 所需的可移植材料语义。
