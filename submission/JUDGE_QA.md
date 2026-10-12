# Judge Q&A

> Current evidence: 2026-10-13. The fixed-fictional brief run records `ACTIVE V1 → VERSION_STALE V1 → ACTIVE V2 → REVOKED V2`, with five confirmed Monad Testnet state transactions. See [the judge guide](../JUDGES.md) and [current status](../docs/STATUS.md). The portal is Ready for judging according to the owner's authenticated transcription; external developer reproduction is still pending.

## 1. Why is this not just a database permission table?

A database may be simpler when one organization controls both sides. A shared registry is useful when different tools need the same independently readable grant state rather than trusting the sender platform's latest answer. Monad supplies that record; compliant off-chain software still enforces release. The current run uses two local processes, not two organizations. See [the adoption hypothesis](../ADOPTION.md).

## 2. Why not export the entire ChatGPT or journal history?

Whole-history export over-discloses and collapses source quality. SCP projects a specific authorized scope and preserves whether an item was user-confirmed, quoted, traceable, or inferred.

## 3. What happens after revocation?

In the recorded revoked request, the sender read the revoked state and denied release before a new envelope fetch. If state changes after the sender's check, ciphertext may already reach B; B performs a fresh check before decryption. The check/use race is not eliminated, and revocation cannot claw back plaintext already obtained.

## 4. Can the model decide what to remember or authorize?

No. Models may propose structure, but deterministic code and explicit user state control confirmation, scope, version, grant, revocation, and delivery. Model output has the lowest source authority unless confirmed later.

## 5. What exactly is stored on Monad?

Authorization metadata: identifiers/commitments, owner and grantee addresses, current version, scope hash, expiry and revocation state. No personal statement, conversation, voice, biography, or model context is placed on-chain. Metadata and timing remain public; encryption of off-chain content does not hide those relationships.

## 6. What makes the result portable?

The protocol object, canonical serialization, provenance commitment, scope rules and conformance vectors are agent-neutral. Agent B verifies the same object and authorization without accessing Owner cookies or private keys.

## 7. How do you prove zero model calls?

There is no external model call in this path. The useful measurements are new envelope fetch/receipt, local decryption, context construction and controlled template-gateway calls. Both recorded sender-side denials have zero downstream increments. These are project-instrumented counters, not a cryptographic proof of off-chain non-execution. A recipient-side refusal after a state change can have a nonzero ciphertext delivery count; missing completion is reported as `UNKNOWN`, not invented zeros. A transaction receipt alone does not measure any of those steps.

## 8. What is live today?

The registry is deployed on Monad Testnet. The owner-operated brief run delivered Friday V1, refused it after Saturday V2 was published, delivered V2 after a separate grant, then refused V2 after revocation. Two original browser exports preserve this run across a page reload. The public HTTPS page checks their hashes and re-reads five transaction receipts. It is a live read-only verifier, not a hosted signing service, remote Agent B or live model. New full-path execution requires the local reference runner, testnet funds and owner-confirmed wallet operations.

## 9. Is this already a validated consumer business?

No. This submission proves a technical and governance primitive. It does not prove willingness to pay, retention, or market adoption for the broader Unsaid Shanhai product.

## 10. Why Monad specifically?

The implementation uses Monad as a shared, independently readable authorization record for frequent grant, version and revocation updates. The meaningful integration is that a real Monad read controls envelope delivery in the same request. The contract is EVM-compatible; we do not claim Monad is the only chain capable of this or claim latency/cost numbers we have not measured.

## 11. Does open source remove the commercial moat?

The repository opens the interoperability primitive and demonstration, not the complete product, private corpus, operating system, user network, delivery process or accumulated user-authorized assets. Adoption of the protocol can strengthen interoperability while the product competes on trust, experience and continuity quality.

## 12. What is the largest remaining technical risk?

Production key lifecycle, browser compromise, multi-party delivery, contract/security audit and external agent behavior remain open. The current work is a testnet hackathon implementation, not production authorization.

## 13. Is user-owned or revocable AI memory new?

No. Open memory formats, encrypted stores, Solid-style permissions and agent memory frameworks cover related capabilities. Our narrow submission target is a reproducible combination of source-labeled context, exact version/scope, a real shared authorization check before controlled delivery, and an independent recipient process. Novelty is assessed on the implemented combination and evidence, not on a claim that prior art is absent.

## 14. Can a judge reproduce the four outcomes on the hosted page?

The page shows four archived outcomes involving separate V1 and V2 grants. Its button performs fresh read-only receipt checks, not fresh executions of those outcomes. The archived V1 is stale and V2 is revoked; the page cannot reset chain history. Use [the developer quickstart](../docs/DEVELOPER_QUICKSTART.md) to distinguish archived evidence verification, local synthetic reproduction and an optional new wallet-confirmed testnet run.

## 15. What does the proof say about the recipient's identity?

The request challenge binds the wallet signer, chain, registry, domain, consent, asset, scope/version, nonce and B's ephemeral key fingerprint. The code recovers the signed request's address instead of accepting a caller-supplied address as authentication. The testnet run uses the same test wallet for Owner and requester, with B's key in a separate local process. This demonstrates that implementation boundary, not distinct real-world identities, a separate administrative trust domain or authenticated cross-organization adoption.

## 16. Why is there no Mera demonstration?

The primary sprint is the connected Monad authorization and context-delivery proof. Mera recovery is not completed or claimed, and its bounty is not selected. This keeps the submitted main path reviewable within the deadline.

## 17. What can the owner revoke after an ACTIVE request?

The owner can stop later delivery through the supplied implementation by changing or revoking its authorization state. The owner cannot retroactively erase plaintext already received, guarantee that an external agent forgets it, or remove immutable chain metadata. The negative proof concerns a new request after the recorded state change.
