# 90-second judge video

> Sprint script updated 2026-10-11. Target length: 85–95 seconds. This is a recording plan, not evidence that the live flow or video is complete.

The single claim to demonstrate is: a second process receives an encrypted context package only after checking the current Monad authorization, and stale or revoked grants stop that same delivery path. A simulated model gateway makes the downstream boundary observable; this video does not demonstrate an external model's intelligence.

## Recording gate

Record the live script below only after a verified testnet deployment and the connected Owner → Monad gate → independent Agent B flow have produced real artifacts. A read-only receipt panel by itself does not prove envelope delivery, decryption, or context construction. The original four-act browser demo remains a labeled synthetic walkthrough.

| Time | Picture / operation | English voice-over | On-screen proof |
|---:|---|---|---|
| 0–07s | One synthetic statement and its later correction | “I corrected my AI context. Can another agent still use the old statement?” | `SYNTHETIC CONTENT`; V1 and correction |
| 07–18s | Owner selects one item and the intended Agent B | “Shanhai binds a specific context version and scope to the agent the owner chose.” | item scope, version, grantee; no whole-profile export |
| 18–29s | Encrypted envelope metadata beside the real registry | “The context stays encrypted off-chain. Monad records the authorization facts that another process can check.” | commitment, ciphertext size, chain ID, contract address |
| 29–45s | Run independent B against ACTIVE state | “Agent B checks the real chain before delivery, then decrypts locally and validates the source before constructing context.” | real block-bound receipt; actual delivery, decryption and context counters; distinct process IDs |
| 45–61s | Publish V2; run the same old request again | “After the owner publishes V2, the V1 request is stale. This request receives no envelope and constructs no context.” | V2 transaction; `VERSION_STALE`; request counters all zero |
| 61–74s | Revoke the same grant; repeat the request | “After revocation, the same delivery path stops again. No new content reaches the agent.” | revoke transaction; `REVOKED`; request counters all zero |
| 74–85s | Three saved receipts, then current-state read | “These receipts show the recorded transition. A fresh read shows the current revoked state. The model gateway here is simulated.” | each historical block hash; live current block; `SIMULATED GATEWAY / EXTERNAL MODEL CALLS: 0` |
| 85–92s | Repository, demo and protocol title | “Shanhai Continuity Protocol. Portable context with verifiable authority over future delivery.” | verified public repository and demo URLs; Track 04 |

## Recording rules

- Use only synthetic content. Record at 1920×1080 without personal browser chrome, account details, notifications or wallet secrets.
- Show actual runner counters, not numbers assigned by UI presentation. Label simulated gateway invocations separately from external model calls.
- Keep the contract, block anchor and evidence type visible. If a branch is only synthetic, retain its synthetic badge and do not narrate it as a live transaction.
- A historical ACTIVE receipt does not mean the consent is ACTIVE now. Following A → B → C, the same consent remains REVOKED; replay controls must not imply that its chain state resets.
- Revocation prevents future delivery through this implementation. It cannot retrieve plaintext an agent previously obtained lawfully, control a malicious external agent, or erase an immutable chain record.
- If the real gate and independent-process path are not connected, record a clearly labeled prototype and narrow the submission claim. Do not splice a real receipt panel beside synthetic counters as apparent end-to-end proof.
- Mera is outside the primary sprint and is not claimed or selected as a bounty.
- Publish the final video URL only after logged-out playback works. Retain the source recording and the receipt files used in it.
