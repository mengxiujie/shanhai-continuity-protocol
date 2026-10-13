# Build disclosure

> Evidence status: repository disclosure for Metropolis 2026. Git history records source revisions; archived execution records and their stated checks support behavior claims. A commit alone does not establish successful execution.

## Work that existed before the hackathon module

- The Unsaid Shanhai product vision and the idea of personal continuity as a user-owned asset.
- Internal principles for user authorization, correction, withdrawal, deletion, and evidence-gated claims.
- Earlier local prototypes and product research about AI-assisted personal continuity.

These materials are not included wholesale in this repository and are not claimed as newly invented during the event.

## How governance practice shaped this build

Shanhai's prior governance work distinguishes what a record says, which version is authoritative, and what someone has actually permitted. A retained record is not a standing authorization. That discipline informed this submission; the hackathon contribution is a narrow executable handoff boundary, not the entire governance system.

| Design question from that practice | Implemented boundary in this submission | Inspectable evidence |
|---|---|---|
| Does an earlier approval survive an explicit correction? | A grant is version-bound; publishing V2 makes the old V1 request stale, and V2 needs a separate grant. | [Recorded brief sequence and limits](BRIEF_QA_2026-10-12.md) |
| Does approval of one brief authorize every available note? | The recorded successful requests deliver only the selected brief item; internal planning and the unapproved suggestion stay outside that disclosure. | [Two original exports and their verifier](../scripts/verify-brief-evidence.mjs) |
| Can the next recipient treat possession or a previous success as current permission? | The sender checks before envelope release; a separate recipient process checks again before decryption and context assembly. Both checks remain snapshots. | [Fresh local reference-runtime example](../examples/brief-handoff.mjs), using mock registry state |

We apply the same evidence discipline to the submission: preserve the two original exports, distinguish receipt checks from local execution counters, and distinguish reproduction from application integration or adoption. The [judge guide](../JUDGES.md#three-checks-three-different-conclusions) specifies what each check establishes.

This is design provenance, not proof that the internal governance workflow runs through ConsentRegistry. We do not claim that the private governance corpus is on-chain, that every internal rule has been automated, or that the full Shanhai product is production-ready. That corpus remains outside the submission. The implementation and tests below, rather than the size of the prior documentation, are the contribution to evaluate.

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

The connected-path tests use fixed synthetic material. At the initial implementation checkpoint the user had not yet supplied a dedicated test wallet. On 2026-10-11 the user operated a dedicated test wallet to deploy the registry and complete the real Monad Testnet `ACTIVE → VERSION_STALE → REVOKED` path; the address, transactions, raw browser export and gate observations are recorded in `docs/EVIDENCE.md` and `deployment/`. The authorized repository/static publication and its later owner-requested withdrawal are recorded in `docs/HOSTING.md`. A local 92-second Chinese-narrated / English-subtitled visualization of this archived evidence was generated at that historical checkpoint; it was not a filmed browser execution. The status of later videos, public proof hosting and submission is maintained in [STATUS](STATUS.md).

## Explicitly outside the submission claim

- The full Unsaid Shanhai product, private governance corpus, private prompts, user database, payment flows, or commercial operating system.
- Real-user effectiveness, willingness to pay, retention, medical or psychological benefit.
- Production security, audited cryptography, audited contracts, or regulatory compliance.
- Production or real-person use of the live Monad path; current evidence uses fixed synthetic material only.
- Mera bounty compliance: excluded from this sprint; no PRF ceremony or fresh-profile/second-device recovery is claimed.

## History rule

The local repository is initialized when this publishable candidate is assembled. Earlier work is disclosed here instead of backdating or fabricating commits. Every subsequent commit must use its real creation time and describe the actual change.
