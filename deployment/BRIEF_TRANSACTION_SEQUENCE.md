# Client brief handoff — fixed synthetic testnet operation card

Recorded outcome, 2026-10-12: the Founder completed all five state transactions and four request outcomes on Monad Testnet. Two original browser exports are archived separately under `deployment/raw-browser-evidence.brief-part{1,2}.monad-testnet.2026-10-12.json`; run `npm run verify:brief-evidence` to check their hashes, shared IDs, fixture commitments and outcomes. The original procedural instructions below are retained as a reproduction runbook. The preference-case archive from 2026-10-11 remains separate.

## Start once

```bash
npm run sprint:brief
```

Open the printed loopback address in Chrome with MetaMask. The in-app browser preview is for inspection and does not supply the Chrome wallet extension. Keep the server and this tab open until the evidence is downloaded; the grant envelopes, recipient keys and nonce ledgers are session-local.

The contract input defaults to `0xcda4d087900f47427b4956b9b1ee2543ec5575c0`. Read-only verification on 2026-10-12 matched runtime bytecode at block `70278810`, SHA-256 `f968181f3fe204013357563ff6c0e6a6ba23320340974036b32ee97c86f827f4`. The operation card still rechecks code before configuring and preparing transactions. No deployment is needed if that check continues to pass.

Connect the existing test wallet, then click the registry verification button. That initializes independent V1 and V2 recipient sessions; it does not issue either grant. Owner and request signer remain the same wallet in this workbench. The separate recipient keys/processes demonstrate local separation, not adoption by independent organizations.

## One uninterrupted sequence

Final-video preparation: supplied Metropolis rules §9.4 require actual operation, Monad interaction and a video no longer than 3 minutes. Capture the real workbench flow and results for the final edit; the JSON export remains the separate evidence source. Never capture wallet recovery phrases, passwords or private keys. Recordings/replays must be labeled; animated evidence alone should not substitute for operational footage.

| Step | Button | Wallet action | Expected result |
|---|---|---|---|
| 1 | ① 登记虚构材料 v1 | Testnet transaction | New asset registered; no grant |
| 2 | ② 授予 v1 使用资格 | Testnet transaction | V1 consent confirmed |
| 3 | ③ 签署临时请求 → Agent B | Request signature | ACTIVE; Friday 19:00 template announcement; only selected brief received |
| 4 | ④ 发布更正 v2 | Testnet transaction | Current asset becomes V2; no V2 grant is created |
| 5 | ③ again | New request signature | VERSION_STALE; no new delivery/decryption/context; no current announcement |
| 6 | ⑤ 单独批准新版 v2 | Testnet transaction | Separate consent ID, V2 scope and version; old V1 grant is unchanged |
| 7 | ⑥ 用新版授权请求 → Agent B | Request signature | ACTIVE; Saturday 15:00 template announcement from actual decrypted V2 |
| 8 | ⑦ 撤销新版 v2 授权 | Testnet transaction | Revoke the V2 consent, not the old V1 consent |
| 9 | ⑥ again | New request signature | REVOKED; no new delivery/decryption/context; no current announcement |
| 10 | 下载本次公开证据 JSON | Local download | Save `shanhai-brief-testnet-evidence.json` |

This is five state transactions and four request signatures, in addition to connecting the wallet. The page enables operations progressively and displays the next step. All fields are fixed synthetic fixtures; no user text entry or secret is required.

## What to verify in the export

- `scenario.id` is `CLIENT_BRIEF_HANDOFF`; the asset and two consent IDs are new.
- The two successful requests have versions 1 and 2 respectively, with the corresponding content commitment and actual announcement fields.
- Private planning and the unapproved free-admission suggestion are not in `messages`, received fields or announcement. Their exclusion is an explicit scope choice, not proof that a model will never hallucinate.
- The stale request uses V1; the revoked request uses V2. For these later denials each downstream **delta** is zero; cumulative totals may contain the earlier success of that version's session.
- Output has `DETERMINISTIC_TEMPLATE_NOT_AI`, and real model behavior is `NOT_MEASURED`.
- Owner/B receipt blocks and five confirmed state transactions are retained. A read-only code check is not a gate execution.

If a signature is cancelled, the UI clears the previous artifact; retry only that request with a fresh nonce. If a transaction confirmation is unknown, preserve its hash and do not blindly resend. If a B session becomes UNKNOWN, stop and preserve evidence rather than claim zero execution. Revocation affects future access through this implementation; previously obtained plaintext cannot be recalled.
