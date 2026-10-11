# Build disclosure

> Evidence status: repository disclosure for Metropolis 2026. The public Git history, once pushed, is the final timestamped record.

## Work that existed before the hackathon module

- The Unsaid Shanhai product vision and the idea of personal continuity as a user-owned asset.
- Internal principles for user authorization, correction, withdrawal, deletion, and evidence-gated claims.
- Earlier local prototypes and product research about AI-assisted personal continuity.

These materials are not included wholesale in this repository and are not claimed as newly invented during the event.

## Substantial work implemented for this submission

- Shanhai Continuity Protocol 0.1.0 with versioned schema and conformance vectors.
- Deterministic provenance precedence: user confirmation > user utterance > traceable fact > model inference.
- Bitemporal `validTime` / `recordedAt` fields and immutable supersession links.
- Canonical JSON, scope projection, provenance commitments, and Agent B context construction.
- Browser WebCrypto encrypted envelope and independent-process Agent B reference implementation.
- Monad `ConsentRegistry`, read-only verifier, fail-closed access gate, and four-act demonstration.
- Synthetic evidence suite, live-receipt panel, deployment verifier, and evidence-boundary documentation.

## 2026-10-11 sprint additions

The final-mile sprint adds the connection between the previously separate authorization, encrypted-delivery and independent-recipient components:

- A signed, short-lived, single-use request binds the intended wallet signer to the exact registry, asset, consent, version, scope and Agent B public-key fingerprint. The challenge ledger is process-local; it is not a production distributed nonce service.
- A controlled Owner runtime checks authorization before fetching the encrypted envelope, then an independent Agent B process checks the current authorization again before decryption and source-labeled context construction.
- Request instrumentation records actual envelope, decryption, context and simulated-gateway activity, including zero downstream activity for tested denial paths. External model calls remain zero; the gateway is deterministic simulation.
- A local browser wallet workbench prepares deployment and state-change transactions for user wallet confirmation, checks chain/account identity and verifies returned transaction receipts. It does not hold a private key or replace wallet confirmation.
- Dependency remediation pins ethers to `6.17.0`; the current runtime dependency scan reports zero known findings. This scan is not a contract, cryptographic or production security audit.
- Submission text and video script now distinguish synthetic content, synthetic chain fixtures, block-anchored historical receipts and fresh current-state reads. Mera is excluded from the primary sprint and is not claimed as a completed bounty.

The sprint checkpoint reported 9 conformance vectors, 44 protocol tests (13 runtime + 20 signed-request identity + 11 connected sprint), 5 gate tests and 14 wallet-workbench tests passing. Contract compilation, release audit and hosting build/audit also passed locally. Reproduce the actual behavior with `npm test`, `npm run test:process`, `npm run compile:contract`, `npm run audit:release`, `npm run build:pages` and `npm run audit:hosting`; final execution artifacts and real Git timestamps govern later claims.

The connected-path tests use fixed synthetic material. At the initial implementation checkpoint the user had not yet supplied a dedicated test wallet. On 2026-10-11 the user operated a dedicated test wallet to deploy the registry and complete the real Monad Testnet `ACTIVE → VERSION_STALE → REVOKED` path; the address, transactions, raw browser export and gate observations are recorded in `docs/EVIDENCE.md` and `deployment/`. The authorized repository/static publication and its later owner-requested withdrawal are recorded in `docs/HOSTING.md`. A local 92-second Chinese-narrated / English-subtitled visualization of this archived evidence has been generated; it is not a filmed browser execution. The repository remains temporarily private and Pages is off; founder review, upload, external reproduction and submission remain incomplete.

## Explicitly outside the submission claim

- The full Unsaid Shanhai product, private governance corpus, private prompts, user database, payment flows, or commercial operating system.
- Real-user effectiveness, willingness to pay, retention, medical or psychological benefit.
- Production security, audited cryptography, audited contracts, or regulatory compliance.
- Production or real-person use of the live Monad path; current evidence uses fixed synthetic material only.
- Mera bounty compliance: excluded from this sprint; no PRF ceremony or fresh-profile/second-device recovery is claimed.

## History rule

The local repository is initialized when this publishable candidate is assembled. Earlier work is disclosed here instead of backdating or fabricating commits. Every subsequent commit must use its real creation time and describe the actual change.
