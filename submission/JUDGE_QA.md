# Judge Q&A

> Sprint editorial update: 2026-10-11. Live deployment, the connected real-chain delivery flow and public submission artifacts are pending until their execution records exist. Answers below distinguish the intended live proof from existing separate local tests.

## 1. Why is this not just a database permission table?

A database controlled by Shanhai requires Agent B to trust Shanhai's latest answer and audit trail. Monad makes the minimum grant fact independently readable across organizational boundaries. The encrypted content remains off-chain; the shared trust fact does not.

## 2. Why not export the entire ChatGPT or journal history?

Whole-history export over-discloses and collapses source quality. SCP projects a specific authorized scope and preserves whether an item was user-confirmed, quoted, traceable, or inferred.

## 3. What happens after revocation?

Future access is denied before envelope delivery. The project does not falsely claim that revocation can claw back plaintext already obtained during a previously valid authorization.

## 4. Can the model decide what to remember or authorize?

No. Models may propose structure, but deterministic code and explicit user state control confirmation, scope, version, grant, revocation, and delivery. Model output has the lowest source authority unless confirmed later.

## 5. What exactly is stored on Monad?

Only minimum authorization facts: identifiers/commitments, current version, grantee, scope hash, expiry and revocation state. No personal statement, conversation, voice, biography, or model context is placed on-chain.

## 6. What makes the result portable?

The protocol object, canonical serialization, provenance commitment, scope rules and conformance vectors are agent-neutral. Agent B verifies the same object and authorization without accessing Owner cookies or private keys.

## 7. How do you prove zero model calls?

The gateway in this submission is simulated, so external model calls are zero on every path. The useful evidence is whether actual envelope delivery, local decryption, context construction and simulated gateway invocation occur. The live target instruments those steps in one connected path and requires zero downstream activity for non-active requests. A number painted onto the browser UI does not prove this, and a read-only receipt alone does not measure it.

## 8. What is live today?

At this editorial checkpoint, the local protocol, encryption reference, separate independent Agent B test, Solidity compilation, RPC reader and synthetic four-act demo exist. A real contract and the same-path live ACTIVE / VERSION_STALE / REVOKED proof remain pending. Each final claim must link to the actual artifact. A running read-only RPC panel alone is not a live end-to-end delivery proof.

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

## 14. Can a judge replay all three chain states on the hosted page?

A → B → C is a recorded transition of one consent. Once revoked, that consent remains revoked. Historical receipts carry their own block anchors; a fresh RPC query reports current state. Synthetic walkthrough buttons can replay the explanation, but cannot reset the real chain. A separate fresh ACTIVE fixture, if actually created, must use a different consent and be labeled accordingly.

## 15. What does the proof say about the recipient's identity?

The envelope is bound to the specified recipient key and the tested grant. The final live runner must show how that key and requested grantee are bound in its trusted request path. A caller-supplied address string is not wallet authentication. We claim only the identity binding actually tested; external authentication, adversarial agents and production delivery policies require further work.

## 16. Why is there no Mera demonstration?

The primary sprint is the connected Monad authorization and context-delivery proof. Mera recovery is not completed or claimed, and its bounty is not selected. This keeps the submitted main path reviewable within the deadline.

## 17. What can the owner revoke after an ACTIVE request?

The owner can stop later delivery through the supplied implementation by changing or revoking its authorization state. The owner cannot retroactively erase plaintext already received, guarantee that an external agent forgets it, or remove immutable chain metadata. The negative proof concerns a new request after the recorded state change.
