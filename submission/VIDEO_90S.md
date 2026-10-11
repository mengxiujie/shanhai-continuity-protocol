# 90-second judge video

> Recording plan updated 2026-10-11 from completed Monad testnet evidence. Target length: 85–95 seconds. Use the immutable evidence replay for stable filming; do not send new transactions during recording.

The single claim to demonstrate is: an Owner-authorized disclosure is usable only while its exact version and grant remain valid. The recorded testnet sequence shows `ACTIVE_CONTEXT_DELIVERED`, then `VERSION_STALE`, then `REVOKED`. The content is fixed synthetic material and the external model boundary remains `NOT_MEASURED`.

## Recording source

Open `apps/demo/evidence-replay.html`. Before narration, verify that the page shows:

- contract `0xcda4d087900f47427b4956b9b1ee2543ec5575c0` on Monad Testnet `10143`;
- raw evidence SHA-256 `49bd59c0ff054fbf2ef82ab009b1bccefaf88890240ff5b18b0d0cc8225a9864` with `MATCH`;
- four MonadScan transaction links;
- three block-bound outcomes and their execution deltas.

| Time | Picture / operation | English voice-over | On-screen proof |
|---:|---|---|---|
| 0–08s | Title and one-sentence problem | “AI agents need context, but access should not survive a correction or revocation.” | title; synthetic-data badge |
| 08–21s | Contract and archived-evidence header | “Shanhai keeps content encrypted off-chain and records the minimum authorization facts on Monad.” | chain 10143; contract; `SHA-256 MATCH` |
| 21–39s | ACTIVE card | “With version one active, the controlled path fetched one envelope, independently checked the chain, decrypted once, and assembled one context.” | block 70039787; four relevant deltas equal 1 |
| 39–58s | VERSION_STALE card | “After version two was published, the same version-one request was denied as stale—zero new envelope, decryption, context, or gateway work.” | block 70041507; all downstream deltas 0 |
| 58–74s | REVOKED card | “After revocation, the same path was denied again, before any downstream work.” | block 70043660; all downstream deltas 0 |
| 74–84s | Transaction links and claim boundary | “Every transition is anchored by a testnet transaction and preserved in the downloadable raw evidence.” | deploy/register/issue/publish/revoke links; evidence hash |
| 84–92s | Closing title | “Shanhai Continuity Protocol: portable AI context whose future use remains under verifiable authority.” | Track 04; `EXTERNAL MODEL: NOT_MEASURED` |

## Recording rules

- Record at 1920×1080 without wallet UI, account details, notifications, personal browser chrome or secrets.
- Use only the recorded-evidence replay. It requests no wallet, sends no transaction and calls no external model.
- Keep `SHA-256 MATCH`, chain ID, contract and exact outcomes visible long enough to read.
- Say “recorded testnet execution”, not “live execution”. The replay is backed by immutable archived JSON but is not itself a new chain run.
- A historical ACTIVE receipt does not mean the consent is active now. The recorded sequence ends in `REVOKED`.
- Do not claim model quality, production security, instant revocation of already obtained plaintext, erasure of chain history, or control over a malicious external agent.
- Publish the final video URL only after logged-out playback works. Retain the source recording and the receipt files used in it.
